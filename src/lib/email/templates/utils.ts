import "server-only";

/**
 * Escapes characters with special meaning in HTML to prevent XSS / HTML injection
 * when rendering dynamic data in email templates.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Formats an ISO timestamp or date string into Indian Standard Time (IST) human-readable format.
 */
export function formatISTDateTime(isoString?: string | null): string {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return String(isoString);
  }
}

/**
 * Formats a YYYY-MM-DD date string into a friendly date (e.g., "15 Nov 2026").
 */
export function formatEventDate(dateString?: string | null): string {
  if (!dateString) return "To be confirmed";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    }
    return dateString;
  } catch {
    return dateString;
  }
}
