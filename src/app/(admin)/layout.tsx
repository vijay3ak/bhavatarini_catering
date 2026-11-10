import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";
import { AdminClientShell } from "@/components/admin/layout/admin-client-shell";
import type { AdminProfileSummary } from "@/components/admin/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Public authentication routes under /admin render their own standalone auth container
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/accept-invite");

  if (isAuthPage) {
    return <>{children}</>;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In local development before .env.local setup, permit bootstrap render
  if (!supabaseUrl || !supabaseAnonKey) {
    return <AdminClientShell>{children}</AdminClientShell>;
  }

  let user = null;
  let profile: AdminProfileSummary | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;

    if (user) {
      const { data: profileData } = await (supabase.from("admin_profiles") as any)
        .select("id, email, full_name, role_id, is_active")
        .eq("id", user.id)
        .maybeSingle();

      profile = profileData as AdminProfileSummary | null;
    }
  } catch {
    // Fail securely: if database check errors in production, deny access
    if (process.env.NODE_ENV === "production") {
      redirect("/admin/login?error=access_denied");
    }
    return <AdminClientShell>{children}</AdminClientShell>;
  }

  if (!user) {
    const safeNext = getSafeRedirectUrl(pathname || "/admin");
    redirect(`/admin/login?next=${encodeURIComponent(safeNext)}`);
  }

  if (!profile || !profile.is_active) {
    redirect("/admin/login?error=access_denied");
  }

  return (
    <AdminClientShell verifiedProfile={profile}>
      {children}
    </AdminClientShell>
  );
}
