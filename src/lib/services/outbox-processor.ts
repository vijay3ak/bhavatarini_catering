import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getEmailProvider } from "@/lib/email";
import type { EmailProvider } from "@/lib/email/types";
import { renderAdminEnquiryAlert } from "@/lib/email/templates/admin-enquiry-alert";
import { renderCustomerConfirmation } from "@/lib/email/templates/customer-enquiry-confirmation";
import type { Database } from "@/types/database.types";

type OutboxRow = Database["public"]["Tables"]["notification_outbox"]["Row"];

export interface ProcessOutboxOptions {
  batchSize?: number;
  emailProvider?: EmailProvider;
  targetOutboxIds?: string[];
  overrideRecipient?: string;
}

const APPROVED_TEST_RECIPIENT = "vijayaraja.ak@gmail.com";

// Server instance initialization timestamp used as an immutable baseline boundary for non-production cron
const SERVER_INIT_TIME_ISO = new Date().toISOString();

export interface OutboxItemResult {
  id: string;
  templateName: string;
  recipient: string;
  status: "sent" | "retry_scheduled" | "failed" | "skipped";
  error?: string;
  messageId?: string;
}

export interface ProcessOutboxResult {
  totalFound: number;
  totalClaimed: number;
  sentCount: number;
  failedCount: number;
  retryCount: number;
  skippedCount: number;
  details: OutboxItemResult[];
}

/**
 * Resolves the administrator notification recipient email address.
 * Priority:
 * 1. ADMIN_NOTIFICATION_EMAIL server environment variable
 * 2. GMAIL_USER server environment variable
 * 3. official_email from business_settings singleton table
 */
async function resolveAdminEmail(supabase: ReturnType<typeof createServiceRoleClient>): Promise<string | null> {
  if (process.env.ADMIN_NOTIFICATION_EMAIL && process.env.ADMIN_NOTIFICATION_EMAIL.trim()) {
    return process.env.ADMIN_NOTIFICATION_EMAIL.trim();
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_USER.trim()) {
    return process.env.GMAIL_USER.trim();
  }

  try {
    const { data: settings } = await (supabase.from("business_settings") as any)
      .select("official_email")
      .limit(1)
      .maybeSingle();

    if (settings?.official_email && settings.official_email.trim()) {
      return settings.official_email.trim();
    }
  } catch (err) {
    console.error("[OutboxProcessor] Failed to read business_settings for fallback admin email:", err);
  }

  return null;
}

/**
 * Validates a basic email address string.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Masks an email address to protect PII in execution responses and logs.
 */
function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***";
  const [local, domain] = email.split("@");
  const visible = Math.min(2, Math.floor(local.length / 2));
  return `${local.slice(0, visible)}***@${domain}`;
}

/**
 * Calculates exponential backoff in minutes: 2^(retry_count) capped at 60 minutes.
 * Retry 1: 2 min
 * Retry 2: 4 min
 * Retry 3: 8 min
 * Retry 4: 16 min
 * Retry 5: 32 min
 */
function calculateNextRetry(retryCount: number): string {
  const backoffMinutes = Math.min(Math.pow(2, Math.max(1, retryCount)), 60);
  return new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
}

/**
 * Atomic Outbox Processor
 *
 * Implements:
 * 1. Atomic job claiming via Compare-And-Swap (CAS) update to prevent concurrent duplicate dispatch.
 * 2. Reclaims stale 'processing' jobs older than 10 minutes (crash recovery).
 * 3. Renders provider-independent templates with HTML escaping.
 * 4. Bounded exponential backoff retries (max 5 retries).
 * 5. Permanent error capture and failure status logging.
 */
export async function processNotificationOutbox(
  options: ProcessOutboxOptions = {}
): Promise<ProcessOutboxResult> {
  const batchSize = Math.max(1, Math.min(options.batchSize || 10, 50));
  const emailProvider = options.emailProvider || getEmailProvider();
  const supabase = createServiceRoleClient();

  const nowIso = new Date().toISOString();
  // Crash recovery: Any job left in 'processing' status for > 10 minutes is considered orphaned
  const staleProcessingThresholdIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // Security validation: overrideRecipient is permitted ONLY when explicit targeted IDs are supplied
  if (options.overrideRecipient !== undefined) {
    if (!options.targetOutboxIds || options.targetOutboxIds.length === 0) {
      throw new Error(
        "[OutboxProcessor] Recipient override is only permitted when explicit targeted IDs are supplied."
      );
    }
    if (options.overrideRecipient.trim().toLowerCase() !== APPROVED_TEST_RECIPIENT) {
      throw new Error(
        "[OutboxProcessor] Recipient override is restricted to authorized canary address only."
      );
    }
  }

  const result: ProcessOutboxResult = {
    totalFound: 0,
    totalClaimed: 0,
    sentCount: 0,
    failedCount: 0,
    retryCount: 0,
    skippedCount: 0,
    details: [],
  };

  let candidates: OutboxRow[] = [];

  // 1. Fetch eligible candidate jobs
  if (options.targetOutboxIds !== undefined) {
    // When targetOutboxIds is supplied, NEVER fall back to global batch processing
    if (options.targetOutboxIds.length === 0) {
      return result;
    }

    const { data: targetData, error: targetFetchError } = await (supabase.from("notification_outbox") as any)
      .select("*")
      .in("id", options.targetOutboxIds);

    if (targetFetchError) {
      console.error("[OutboxProcessor] Error fetching targeted notifications:", targetFetchError);
      throw new Error(`Failed to query notification outbox: ${targetFetchError.message}`);
    }

    candidates = (targetData as OutboxRow[]) || [];

    // If targeted IDs were provided, validate templates and canary enquiry ownership
    if (candidates.length > 0) {
      const allowedTemplates = ["admin_new_enquiry", "customer_confirmation"];
      for (const c of candidates) {
        if (!allowedTemplates.includes(c.template_name)) {
          throw new Error(
            `[OutboxProcessor] Targeted job ${c.id} has unexpected template '${c.template_name}'. Allowed: ${allowedTemplates.join(", ")}`
          );
        }
      }

      // Verify that all targeted jobs belong to the same canary enquiry
      const enquiryIds = Array.from(new Set(candidates.map((c) => c.enquiry_id)));
      if (enquiryIds.length !== 1) {
        throw new Error(
          `[OutboxProcessor] Targeted jobs must belong to exactly one enquiry (found ${enquiryIds.length}).`
        );
      }

      const { data: enquiry, error: enquiryError } = await (supabase.from("enquiries") as any)
        .select("id, name, email, details")
        .eq("id", enquiryIds[0])
        .maybeSingle();

      if (enquiryError || !enquiry) {
        throw new Error(
          `[OutboxProcessor] Failed to find associated enquiry for targeted jobs: ${enquiryError?.message || "Not found"}`
        );
      }

      // When overrideRecipient is specified, verify that the enquiry is an authorized canary enquiry
      if (options.overrideRecipient !== undefined) {
        const isCanary =
          (Boolean(enquiry.name?.toUpperCase().includes("CANARY")) ||
           Boolean(enquiry.details?.toUpperCase().includes("V1_EMAIL_CANARY"))) &&
          enquiry.email?.toLowerCase() === APPROVED_TEST_RECIPIENT;

        if (!isCanary) {
          throw new Error(
            `[OutboxProcessor] Targeted enquiry ${enquiry.id} is not identified as an authorized canary enquiry when overrideRecipient is used.`
          );
        }
      }
    }
  } else {
    // Background / scheduled batch processor behavior
    const isProduction = process.env.CONTEXT === "production";

    // Explicit environment-specific eligibility boundary:
    // 1. Production: 2-hour rolling window allows bounded retries while ignoring stale historical backlog.
    // 2. Non-Production: Requires explicit ALLOW_NON_PRODUCTION_CRON="true" and strictly bounds eligibility
    //    to jobs created after the current deployment/session start (or explicit NON_PROD_CRON_SINCE timestamp).
    //    This guarantees enabling non-production cron cannot process unrelated pre-existing DEV jobs.
    let minEligibleCreatedAtIso: string;

    if (isProduction) {
      const maxJobAgeMs = 2 * 60 * 60 * 1000; // 2 hours in production
      minEligibleCreatedAtIso = new Date(Date.now() - maxJobAgeMs).toISOString();
    } else {
      const allowNonProd = process.env.ALLOW_NON_PRODUCTION_CRON === "true";
      if (!allowNonProd) {
        console.log("[OutboxProcessor] Scheduled polling skipped: running in non-production context without ALLOW_NON_PRODUCTION_CRON=true.");
        return result;
      }
      minEligibleCreatedAtIso =
        process.env.NON_PROD_CRON_SINCE?.trim() || SERVER_INIT_TIME_ISO;
    }

    const { data, error: fetchError } = await (supabase.from("notification_outbox") as any)
      .select("*")
      .gte("created_at", minEligibleCreatedAtIso)
      .or(`and(status.eq.pending,next_retry_at.lte.${nowIso}),and(status.eq.processing,next_retry_at.lte.${staleProcessingThresholdIso})`)
      .order("created_at", { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error("[OutboxProcessor] Error fetching candidate notifications:", fetchError);
      throw new Error(`Failed to query notification outbox: ${fetchError.message}`);
    }

    candidates = (data as OutboxRow[]) || [];
  }

  result.totalFound = candidates.length;

  if (candidates.length === 0) {
    return result;
  }

  // Pre-resolve admin recipient email once per batch
  let adminRecipientEmail: string | null = null;

  for (const candidate of candidates as OutboxRow[]) {
    // 2. Atomic Claim: Compare-And-Swap (CAS) update
    // Only updates if the record is still in its observed status
    const lockExpiryIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { data: claimedRow, error: claimError } = await (supabase.from("notification_outbox") as any)
      .update({
        status: "processing",
        next_retry_at: lockExpiryIso, // Temporary lock marker
      })
      .eq("id", candidate.id)
      .eq("status", candidate.status)
      .select("*")
      .maybeSingle();

    if (claimError || !claimedRow) {
      // Another concurrent worker claimed or modified this row; skip cleanly
      result.skippedCount++;
      continue;
    }

    result.totalClaimed++;
    const job = claimedRow as OutboxRow;

    try {
      // 3. Channel verification
      if (job.channel !== "email") {
        // Non-email channels (e.g. WhatsApp/SMS) not active in V1
        await (supabase.from("notification_outbox") as any)
          .update({
            status: "failed",
            last_error: `Channel '${job.channel}' is not active for automated dispatch in V1.`,
          })
          .eq("id", job.id);

        result.failedCount++;
        result.details.push({
          id: job.id,
          templateName: job.template_name,
          recipient: job.recipient,
          status: "failed",
          error: `Channel '${job.channel}' not supported`,
        });
        continue;
      }

      // 4. Resolve recipient
      let destinationEmail: string | null = null;
      if (options.overrideRecipient) {
        destinationEmail = options.overrideRecipient.trim().toLowerCase();
      } else if (job.recipient === "admin_notification_recipient") {
        if (!adminRecipientEmail) {
          adminRecipientEmail = await resolveAdminEmail(supabase);
        }
        destinationEmail = adminRecipientEmail;
      } else {
        destinationEmail = job.recipient?.trim() || null;
      }

      if (!destinationEmail || !isValidEmail(destinationEmail)) {
        const errorMsg = !destinationEmail
          ? "No recipient email address could be resolved."
          : `Invalid recipient email address format: '${destinationEmail}'.`;

        // Missing admin email or malformed email is a permanent failure
        await (supabase.from("notification_outbox") as any)
          .update({
            status: "failed",
            last_error: errorMsg,
          })
          .eq("id", job.id);

        result.failedCount++;
        result.details.push({
          id: job.id,
          templateName: job.template_name,
          recipient: job.recipient,
          status: "failed",
          error: errorMsg,
        });
        continue;
      }

      // 5. Render Template
      let rendered: { subject: string; html: string; text: string } | null = null;
      const payload = (job.payload as Record<string, unknown>) || {};

      switch (job.template_name) {
        case "admin_new_enquiry":
          rendered = renderAdminEnquiryAlert(payload as any);
          break;
        case "customer_confirmation":
          rendered = renderCustomerConfirmation(payload as any);
          break;
        default:
          throw new Error(`Unsupported notification template: '${job.template_name}'.`);
      }

      // 6. Dispatch Email via Provider with predictable Message-ID
      // Note on Delivery Guarantees:
      // Standard SMTP provides at-least-once delivery semantics. A deterministic Message-ID
      // provides RFC 5322 tracking and auditability, but does NOT guarantee duplicate suppression
      // across distinct SMTP connections. If an abrupt crash or database timeout occurs after
      // SMTP acceptance but before the status update below, the job may be reclaimed after
      // lease expiry, presenting an at-least-once duplicate delivery risk.
      const deterministicMessageId = `<outbox-${job.id}@bhavatarini.dev>`;

      const sendResult = await emailProvider.sendEmail({
        to: destinationEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        messageId: deterministicMessageId,
      });

      if (sendResult.success) {
        // Success: update outbox record to 'sent'
        const { error: markSentError } = await (supabase.from("notification_outbox") as any)
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("id", job.id);

        if (markSentError) {
          console.error(
            `[OutboxProcessor] AT-LEAST-ONCE RISK: Job ${job.id} was accepted by email transport, but updating status to 'sent' failed:`,
            markSentError
          );
        }

        result.sentCount++;
        result.details.push({
          id: job.id,
          templateName: job.template_name,
          recipient: maskEmail(destinationEmail),
          status: "sent",
          messageId: sendResult.messageId,
        });
      } else {
        // Delivery failed: check if permanent failure (invalid recipient, auth error) or temporary
        const isPermanent = Boolean(sendResult.isPermanentFailure);
        const newRetryCount = (job.retry_count || 0) + 1;
        const maxRetries = job.max_retries || 5;
        const isFinalFailure = isPermanent || newRetryCount >= maxRetries;
        const nextRetryIso = calculateNextRetry(newRetryCount);
        const errorDesc = sendResult.error || "Email delivery failed via provider.";

        await (supabase.from("notification_outbox") as any)
          .update({
            status: isFinalFailure ? "failed" : "pending",
            retry_count: newRetryCount,
            last_error: errorDesc,
            next_retry_at: isFinalFailure ? job.next_retry_at : nextRetryIso,
          })
          .eq("id", job.id);

        if (isFinalFailure) {
          result.failedCount++;
          result.details.push({
            id: job.id,
            templateName: job.template_name,
            recipient: maskEmail(destinationEmail),
            status: "failed",
            error: isPermanent ? errorDesc : `Max retries (${maxRetries}) exceeded. Last error: ${errorDesc}`,
          });
        } else {
          result.retryCount++;
          result.details.push({
            id: job.id,
            templateName: job.template_name,
            recipient: maskEmail(destinationEmail),
            status: "retry_scheduled",
            error: errorDesc,
          });
        }
      }
    } catch (jobErr: unknown) {
      // Unhandled job execution error
      const errorMsg = jobErr instanceof Error ? jobErr.message : "Unexpected job execution error";
      console.error(`[OutboxProcessor] Job ${job.id} execution failed:`, errorMsg);

      const newRetryCount = (job.retry_count || 0) + 1;
      const maxRetries = job.max_retries || 5;
      const isPermanentlyFailed = newRetryCount >= maxRetries;

      await (supabase.from("notification_outbox") as any)
        .update({
          status: isPermanentlyFailed ? "failed" : "pending",
          retry_count: newRetryCount,
          last_error: errorMsg,
          next_retry_at: calculateNextRetry(newRetryCount),
        })
        .eq("id", job.id);

      if (isPermanentlyFailed) {
        result.failedCount++;
        result.details.push({
          id: job.id,
          templateName: job.template_name,
          recipient: job.recipient,
          status: "failed",
          error: errorMsg,
        });
      } else {
        result.retryCount++;
        result.details.push({
          id: job.id,
          templateName: job.template_name,
          recipient: job.recipient,
          status: "retry_scheduled",
          error: errorMsg,
        });
      }
    }
  }

  return result;
}
