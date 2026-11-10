"use client";

import React from "react";
import {
  ArrowLeft,
  Printer,
  FileDown,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { CorporateCustomer } from "@/types/admin";
import { DailyBillingEntry, BillingKpiSummary, BillingRateSource } from "@/types/billing";
import { formatDateDisplay, formatINR } from "@/lib/utils/billing-calculations";

interface InvoicePreviewProps {
  customer: CorporateCustomer;
  billNo: string;
  month: number | string;
  year: number;
  startDate: string;
  endDate: string;
  invoiceDate: string;
  unitLocation: string;
  rate: number;
  rateSource: BillingRateSource;
  entries: DailyBillingEntry[];
  kpis: BillingKpiSummary;
  onBackToEdit: () => void;
  backButtonLabel?: string;
  statusBadge?: React.ReactNode;
  onIssueInvoice?: () => void;
  isIssuing?: boolean;
  isIssued?: boolean;
}

export function InvoicePreview({
  customer,
  billNo,
  month,
  year,
  startDate,
  endDate,
  invoiceDate,
  unitLocation,
  rate,
  rateSource,
  entries,
  kpis,
  onBackToEdit,
  backButtonLabel = "Back to Daily Ledger",
  statusBadge,
  onIssueInvoice,
  isIssuing = false,
  isIssued = false,
}: InvoicePreviewProps) {
  const [layoutMode, setLayoutMode] = React.useState<"AUTO" | "1-PAGE" | "2-PAGE">("AUTO");

  const handlePrint = () => {
    window.print();
  };

  // Intentional A4 Pagination Logic:
  // Invoices with > 18 entries default to 2-page balanced layout unless 1-PAGE compact is chosen.
  const isMultiPage =
    layoutMode === "1-PAGE" ? false : layoutMode === "2-PAGE" ? true : entries.length > 18;
  const splitIndex = isMultiPage ? Math.ceil(entries.length / 2) : entries.length;
  const page1Entries = entries.slice(0, splitIndex);
  const page2Entries = isMultiPage ? entries.slice(splitIndex) : [];

  // Reusable 5-Column Table Header
  const TableHeader = () => (
    <thead>
      <tr className="bg-[#f5f5f5] text-black border-b-[1.5px] border-black font-bold text-[11px]">
        <th className="w-10 px-2 py-1.5 text-center border-r border-black">
          SL.NO
        </th>
        <th className="w-24 px-2 py-1.5 text-center border-r border-black">
          DATE
        </th>
        <th className="w-20 px-2 py-1.5 text-right border-r border-black pr-3">
          QUANTITY
        </th>
        <th className="px-3 py-1.5 border-r border-black text-left">
          PARTICULARS
        </th>
        <th className="w-28 px-3 py-1.5 text-right font-bold text-black">
          AMOUNT (₹)
        </th>
      </tr>
    </thead>
  );

  // Reusable Table Rows Renderer
  const renderRows = (rowEntries: DailyBillingEntry[], startIndex: number) => {
    if (rowEntries.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="py-8 text-center text-neutral-500 italic">
            No billing records to display.
          </td>
        </tr>
      );
    }

    return rowEntries.map((entry, idx) => {
      const dailyAmt = entry.billQty * rate;
      const globalIndex = startIndex + idx + 1;

      return (
        <tr
          key={entry.id}
          className="hover:bg-neutral-50 print:hover:bg-transparent border-b border-neutral-300 break-inside-avoid page-break-inside-avoid"
        >
          <td className="px-2 py-1 text-center font-mono text-[10.5px] border-r border-black text-neutral-600">
            {globalIndex}
          </td>
          <td className="px-2 py-1 text-center font-mono text-[10.5px] border-r border-black text-black">
            {formatDateDisplay(entry.dateString)}
          </td>
          <td className="px-2 py-1 text-right font-mono font-bold border-r border-black pr-3 text-black">
            {entry.billQty}
          </td>
          <td className="px-3 py-1 border-r border-black text-black">
            <span className="font-semibold">{entry.combinedNotation || entry.particulars}</span>
            {entry.remarks ? (
              <span className="text-[10px] text-neutral-600 ml-1.5 italic">
                ({entry.remarks})
              </span>
            ) : null}
          </td>
          <td className="px-3 py-1 text-right font-mono font-semibold text-black">
            {dailyAmt.toFixed(2)}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* 1. Preview Screen Toolbar (Hidden on print) */}
      <div className="print:hidden rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#dcd0b5] bg-[#faf7ef] hover:bg-[#eee7d7] px-3 py-1.5 text-xs font-bold text-[#123c2c] transition-colors cursor-pointer shadow-xs"
            title="Return to previous view"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backButtonLabel}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-foreground">
                Invoice Preview &amp; Print Layout
              </h3>
              <span className="rounded-[2px] bg-[#faf7ef] px-2.5 py-0.5 text-xs font-bold text-[#123c2c] border border-[#dcd0b5]">
                {isMultiPage ? "2-Page Balanced Monthly Format" : "1-Page Standard Format"}
              </span>
              {statusBadge}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>
                Total: {formatINR(kpis.totalAmount)} ({kpis.totalBillQty.toLocaleString("en-IN")} meals) • Rate: ₹{rate.toFixed(2)} / meal
              </span>
            </p>
          </div>
        </div>

        {/* Layout Mode Toggle + Print / Save Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Page vs 2-Page Layout Toggle */}
          <div className="inline-flex items-center rounded-[2px] border border-[#dcd0b5] bg-[#f4eee1] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode("2-PAGE")}
              className={`px-3 py-1 rounded-[2px] font-semibold transition-colors ${
                isMultiPage
                  ? "bg-[#123c2c] text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Split long monthly records across 2 balanced A4 pages"
            >
              2-Page Balanced
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("1-PAGE")}
              className={`px-3 py-1 rounded-[2px] font-semibold transition-colors ${
                !isMultiPage
                  ? "bg-[#123c2c] text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Display all records on a single compact page"
            >
              1-Page Compact
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#dcd0b5] bg-[#ffffff] hover:bg-[#faf7ef] px-3.5 py-1.5 text-xs font-bold text-[#123c2c] transition-colors cursor-pointer shadow-xs"
            title="Save invoice as PDF via browser print destination"
          >
            <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
            Save as PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#123c2c] hover:bg-[#1a4a38] px-4 py-2 text-xs font-bold text-[#faf8f1] shadow-xs transition-colors cursor-pointer"
            title="Trigger native browser print dialog"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Invoice
          </button>

          {onIssueInvoice && !isIssued && (
            <button
              type="button"
              onClick={onIssueInvoice}
              disabled={isIssuing}
              className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#c7a45b] hover:bg-[#b59249] disabled:opacity-50 text-[#123c2c] px-4 py-2 text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
              title="Issue official invoice, assign sequence number, and lock against changes"
            >
              {isIssuing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Issuing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Issue &amp; Finalize Invoice</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Paper Canvas Backdrop (Displays both sheets on screen, prints cleanly as separate pages) */}
      <div className="rounded-xl border border-border/80 bg-[#28362f] p-3 sm:p-6 md:p-8 overflow-x-auto flex flex-col items-center gap-8 shadow-inner print:bg-transparent print:p-0 print:border-none print:shadow-none print:gap-0 print:overflow-visible print:block">
        
        {/* ==================================================================== */}
        {/* PAGE 1 SHEET */}
        {/* ==================================================================== */}
        <div
          id="invoice-page-1"
          className={`invoice-page-sheet bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 md:p-10 shadow-2xl relative font-sans text-xs leading-normal box-border print:p-0 print:shadow-none print:w-full print:max-w-full print:min-h-0 print:h-auto print:overflow-visible ${
            isMultiPage ? "print-page-break" : ""
          }`}
        >
          {/* Double Border Frame */}
          <div className="border-2 border-black p-1 h-full flex flex-col box-border print:h-auto print:min-h-0 print:overflow-visible">
            <div className="border border-black h-full flex flex-col justify-between box-border print:h-auto print:min-h-0 print:overflow-visible">
              
              <div>
                {/* Supplier Header */}
                <div className="p-3 text-center border-b-[1.5px] border-black bg-white">
                  <div className="flex justify-between text-[11px] font-bold text-black mb-1">
                    <span>PAN: <strong>BGZPS2638L</strong></span>
                    <span>MOBILE: <strong>88389 13486, 93603 40603</strong></span>
                  </div>
                  <h1 className="font-serif text-xl sm:text-2xl font-black text-[#0b241a] print:text-black tracking-wide uppercase my-1">
                    A.S. Bhavatarini Catering Service
                  </h1>
                  <p className="text-[11px] leading-tight text-neutral-800">
                    16/17, Ayyavu Chettiar Street, Chettipalyam, Coimbatore - 641201
                  </p>
                  <p className="text-[11px] font-bold text-neutral-900 mt-0.5">
                    Email: asbcateringservice@gmail.com
                  </p>
                </div>

                {/* Title Banner */}
                <div className="bg-[#f1f1f1] border-y-[1.5px] border-black py-1.5 px-3 text-center font-bold text-[13px] tracking-wider uppercase text-black">
                  INVOICE / MONTHLY CATERING BILL
                </div>

                {/* Info Grid (Billed To & Invoice Metadata) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 border-b-[1.5px] border-black divide-y sm:divide-y-0 sm:divide-x divide-black text-[11.5px]">
                  {/* Left: Customer Details */}
                  <div className="sm:col-span-7 p-3 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider underline text-neutral-700">
                      TO / BILLED TO:
                    </div>
                    <div className="font-extrabold text-[13px] text-black leading-snug">
                      {customer.name}
                    </div>
                    <div className="text-neutral-800 leading-tight">
                      {customer.billingAddress}
                    </div>
                    <div className="pt-1 flex flex-wrap gap-x-4 text-[11px]">
                      <div>
                        <span className="font-bold">GSTIN: </span>
                        <span className="font-mono">{customer.gstin || "—"}</span>
                      </div>
                      <div>
                        <span className="font-bold">PAN: </span>
                        <span className="font-mono">{customer.pan || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Invoice Metadata */}
                  <div className="sm:col-span-5 p-3 flex flex-col justify-between space-y-1 text-[11px]">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-0.5">
                      <span className="font-bold text-neutral-800">BILL NO:</span>
                      <span className="font-mono font-bold text-black">{billNo || "DRAFT"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-0.5">
                      <span className="font-bold text-neutral-800">DATE:</span>
                      <span className="font-mono text-black">{formatDateDisplay(invoiceDate)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-0.5">
                      <span className="font-bold text-neutral-800">PERIOD:</span>
                      <span className="font-mono text-black">
                        {formatDateDisplay(startDate)} to {formatDateDisplay(endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-neutral-800">UNIT / LOC:</span>
                      <span className="font-semibold text-black uppercase">
                        {unitLocation || customer.deliveryLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table for Page 1 */}
                <div className="w-full">
                  <table className="w-full text-left text-[11px] border-collapse inv-table">
                    <TableHeader />
                    <tbody className="divide-y divide-neutral-300">
                      {renderRows(page1Entries, 0)}
                    </tbody>
                    
                    {/* If single-page invoice, render totals row here */}
                    {!isMultiPage && (
                      <tfoot>
                        <tr className="bg-[#f8f8f8] border-y-[1.5px] border-black font-bold text-[11.5px] inv-totals-row">
                          <td colSpan={2} className="px-2 py-2 text-center border-r border-black tracking-wider text-black">
                            TOTAL
                          </td>
                          <td className="px-2 py-2 text-right border-r border-black pr-3 font-mono font-black text-black">
                            {kpis.totalBillQty.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2 border-r border-black text-black">
                            @ {formatINR(rate)} PER QUANTITY
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-black text-black text-xs">
                            {formatINR(kpis.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Page 1 Bottom Section */}
              {isMultiPage ? (
                // Multi-page continuity footer
                <div className="bg-[#fbfbfb] px-4 py-2 border-t border-black flex items-center justify-between text-[11px] text-neutral-700">
                  <span className="italic font-medium">
                    Daily meal reconciliation continued on Page 2...
                  </span>
                  <span className="font-mono font-semibold text-black">
                    Page 1 of 2
                  </span>
                </div>
              ) : (
                // Single-page complete footer
                <div>
                  <div className="bg-[#fbfbfb] px-3 py-2 border-t border-black text-[11px] inv-words-bar">
                    <span className="font-bold uppercase tracking-wider text-black">
                      Amount in Words:{" "}
                    </span>
                    <span className="italic font-semibold text-black">
                      {kpis.amountInWords}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-black border-t border-black inv-footer-section">
                    <div className="sm:col-span-7 p-3 text-[10.5px] leading-relaxed text-neutral-800 inv-declaration-box">
                      <div className="font-bold underline text-black mb-1">
                        Declaration:
                      </div>
                      <p>
                        We declare that this invoice shows the actual price of the catering services described and that all particulars are true and correct.
                      </p>
                    </div>

                    <div className="sm:col-span-5 p-3 flex flex-col justify-between text-center min-h-[90px] inv-signature-box">
                      <div className="text-[10px] font-bold text-black uppercase tracking-wider">
                        For A.S. BHAVATARINI CATERING SERVICE
                      </div>
                      <div className="pt-8 text-[11px] font-semibold text-neutral-900 border-t border-dotted border-black/40 mx-4">
                        Authorised Signatory
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#fbfbfb] px-4 py-1.5 border-t border-black flex items-center justify-end text-[10px] font-mono text-neutral-500">
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* PAGE 2 SHEET (Rendered only when isMultiPage === true) */}
        {/* ==================================================================== */}
        {isMultiPage && (
          <div
            id="invoice-page-2"
            className="invoice-page-sheet bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-8 md:p-10 shadow-2xl relative font-sans text-xs leading-normal box-border print:p-0 print:shadow-none print:w-full print:max-w-full print:min-h-0 print:h-auto print:overflow-visible"
          >
            {/* Double Border Frame */}
            <div className="border-2 border-black p-1 h-full flex flex-col box-border print:h-auto print:min-h-0 print:overflow-visible">
              <div className="border border-black h-full flex flex-col justify-between box-border print:h-auto print:min-h-0 print:overflow-visible">
                
                <div>
                  {/* Page 2 Continuation Header */}
                  <div className="p-2.5 px-4 border-b-[1.5px] border-black bg-[#fafafa] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px]">
                    <div>
                      <span className="font-serif font-black uppercase tracking-wider text-[#0b241a] text-xs">
                        A.S. Bhavatarini Catering Service
                      </span>
                      <span className="text-neutral-400 mx-2">•</span>
                      <span className="font-semibold text-neutral-800">
                        INVOICE CONTINUATION
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10.5px]">
                      <span>BILL NO: <strong>{billNo || "DRAFT"}</strong></span>
                      <span className="text-neutral-400">|</span>
                      <span>DATE: <strong>{formatDateDisplay(invoiceDate)}</strong></span>
                      <span className="rounded bg-neutral-200 px-1.5 py-0.2 font-bold text-black ml-1">
                        Page 2 of 2
                      </span>
                    </div>
                  </div>

                  {/* Customer Reference Bar */}
                  <div className="bg-white px-4 py-1.5 border-b border-black flex flex-wrap items-center justify-between text-[11px] text-neutral-800">
                    <div>
                      <span className="font-bold text-neutral-600">CLIENT: </span>
                      <strong className="text-black">{customer.name}</strong>
                    </div>
                    <div>
                      <span className="font-bold text-neutral-600">PERIOD: </span>
                      <span className="font-mono">
                        {formatDateDisplay(startDate)} to {formatDateDisplay(endDate)}
                      </span>
                      <span className="text-neutral-400 mx-1.5">|</span>
                      <span className="font-bold text-neutral-600">UNIT: </span>
                      <span className="font-semibold uppercase">
                        {unitLocation || customer.deliveryLocation}
                      </span>
                    </div>
                  </div>

                  {/* Page 2 Table (Repeats exact table header + second half of rows) */}
                  <div className="w-full">
                    <table className="w-full text-left text-[11px] border-collapse inv-table">
                      <TableHeader />
                      <tbody className="divide-y divide-neutral-300">
                        {renderRows(page2Entries, splitIndex)}
                      </tbody>
                      <tfoot>
                        {/* Grand Totals Row */}
                        <tr className="bg-[#f8f8f8] border-y-[1.5px] border-black font-bold text-[11.5px] inv-totals-row">
                          <td colSpan={2} className="px-2 py-2 text-center border-r border-black tracking-wider text-black">
                            TOTAL
                          </td>
                          <td className="px-2 py-2 text-right border-r border-black pr-3 font-mono font-black text-black">
                            {kpis.totalBillQty.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2 border-r border-black text-black">
                            @ {formatINR(rate)} PER QUANTITY
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-black text-black text-xs">
                            {formatINR(kpis.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Amount in Words Bar */}
                  <div className="bg-[#fbfbfb] px-3 py-2 border-b border-black text-[11px] inv-words-bar">
                    <span className="font-bold uppercase tracking-wider text-black">
                      Amount in Words:{" "}
                    </span>
                    <span className="italic font-semibold text-black">
                      {kpis.amountInWords}
                    </span>
                  </div>
                </div>

                {/* Footer Section: Statutory Declaration & Authorized Signatory */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-black border-t border-black inv-footer-section">
                    {/* Declaration Box */}
                    <div className="sm:col-span-7 p-3 text-[10.5px] leading-relaxed text-neutral-800 inv-declaration-box">
                      <div className="font-bold underline text-black mb-1">
                        Declaration:
                      </div>
                      <p>
                        We declare that this invoice shows the actual price of the catering services described and that all particulars are true and correct.
                      </p>
                    </div>

                    {/* Signature Box */}
                    <div className="sm:col-span-5 p-3 flex flex-col justify-between text-center min-h-[95px] inv-signature-box">
                      <div className="text-[10px] font-bold text-black uppercase tracking-wider">
                        For A.S. BHAVATARINI CATERING SERVICE
                      </div>
                      <div className="pt-8 text-[11px] font-semibold text-neutral-900 border-t border-dotted border-black/40 mx-4">
                        Authorised Signatory
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Bottom Indicator */}
                  <div className="bg-[#fbfbfb] px-4 py-1.5 border-t border-black flex items-center justify-end text-[10px] font-mono text-neutral-500">
                    <span>Page 2 of 2</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
