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
    <div className="rounded-xl border border-[#e2d9c8] bg-white p-4 shadow-xs space-y-3.5">
      {/* Top Filter Bar: Search + Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Search by Number, Customer, or Location */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a968c]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bill no, client, location..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-[#d8cfbe] bg-[#faf8f1]/50 text-[#17271e] placeholder:text-[#8a968c] focus:outline-none focus:ring-1 focus:ring-[#123c2c] focus:border-[#123c2c] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a968c] hover:text-[#17271e] p-0.5 rounded transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Customer Filter */}
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a968c] pointer-events-none" />
          <select
            value={selectedCustomerId}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-[#d8cfbe] bg-[#faf8f1]/50 text-[#17271e] focus:outline-none focus:ring-1 focus:ring-[#123c2c] focus:border-[#123c2c] appearance-none transition-colors"
          >
            <option value="ALL">All Corporate Clients</option>
            {customerOptions.map((cust) => (
              <option key={cust.id} value={cust.id}>
                {cust.name} ({cust.shortCode})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a968c]">
            <Filter className="w-3 h-3" />
          </div>
        </div>

        {/* 3. Billing Period Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a968c] pointer-events-none" />
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-[#d8cfbe] bg-[#faf8f1]/50 text-[#17271e] focus:outline-none focus:ring-1 focus:ring-[#123c2c] focus:border-[#123c2c] appearance-none transition-colors"
          >
            <option value="ALL">All Billing Periods</option>
            {periodOptions.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a968c]">
            <Filter className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Status Filter */}
        <div className="relative">
          <CheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a968c] pointer-events-none" />
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-[#d8cfbe] bg-[#faf8f1]/50 text-[#17271e] focus:outline-none focus:ring-1 focus:ring-[#123c2c] focus:border-[#123c2c] appearance-none transition-colors"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">PAID (Settled)</option>
            <option value="PENDING">PENDING (Awaiting Payment)</option>
            <option value="GENERATED">GENERATED (Draft/Dispatched)</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a968c]">
            <Filter className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Filter Status & Reset Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0e9dc] text-xs">
        <div className="flex items-center gap-2 text-[#5a685e]">
          <span>
            Showing <strong className="text-[#123c2c]">{totalFiltered}</strong> of{" "}
            <strong className="text-[#123c2c]">{totalCount}</strong> invoices
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#c7a45b]/15 text-[#8e7139] border border-[#c7a45b]/30">
              Filters Active
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#8e7139] hover:text-[#123c2c] bg-[#faf8f1] hover:bg-[#f0e9dc] border border-[#d8cfbe] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
