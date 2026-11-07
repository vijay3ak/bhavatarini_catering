"use client";

import React, { useMemo } from "react";
import { FileText, IndianRupee, CheckCircle2, Clock } from "lucide-react";
import type { ArchivedInvoice } from "@/types/billing";
import { formatINR } from "@/lib/utils/billing-calculations";

interface InvoiceArchiveKpiCardsProps {
  invoices: ArchivedInvoice[];
}

export function InvoiceArchiveKpiCards({ invoices }: InvoiceArchiveKpiCardsProps) {
  const metrics = useMemo(() => {
    const totalInvoices = invoices.length;
    let totalInvoicedValue = 0;
    let paidCount = 0;
    let paidValue = 0;
    let pendingCount = 0;
    let pendingValue = 0;

    const uniqueCustomers = new Set<string>();

    for (const inv of invoices) {
      const amount = inv.kpis.totalAmount || 0;
      totalInvoicedValue += amount;
      uniqueCustomers.add(inv.customer.id || inv.customer.shortCode);

      if (inv.status === "PAID") {
        paidCount++;
        paidValue += amount;
      } else if (inv.status === "PENDING") {
        pendingCount++;
        pendingValue += amount;
      }
    }

    return {
      totalInvoices,
      totalInvoicedValue,
      paidCount,
      paidValue,
      pendingCount,
      pendingValue,
      customerCount: uniqueCustomers.size,
    };
  }, [invoices]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Invoices */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
        <div>
          <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
            Total Invoices
          </p>
          <p className="text-2xl md:text-3xl font-serif font-bold text-[#123c2c] mt-1.5 m-0">
            {metrics.totalInvoices}
          </p>
          <p className="text-xs text-[#69746a] mt-1 m-0">
            Across {metrics.customerCount} corporate clients
          </p>
        </div>
        <div className="w-8 h-8 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Total Invoiced Value */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
        <div>
          <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
            Total Invoiced Value
          </p>
          <p className="text-2xl md:text-3xl font-serif font-bold text-[#123c2c] mt-1.5 m-0 font-mono">
            {formatINR(metrics.totalInvoicedValue)}
          </p>
          <p className="text-xs text-[#69746a] mt-1 m-0">
            Cumulative billing total
          </p>
        </div>
        <div className="w-8 h-8 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
          <IndianRupee className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Paid Invoices */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
        <div>
          <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
            Paid Invoices
          </p>
          <p className="text-2xl md:text-3xl font-serif font-bold text-emerald-800 mt-1.5 m-0">
            {metrics.paidCount}{" "}
            <span className="text-xs font-sans font-semibold text-emerald-700">
              ({formatINR(metrics.paidValue)})
            </span>
          </p>
          <p className="text-xs text-emerald-700 mt-1 m-0 font-medium">
            Settled via bank transfer
          </p>
        </div>
        <div className="w-8 h-8 rounded-[2px] bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-700 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Pending Invoices */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex items-start justify-between min-h-[104px]">
        <div>
          <p className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider m-0">
            Pending Invoices
          </p>
          <p className="text-2xl md:text-3xl font-serif font-bold text-[#8e7139] mt-1.5 m-0">
            {metrics.pendingCount}{" "}
            <span className="text-xs font-sans font-semibold text-[#8e7139]">
              ({formatINR(metrics.pendingValue)})
            </span>
          </p>
          <p className="text-xs text-[#8e7139] mt-1 m-0 font-medium">
            Awaiting corporate credit cycle
          </p>
        </div>
        <div className="w-8 h-8 rounded-[2px] bg-[#fbf6e9] border border-[#ddcca6] grid place-items-center text-[#8e7139] shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
