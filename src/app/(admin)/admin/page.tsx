"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Building2,
  Receipt,
  ArrowRight,
  Info,
  Clock,
  TrendingUp,
  FileText,
  Utensils,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import {
  MOCK_CORPORATE_CUSTOMERS,
  MOCK_ENQUIRIES,
  MOCK_ACTIVITY_FEED,
} from "@/lib/data/mock-admin-data";
import { EnquiryRecord, EnquiryStatus } from "@/types/enquiry";
import { EnquiryDetailsDrawer } from "@/components/admin/enquiries/enquiry-details-drawer";

const STATUS_BADGES: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: { label: "New", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  contacted: { label: "Contacted", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  quote_sent: { label: "Quote Sent", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  confirmed: { label: "Confirmed", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  completed: { label: "Completed", bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  cancelled: { label: "Cancelled", bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" },
};

export default function AdminOverviewPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(MOCK_ENQUIRIES);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Dynamic KPI calculation from local state
  const totalCustomers = MOCK_CORPORATE_CUSTOMERS.length;
  const activeCustomers = MOCK_CORPORATE_CUSTOMERS.filter(
    (c) => c.contractStatus === "Active Daily Contract"
  ).length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === "new").length;
  const pendingEnquiriesCount = enquiries.filter(
    (e) => e.status === "new" || e.status === "contacted" || e.status === "quote_sent"
  ).length;

  const handleOpenEnquiry = (enquiry: EnquiryRecord) => {
    setSelectedEnquiry(enquiry);
    setDrawerOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: EnquiryStatus) => {
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, internal_notes: notes } : item))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, internal_notes: notes });
    }
  };

  return (
    <div className="space-y-6">
      {/* 2.1 Demo Data Information Banner */}
      <div className="p-3.5 sm:px-4 sm:py-3 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] shadow-xs flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-5 h-5 rounded-[2px] bg-[#fffefa] border border-[#dcd0b5] text-[#8e7139] grid place-items-center shrink-0 mt-0.5 sm:mt-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-[#5c685e] leading-relaxed">
            <strong className="text-[#17271e] font-semibold">Demo Environment &amp; Local State:</strong> The figures, enquiries and activity logs displayed below are sample catering records for administrative evaluation. No live database or backend is connected.
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-[#ffffff] text-[#8e7139] border border-[#dcd0b5]">
          Sample Data
        </span>
      </div>

      {/* 2.2 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Customers */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {totalCustomers}
            </div>
            <span className="text-[11px] text-[#69746a] block mt-1.5 font-medium">
              Contract corporate accounts
            </span>
          </div>
        </div>

        {/* KPI 2: Active Canteens */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              Active Canteens
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-emerald-800 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {activeCustomers}
            </div>
            <span className="text-[11px] text-emerald-800 block mt-1.5 font-medium">
              Daily industrial contracts
            </span>
          </div>
        </div>

        {/* KPI 3: New Enquiries */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              New Enquiries
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-amber-800 shrink-0">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {newEnquiriesCount}
            </div>
            <span className="text-[11px] text-amber-800 block mt-1.5 font-medium">
              Awaiting initial review
            </span>
          </div>
        </div>

        {/* KPI 4: Pending Follow-ups */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[126px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              Pending Follow-ups
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {pendingEnquiriesCount}
            </div>
            <span className="text-[11px] text-[#69746a] block mt-1.5 font-medium">
              Active leads awaiting quote/closure
            </span>
          </div>
        </div>
      </div>

      {/* 2.3 Quick Workflows Action Toolbar */}
      <div className="p-4 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8e7139]" />
          <span className="text-xs font-bold text-[#123c2c] uppercase tracking-wider">
            Operational Workflows:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#ffffff] hover:bg-[#faf7ef] border border-[#dcd0b5] shadow-xs transition-colors"
          >
            <Inbox className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Manage All Enquiries</span>
          </Link>

          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#ffffff] hover:bg-[#faf7ef] border border-[#dcd0b5] shadow-xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Customer Directory</span>
          </Link>

          <Link
            href="/admin/billing"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[2px] text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a533d] border border-[#123c2c] shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-[#c7a45b]" />
            <span>Open Monthly Billing</span>
          </Link>
        </div>
      </div>

      {/* 2.4 & 2.5 Two-Column Main Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-6 items-start">
        {/* Left Column: Recent Customer Enquiries */}
        <div className="rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#e5ddcd] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
                Recent Customer Enquiries
              </h3>
              <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                Incoming requests from Coimbatore teams and functions.
              </p>
            </div>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123c2c] hover:text-[#8e7139] bg-[#faf7ef] hover:bg-[#eee7d7] px-3 py-1.5 rounded-[2px] border border-[#dcd0b5] transition-colors shrink-0 self-start sm:self-auto"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8e7139]" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-[#f4eee1] text-[#69746a] text-[10px] uppercase font-bold tracking-wider border-b border-[#e5ddcd]">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-3">Requirement</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e9dc]">
                {enquiries.slice(0, 4).map((enq) => {
                  const badge = STATUS_BADGES[enq.status] || STATUS_BADGES.new;
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => handleOpenEnquiry(enq)}
                      className="hover:bg-[#faf7ef] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#123c2c] text-xs">{enq.name}</div>
                        <div className="text-[11px] text-[#69746a]">
                          {enq.organisation || enq.location}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#17271e]">
                        <div className="font-medium">{enq.requirement_type}</div>
                        <div className="text-[10px] text-[#8e7139] font-medium">
                          {enq.quantity || enq.quantity_range || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#69746a] whitespace-nowrap">
                        {enq.event_date || "Flexible"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEnquiry(enq);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#123c2c] hover:text-[#8e7139] bg-[#faf7ef] hover:bg-[#eee7d7] px-2.5 py-1 rounded-[2px] border border-[#dcd0b5] transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3 text-[#8e7139]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Operations Log & Activity */}
        <div className="rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#e5ddcd] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
                Operations Log &amp; Activity
              </h3>
              <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                Recent status transitions, orders and drafts
              </p>
            </div>
            <Activity className="w-4 h-4 text-[#8e7139]" />
          </div>

          <div className="p-5 space-y-4">
            {MOCK_ACTIVITY_FEED.map((act, index) => (
              <div key={act.id} className="relative flex items-start gap-3 text-xs">
                {/* Hairline connector line between events */}
                {index < MOCK_ACTIVITY_FEED.length - 1 && (
                  <div className="absolute left-[4px] top-3.5 bottom-[-16px] w-px bg-[#e5ddcd]" />
                )}
                {/* Subtle gold timeline marker */}
                <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#c7a45b] ring-4 ring-[#faf7ef] mt-1 shrink-0" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#17271e] truncate">{act.title}</span>
                    <span className="text-[10px] font-semibold text-[#8e7139] bg-[#faf7ef] px-1.5 py-0.5 rounded-[2px] border border-[#e5ddcd] shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[#5c685e] leading-relaxed m-0 text-[11.5px]">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Customer Quick Access Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
              Corporate Contract Clients
            </h3>
            <p className="text-xs text-[#5c685e] mt-0.5 m-0">
              Active daily industrial catering agreements and location presets
            </p>
          </div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123c2c] hover:text-[#8e7139] bg-[#ffffff] hover:bg-[#faf7ef] px-3 py-1.5 rounded-[2px] border border-[#dcd0b5] shadow-xs transition-colors"
          >
            <span>Manage Profiles</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8e7139]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_CORPORATE_CUSTOMERS.slice(0, 3).map((cust) => (
            <div
              key={cust.id}
              className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between space-y-3.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5] uppercase">
                    {cust.shortCode}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                    Active Contract
                  </span>
                </div>
                <h4 className="font-serif text-[16px] font-bold text-[#17271e] m-0">
                  {cust.name}
                </h4>
                <span className="text-[11px] text-[#69746a] block mt-1">
                  Delivery Unit: <strong className="text-[#17271e] font-semibold">{cust.deliveryLocation}</strong>
                </span>
              </div>

              <div className="pt-3 border-t border-[#f0e9dc] flex items-center justify-between text-xs">
                <span className="text-[#8e7139] font-medium text-[11.5px]">
                  {cust.defaultPreset} (@ ₹{cust.defaultRate.toFixed(2)})
                </span>
                <Link
                  href="/admin/billing"
                  className="font-bold text-xs text-[#123c2c] hover:text-[#8e7139] inline-flex items-center gap-1 bg-[#faf7ef] hover:bg-[#eee7d7] px-2.5 py-1 rounded-[2px] border border-[#dcd0b5] transition-colors"
                >
                  <span>Bill</span>
                  <ArrowRight className="w-3 h-3 text-[#8e7139]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Details Drawer */}
      <EnquiryDetailsDrawer
        enquiry={selectedEnquiry}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
      />
    </div>
  );
}
