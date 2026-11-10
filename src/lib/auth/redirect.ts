/**
 * Validates a redirect target to prevent Open Redirect vulnerabilities.
 *
 * Rules:
 * 1. Must be a relative path starting with "/".
 * 2. Must NOT start with "//" or "/\" (which browsers resolve as external network schemes).
 * 3. Must NOT contain URI scheme indicators (e.g. javascript:, data:, https:).
 * 4. Must NOT redirect to /admin/login recursively.
 * 5. Falls back safely to "/admin" for any invalid or missing parameter.
 */
export function getSafeRedirectUrl(nextParam: string | null | undefined): string {
  if (!nextParam) {
    return "/admin";
  }

  const trimmed = nextParam.trim();

  // Must begin with a single slash
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/admin";
  }

  // Reject embedded protocol schemes
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/admin";
  }

  // Prevent recursive redirect loops to login
  if (
    trimmed === "/admin/login" ||
    trimmed.startsWith("/admin/login?") ||
    trimmed.startsWith("/admin/login/")
  ) {
    return "/admin";
  }

  return trimmed;
}
