import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processNotificationOutbox } from "@/lib/services/outbox-processor";

/**
 * Constant-time string comparison to prevent timing attacks on API secrets.
 */
function timingSafeTokenCheck(provided: string, expected: string): boolean {
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);
  if (bufProvided.length !== bufExpected.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

/**
 * Serverless-compatible internal outbox processor route.
 *
 * Designed for execution via:
 * 1. Scheduled Netlify / Vercel background cron triggers.
 * 2. External monitoring / scheduled webhooks.
 * 3. Administrative manual maintenance triggers.
 *
 * Security:
 * Requires bearer authorization matching INTERNAL_API_SECRET via timing-safe comparison.
 */
export async function POST(request: NextRequest) {
  try {
    const internalSecret = process.env.INTERNAL_API_SECRET;

    if (!internalSecret || internalSecret.trim().length === 0) {
      console.error("[POST /api/internal/process-outbox] INTERNAL_API_SECRET is not configured on the server.");
      return NextResponse.json(
        { success: false, error: "Internal API secret is not configured on this server." },
        { status: 500 }
      );
    }

    // Verify Authorization header
    const authHeader = request.headers.get("authorization");
    const secretHeader = request.headers.get("x-internal-secret");

    let providedToken: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      providedToken = authHeader.slice(7).trim();
    } else if (secretHeader) {
      providedToken = secretHeader.trim();
    }

    if (!providedToken || !timingSafeTokenCheck(providedToken, internalSecret.trim())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Invalid or missing internal API secret." },
        { status: 401 }
      );
    }

    // Parse optional request payload
    let batchSize = 10;
    try {
      const body = await request.json();
      if (typeof body?.batchSize === "number" && body.batchSize > 0) {
        batchSize = Math.min(body.batchSize, 50);
      }
    } catch {
      // Empty or non-JSON body is acceptable, use default batchSize
    }

    const result = await processNotificationOutbox({ batchSize });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("[POST /api/internal/process-outbox] Outbox execution failed:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
