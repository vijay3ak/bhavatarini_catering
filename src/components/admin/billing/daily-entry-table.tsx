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
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar Header */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-serif text-base font-semibold text-foreground">
            Daily Ledger Reconciliation
          </h3>
          <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-800/40">
            {entries.length} Dates
          </span>
        </div>

        {/* Filter Tabs & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-emerald-950 text-emerald-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({entries.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("NON-SUNDAYS")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filterMode === "NON-SUNDAYS"
                  ? "bg-emerald-950 text-emerald-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Non-Sundays ({nonSundaysCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("SUNDAYS")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filterMode === "SUNDAYS"
                  ? "bg-amber-500/20 text-amber-400 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sundays ({sundaysCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("NON-ZERO")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filterMode === "NON-ZERO"
                  ? "bg-emerald-950 text-emerald-300 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Billed ({nonZeroCount})
            </button>
          </div>

          {/* Action: Add Custom Row */}
          <button
            type="button"
            onClick={onAddCustomRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Add additional or ad-hoc catering date"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Add Custom Date
          </button>

          {/* Action: Clear All */}
          <button
            type="button"
            onClick={onRequestClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/5 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Reset all daily meal counts back to 0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Counts
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto max-h-[600px] divide-y divide-border relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur-xs border-b border-border shadow-xs">
            <tr>
              <th scope="col" className="w-12 px-3 py-3 text-center font-semibold">
                Sl.
              </th>
              <th scope="col" className="w-32 px-3 py-3 font-semibold">
                Date
              </th>
              <th scope="col" className="w-24 px-3 py-3 font-semibold text-center">
                Day
              </th>
              <th scope="col" className="w-20 px-2 py-3 font-semibold text-center">
                Breakfast
              </th>
              <th scope="col" className="w-20 px-2 py-3 font-semibold text-center">
                Lunch
              </th>
              <th scope="col" className="w-20 px-2 py-3 font-semibold text-center">
                Dinner
              </th>
              <th
                scope="col"
                className="w-18 px-2 py-3 font-semibold text-center text-muted-foreground/80 bg-muted/40"
                title="Recorded for kitchen audit - strictly excluded from billing"
              >
                Snacks*
              </th>
              <th
                scope="col"
                className="w-18 px-2 py-3 font-semibold text-center text-muted-foreground/80 bg-muted/40"
                title="Recorded for kitchen audit - strictly excluded from billing"
              >
                Tea*
              </th>
              <th scope="col" className="w-48 px-3 py-3 font-semibold">
                Particulars / Preset
              </th>
              <th scope="col" className="w-24 px-3 py-3 font-semibold text-center">
                Bill Qty
              </th>
              <th scope="col" className="min-w-44 px-3 py-3 font-semibold">
                Remarks
              </th>
              <th scope="col" className="w-12 px-2 py-3 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="h-6 w-6 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No records match the current filter.</p>
                    <p className="text-xs text-muted-foreground">
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
                    className={`transition-colors hover:bg-muted/40 ${
                      isSunday
                        ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.02]"
                        : "bg-background"
                    }`}
                  >
                    {/* SL. NO */}
                    <td className="px-3 py-2 text-center font-mono text-[11px] text-muted-foreground font-semibold">
                      {index + 1}
                    </td>

                    {/* DATE */}
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={entry.dateString}
                        onChange={(e) =>
                          onUpdateEntry(entry.id, "dateString", e.target.value)
                        }
                        className="w-full rounded border border-input bg-background/80 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                      />
                    </td>

                    {/* DAY BADGE */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          isSunday
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {entry.dayName}
                      </span>
                    </td>

                    {/* BREAKFAST */}
                    <td className="px-2 py-2 text-center">
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
                        className="w-full text-center rounded border border-input bg-background px-1.5 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>

                    {/* LUNCH */}
                    <td className="px-2 py-2 text-center">
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
                        className="w-full text-center rounded border border-input bg-background px-1.5 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>

                    {/* DINNER */}
                    <td className="px-2 py-2 text-center">
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
                        className="w-full text-center rounded border border-input bg-background px-1.5 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>

                    {/* SNACKS (Audit Only) */}
                    <td className="px-2 py-2 text-center bg-muted/20">
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
                        className="w-full text-center rounded border border-border/80 bg-background/50 px-1 py-1 text-xs text-muted-foreground focus:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>

                    {/* TEA (Audit Only) */}
                    <td className="px-2 py-2 text-center bg-muted/20">
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
                        className="w-full text-center rounded border border-border/80 bg-background/50 px-1 py-1 text-xs text-muted-foreground focus:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>

                    {/* PARTICULARS */}
                    <td className="px-3 py-2">
                      <select
                        value={entry.particulars}
                        onChange={(e) =>
                          onUpdateEntry(entry.id, "particulars", e.target.value)
                        }
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                      >
                        {PARTICULAR_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* BILL QTY (Auto-computed read-only badge) */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-10 px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          entry.billQty > 0
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                            : "bg-muted/70 text-muted-foreground"
                        }`}
                      >
                        {entry.billQty}
                      </span>
                    </td>

                    {/* REMARKS */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={entry.remarks}
                        placeholder="Optional remarks"
                        onChange={(e) =>
                          onUpdateEntry(entry.id, "remarks", e.target.value)
                        }
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>

                    {/* ACTION (Delete custom row) */}
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteRow(entry.id)}
                        className="p-1 text-muted-foreground hover:text-rose-500 rounded transition-colors cursor-pointer"
                        title="Remove date entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Audit Note */}
      <div className="p-3 bg-muted/30 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>
            * Snacks & Tea counts are recorded for internal pantry audit only and are strictly excluded from bill quantities.
          </span>
        </div>
        <div className="font-mono text-[11px]">
          Showing {filteredEntries.length} of {entries.length} rows
        </div>
      </div>
    </div>
  );
}
