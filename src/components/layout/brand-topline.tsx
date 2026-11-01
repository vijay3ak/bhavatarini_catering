"use client";

import React from "react";
import { ActiveSectionInfo } from "@/lib/hooks/use-active-section";

interface BrandToplineProps {
  activeSection: ActiveSectionInfo;
}

export function BrandTopline({ activeSection }: BrandToplineProps) {
  return (
    <aside
      aria-label="Current Location and Section Tracker"
      className="sticky top-0 z-[31] bg-[#0b2b1d] text-[#d8c38a] border-b border-[#cdae65]/25"
    >
      <div className="max-w-container mx-auto px-4 sm:px-[5%] h-[31px] max-sm:h-[28px] flex items-center justify-between text-[8px] sm:text-[9px] max-sm:text-[7.5px] tracking-[1.8px] max-sm:tracking-[1px] font-semibold uppercase font-sans select-none">
        <span className="truncate">COIMBATORE · TAMIL NADU</span>
        <div className="flex items-center gap-[9px] max-sm:gap-1.5 text-[8px] max-sm:text-[7.5px] tracking-[1.8px] max-sm:tracking-[1px] shrink-0">
          <span
            aria-hidden="true"
            className="block w-[6px] h-[6px] rounded-full bg-[#d8bd73] shadow-[0_0_0_4px_rgba(216,189,115,0.13)] animate-pulse"
          />
          <span id="activeSectionLabel" className="text-[#d8c38a]">
            {activeSection.label}
          </span>
          <b
            id="activeSectionNumber"
            className="font-semibold text-white/50 pl-[9px] max-sm:pl-1.5 border-l border-white/20 tabular-nums"
          >
            {activeSection.number}
          </b>
        </div>
      </div>
    </aside>
  );
}
