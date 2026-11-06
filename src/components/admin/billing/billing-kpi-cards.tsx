"use client";

import React from "react";
import { Calendar, Sun, Hash, IndianRupee, Layers } from "lucide-react";
import { BillingKpiSummary } from "@/types/billing";
import { formatINR } from "@/lib/utils/billing-calculations";

interface BillingKpiCardsProps {
  kpis: BillingKpiSummary;
  monthName: string;
  year: number;
}

export function BillingKpiCards({ kpis, monthName, year }: BillingKpiCardsProps) {
  return (
    <div className="space-y-3">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Days */}
        <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
          <div>
            <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
              Total Days
            </p>
            <p className="text-2xl md:text-3xl font-serif font-bold text-[#123c2c] mt-1.5 m-0">
              {kpis.totalDays}
            </p>
            <p className="text-xs text-[#69746a] mt-1 m-0">
              {monthName} {year}
            </p>
          </div>
          <div className="w-8 h-8 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Total Sundays */}
        <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
          <div>
            <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
              Total Sundays
            </p>
            <p className="text-2xl md:text-3xl font-serif font-bold text-[#123c2c] mt-1.5 m-0">
              {kpis.totalSundays}
            </p>
            <p className="text-xs text-[#8e7139] mt-1 font-medium m-0">
              Weekly shift off / non-working
            </p>
          </div>
          <div className="w-8 h-8 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
            <Sun className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Total Billable Quantity */}
        <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
          <div>
            <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
              Total Billable Qty
            </p>
            <p className="text-2xl md:text-3xl font-serif font-bold text-[#123c2c] mt-1.5 m-0 font-mono">
              {kpis.totalBillQty.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[#69746a] mt-1 m-0">
              {formatINR(kpis.rate)} / Meal
            </p>
          </div>
          <div className="w-8 h-8 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
            <Hash className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Total Amount (₹) - Highlighted in Elegant Forest Green */}
        <div className="rounded-[2px] border border-[#0d281e] bg-[#123c2c] p-4 shadow-sm flex items-start justify-between min-h-[104px] text-[#faf8f1]">
          <div>
            <p className="text-[11px] font-bold text-[#c7a45b] uppercase tracking-wider m-0">
              Total Amount (₹)
            </p>
            <p className="text-2xl md:text-3xl font-serif font-bold text-[#ffffff] mt-1.5 m-0">
              {formatINR(kpis.totalAmount)}
            </p>
            <p className="text-xs text-[#c8d8ce] mt-1 m-0">
              Pre-tax billable amount
            </p>
          </div>
          <div className="w-8 h-8 rounded-[2px] bg-[#1a4a38] border border-[#c7a45b]/40 grid place-items-center text-[#c7a45b] shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Amount in Words Bar */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#faf7ef] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-[#8e7139] shrink-0" />
          <span className="text-xs font-bold text-[#123c2c]">Amount in Words:</span>
          <span className="text-xs font-medium text-[#645028] italic">
            &ldquo;{kpis.amountInWords}&rdquo;
          </span>
        </div>
        <div className="text-[11px] text-[#69746a] shrink-0">
          Indian numbering convention (Lakhs &amp; Crores)
        </div>
      </div>
    </div>
  );
}
