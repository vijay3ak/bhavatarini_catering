"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Filter,
  RotateCcw,
  Check,
  X,
  Calendar,
  Sparkles,
  Info,
  GitCompare,
  AlertCircle,
  Eye,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCheck,
} from "lucide-react";
import type {
  HtrExtractedRecord,
  ReconciliationComparisonRow,
  ReconciliationClassification,
  ReconciliationDecision,
  ReconciliationSummary,
  DailyBillingEntry,
} from "@/types/billing";
import {
  formatDateDisplay,
  calculateRowBillQty,
} from "@/lib/utils/billing-calculations";
import { mergeTwoExtractedRecords } from "@/lib/services/extraction-service";

interface ReconciliationTableProps {
  diffRows: ReconciliationComparisonRow[];
  summary: ReconciliationSummary;
  calendarSourceLabel: string;
  calendarDaysCount: number;
  onUpdateDecision: (rowId: string, decision: ReconciliationDecision) => void;
  onResolveDuplicate: (rowId: string, resolvedRecord: HtrExtractedRecord) => void;
  onResetAllDecisions?: () => void;
}

type FilterClassificationOption = "ALL" | ReconciliationClassification | "NEEDS_DECISION";

export function ReconciliationTable({
  diffRows,
  summary,
  calendarSourceLabel,
  calendarDaysCount,
  onUpdateDecision,
  onResolveDuplicate,
  onResetAllDecisions,
}: ReconciliationTableProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] =
    useState<FilterClassificationOption>("ALL");

  // Duplicate Inspection Modal State
  const [inspectingDuplicateRow, setInspectingDuplicateRow] =
    useState<ReconciliationComparisonRow | null>(null);

  // Filtered Rows
  const filteredRows = useMemo(() => {
    return diffRows.filter((row) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const dateMatch = row.date.toLowerCase().includes(q);
        const displayMatch = formatDateDisplay(row.date).toLowerCase().includes(q);
        const dayMatch = row.dayName.toLowerCase().includes(q);
        const reasonMatch = (row.discrepancyReason || "").toLowerCase().includes(q);
        if (!dateMatch && !displayMatch && !dayMatch && !reasonMatch) {
          return false;
        }
      }

      // 2. Classification filter
      if (classificationFilter !== "ALL") {
        if (classificationFilter === "NEEDS_DECISION") {
          if (row.decision !== "PENDING") return false;
        } else if (row.classification !== classificationFilter) {
          return false;
        }
      }

      return true;
    });
  }, [diffRows, searchQuery, classificationFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || classificationFilter !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setClassificationFilter("ALL");
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#e2d8c3]" id="reconciliation-section">
      {/* Section Header */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#123c2c] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#997b3e] text-xs font-bold uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4 text-[#c7a45b]" />
              <span>Phase 3C • Step 3B Reconciliation Preview</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#123c2c] m-0">
              Billing Calendar Comparison &amp; Conflict Review
            </h2>
            <p className="text-[#69746a] text-sm leading-relaxed mt-1 max-w-2xl">
              Compare AI-extracted daily logs against the active monthly billing roster. Resolve discrepancies, verify duplicate dates, and approve actions before applying to the billing engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#faf8f2] border border-[#e2d8c3] text-xs text-[#123c2c]">
              <span className="text-[#69746a]">Roster Source:</span>
              <span className="font-bold">{calendarSourceLabel}</span>
              <span className="text-[#997b3e] font-mono">({calendarDaysCount} days)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Approval: {summary.pendingDecisionCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. New Dates */}
        <button
          type="button"
          onClick={() =>
            setClassificationFilter(
              classificationFilter === "NEW" ? "ALL" : "NEW"
            )
          }
          className={`p-3.5 rounded-[2px] border text-left transition-all ${
            classificationFilter === "NEW"
              ? "bg-[#eef8f2] border-[#2e7d32] shadow-xs"
              : "bg-[#fffefa] border-[#e2d8c3] hover:border-[#2e7d32]/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#2e7d32] font-semibold mb-1">
            <span>New Dates</span>
            <Plus className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#1b5e20]">
            {summary.newCount}
          </div>
          <div className="text-[11px] text-[#69746a] mt-0.5">
            On scan, empty in roster
          </div>
        </button>

        {/* 2. Exact Match */}
        <button
          type="button"
          onClick={() =>
            setClassificationFilter(
              classificationFilter === "MATCHING" ? "ALL" : "MATCHING"
            )
          }
          className={`p-3.5 rounded-[2px] border text-left transition-all ${
            classificationFilter === "MATCHING"
              ? "bg-[#f0f7f3] border-[#123c2c] shadow-xs"
              : "bg-[#fffefa] border-[#e2d8c3] hover:border-[#123c2c]/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#123c2c] font-semibold mb-1">
            <span>Matching</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#123c2c]">
            {summary.matchingCount}
          </div>
          <div className="text-[11px] text-[#69746a] mt-0.5">
            Quantities match 100%
          </div>
        </button>

        {/* 3. Conflicts */}
        <button
          type="button"
          onClick={() =>
            setClassificationFilter(
              classificationFilter === "CONFLICT" ? "ALL" : "CONFLICT"
            )
          }
          className={`p-3.5 rounded-[2px] border text-left transition-all ${
            classificationFilter === "CONFLICT"
              ? "bg-amber-100/60 border-amber-500 shadow-xs"
              : "bg-[#fffefa] border-[#e2d8c3] hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Conflicts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-900">
            {summary.conflictCount}
          </div>
          <div className="text-[11px] text-[#69746a] mt-0.5">
            Quantities differ
          </div>
        </button>

        {/* 4. Duplicates */}
        <button
          type="button"
          onClick={() =>
            setClassificationFilter(
              classificationFilter === "DUPLICATE" ? "ALL" : "DUPLICATE"
            )
          }
          className={`p-3.5 rounded-[2px] border text-left transition-all ${
            classificationFilter === "DUPLICATE"
              ? "bg-purple-100/60 border-purple-500 shadow-xs"
              : "bg-[#fffefa] border-[#e2d8c3] hover:border-purple-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-800 font-semibold mb-1">
            <span>Duplicates</span>
            <Layers className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-purple-900">
            {summary.duplicateCount}
          </div>
          <div className="text-[11px] text-[#69746a] mt-0.5">
            Multiple logs for same date
          </div>
        </button>

        {/* 5. Missing in Scan */}
        <button
          type="button"
          onClick={() =>
            setClassificationFilter(
              classificationFilter === "MISSING" ? "ALL" : "MISSING"
            )
          }
          className={`p-3.5 rounded-[2px] border text-left transition-all ${
            classificationFilter === "MISSING"
              ? "bg-blue-100/60 border-blue-500 shadow-xs"
              : "bg-[#fffefa] border-[#e2d8c3] hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
            <span>Missing</span>
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-blue-900">
            {summary.missingCount}
          </div>
          <div className="text-[11px] text-[#69746a] mt-0.5">
            In roster, not on scan
          </div>
        </button>

        {/* 6. Needs Decision */}
        <button
          type="button"
          onClick={() =>
            setClassificationFilter(
              classificationFilter === "NEEDS_DECISION" ? "ALL" : "NEEDS_DECISION"
            )
          }
          className={`p-3.5 rounded-[2px] border text-left transition-all ${
            classificationFilter === "NEEDS_DECISION"
              ? "bg-rose-100/60 border-rose-500 shadow-xs"
              : "bg-[#fffefa] border-[#e2d8c3] hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold mb-1">
            <span>Needs Action</span>
            <Clock className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-900">
            {summary.pendingDecisionCount}
          </div>
          <div className="text-[11px] text-[#69746a] mt-0.5">
            Awaiting your review
          </div>
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#997b3e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search date or day..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#997b3e] hover:text-[#123c2c]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Classification Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#997b3e]" />
              <select
                value={classificationFilter}
                onChange={(e) =>
                  setClassificationFilter(e.target.value as FilterClassificationOption)
                }
                className="py-1.5 px-2.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-medium"
              >
                <option value="ALL">All Categories ({diffRows.length})</option>
                <option value="NEEDS_DECISION">
                  Needs Decision ({summary.pendingDecisionCount})
                </option>
                <option value="NEW">New Dates ({summary.newCount})</option>
                <option value="MATCHING">Matching ({summary.matchingCount})</option>
                <option value="CONFLICT">Conflicts ({summary.conflictCount})</option>
                <option value="DUPLICATE">Duplicates ({summary.duplicateCount})</option>
                <option value="MISSING">Missing in Scan ({summary.missingCount})</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#69746a] hover:text-[#123c2c] bg-[#faf8f2] border border-[#d8ceba] rounded-[2px] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <span className="text-xs text-[#69746a]">
              Showing <strong className="text-[#123c2c]">{filteredRows.length}</strong> of {diffRows.length} dates
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#123c2c] text-[#fdfaf0] border-b border-[#c7a45b]/40 font-serif">
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  Date &amp; Day
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                  Extracted from Scan
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px]">
                  Current Billing Roster
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center whitespace-nowrap">
                  Bill Qty (Scan)
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center whitespace-nowrap">
                  Bill Qty (Roster)
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-center whitespace-nowrap">
                  Difference
                </th>
                <th className="py-3 px-3 font-semibold uppercase tracking-wider text-[11px] text-right whitespace-nowrap">
                  Resolution Decision
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9dc]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#69746a]">
                    <div className="max-w-md mx-auto space-y-2">
                      <Filter className="w-8 h-8 text-[#c7a45b] mx-auto opacity-70" />
                      <p className="font-serif text-base font-bold text-[#123c2c]">
                        No matching reconciliation records
                      </p>
                      <p className="text-xs text-[#69746a]">
                        Try adjusting your search criteria or resetting active filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isPending = row.decision === "PENDING";
                  const ext = row.extractedRecord;
                  const cur = row.existingEntry;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        row.classification === "CONFLICT"
                          ? "bg-amber-50/40 hover:bg-amber-50/70"
                          : row.classification === "DUPLICATE"
                          ? "bg-purple-50/40 hover:bg-purple-50/70"
                          : row.classification === "MISSING"
                          ? "bg-blue-50/30 hover:bg-blue-50/60"
                          : row.classification === "NEW"
                          ? "bg-emerald-50/30 hover:bg-emerald-50/60"
                          : "hover:bg-[#faf8f2]"
                      }`}
                    >
                      {/* Date & Day */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-[#123c2c]">
                        <div className="font-mono font-bold text-xs">
                          {formatDateDisplay(row.date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#69746a]">
                          <span>{row.dayName}</span>
                          {row.isSunday && (
                            <span className="text-[10px] px-1 py-0.2 rounded-[2px] bg-stone-200 text-stone-700 font-semibold">
                              Sunday
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Classification Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {row.classification === "NEW" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Plus className="w-2.5 h-2.5" />
                            <span>New Entry</span>
                          </span>
                        ) : row.classification === "MATCHING" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#eef8f2] text-[#123c2c] border border-[#123c2c]/30">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Exact Match</span>
                          </span>
                        ) : row.classification === "CONFLICT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                            <span>Discrepancy</span>
                          </span>
                        ) : row.classification === "DUPLICATE" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            <Layers className="w-2.5 h-2.5 text-purple-700" />
                            <span>Duplicate Logs</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            <AlertCircle className="w-2.5 h-2.5 text-blue-700" />
                            <span>Missing in Scan</span>
                          </span>
                        )}
                      </td>

                      {/* Extracted Details */}
                      <td className="py-3 px-3">
                        {ext ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#123c2c]">
                              <span>B: <strong>{ext.breakfast}</strong></span>
                              <span className="text-[#d8ceba]">|</span>
                              <span>L: <strong>{ext.lunch}</strong></span>
                              <span className="text-[#d8ceba]">|</span>
                              <span>D: <strong>{ext.dinner}</strong></span>
                            </div>

                            {ext.combinedNotation && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#f5eedf] text-[#123c2c] border border-[#c7a45b] text-[10px] font-semibold">
                                <Sparkles className="w-2.5 h-2.5 text-[#997b3e]" />
                                <span>{ext.combinedNotation}</span>
                              </div>
                            )}

                            {(ext.snacks > 0 || ext.tea > 0) && (
                              <div className="text-[10px] text-[#69746a] italic">
                                Audit: Snacks {ext.snacks}, Tea {ext.tea}
                              </div>
                            )}

                            {row.classification === "DUPLICATE" && row.duplicateRecords && (
                              <div className="text-[10px] font-semibold text-purple-800">
                                ⚠ {row.duplicateRecords.length} records found on slip
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#997b3e] italic text-[11px]">
                            — No slip record —
                          </span>
                        )}
                      </td>

                      {/* Current Roster Details */}
                      <td className="py-3 px-3">
                        {cur ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#123c2c]">
                              <span>B: <strong>{cur.breakfast}</strong></span>
                              <span className="text-[#d8ceba]">|</span>
                              <span>L: <strong>{cur.lunch}</strong></span>
                              <span className="text-[#d8ceba]">|</span>
                              <span>D: <strong>{cur.dinner}</strong></span>
                            </div>

                            {cur.combinedNotation && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#f5eedf] text-[#123c2c] border border-[#c7a45b] text-[10px] font-semibold">
                                <span>{cur.combinedNotation}</span>
                              </div>
                            )}

                            <div className="text-[10px] text-[#69746a]">
                              Preset: {cur.particulars}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#69746a] italic text-[11px]">
                            — Blank / Unpopulated —
                          </span>
                        )}
                      </td>

                      {/* Bill Qty (Extracted) */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#123c2c]">
                        {ext ? `${row.extractedBillQty}` : "—"}
                      </td>

                      {/* Bill Qty (Current Roster) */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#69746a]">
                        {cur ? `${row.existingBillQty}` : "0"}
                      </td>

                      {/* Difference */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {row.diffQty === 0 ? (
                          <span className="font-mono text-xs text-stone-500 font-semibold">
                            0
                          </span>
                        ) : row.diffQty > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                            +{row.diffQty}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-xs font-mono font-bold bg-rose-100 text-rose-800">
                            {row.diffQty}
                          </span>
                        )}
                      </td>

                      {/* Resolution Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {/* 1. DUPLICATE: Requires Inspect & Resolve */}
                        {row.classification === "DUPLICATE" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {row.decision === "USE_MERGED" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                                <Check className="w-3 h-3" />
                                <span>Merged</span>
                              </span>
                            ) : row.decision === "ACCEPT_EXTRACTED" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <Check className="w-3 h-3" />
                                <span>Accepted Selected</span>
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => setInspectingDuplicateRow(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors"
                            >
                              <Layers className="w-3 h-3 text-[#997b3e]" />
                              <span>Inspect Duplicates</span>
                            </button>
                          </div>
                        ) : row.classification === "CONFLICT" ? (
                          /* 2. CONFLICT: Accept Extracted vs Keep Existing */
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDecision(row.id, "ACCEPT_EXTRACTED")
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                                row.decision === "ACCEPT_EXTRACTED"
                                  ? "bg-[#123c2c] text-[#fdfaf0] shadow-xs"
                                  : "bg-[#eee7d7] text-[#123c2c] hover:bg-[#e4dac4] border border-[#d8ceba]"
                              }`}
                              title="Update roster with extracted values"
                            >
                              {row.decision === "ACCEPT_EXTRACTED" && (
                                <Check className="w-3 h-3 inline mr-1 text-[#c7a45b]" />
                              )}
                              <span>Accept Scan ({row.extractedBillQty})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDecision(row.id, "KEEP_EXISTING")
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                                row.decision === "KEEP_EXISTING"
                                  ? "bg-[#69746a] text-white shadow-xs"
                                  : "bg-[#faf8f2] text-[#69746a] hover:bg-[#eee7d7] border border-[#d8ceba]"
                              }`}
                              title="Keep current roster values"
                            >
                              {row.decision === "KEEP_EXISTING" && (
                                <Check className="w-3 h-3 inline mr-1" />
                              )}
                              <span>Keep Roster ({row.existingBillQty})</span>
                            </button>
                          </div>
                        ) : row.classification === "NEW" ? (
                          /* 3. NEW: Accept vs Skip */
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDecision(row.id, "ACCEPT_EXTRACTED")
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                                row.decision === "ACCEPT_EXTRACTED"
                                  ? "bg-[#123c2c] text-[#fdfaf0] shadow-xs"
                                  : "bg-[#eee7d7] text-[#123c2c] hover:bg-[#e4dac4] border border-[#d8ceba]"
                              }`}
                            >
                              {row.decision === "ACCEPT_EXTRACTED" && (
                                <Check className="w-3 h-3 inline mr-1 text-[#c7a45b]" />
                              )}
                              <span>Add to Roster</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onUpdateDecision(row.id, "SKIP")}
                              className={`px-2 py-1 text-xs font-medium rounded-[2px] transition-colors ${
                                row.decision === "SKIP"
                                  ? "bg-stone-300 text-stone-800"
                                  : "text-[#69746a] hover:bg-[#eee7d7]"
                              }`}
                            >
                              <span>Skip</span>
                            </button>
                          </div>
                        ) : row.classification === "MISSING" ? (
                          /* 4. MISSING: Keep Roster vs Skip */
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDecision(row.id, "KEEP_EXISTING")
                              }
                              className={`px-2.5 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                                row.decision === "KEEP_EXISTING"
                                  ? "bg-[#123c2c] text-[#fdfaf0] shadow-xs"
                                  : "bg-[#eee7d7] text-[#123c2c] hover:bg-[#e4dac4] border border-[#d8ceba]"
                              }`}
                            >
                              <Check className="w-3 h-3 inline mr-1 text-[#c7a45b]" />
                              <span>Retain Roster ({row.existingBillQty})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onUpdateDecision(row.id, "SKIP")}
                              className={`px-2 py-1 text-xs font-medium rounded-[2px] transition-colors ${
                                row.decision === "SKIP"
                                  ? "bg-rose-100 text-rose-800"
                                  : "text-[#69746a] hover:bg-[#eee7d7]"
                              }`}
                            >
                              <span>Zero Out</span>
                            </button>
                          </div>
                        ) : (
                          /* 5. MATCHING: Already Synced */
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Sync</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 3B Scope Safety Notice */}
      <div className="p-4 rounded-[2px] bg-[#faf8f2] border border-[#c7a45b]/50 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#997b3e] shrink-0 mt-0.5" />
        <div className="text-xs text-[#123c2c] leading-relaxed">
          <p className="font-bold">
            Phase 3C Step 3B Scope: Preview &amp; Decision Capture Only
          </p>
          <p className="text-[#69746a] mt-0.5">
            Decisions made above are held in session state for verification. Roster data and customer invoices are NOT modified until Step 3C final approval.
          </p>
        </div>
      </div>

      {/* Duplicate Inspection Modal */}
      {inspectingDuplicateRow && (
        <DuplicateInspectionModal
          row={inspectingDuplicateRow}
          onClose={() => setInspectingDuplicateRow(null)}
          onSelectRecord={(chosenRecord) => {
            onResolveDuplicate(inspectingDuplicateRow.id, chosenRecord);
            setInspectingDuplicateRow(null);
          }}
          onMergeRecords={(recA, recB) => {
            const merged = mergeTwoExtractedRecords(recA, recB);
            onResolveDuplicate(inspectingDuplicateRow.id, merged);
            setInspectingDuplicateRow(null);
          }}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Duplicate Date Inspection & Resolution Modal
// -----------------------------------------------------------------------------

interface DuplicateInspectionModalProps {
  row: ReconciliationComparisonRow;
  onClose: () => void;
  onSelectRecord: (record: HtrExtractedRecord) => void;
  onMergeRecords: (recA: HtrExtractedRecord, recB: HtrExtractedRecord) => void;
}

function DuplicateInspectionModal({
  row,
  onClose,
  onSelectRecord,
  onMergeRecords,
}: DuplicateInspectionModalProps) {
  const records = row.duplicateRecords || (row.extractedRecord ? [row.extractedRecord] : []);
  const recA = records[0];
  const recB = records[1];

  // Preview combined bill quantity using the single central calculation engine
  const previewMergedBillQty = useMemo(() => {
    if (!recA || !recB) return 0;
    const merged = mergeTwoExtractedRecords(recA, recB);
    return calculateRowBillQty({
      breakfast: merged.breakfast,
      lunch: merged.lunch,
      dinner: merged.dinner,
      particulars: "BREAKFAST & DINNER",
      combinedNotation: merged.combinedNotation,
    });
  }, [recA, recB]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#fffefa] border border-[#c7a45b] rounded-[2px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#123c2c] text-[#fdfaf0] border-b border-[#c7a45b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c7a45b]" />
            <h3 className="font-serif text-base font-bold text-[#f5eedf]">
              Resolve Duplicate Date Entries: {formatDateDisplay(row.date)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#fdfaf0]/70 hover:text-[#fdfaf0] rounded-[2px] hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-[2px] text-xs text-purple-900 leading-relaxed">
            <strong>Multiple logs found for {formatDateDisplay(row.date)}:</strong> The AI extraction detected {records.length} distinct entries resolving to this calendar date. Choose which entry to use, or merge both shift entries into a combined total.
          </div>

          {/* Cards for each candidate record */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {records.map((rec, idx) => {
              const billQty = calculateRowBillQty({
                breakfast: rec.breakfast,
                lunch: rec.lunch,
                dinner: rec.dinner,
                particulars: "BREAKFAST & DINNER",
                combinedNotation: rec.combinedNotation,
              });

              return (
                <div
                  key={rec.id || idx}
                  className="p-3.5 rounded-[2px] bg-[#fbf9f4] border border-[#d8ceba] space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#e5ddcd]">
                      <span className="font-bold text-xs text-[#123c2c]">
                        Log Entry #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] bg-[#f5eedf] text-[#997b3e] border border-[#c7a45b]/40">
                        {Math.round(rec.confidence * 100)}% conf
                      </span>
                    </div>

                    <div className="mt-2 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#69746a]">Breakfast:</span>
                        <span className="font-mono font-bold text-[#123c2c]">
                          {rec.breakfast}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#69746a]">Lunch:</span>
                        <span className="font-mono font-bold text-[#123c2c]">
                          {rec.lunch}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#69746a]">Dinner:</span>
                        <span className="font-mono font-bold text-[#123c2c]">
                          {rec.dinner}
                        </span>
                      </div>

                      {rec.combinedNotation && (
                        <div className="p-1 rounded-[2px] bg-[#f5eedf] text-[10px] text-[#997b3e] font-semibold border border-[#c7a45b]">
                          {rec.combinedNotation}
                        </div>
                      )}

                      <div className="pt-1 text-[11px] text-[#69746a] italic">
                        Raw Text: &quot;{rec.rawText || "N/A"}&quot;
                      </div>

                      <div className="pt-2 border-t border-[#e5ddcd] flex items-center justify-between font-bold">
                        <span className="text-[#123c2c]">Billable Meals:</span>
                        <span className="font-mono text-sm text-[#123c2c]">
                          {billQty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectRecord(rec)}
                    className="w-full mt-3 py-1.5 px-3 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors"
                  >
                    Select Only Entry #{idx + 1}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Merge Option (if 2 records) */}
          {recA && recB && (
            <div className="p-4 rounded-[2px] bg-[#f5eedf] border border-[#c7a45b] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#123c2c]">
                    Merge Both Shift Entries
                  </h4>
                  <p className="text-xs text-[#69746a] mt-0.5">
                    Combine morning and evening logs into a single unified record without double-counting combined meals.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#69746a] block uppercase font-semibold">
                    Merged Bill Qty
                  </span>
                  <span className="text-lg font-mono font-bold text-[#123c2c]">
                    {previewMergedBillQty} meals
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onMergeRecords(recA, recB)}
                className="w-full py-2 px-4 rounded-[2px] bg-[#123c2c] hover:bg-[#1a4a38] text-[#fdfaf0] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-[#c7a45b]" />
                <span>Merge Both Entries ({previewMergedBillQty} Total Meals)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#faf8f2] border-t border-[#e2d8c3] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#69746a] hover:text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
