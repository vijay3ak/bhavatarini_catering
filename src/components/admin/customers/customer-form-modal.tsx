"use client";

import React, { useState, useEffect, useRef } from "react";
import { CorporateCustomer, CustomerContractStatus, CustomerPresetContract } from "@/types/admin";
import { X, Building2, Save, AlertCircle } from "lucide-react";

interface CustomerFormModalProps {
  customer?: CorporateCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: CorporateCustomer) => void;
}

export function CustomerFormModal({
  customer,
  isOpen,
  onClose,
  onSave,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    deliveryLocation: "",
    billingAddress: "",
    gstin: "",
    pan: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    contractStatus: "Active Daily Contract" as CustomerContractStatus,
    defaultPreset: "BREAKFAST & DINNER" as CustomerPresetContract,
    defaultRate: 48.0,
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        shortCode: customer.shortCode,
        deliveryLocation: customer.deliveryLocation,
        billingAddress: customer.billingAddress,
        gstin: customer.gstin,
        pan: customer.pan,
        contactPerson: customer.contactPerson,
        contactPhone: customer.contactPhone,
        contactEmail: customer.contactEmail,
        contractStatus: customer.contractStatus,
        defaultPreset: customer.defaultPreset,
        defaultRate: customer.defaultRate,
        notes: customer.notes || "",
      });
    } else {
      setFormData({
        name: "",
        shortCode: "",
        deliveryLocation: "",
        billingAddress: "",
        gstin: "",
        pan: "",
        contactPerson: "Pending confirmation",
        contactPhone: "Pending confirmation",
        contactEmail: "Pending confirmation",
        contractStatus: "Active Daily Contract",
        defaultPreset: "BREAKFAST & DINNER",
        defaultRate: 48.0,
        notes: "",
      });
    }
    setErrors({});
  }, [customer, isOpen]);

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

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Company name is required.";
    if (!formData.deliveryLocation.trim())
      newErrors.deliveryLocation = "Delivery plant / location is required.";
    if (!formData.billingAddress.trim())
      newErrors.billingAddress = "Billing address is required.";
    if (formData.defaultRate <= 0)
      newErrors.defaultRate = "Default rate must be greater than zero.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updatedCustomer: CorporateCustomer = {
      id: customer?.id || `cust-${Date.now()}`,
      name: formData.name.trim().toUpperCase(),
      shortCode:
        formData.shortCode.trim().toUpperCase() ||
        formData.name.trim().slice(0, 6).toUpperCase(),
      deliveryLocation: formData.deliveryLocation.trim().toUpperCase(),
      billingAddress: formData.billingAddress.trim().toUpperCase(),
      gstin: formData.gstin.trim().toUpperCase() || "PENDING CONFIRMATION",
      pan: formData.pan.trim().toUpperCase() || "PENDING CONFIRMATION",
      contactPerson: formData.contactPerson.trim(),
      contactPhone: formData.contactPhone.trim(),
      contactEmail: formData.contactEmail.trim(),
      contractStatus: formData.contractStatus,
      defaultPreset: formData.defaultPreset,
      defaultRate: Number(formData.defaultRate),
      notes: formData.notes.trim(),
      activeContractsCount: customer?.activeContractsCount || 1,
      createdAt: customer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedCustomer);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl bg-[#fffefa] border border-[#e5ddcd] rounded-[2px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-[#faf7ef] border-b border-[#e5ddcd] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f4eee1] border border-[#ddcca6] grid place-items-center text-[#8e7139]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="customer-modal-title"
                className="font-serif text-[18px] font-bold text-[#123c2c] m-0"
              >
                {customer ? "Edit Corporate Customer" : "Add Corporate Customer Profile"}
              </h3>
              <span className="text-[11px] text-[#8e7139]">
                Configured for local state &amp; future billing reconciliation
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-[#dcd0b5] bg-white hover:bg-[#eee7d7] text-[#17271e] grid place-items-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="name" className="font-bold text-[#69746a] uppercase tracking-wider">
                Company Legal Name <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. HYDAC INDIA PRIVATE LIMITED"
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase"
              />
              {errors.name && (
                <span className="text-red-600 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </div>

            {/* Short Code & Location */}
            <div className="space-y-1">
              <label htmlFor="shortCode" className="font-bold text-[#69746a] uppercase tracking-wider">
                Short Identifier / Code
              </label>
              <input
                id="shortCode"
                type="text"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                placeholder="e.g. HYDAC, LMW"
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="deliveryLocation" className="font-bold text-[#69746a] uppercase tracking-wider">
                Plant / Delivery Location <span className="text-red-600">*</span>
              </label>
              <input
                id="deliveryLocation"
                type="text"
                value={formData.deliveryLocation}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryLocation: e.target.value })
                }
                placeholder="e.g. CHETTIPALAYAM, UNIT II"
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase"
              />
              {errors.deliveryLocation && (
                <span className="text-red-600 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.deliveryLocation}
                </span>
              )}
            </div>

            {/* Billing Address */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="billingAddress" className="font-bold text-[#69746a] uppercase tracking-wider">
                Billing Address <span className="text-red-600">*</span>
              </label>
              <textarea
                id="billingAddress"
                rows={2}
                value={formData.billingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, billingAddress: e.target.value })
                }
                placeholder="e.g. CHETTIPALAYAM, COIMBATORE - 641201"
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase"
              />
              {errors.billingAddress && (
                <span className="text-red-600 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.billingAddress}
                </span>
              )}
            </div>

            {/* GSTIN & PAN */}
            <div className="space-y-1">
              <label htmlFor="gstin" className="font-bold text-[#69746a] uppercase tracking-wider">
                Customer GSTIN
              </label>
              <input
                id="gstin"
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="e.g. 33AAACH2910B1ZH"
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="pan" className="font-bold text-[#69746a] uppercase tracking-wider">
                Customer PAN
              </label>
              <input
                id="pan"
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                placeholder="e.g. AAACH2910B"
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase"
              />
            </div>

            {/* Contract Preset & Default Rate */}
            <div className="space-y-1">
              <label htmlFor="defaultPreset" className="font-bold text-[#69746a] uppercase tracking-wider">
                Billing Preset Contract
              </label>
              <select
                id="defaultPreset"
                value={formData.defaultPreset}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPreset: e.target.value as CustomerPresetContract,
                  })
                }
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
              >
                <option value="BREAKFAST & DINNER">BREAKFAST &amp; DINNER (Shift 1 + Shift 2)</option>
                <option value="LUNCH">LUNCH (Full Meals Only)</option>
                <option value="CUSTOM">CUSTOM (Variable)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="defaultRate" className="font-bold text-[#69746a] uppercase tracking-wider">
                Contract Rate (₹ per meal) <span className="text-red-600">*</span>
              </label>
              <input
                id="defaultRate"
                type="number"
                step="0.5"
                min="1"
                value={formData.defaultRate}
                onChange={(e) =>
                  setFormData({ ...formData, defaultRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
              />
            </div>

            {/* Contract Status */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="contractStatus" className="font-bold text-[#69746a] uppercase tracking-wider">
                Contract Status
              </label>
              <select
                id="contractStatus"
                value={formData.contractStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contractStatus: e.target.value as CustomerContractStatus,
                  })
                }
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
              >
                <option value="Active Daily Contract">Active Daily Contract</option>
                <option value="Periodic Orders">Periodic Orders</option>
                <option value="In Review">In Review</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Internal Notes */}
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="notes" className="font-bold text-[#69746a] uppercase tracking-wider">
                Internal Delivery &amp; Operational Notes
              </label>
              <textarea
                id="notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special packaging, delivery gate instructions, or supervisor contact..."
                className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#e5ddcd] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] text-xs font-semibold text-[#17271e] bg-white border border-[#dcd0b5] hover:bg-[#faf7ef] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[2px] text-xs font-bold text-[#f4ecda] bg-gradient-to-r from-[#174a34] to-[#0d3021] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 transition-all"
            >
              <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
              <span>{customer ? "Update Customer" : "Save Customer Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
