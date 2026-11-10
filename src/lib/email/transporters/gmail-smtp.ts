import "server-only";

import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailOptions, SendEmailResult } from "../types";

/**
 * Classifies an SMTP error into permanent vs transient failures and sanitizes credentials.
 */
function classifySmtpError(
  err: unknown,
  pass?: string
): { message: string; isPermanentFailure: boolean } {
  if (!(err instanceof Error)) {
    return { message: "Unknown SMTP transport error", isPermanentFailure: false };
  }

  const anyErr = err as unknown as Record<string, unknown>;
  const code = typeof anyErr.code === "string" ? anyErr.code : "";
  const responseCode = typeof anyErr.responseCode === "number" ? anyErr.responseCode : 0;
  const response = typeof anyErr.response === "string" ? anyErr.response : "";
  const rawMsg = err.message || "";

  // 1. Sanitize error string to guarantee credentials are never leaked
  let cleanMsg = rawMsg;
  if (pass && pass.trim()) {
    cleanMsg = cleanMsg.split(pass).join("[REDACTED]");
    cleanMsg = cleanMsg.split(pass.replace(/\s+/g, "")).join("[REDACTED]");
  }

  // 2. Authentication failure (Configuration error)
  if (
    code === "EAUTH" ||
    responseCode === 535 ||
    /Username and Password not accepted|BadCredentials/i.test(cleanMsg)
  ) {
    return {
      message:
        "Gmail SMTP authentication failure: Google App Password was rejected (EAUTH/535). Please verify GMAIL_USER and GMAIL_APP_PASSWORD in server environment.",
      isPermanentFailure: true,
    };
  }

  // 3. Permanent Recipient Rejection (5xx recipient errors)
  if (
    code === "EENVELOPE" ||
    responseCode === 550 ||
    responseCode === 553 ||
    responseCode === 501 ||
    /No recipients defined|Invalid recipient|user unknown|mailbox unavailable|does not exist/i.test(
      cleanMsg
    ) ||
    /5\.1\.1|5\.1\.2|5\.1\.3/i.test(response)
  ) {
    return {
      message: `Permanent delivery failure: Recipient address rejected (${
        responseCode || code || "Invalid recipient"
      }).`,
      isPermanentFailure: true,
    };
  }

  // 4. Rate-limiting / sending quota exceeded (Temporary, bounded retry)
  if (
    responseCode === 452 ||
    /rate limit|quota exceeded|daily sending quota/i.test(cleanMsg)
  ) {
    return {
      message:
        "Gmail SMTP rate limit exceeded (452). Delivery temporarily throttled; bounded retry scheduled.",
      isPermanentFailure: false,
    };
  }

  // 5. Temporary connection / network errors (Temporary, bounded retry)
  if (
    [
      "ETIMEDOUT",
      "ECONNRESET",
      "ECONNREFUSED",
      "ENOTFOUND",
      "ESOCKETTIMEDOUT",
      "EAI_AGAIN",
    ].includes(code) ||
    responseCode === 421 ||
    /timeout|connect ETIMEDOUT|socket closed/i.test(cleanMsg)
  ) {
    return {
      message: `Temporary SMTP connection error (${
        code || responseCode || "Network issue"
      }). Bounded retry scheduled.`,
      isPermanentFailure: false,
    };
  }

  return {
    message: cleanMsg,
    isPermanentFailure: false,
  };
}

export class GmailSmtpProvider implements EmailProvider {
  readonly id = "gmail-smtp";

  private getTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error(
        "Missing GMAIL_USER or GMAIL_APP_PASSWORD server environment variables."
      );
    }

    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ""), // Strip any spaces from 16-char app password
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const pass = process.env.GMAIL_APP_PASSWORD;
    try {
      const transporter = this.getTransporter();
      const defaultFrom = process.env.GMAIL_USER
        ? `"Bhavatarini Catering Service" <${process.env.GMAIL_USER.trim()}>`
        : "Bhavatarini Catering Service";

      const info = await transporter.sendMail({
        from: options.from || defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        messageId: options.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const { message, isPermanentFailure } = classifySmtpError(err, pass);
      console.error("[GmailSmtpProvider] Email delivery failure:", message);
      return {
        success: false,
        error: message,
        isPermanentFailure,
      };
    }
  }
}
