"use client";

import React from "react";
import {
  FileText,
  Building2,
  Calendar,
  IndianRupee,
  Eye,
  FileX,
  RotateCcw,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import type { ArchivedInvoice } from "@/types/billing";
import { formatINR, formatDateDisplay } from "@/lib/utils/billing-calculations";
import { InvoiceStatusBadge } from "./invoice-status-badge";

interface InvoiceArchiveTableProps {
  invoices: ArchivedInvoice[];
  onResetFilters: () => void;
  onViewInvoice?: (invoice: ArchivedInvoice) => void;
}

export function InvoiceArchiveTable({
  invoices,
  onResetFilters,
  onViewInvoice,
}: InvoiceArchiveTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-12 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#faf7ef] border border-[#dcd0b5] text-[#8e7139] mb-4">
          <FileX className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#123c2c] m-0">
          No Invoices Found
        </h3>
        <p className="text-xs text-[#69746a] max-w-md mx-auto mt-1 mb-5">
          No archived invoices match your active search terms or filter selection. Try clearing or relaxing your filter criteria.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#dcd0b5] rounded-[2px] transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
          <span>Reset Filters &amp; Show All</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] shadow-xs overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (>= md)                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f4eee1] border-b border-[#dcd0b5] text-[#5c685e] uppercase tracking-wider text-[10.5px] font-bold">
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Billing Period</th>
              <th className="py-3 px-4">Invoice Date</th>
              <th className="py-3 px-4 text-right">Billable Qty</th>
              <th className="py-3 px-4 text-right">Rate</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0e9dc]">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-[#faf7ef] transition-colors group"
              >
                {/* 1. Invoice No */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[2px] bg-[#faf7ef] text-[#123c2c] border border-[#dcd0b5] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-[#8e7139]" />
                    </div>
                    <div>
                      <span className="font-bold font-mono text-[#123c2c] text-xs">
                        {inv.billNo}
                      </span>
                      {inv.paymentReference && (
                        <p className="text-[10px] text-[#69746a] font-mono truncate max-w-[130px] m-0" title={inv.paymentReference}>
                          Ref: {inv.paymentReference}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Customer */}
                <td className="py-3.5 px-4">
                  <div>
                    <span className="font-bold text-[#17271e] block truncate max-w-[190px]" title={inv.customer.name}>
                      {inv.customer.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#69746a] mt-0.5">
                      <span className="font-semibold text-[#8e7139]">
                        {inv.customer.shortCode}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]" title={inv.unitLocation}>
                        {inv.unitLocation}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 3. Billing Period */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div>
                    <span className="font-semibold text-[#17271e]">
                      {inv.month} {inv.year}
                    </span>
                    <p className="text-[10.5px] text-[#69746a] m-0">
                      {formatDateDisplay(inv.startDate)} to {formatDateDisplay(inv.endDate)}
                    </p>
                  </div>
                </td>

                {/* 4. Invoice Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-[#17271e] font-medium font-mono">
                  {formatDateDisplay(inv.invoiceDate)}
                </td>

                {/* 5. Total Billable Qty */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="font-bold font-mono text-[#123c2c] text-xs">
                    {inv.kpis.totalBillQty.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-[#69746a] block">
                    meals
                  </span>
                </td>

                {/* 6. Rate */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-xs font-semibold text-[#17271e]">
                  ₹{inv.rate.toFixed(2)}
                </td>

                {/* 7. Total Amount */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="font-bold font-mono text-[#123c2c] text-xs">
                    {formatINR(inv.kpis.totalAmount)}
                  </span>
                </td>

                {/* 8. Status */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <InvoiceStatusBadge status={inv.status} size="sm" />
                </td>

                {/* 9. Actions */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewInvoice?.(inv)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#123c2c] bg-[#faf7ef] hover:bg-[#123c2c] hover:text-[#faf8f1] border border-[#dcd0b5] rounded-[2px] transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE CARD VIEW (< md)                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden divide-y divide-[#f0e9dc]">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-4 space-y-3 bg-[#ffffff]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-xs text-[#123c2c]">
                  {inv.billNo}
                </span>
                <h4 className="font-serif font-bold text-sm text-[#17271e] mt-0.5 m-0">
                  {inv.customer.name}
                </h4>
                <p className="text-[11px] text-[#69746a] m-0">
                  Unit: {inv.unitLocation}
                </p>
              </div>
              <InvoiceStatusBadge status={inv.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#f0e9dc]">
              <div>
                <span className="text-[10px] text-[#69746a] uppercase font-semibold">Period</span>
                <p className="font-medium text-[#17271e] m-0">{inv.month} {inv.year}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#69746a] uppercase font-semibold">Date</span>
                <p className="font-mono text-[#17271e] m-0">{formatDateDisplay(inv.invoiceDate)}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#69746a] uppercase font-semibold">Meals / Rate</span>
                <p className="font-mono text-[#17271e] m-0">
                  {inv.kpis.totalBillQty} @ ₹{inv.rate.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#69746a] uppercase font-semibold">Total</span>
                <p className="font-mono font-bold text-[#123c2c] m-0">
                  {formatINR(inv.kpis.totalAmount)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewInvoice?.(inv)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#123c2c] bg-[#faf7ef] hover:bg-[#123c2c] hover:text-[#faf8f1] border border-[#dcd0b5] rounded-[2px] transition-colors"
            >
              <span>Inspect Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
