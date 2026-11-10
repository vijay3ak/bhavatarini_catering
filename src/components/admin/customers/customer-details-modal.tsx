"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { CustomerRecord } from "@/types/admin";
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Receipt,
  Edit2,
  AlertCircle,
  Tag,
  Phone,
  Mail,
  User,
} from "lucide-react";

interface CustomerDetailsModalProps {
  customer: CustomerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: CustomerRecord) => void;
}

export function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  onEdit,
}: CustomerDetailsModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const deliveryAddress =
    customer.customer_addresses?.find(
      (a) => a.address_type === "delivery" && a.is_default
    ) || customer.customer_addresses?.find((a) => a.address_type === "delivery");

  const deliveryLocationText = deliveryAddress
    ? [deliveryAddress.address_line, deliveryAddress.city, deliveryAddress.pincode]
        .filter(Boolean)
        .join(", ")
    : "Location unassigned";

  const billingAddress =
    customer.customer_addresses?.find(
      (a) => a.address_type === "billing" && a.is_default
    ) || customer.customer_addresses?.find((a) => a.address_type === "billing");

  const billingAddressText = billingAddress
    ? [billingAddress.address_line, billingAddress.city, billingAddress.pincode]
        .filter(Boolean)
        .join(", ")
    : "No registered billing address specified.";

  const primaryContact = customer.customer_contacts?.[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl bg-[#fffefa] border border-[#e5ddcd] rounded-[2px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-[#faf7ef] border-b border-[#e5ddcd] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#c7a45b]/20 text-[#8e7139] border border-[#dcd0b5] uppercase">
                {customer.customer_code}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                  customer.contract_status === "Active Daily Contract"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : customer.contract_status === "Periodic Orders"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : customer.contract_status === "In Review"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                {customer.contract_status}
              </span>
            </div>
            <h3
              id="customer-details-title"
              className="font-serif text-[20px] font-bold text-[#123c2c] m-0"
            >
              {customer.company_name}
            </h3>
            <span className="text-xs text-[#69746a] mt-0.5 block">
              Unit: <strong>{deliveryLocationText}</strong>
            </span>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close customer details"
            className="w-8 h-8 rounded-full border border-[#dcd0b5] bg-white hover:bg-[#eee7d7] text-[#17271e] grid place-items-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-[2px] bg-white border border-[#e5ddcd]">
              <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider block mb-1">
                Contract Rate
              </span>
              <div className="flex items-center gap-1.5 text-base font-bold text-[#123c2c]">
                <DollarSign className="w-4 h-4 text-[#8e7139]" />
                <span>
                  {customer.default_rate !== null && customer.default_rate !== undefined
                    ? `₹${Number(customer.default_rate).toFixed(2)} / meal`
                    : "Not configured"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-[2px] bg-white border border-[#e5ddcd]">
              <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider block mb-1">
                Contract Meal Preset
              </span>
              <div className="flex items-center gap-1.5 font-bold text-[#123c2c]">
                <Tag className="w-4 h-4 text-[#8e7139]" />
                <span>{customer.default_preset || "Not configured"}</span>
              </div>
            </div>
          </div>

          {/* Tax & Legal Identifiers */}
          <div className="p-4 rounded-[2px] bg-[#faf8f1] border border-[#e5ddcd] space-y-2">
            <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider block">
              Tax Registration Identifiers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#69746a] block text-[11px]">GSTIN:</span>
                <span className="font-mono font-bold text-[#17271e] text-xs">
                  {customer.gstin || "Pending confirmation"}
                </span>
              </div>
              <div>
                <span className="text-[#69746a] block text-[11px]">PAN:</span>
                <span className="font-mono font-bold text-[#17271e] text-xs">
                  {customer.pan || "Pending confirmation"}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="p-4 rounded-[2px] bg-white border border-[#e5ddcd] space-y-1">
            <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider block">
              Registered Billing Address
            </span>
            <div className="flex items-start gap-2 text-[#17271e]">
              <MapPin className="w-4 h-4 text-[#8e7139] shrink-0 mt-0.5" />
              <p className="m-0 leading-relaxed font-medium">{billingAddressText}</p>
            </div>
          </div>

          {/* Primary Contact Details */}
          <div className="p-4 rounded-[2px] bg-white border border-[#e5ddcd] space-y-2">
            <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider block">
              Contact Coordination Status
            </span>
            {primaryContact ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#17271e]">
                  <User className="w-3.5 h-3.5 text-[#8e7139]" />
                  <span className="font-semibold">{primaryContact.contact_name}</span>
                  {primaryContact.designation && (
                    <span className="text-[#69746a]">({primaryContact.designation})</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[#516052]">
                  <Phone className="w-3.5 h-3.5 text-[#8e7139]" />
                  <span>{primaryContact.phone}</span>
                </div>
                {primaryContact.email && (
                  <div className="flex items-center gap-2 text-[#516052]">
                    <Mail className="w-3.5 h-3.5 text-[#8e7139]" />
                    <span>{primaryContact.email}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-[2px] border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span className="text-[11px] leading-relaxed">
                  Primary plant coordinator details are marked as <strong>Pending confirmation</strong>.
                  Official business contact should be confirmed before initiating automated SMS or delivery dispatch.
                </span>
              </div>
            )}
          </div>

          {/* Delivery & Operational Notes */}
          {customer.notes && (
            <div className="p-4 rounded-[2px] bg-white border border-[#e5ddcd] space-y-1">
              <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider block">
                Delivery Notes &amp; Logistics
              </span>
              <p className="m-0 text-[#69746a] leading-relaxed italic">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#faf7ef] border-t border-[#e5ddcd] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(customer);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-white border border-[#dcd0b5] hover:bg-[#faf7ef] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Edit Profile</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/billing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[2px] text-xs font-bold text-[#f4ecda] bg-gradient-to-r from-[#174a34] to-[#0d3021] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 transition-all"
            >
              <Receipt className="w-3.5 h-3.5 text-[#c7a45b]" />
              <span>Start Monthly Billing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
