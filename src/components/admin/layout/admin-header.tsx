"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Operations Overview",
    subtitle: "Real-time summary of catering leads, operations and billing",
  },
  "/admin/enquiries": {
    title: "Customer Enquiries",
    subtitle: "Review incoming catering requests, manage follow-ups and track enquiry progress",
  },
  "/admin/customers": {
    title: "Corporate Customers",
    subtitle: "Contract client profiles, locations, GSTIN and meal presets",
  },
  "/admin/billing": {
    title: "Monthly Catering Billing",
    subtitle: "Manage daily meal quantities, review billing totals and prepare customer invoices",
  },
  "/admin/billing/invoices": {
    title: "Invoice History",
    subtitle: "View, search and manage previously generated customer invoices and billing records",
  },
  "/admin/billing/upload": {
    title: "Handwritten Ledger Scanner",
    subtitle: "Upload daily catering ledger sheets and prepare quantities for reconciliation",
  },
  "/admin/settings": {
    title: "System Configuration",
    subtitle: "Manage business information, contact details, billing preferences and administrative settings",
  },
};

export function AdminHeader({ onToggleMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Offline / unconfigured environment fallback
    } finally {
      window.location.href = "/admin/login";
    }
  };

  const currentMeta = PAGE_TITLES[pathname] || {
    title: "Admin Dashboard",
    subtitle: "Bhavatarini Catering Service Management Hub",
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e5ddcd] px-4 md:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-[2px] text-[#123c2c] hover:bg-[#faf7ef] border border-[#e5ddcd] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-serif text-[17px] md:text-[20px] font-bold text-[#123c2c] leading-tight truncate m-0">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Mode Badge, Public Site Link & Sign Out */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] text-[#8e7139] text-[11px] font-semibold tracking-wider uppercase select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c7a45b]" />
          <span>Operations Portal</span>
        </span>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-semibold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#dcd0b5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b]"
        >
          <span className="hidden md:inline">View Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#8e7139]" />
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          aria-label="Sign out of operations portal"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-semibold text-[#8e7139] hover:text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#dcd0b5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b] disabled:opacity-60 cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 text-[#8e7139] animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5 text-[#8e7139]" />
          )}
          <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </header>
  );
}
