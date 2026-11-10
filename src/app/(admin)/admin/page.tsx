"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  Building2,
  Receipt,
  ArrowRight,
  Clock,
  TrendingUp,
  FileText,
  Utensils,
  ChevronRight,
  Activity,
  Layers,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { CustomerRecord } from "@/types/admin";
import {
  EnquiryRecord,
  EnquiryStatus,
  EnquiryStatusHistoryRecord,
} from "@/types/enquiry";
import { EnquiryDetailsDrawer } from "@/components/admin/enquiries/enquiry-details-drawer";
import { createClient } from "@/lib/supabase/client";

function formatActivityTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

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
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [newEnquiriesCount, setNewEnquiriesCount] = useState<number>(0);
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState<number>(0);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(true);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Live Operations Activity History
  const [activityHistory, setActivityHistory] = useState<EnquiryStatusHistoryRecord[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Live Corporate Customer State
  const [corporateCustomers, setCorporateCustomers] = useState<CustomerRecord[]>([]);
  const [totalCustomersCount, setTotalCustomersCount] = useState<number>(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState<number>(0);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Live enquiry fetch from Supabase Data API
  const fetchDashboardEnquiries = useCallback(async () => {
    setIsLoadingEnquiries(true);
    setEnquiryError(null);
    try {
      const supabase = createClient();

      const [recentRes, newCountRes, pendingCountRes] = await Promise.all([
        (supabase.from("enquiries") as any)
          .select(`
            id,
            enquiry_number,
            name,
            phone,
            email,
            organisation,
            requirement_type,
            food_preference,
            quantity_range,
            event_date,
            location,
            details,
            status,
            whatsapp_initiated,
            created_at,
            updated_at
          `)
          .order("created_at", { ascending: false })
          .limit(4),
        (supabase.from("enquiries") as any)
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        (supabase.from("enquiries") as any)
          .select("*", { count: "exact", head: true })
          .in("status", ["new", "contacted", "quote_sent"]),
      ]);

      if (recentRes.error) {
        console.error("Failed to load recent enquiries from Supabase:", recentRes.error);
        setEnquiryError("Unable to retrieve recent enquiries from Supabase.");
      } else {
        setEnquiries((recentRes.data as EnquiryRecord[]) || []);
      }

      if (!newCountRes.error && typeof newCountRes.count === "number") {
        setNewEnquiriesCount(newCountRes.count);
      }

      if (!pendingCountRes.error && typeof pendingCountRes.count === "number") {
        setPendingEnquiriesCount(pendingCountRes.count);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching dashboard enquiries:", err);
      setEnquiryError("Connection error while communicating with Supabase Data API.");
    } finally {
      setIsLoadingEnquiries(false);
    }
  }, []);

  // Live operations activity history fetch from Supabase Data API
  const fetchActivityHistory = useCallback(async () => {
    setIsLoadingActivity(true);
    setActivityError(null);
    try {
      const supabase = createClient();
      const { data, error } = await (supabase.from("enquiry_status_history") as any)
        .select(`
          id,
          enquiry_id,
          old_status,
          new_status,
          changed_by,
          reason,
          created_at,
          enquiries (
            id,
            enquiry_number,
            name
          ),
          admin_profiles (
            id,
            full_name,
            role_id
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Failed to load operations activity from Supabase:", error);
        setActivityError("Unable to load operations activity from Supabase.");
      } else {
        setActivityHistory((data as EnquiryStatusHistoryRecord[]) || []);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching operations activity:", err);
      setActivityError("Connection error while communicating with Supabase Data API.");
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  // Live corporate customers fetch from Supabase Data API
  const fetchCorporateCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    setCustomerError(null);
    try {
      const supabase = createClient();

      const [recentRes, totalCountRes, activeCountRes] = await Promise.all([
        (supabase.from("customers") as any)
          .select(`
            id,
            customer_code,
            company_name,
            gstin,
            pan,
            contract_status,
            default_rate,
            default_preset,
            notes,
            created_at,
            updated_at,
            customer_addresses (
              id,
              address_type,
              address_line,
              city,
              pincode,
              is_default
            )
          `)
          .order("created_at", { ascending: false })
          .limit(3),
        (supabase.from("customers") as any)
          .select("*", { count: "exact", head: true }),
        (supabase.from("customers") as any)
          .select("*", { count: "exact", head: true })
          .eq("contract_status", "Active Daily Contract"),
      ]);

      if (recentRes.error) {
        console.error("Failed to load corporate customers from Supabase:", recentRes.error);
        setCustomerError("Unable to load corporate customer profiles from Supabase.");
      } else {
        setCorporateCustomers((recentRes.data as CustomerRecord[]) || []);
      }

      if (!totalCountRes.error && typeof totalCountRes.count === "number") {
        setTotalCustomersCount(totalCountRes.count);
      }

      if (!activeCountRes.error && typeof activeCountRes.count === "number") {
        setActiveCustomersCount(activeCountRes.count);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching corporate customers:", err);
      setCustomerError("Connection error while communicating with Supabase Data API.");
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardEnquiries();
    fetchActivityHistory();
    fetchCorporateCustomers();
  }, [fetchDashboardEnquiries, fetchActivityHistory, fetchCorporateCustomers]);

  const handleOpenEnquiry = (enquiry: EnquiryRecord) => {
    setSelectedEnquiry(enquiry);
    setDrawerOpen(true);
  };

  // Status update executed via authenticated Supabase Data API
  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    const supabase = createClient();
    const { error } = await (supabase.from("enquiries") as any)
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Status update error on Supabase:", error);
      throw new Error(error.message || "Failed to update status.");
    }

    // Refresh live dashboard enquiries, KPI counts, and operations activity feed immediately
    await Promise.all([fetchDashboardEnquiries(), fetchActivityHistory()]);

    // Synchronize selected enquiry in drawer state
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleNotesChange = (_id: string, notes: string) => {
    if (selectedEnquiry) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, internal_notes: notes } : null));
    }
  };

  return (
    <div className="space-y-6">
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
              {isLoadingCustomers ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#8e7139]" />
              ) : customerError ? (
                "—"
              ) : (
                totalCustomersCount
              )}
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
              {isLoadingCustomers ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#8e7139]" />
              ) : customerError ? (
                "—"
              ) : (
                activeCustomersCount
              )}
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
              {isLoadingEnquiries ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#8e7139]" />
              ) : (
                newEnquiriesCount
              )}
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
              {isLoadingEnquiries ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#8e7139]" />
              ) : (
                pendingEnquiriesCount
              )}
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
                {isLoadingEnquiries ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#69746a]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#8e7139]" />
                        <span>Loading recent enquiries...</span>
                      </div>
                    </td>
                  </tr>
                ) : enquiryError ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-4">
                      <div className="p-3 rounded-[2px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{enquiryError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchDashboardEnquiries()}
                          className="px-2.5 py-1 text-xs font-bold rounded-[2px] bg-white border border-red-300 text-red-800 hover:bg-red-50 cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#69746a] italic">
                      No customer enquiries recorded yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enq) => {
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
                  })
                )}
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

          {isLoadingActivity ? (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="w-5 h-5 text-[#8e7139] animate-spin mx-auto" />
              <p className="text-xs text-[#69746a] m-0">Loading operations activity...</p>
            </div>
          ) : activityError ? (
            <div className="p-5">
              <div className="p-4 rounded-[2px] bg-red-50 border border-red-200 text-red-800 text-xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">{activityError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchActivityHistory()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-red-100 hover:bg-red-200 text-red-900 text-xs font-semibold border border-red-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : activityHistory.length === 0 ? (
            <div className="p-8 text-center space-y-1.5">
              <Clock className="w-5 h-5 text-[#8e7139] mx-auto opacity-60" />
              <p className="text-xs font-semibold text-[#17271e] m-0">
                No status activity has been recorded yet.
              </p>
              <p className="text-[11px] text-[#69746a] m-0 max-w-xs mx-auto">
                Status changes performed on customer enquiries will automatically appear here in real time.
              </p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {activityHistory.map((act, index) => {
                const oldBadge =
                  STATUS_BADGES[act.old_status] || {
                    label: act.old_status,
                    bg: "bg-stone-100",
                    text: "text-stone-700",
                    border: "border-stone-200",
                  };
                const newBadge =
                  STATUS_BADGES[act.new_status] || {
                    label: act.new_status,
                    bg: "bg-stone-100",
                    text: "text-stone-700",
                    border: "border-stone-200",
                  };
                const customerName = act.enquiries?.name || "Customer Enquiry";
                const enquiryRef = act.enquiries?.enquiry_number;
                const changerName =
                  act.admin_profiles?.full_name ||
                  (act.changed_by
                    ? `Admin (${act.changed_by.slice(0, 8)})`
                    : "Administrator");
                const roleLabel = act.admin_profiles?.role_id
                  ? act.admin_profiles.role_id.toUpperCase()
                  : null;

                return (
                  <div key={act.id} className="relative flex items-start gap-3 text-xs">
                    {/* Hairline connector line between events */}
                    {index < activityHistory.length - 1 && (
                      <div className="absolute left-[4px] top-3.5 bottom-[-16px] w-px bg-[#e5ddcd]" />
                    )}
                    {/* Subtle gold timeline marker */}
                    <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#c7a45b] ring-4 ring-[#faf7ef] mt-1 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-[#17271e] block truncate">
                            {customerName}
                          </span>
                          {enquiryRef && (
                            <span className="font-mono text-[10.5px] text-[#8e7139] block mt-0.5">
                              {enquiryRef}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-[#8e7139] bg-[#faf7ef] px-1.5 py-0.5 rounded-[2px] border border-[#e5ddcd] shrink-0 whitespace-nowrap">
                          {formatActivityTime(act.created_at)}
                        </span>
                      </div>

                      {/* Transition row */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9.5px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-[2px] border ${oldBadge.bg} ${oldBadge.text} ${oldBadge.border}`}
                        >
                          {oldBadge.label}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-[#8e7139] shrink-0" />
                        <span
                          className={`text-[9.5px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-[2px] border ${newBadge.bg} ${newBadge.text} ${newBadge.border}`}
                        >
                          {newBadge.label}
                        </span>
                        {act.reason && (
                          <span className="text-[11px] text-[#5c685e] italic truncate">
                            &mdash; &ldquo;{act.reason}&rdquo;
                          </span>
                        )}
                      </div>

                      {/* Actor row */}
                      <div className="text-[10.5px] text-[#69746a] flex items-center gap-1.5 pt-0.5">
                        <span>By:</span>
                        <span className="font-medium text-[#17271e]">{changerName}</span>
                        {roleLabel && (
                          <span className="px-1 py-0.2 rounded-[2px] text-[8.5px] font-bold tracking-wider uppercase bg-[#e9e3d3] text-[#526053]">
                            {roleLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

        {isLoadingCustomers ? (
          <div className="p-8 text-center space-y-2 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd]">
            <Loader2 className="w-5 h-5 text-[#8e7139] animate-spin mx-auto" />
            <p className="text-xs text-[#69746a] m-0">Loading corporate client profiles...</p>
          </div>
        ) : customerError ? (
          <div className="p-5 rounded-[2px] bg-red-50 border border-red-200 text-red-800 text-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-semibold">{customerError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchCorporateCustomers()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-red-100 hover:bg-red-200 text-red-900 text-xs font-semibold border border-red-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : corporateCustomers.length === 0 ? (
          <div className="p-8 text-center space-y-2 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs">
            <Building2 className="w-6 h-6 text-[#8e7139] mx-auto opacity-60" />
            <h4 className="font-serif text-[16px] font-bold text-[#123c2c] m-0">
              No Corporate Client Profiles Yet
            </h4>
            <p className="text-xs text-[#69746a] max-w-md mx-auto m-0">
              Active industrial contracts and canteen accounts created in Customer Management will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/customers"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123c2c] hover:text-[#8e7139] bg-[#faf7ef] hover:bg-[#eee7d7] px-3.5 py-1.5 rounded-[2px] border border-[#dcd0b5] transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>Manage Customer Profiles</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {corporateCustomers.slice(0, 3).map((cust) => {
              const deliveryAddress =
                cust.customer_addresses?.find((a) => a.address_type === "delivery" && a.is_default) ||
                cust.customer_addresses?.find((a) => a.address_type === "delivery") ||
                cust.customer_addresses?.[0];

              const deliveryLocationText = deliveryAddress
                ? [deliveryAddress.address_line, deliveryAddress.city].filter(Boolean).join(", ")
                : null;

              const isContractActive = cust.contract_status === "Active Daily Contract";

              return (
                <div
                  key={cust.id}
                  className="p-5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs hover:border-[#c7a45b]/50 transition-all flex flex-col justify-between space-y-3.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5] uppercase">
                        {cust.customer_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                          isContractActive
                            ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                            : cust.contract_status === "Periodic Orders"
                            ? "text-blue-800 bg-blue-50 border-blue-200"
                            : cust.contract_status === "In Review"
                            ? "text-amber-800 bg-amber-50 border-amber-200"
                            : "text-stone-700 bg-stone-100 border-stone-200"
                        }`}
                      >
                        {cust.contract_status}
                      </span>
                    </div>
                    <h4 className="font-serif text-[16px] font-bold text-[#17271e] m-0">
                      {cust.company_name}
                    </h4>
                    <span className="text-[11px] text-[#69746a] block mt-1">
                      Delivery Unit:{" "}
                      {deliveryLocationText ? (
                        <strong className="text-[#17271e] font-semibold">{deliveryLocationText}</strong>
                      ) : (
                        <span className="italic text-[#8e7139]">Location unassigned</span>
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#f0e9dc] flex items-center justify-between text-xs">
                    <span className="text-[#8e7139] font-medium text-[11.5px]">
                      {cust.default_preset ? (
                        <>
                          {cust.default_preset}
                          {cust.default_rate !== null && cust.default_rate !== undefined ? (
                            <> (@ ₹{Number(cust.default_rate).toFixed(2)})</>
                          ) : null}
                        </>
                      ) : cust.default_rate !== null && cust.default_rate !== undefined ? (
                        <>₹{Number(cust.default_rate).toFixed(2)} / meal</>
                      ) : (
                        <span className="italic text-[#69746a]">Not configured</span>
                      )}
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
              );
            })}
          </div>
        )}
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
