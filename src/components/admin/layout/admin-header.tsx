"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink } from "lucide-react";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Operations Overview",
    subtitle: "Real-time summary of catering leads, operations and billing",
  },
  "/admin/enquiries": {
    title: "Enquiry Management",
    subtitle: "Incoming customer inquiries from corporate offices and events",
  },
  "/admin/customers": {
    title: "Corporate Customers",
    subtitle: "Contract client profiles, locations, GSTIN and meal presets",
  },
  "/admin/billing": {
    title: "Monthly Billing Management",
    subtitle: "Reconcile daily meal tallies, apply contract presets and generate invoices",
  },
  "/admin/billing/invoices": {
    title: "Invoices & Billing Records",
    subtitle: "Generated monthly billing records and tax invoice archives",
  },
  "/admin/billing/upload": {
    title: "Handwritten Ledger Scanner",
    subtitle: "Document vision engine for handwritten canteen logbooks",
  },
  "/admin/settings": {
    title: "System & Bank Settings",
    subtitle: "Tax declarations, default rates, bank details and API credentials",
  },
};

export function AdminHeader({ onToggleMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();

  const currentMeta = PAGE_TITLES[pathname] || {
    title: "Admin Dashboard",
    subtitle: "Bhavatarini Catering Service Management Hub",
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#fffefa]/95 backdrop-blur-md border-b border-[#e5ddcd] px-4 md:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-[2px] text-[#173f2d] hover:bg-[#faf7ef] border border-[#e5ddcd] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-serif text-[17px] md:text-[20px] font-bold text-[#123c2c] leading-tight truncate m-0">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Mode Badge & Public Site Link */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#fbf6e9] border border-[#c1a463]/40 text-[#8e7139] text-[11px] font-bold uppercase tracking-wider select-none">
          <span className="w-2 h-2 rounded-full bg-[#c7a45b] animate-pulse" />
          <span>Phase 1 Foundation</span>
        </span>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-semibold text-[#174a34] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#e5ddcd] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <span className="hidden md:inline">View Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
