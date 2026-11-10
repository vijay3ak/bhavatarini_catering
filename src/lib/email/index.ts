import "server-only";

import type { EmailProvider } from "./types";
import { GmailSmtpProvider } from "./transporters/gmail-smtp";

export * from "./types";
export { GmailSmtpProvider } from "./transporters/gmail-smtp";

// Singleton provider instance for server-side reuse
let cachedProvider: EmailProvider | null = null;

/**
 * Returns the configured server-side email provider.
 * Defaults to GmailSmtpProvider.
 * Can be switched to Resend or other providers via EMAIL_PROVIDER environment variable
 * without changing any application code or templates.
 */
export function getEmailProvider(): EmailProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = (process.env.EMAIL_PROVIDER || "gmail").toLowerCase().trim();

  switch (providerType) {
    case "gmail":
    case "gmail-smtp":
    default:
      cachedProvider = new GmailSmtpProvider();
      return cachedProvider;
  }
}
