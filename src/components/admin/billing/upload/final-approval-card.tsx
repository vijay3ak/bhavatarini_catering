"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  X,
  FileCheck2,
  CalendarCheck,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  ExternalLink,
} from "lucide-react";
import type {
  DailyBillingEntry,
  ReconciliationComparisonRow,
  FinalApprovalSummaryMetrics,
  BeforeAfterPreviewRow,
  AppliedRosterOperation,
  BillingKpiSummary,
} from "@/types/billing";
import {
  formatDateDisplay,
  formatINR,
} from "@/lib/utils/billing-calculations";
import {
  computeFinalApprovalMetrics,
  buildBeforeAfterPreview,
} from "@/lib/services/billing-session-store";

interface FinalApprovalCardProps {
  reconciliationRows: ReconciliationComparisonRow[];
  currentCalendar: DailyBillingEntry[];
  customerName?: string;
  monthName?: string;
  year?: number;
  rate?: number;
  isApplied: boolean;
  appliedKpis?: BillingKpiSummary | null;
  updatedCalendar?: DailyBillingEntry[];
  onApplyToSession: () => void;
  onUndoApplication: () => void;
}

export function FinalApprovalCard({
  reconciliationRows,
  currentCalendar,
  customerName = "HYDAC INDIA PVT LTD",
  monthName = "November",
  year = 2026,
  rate = 48.0,
  isApplied,
  appliedKpis,
  updatedCalendar = [],
  onApplyToSession,
  onUndoApplication,
}: FinalApprovalCardProps) {
  // Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Search & Filter State for Before-and-After Table
  const [searchQuery, setSearchQuery] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("ALL");

  // Dynamically compute metrics from current reconciliation decisions
  const metrics = useMemo<FinalApprovalSummaryMetrics>(() => {
    return computeFinalApprovalMetrics(reconciliationRows);
  }, [reconciliationRows]);

  // Build before-and-after preview rows
  const beforeAfterRows = useMemo<BeforeAfterPreviewRow[]>(() => {
    return buildBeforeAfterPreview(reconciliationRows);
  }, [reconciliationRows]);

  // Filtered rows for Before-and-After Table
  const filteredBeforeAfterRows = useMemo(() => {
    return beforeAfterRows.filter((row) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const dateMatch = row.date.toLowerCase().includes(q);
        const dayMatch = row.dayName.toLowerCase().includes(q);
        const displayMatch = formatDateDisplay(row.date).toLowerCase().includes(q);
        if (!dateMatch && !dayMatch && !displayMatch) return false;
      }

      if (operationFilter !== "ALL") {
        if (row.operation !== operationFilter) return false;
      }

      return true;
    });
  }, [beforeAfterRows, searchQuery, operationFilter]);

  // Net variance across all proposed changes
  const netVariance = useMemo(() => {
    return beforeAfterRows.reduce((sum, r) => sum + r.varianceQty, 0);
  }, [beforeAfterRows]);

  const canApply = reconciliationRows.length > 0 && metrics.unresolvedCount === 0;

  return (
    <div className="space-y-6 pt-6 border-t-2 border-[#c7a45b]/40" id="final-approval-section">
      {/* Main Approval Header */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[4px] border-t-[#123c2c] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#997b3e] text-xs font-bold uppercase tracking-wider mb-1">
              <FileCheck2 className="w-4 h-4 text-[#c7a45b]" />
              <span>Phase 3C • Step 3C Final Approval</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#123c2c] m-0">
              Reconciliation Approval &amp; Active Session Application
            </h2>
            <p className="text-[#69746a] text-sm leading-relaxed mt-1 max-w-2xl">
              Review approved daily meal quantities before applying them to the current monthly billing session. All updates are held in memory until you choose to save the draft.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-[2px] bg-[#faf8f2] border border-[#e2d8c3] text-xs text-[#123c2c]">
              <span className="text-[#69746a]">Target Customer: </span>
              <strong>{customerName}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-[2px] bg-[#faf8f2] border border-[#e2d8c3] text-xs text-[#123c2c]">
              <span className="text-[#69746a]">Billing Period: </span>
              <strong>{monthName} {year}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Final Approval Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Total Evaluated */}
        <div className="p-3 rounded-[2px] bg-[#fffefa] border border-[#e2d8c3] text-center">
          <span className="block text-[11px] text-[#69746a] uppercase font-semibold">
            Evaluated
          </span>
          <span className="text-xl font-serif font-bold text-[#123c2c]">
            {metrics.totalDatesEvaluated}
          </span>
          <span className="block text-[10px] text-[#997b3e] mt-0.5">Total Dates</span>
        </div>

        {/* New Approved */}
        <div className="p-3 rounded-[2px] bg-[#eef8f2] border border-[#2e7d32]/30 text-center">
          <span className="block text-[11px] text-[#2e7d32] uppercase font-semibold">
            New Dates
          </span>
          <span className="text-xl font-serif font-bold text-[#1b5e20]">
            {metrics.newApprovedCount}
          </span>
          <span className="block text-[10px] text-[#2e7d32]/80 mt-0.5">Approved</span>
        </div>

        {/* Retained */}
        <div className="p-3 rounded-[2px] bg-[#f0f7f3] border border-[#123c2c]/30 text-center">
          <span className="block text-[11px] text-[#123c2c] uppercase font-semibold">
            Retained
          </span>
          <span className="text-xl font-serif font-bold text-[#123c2c]">
            {metrics.existingRetainedCount}
          </span>
          <span className="block text-[10px] text-[#69746a] mt-0.5">Unchanged</span>
        </div>

        {/* Conflicts Accepted */}
        <div className="p-3 rounded-[2px] bg-amber-50 border border-amber-300 text-center">
          <span className="block text-[11px] text-amber-900 uppercase font-semibold">
            Conflicts
          </span>
          <span className="text-xl font-serif font-bold text-amber-900">
            {metrics.conflictsAcceptedCount}
          </span>
          <span className="block text-[10px] text-amber-700 mt-0.5">Scan Accepted</span>
        </div>

        {/* Duplicates Resolved */}
        <div className="p-3 rounded-[2px] bg-purple-50 border border-purple-300 text-center">
          <span className="block text-[11px] text-purple-900 uppercase font-semibold">
            Duplicates
          </span>
          <span className="text-xl font-serif font-bold text-purple-900">
            {metrics.duplicatesResolvedCount}
          </span>
          <span className="block text-[10px] text-purple-700 mt-0.5">Resolved</span>
        </div>

        {/* Merged */}
        <div className="p-3 rounded-[2px] bg-[#f5eedf] border border-[#c7a45b] text-center">
          <span className="block text-[11px] text-[#123c2c] uppercase font-semibold">
            Merged
          </span>
          <span className="text-xl font-serif font-bold text-[#123c2c]">
            {metrics.recordsMergedCount}
          </span>
          <span className="block text-[10px] text-[#997b3e] mt-0.5">Shift Sum</span>
        </div>

        {/* Skipped */}
        <div className="p-3 rounded-[2px] bg-stone-100 border border-stone-300 text-center">
          <span className="block text-[11px] text-stone-700 uppercase font-semibold">
            Skipped
          </span>
          <span className="text-xl font-serif font-bold text-stone-800">
            {metrics.recordsSkippedCount}
          </span>
          <span className="block text-[10px] text-stone-500 mt-0.5">Omitted</span>
        </div>

        {/* Unresolved */}
        <div
          className={`p-3 rounded-[2px] border text-center transition-all ${
            metrics.unresolvedCount > 0
              ? "bg-rose-50 border-rose-300 animate-pulse"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <span
            className={`block text-[11px] uppercase font-semibold ${
              metrics.unresolvedCount > 0 ? "text-rose-900" : "text-emerald-800"
            }`}
          >
            Pending
          </span>
          <span
            className={`text-xl font-serif font-bold ${
              metrics.unresolvedCount > 0 ? "text-rose-900" : "text-emerald-900"
            }`}
          >
            {metrics.unresolvedCount}
          </span>
          <span className="block text-[10px] text-[#69746a] mt-0.5">
            {metrics.unresolvedCount > 0 ? "Needs Action" : "Ready ✓"}
          </span>
        </div>
      </div>

      {/* Validation Status Notice */}
      {!isApplied && (
        <div
          className={`p-4 rounded-[2px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
            canApply
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
              : "bg-amber-50 border-amber-300 text-amber-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {canApply ? (
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {canApply
                  ? "All Decisions Approved & Verified"
                  : `Action Required: ${metrics.unresolvedCount} Decisions Still Pending`}
              </h4>
              <p className="text-xs mt-0.5 text-[#69746a]">
                {canApply
                  ? `Net meal variance across active session will be ${
                      netVariance > 0 ? `+${netVariance}` : netVariance
                    } meals. Ready to apply to current billing session.`
                  : "Every conflict and duplicate record must have an explicit resolution before applying."}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-apply-to-session"
            disabled={!canApply}
            onClick={() => setIsConfirmModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[2px] font-bold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed bg-[#123c2c] hover:bg-[#1a4a38] text-[#fdfaf0] border border-[#0d281e]"
          >
            <CalendarCheck className="w-4 h-4 text-[#c7a45b]" />
            <span>Apply to Active Billing Session</span>
          </button>
        </div>
      )}

      {/* Completion View & Live Recomputed KPIs (Rendered once applied) */}
      {isApplied && (
        <div className="p-6 rounded-[2px] bg-emerald-50 border-2 border-emerald-500 shadow-sm space-y-4" id="completion-summary-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Applied In-Session Only
                  </span>
                  <span className="text-xs text-emerald-800 font-medium">
                    Not permanently saved until &quot;Save Draft&quot; is clicked
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#123c2c] mt-0.5">
                  Ledger Reconciled &amp; Applied Successfully!
                </h3>
              </div>
            </div>

            {/* Completion Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-undo-application"
                onClick={onUndoApplication}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-[2px] transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                <span>Undo Application</span>
              </button>

              <Link
                href="/admin/billing"
                id="btn-navigate-to-billing"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#fdfaf0] bg-[#123c2c] hover:bg-[#1a4a38] border border-[#0d281e] rounded-[2px] transition-colors shadow-xs"
              >
                <span>View Monthly Billing &amp; Invoice</span>
                <ArrowRight className="w-4 h-4 text-[#c7a45b]" />
              </Link>
            </div>
          </div>

          {/* Recomputed Live KPIs */}
          {appliedKpis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-white rounded-[2px] border border-emerald-200">
                <span className="text-[11px] text-[#69746a] block">Total Calendar Days</span>
                <span className="text-lg font-serif font-bold text-[#123c2c]">
                  {appliedKpis.totalDays} Days
                </span>
              </div>
              <div className="p-3 bg-white rounded-[2px] border border-emerald-200">
                <span className="text-[11px] text-[#69746a] block">Recomputed Bill Quantity</span>
                <span className="text-lg font-mono font-bold text-[#123c2c]">
                  {appliedKpis.totalBillQty.toLocaleString("en-IN")} meals
                </span>
              </div>
              <div className="p-3 bg-white rounded-[2px] border border-emerald-200">
                <span className="text-[11px] text-[#69746a] block">Billing Rate</span>
                <span className="text-lg font-mono font-bold text-[#997b3e]">
                  ₹{appliedKpis.rate.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-[2px] border border-emerald-200">
                <span className="text-[11px] text-[#69746a] block">Recomputed Invoice Total</span>
                <span className="text-lg font-serif font-bold text-[#123c2c]">
                  {formatINR(appliedKpis.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Before-and-After Change Review Table */}
      <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-hidden" id="before-after-preview-table">
        <div className="p-4 border-b border-[#f0e9dc] bg-[#faf8f2] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#123c2c] m-0">
              Before &amp; After Roster Audit Log
            </h3>
            <p className="text-xs text-[#69746a] mt-0.5">
              Transparent side-by-side comparison of current calendar entries vs proposed reconciled meal quantities.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-[#997b3e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search date..."
                className="w-full pl-9 pr-3 py-1 text-xs bg-white border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c]"
              />
            </div>

            <select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              className="py-1 px-2 text-xs bg-white border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c]"
            >
              <option value="ALL">All Operations ({beforeAfterRows.length})</option>
              <option value="REPLACE">Replaced ({beforeAfterRows.filter((r) => r.operation === "REPLACE").length})</option>
              <option value="MERGE">Merged ({beforeAfterRows.filter((r) => r.operation === "MERGE").length})</option>
              <option value="ADD">Added ({beforeAfterRows.filter((r) => r.operation === "ADD").length})</option>
              <option value="RETAIN">Retained ({beforeAfterRows.filter((r) => r.operation === "RETAIN").length})</option>
              <option value="SKIP">Skipped ({beforeAfterRows.filter((r) => r.operation === "SKIP").length})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#123c2c] text-[#fdfaf0] border-b border-[#c7a45b]/40 font-serif">
                <th className="py-2.5 px-3 font-semibold text-[11px] whitespace-nowrap">
                  Date &amp; Day
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">
                  Current Roster Meals
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px]">
                  Proposed Reconciled Meals
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px] text-center whitespace-nowrap">
                  Current Bill Qty
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px] text-center whitespace-nowrap">
                  Proposed Bill Qty
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px] text-center whitespace-nowrap">
                  Variance
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px] whitespace-nowrap">
                  Decision
                </th>
                <th className="py-2.5 px-3 font-semibold text-[11px] text-right whitespace-nowrap">
                  Proposed Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9dc]">
              {filteredBeforeAfterRows.map((row) => (
                <tr
                  key={row.date}
                  className={`hover:bg-[#faf8f2] transition-colors ${
                    row.operation === "REPLACE"
                      ? "bg-amber-50/40"
                      : row.operation === "MERGE"
                      ? "bg-purple-50/40"
                      : row.operation === "ADD"
                      ? "bg-emerald-50/40"
                      : ""
                  }`}
                >
                  {/* Date & Day */}
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#123c2c]">
                    <div className="font-mono font-bold">{formatDateDisplay(row.date)}</div>
                    <div className="text-[11px] text-[#69746a] flex items-center gap-1">
                      <span>{row.dayName}</span>
                      {row.isSunday && (
                        <span className="text-[9px] px-1 bg-stone-200 text-stone-700 rounded-[2px] font-semibold">
                          Sunday
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Current Roster Meals */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs text-[#69746a]">
                      B:{row.existingMeals.breakfast} | L:{row.existingMeals.lunch} | D:{row.existingMeals.dinner}
                    </span>
                    {row.existingMeals.combinedNotation && (
                      <span className="block text-[10px] text-[#997b3e] font-semibold mt-0.5">
                        [{row.existingMeals.combinedNotation}]
                      </span>
                    )}
                  </td>

                  {/* Proposed Meals */}
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-xs font-bold text-[#123c2c]">
                      B:{row.proposedMeals.breakfast} | L:{row.proposedMeals.lunch} | D:{row.proposedMeals.dinner}
                    </span>
                    {row.proposedMeals.combinedNotation && (
                      <span className="block text-[10px] text-[#123c2c] font-semibold bg-[#f5eedf] px-1 py-0.2 rounded-[2px] border border-[#c7a45b] mt-0.5 w-fit">
                        {row.proposedMeals.combinedNotation}
                      </span>
                    )}
                  </td>

                  {/* Current Bill Qty */}
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-[#69746a]">
                    {row.existingBillQty}
                  </td>

                  {/* Proposed Bill Qty */}
                  <td className="py-2.5 px-3 text-center font-mono text-xs font-bold text-[#123c2c]">
                    {row.proposedBillQty}
                  </td>

                  {/* Variance */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {row.varianceQty === 0 ? (
                      <span className="font-mono text-xs text-stone-400 font-semibold">0</span>
                    ) : row.varianceQty > 0 ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                        +{row.varianceQty}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-xs font-mono font-bold bg-rose-100 text-rose-800">
                        {row.varianceQty}
                      </span>
                    )}
                  </td>

                  {/* Decision */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-semibold text-[#123c2c]">
                      {row.decision === "ACCEPT_EXTRACTED"
                        ? "Accept Scan"
                        : row.decision === "KEEP_EXISTING"
                        ? "Keep Roster"
                        : row.decision === "USE_MERGED"
                        ? "Merged Shifts"
                        : row.decision === "SKIP"
                        ? "Skip / Omit"
                        : "Pending Review"}
                    </span>
                  </td>

                  {/* Operation Badge */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {row.operation === "ADD" ? (
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Add New
                      </span>
                    ) : row.operation === "REPLACE" ? (
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Replace Conflict
                      </span>
                    ) : row.operation === "MERGE" ? (
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        Merge Slips
                      </span>
                    ) : row.operation === "RETAIN" ? (
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                        Retain Existing
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        Skip / Omit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#fffefa] border border-[#c7a45b] rounded-[2px] shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#123c2c] text-[#fdfaf0] border-b border-[#c7a45b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c7a45b]" />
                <h3 className="font-serif text-base font-bold text-[#f5eedf]">
                  Confirm Application to Active Billing Session
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 text-[#fdfaf0]/70 hover:text-[#fdfaf0] rounded-[2px] hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#69746a] leading-relaxed">
                You are about to apply approved reconciliation decisions to the active billing session for{" "}
                <strong className="text-[#123c2c]">{customerName}</strong> ({monthName} {year}).
              </p>

              {/* Action Summary Highlights */}
              <div className="p-3.5 rounded-[2px] bg-[#fbf9f4] border border-[#e5ddcd] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#69746a]">New Dates to Add:</span>
                  <span className="font-bold text-[#1b5e20]">{metrics.newApprovedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#69746a]">Conflicts to Replace:</span>
                  <span className="font-bold text-amber-900">{metrics.conflictsAcceptedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#69746a]">Duplicate Slips Merged:</span>
                  <span className="font-bold text-purple-900">{metrics.recordsMergedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#69746a]">Existing Dates Retained:</span>
                  <span className="font-bold text-[#123c2c]">{metrics.existingRetainedCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e5ddcd] font-bold">
                  <span className="text-[#123c2c]">Net Meal Variance:</span>
                  <span className="font-mono text-sm text-[#123c2c]">
                    {netVariance > 0 ? `+${netVariance}` : netVariance} meals
                  </span>
                </div>
              </div>

              {/* Scope Safety Clarification */}
              <div className="p-3 rounded-[2px] bg-amber-50/80 border border-amber-300 text-[11px] text-amber-950 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Notice:</strong> Changes will be staged to your active in-memory session. Your browser&apos;s saved draft will <strong>not</strong> be modified until you explicitly click &quot;Save Draft&quot; on the Monthly Billing page.
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#faf8f2] border-t border-[#e2d8c3] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#69746a] hover:text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-apply-modal"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  onApplyToSession();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#fdfaf0] bg-[#123c2c] hover:bg-[#1a4a38] rounded-[2px] transition-colors shadow-xs"
              >
                <Check className="w-4 h-4 text-[#c7a45b]" />
                <span>Confirm &amp; Apply Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
