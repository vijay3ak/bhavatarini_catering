"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Receipt,
  Edit2,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import { CustomerRecord, CustomerContractStatus } from "@/types/admin";
import { CustomerFormModal } from "@/components/admin/customers/customer-form-modal";
import { CustomerDetailsModal } from "@/components/admin/customers/customer-details-modal";
import { createClient } from "@/lib/supabase/client";

export default function CorporateCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [contractFilter, setContractFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live customer fetch from Supabase Data API
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchErr } = await (supabase.from("customers") as any)
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
          ),
          customer_contacts (
            id,
            contact_name,
            phone,
            email,
            designation,
            is_primary
          )
        `)
        .order("company_name", { ascending: true });

      if (fetchErr) {
        console.error("Failed to load customers from Supabase:", fetchErr);
        setError("Unable to retrieve corporate customer profiles from Supabase.");
      } else {
        setCustomers((data as CustomerRecord[]) || []);
      }
    } catch (err: unknown) {
      console.error("Unexpected error fetching customers:", err);
      setError("Connection error while communicating with Supabase Data API.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim();
      const delivery =
        cust.customer_addresses?.find((a) => a.address_type === "delivery")?.address_line.toLowerCase() || "";
      const billing =
        cust.customer_addresses?.find((a) => a.address_type === "billing")?.address_line.toLowerCase() || "";

      const matchSearch =
        !q ||
        cust.company_name.toLowerCase().includes(q) ||
        cust.customer_code.toLowerCase().includes(q) ||
        delivery.includes(q) ||
        billing.includes(q) ||
        (cust.gstin && cust.gstin.toLowerCase().includes(q));

      const matchContract =
        contractFilter === "ALL" || cust.contract_status === contractFilter;

      return matchSearch && matchContract;
    });
  }, [customers, searchQuery, contractFilter]);

  // Handlers
  const handleOpenDetails = (cust: CustomerRecord) => {
    setActiveCustomer(cust);
    setDetailsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setActiveCustomer(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (cust: CustomerRecord) => {
    setActiveCustomer(cust);
    setFormModalOpen(true);
  };

  const handleCustomerSaved = () => {
    fetchCustomers();
    showToast(
      activeCustomer
        ? "Customer profile updated successfully."
        : "Customer profile created and saved to database."
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-[2px] bg-[#123c2c] text-[#f4ecd8] border border-[#c7a45b] shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#997b3e] text-[10px] font-bold tracking-[2px] uppercase mb-1">
            <Building2 className="w-4 h-4" />
            <span>Industrial Contract Profiles</span>
          </div>
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#123c2c] m-0">
            Corporate Customers
          </h2>
          <p className="text-[#69746a] text-xs leading-relaxed mt-1 m-0">
            Manage factory canteen accounts, plant locations, registered tax IDs, and default meal billing presets.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-[2px] text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a533d] border border-[#123c2c] shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#c7a45b]" />
          <span>Add Corporate Customer</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e7139]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, location, code, or GSTIN..."
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#faf7ef] rounded-[2px] border border-[#dcd0b5] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#123c2c] shadow-xs"
                  : "text-[#69746a] hover:text-[#123c2c]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#123c2c] shadow-xs"
                  : "text-[#69746a] hover:text-[#123c2c]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider mr-1.5">
            Contract Status:
          </span>

          {["ALL", "Active Daily Contract", "Periodic Orders", "In Review", "Archived"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setContractFilter(st)}
              className={`px-3 py-1 font-bold rounded-[2px] transition-all border cursor-pointer ${
                contractFilter === st
                  ? "bg-[#123c2c] text-[#f4ecd8] border-[#123c2c]"
                  : "bg-[#faf8f1] text-[#526053] border-[#dcd0b5] hover:bg-[#eee7d7]"
              }`}
            >
              {st === "ALL" ? "All Contracts" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Presentation States */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd]">
          <Loader2 className="w-8 h-8 text-[#8e7139] animate-spin mx-auto" />
          <p className="text-xs text-[#69746a] m-0">Loading corporate customer profiles from Supabase...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-[2px] bg-red-50 border border-red-200 text-red-800 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-bold text-sm">{error}</span>
          </div>
          <p className="text-xs text-red-700 m-0">
            Failed to communicate with Supabase. Please check your credentials or network connection.
          </p>
          <button
            type="button"
            onClick={() => fetchCustomers()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : customers.length === 0 ? (
        /* True Empty State: Zero customers in database */
        <div className="p-16 text-center space-y-3 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#f4eee1] border border-[#ddcca6] grid place-items-center text-[#8e7139] mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
            No corporate customers registered yet
          </h3>
          <p className="text-xs text-[#69746a] max-w-sm mx-auto m-0">
            Get started by registering your first industrial catering account, factory plant, or office team.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-[2px] text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a533d] border border-[#123c2c] shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#c7a45b]" />
            <span>Add First Corporate Customer</span>
          </button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        /* Filtered Empty State */
        <div className="p-16 text-center space-y-3 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd]">
          <div className="w-12 h-12 rounded-full bg-[#f4eee1] border border-[#ddcca6] grid place-items-center text-[#8e7139] mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-[18px] font-bold text-[#123c2c] m-0">
            No matching customers found
          </h3>
          <p className="text-xs text-[#69746a] max-w-sm mx-auto m-0">
            Try searching for a different company name or clearing the contract filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setContractFilter("ALL");
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => {
            const deliveryAddress =
              cust.customer_addresses?.find((a) => a.address_type === "delivery" && a.is_default) ||
              cust.customer_addresses?.find((a) => a.address_type === "delivery");
            const deliveryLocationText = deliveryAddress
              ? [deliveryAddress.address_line, deliveryAddress.city].filter(Boolean).join(", ")
              : "Location unassigned";

            const billingAddress =
              cust.customer_addresses?.find((a) => a.address_type === "billing" && a.is_default) ||
              cust.customer_addresses?.find((a) => a.address_type === "billing");
            const billingAddressText = billingAddress
              ? [billingAddress.address_line, billingAddress.city].filter(Boolean).join(", ")
              : "No billing address specified";

            const isContractActive = cust.contract_status === "Active Daily Contract";

            return (
              <div
                key={cust.id}
                className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] hover:border-[#c9ad70] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#c7a45b]/20 text-[#8e7139] border border-[#dcd0b5] uppercase">
                      {cust.customer_code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                        isContractActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : cust.contract_status === "Periodic Orders"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : cust.contract_status === "In Review"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      {cust.contract_status}
                    </span>
                  </div>

                  <h3 className="font-serif text-[17px] font-bold text-[#173e2d] leading-snug m-0">
                    {cust.company_name}
                  </h3>

                  <div className="mt-2 text-xs space-y-1.5 text-[#516052]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8e7139] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{billingAddressText}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#8e7139]">
                      <span className="font-semibold">Plant Unit:</span>
                      <strong className="text-[#123c2c]">{deliveryLocationText}</strong>
                    </div>
                  </div>

                  {/* Rates & Preset Chip */}
                  <div className="mt-3.5 pt-3 border-t border-[#f0e9dc] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#8e7139] uppercase font-bold block">
                        Contract Rate
                      </span>
                      <span className="font-bold text-[#123c2c]">
                        {cust.default_rate !== null && cust.default_rate !== undefined
                          ? `₹${Number(cust.default_rate).toFixed(2)} / meal`
                          : "Not configured"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8e7139] uppercase font-bold block">
                        Preset
                      </span>
                      <span className="font-semibold text-[#17271e]">
                        {cust.default_preset || "Not configured"}
                      </span>
                    </div>
                  </div>

                  {/* Tax IDs */}
                  <div className="mt-2.5 text-[10.5px] text-[#69746a] bg-[#faf8f1] p-2 rounded-[2px] border border-[#f0e8d9] flex justify-between">
                    <span>
                      GST: <strong className="text-[#17271e]">{cust.gstin || "N/A"}</strong>
                    </span>
                    <span>
                      PAN: <strong className="text-[#17271e]">{cust.pan || "N/A"}</strong>
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[#f0e9dc] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(cust)}
                      className="p-1.5 rounded-[2px] bg-[#faf7ef] hover:bg-[#eee7d7] text-[#123c2c] border border-[#dcd0b5] transition-colors cursor-pointer"
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(cust)}
                      className="p-1.5 rounded-[2px] bg-[#faf7ef] hover:bg-[#eee7d7] text-[#123c2c] border border-[#dcd0b5] transition-colors cursor-pointer"
                      title="Edit profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Link
                    href="/admin/billing"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[2px] font-bold text-xs text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#dcd0b5] transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#8e7139]" />
                    <span>Start Billing</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5ddcd] bg-[#faf8f1] text-[10.5px] font-bold text-[#8e7139] uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer / Company</th>
                <th className="py-3.5 px-3">Code</th>
                <th className="py-3.5 px-3">Delivery Unit</th>
                <th className="py-3.5 px-3">GSTIN</th>
                <th className="py-3.5 px-3">Contract Status</th>
                <th className="py-3.5 px-3">Rate (₹)</th>
                <th className="py-3.5 px-3">Preset</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9dc]">
              {filteredCustomers.map((cust) => {
                const deliveryAddress =
                  cust.customer_addresses?.find((a) => a.address_type === "delivery" && a.is_default) ||
                  cust.customer_addresses?.find((a) => a.address_type === "delivery");
                const deliveryLocationText = deliveryAddress
                  ? [deliveryAddress.address_line, deliveryAddress.city].filter(Boolean).join(", ")
                  : "Unassigned";

                const isContractActive = cust.contract_status === "Active Daily Contract";

                return (
                  <tr
                    key={cust.id}
                    onClick={() => handleOpenDetails(cust)}
                    className="hover:bg-[#faf7ef] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-[#17271e]">
                      {cust.company_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] text-[#8e7139]">
                        {cust.customer_code}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#516052]">
                      {deliveryLocationText}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#69746a]">
                      {cust.gstin || "—"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                          isContractActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : cust.contract_status === "Periodic Orders"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : cust.contract_status === "In Review"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {cust.contract_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#123c2c]">
                      {cust.default_rate !== null && cust.default_rate !== undefined
                        ? `₹${Number(cust.default_rate).toFixed(2)}`
                        : "Not configured"}
                    </td>
                    <td className="py-3 px-3 text-[#516052]">
                      {cust.default_preset || "Not configured"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(cust)}
                          className="p-1 rounded-[2px] hover:bg-[#eee7d7] text-[#123c2c] transition-colors cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#8e7139]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1 rounded-[2px] hover:bg-[#eee7d7] text-[#123c2c] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8e7139]" />
                        </button>
                        <Link
                          href="/admin/billing"
                          className="p-1 rounded-[2px] hover:bg-[#eee7d7] text-[#123c2c] transition-colors"
                          title="Bill"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#8e7139]" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Form Modal (Add / Edit) */}
      <CustomerFormModal
        customer={activeCustomer}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={handleCustomerSaved}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={activeCustomer}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onEdit={(cust) => {
          setDetailsModalOpen(false);
          handleOpenEditModal(cust);
        }}
      />
    </div>
  );
}
