"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  MinusCircle,
  Edit3,
  Search,
  RotateCcw,
  Calendar,
  Sparkles,
  Info,
  X,
  Save,
  Check,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  GitCompare,
  CalendarCheck,
} from "lucide-react";
import type {
  HtrExtractedRecord,
  HtrRecordStatus,
  ExtractionDocumentMeta,
} from "@/types/billing";
import {
  calculateRowBillQty,
  formatDateDisplay,
  extractCombinedQuantity,
} from "@/lib/utils/billing-calculations";

interface ExtractionReviewTableProps {
  records: HtrExtractedRecord[];
  onUpdateRecord: (updated: HtrExtractedRecord) => void;
  documentMeta?: ExtractionDocumentMeta;
  onTriggerReconciliation?: () => void;
  isReconciled?: boolean;
}

type StatusFilterOption = "ALL" | HtrRecordStatus;
type ConfidenceFilterOption = "ALL" | "HIGH" | "MEDIUM" | "LOW";

export function ExtractionReviewTable({
  records,
  onUpdateRecord,
  documentMeta,
  onTriggerReconciliation,
  isReconciled,
}: ExtractionReviewTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("ALL");
  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilterOption>("ALL");

  // Editing Record State
  const [editingRecord, setEditingRecord] = useState<HtrExtractedRecord | null>(
    null
  );

  // Compute dynamic summary metric counts directly from records
  const summaryMetrics = useMemo(() => {
    let total = records.length;
    let confident = 0;
    let unclear = 0;
    let combined = 0;
    let zeroCount = 0;
    let edited = 0;

    for (const r of records) {
      if (r.isManuallyEdited || r.status === "MANUALLY_EDITED") {
        edited++;
      }
      if (r.status === "ZERO_COUNT") {
        zeroCount++;
      } else if (r.status === "COMBINED" || Boolean(r.combinedNotation)) {
        combined++;
      } else if (r.status === "UNCLEAR" || r.confidence < 0.7) {
        unclear++;
      } else if (r.status === "CONFIDENT" || r.confidence >= 0.9) {
        confident++;
      }
    }

    return { total, confident, unclear, combined, zeroCount, edited };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Search Query (Date or Raw Text)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const dateMatch = rec.date.toLowerCase().includes(query);
        const displayDateMatch = formatDateDisplay(rec.date).toLowerCase().includes(query);
        const rawTextMatch = (rec.rawText || "").toLowerCase().includes(query);
        const notesMatch = (rec.notes || "").toLowerCase().includes(query);
        if (!dateMatch && !displayDateMatch && !rawTextMatch && !notesMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "MANUALLY_EDITED") {
          if (!rec.isManuallyEdited && rec.status !== "MANUALLY_EDITED") return false;
        } else if (statusFilter === "COMBINED") {
          if (rec.status !== "COMBINED" && !rec.combinedNotation) return false;
        } else if (rec.status !== statusFilter) {
          return false;
        }
      }

      // 3. Confidence Filter
      if (confidenceFilter !== "ALL") {
        if (confidenceFilter === "HIGH" && rec.confidence < 0.9) return false;
        if (
          confidenceFilter === "MEDIUM" &&
          (rec.confidence < 0.7 || rec.confidence >= 0.9)
        )
          return false;
        if (confidenceFilter === "LOW" && rec.confidence >= 0.7) return false;
      }

      return true;
    });
  }, [records, searchQuery, statusFilter, confidenceFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "ALL" ||
    confidenceFilter !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setConfidenceFilter("ALL");
  };

  // Helper for Day Name
  const getDayName = (isoDate: string) => {
    try {
      const parts = isoDate.split("-");
      const d = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[d.getDay()] || "";
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t-2 border-[#c7a45b]/30">
      {/* Section Header */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#997b3e] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#c7a45b]" />
              <span>Step 2 of 3 • Human-in-the-Loop Review</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#123c2c] m-0">
              Extraction Review &amp; Manual Verification
            </h2>
            <p className="text-[#69746a] text-xs md:text-sm mt-1 leading-relaxed max-w-2xl">
              Inspect AI-extracted meal counts against the ledger scan above. Review unclear items, confirm combined shift notations, and manually correct any discrepancies before calendar reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#69746a]">
              Source Slip:{" "}
              <strong className="text-[#123c2c]">
                {documentMeta?.fileName || "Uploaded Ledger"}
              </strong>
            </span>
          </div>
        </div>

        {/* Dynamic Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {/* Card 1: Total */}
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`p-3 rounded-[2px] text-left border transition-all ${
              statusFilter === "ALL"
                ? "bg-[#f5eedf] border-[#c7a45b] shadow-xs"
                : "bg-[#faf8f2] border-[#e5ddcd] hover:bg-[#f3ede0]"
            }`}
          >
            <div className="text-[11px] text-[#69746a] font-medium">Total Extracted</div>
            <div className="text-xl font-bold text-[#123c2c] mt-0.5">
              {summaryMetrics.total}
            </div>
            <div className="text-[10px] text-[#997b3e] mt-0.5">All log entries</div>
          </button>

          {/* Card 2: High Confidence */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("CONFIDENT");
              setConfidenceFilter("ALL");
            }}
            className={`p-3 rounded-[2px] text-left border transition-all ${
              statusFilter === "CONFIDENT"
                ? "bg-emerald-100/60 border-emerald-400 shadow-xs"
                : "bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50"
            }`}
          >
            <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Confident</span>
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">
              {summaryMetrics.confident}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">≥ 90% confidence</div>
          </button>

          {/* Card 3: Unclear (Attention) */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("UNCLEAR");
              setConfidenceFilter("ALL");
            }}
            className={`p-3 rounded-[2px] text-left border transition-all ${
              statusFilter === "UNCLEAR"
                ? "bg-red-100/60 border-red-400 shadow-xs"
                : "bg-red-50/50 border-red-200/80 hover:bg-red-50"
            }`}
          >
            <div className="text-[11px] text-red-800 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>Unclear</span>
            </div>
            <div className="text-xl font-bold text-red-900 mt-0.5">
              {summaryMetrics.unclear}
            </div>
            <div className="text-[10px] text-red-700 mt-0.5">Requires check</div>
          </button>

          {/* Card 4: Combined Notation */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("COMBINED");
              setConfidenceFilter("ALL");
            }}
            className={`p-3 rounded-[2px] text-left border transition-all ${
              statusFilter === "COMBINED"
                ? "bg-purple-100/60 border-purple-400 shadow-xs"
                : "bg-purple-50/50 border-purple-200/80 hover:bg-purple-50"
            }`}
          >
            <div className="text-[11px] text-purple-800 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-600" />
              <span>Combined</span>
            </div>
            <div className="text-xl font-bold text-purple-900 mt-0.5">
              {summaryMetrics.combined}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5">B+D unified count</div>
          </button>

          {/* Card 5: Zero Count (Sundays) */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ZERO_COUNT");
              setConfidenceFilter("ALL");
            }}
            className={`p-3 rounded-[2px] text-left border transition-all ${
              statusFilter === "ZERO_COUNT"
                ? "bg-stone-200 border-stone-400 shadow-xs"
                : "bg-stone-100 border-stone-200 hover:bg-stone-200/70"
            }`}
          >
            <div className="text-[11px] text-stone-700 font-medium flex items-center gap-1">
              <MinusCircle className="w-3 h-3 text-stone-500" />
              <span>Zero-Count</span>
            </div>
            <div className="text-xl font-bold text-stone-800 mt-0.5">
              {summaryMetrics.zeroCount}
            </div>
            <div className="text-[10px] text-stone-600 mt-0.5">Non-operational</div>
          </button>

          {/* Card 6: Manually Corrected */}
          <button
            type="button"
            onClick={() => {
              setStatusFilter("MANUALLY_EDITED");
              setConfidenceFilter("ALL");
            }}
            className={`p-3 rounded-[2px] text-left border transition-all ${
              statusFilter === "MANUALLY_EDITED"
                ? "bg-blue-100/70 border-blue-400 shadow-xs"
                : "bg-blue-50/50 border-blue-200/80 hover:bg-blue-50"
            }`}
          >
            <div className="text-[11px] text-blue-800 font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-blue-600" />
              <span>Corrected</span>
            </div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">
              {summaryMetrics.edited}
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5">Operator edited</div>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Counters */}
      <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#997b3e] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search date (e.g. 04-11)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#69746a] hover:text-[#123c2c]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#69746a] text-[11px] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterOption)}
              className="px-2.5 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c]"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIDENT">Confident Only</option>
              <option value="UNCLEAR">Unclear Only</option>
              <option value="COMBINED">Combined Only</option>
              <option value="ZERO_COUNT">Zero Count (Sundays)</option>
              <option value="MANUALLY_EDITED">Manually Corrected</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#69746a] text-[11px] font-medium">Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) =>
                setConfidenceFilter(e.target.value as ConfidenceFilterOption)
              }
              className="px-2.5 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c]"
            >
              <option value="ALL">All Levels</option>
              <option value="HIGH">High (≥ 90%)</option>
              <option value="MEDIUM">Medium (70% - 89%)</option>
              <option value="LOW">Low (&lt; 70%)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#997b3e] hover:text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results Count Badge */}
        <div className="text-xs text-[#69746a] shrink-0">
          Showing{" "}
          <strong className="text-[#123c2c]">{filteredRecords.length}</strong> of{" "}
          <strong className="text-[#123c2c]">{records.length}</strong> extracted
          records
        </div>
      </div>

      {/* Main Review Table */}
      <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#123c2c] text-[#fdfaf0] border-b border-[#0d2c20]">
                <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[11px]">
                  Date
                </th>
                <th className="py-2.5 px-3 font-semibold text-center uppercase tracking-wider text-[11px]">
                  Breakfast
                </th>
                <th className="py-2.5 px-3 font-semibold text-center uppercase tracking-wider text-[11px]">
                  Lunch
                </th>
                <th className="py-2.5 px-3 font-semibold text-center uppercase tracking-wider text-[11px]">
                  Dinner
                </th>
                <th className="py-2.5 px-2 font-semibold text-center uppercase tracking-wider text-[10px] text-[#e2d8c3]">
                  Snacks
                </th>
                <th className="py-2.5 px-2 font-semibold text-center uppercase tracking-wider text-[10px] text-[#e2d8c3]">
                  Tea
                </th>
                <th className="py-2.5 px-3 font-semibold text-center uppercase tracking-wider text-[11px] bg-[#0e3124] text-[#c7a45b]">
                  Bill Qty
                </th>
                <th className="py-2.5 px-3 font-semibold text-center uppercase tracking-wider text-[11px]">
                  Confidence
                </th>
                <th className="py-2.5 px-3 font-semibold text-left uppercase tracking-wider text-[11px]">
                  Status
                </th>
                <th className="py-2.5 px-3 font-semibold text-right uppercase tracking-wider text-[11px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7d7]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[#69746a]">
                    No extracted records match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const billQty = calculateRowBillQty({
                    breakfast: rec.breakfast,
                    lunch: rec.lunch,
                    dinner: rec.dinner,
                    particulars: "BREAKFAST & DINNER",
                    combinedNotation: rec.combinedNotation,
                  });

                  const dayName = getDayName(rec.date);
                  const isSunday = dayName === "Sun";
                  const confidencePct = Math.round(rec.confidence * 100);

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-[#fbf8f0] transition-colors ${
                        rec.status === "UNCLEAR"
                          ? "bg-red-50/30"
                          : rec.status === "COMBINED"
                          ? "bg-purple-50/25"
                          : rec.isManuallyEdited
                          ? "bg-blue-50/20"
                          : isSunday
                          ? "bg-stone-50/40"
                          : ""
                      }`}
                    >
                      {/* Date Column */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-[#123c2c]">
                          <span>{formatDateDisplay(rec.date)}</span>
                          <span
                            className={`text-[10px] font-bold px-1 py-0.2 rounded-[2px] ${
                              isSunday
                                ? "bg-red-100 text-red-700"
                                : "bg-[#eee7d7] text-[#123c2c]"
                            }`}
                          >
                            {dayName}
                          </span>
                        </div>
                      </td>

                      {/* Breakfast */}
                      <td className="py-2.5 px-3 text-center font-mono">
                        {rec.combinedNotation ? (
                          <span className="text-[11px] text-purple-700 italic">
                            (Combined)
                          </span>
                        ) : rec.breakfast > 0 ? (
                          <span className="font-bold text-[#123c2c]">
                            {rec.breakfast}
                          </span>
                        ) : (
                          <span className="text-[#997b3e]/60">0</span>
                        )}
                      </td>

                      {/* Lunch */}
                      <td className="py-2.5 px-3 text-center font-mono">
                        {rec.lunch > 0 ? (
                          <span className="font-bold text-[#123c2c]">{rec.lunch}</span>
                        ) : (
                          <span className="text-[#997b3e]/60">0</span>
                        )}
                      </td>

                      {/* Dinner */}
                      <td className="py-2.5 px-3 text-center font-mono">
                        {rec.combinedNotation ? (
                          <span className="text-[11px] text-purple-700 italic">
                            (Combined)
                          </span>
                        ) : rec.status === "UNCLEAR" ? (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-red-100 text-red-800 font-bold border border-red-200">
                            Smudged?
                          </span>
                        ) : rec.dinner > 0 ? (
                          <span className="font-bold text-[#123c2c]">{rec.dinner}</span>
                        ) : (
                          <span className="text-[#997b3e]/60">0</span>
                        )}
                      </td>

                      {/* Snacks (Audit-Only) */}
                      <td className="py-2.5 px-2 text-center font-mono text-[11px] text-[#69746a]">
                        {rec.snacks > 0 ? rec.snacks : 0}
                      </td>

                      {/* Tea (Audit-Only) */}
                      <td className="py-2.5 px-2 text-center font-mono text-[11px] text-[#69746a]">
                        {rec.tea > 0 ? rec.tea : 0}
                      </td>

                      {/* Bill Qty (Calculated Single Source of Truth) */}
                      <td className="py-2.5 px-3 text-center font-mono bg-[#faf6ea] border-x border-[#e8dfcf]">
                        <span className="text-sm font-bold text-[#123c2c]">
                          {billQty}
                        </span>
                        {rec.combinedNotation && (
                          <div className="text-[9px] text-purple-700 font-sans leading-none mt-0.5 font-bold">
                            Combined B+D
                          </div>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              rec.confidence >= 0.9
                                ? "bg-emerald-500"
                                : rec.confidence >= 0.7
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`font-mono text-xs font-bold ${
                              rec.confidence >= 0.9
                                ? "text-emerald-800"
                                : rec.confidence >= 0.7
                                ? "text-amber-800"
                                : "text-red-800"
                            }`}
                          >
                            {confidencePct}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {rec.isManuallyEdited ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Corrected</span>
                          </span>
                        ) : rec.status === "COMBINED" || rec.combinedNotation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            <Layers className="w-2.5 h-2.5" />
                            <span>Combined Shift</span>
                          </span>
                        ) : rec.status === "UNCLEAR" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Unclear</span>
                          </span>
                        ) : rec.status === "ZERO_COUNT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                            <MinusCircle className="w-2.5 h-2.5" />
                            <span>Non-Op (Sun)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Confident</span>
                          </span>
                        )}
                      </td>

                      {/* Action: Edit */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingRecord(rec)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors"
                          title="Review & edit record details"
                        >
                          <Edit3 className="w-3 h-3 text-[#997b3e]" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Comparison Trigger Banner */}
      {onTriggerReconciliation && (
        <div className="mt-6 p-4 rounded-[3px] bg-[#123c2c] text-[#fdfaf0] border border-[#c7a45b] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#1b4d3e] text-[#c7a45b] border border-[#c7a45b]/40 shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-[#f5eedf]">
                Ready for Billing Calendar Comparison
              </h4>
              <p className="text-xs text-[#d8ceba] mt-0.5">
                Compare these {records.length} reviewed daily records against the active monthly billing roster to identify new entries, discrepancies, and duplicates.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-trigger-reconciliation"
            onClick={onTriggerReconciliation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] bg-[#c7a45b] hover:bg-[#b5934a] text-[#123c2c] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
          >
            <GitCompare className="w-4 h-4" />
            <span>{isReconciled ? "Re-Run Comparison" : "Compare with Billing Calendar"}</span>
          </button>
        </div>
      )}

      {/* Manual Correction Modal */}
      {editingRecord && (
        <ManualCorrectionModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(updated) => {
            onUpdateRecord(updated);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Manual Correction Modal Subcomponent
// -----------------------------------------------------------------------------

interface ManualCorrectionModalProps {
  record: HtrExtractedRecord;
  onClose: () => void;
  onSave: (updated: HtrExtractedRecord) => void;
}

function ManualCorrectionModal({
  record,
  onClose,
  onSave,
}: ManualCorrectionModalProps) {
  // Form State initialized from record
  const [date, setDate] = useState(record.date);
  const [breakfast, setBreakfast] = useState(record.breakfast);
  const [lunch, setLunch] = useState(record.lunch);
  const [dinner, setDinner] = useState(record.dinner);
  const [snacks, setSnacks] = useState(record.snacks);
  const [tea, setTea] = useState(record.tea);
  const [notes, setNotes] = useState(record.notes || "");
  const [combinedNotation, setCombinedNotation] = useState(
    record.combinedNotation || ""
  );

  // Conversion toggle state (if splitting combined into individual shifts)
  const [isCombinedActive, setIsCombinedActive] = useState(
    Boolean(record.combinedNotation)
  );

  // Validation errors
  const [formError, setFormError] = useState<string | null>(null);

  // Live bill quantity preview calculated using central engine
  const liveBillQty = useMemo(() => {
    return calculateRowBillQty({
      breakfast,
      lunch,
      dinner,
      particulars: "BREAKFAST & DINNER",
      combinedNotation: isCombinedActive ? combinedNotation : undefined,
    });
  }, [breakfast, lunch, dinner, combinedNotation, isCombinedActive]);

  const handleSave = () => {
    setFormError(null);

    // 1. Validate date
    if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFormError("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    // 2. Validate non-negative numbers
    if (breakfast < 0 || lunch < 0 || dinner < 0 || snacks < 0 || tea < 0) {
      setFormError("Quantities must be valid non-negative numbers (≥ 0).");
      return;
    }

    if (isCombinedActive) {
      const parsedQty = extractCombinedQuantity(combinedNotation);
      if (parsedQty === null || parsedQty < 0) {
        setFormError(
          "Combined notation must contain a valid quantity (e.g. '65 Breakfast, Dinner')."
        );
        return;
      }
    }

    // Construct updated record preserving raw text and original confidence
    const updated: HtrExtractedRecord = {
      ...record,
      date,
      breakfast: isCombinedActive ? 0 : breakfast,
      lunch: lunch,
      dinner: isCombinedActive ? 0 : dinner,
      snacks: snacks,
      tea: tea,
      notes: notes.trim(),
      combinedNotation: isCombinedActive ? combinedNotation.trim() : undefined,
      isManuallyEdited: true,
      status: "MANUALLY_EDITED",
      // CRITICAL: Preserve original confidence and rawText for audit trail
      confidence: record.confidence,
      rawText: record.rawText,
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[4px] border-t-[#c7a45b] shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#f0e9dc] bg-[#faf8f2] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#997b3e] text-[11px] font-bold uppercase tracking-wider">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Audit Review &amp; Correction</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#123c2c] mt-0.5">
              Manual Ledger Record Correction
            </h3>
            <p className="text-xs text-[#69746a] mt-0.5">
              Record ID: <code className="font-mono text-[#123c2c]">{record.id}</code> • Original Date: {formatDateDisplay(record.date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#69746a] hover:text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors"
            title="Cancel & Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Validation Alert */}
          {formError && (
            <div className="p-3 rounded-[2px] bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Original Audit Comparison Card */}
          <div className="p-3.5 rounded-[2px] bg-[#fbf9f3] border border-[#e2d8c3] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#123c2c] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#997b3e]" />
                Original Extracted Baseline (OCR Reading)
              </span>
              <span className="text-[11px] font-mono text-[#997b3e] font-bold">
                Confidence: {Math.round(record.confidence * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-white p-2 rounded-[2px] border border-[#e8dfcf]">
              <div>
                <span className="text-[#69746a] text-[10px] block font-sans">Breakfast</span>
                <span className="font-bold text-[#123c2c]">
                  {record.combinedNotation ? "Combined" : record.breakfast}
                </span>
              </div>
              <div>
                <span className="text-[#69746a] text-[10px] block font-sans">Lunch</span>
                <span className="font-bold text-[#123c2c]">{record.lunch}</span>
              </div>
              <div>
                <span className="text-[#69746a] text-[10px] block font-sans">Dinner</span>
                <span className="font-bold text-[#123c2c]">
                  {record.combinedNotation ? "Combined" : record.dinner}
                </span>
              </div>
            </div>

            {record.rawText && (
              <div className="text-[11px] text-[#69746a]">
                <strong className="text-[#123c2c] font-sans">Raw Scan Text:</strong>{" "}
                <code className="font-mono text-[#123c2c] bg-stone-100 px-1 py-0.5 rounded">
                  {record.rawText}
                </code>
              </div>
            )}
          </div>

          {/* Edit Form Fields */}
          <div className="space-y-4">
            {/* Date Field */}
            <div>
              <label className="block text-xs font-bold text-[#123c2c] uppercase tracking-wider mb-1">
                Log Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-mono"
              />
            </div>

            {/* Combined Notation Section */}
            {isCombinedActive ? (
              <div className="p-3.5 rounded-[2px] bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    Combined Meal Notation Active
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-purple-200/70 text-purple-900">
                    B+D Unified Count
                  </span>
                </div>

                <p className="text-[11px] text-purple-800 leading-relaxed">
                  The written number represents the total shift meal count covering both meals (not doubled).
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">
                    Combined Notation String
                  </label>
                  <input
                    type="text"
                    value={combinedNotation}
                    onChange={(e) => setCombinedNotation(e.target.value)}
                    placeholder="e.g. 65 Breakfast, Dinner"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-purple-300 focus:border-purple-600 focus:outline-none rounded-[2px] text-purple-950 font-medium"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Extract current number and split reasonably
                    const cQty = extractCombinedQuantity(combinedNotation) || 0;
                    setBreakfast(Math.floor(cQty / 2));
                    setDinner(Math.ceil(cQty / 2));
                    setIsCombinedActive(false);
                    setCombinedNotation("");
                  }}
                  className="text-xs text-purple-800 underline hover:text-purple-950 font-semibold flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Split into individual Breakfast &amp; Dinner shift quantities</span>
                </button>
              </div>
            ) : (
              /* Individual Meal Quantities */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#123c2c] uppercase tracking-wider">
                    Shift Meal Quantities
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sum = breakfast + dinner;
                      setCombinedNotation(`${sum} Breakfast, Dinner`);
                      setIsCombinedActive(true);
                    }}
                    className="text-[11px] text-purple-700 hover:text-purple-900 underline font-semibold"
                  >
                    + Convert to Combined Notation
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#123c2c] mb-1">
                      Breakfast
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={breakfast}
                      onChange={(e) => setBreakfast(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-3 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#123c2c] mb-1">
                      Lunch
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={lunch}
                      onChange={(e) => setLunch(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-3 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#123c2c] mb-1">
                      Dinner
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={dinner}
                      onChange={(e) => setDinner(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-3 py-1.5 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Audit Pantry Items (Snacks & Tea) */}
            <div className="p-3 rounded-[2px] bg-[#faf8f2] border border-[#e5ddcd] space-y-2">
              <span className="text-[11px] font-bold text-[#69746a] uppercase tracking-wider block">
                Audit Tallies (Non-Billable)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#69746a] mb-1">Snacks</label>
                  <input
                    type="number"
                    min="0"
                    value={snacks}
                    onChange={(e) => setSnacks(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#69746a] mb-1">Tea</label>
                  <input
                    type="number"
                    min="0"
                    value={tea}
                    onChange={(e) => setTea(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Remarks / Supervisor Notes */}
            <div>
              <label className="block text-xs font-bold text-[#123c2c] uppercase tracking-wider mb-1">
                Correction Reason / Supervisor Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Confirmed smudged dinner count with supervisor..."
                className="w-full px-3 py-2 text-xs bg-[#fbf9f4] border border-[#d8ceba] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] resize-none"
              />
            </div>

            {/* Live Calculation Output Indicator */}
            <div className="p-3 rounded-[2px] bg-[#f5eedf] border border-[#c7a45b] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#123c2c]">
                Calculated Bill Quantity (Single Engine):
              </span>
              <span className="text-base font-bold font-mono text-[#123c2c]">
                {liveBillQty} meals
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#f0e9dc] bg-[#faf8f2] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#69746a] italic">
            Original confidence &amp; raw scan text will be preserved.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#69746a] hover:text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#fdfaf0] bg-[#123c2c] hover:bg-[#1a4a38] rounded-[2px] shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
              <span>Save Correction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
