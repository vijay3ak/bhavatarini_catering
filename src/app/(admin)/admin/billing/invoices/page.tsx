"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { ArchivedInvoice } from "@/types/billing";
import { getInvoices, getInvoiceDetails } from "@/lib/services/billing-service";
import { InvoiceArchiveKpiCards } from "@/components/admin/billing/invoices/invoice-archive-kpi-cards";
import { InvoiceArchiveFilters } from "@/components/admin/billing/invoices/invoice-archive-filters";
import { InvoiceArchiveTable } from "@/components/admin/billing/invoices/invoice-archive-table";
import { InvoicePreview } from "@/components/admin/billing/invoice-preview";
import { InvoiceStatusBadge } from "@/components/admin/billing/invoices/invoice-status-badge";
import { RecordPaymentModal } from "@/components/admin/billing/invoices/record-payment-modal";

export default function InvoiceHistoryArchivePage() {
  const [invoices, setInvoices] = useState<ArchivedInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Inspection & Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<ArchivedInvoice | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<ArchivedInvoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  // Fetch invoices from Supabase
  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const liveData = await getInvoices();
      setInvoices(liveData || []);
    } catch (err: unknown) {
      console.warn("Could not query invoices from database:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to load invoices from database. Please verify your connection."
      );
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Extract unique customer options
  const customerOptions = useMemo(() => {
    const custMap = new Map<string, { id: string; name: string; shortCode: string }>();
    for (const inv of invoices) {
      if (inv.customer) {
        custMap.set(inv.customer.id || inv.customer.shortCode, {
          id: inv.customer.id || inv.customer.shortCode,
          name: inv.customer.name,
          shortCode: inv.customer.shortCode,
        });
      }
    }
    return Array.from(custMap.values());
  }, [invoices]);

  // Extract unique billing period options (sorted newest first)
  const periodOptions = useMemo(() => {
    const periodSet = new Set<string>();
    for (const inv of invoices) {
      periodSet.add(`${inv.month} ${inv.year}`);
    }
    return Array.from(periodSet);
  }, [invoices]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchQuery.trim() !== "" ||
      selectedCustomer !== "ALL" ||
      selectedPeriod !== "ALL" ||
      selectedStatus !== "ALL"
  );

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCustomer("ALL");
    setSelectedPeriod("ALL");
    setSelectedStatus("ALL");
  };

  // Filter & sort invoices (newest invoice date first)
  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // 1. Text Search across bill no, client name, code, delivery location
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((inv) => {
        const billNo = (inv.billNo || "").toLowerCase();
        const custName = (inv.customer.name || "").toLowerCase();
        const custCode = (inv.customer.shortCode || "").toLowerCase();
        const loc = (inv.unitLocation || "").toLowerCase();
        return (
          billNo.includes(q) ||
          custName.includes(q) ||
          custCode.includes(q) ||
          loc.includes(q)
        );
      });
    }

    // 2. Customer Filter
    if (selectedCustomer !== "ALL") {
      result = result.filter(
        (inv) =>
          inv.customer.id === selectedCustomer ||
          inv.customer.shortCode === selectedCustomer
      );
    }

    // 3. Billing Period Filter
    if (selectedPeriod !== "ALL") {
      result = result.filter(
        (inv) => `${inv.month} ${inv.year}` === selectedPeriod
      );
    }

    // 4. Status Filter
    if (selectedStatus !== "ALL") {
      result = result.filter((inv) => inv.status === selectedStatus);
    }

    // 5. Sort newest invoice date first
    result.sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

    return result;
  }, [invoices, searchQuery, selectedCustomer, selectedPeriod, selectedStatus]);

  // Handle invoice action: Open full InvoicePreview
  const handleViewInvoice = async (inv: ArchivedInvoice) => {
    if (inv.entries && inv.entries.length > 0) {
      setSelectedInvoice(inv);
      return;
    }

    // Fetch full details from database
    setIsLoadingDetails(true);
    try {
      const fullDetails = await getInvoiceDetails(inv.id);
      setSelectedInvoice(fullDetails || inv);
    } catch {
      setSelectedInvoice(inv);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Open Payment Recording Modal
  const handleOpenPaymentModal = (inv: ArchivedInvoice) => {
    setPaymentTargetInvoice(inv);
    setIsPaymentModalOpen(true);
  };

  // Handle Payment Recorded successfully
  const handlePaymentSuccess = async (amount: number) => {
    triggerToast(`Payment of ₹${amount.toLocaleString("en-IN")} recorded successfully in Supabase!`);
    await loadInvoices();
  };

  // If an invoice is selected, render the full InvoicePreview with Back to Archive action
  if (selectedInvoice) {
    return (
      <div className="space-y-4">
        <InvoicePreview
          customer={selectedInvoice.customer}
          billNo={selectedInvoice.billNo}
          month={selectedInvoice.month}
          year={selectedInvoice.year}
          startDate={selectedInvoice.startDate}
          endDate={selectedInvoice.endDate}
          invoiceDate={selectedInvoice.invoiceDate}
          unitLocation={selectedInvoice.unitLocation}
          rate={selectedInvoice.rate}
          rateSource={selectedInvoice.rateSource}
          entries={selectedInvoice.entries}
          kpis={selectedInvoice.kpis}
          onBackToEdit={() => setSelectedInvoice(null)}
          backButtonLabel="Back to Invoice Archive"
          statusBadge={
            <InvoiceStatusBadge status={selectedInvoice.status} size="sm" />
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-[2px] bg-[#123c2c] text-[#faf8f1] border border-[#c7a45b] px-4 py-2.5 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 print:hidden">
          <CheckCircle2 className="h-4 w-4 text-[#c7a45b] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#e5ddcd]">
        <div>
          <div className="flex items-center gap-2 text-[#8e7139] text-[10.5px] font-bold uppercase tracking-[2px] mb-1">
            <FileText className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Billing &amp; Finance Repository</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#123c2c] m-0">
            Invoice History
          </h1>
          <p className="text-xs md:text-sm text-[#5c685e] mt-1 max-w-2xl leading-relaxed m-0">
            View, search and manage previously generated customer invoices and billing records.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/billing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#123c2c] bg-[#ffffff] hover:bg-[#faf7ef] border border-[#dcd0b5] rounded-[2px] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Back to Active Billing</span>
          </Link>
        </div>
      </div>

      {/* 2. Error Message Banner */}
      {errorMessage && (
        <div className="rounded-[2px] border border-amber-300 bg-amber-50 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-white border border-amber-300 text-amber-800 grid place-items-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wide text-[11px]">
                Database Connection Alert
              </span>
              <p className="text-amber-800 mt-1 leading-relaxed m-0">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={loadInvoices}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 rounded-[2px] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Four Archive KPI Summary Cards */}
      <InvoiceArchiveKpiCards invoices={invoices} />

      {/* 4. Filter & Search Controls */}
      <InvoiceArchiveFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCustomerId={selectedCustomer}
        onCustomerChange={setSelectedCustomer}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        customerOptions={customerOptions}
        periodOptions={periodOptions}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        totalFiltered={filteredInvoices.length}
        totalCount={invoices.length}
      />

      {/* 5. Invoice Table / Responsive Mobile Cards / Loading State */}
      {isLoading ? (
        <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-12 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#faf7ef] border border-[#dcd0b5] text-[#8e7139] mb-3 animate-spin">
            <Loader2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#5c685e] font-medium m-0">
            Loading invoices from database...
          </p>
        </div>
      ) : (
        <InvoiceArchiveTable
          invoices={filteredInvoices}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
          onViewInvoice={handleViewInvoice}
          onRecordPayment={handleOpenPaymentModal}
        />
      )}

      {/* 6. Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        invoice={paymentTargetInvoice}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetInvoice(null);
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
