"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS } from "./admin-nav-config";
import { siteConfig } from "@/lib/config/site";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

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
    <div className="flex flex-col h-full bg-[#0d281e] text-[#f4f7f4] select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#c7a45b]/20">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm"
        >
          <div className="relative w-10 h-10 shrink-0 rounded-full border border-[#c7a45b]/40 bg-[#123c2c] p-1 grid place-items-center shadow-md transition-transform group-hover:scale-105">
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
            <span className="font-serif text-[18px] font-bold leading-tight text-[#e2cb8e] tracking-tight">
              Bhavatarini
            </span>
            <span className="text-[9px] font-bold tracking-[2px] text-[#997b3e] uppercase">
              Operations Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Admin Navigation" className="flex-1 overflow-y-auto p-4 space-y-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.groupLabel} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-extrabold tracking-[2px] text-[#c7a45b]/70 uppercase">
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
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-[4px] text-[13px] transition-all duration-200 ${
                        active
                          ? "bg-[#184834] text-[#f4ecd8] font-semibold border-l-4 border-[#c7a45b] shadow-sm"
                          : "text-[#c8d3c8]/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active ? "text-[#c7a45b]" : "text-[#c8d3c8]/60"
                          }`}
                          strokeWidth={1.8}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c7a45b]/20 text-[#e2cb8e]">
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

      {/* Operator Session Footer */}
      <div className="p-4 border-t border-[#c7a45b]/20 bg-[#092018]/60">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-[#1c573e] border border-[#c7a45b]/40 grid place-items-center text-xs font-bold text-[#e2cb8e]">
            BC
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              Catering Manager
            </span>
            <span className="text-[10px] text-[#c7a45b] truncate">
              {siteConfig.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
