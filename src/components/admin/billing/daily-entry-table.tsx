"use client";

import React, { useState } from "react";
import {
  Calendar,
  Filter,
  Plus,
  Trash2,
  AlertCircle,
  RotateCcw,
  Info,
} from "lucide-react";
import { DailyBillingEntry } from "@/types/billing";
import { PARTICULAR_OPTIONS } from "@/lib/utils/billing-calculations";

export type EntryFilterMode = "ALL" | "NON-SUNDAYS" | "SUNDAYS" | "NON-ZERO";

interface DailyEntryTableProps {
  entries: DailyBillingEntry[];
  onUpdateEntry: (
    id: string,
    field: keyof DailyBillingEntry,
    value: string | number
  ) => void;
  onDeleteRow: (id: string) => void;
  onAddCustomRow: () => void;
  onRequestClear: () => void;
}

export function DailyEntryTable({
  entries,
  onUpdateEntry,
  onDeleteRow,
  onAddCustomRow,
  onRequestClear,
}: DailyEntryTableProps) {
  const [filterMode, setFilterMode] = useState<EntryFilterMode>("ALL");

  // Filter entries based on active mode
  const filteredEntries = entries.filter((entry) => {
    if (filterMode === "NON-SUNDAYS") return !entry.isSunday;
    if (filterMode === "SUNDAYS") return entry.isSunday;
    if (filterMode === "NON-ZERO") return entry.billQty > 0;
    return true;
  });

  const sundaysCount = entries.filter((e) => e.isSunday).length;
  const nonSundaysCount = entries.length - sundaysCount;
  const nonZeroCount = entries.filter((e) => e.billQty > 0).length;

  return (
    <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] shadow-xs overflow-hidden flex flex-col">
      {/* 1. Table Toolbar Header */}
      <div className="p-4 border-b border-[#e5ddcd] flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 bg-[#faf7ef]">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[#8e7139]" />
          <h3 className="font-serif text-base font-bold text-[#123c2c] m-0">
            Daily Ledger Reconciliation
          </h3>
          <span className="rounded-[2px] bg-[#123c2c]/10 text-[#123c2c] border border-[#123c2c]/20 px-2.5 py-0.5 text-xs font-bold font-mono">
            {entries.length} Dates
          </span>
        </div>

        {/* Filter Tabs & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Filter Control */}
          <div className="flex items-center rounded-[2px] border border-[#dcd0b5] bg-[#f4eee1] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`rounded-[2px] px-3 py-1 text-xs transition-colors cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-[#123c2c] text-[#faf8f1] font-bold shadow-xs"
                  : "text-[#5c685e] hover:text-[#17271e] font-semibold"
              }`}
            >
              All ({entries.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("NON-SUNDAYS")}
              className={`rounded-[2px] px-3 py-1 text-xs transition-colors cursor-pointer ${
                filterMode === "NON-SUNDAYS"
                  ? "bg-[#123c2c] text-[#faf8f1] font-bold shadow-xs"
                  : "text-[#5c685e] hover:text-[#17271e] font-semibold"
              }`}
            >
              Non-Sundays ({nonSundaysCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("SUNDAYS")}
              className={`rounded-[2px] px-3 py-1 text-xs transition-colors cursor-pointer ${
                filterMode === "SUNDAYS"
                  ? "bg-[#123c2c] text-[#faf8f1] font-bold shadow-xs"
                  : "text-[#5c685e] hover:text-[#17271e] font-semibold"
              }`}
            >
              Sundays ({sundaysCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("NON-ZERO")}
              className={`rounded-[2px] px-3 py-1 text-xs transition-colors cursor-pointer ${
                filterMode === "NON-ZERO"
                  ? "bg-[#123c2c] text-[#faf8f1] font-bold shadow-xs"
                  : "text-[#5c685e] hover:text-[#17271e] font-semibold"
              }`}
            >
              Billed ({nonZeroCount})
            </button>
          </div>

          {/* Action: Add Custom Row */}
          <button
            type="button"
            onClick={onAddCustomRow}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#dcd0b5] bg-[#ffffff] hover:bg-[#faf7ef] px-3 py-1.5 text-xs font-bold text-[#123c2c] shadow-xs transition-colors cursor-pointer"
            title="Add additional or ad-hoc catering date"
          >
            <Plus className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Add Custom Date</span>
          </button>

          {/* Action: Clear All Counts */}
          <button
            type="button"
            onClick={onRequestClear}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-rose-200 bg-[#fff5f5] hover:bg-[#fee2e2] px-3 py-1.5 text-xs font-bold text-rose-700 shadow-xs transition-colors cursor-pointer"
            title="Reset all daily meal counts back to 0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear Counts</span>
          </button>
        </div>
      </div>

      {/* 2. Main Table Container */}
      <div className="overflow-x-auto max-h-[620px] relative">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Table Header */}
          <thead className="bg-[#f4eee1] text-[#5c685e] uppercase text-[10.5px] font-bold tracking-wider sticky top-0 z-10 border-b border-[#dcd0b5] shadow-xs">
            <tr>
              <th scope="col" className="w-12 px-3 py-3 text-center font-bold">
                Sl.
              </th>
              <th scope="col" className="w-32 px-3 py-3 font-bold">
                Date
              </th>
              <th scope="col" className="w-24 px-3 py-3 font-bold text-center">
                Day
              </th>
              <th scope="col" className="w-20 px-2 py-3 font-bold text-center">
                Breakfast
              </th>
              <th scope="col" className="w-20 px-2 py-3 font-bold text-center">
                Lunch
              </th>
              <th scope="col" className="w-20 px-2 py-3 font-bold text-center">
                Dinner
              </th>
              <th
                scope="col"
                className="w-18 px-2 py-3 font-bold text-center text-[#8e7139] bg-[#ece4d0]/60"
                title="Recorded for kitchen pantry audit - strictly excluded from billing"
              >
                Snacks*
              </th>
              <th
                scope="col"
                className="w-18 px-2 py-3 font-bold text-center text-[#8e7139] bg-[#ece4d0]/60"
                title="Recorded for kitchen pantry audit - strictly excluded from billing"
              >
                Tea*
              </th>
              <th scope="col" className="w-48 px-3 py-3 font-bold">
                Particulars / Preset
              </th>
              <th scope="col" className="w-24 px-3 py-3 font-bold text-center">
                Bill Qty
              </th>
              <th scope="col" className="min-w-44 px-3 py-3 font-bold">
                Remarks
              </th>
              <th scope="col" className="w-12 px-2 py-3 text-center font-bold">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0e9dc]">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-[#69746a]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-6 h-6 text-[#8e7139]/50" />
                    <p className="text-sm font-semibold text-[#17271e] m-0">
                      No records match the current filter.
                    </p>
                    <p className="text-xs text-[#69746a] m-0">
                      Switch filter to &ldquo;All&rdquo; or click &ldquo;Generate Calendar&rdquo;.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry, index) => {
                const isSunday = entry.isSunday;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isSunday
                        ? "bg-[#fffdf5] hover:bg-[#fbf4de]"
                        : "bg-[#ffffff] hover:bg-[#faf7ef]"
                    }`}
                  >
                    {/* SL. NO */}
                    <td className="px-3 py-2.5 text-center font-mono text-[11px] text-[#69746a] font-semibold">
                      {index + 1}
                    </td>

                    {/* DATE */}
                    <td className="px-3 py-2.5">
                      <input
                        type="date"
                        value={entry.dateString}
                        onChange={(e) =>
                          onUpdateEntry(entry.id, "dateString", e.target.value)
                        }
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-2 py-1 text-xs text-[#17271e] font-mono outline-none"
                      />
                    </td>

                    {/* DAY BADGE */}
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-bold ${
                          isSunday
                            ? "bg-[#fbf6e9] text-[#8e7139] border border-[#ddcca6]"
                            : "bg-[#faf7ef] text-[#5c685e] border border-[#e5ddcd]"
                        }`}
                      >
                        {entry.dayName}
                      </span>
                    </td>

                    {/* BREAKFAST */}
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={entry.breakfast === 0 ? "" : entry.breakfast}
                        placeholder="0"
                        onChange={(e) =>
                          onUpdateEntry(
                            entry.id,
                            "breakfast",
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full text-center h-8 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-1.5 py-1 text-xs font-bold text-[#17271e] outline-none"
                      />
                    </td>

                    {/* LUNCH */}
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={entry.lunch === 0 ? "" : entry.lunch}
                        placeholder="0"
                        onChange={(e) =>
                          onUpdateEntry(
                            entry.id,
                            "lunch",
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full text-center h-8 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-1.5 py-1 text-xs font-bold text-[#17271e] outline-none"
                      />
                    </td>

                    {/* DINNER */}
                    <td className="px-2 py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={entry.dinner === 0 ? "" : entry.dinner}
                        placeholder="0"
                        onChange={(e) =>
                          onUpdateEntry(
                            entry.id,
                            "dinner",
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full text-center h-8 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-1.5 py-1 text-xs font-bold text-[#17271e] outline-none"
                      />
                    </td>

                    {/* SNACKS (Audit Only) */}
                    <td className="px-2 py-2.5 text-center bg-[#faf7ef]/50">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={entry.snacks === 0 ? "" : entry.snacks}
                        placeholder="0"
                        title="Audit only - not included in meal bill"
                        onChange={(e) =>
                          onUpdateEntry(
                            entry.id,
                            "snacks",
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full text-center h-8 rounded-[2px] border border-[#e5ddcd] bg-[#f7f4eb] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-1 py-1 text-xs font-medium text-[#69746a] focus:text-[#17271e] outline-none"
                      />
                    </td>

                    {/* TEA (Audit Only) */}
                    <td className="px-2 py-2.5 text-center bg-[#faf7ef]/50">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={entry.tea === 0 ? "" : entry.tea}
                        placeholder="0"
                        title="Audit only - not included in meal bill"
                        onChange={(e) =>
                          onUpdateEntry(
                            entry.id,
                            "tea",
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full text-center h-8 rounded-[2px] border border-[#e5ddcd] bg-[#f7f4eb] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-1 py-1 text-xs font-medium text-[#69746a] focus:text-[#17271e] outline-none"
                      />
                    </td>

                    {/* PARTICULARS */}
                    <td className="px-3 py-2.5">
                      <select
                        value={entry.particulars}
                        onChange={(e) =>
                          onUpdateEntry(entry.id, "particulars", e.target.value)
                        }
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-2 py-1 text-xs font-medium text-[#17271e] outline-none cursor-pointer"
                      >
                        {PARTICULAR_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* BILL QTY (Auto-computed prominent badge) */}
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[38px] h-7 px-2 rounded-[2px] text-xs font-bold font-mono ${
                          entry.billQty > 0
                            ? "bg-[#123c2c] text-[#faf8f1] shadow-xs"
                            : "bg-[#faf7ef] text-[#8e7139] border border-[#e5ddcd]"
                        }`}
                      >
                        {entry.billQty}
                      </span>
                    </td>

                    {/* REMARKS */}
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        value={entry.remarks}
                        placeholder="Optional remarks"
                        onChange={(e) =>
                          onUpdateEntry(entry.id, "remarks", e.target.value)
                        }
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] hover:bg-white focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] px-2.5 py-1 text-xs text-[#17271e] outline-none"
                      />
                    </td>

                    {/* ACTION (Delete custom row) */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteRow(entry.id)}
                        className="p-1.5 text-[#8e7139] hover:text-rose-600 hover:bg-rose-50 rounded-[2px] transition-colors cursor-pointer"
                        title="Remove date entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Table Footer Audit Note (Section 9) */}
      <div className="p-3.5 bg-[#faf7ef] border-t border-[#e5ddcd] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#69746a]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8e7139] shrink-0" />
          <span className="text-[#5c685e] font-medium">
            <strong>Note:</strong> Snacks and tea quantities are recorded for internal reference and are excluded from the billable quantity.
          </span>
        </div>
        <div className="font-mono text-[11px] text-[#8e7139] font-semibold shrink-0">
          Showing {filteredEntries.length} of {entries.length} rows
        </div>
      </div>
    </div>
  );
}
