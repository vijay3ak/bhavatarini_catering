"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CustomerRecord,
  CustomerContractStatus,
} from "@/types/admin";
import { X, Building2, Save, AlertCircle, Loader2, Copy, Trash2, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CustomerFormModalProps {
  customer?: CustomerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
  name: "",
  shortCode: "",
  deliveryAddressLine: "",
  deliveryCity: "Coimbatore",
  deliveryPincode: "",
  billingAddressLine: "",
  billingCity: "Coimbatore",
  billingPincode: "",
  gstin: "",
  pan: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  contractStatus: "In Review" as CustomerContractStatus,
  defaultPreset: "" as string,
  defaultRate: "" as string,
  notes: "",
};

export function CustomerFormModal({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [deliveryAddressId, setDeliveryAddressId] = useState<string | null>(null);
  const [billingAddressId, setBillingAddressId] = useState<string | null>(null);
  const [isContactCleared, setIsContactCleared] = useState(false);
  const [hasExistingContact, setHasExistingContact] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedDeliveryNotice, setCopiedDeliveryNotice] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (customer) {
      const delivery = customer.customer_addresses?.find(
        (a) => a.address_type === "delivery" && a.is_default
      ) || customer.customer_addresses?.find((a) => a.address_type === "delivery");

      const billing = customer.customer_addresses?.find(
        (a) => a.address_type === "billing" && a.is_default
      ) || customer.customer_addresses?.find((a) => a.address_type === "billing");

      const contact = customer.customer_contacts?.[0];

      setDeliveryAddressId(delivery?.id || null);
      setBillingAddressId(billing?.id || null);
      setHasExistingContact(Boolean(contact));
      setIsContactCleared(false);

      setFormData({
        name: customer.company_name || "",
        shortCode: customer.customer_code || "",
        deliveryAddressLine: delivery?.address_line || "",
        deliveryCity: delivery?.city || "Coimbatore",
        deliveryPincode: delivery?.pincode || "",
        billingAddressLine: billing?.address_line || "",
        billingCity: billing?.city || "Coimbatore",
        billingPincode: billing?.pincode || "",
        gstin: customer.gstin || "",
        pan: customer.pan || "",
        contactPerson: contact?.contact_name || "",
        contactPhone: contact?.phone || "",
        contactEmail: contact?.email || "",
        contractStatus: customer.contract_status || "In Review",
        defaultPreset: customer.default_preset || "",
        defaultRate:
          customer.default_rate !== null && customer.default_rate !== undefined
            ? String(customer.default_rate)
            : "",
        notes: customer.notes || "",
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
      setDeliveryAddressId(null);
      setBillingAddressId(null);
      setHasExistingContact(false);
      setIsContactCleared(false);
    }
    setErrors({});
    setSubmitError(null);
    setCopiedDeliveryNotice(false);
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

  const copyDeliveryToBilling = () => {
    setFormData((prev) => ({
      ...prev,
      billingAddressLine: prev.deliveryAddressLine,
      billingCity: prev.deliveryCity,
      billingPincode: prev.deliveryPincode,
    }));
    setCopiedDeliveryNotice(true);
    setTimeout(() => setCopiedDeliveryNotice(false), 2000);
  };

  const handleClearContact = () => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
    }));
    setIsContactCleared(true);
  };

  const handleRestoreContact = () => {
    const contact = customer?.customer_contacts?.[0];
    if (contact) {
      setFormData((prev) => ({
        ...prev,
        contactPerson: contact.contact_name || "",
        contactPhone: contact.phone || "",
        contactEmail: contact.email || "",
      }));
    }
    setIsContactCleared(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 1. Company Legal Name (min 2 chars)
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Company legal name must be at least 2 characters.";
    }

    // 2. Short identifier code (optional; regex validation if entered)
    if (formData.shortCode.trim()) {
      const code = formData.shortCode.trim().toUpperCase();
      if (!/^[A-Z0-9_-]+$/.test(code)) {
        newErrors.shortCode =
          "Code may only contain uppercase alphanumeric characters, underscores, or hyphens.";
      }
    }

    // 3. Delivery Address Line & City (mandatory, non-empty)
    if (!formData.deliveryAddressLine.trim()) {
      newErrors.deliveryAddressLine = "Plant / delivery address line is required.";
    }
    if (!formData.deliveryCity.trim()) {
      newErrors.deliveryCity = "Delivery city is required.";
    }

    // 4. Delivery Pincode (optional; must be 6 digits if provided)
    if (formData.deliveryPincode.trim()) {
      if (!/^[0-9]{6}$/.test(formData.deliveryPincode.trim())) {
        newErrors.deliveryPincode = "Delivery pincode must be exactly 6 digits.";
      }
    }

    // 5. Billing Address Line & City (mandatory, non-empty)
    if (!formData.billingAddressLine.trim()) {
      newErrors.billingAddressLine = "Billing address line is required.";
    }
    if (!formData.billingCity.trim()) {
      newErrors.billingCity = "Billing city is required.";
    }

    // 6. Billing Pincode (optional; must be 6 digits if provided)
    if (formData.billingPincode.trim()) {
      if (!/^[0-9]{6}$/.test(formData.billingPincode.trim())) {
        newErrors.billingPincode = "Billing pincode must be exactly 6 digits.";
      }
    }

    // 7. Contract Rate (optional; if entered, must be > 0)
    if (formData.defaultRate.trim()) {
      const rateNum = parseFloat(formData.defaultRate.trim());
      if (isNaN(rateNum) || rateNum <= 0) {
        newErrors.defaultRate = "Contract rate must be greater than zero.";
      }
    }

    // 8. Contact Email (optional; regex validation if entered)
    if (formData.contactEmail.trim()) {
      if (
        !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
          formData.contactEmail.trim()
        )
      ) {
        newErrors.contactEmail =
          "Please enter a valid email address (e.g. contact@company.com).";
      }
    }

    // 9. Contact coordination check: if either is provided, both are required
    if (formData.contactPhone.trim() && !formData.contactPerson.trim()) {
      newErrors.contactPerson =
        "Contact person name is required when phone is specified.";
    }
    if (formData.contactPerson.trim() && !formData.contactPhone.trim()) {
      newErrors.contactPhone =
        "Contact phone number is required when contact person is specified.";
    }
    if (formData.contactPhone.trim().length > 20) {
      newErrors.contactPhone =
        "Contact phone number cannot exceed 20 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const companyName = formData.name.trim();
      const finalCode =
        formData.shortCode.trim().toUpperCase() ||
        companyName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase();

      const gstin = formData.gstin.trim().toUpperCase() || null;
      const pan = formData.pan.trim().toUpperCase() || null;
      const contractStatus = formData.contractStatus;
      const defaultRate =
        formData.defaultRate.trim() ? parseFloat(formData.defaultRate.trim()) : null;
      const defaultPreset = formData.defaultPreset.trim() || null;
      const notes = formData.notes.trim() || null;

      const deliveryAddressLine = formData.deliveryAddressLine.trim().toUpperCase();
      const deliveryCity = formData.deliveryCity.trim();
      const deliveryPincode = formData.deliveryPincode.trim() || null;

      const billingAddressLine = formData.billingAddressLine.trim().toUpperCase();
      const billingCity = formData.billingCity.trim();
      const billingPincode = formData.billingPincode.trim() || null;

      const contactPerson = formData.contactPerson.trim() || null;
      const contactPhone = formData.contactPhone.trim() || null;
      const contactEmail = formData.contactEmail.trim() || null;

      const rpcPayload = {
        p_id: customer?.id || null,
        p_customer_code: finalCode,
        p_company_name: companyName,
        p_gstin: gstin,
        p_pan: pan,
        p_contract_status: contractStatus,
        p_default_rate: defaultRate,
        p_default_preset: defaultPreset,
        p_notes: notes,
        p_delivery_address_line: deliveryAddressLine,
        p_delivery_city: deliveryCity,
        p_delivery_pincode: deliveryPincode,
        p_billing_address_line: billingAddressLine,
        p_billing_city: billingCity,
        p_billing_pincode: billingPincode,
        p_contact_name: contactPerson,
        p_contact_phone: contactPhone,
        p_contact_email: contactEmail,
        p_contact_designation: null,
        p_clear_contact: isContactCleared,
        p_delivery_address_id: deliveryAddressId,
        p_billing_address_id: billingAddressId,
      };

      const { data: savedId, error: rpcError } = await (supabase.rpc as any)(
        "save_customer_profile",
        rpcPayload
      );

      if (rpcError) {
        let userMessage =
          rpcError.message || "Failed to save corporate customer profile.";

        if (rpcError.code === "42501" || userMessage.includes("Access denied")) {
          userMessage =
            "Access denied: Only administrators with role Owner or Admin can create or update corporate customer profiles.";
        } else if (
          rpcError.code === "23505" ||
          userMessage.includes("unique") ||
          userMessage.includes("already exists")
        ) {
          userMessage = `A customer with short code "${finalCode}" already exists. Please choose a unique code.`;
        } else if (rpcError.code === "23514") {
          userMessage = rpcError.message;
        } else if (
          userMessage.includes("save_customer_profile") ||
          userMessage.includes("Could not find the function")
        ) {
          userMessage =
            "Database migration pending: The atomic function 'save_customer_profile' has not yet been applied to the database. Please request project owner migration approval.";
        }

        throw new Error(userMessage);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Customer save error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl bg-[#fffefa] border border-[#e5ddcd] rounded-[2px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
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
                Synchronized atomically with Supabase PostgreSQL master tables
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-[#dcd0b5] bg-white hover:bg-[#eee7d7] text-[#17271e] grid place-items-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {submitError && (
            <div className="p-3.5 rounded-[2px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Error saving customer profile:</span>
                <p className="m-0 text-[11.5px] leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          {/* Section: Basic Identity */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider pb-1 border-b border-[#f0ebd9]">
              1. Corporate Identity
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Legal Name */}
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="name" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Company Legal Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. HYDAC INDIA PRIVATE LIMITED"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase disabled:opacity-60"
                />
                {errors.name && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </span>
                )}
              </div>

              {/* Short Identifier / Code */}
              <div className="space-y-1">
                <label htmlFor="shortCode" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Short Identifier / Code
                </label>
                <input
                  id="shortCode"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.shortCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortCode: e.target.value }))}
                  placeholder="e.g. HYDAC, LMW"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase disabled:opacity-60"
                />
                <span className="text-[11px] text-[#8e7139] block">
                  Optional. Auto-generated from company name if omitted.
                </span>
                {errors.shortCode && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.shortCode}
                  </span>
                )}
              </div>

              {/* Contract Status (default: In Review) */}
              <div className="space-y-1">
                <label htmlFor="contractStatus" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Contract Status
                </label>
                <select
                  id="contractStatus"
                  disabled={isSubmitting}
                  value={formData.contractStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contractStatus: e.target.value as CustomerContractStatus,
                    }))
                  }
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                >
                  <option value="In Review">In Review (Pending Terms)</option>
                  <option value="Active Daily Contract">Active Daily Contract</option>
                  <option value="Periodic Orders">Periodic Orders</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Delivery Plant & Address */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider pb-1 border-b border-[#f0ebd9]">
              2. Plant / Delivery Location
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3 space-y-1">
                <label htmlFor="deliveryAddressLine" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Plant / Delivery Facility Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="deliveryAddressLine"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.deliveryAddressLine}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deliveryAddressLine: e.target.value }))
                  }
                  placeholder="e.g. SF NO. 124, CHETTIPALAYAM, UNIT II"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase disabled:opacity-60"
                />
                {errors.deliveryAddressLine && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.deliveryAddressLine}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="deliveryCity" className="font-bold text-[#69746a] uppercase tracking-wider">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  id="deliveryCity"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.deliveryCity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deliveryCity: e.target.value }))
                  }
                  placeholder="e.g. Coimbatore"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.deliveryCity && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.deliveryCity}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="deliveryPincode" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Pincode
                </label>
                <input
                  id="deliveryPincode"
                  type="text"
                  maxLength={6}
                  disabled={isSubmitting}
                  value={formData.deliveryPincode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, deliveryPincode: e.target.value.replace(/[^0-9]/g, "") }))
                  }
                  placeholder="e.g. 641201"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.deliveryPincode && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.deliveryPincode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Billing Address */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#f0ebd9]">
              <span className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider">
                3. Registered Billing Address
              </span>
              <button
                type="button"
                onClick={copyDeliveryToBilling}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8e7139] hover:text-[#123c2c] transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedDeliveryNotice ? "Copied!" : "Same as delivery"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3 space-y-1">
                <label htmlFor="billingAddressLine" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Billing Street Address <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="billingAddressLine"
                  rows={2}
                  disabled={isSubmitting}
                  value={formData.billingAddressLine}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billingAddressLine: e.target.value }))
                  }
                  placeholder="e.g. SF NO. 124, POLLACHI MAIN ROAD, CHETTIPALAYAM"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase disabled:opacity-60"
                />
                {errors.billingAddressLine && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.billingAddressLine}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="billingCity" className="font-bold text-[#69746a] uppercase tracking-wider">
                  City <span className="text-red-600">*</span>
                </label>
                <input
                  id="billingCity"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.billingCity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billingCity: e.target.value }))
                  }
                  placeholder="e.g. Coimbatore"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.billingCity && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.billingCity}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="billingPincode" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Pincode
                </label>
                <input
                  id="billingPincode"
                  type="text"
                  maxLength={6}
                  disabled={isSubmitting}
                  value={formData.billingPincode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billingPincode: e.target.value.replace(/[^0-9]/g, "") }))
                  }
                  placeholder="e.g. 641201"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.billingPincode && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.billingPincode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Primary Contact Coordination */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#f0ebd9]">
              <span className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider">
                4. Primary Contact &amp; Dispatch Coordination
              </span>
              {hasExistingContact && !isContactCleared && (
                <button
                  type="button"
                  onClick={handleClearContact}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Contact</span>
                </button>
              )}
              {isContactCleared && (
                <button
                  type="button"
                  onClick={handleRestoreContact}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Contact</span>
                </button>
              )}
            </div>

            {isContactCleared && (
              <div className="p-2.5 rounded-[2px] bg-amber-50 border border-amber-200 text-amber-900 text-[11.5px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Contact marked for removal upon saving. Existing contact records will be deleted.</span>
              </div>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${isContactCleared ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="space-y-1">
                <label htmlFor="contactPerson" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Contact Person
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  disabled={isSubmitting || isContactCleared}
                  value={formData.contactPerson}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="e.g. R. Saravanan"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.contactPerson && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.contactPerson}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="contactPhone" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  disabled={isSubmitting || isContactCleared}
                  value={formData.contactPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="e.g. 9842200000"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.contactPhone && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.contactPhone}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="contactEmail" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  disabled={isSubmitting || isContactCleared}
                  value={formData.contactEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="e.g. admin@company.com"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.contactEmail && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.contactEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Commercial Parameters */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold text-[#8e7139] uppercase tracking-wider pb-1 border-b border-[#f0ebd9]">
              5. Commercial Terms &amp; Tax Identifiers
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contract Preset (starts unselected) */}
              <div className="space-y-1">
                <label htmlFor="defaultPreset" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Billing Preset Contract
                </label>
                <select
                  id="defaultPreset"
                  disabled={isSubmitting}
                  value={formData.defaultPreset}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultPreset: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                >
                  <option value="">Select preset (Optional)</option>
                  <option value="BREAKFAST & DINNER">BREAKFAST &amp; DINNER (Shift 1 + Shift 2)</option>
                  <option value="LUNCH">LUNCH (Full Meals Only)</option>
                  <option value="CUSTOM">CUSTOM (Variable)</option>
                </select>
              </div>

              {/* Default Rate (starts blank, optional) */}
              <div className="space-y-1">
                <label htmlFor="defaultRate" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Contract Rate (₹ per meal)
                </label>
                <input
                  id="defaultRate"
                  type="number"
                  step="0.5"
                  min="0.01"
                  disabled={isSubmitting}
                  value={formData.defaultRate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, defaultRate: e.target.value }))
                  }
                  placeholder="e.g. 52.00 (Optional)"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
                {errors.defaultRate && (
                  <span className="text-red-600 text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.defaultRate}
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
                  disabled={isSubmitting}
                  value={formData.gstin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gstin: e.target.value }))}
                  placeholder="e.g. 33AAACH2910B1ZH (Optional)"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="pan" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Customer PAN
                </label>
                <input
                  id="pan"
                  type="text"
                  disabled={isSubmitting}
                  value={formData.pan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pan: e.target.value }))}
                  placeholder="e.g. AAACH2910B (Optional)"
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none uppercase disabled:opacity-60"
                />
              </div>

              {/* Internal Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="notes" className="font-bold text-[#69746a] uppercase tracking-wider">
                  Internal Delivery &amp; Operational Notes
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  disabled={isSubmitting}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special packaging, delivery gate instructions, shift timings..."
                  className="w-full p-2.5 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#e5ddcd] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] text-xs font-semibold text-[#17271e] bg-white border border-[#dcd0b5] hover:bg-[#faf7ef] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-[2px] text-xs font-bold text-[#f4ecda] bg-gradient-to-r from-[#174a34] to-[#0d3021] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 transition-all cursor-pointer ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c7a45b]" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
                  <span>{customer ? "Update Customer" : "Save Customer Profile"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
