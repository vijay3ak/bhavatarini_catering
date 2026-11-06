"use client";

import React, { useState, useMemo } from "react";
import {
  Inbox,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  SlidersHorizontal,
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
  cancelled: { label: "Cancelled", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
};

export default function EnquiriesManagementPage() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(MOCK_ENQUIRIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatusOption>("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtered enquiries based on search and status
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

      return matchSearch && matchStatus;
    });
  }, [enquiries, searchQuery, statusFilter]);

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
      {/* Header Bar */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#997b3e] text-[10px] font-bold tracking-[2px] uppercase mb-1">
            <Inbox className="w-4 h-4" />
            <span>Lead Coordination Hub</span>
          </div>
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#123c2c] m-0">
            Enquiries Management
          </h2>
          <p className="text-[#69746a] text-xs leading-relaxed mt-1 m-0">
            Track, filter and update prospective customer inquiries received through the website contact form.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] text-[#69746a]">
            Total Inquiries: <strong className="text-[#123c2c]">{enquiries.length}</strong>
          </span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] space-y-3.5 shadow-xs">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e7139]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, phone, organisation or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8e7139] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {(searchQuery || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[2px] text-[#69746a] hover:text-[#123c2c] border border-[#dcd0b5] bg-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider mr-1.5">
            Filter Status:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-all border ${
              statusFilter === "ALL"
                ? "bg-[#123c2c] text-[#f4ecd8] border-[#123c2c]"
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
                ? "bg-amber-800 text-amber-50 border-amber-800"
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
                ? "bg-blue-800 text-blue-50 border-blue-800"
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
                ? "bg-purple-800 text-purple-50 border-purple-800"
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
                ? "bg-emerald-800 text-emerald-50 border-emerald-800"
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
                ? "bg-gray-800 text-gray-50 border-gray-800"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
          >
            Closed ({counts.closed})
          </button>
        </div>
      </div>

      {/* Enquiries Presentation */}
      <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f4eee1] border border-[#ddcca6] grid place-items-center text-[#8e7139] mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
              No matching enquiries found
            </h3>
            <p className="text-xs text-[#69746a] max-w-sm mx-auto m-0">
              Try adjusting your search keywords or switching your status filter to &ldquo;All&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf7ef] text-[#69746a] text-[10px] uppercase font-bold tracking-wider border-b border-[#e5ddcd]">
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
                          <span>{enq.phone}</span>
                        </div>
                        {enq.email && (
                          <div className="text-[11px] text-[#69746a] truncate max-w-[140px]">
                            {enq.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#2d3a2e]">
                        <div className="font-medium">{enq.requirement_type}</div>
                        <div className="text-[11px] text-[#8e7139]">
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] rounded-[2px] transition-colors"
                        >
                          <Eye className="w-3 h-3 text-[#8e7139]" />
                          <span>View</span>
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
