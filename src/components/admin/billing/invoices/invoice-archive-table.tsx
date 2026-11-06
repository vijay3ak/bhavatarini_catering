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
      <div className="rounded-xl border border-[#e2d9c8] bg-white p-12 text-center shadow-xs">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#faf8f1] border border-[#d8cfbe] text-[#8a968c] mb-4">
          <FileX className="w-7 h-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-[#123c2c]">
          No Invoices Found
        </h3>
        <p className="text-xs text-[#69746a] max-w-md mx-auto mt-1 mb-5">
          No archived invoices match your active search terms or filter selection. Try clearing or relaxing your filter criteria.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#d8cfbe] rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters &amp; Show All</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e2d9c8] bg-white shadow-xs overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (>= md)                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#faf8f1] border-b border-[#e2d9c8] text-[#5a685e] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-semibold">Invoice No</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold">Billing Period</th>
              <th className="py-3 px-4 font-semibold">Invoice Date</th>
              <th className="py-3 px-4 font-semibold text-right">Billable Qty</th>
              <th className="py-3 px-4 font-semibold text-right">Rate</th>
              <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0e9dc]">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-[#faf8f1]/60 transition-colors group"
              >
                {/* 1. Invoice No */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#123c2c]/10 text-[#123c2c] flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold font-mono text-[#123c2c] text-xs">
                        {inv.billNo}
                      </span>
                      {inv.paymentReference && (
                        <p className="text-[10px] text-[#8a968c] font-mono truncate max-w-[130px]" title={inv.paymentReference}>
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
                    <p className="text-[10px] text-[#69746a]">
                      {formatDateDisplay(inv.startDate)} to {formatDateDisplay(inv.endDate)}
                    </p>
                  </div>
                </td>

                {/* 4. Invoice Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-[#17271e] font-medium">
                  {formatDateDisplay(inv.invoiceDate)}
                </td>

                {/* 5. Total Billable Qty */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="font-bold text-[#123c2c] text-xs">
                    {inv.kpis.totalBillQty.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-[#69746a] block">
                    meals ({inv.kpis.totalDays}d)
                  </span>
                </td>

                {/* 6. Rate */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="font-medium text-[#17271e]">
                    ₹{inv.rate.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#8a968c] block">
                    / meal
                  </span>
                </td>

                {/* 7. Total Amount */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span className="font-bold font-serif text-[#123c2c] text-sm">
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#d8cfbe] rounded-md transition-colors"
                    title="View archived invoice details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
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
          <div key={inv.id} className="p-4 space-y-3">
            {/* Header: Bill No & Status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#123c2c]" />
                <span className="font-mono font-bold text-xs text-[#123c2c]">
                  {inv.billNo}
                </span>
              </div>
              <InvoiceStatusBadge status={inv.status} size="sm" />
            </div>

            {/* Customer info */}
            <div>
              <p className="font-bold text-xs text-[#17271e]">
                {inv.customer.name}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#69746a] mt-0.5">
                <span className="font-semibold text-[#8e7139]">
                  {inv.customer.shortCode}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#8a968c]" />
                  {inv.unitLocation}
                </span>
              </div>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#faf8f1] border border-[#f0e9dc] text-[11px]">
              <div>
                <span className="text-[#69746a] block text-[10px] uppercase">
                  Period
                </span>
                <span className="font-semibold text-[#17271e]">
                  {inv.month} {inv.year}
                </span>
              </div>
              <div>
                <span className="text-[#69746a] block text-[10px] uppercase">
                  Invoice Date
                </span>
                <span className="font-semibold text-[#17271e]">
                  {formatDateDisplay(inv.invoiceDate)}
                </span>
              </div>
              <div>
                <span className="text-[#69746a] block text-[10px] uppercase">
                  Billable Qty
                </span>
                <span className="font-bold text-[#123c2c]">
                  {inv.kpis.totalBillQty.toLocaleString("en-IN")} meals
                </span>
              </div>
              <div>
                <span className="text-[#69746a] block text-[10px] uppercase">
                  Total Amount
                </span>
                <span className="font-bold font-serif text-[#123c2c] text-xs">
                  {formatINR(inv.kpis.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Ref if present */}
            {inv.paymentReference && (
              <p className="text-[10px] text-[#8a968c] font-mono truncate">
                Ref: {inv.paymentReference} • Paid on {formatDateDisplay(inv.paymentDate || "")}
              </p>
            )}

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#69746a]">
                Rate: ₹{inv.rate.toFixed(2)} / meal
              </span>
              <button
                type="button"
                onClick={() => onViewInvoice?.(inv)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#d8cfbe] rounded-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Invoice</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
