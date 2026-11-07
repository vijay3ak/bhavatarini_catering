"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Info,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { MOCK_ARCHIVED_INVOICES, MOCK_CORPORATE_CUSTOMERS } from "@/lib/data/mock-admin-data";
import type { ArchivedInvoice } from "@/types/billing";
import { InvoiceArchiveKpiCards } from "@/components/admin/billing/invoices/invoice-archive-kpi-cards";
import { InvoiceArchiveFilters } from "@/components/admin/billing/invoices/invoice-archive-filters";
import { InvoiceArchiveTable } from "@/components/admin/billing/invoices/invoice-archive-table";
import { InvoicePreview } from "@/components/admin/billing/invoice-preview";
import { InvoiceStatusBadge } from "@/components/admin/billing/invoices/invoice-status-badge";

export default function InvoiceHistoryArchivePage() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<ArchivedInvoice | null>(null);

  // Extract unique customer options
  const customerOptions = useMemo(() => {
    return MOCK_CORPORATE_CUSTOMERS.filter((c) =>
      MOCK_ARCHIVED_INVOICES.some(
        (inv) => inv.customer.id === c.id || inv.customer.shortCode === c.shortCode
      )
    ).map((c) => ({
      id: c.id,
      name: c.name,
      shortCode: c.shortCode,
    }));
  }, []);

  // Extract unique billing period options (sorted newest first)
  const periodOptions = useMemo(() => {
    const periodSet = new Set<string>();
    for (const inv of MOCK_ARCHIVED_INVOICES) {
      periodSet.add(`${inv.month} ${inv.year}`);
    }
    return Array.from(periodSet);
  }, []);

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
    let result = [...MOCK_ARCHIVED_INVOICES];

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
  }, [searchQuery, selectedCustomer, selectedPeriod, selectedStatus]);

  // Handle invoice action: Open full InvoicePreview in read-only mode
  const handleViewInvoice = (inv: ArchivedInvoice) => {
    setSelectedInvoice(inv);
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

      {/* 2. Tasteful Demonstration Data Notice */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#faf7ef] p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-[#fffefa] border border-[#dcd0b5] text-[#8e7139] grid place-items-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#123c2c] uppercase tracking-wide text-[11px]">
                Demonstration Archive Data
              </span>
              <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#fbf6e9] text-[#8e7139] border border-[#ddcca6]">
                Simulated Records
              </span>
            </div>
            <p className="text-[#5c685e] mt-1 leading-relaxed m-0">
              These are sample invoice records created for demonstration. No actual customer payments or financial transactions are represented.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Four Archive KPI Summary Cards */}
      <InvoiceArchiveKpiCards invoices={MOCK_ARCHIVED_INVOICES} />

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
        totalCount={MOCK_ARCHIVED_INVOICES.length}
      />

      {/* 5. Invoice Table / Responsive Mobile Cards */}
      <InvoiceArchiveTable
        invoices={filteredInvoices}
        onResetFilters={handleResetFilters}
        onViewInvoice={handleViewInvoice}
      />
    </div>
  );
}
