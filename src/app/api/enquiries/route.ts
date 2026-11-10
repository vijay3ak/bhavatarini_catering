import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { processNotificationOutbox } from "@/lib/services/outbox-processor";

// Security salt loaded from environment configuration with secure fallback
const ENQUIRY_SALT =
  process.env.ENQUIRY_SALT ||
  process.env.ENQUIRY_IP_SALT ||
  "bhavatarini_enquiry_salt_v1_secure_coimbatore";

// In-memory sliding window rate limiter: max 5 requests per 10 minutes per IP hash
const ipRateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const timestamps = (ipRateLimitMap.get(ipHash) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRateLimitMap.set(ipHash, timestamps);
    return true; // Rate limited
  }

  timestamps.push(now);
  ipRateLimitMap.set(ipHash, timestamps);
  return false; // Allowed
}

// Strict validation schema for public catering enquiry submissions
const EnquirySubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(128, "Name must not exceed 128 characters."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  email: z
    .string()
    .trim()
    .max(128, "Email must not exceed 128 characters.")
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address or leave blank."
    ),
  kind: z.enum([
    "Corporate office",
    "Startup / team",
    "Small function",
    "Group gathering",
    "Others",
  ]),
  kindOther: z.string().trim().max(256).optional(),
  food: z.enum([
    "Full meals",
    "Customised tiffin",
    "Both meals and tiffin",
    "Others",
  ]),
  foodOther: z.string().trim().max(256).optional(),
  qty: z.string().trim().max(32).optional(),
  eventDate: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const [yearStr, monthStr, dayStr] = val.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
      if (month < 1 || month > 12 || day < 1 || day > 31) return false;
      if (year < 2024 || year > 2035) return false;

      // Ensure event date is not in the past relative to today in IST
      const todayIST = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      return val >= todayIST;
    }, "Event date cannot be in the past. Please select today or an upcoming date."),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters.")
    .max(256, "Location must not exceed 256 characters."),
  details: z.string().trim().max(2000).optional(),
  // Honeypot field for bot trapping
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const parseResult = EnquirySubmissionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError =
        parseResult.error.issues?.[0]?.message || "Validation failed.";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const input = parseResult.data;

    // Honeypot trap: if a bot populated the hidden 'website' field, silently succeed without DB insert
    if (input.website && input.website.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          enquiryNumber: "ENQ-BOT-TRAP",
          message: "Enquiry submitted successfully.",
        },
        { status: 200 }
      );
    }

    // Derive server-side visitor telemetry (never trust client-supplied headers)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "127.0.0.1";

    const ipHash = crypto
      .createHash("sha256")
      .update(clientIp + "_" + ENQUIRY_SALT)
      .digest("hex")
      .slice(0, 64);

    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;

    // IP Rate Limiting Check
    if (checkRateLimit(ipHash)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many requests from your network. Please wait a few minutes before submitting another enquiry, or contact us directly on WhatsApp.",
        },
        { status: 429 }
      );
    }

    const supabase = createServiceRoleClient();

    // Duplicate submission cooldown: prevent duplicate submissions with the same phone number within 60 seconds
    const duplicateCooldownThreshold = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentEnquiry } = await (supabase.from("enquiries") as any)
      .select("id, enquiry_number, created_at")
      .eq("phone", input.phone)
      .gt("created_at", duplicateCooldownThreshold)
      .limit(1)
      .maybeSingle();

    if (recentEnquiry) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A catering enquiry for this mobile number was recently received. Our coordinator will contact you shortly.",
        },
        { status: 429 }
      );
    }

    // Sanitize optional fields
    const emailValue =
      input.email && input.email.trim().length > 0 ? input.email.trim() : null;

    // Convert empty event date string to null (avoid Postgres date syntax errors)
    const eventDateValue =
      input.eventDate && input.eventDate.trim().length > 0
        ? input.eventDate.trim()
        : null;

    // Approved quantity fallback: default to 'To be confirmed' if empty, truncated to 32 chars
    const quantityRangeValue =
      input.qty && input.qty.trim().length > 0
        ? input.qty.trim().slice(0, 32)
        : "To be confirmed";

    // Consolidate custom requirement and food preferences into details text
    const detailParts: string[] = [];
    if (input.kind === "Others" && input.kindOther?.trim()) {
      detailParts.push(`Custom Requirement: ${input.kindOther.trim()}`);
    }
    if (input.food === "Others" && input.foodOther?.trim()) {
      detailParts.push(`Custom Food Preference: ${input.foodOther.trim()}`);
    }
    if (input.details?.trim()) {
      detailParts.push(input.details.trim());
    }
    const combinedDetails =
      detailParts.length > 0 ? detailParts.join("\n") : null;

    // Insert into Supabase PostgreSQL using service-role client
    // Triggers will automatically set enquiry_number and enqueue notification outbox rows
    const { data, error } = await (supabase.from("enquiries") as any)
      .insert({
        name: input.name,
        phone: input.phone,
        email: emailValue,
        organisation: null,
        requirement_type: input.kind,
        food_preference: input.food,
        quantity_range: quantityRangeValue,
        event_date: eventDateValue,
        location: input.location,
        details: combinedDetails,
        status: "new",
        whatsapp_initiated: false,
        ip_hash: ipHash,
        user_agent: userAgent,
      })
      .select("id, enquiry_number, created_at")
      .single();

    if (error || !data) {
      console.error("[POST /api/enquiries] Supabase insert failed:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to record your enquiry right now. Please try again or reach our team directly via WhatsApp.",
        },
        { status: 500 }
      );
    }

    // Query the newly enqueued outbox notifications for this enquiry and trigger targeted dispatch
    try {
      const { data: outboxRows } = await (supabase.from("notification_outbox") as any)
        .select("id")
        .eq("enquiry_id", data.id)
        .eq("status", "pending");

      if (outboxRows && outboxRows.length > 0) {
        const targetOutboxIds = outboxRows.map((r: { id: string }) => r.id);
        // Non-blocking bounded dispatch: allows instant delivery while ensuring
        // customer enquiry submission response is never failed or delayed by SMTP issues
        await Promise.race([
          processNotificationOutbox({ targetOutboxIds }),
          new Promise((resolve) => setTimeout(resolve, 3500)),
        ]);
      }
    } catch (dispatchErr) {
      console.error(
        "[POST /api/enquiries] Immediate notification dispatch error (outbox queue will retry):",
        dispatchErr
      );
    }

    return NextResponse.json(
      {
        success: true,
        enquiryNumber: data.enquiry_number,
        message: "Enquiry submitted successfully.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Internal server error.";
    console.error("[POST /api/enquiries] Unexpected error:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error:
          "An unexpected error occurred while processing your enquiry. Please contact us via phone or WhatsApp.",
      },
      { status: 500 }
    );
  }
}
