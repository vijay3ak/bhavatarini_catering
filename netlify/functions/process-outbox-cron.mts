/**
 * Bhavatarini Catering Service — Outbox Notification Processor Scheduled Function
 *
 * File: netlify/functions/process-outbox-cron.mts
 * Schedule: Every 5 minutes (cron: "*/5 * * * *")
 * Runtime: Netlify Functions v2 (Node.js 20)
 *
 * CRITICAL EMAIL & ENVIRONMENT SAFETY:
 * 1. Strict Context Guard: Executes ONLY in the 'production' deployment context.
 *    Short-circuits immediately in local development, branch deploys, and deploy previews.
 * 2. Secure Token Auth: Uses server-side INTERNAL_API_SECRET to authenticate against
 *    POST /api/internal/process-outbox via timing-safe verification.
 * 3. Privacy & Sanitization: Never logs email addresses, recipient names, or secret tokens.
 * 4. Timeout Protection: Uses AbortSignal.timeout(25000) to safely complete before Netlify's
 *    scheduled function invocation timeout.
 * 5. Atomic Claim Guarantee: Relies on Supabase row-level atomic claim and lease mechanisms
 *    in public.notification_outbox to prevent duplicate sending.
 */

export interface NetlifyFunctionConfig {
  schedule?: string;
  path?: string;
}

export default async function handler(request: Request) {
  const context = process.env.CONTEXT || "development";

  // Guard 1: Run exclusively in the production deployment context
  if (context !== "production") {
    console.log(
      `[OutboxCron] Skipping execution: current context is '${context}'. Scheduled outbox processor executes in 'production' context only.`
    );
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: "Non-production deployment context",
        context,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Guard 2: Verify internal secret is present in environment
  const internalSecret = process.env.INTERNAL_API_SECRET?.trim();
  if (!internalSecret) {
    console.error(
      "[OutboxCron] Configuration error: INTERNAL_API_SECRET is not configured on this server."
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_API_SECRET is unconfigured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Guard 3: Resolve deployed site base URL
  const rawSiteUrl =
    process.env.URL?.trim() ||
    process.env.DEPLOY_PRIME_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawSiteUrl || !rawSiteUrl.startsWith("https://")) {
    console.error(
      "[OutboxCron] Configuration error: A valid HTTPS site URL could not be resolved from environment (URL, DEPLOY_PRIME_URL, or NEXT_PUBLIC_SITE_URL)."
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid or non-HTTPS site URL configuration",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const endpointUrl = `${rawSiteUrl.replace(/\/+$/, "")}/api/internal/process-outbox`;

  try {
    const startTime = Date.now();

    // Enforce 25-second fetch timeout (safely within Netlify's 26s/30s limits)
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalSecret}`,
        "x-internal-secret": internalSecret,
        "User-Agent": "Netlify-Scheduled-Outbox-Worker/1.0",
      },
      body: JSON.stringify({ batchSize: 10 }),
      signal: AbortSignal.timeout(25000),
    });

    const elapsedMs = Date.now() - startTime;
    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      data?: {
        processedCount?: number;
        sentCount?: number;
        failedCount?: number;
        retryCount?: number;
      };
      error?: string;
    } | null;

    if (!response.ok || !result?.success) {
      const sanitizedError = result?.error || `HTTP ${response.status} response`;
      console.error(
        `[OutboxCron] Outbox batch processing reported failure in ${elapsedMs}ms:`,
        sanitizedError
      );
      return new Response(
        JSON.stringify({
          success: false,
          elapsedMs,
          error: sanitizedError,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { processedCount = 0, sentCount = 0, failedCount = 0, retryCount = 0 } =
      result.data || {};

    console.log(
      `[OutboxCron] Successfully processed outbox batch in ${elapsedMs}ms: processed=${processedCount}, sent=${sentCount}, failed=${failedCount}, retries=${retryCount}.`
    );

    return new Response(
      JSON.stringify({
        success: true,
        elapsedMs,
        summary: {
          processedCount,
          sentCount,
          failedCount,
          retryCount,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Network/Execution error";
    console.error("[OutboxCron] Execution error calling outbox worker:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const config: NetlifyFunctionConfig = {
  schedule: "*/5 * * * *",
};
