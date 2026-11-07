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

      {/* Operator Session Footer */}
      <div className="p-4 border-t border-[#c7a45b]/25 bg-[#0e3023]">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-[#1c553e] border border-[#c7a45b]/50 grid place-items-center text-xs font-bold text-[#faf8f1]">
            BC
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#faf8f1] truncate">
              Catering Manager
            </span>
            <span className="text-[10.5px] text-[#c7a45b] font-medium truncate">
              {siteConfig.location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
