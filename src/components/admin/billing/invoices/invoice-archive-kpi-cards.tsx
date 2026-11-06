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
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-4 shadow-xs flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#69746a] uppercase tracking-wider">
            Total Invoices
          </p>
          <p className="text-2xl font-bold font-serif text-[#123c2c] mt-1">
            {metrics.totalInvoices}
          </p>
          <p className="text-[11px] text-[#69746a] mt-0.5">
            Across {metrics.customerCount} corporate clients
          </p>
        </div>
        <div className="rounded-lg bg-[#123c2c]/10 text-[#123c2c] p-2.5 border border-[#123c2c]/20">
          <FileText className="h-4 w-4" />
        </div>
      </div>

      {/* 2. Total Invoiced Value */}
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-4 shadow-xs flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#69746a] uppercase tracking-wider">
            Total Invoiced Value
          </p>
          <p className="text-2xl font-bold font-serif text-[#123c2c] mt-1">
            {formatINR(metrics.totalInvoicedValue)}
          </p>
          <p className="text-[11px] text-[#69746a] mt-0.5">
            Cumulative billing total
          </p>
        </div>
        <div className="rounded-lg bg-[#c7a45b]/15 text-[#997b3e] p-2.5 border border-[#c7a45b]/30">
          <IndianRupee className="h-4 w-4" />
        </div>
      </div>

      {/* 3. Paid Invoices */}
      <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-xs flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Paid Invoices
          </p>
          <p className="text-2xl font-bold font-serif text-emerald-950 mt-1">
            {metrics.paidCount}{" "}
            <span className="text-xs font-normal text-emerald-700 font-sans">
              ({formatINR(metrics.paidValue)})
            </span>
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Settled via corporate transfer
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 text-emerald-700 p-2.5 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      </div>

      {/* 4. Pending Invoices */}
      <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-xs flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Pending Invoices
          </p>
          <p className="text-2xl font-bold font-serif text-amber-950 mt-1">
            {metrics.pendingCount}{" "}
            <span className="text-xs font-normal text-amber-700 font-sans">
              ({formatINR(metrics.pendingValue)})
            </span>
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Awaiting corporate credit cycle
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 text-amber-700 p-2.5 border border-amber-200">
          <Clock className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
