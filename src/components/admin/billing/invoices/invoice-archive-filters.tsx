"use client";

import React from "react";
import { Search, X, Filter, RotateCcw, Building2, Calendar, CheckSquare } from "lucide-react";
import type { InvoiceArchiveStatus } from "@/types/billing";

interface CustomerOption {
  id: string;
  name: string;
  shortCode: string;
}

interface InvoiceArchiveFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  customerOptions: CustomerOption[];
  periodOptions: string[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalFiltered: number;
  totalCount: number;
}

export function InvoiceArchiveFilters({
  searchQuery,
  onSearchChange,
  selectedCustomerId,
  onCustomerChange,
  selectedPeriod,
  onPeriodChange,
  selectedStatus,
  onStatusChange,
  customerOptions,
  periodOptions,
  hasActiveFilters,
  onResetFilters,
  totalFiltered,
  totalCount,
}: InvoiceArchiveFiltersProps) {
  return (
    <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-4 shadow-xs space-y-3.5">
      {/* Top Filter Bar: Search + Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Search by Number, Customer, or Location */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e7139]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bill no, client, location..."
            className="w-full h-9 pl-9 pr-8 text-xs rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] text-[#17271e] placeholder:text-[#69746a] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e7139] hover:text-[#17271e] p-0.5 rounded transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Customer Filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e7139] pointer-events-none" />
          <select
            value={selectedCustomerId}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-full h-9 pl-8 pr-7 text-xs rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] appearance-none outline-none transition-colors cursor-pointer"
          >
            <option value="ALL">All Corporate Clients</option>
            {customerOptions.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} ({cust.shortCode})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e7139]">
            <Filter className="w-3 h-3" />
          </div>
        </div>

        {/* 3. Billing Period Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e7139] pointer-events-none" />
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full h-9 pl-8 pr-7 text-xs rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] appearance-none outline-none transition-colors cursor-pointer"
          >
            <option value="ALL">All Billing Periods</option>
            {periodOptions.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e7139]">
            <Filter className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Status Filter */}
        <div className="relative">
          <CheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e7139] pointer-events-none" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full h-9 pl-8 pr-7 text-xs rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] appearance-none outline-none transition-colors cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid (Settled)</option>
            <option value="PENDING">Pending (Active Cycle)</option>
            <option value="OVERDUE">Overdue (&gt; 30 Days)</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8e7139]">
            <Filter className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Reset Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0e9dc] text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-[#5c685e]">
            <span className="font-semibold text-[#17271e]">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] text-[#123c2c]">
                Search: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCustomerId !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] text-[#123c2c]">
                Client: {selectedCustomerId}
                <button
                  type="button"
                  onClick={() => onCustomerChange("ALL")}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPeriod !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] text-[#123c2c]">
                Period: {selectedPeriod}
                <button
                  type="button"
                  onClick={() => onPeriodChange("ALL")}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] text-[#123c2c]">
                Status: {selectedStatus}
                <button
                  type="button"
                  onClick={() => onStatusChange("ALL")}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#69746a] font-medium">
              Showing <strong>{totalFiltered}</strong> of {totalCount} records
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8e7139] hover:text-[#123c2c] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
