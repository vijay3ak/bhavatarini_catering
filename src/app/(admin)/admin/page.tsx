"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Building2,
  Receipt,
  ScanLine,
  ArrowRight,
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  MOCK_CORPORATE_CUSTOMERS,
  MOCK_ENQUIRIES,
  MOCK_ACTIVITY_FEED,
  MOCK_KPI_METRICS,
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
  cancelled: { label: "Cancelled", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
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
    <div className="space-y-8">
      {/* Demo Data Disclaimer Banner */}
      <div className="p-4 rounded-[2px] bg-[#fbf6e9] border border-[#c1a463]/40 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#8e7139] shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-[#645028]">
            <strong>DEMO DATA &amp; LOCAL STATE MODE:</strong> The figures, enquiries and activity logs displayed below are realistic sample records for UI/UX verification. No live database or backend is connected.
          </span>
        </div>
        <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-[#8e7139]/15 text-[#8e7139] border border-[#8e7139]/30">
          Sample Data
        </span>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Customers */}
        <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e7139] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-full bg-[#f4eee1] border border-[#ddcca6] grid place-items-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-[#123c2c]">
              {totalCustomers}
            </span>
            <span className="text-[11px] text-[#69746a] block mt-1">
              Industrial corporate accounts
            </span>
          </div>
        </div>

        {/* KPI 2: Active Customers */}
        <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e7139]">
              Active Canteens
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 grid place-items-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-[#123c2c]">
              {activeCustomers}
            </span>
            <span className="text-[11px] text-emerald-800 block mt-1 font-medium">
              Daily meal contracts (Chettipalayam &amp; Perianaickenpalayam)
            </span>
          </div>
        </div>

        {/* KPI 3: New Enquiries */}
        <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e7139] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              New Enquiries
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 grid place-items-center text-amber-800">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-[#123c2c]">
              {newEnquiriesCount}
            </span>
            <span className="text-[11px] text-[#69746a] block mt-1">
              Unreviewed web inquiries
            </span>
          </div>
        </div>

        {/* KPI 4: Pending Enquiries */}
        <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8e7139] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pending Follow-ups
            </span>
            <div className="w-8 h-8 rounded-full bg-[#f4eee1] border border-[#ddcca6] grid place-items-center text-[#8e7139]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-[#123c2c]">
              {pendingEnquiriesCount}
            </span>
            <span className="text-[11px] text-[#69746a] block mt-1">
              Active leads awaiting quote/closure
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#123c2c] uppercase tracking-wider">
          Quick Workflows:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-semibold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#e5ddcd] transition-colors"
          >
            <Inbox className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Manage All Enquiries</span>
          </Link>

          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-semibold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#e5ddcd] transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Customer Directory</span>
          </Link>

          <Link
            href="/admin/billing"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] font-bold text-[#f4ecda] bg-gradient-to-r from-[#174a34] to-[#0d3021] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 transition-all"
          >
            <Receipt className="w-3.5 h-3.5 text-[#c7a45b]" />
            <span>Open Monthly Billing</span>
          </Link>
        </div>
      </div>

      {/* Two-Column Main Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Left Column: Recent Enquiries Table */}
        <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5ddcd] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
                Recent Customer Enquiries
              </h3>
              <span className="text-[11px] text-[#69746a]">
                Incoming requests from Coimbatore teams &amp; functions
              </span>
            </div>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#123c2c] hover:text-[#997b3e] transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf7ef] text-[#69746a] text-[10px] uppercase font-bold tracking-wider border-b border-[#e5ddcd]">
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
                        <div className="font-semibold text-[#17271e]">{enq.name}</div>
                        <div className="text-[11px] text-[#69746a]">
                          {enq.organisation || enq.location}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#526053]">
                        <div>{enq.requirement_type}</div>
                        <div className="text-[10px] text-[#8e7139]">
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
                          className="text-[#123c2c] hover:text-[#997b3e] font-semibold text-[11px]"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Operational Activity */}
        <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5ddcd]">
            <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
              Operations Log &amp; Activity
            </h3>
            <span className="text-[11px] text-[#69746a]">
              Recent status transitions, orders and drafts
            </span>
          </div>

          <div className="p-5 space-y-4">
            {MOCK_ACTIVITY_FEED.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#c7a45b] mt-1.5 shrink-0" />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#17271e] truncate">{act.title}</span>
                    <span className="text-[10px] text-[#8e7139] shrink-0 font-medium">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[#69746a] leading-relaxed m-0 text-[11.5px]">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Customer Quick Access Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
            Corporate Contract Clients
          </h3>
          <Link
            href="/admin/customers"
            className="text-xs font-bold text-[#123c2c] hover:text-[#997b3e] transition-colors"
          >
            Manage Profiles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_CORPORATE_CUSTOMERS.slice(0, 3).map((cust) => (
            <div
              key={cust.id}
              className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#c7a45b]/15 text-[#8e7139] border border-[#dcd0b5] uppercase">
                    {cust.shortCode}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                    Active
                  </span>
                </div>
                <h4 className="font-serif text-[15px] font-bold text-[#17271e] m-0">
                  {cust.name}
                </h4>
                <span className="text-[11px] text-[#69746a] block mt-0.5">
                  Unit: <strong>{cust.deliveryLocation}</strong>
                </span>
              </div>

              <div className="pt-3 border-t border-[#f0e9dc] flex items-center justify-between text-xs">
                <span className="text-[#8e7139] font-medium">
                  {cust.defaultPreset} (@ ₹{cust.defaultRate.toFixed(2)})
                </span>
                <Link
                  href="/admin/billing"
                  className="font-bold text-[#123c2c] hover:text-[#997b3e] flex items-center gap-1"
                >
                  <span>Bill</span>
                  <ArrowRight className="w-3 h-3" />
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
