"use client";

import React from "react";
import {
  Building2,
  Calendar,
  CheckCheck,
  RefreshCw,
  FileText,
  MapPin,
  IndianRupee,
  Hash,
  Clock,
  CalendarDays,
} from "lucide-react";
import { CorporateCustomer } from "@/types/admin";
import { BillingRateSource } from "@/types/billing";
import { MONTH_NAMES } from "@/lib/utils/billing-calculations";

interface BillingConfigCardProps {
  customers: CorporateCustomer[];
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  billNo: string;
  onBillNoChange: (val: string) => void;
  month: number;
  onMonthChange: (val: number) => void;
  year: number;
  onYearChange: (val: number) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  invoiceDate: string;
  onInvoiceDateChange: (val: string) => void;
  unitLocation: string;
  onUnitLocationChange: (val: string) => void;
  rate: number;
  rateSource: BillingRateSource;
  onRateChange: (val: number, source?: BillingRateSource) => void;
  activePreset: "BREAKFAST & DINNER" | "LUNCH";
  onPresetChange: (preset: "BREAKFAST & DINNER" | "LUNCH") => void;
  onGenerateCalendar: (retainExisting: boolean) => void;
  onApplyPresetToAll: () => void;
}

export function BillingConfigCard({
  customers,
  selectedCustomerId,
  onCustomerChange,
  billNo,
  onBillNoChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  invoiceDate,
  onInvoiceDateChange,
  unitLocation,
  onUnitLocationChange,
  rate,
  rateSource,
  onRateChange,
  activePreset,
  onPresetChange,
  onGenerateCalendar,
  onApplyPresetToAll,
}: BillingConfigCardProps) {
  const currentCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-6">
      {/* 1. Section Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e5ddcd]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
            <Building2 className="w-5 h-5 text-[#123c2c]" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-bold text-[#123c2c] m-0">
              Monthly Billing Configuration
            </h2>
            <p className="text-xs text-[#5c685e] mt-0.5 m-0">
              Select corporate client, billing period, shift preset and unit rate
            </p>
          </div>
        </div>

        {/* Action Button: Generate Calendar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onGenerateCalendar(false)}
            className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#123c2c] px-4 py-2 text-xs font-bold text-[#faf8f1] shadow-xs hover:bg-[#1a4a38] transition-colors cursor-pointer"
            title="Generate full calendar days for selected month & year"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#c7a45b]" />
            <span>Generate Calendar</span>
          </button>
        </div>
      </div>

      {/* 2. Group 1: Corporate Client & Business Identifiers */}
      <div className="space-y-3">
        <div className="text-[10.5px] font-bold tracking-[1.5px] uppercase text-[#8e7139]">
          Client Information
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Corporate Client Preset Dropdown */}
          <div className="md:col-span-6 space-y-1.5">
            <div className="h-6 flex items-center justify-between text-xs font-semibold text-[#17271e]">
              <span>Corporate Client Preset</span>
              <span className="text-[11px] text-[#69746a] font-normal">
                Auto-loads plant &amp; contract rate
              </span>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => onCustomerChange(e.target.value)}
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 py-1.5 text-xs font-medium text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Client Identifier Chips */}
          <div className="md:col-span-6 space-y-1.5">
            <div className="h-6 flex items-center text-xs font-semibold text-[#17271e]">
              <span>Client Identifiers</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] text-xs box-border">
                <span className="font-semibold text-[#69746a]">GSTIN:</span>
                <span className="font-mono text-[#17271e] font-semibold">
                  {currentCustomer?.gstin || "â€”"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] text-xs box-border">
                <span className="font-semibold text-[#69746a]">PAN:</span>
                <span className="font-mono text-[#17271e] font-semibold">
                  {currentCustomer?.pan || "â€”"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] text-xs box-border">
                <MapPin className="w-3.5 h-3.5 text-[#8e7139]" />
                <span className="text-[#17271e] font-medium">
                  {currentCustomer?.deliveryLocation || currentCustomer?.billingAddress}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Group 2: Billing Period & Document Metadata (Perfect Precision Grid) */}
      <div className="space-y-3 pt-2 border-t border-[#f0e9dc]">
        <div className="text-[10.5px] font-bold tracking-[1.5px] uppercase text-[#8e7139]">
          Billing Period &amp; Dates
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 items-start">
          {/* Bill No */}
          <div className="space-y-1.5 min-w-0">
            <label className="h-5 flex items-center gap-1 text-[11px] font-semibold text-[#5c685e] truncate">
              <Hash className="w-3 h-3 text-[#8e7139] shrink-0" />
              <span className="truncate">Bill Number</span>
            </label>
            <input
              type="text"
              value={billNo}
              onChange={(e) => onBillNoChange(e.target.value)}
              placeholder="e.g. BCS/2026-27/084"
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2.5 text-xs text-[#17271e] font-mono font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border"
            />
          </div>

          {/* Month */}
          <div className="space-y-1.5 min-w-0">
            <label className="h-5 flex items-center gap-1 text-[11px] font-semibold text-[#5c685e] truncate">
              <Calendar className="w-3 h-3 text-[#8e7139] shrink-0" />
              <span className="truncate">Billing Month</span>
            </label>
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer box-border"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1.5 min-w-0">
            <label className="h-5 flex items-center gap-1 text-[11px] font-semibold text-[#5c685e] truncate">
              <Clock className="w-3 h-3 text-[#8e7139] shrink-0" />
              <span className="truncate">Year</span>
            </label>
            <input
              type="number"
              min={2020}
              max={2035}
              value={year}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10) || 2026)}
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2.5 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border"
            />
          </div>

          {/* Period Start Date */}
          <div className="space-y-1.5 min-w-0">
            <label className="h-5 flex items-center gap-1 text-[11px] font-semibold text-[#5c685e] truncate">
              <CalendarDays className="w-3 h-3 text-[#8e7139] shrink-0" />
              <span className="truncate">Period Start</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border min-w-0 max-w-full"
            />
          </div>

          {/* Period End Date */}
          <div className="space-y-1.5 min-w-0">
            <label className="h-5 flex items-center gap-1 text-[11px] font-semibold text-[#5c685e] truncate">
              <CalendarDays className="w-3 h-3 text-[#8e7139] shrink-0" />
              <span className="truncate">Period End</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border min-w-0 max-w-full"
            />
          </div>

          {/* Invoice Date */}
          <div className="space-y-1.5 min-w-0">
            <label className="h-5 flex items-center gap-1 text-[11px] font-semibold text-[#5c685e] truncate">
              <FileText className="w-3 h-3 text-[#8e7139] shrink-0" />
              <span className="truncate">Invoice Date</span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => onInvoiceDateChange(e.target.value)}
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border min-w-0 max-w-full"
            />
          </div>
        </div>
      </div>

      {/* 4. Group 3: Delivery Unit, Rate Configuration & Shift Preset (Aligned Baseline) */}
      <div className="space-y-3 pt-2 border-t border-[#f0e9dc]">
        <div className="text-[10.5px] font-bold tracking-[1.5px] uppercase text-[#8e7139]">
          Delivery Unit &amp; Meal Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
          {/* Unit Location */}
          <div className="sm:col-span-4 space-y-1.5">
            <div className="h-6 flex items-center text-[11px] font-semibold text-[#5c685e]">
              <span>Delivery Unit / Plant</span>
            </div>
            <input
              type="text"
              value={unitLocation}
              onChange={(e) => onUnitLocationChange(e.target.value)}
              placeholder="e.g. CHETTIPALAYAM / UNIT II"
              className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-2.5 text-xs text-[#17271e] font-medium uppercase focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border"
            />
          </div>

          {/* Rate (â‚¹ / meal) */}
          <div className="sm:col-span-3 space-y-1.5">
            <div className="h-6 flex items-center justify-between text-[11px] font-semibold text-[#5c685e]">
              <label htmlFor="cfg-unit-rate" className="flex items-center gap-1 cursor-pointer">
                <IndianRupee className="w-3 h-3 text-[#8e7139]" />
                <span>Unit Rate (â‚¹/meal)</span>
              </label>
              {/* Rate Source Chip */}
              {rateSource === "CUSTOMER_DEFAULT" && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#123c2c] border border-[#dcd0b5]"
                  title="Default contract rate loaded from customer directory"
                >
                  Customer Default
                </span>
              )}
              {rateSource === "DEMO_SAMPLE" && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#fbf6e9] text-[#8e7139] border border-[#ddcca6]"
                  title="Prototype demo sample rate (November 2026 scenario)"
                >
                  Sample Rate
                </span>
              )}
              {rateSource === "CUSTOM" && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5]"
                  title="Manually edited rate for this billing session"
                >
                  Custom Rate
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-[#8e7139] font-bold">
                â‚¹
              </span>
              <input
                id="cfg-unit-rate"
                type="number"
                step="0.5"
                min="0"
                value={rate}
                onChange={(e) => onRateChange(parseFloat(e.target.value) || 0, "CUSTOM")}
                className="w-full h-9 pl-7 pr-2.5 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] text-xs font-bold text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none box-border"
              />
            </div>
          </div>

          {/* Shift Preset Selector & Apply All Button */}
          <div className="sm:col-span-5 space-y-1.5">
            <div className="h-6 flex items-center justify-between text-[11px] font-semibold text-[#5c685e]">
              <span>Shift Meal Preset</span>
              <button
                type="button"
                onClick={onApplyPresetToAll}
                className="text-[11px] text-[#8e7139] font-semibold hover:text-[#123c2c] inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="Apply active preset to all non-Sunday rows in table"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Apply to All Non-Sundays</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onPresetChange("BREAKFAST & DINNER")}
                className={`flex items-center justify-center h-9 px-2.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer box-border ${
                  activePreset === "BREAKFAST & DINNER"
                    ? "bg-[#123c2c] text-[#faf8f1] border border-[#123c2c] shadow-xs"
                    : "bg-[#faf8f1] text-[#5c685e] border border-[#dcd0b5] hover:bg-[#eee7d7]"
                }`}
              >
                Breakfast &amp; Dinner
              </button>
              <button
                type="button"
                onClick={() => onPresetChange("LUNCH")}
                className={`flex items-center justify-center h-9 px-2.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer box-border ${
                  activePreset === "LUNCH"
                    ? "bg-[#123c2c] text-[#faf8f1] border border-[#123c2c] shadow-xs"
                    : "bg-[#faf8f1] text-[#5c685e] border border-[#dcd0b5] hover:bg-[#eee7d7]"
                }`}
              >
                Lunch Full Meals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
