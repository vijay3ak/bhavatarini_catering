"use client";

import React, { useState, useMemo } from "react";
import {
  Inbox,
  Search,
  Phone,
  Mail,
  Calendar,
  Eye,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { MOCK_ENQUIRIES } from "@/lib/data/mock-admin-data";
import { EnquiryRecord, EnquiryStatus } from "@/types/enquiry";
import { EnquiryDetailsDrawer } from "@/components/admin/enquiries/enquiry-details-drawer";

type FilterStatusOption =
  | "ALL"
  | "NEW"
  | "CONTACTED"
  | "QUOTE_SENT"
  | "CONFIRMED"
  | "CLOSED";

const STATUS_CONFIG: Record<
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

export default function EnquiriesManagementPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(MOCK_ENQUIRIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatusOption>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract unique requirement types for filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    enquiries.forEach((e) => {
      if (e.requirement_type) types.add(e.requirement_type);
    });
    return Array.from(types);
  }, [enquiries]);

  // Filtered enquiries based on search, status and requirement type
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      // 1. Text search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        enq.name.toLowerCase().includes(q) ||
        enq.phone.includes(q) ||
        (enq.email && enq.email.toLowerCase().includes(q)) ||
        (enq.organisation && enq.organisation.toLowerCase().includes(q)) ||
        enq.location.toLowerCase().includes(q);

      // 2. Status filter
      let matchStatus = true;
      if (statusFilter === "NEW") matchStatus = enq.status === "new";
      else if (statusFilter === "CONTACTED") matchStatus = enq.status === "contacted";
      else if (statusFilter === "QUOTE_SENT") matchStatus = enq.status === "quote_sent";
      else if (statusFilter === "CONFIRMED") matchStatus = enq.status === "confirmed";
      else if (statusFilter === "CLOSED")
        matchStatus = enq.status === "completed" || enq.status === "cancelled";

      // 3. Requirement Type filter
      let matchType = true;
      if (typeFilter !== "ALL") {
        matchType = enq.requirement_type === typeFilter;
      }

      return matchSearch && matchStatus && matchType;
    });
  }, [enquiries, searchQuery, statusFilter, typeFilter]);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter((e) => e.status === "new").length,
      contacted: enquiries.filter((e) => e.status === "contacted").length,
      quote_sent: enquiries.filter((e) => e.status === "quote_sent").length,
      confirmed: enquiries.filter((e) => e.status === "confirmed").length,
      closed: enquiries.filter((e) => e.status === "completed" || e.status === "cancelled").length,
    };
  }, [enquiries]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== "" || statusFilter !== "ALL" || typeFilter !== "ALL"
  );

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const handleOpenDetails = (enquiry: EnquiryRecord) => {
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
      {/* 3.1 Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#e5ddcd]">
        <div>
          <div className="flex items-center gap-2 text-[#8e7139] text-[10.5px] font-bold uppercase tracking-[2px] mb-1">
            <Inbox className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Lead Coordination Hub</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#123c2c] m-0">
            Customer Enquiries
          </h1>
          <p className="text-xs md:text-sm text-[#5c685e] mt-1 max-w-2xl leading-relaxed m-0">
            Review incoming catering requests, manage follow-ups and track enquiry progress.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-[2px] bg-[#ffffff] border border-[#dcd0b5] text-[#69746a] shadow-xs">
            Total Leads: <strong className="text-[#123c2c] font-bold">{enquiries.length}</strong>
          </span>
        </div>
      </div>

      {/* 3.2 Enquiry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enquiries */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              Total Enquiries
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] shrink-0">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {counts.all}
            </div>
            <span className="text-[11px] text-[#69746a] block mt-1.5 font-medium">
              Registered website inquiries
            </span>
          </div>
        </div>

        {/* Card 2: New Leads */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              New Inquiries
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-amber-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {counts.new}
            </div>
            <span className="text-[11px] text-amber-800 block mt-1.5 font-medium">
              Awaiting review &amp; contact
            </span>
          </div>
        </div>

        {/* Card 3: In Discussion */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              In Discussion
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-blue-800 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {counts.contacted + counts.quote_sent}
            </div>
            <span className="text-[11px] text-blue-800 block mt-1.5 font-medium">
              Contacted &amp; quotes submitted
            </span>
          </div>
        </div>

        {/* Card 4: Confirmed Bookings */}
        <div className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#69746a]">
              Confirmed Bookings
            </span>
            <div className="w-9 h-9 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-emerald-800 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-[#123c2c] leading-none">
              {counts.confirmed}
            </div>
            <span className="text-[11px] text-emerald-800 block mt-1.5 font-medium">
              Confirmed catering orders
            </span>
          </div>
        </div>
      </div>

      {/* 3.3 Search and Filters Toolbar */}
      <div className="p-4 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-3.5 shadow-xs">
        {/* Row 1: Search & Type Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8e7139]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, phone, organisation, requirement or location..."
              className="w-full h-9 pl-9 pr-8 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8e7139] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Requirement Type Filter Dropdown */}
          <div className="w-full sm:w-56 shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-xs font-medium text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
            >
              <option value="ALL">All Requirement Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-[2px] text-[#123c2c] hover:bg-[#faf7ef] border border-[#dcd0b5] bg-white transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Row 2: Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#f0e9dc]">
          <span className="text-[10.5px] font-bold text-[#8e7139] uppercase tracking-wider mr-1.5">
            Filter Status:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "ALL"
                ? "bg-[#123c2c] text-[#faf8f1] border-[#123c2c] shadow-xs"
                : "bg-[#faf8f1] text-[#526053] border-[#dcd0b5] hover:bg-[#eee7d7]"
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("NEW")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "NEW"
                ? "bg-amber-800 text-amber-50 border-amber-800 shadow-xs"
                : "bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100"
            }`}
          >
            New ({counts.new})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("CONTACTED")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "CONTACTED"
                ? "bg-blue-800 text-blue-50 border-blue-800 shadow-xs"
                : "bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100"
            }`}
          >
            Contacted ({counts.contacted})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("QUOTE_SENT")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "QUOTE_SENT"
                ? "bg-purple-800 text-purple-50 border-purple-800 shadow-xs"
                : "bg-purple-50/70 text-purple-900 border-purple-200 hover:bg-purple-100"
            }`}
          >
            Quote Sent ({counts.quote_sent})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("CONFIRMED")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "CONFIRMED"
                ? "bg-emerald-800 text-emerald-50 border-emerald-800 shadow-xs"
                : "bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            Confirmed ({counts.confirmed})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("CLOSED")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "CLOSED"
                ? "bg-stone-800 text-stone-50 border-stone-800 shadow-xs"
                : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
            }`}
          >
            Closed ({counts.closed})
          </button>
        </div>
      </div>

      {/* 3.4 Enquiry Records Table */}
      <div className="rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          /* 3.7 Empty State */
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] grid place-items-center text-[#8e7139] mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
              No matching enquiries found
            </h3>
            <p className="text-xs text-[#5c685e] max-w-sm mx-auto m-0 leading-relaxed">
              No catering inquiries match your active keywords or filters. Try clearing your search terms or resetting the filter options.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#dcd0b5] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-[#f4eee1] text-[#69746a] text-[10px] uppercase font-bold tracking-wider border-b border-[#e5ddcd]">
                <tr>
                  <th className="py-3 px-4">Client / Organisation</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Requirement &amp; Food</th>
                  <th className="py-3 px-3">Guests</th>
                  <th className="py-3 px-3">Event Date</th>
                  <th className="py-3 px-3">Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e9dc]">
                {filteredEnquiries.map((enq) => {
                  const badge = STATUS_CONFIG[enq.status] || STATUS_CONFIG.new;
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => handleOpenDetails(enq)}
                      className="hover:bg-[#faf7ef] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#123c2c] text-[13px]">
                          {enq.name}
                        </div>
                        <div className="text-[11px] text-[#69746a]">
                          {enq.organisation || enq.location}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#435244]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#8e7139]" />
                          <span className="font-medium text-[#17271e]">{enq.phone}</span>
                        </div>
                        {enq.email && (
                          <div className="text-[11px] text-[#69746a] truncate max-w-[150px] mt-0.5">
                            {enq.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#2d3a2e]">
                        <div className="font-medium text-[#17271e]">{enq.requirement_type}</div>
                        <div className="text-[11px] text-[#8e7139] font-medium">
                          {enq.food_preference}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[#17271e] font-semibold whitespace-nowrap">
                        {enq.quantity || enq.quantity_range || "N/A"}
                      </td>

                      <td className="py-3.5 px-3 text-[#69746a] whitespace-nowrap">
                        {enq.event_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8e7139]" />
                            <span>{enq.event_date}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Flexible</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-[#8e7139] text-[11px] whitespace-nowrap">
                        {new Date(enq.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(enq);
                          }}
                          className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-bold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#dcd0b5] rounded-[2px] transition-colors"
                        >
                          <Eye className="w-3 h-3 text-[#8e7139]" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Status Drawer */}
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
