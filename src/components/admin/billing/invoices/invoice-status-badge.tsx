"use client";

import React from "react";
import { CheckCircle2, Clock, FileCheck, XCircle, FileEdit } from "lucide-react";
import type { InvoiceArchiveStatus } from "@/types/billing";

interface InvoiceStatusBadgeProps {
  status: InvoiceArchiveStatus;
  size?: "sm" | "md";
}

export function InvoiceStatusBadge({ status, size = "md" }: InvoiceStatusBadgeProps) {
  const isSm = size === "sm";

  switch (status) {
    case "PAID":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-[2px] border border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs ${
            isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <CheckCircle2 className={isSm ? "w-3 h-3 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
          <span>Paid</span>
        </span>
      );
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-[2px] border border-amber-300 bg-amber-50 text-amber-800 shadow-xs ${
            isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <Clock className={isSm ? "w-3 h-3 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} />
          <span>Pending</span>
        </span>
      );
    case "GENERATED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-[2px] border border-[#dcd0b5] bg-[#faf7ef] text-[#123c2c] shadow-xs ${
            isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <FileCheck className={isSm ? "w-3 h-3 text-[#8e7139]" : "w-3.5 h-3.5 text-[#8e7139]"} />
          <span>Generated</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-[2px] border border-red-300 bg-red-50 text-red-800 shadow-xs ${
            isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <XCircle className={isSm ? "w-3 h-3 text-red-600" : "w-3.5 h-3.5 text-red-600"} />
          <span>Cancelled</span>
        </span>
      );
    case "DRAFT":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-[2px] border border-slate-300 bg-slate-100 text-slate-700 shadow-xs ${
            isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <FileEdit className={isSm ? "w-3 h-3 text-slate-500" : "w-3.5 h-3.5 text-slate-500"} />
          <span>Draft</span>
        </span>
      );
  }
}
