"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { ADMIN_NAV_GROUPS } from "./admin-nav-config";
import { siteConfig } from "@/lib/config/site";
import { createClient } from "@/lib/supabase/client";

export interface AdminProfileSummary {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
}

interface AdminSidebarProps {
  onNavigate?: () => void;
  initialProfile?: AdminProfileSummary | null;
}

function getOperatorInfo(profile?: {
  full_name?: string | null;
  email?: string | null;
  role_id?: string | null;
} | null) {
  if (!profile) {
    return {
      fullName: "Catering Manager",
      roleName: "Operations Lead",
      initials: "BC",
    };
  }
  const roleLabels: Record<string, string> = {
    owner: "Business Owner",
    admin: "Catering Manager",
    staff: "Operations Staff",
  };
  const name = profile.full_name || profile.email || "Administrator";
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

  return {
    fullName: name,
    roleName: (profile.role_id && roleLabels[profile.role_id]) || "Operations",
    initials: initials || "BC",
  };
}

export function AdminSidebar({ onNavigate, initialProfile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [operator, setOperator] = useState<{
    fullName: string;
    roleName: string;
    initials: string;
  }>(() => getOperatorInfo(initialProfile));
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setOperator(getOperatorInfo(initialProfile));
      return;
    }

    let isMounted = true;
    async function loadOperatorProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          const { data: profileData } = await (supabase.from("admin_profiles") as any)
            .select("full_name, role_id, email")
            .eq("id", user.id)
            .maybeSingle();

          const profile = profileData as {
            full_name: string;
            role_id: string;
            email: string;
          } | null;

          if (profile && isMounted) {
            setOperator(getOperatorInfo(profile));
          }
        }
      } catch {
        // Fallback gracefully in unconfigured local mode
      }
    }

    loadOperatorProfile();
    return () => {
      isMounted = false;
    };
  }, [initialProfile]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors during sign out
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href === "/") {
      return false;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-col h-full bg-[#123c2c] text-[#f4f7f4] select-none shadow-md">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#c7a45b]/25 bg-[#0e3023]">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b] rounded-sm"
        >
          <div className="relative w-10 h-10 shrink-0 rounded-full border border-[#c7a45b]/50 bg-[#faf8f1] p-1 grid place-items-center shadow-md transition-transform group-hover:scale-105">
            <Image
              src="/images/bhavatarini-chef-logo.png"
              alt="Bhavatarini Catering Logo"
              width={34}
              height={34}
              priority
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[18px] font-bold leading-tight text-[#faf8f1] tracking-tight">
              Bhavatarini
            </span>
            <span className="text-[9.5px] font-bold tracking-[2px] text-[#c7a45b] uppercase mt-0.5">
              Operations Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Admin Navigation" className="flex-1 overflow-y-auto p-3.5 space-y-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.groupLabel} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-bold tracking-[2px] text-[#c7a45b] uppercase">
              {group.groupLabel}
            </h3>
            <ul className="space-y-1 list-none p-0 m-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between px-3 py-2 rounded-[2px] text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#1c553e] text-[#ffffff] font-bold border-l-4 border-[#c7a45b] shadow-xs"
                          : "text-[#dbe6de] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active ? "text-[#c7a45b]" : "text-[#c8d6cc]"
                          }`}
                          strokeWidth={1.8}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#c7a45b]/25 text-[#faf8f1] border border-[#c7a45b]/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Operator Session Footer & Sign Out Action */}
      <div className="p-4 border-t border-[#c7a45b]/25 bg-[#0e3023] space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-[#1c553e] border border-[#c7a45b]/50 grid place-items-center text-xs font-bold text-[#faf8f1] shrink-0">
            {operator.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#faf8f1] truncate">
              {operator.fullName}
            </span>
            <span className="text-[10.5px] text-[#c7a45b] font-medium truncate">
              {operator.roleName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          aria-label="Sign out of operations hub"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[2px] text-xs font-semibold text-[#f4ecda] bg-white/5 hover:bg-white/10 border border-[#c7a45b]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b] disabled:opacity-50 cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 text-[#c7a45b] animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5 text-[#c7a45b]" />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
