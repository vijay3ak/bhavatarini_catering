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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Days */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Days
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {kpis.totalDays}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {monthName} {year}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-950/60 text-emerald-400 p-2 border border-emerald-800/30">
            <Calendar className="h-4 w-4" />
          </div>
        </div>

        {/* Total Sundays */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Sundays
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {kpis.totalSundays}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              Weekly shift off / non-working
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 text-amber-500 p-2 border border-amber-500/20">
            <Sun className="h-4 w-4" />
          </div>
        </div>

        {/* Total Billable Quantity */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Billable Qty
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {kpis.totalBillQty.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatINR(kpis.rate)} / Meal
            </p>
          </div>
          <div className="rounded-lg bg-emerald-950/60 text-emerald-400 p-2 border border-emerald-800/30">
            <Hash className="h-4 w-4" />
          </div>
        </div>

        {/* Total Amount (₹) */}
        <div className="rounded-xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/80 to-card p-4 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
              Total Amount (₹)
            </p>
            <p className="text-2xl font-bold text-foreground mt-1 font-serif">
              {formatINR(kpis.totalAmount)}
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Pre-tax billable amount
            </p>
          </div>
          <div className="rounded-lg bg-emerald-800 text-amber-300 p-2 border border-amber-500/30">
            <IndianRupee className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Amount in Words Bar */}
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-foreground">Amount in Words:</span>
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300/90 italic">
            &ldquo;{kpis.amountInWords}&rdquo;
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Indian numbering convention (Lakhs & Crores)
        </div>
      </div>
    </div>
  );
}
