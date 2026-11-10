"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Save,
  Sparkles,
  FileSpreadsheet,

  CheckCircle2,
  Layers,
  RotateCcw,
  Calendar,
  FileText,
  Printer,
  ArrowRight,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { MOCK_CORPORATE_CUSTOMERS } from "@/lib/data/mock-admin-data";
import type { CorporateCustomer } from "@/types/admin";
import { DailyBillingEntry, BillingRateSource, MultiMealBreakdown } from "@/types/billing";
import {
  getActiveCustomers,
  saveDraftInvoice,
  issueInvoice,
} from "@/lib/services/billing-service";
import { InvoiceStatusBadge } from "@/components/admin/billing/invoices/invoice-status-badge";
import {
  MONTH_NAMES,
  generateMonthlyCalendar,
  calculateRowBillQty,
  applyPresetToAllNonSundays,
  calculateBillingKpis,
  generateSampleBillingData,
  formatINR,
} from "@/lib/utils/billing-calculations";
import { BillingConfigCard } from "@/components/admin/billing/billing-config-card";
import { BillingKpiCards } from "@/components/admin/billing/billing-kpi-cards";
import { DailyEntryTable } from "@/components/admin/billing/daily-entry-table";
import { ClearConfirmModal } from "@/components/admin/billing/clear-confirm-modal";
import { InvoicePreview } from "@/components/admin/billing/invoice-preview";
import {
  getStagedSession,
  clearStagedSession,
} from "@/lib/services/billing-session-store";

const LOCAL_STORAGE_KEY = "bcs_billing_draft_v1";

export default function MonthlyBillingPage() {
  const [customers, setCustomers] = useState<CorporateCustomer[]>(MOCK_CORPORATE_CUSTOMERS);

  // Find initial default customer
  const defaultCustomer =
    customers.find((c) => c.id === "cust-hydac") ||
    customers[0] ||
    MOCK_CORPORATE_CUSTOMERS[0];

  // 1. Navigation View Mode: "LEDGER" (Daily Entry Table) or "INVOICE" (A4 Invoice Preview)
  const [viewMode, setViewMode] = useState<"LEDGER" | "INVOICE">("LEDGER");

  // 2. Configuration State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("cust-hydac");
  const [billNo, setBillNo] = useState<string>("");
  const [month, setMonth] = useState<number>(10); // November (0-indexed)
  const [year, setYear] = useState<number>(2026);
  const [startDate, setStartDate] = useState<string>("2026-11-01");
  const [endDate, setEndDate] = useState<string>("2026-11-30");
  const [invoiceDate, setInvoiceDate] = useState<string>("2026-11-30");
  const [unitLocation, setUnitLocation] = useState<string>(
    defaultCustomer?.deliveryLocation || "CHETTIPALAYAM"
  );

  // Rate handling state: defaults to customer's directory contract rate (₹48 for HYDAC)
  const [rate, setRate] = useState<number>(defaultCustomer?.defaultRate ?? 48.0);
  const [rateSource, setRateSource] = useState<BillingRateSource>("CUSTOMER_DEFAULT");
  const [isDemoSampleActive, setIsDemoSampleActive] = useState<boolean>(false);

  const [activePreset, setActivePreset] = useState<"BREAKFAST & DINNER" | "LUNCH">(
    "BREAKFAST & DINNER"
  );

  // 3. Daily Entries State
  const [dailyEntries, setDailyEntries] = useState<DailyBillingEntry[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Database Draft & Finalization state
  const [draftInvoiceId, setDraftInvoiceId] = useState<string | null>(null);
  const [isIssued, setIsIssued] = useState<boolean>(false);
  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

  // Staged reconciliation import banner state
  const [stagedImportMeta, setStagedImportMeta] = useState<{
    appliedAt: string;
    totalUpdated: number;
    totalRetained: number;
    totalMerged: number;
    totalSkipped: number;
    sourceDocument: string;
  } | null>(null);

  // Active customer object
  const currentCustomer =
    customers.find((c) => c.id === selectedCustomerId) || defaultCustomer;

  // Show auto-dismissing toast feedback
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Revert Staged Import (Undo)
  const handleUndoStagedImport = () => {
    const staged = getStagedSession();
    if (staged && staged.priorEntriesSnapshot) {
      setDailyEntries(staged.priorEntriesSnapshot);
      clearStagedSession();
      setStagedImportMeta(null);
      triggerToast("Reverted reconciled ledger import. Prior calendar restored.");
    }
  };

  // Helper to sync start & end dates when month or year changes
  const updateDatesForMonthYear = (m: number, y: number) => {
    const totalDays = new Date(y, m + 1, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, "0");
    const startIso = `${y}-${pad(m + 1)}-01`;
    const endIso = `${y}-${pad(m + 1)}-${pad(totalDays)}`;
    setStartDate(startIso);
    setEndDate(endIso);
    setInvoiceDate(endIso);
  };

  // Initial Bootstrap: Check staged session first, then saved draft from LocalStorage, else blank calendar
  useEffect(() => {
    // Check URL parameters for deep-linking (e.g. ?view=invoice&sample=true)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("view") === "invoice") {
        setViewMode("INVOICE");
      }
      if (urlParams.get("sample") === "true") {
        handleLoadSample();
        return;
      }
    } catch {
      // Ignore URL parse errors on SSR/static
    }

    // 1. Check for in-session staged reconciliation transfer from ledger upload
    try {
      const staged = getStagedSession();
      if (staged && Array.isArray(staged.dailyEntries) && staged.dailyEntries.length > 0) {
        if (staged.customerId) setSelectedCustomerId(staged.customerId);
        if (staged.billNo) setBillNo(staged.billNo);
        if (typeof staged.month === "number") setMonth(staged.month);
        if (typeof staged.year === "number") setYear(staged.year);
        if (staged.startDate) setStartDate(staged.startDate);
        if (staged.endDate) setEndDate(staged.endDate);
        if (staged.invoiceDate) setInvoiceDate(staged.invoiceDate);
        if (staged.unitLocation) setUnitLocation(staged.unitLocation);
        if (typeof staged.rate === "number") setRate(staged.rate);
        if (staged.rateSource) setRateSource(staged.rateSource);
        if (staged.activePreset) setActivePreset(staged.activePreset);
        setDailyEntries(staged.dailyEntries);
        setStagedImportMeta(staged.auditMeta);
        triggerToast("Loaded reconciled handwritten ledger into active session!");
        return;
      }
    } catch (e) {
      console.warn("Could not load staged billing session:", e);
    }

    // 2. Load from LocalStorage if present
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.customerId) setSelectedCustomerId(draft.customerId);
        if (draft.billNo) setBillNo(draft.billNo);
        if (typeof draft.month === "number") setMonth(draft.month);
        if (typeof draft.year === "number") setYear(draft.year);
        if (draft.startDate) setStartDate(draft.startDate);
        if (draft.endDate) setEndDate(draft.endDate);
        if (draft.invoiceDate) setInvoiceDate(draft.invoiceDate);
        if (draft.unitLocation) setUnitLocation(draft.unitLocation);
        if (typeof draft.rate === "number") setRate(draft.rate);
        if (draft.rateSource) setRateSource(draft.rateSource);
        if (typeof draft.isDemoSampleActive === "boolean")
          setIsDemoSampleActive(draft.isDemoSampleActive);
        if (draft.activePreset) setActivePreset(draft.activePreset);
        if (Array.isArray(draft.dailyEntries) && draft.dailyEntries.length > 0) {
          setDailyEntries(draft.dailyEntries);
          triggerToast("Restored saved billing draft from local storage.");
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load billing draft:", e);
    }

    // Load live customers from Supabase
    getActiveCustomers().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setCustomers(loaded);
      }
    });

    // Default initialization: Generate blank November 2026 calendar at HYDAC default rate (₹48.00)
    const initialCalendar = generateMonthlyCalendar(10, 2026, "BREAKFAST & DINNER");
    setDailyEntries(initialCalendar);
    setRate(defaultCustomer?.defaultRate ?? 48.0);
    setRateSource("CUSTOMER_DEFAULT");
    setIsDemoSampleActive(false);
    updateDatesForMonthYear(10, 2026);
  }, []);

  // When customer changes: automatically load customer default rate & preset
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      if (customer.deliveryLocation) {
        setUnitLocation(customer.deliveryLocation);
      }
      if (customer.defaultRate !== undefined) {
        setRate(customer.defaultRate);
        setRateSource("CUSTOMER_DEFAULT");
      }
      if (
        customer.defaultPreset === "BREAKFAST & DINNER" ||
        customer.defaultPreset === "LUNCH"
      ) {
        setActivePreset(customer.defaultPreset);
      }
      setIsDemoSampleActive(false);
      triggerToast(
        `Switched customer to ${customer.shortCode}. Loaded default contract rate (₹${customer.defaultRate.toFixed(2)}/meal).`
      );
    }
  };

  // When operator manually edits the rate input
  const handleRateChange = (newRate: number, source: BillingRateSource = "CUSTOM") => {
    setRate(newRate);
    setRateSource(source);
    if (source === "CUSTOM") {
      setIsDemoSampleActive(false);
    }
  };

  // When month changes: preserves current rate and rateSource
  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
    updateDatesForMonthYear(newMonth, year);
    const newCalendar = generateMonthlyCalendar(
      newMonth,
      year,
      activePreset,
      dailyEntries,
      false
    );
    setDailyEntries(newCalendar);
    triggerToast(`Generated calendar for ${MONTH_NAMES[newMonth]} ${year}.`);
  };

  // When year changes: preserves current rate and rateSource
  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    updateDatesForMonthYear(month, newYear);
    const newCalendar = generateMonthlyCalendar(
      month,
      newYear,
      activePreset,
      dailyEntries,
      false
    );
    setDailyEntries(newCalendar);
    triggerToast(`Calendar updated for year ${newYear}.`);
  };

  // When "Generate Calendar" button clicked: preserves current rate and rateSource
  const handleGenerateCalendar = (retainExisting: boolean) => {
    const calendar = generateMonthlyCalendar(
      month,
      year,
      activePreset,
      dailyEntries,
      retainExisting
    );
    setDailyEntries(calendar);
    updateDatesForMonthYear(month, year);
    triggerToast(`Calendar refreshed for ${MONTH_NAMES[month]} ${year}.`);
  };

  // Apply active preset to all non-Sunday rows: preserves current rate and rateSource
  const handleApplyPresetToAll = () => {
    const updated = applyPresetToAllNonSundays(dailyEntries, activePreset);
    setDailyEntries(updated);
    const nonSundays = updated.filter((e) => !e.isSunday).length;
    triggerToast(
      `Applied preset "${activePreset}" to all ${nonSundays} non-Sunday dates.`
    );
  };

  // Live row update in daily entry table: preserves current rate and rateSource
  const handleUpdateEntry = (
    id: string,
    field: keyof DailyBillingEntry,
    value: string | number
  ) => {
    setDailyEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updated: DailyBillingEntry = {
          ...entry,
          [field]: value,
          isManualParticulars:
            field === "particulars" ? true : entry.isManualParticulars,
        };

        // Recompute row bill quantity
        updated.billQty = calculateRowBillQty(updated);
        return updated;
      })
    );
  };

  // Multi-Meal breakdown configured for a date
  const handleSaveMultiMeal = (
    id: string,
    breakdown: MultiMealBreakdown
  ) => {
    setDailyEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const bfMeal = breakdown.meals.find((m) => m.mealType === "BREAKFAST" && m.enabled);
        const lunchMeal = breakdown.meals.find((m) => m.mealType === "LUNCH" && m.enabled);
        const dinnerMeal = breakdown.meals.find((m) => m.mealType === "DINNER" && m.enabled);
        const snacksMeal = breakdown.meals.find((m) => m.mealType === "SNACKS" && m.enabled);
        const teaMeal = breakdown.meals.find((m) => m.mealType === "TEA" && m.enabled);

        const updated: DailyBillingEntry = {
          ...entry,
          isMultiMeal: true,
          mealBreakdown: breakdown,
          breakfast: bfMeal ? bfMeal.quantity : 0,
          lunch: lunchMeal ? lunchMeal.quantity : 0,
          dinner: dinnerMeal ? dinnerMeal.quantity : 0,
          snacks: snacksMeal ? snacksMeal.quantity : 0,
          tea: teaMeal ? teaMeal.quantity : 0,
          particulars: "MULTI-MEAL BREAKDOWN",
          isManualParticulars: true,
        };
        updated.billQty = calculateRowBillQty(updated);
        return updated;
      })
    );
    triggerToast(
      `Configured multi-meal breakdown (${breakdown.totalQty} meals, ${formatINR(breakdown.totalAmount)}).`
    );
  };

  // Revert multi-meal row to standard single-preset billing
  const handleRevertMultiMeal = (id: string) => {
    setDailyEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const updated: DailyBillingEntry = {
          ...entry,
          isMultiMeal: false,
          mealBreakdown: undefined,
          particulars: entry.isSunday ? "SUNDAY" : activePreset,
          isManualParticulars: false,
        };
        updated.billQty = calculateRowBillQty(updated);
        return updated;
      })
    );
    triggerToast("Reverted date to standard shift preset.");
  };

  // Add custom row: preserves current rate and rateSource
  const handleAddCustomRow = () => {
    const nextDayNum = dailyEntries.length + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const safeDay = Math.min(nextDayNum, 28);
    const defaultDate = `${year}-${pad(month + 1)}-${pad(safeDay)}`;

    const newRow: DailyBillingEntry = {
      id: `row_custom_${Date.now()}_${nextDayNum}`,
      dayNumber: nextDayNum,
      dateString: defaultDate,
      dayName: "Weekday",
      isSunday: false,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
      tea: 0,
      particulars: activePreset,
      isManualParticulars: true,
      remarks: "Additional entry",
      billQty: 0,
    };

    setDailyEntries((prev) => [...prev, newRow]);
    triggerToast("Added custom date row.");
  };

  // Delete row: preserves current rate and rateSource
  const handleDeleteRow = (id: string) => {
    setDailyEntries((prev) => prev.filter((e) => e.id !== id));
    triggerToast("Removed row from billing ledger.");
  };

  // Reset all quantities back to 0: preserves current rate and rateSource
  const handleConfirmClear = () => {
    setDailyEntries((prev) =>
      prev.map((e) => ({
        ...e,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snacks: 0,
        tea: 0,
        billQty: 0,
      }))
    );
    triggerToast("All daily meal counts have been reset to 0.");
  };

  // Load original prototype demo sample record (November 2026 @ ₹70)
  const handleLoadSample = () => {
    setSelectedCustomerId("cust-hydac");
    setMonth(10);
    setYear(2026);
    setRate(70.0);
    setRateSource("DEMO_SAMPLE");
    setIsDemoSampleActive(true);
    setActivePreset("BREAKFAST & DINNER");
    updateDatesForMonthYear(10, 2026);
    const sample = generateSampleBillingData(10, 2026, 70.0);
    setDailyEntries(sample);
    triggerToast(
      "Loaded reference sample billing scenario (Nov 2026 @ ₹70.00/meal)."
    );
  };

  // Save draft locally & persist to Supabase
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const draft = {
        draftId: draftInvoiceId,
        customerId: selectedCustomerId,
        billNo,
        month,
        year,
        startDate,
        endDate,
        invoiceDate,
        unitLocation,
        rate,
        rateSource,
        isDemoSampleActive,
        activePreset,
        dailyEntries,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      clearStagedSession();
      setStagedImportMeta(null);

      // Save to Supabase backend
      const res = await saveDraftInvoice({
        draftId: draftInvoiceId,
        customerId: selectedCustomerId,
        month,
        year,
        startDate,
        endDate,
        invoiceDate,
        unitLocation,
        rate,
        rateSource,
        activePreset,
        dailyEntries,
        kpis,
      });

      if (res.success && res.invoiceId) {
        setDraftInvoiceId(res.invoiceId);
        triggerToast("Draft billing state saved to Supabase database!");
      } else {
        triggerToast("Draft saved locally in your browser.");
      }
    } catch (err) {
      console.warn("Storage save error:", err);
      triggerToast("Could not save draft to local storage.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Issue & Finalize official invoice
  const handleIssueInvoice = async () => {
    if (dailyEntries.length === 0) {
      triggerToast("Cannot issue invoice with 0 daily records.");
      return;
    }

    const confirmed = window.confirm(
      `Issue official catering invoice for ${currentCustomer?.name} (${MONTH_NAMES[month]} ${year})?\n\n` +
      `Total Meals: ${kpis.totalBillQty.toLocaleString("en-IN")}\n` +
      `Total Amount: ₹${kpis.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}\n\n` +
      `Once issued, a permanent invoice number (BCS/YYYY-YY/XXX) will be assigned and the financial figures will be permanently locked against alteration.`
    );
    if (!confirmed) return;

    setIsIssuing(true);
    try {
      // 1. Ensure latest draft is in Supabase
      const draftRes = await saveDraftInvoice({
        draftId: draftInvoiceId,
        customerId: selectedCustomerId,
        month,
        year,
        startDate,
        endDate,
        invoiceDate,
        unitLocation,
        rate,
        rateSource,
        activePreset,
        dailyEntries,
        kpis,
      });

      const targetId = draftRes.invoiceId || draftInvoiceId;
      if (!targetId) {
        triggerToast(draftRes.error || "Failed to create draft record before issuing.");
        setIsIssuing(false);
        return;
      }

      setDraftInvoiceId(targetId);

      // 2. Issue the invoice
      const issueRes = await issueInvoice(targetId);
      if (issueRes.success && issueRes.invoiceNumber) {
        setBillNo(issueRes.invoiceNumber);
        setIsIssued(true);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        clearStagedSession();
        setStagedImportMeta(null);
        triggerToast(`Invoice ${issueRes.invoiceNumber} successfully issued and finalized!`);
      } else {
        triggerToast(issueRes.error || "Failed to issue invoice in database.");
      }
    } catch (err: any) {
      console.error("Error issuing invoice:", err);
      triggerToast(err.message || "Failed to issue invoice.");
    } finally {
      setIsIssuing(false);
    }
  };

  // Compute live KPIs derived dynamically from daily entries and rate
  const kpis = useMemo(() => {
    return calculateBillingKpis(dailyEntries, rate, rateSource);
  }, [dailyEntries, rate, rateSource]);

  return (
    <div className="space-y-6 pb-12 print:space-y-0 print:pb-0 print:m-0 print:p-0">
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-[2px] bg-[#123c2c] text-[#faf8f1] border border-[#c7a45b] px-4 py-2.5 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 print:hidden">
          <CheckCircle2 className="h-4 w-4 text-[#c7a45b] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Staged Reconciliation Session Notification Banner */}
      {stagedImportMeta && (
        <div
          id="staged-reconciliation-banner"
          className="print:hidden p-4 rounded-[2px] bg-[#f5f8f5] border-2 border-[#123c2c] text-[#123c2c] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#123c2c] text-[#faf8f1] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#c7a45b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#123c2c]/10 text-[#123c2c] border border-[#123c2c]/20">
                  In-Session Only • Unsaved Draft
                </span>
                <span className="text-xs text-[#5c685e] font-medium">
                  {stagedImportMeta.sourceDocument}
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-[#123c2c] mt-0.5 m-0">
                Reconciled Handwritten Ledger Applied ({stagedImportMeta.totalUpdated} dates updated, {stagedImportMeta.totalMerged} merged)
              </h4>
              <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                These records are active in your current session. Click &quot;Save Draft&quot; to persist to browser storage, or &quot;Undo Import&quot; to revert to prior entries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              type="button"
              id="btn-undo-staged-import"
              onClick={handleUndoStagedImport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#17271e] bg-white hover:bg-[#faf7ef] border border-[#dcd0b5] rounded-[2px] transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
              <span>Undo Import</span>
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a4a38] rounded-[2px] transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
              <span>Save Draft Locally</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Page Header & Operational Toolbar (Section 3) */}
      <div className="print:hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-[#e5ddcd]">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#8e7139] uppercase tracking-[2px] mb-1">
            <Receipt className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Monthly Billing Management</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#123c2c] tracking-tight m-0">
            Monthly Catering Billing
          </h1>
          <p className="text-xs md:text-sm text-[#5c685e] mt-1 max-w-2xl leading-relaxed m-0">
            Manage daily meal quantities, review billing totals and prepare customer invoices for the selected billing period.
          </p>
        </div>

        {/* View Mode Segmented Switcher & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main View Switcher: Ledger vs Invoice */}
          <div className="flex items-center rounded-[2px] border border-[#dcd0b5] bg-[#f4eee1] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("LEDGER")}
              className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                viewMode === "LEDGER"
                  ? "bg-[#123c2c] text-[#faf8f1] font-bold shadow-xs"
                  : "text-[#5c685e] hover:text-[#17271e] font-semibold"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Ledger</span>
              <span className="text-[10px] opacity-80 font-mono">
                ({dailyEntries.length}d)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("INVOICE")}
              className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                viewMode === "INVOICE"
                  ? "bg-[#123c2c] text-[#faf8f1] font-bold shadow-xs"
                  : "text-[#5c685e] hover:text-[#17271e] font-semibold"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice Preview</span>
              <span className="text-[10px] opacity-80 font-mono">
                ({formatINR(kpis.totalAmount)})
              </span>
            </button>
          </div>

          {/* Action: Load Sample Record */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#ddcca6] bg-[#fbf6e9] hover:bg-[#f4eee1] px-3 py-2 text-xs font-bold text-[#8e7139] transition-colors cursor-pointer shadow-xs"
            title="Load reference scenario (November 2026 @ ₹70.00)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c7a45b]" />
            <span>Load Sample Record</span>
          </button>

          {/* Action: Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#dcd0b5] bg-[#ffffff] hover:bg-[#faf7ef] px-3 py-2 text-xs font-bold text-[#123c2c] transition-colors cursor-pointer shadow-xs"
            title="Save draft locally to browser"
          >
            <Save className="w-3.5 h-3.5 text-[#123c2c]" />
            <span>Save Draft</span>
          </button>

          {/* Secondary Links */}
          <Link
            href="/admin/billing/invoices"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#dcd0b5] bg-[#ffffff] hover:bg-[#faf7ef] px-3 py-2 text-xs font-semibold text-[#5c685e] hover:text-[#123c2c] transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Invoices Archive</span>
          </Link>

        </div>
      </div>

      {/* VIEW 1: DAILY LEDGER VIEW */}
      {viewMode === "LEDGER" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Demo Sample Active Banner */}
          {isDemoSampleActive && (
            <div className="rounded-[2px] border border-[#c7a45b]/50 bg-[#fdfaf3] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[2px] bg-[#fbf6e9] border border-[#ddcca6] text-[#8e7139] grid place-items-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-[#17271e] uppercase tracking-wider">
                      Demo Sample Scenario Active
                    </span>
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#fbf6e9] text-[#8e7139] border border-[#ddcca6]">
                      November 2026 • ₹70.00 / Meal
                    </span>
                  </div>
                  <p className="text-xs text-[#69746a] leading-relaxed m-0">
                    Displaying reference billing scenario: 1,704 billable meals @ ₹70.00 = <strong className="text-[#17271e]">₹1,19,280.00</strong> pre-tax. This is demonstration test data and does not alter HYDAC&apos;s directory contract rate (₹48.00).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRate(48.0);
                  setRateSource("CUSTOMER_DEFAULT");
                  setIsDemoSampleActive(false);
                  triggerToast("Applied HYDAC customer default rate (₹48.00/meal).");
                }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-[2px] border border-[#dcd0b5] bg-[#ffffff] hover:bg-[#faf7ef] px-3 py-1.5 text-xs font-bold text-[#123c2c] transition-colors cursor-pointer shadow-xs"
                title="Reset to HYDAC default rate of ₹48.00/meal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>Apply HYDAC Rate (₹48.00)</span>
              </button>
            </div>
          )}

          {/* Subtle Information Banner (Section 4) */}
          <div className="rounded-[2px] border border-[#c8decb] bg-[#f5f8f5] px-4 py-3 flex items-start gap-3 shadow-xs">
            <Info className="w-4 h-4 text-[#123c2c] shrink-0 mt-0.5" />
            <p className="text-xs text-[#123c2c] font-medium leading-relaxed m-0">
              Billing calculations update automatically as daily meal quantities are entered. Review the totals before preparing the customer invoice.
            </p>
          </div>

          {/* 1. Configuration Card (Section 5) */}
          <BillingConfigCard
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={handleCustomerChange}
            billNo={billNo}
            onBillNoChange={setBillNo}
            month={month}
            onMonthChange={handleMonthChange}
            year={year}
            onYearChange={handleYearChange}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            invoiceDate={invoiceDate}
            onInvoiceDateChange={setInvoiceDate}
            unitLocation={unitLocation}
            onUnitLocationChange={setUnitLocation}
            rate={rate}
            rateSource={rateSource}
            onRateChange={handleRateChange}
            activePreset={activePreset}
            onPresetChange={(p) => setActivePreset(p)}
            onGenerateCalendar={handleGenerateCalendar}
            onApplyPresetToAll={handleApplyPresetToAll}
          />

          {/* 2. KPI Summary Cards & Amount in Words (Section 6) */}
          <BillingKpiCards
            kpis={kpis}
            monthName={MONTH_NAMES[month]}
            year={year}
          />

          {/* 3. Editable Daily Entry Table (Section 7, 8, 9) */}
          <DailyEntryTable
            entries={dailyEntries}
            onUpdateEntry={handleUpdateEntry}
            onDeleteRow={handleDeleteRow}
            onAddCustomRow={handleAddCustomRow}
            onRequestClear={() => setIsClearModalOpen(true)}
            defaultRate={rate}
            onSaveMultiMeal={handleSaveMultiMeal}
            onRevertMultiMeal={handleRevertMultiMeal}
          />

          {/* 4. Customer Invoice Preparation Section (Section 10) */}
          <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#123c2c] shrink-0">
                <FileText className="w-5 h-5 text-[#123c2c]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#123c2c] m-0">
                  Customer Invoice
                </h3>
                <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                  Review the billing details and prepare the customer invoice for printing or export.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("INVOICE")}
              className="inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#123c2c] px-5 py-2.5 text-xs font-bold text-[#faf8f1] shadow-xs hover:bg-[#1a4a38] transition-colors cursor-pointer shrink-0"
            >
              <span>Preview &amp; Print Invoice</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#c7a45b]" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: FORMAL A4 INVOICE PREVIEW VIEW */}
      {viewMode === "INVOICE" && (
        <div className="animate-in fade-in duration-150 print:animate-none print:m-0 print:p-0 print:overflow-visible">
          <InvoicePreview
            customer={currentCustomer}
            billNo={billNo}
            month={month}
            year={year}
            startDate={startDate}
            endDate={endDate}
            invoiceDate={invoiceDate}
            unitLocation={unitLocation}
            rate={rate}
            rateSource={rateSource}
            entries={dailyEntries}
            kpis={kpis}
            onBackToEdit={() => setViewMode("LEDGER")}
            onIssueInvoice={handleIssueInvoice}
            isIssuing={isIssuing}
            isIssued={isIssued}
            statusBadge={isIssued ? <InvoiceStatusBadge status="GENERATED" size="sm" /> : undefined}
          />
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
