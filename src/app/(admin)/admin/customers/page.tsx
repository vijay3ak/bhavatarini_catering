"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  FileText,
  DollarSign,
  Tag,
  Receipt,
  Edit2,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { MOCK_CORPORATE_CUSTOMERS } from "@/lib/data/mock-admin-data";
import { CorporateCustomer, CustomerContractStatus } from "@/types/admin";
import { CustomerFormModal } from "@/components/admin/customers/customer-form-modal";
import { CustomerDetailsModal } from "@/components/admin/customers/customer-details-modal";

export default function CorporateCustomersPage() {
  const [customers, setCustomers] = useState<CorporateCustomer[]>(MOCK_CORPORATE_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractFilter, setContractFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CorporateCustomer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.shortCode.toLowerCase().includes(q) ||
        cust.deliveryLocation.toLowerCase().includes(q) ||
        cust.billingAddress.toLowerCase().includes(q) ||
        cust.gstin.toLowerCase().includes(q);

      const matchContract =
        contractFilter === "ALL" || cust.contractStatus === contractFilter;

      return matchSearch && matchContract;
    });
  }, [customers, searchQuery, contractFilter]);

  // Handlers
  const handleOpenDetails = (cust: CorporateCustomer) => {
    setActiveCustomer(cust);
    setDetailsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setActiveCustomer(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (cust: CorporateCustomer) => {
    setActiveCustomer(cust);
    setFormModalOpen(true);
  };

  const handleSaveCustomer = (savedCustomer: CorporateCustomer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === savedCustomer.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCustomer.id ? savedCustomer : c));
      } else {
        return [savedCustomer, ...prev];
      }
    });
    showToast(`Saved customer profile for ${savedCustomer.name}`);
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] text-xs font-bold text-[#f4ecda] bg-gradient-to-r from-[#174a34] to-[#0d3021] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 transition-all cursor-pointer"
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
              className={`p-1.5 rounded-[2px] transition-colors ${
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
              className={`p-1.5 rounded-[2px] transition-colors ${
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

          {["ALL", "Active Daily Contract", "Periodic Orders", "In Review"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setContractFilter(st)}
              className={`px-3 py-1 font-bold rounded-[2px] transition-all border ${
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

      {/* Customer Presentation */}
      {filteredCustomers.length === 0 ? (
        /* Empty State */
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
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] hover:border-[#c9ad70] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#c7a45b]/20 text-[#8e7139] border border-[#dcd0b5] uppercase">
                    {cust.shortCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                      cust.contractStatus === "Active Daily Contract"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {cust.contractStatus}
                  </span>
                </div>

                <h3 className="font-serif text-[17px] font-bold text-[#173e2d] leading-snug m-0">
                  {cust.name}
                </h3>

                <div className="mt-2 text-xs space-y-1.5 text-[#516052]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8e7139] shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{cust.billingAddress}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#8e7139]">
                    <span className="font-semibold">Plant Unit:</span>
                    <strong className="text-[#123c2c]">{cust.deliveryLocation}</strong>
                  </div>
                </div>

                {/* Rates & Preset Chip */}
                <div className="mt-3.5 pt-3 border-t border-[#f0e9dc] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#8e7139] uppercase font-bold block">
                      Contract Rate
                    </span>
                    <span className="font-bold text-[#123c2c]">
                      ₹{cust.defaultRate.toFixed(2)} / meal
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#8e7139] uppercase font-bold block">
                      Preset
                    </span>
                    <span className="font-semibold text-[#17271e]">
                      {cust.defaultPreset}
                    </span>
                  </div>
                </div>

                {/* Tax IDs */}
                <div className="mt-2.5 text-[10.5px] text-[#69746a] bg-[#faf8f1] p-2 rounded-[2px] border border-[#f0e8d9] flex justify-between">
                  <span>GST: <strong className="text-[#17271e]">{cust.gstin}</strong></span>
                  <span>PAN: <strong className="text-[#17271e]">{cust.pan}</strong></span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#f0e9dc] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(cust)}
                    className="p-1.5 rounded-[2px] bg-[#faf7ef] hover:bg-[#eee7d7] text-[#123c2c] border border-[#dcd0b5] transition-colors"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(cust)}
                    className="p-1.5 rounded-[2px] bg-[#faf7ef] hover:bg-[#eee7d7] text-[#123c2c] border border-[#dcd0b5] transition-colors"
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
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7ef] text-[#69746a] text-[10px] uppercase font-bold tracking-wider border-b border-[#e5ddcd]">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">GSTIN</th>
                <th className="py-3 px-3">Contract Status</th>
                <th className="py-3 px-3">Rate (₹)</th>
                <th className="py-3 px-3">Preset</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9dc]">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#faf7ef] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#123c2c] text-[13px]">{cust.name}</div>
                    <div className="text-[11px] text-[#69746a]">{cust.billingAddress}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#17271e]">
                    {cust.deliveryLocation}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#415042]">
                    {cust.gstin}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                        cust.contractStatus === "Active Daily Contract"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {cust.contractStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#123c2c]">
                    ₹{cust.defaultRate.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-[#526053] font-medium">
                    {cust.defaultPreset}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(cust)}
                        className="px-2 py-1 rounded-[2px] text-xs font-semibold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4]"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cust)}
                        className="p-1 rounded-[2px] text-[#69746a] hover:text-[#123c2c]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Form Modal (Add / Edit) */}
      <CustomerFormModal
        customer={activeCustomer}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={activeCustomer}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onEdit={handleOpenEditModal}
      />
    </div>
  );
}
