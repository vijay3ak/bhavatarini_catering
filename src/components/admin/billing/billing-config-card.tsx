"use client";

import React from "react";
import { Building2, Calendar, CheckCheck, RefreshCw, FileText, MapPin, IndianRupee } from "lucide-react";
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
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Monthly Billing Configuration</h2>
            <p className="text-xs text-muted-foreground">
              Select corporate client, billing period, shift preset and unit rate
            </p>
          </div>
        </div>

        {/* Action Button: Generate Calendar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onGenerateCalendar(false)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors cursor-pointer"
            title="Generate full calendar days for selected month & year"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Generate Calendar
          </button>
        </div>
      </div>

      {/* Row 1: Customer Selection & Tax Registration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center justify-between">
            <span>Corporate Client Preset</span>
            <span className="text-[11px] text-muted-foreground font-normal">Auto-fills address & tax info</span>
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shortCode})
              </option>
            ))}
          </select>
        </div>

        {/* Customer Tax Badges */}
        <div className="md:col-span-6 flex flex-col justify-end space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tax Identifiers</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs border border-border">
              <span className="font-semibold text-muted-foreground">GSTIN:</span>
              <span className="font-mono text-foreground font-medium">{currentCustomer?.gstin || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs border border-border">
              <span className="font-semibold text-muted-foreground">PAN:</span>
              <span className="font-mono text-foreground font-medium">{currentCustomer?.pan || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs border border-border">
              <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-foreground">{currentCustomer?.deliveryLocation || currentCustomer?.billingAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Billing Metadata (Invoice #, Month, Year, Start, End, Invoice Date) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Bill No */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Bill Number</span>
          </label>
          <input
            type="text"
            value={billNo}
            onChange={(e) => onBillNoChange(e.target.value)}
            placeholder="e.g. BCS/2026-27/084"
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Month */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Billing Month</span>
          </label>
          <select
            value={month}
            onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Year</label>
          <input
            type="number"
            min={2020}
            max={2035}
            value={year}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10) || 2026)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Period Start Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Period Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Period End Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Period End</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Invoice Date */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Invoice Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => onInvoiceDateChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Row 3: Unit Location, Meal Rate & Default Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-border/60 items-center">
        {/* Unit Location */}
        <div className="sm:col-span-4 space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">Delivery Unit / Plant</label>
          <input
            type="text"
            value={unitLocation}
            onChange={(e) => onUnitLocationChange(e.target.value)}
            placeholder="e.g. CHETTIPALAYAM / UNIT II"
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground uppercase focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Rate (₹ / meal) */}
        <div className="sm:col-span-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <label htmlFor="cfg-unit-rate" className="flex items-center gap-1 cursor-pointer">
              <IndianRupee className="h-3 w-3" />
              <span>Unit Rate (₹/meal)</span>
            </label>
            {/* Subtle rate status indicator */}
            {rateSource === "CUSTOMER_DEFAULT" && (
              <span
                className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                title="Default contract rate loaded from customer directory"
              >
                Customer default
              </span>
            )}
            {rateSource === "DEMO_SAMPLE" && (
              <span
                className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                title="Prototype demo sample rate (November 2026 scenario)"
              >
                Demo sample rate
              </span>
            )}
            {rateSource === "CUSTOM" && (
              <span
                className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20"
                title="Manually edited rate for this billing session"
              >
                Custom rate
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-muted-foreground font-semibold">
              ₹
            </span>
            <input
              id="cfg-unit-rate"
              type="number"
              step="0.5"
              min="0"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value) || 0, "CUSTOM")}
              className="w-full pl-7 pr-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Shift Preset Selector & Apply All Button */}
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
            <span>Shift Meal Particulars Preset</span>
            <button
              type="button"
              onClick={onApplyPresetToAll}
              className="text-[11px] text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              title="Apply active preset to all non-Sunday rows in table"
            >
              <CheckCheck className="h-3 w-3" />
              Apply to All Non-Sundays
            </button>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPresetChange("BREAKFAST & DINNER")}
              className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                activePreset === "BREAKFAST & DINNER"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-700/60 font-semibold"
                  : "bg-background text-muted-foreground border-input hover:bg-muted/50"
              }`}
            >
              Breakfast & Dinner
            </button>
            <button
              type="button"
              onClick={() => onPresetChange("LUNCH")}
              className={`flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                activePreset === "LUNCH"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-700/60 font-semibold"
                  : "bg-background text-muted-foreground border-input hover:bg-muted/50"
              }`}
            >
              Lunch Full Meals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
