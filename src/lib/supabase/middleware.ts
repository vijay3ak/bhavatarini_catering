import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Updates the user's Supabase session cookie on incoming requests
 * and enforces route-level authentication guards for the admin portal.
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In production, missing credentials must fail closed (block access)
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      const pathname = request.nextUrl.pathname;
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        return new NextResponse(
          "Service Unavailable: Backend configuration incomplete.",
          { status: 503 }
        );
      }
    }
    // In local development before .env.local setup, permit initial bootstrap
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Fetch the currently authenticated user safely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected administrative routes (exempt public authentication screens)
  const isProtectedAdminRoute =
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/forgot-password") &&
    !pathname.startsWith("/admin/accept-invite");

  // Protected administrative API routes
  const isProtectedAdminApiRoute = pathname.startsWith("/api/admin");

  if (isProtectedAdminRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copy any session cookies set by Supabase Auth onto the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  if (isProtectedAdminApiRoute && !user) {
    return NextResponse.json(
      { error: "Unauthorized. Authentication is required to access admin endpoints." },
      { status: 401 }
    );
  }

  return supabaseResponse;
}
