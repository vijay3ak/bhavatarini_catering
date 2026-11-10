"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Building2,
  Phone,
  ShieldCheck,
  CreditCard,
  Clock,
  RotateCcw,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
  Lock,
  Loader2,
  Users,
  MapPin,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SettingsTab = "profile" | "contact" | "tax" | "bank" | "operations";

interface BusinessSettingsFormState {
  // Identity (business_settings)
  brandName: string;
  legalName: string;

  // Contact (business_settings)
  primaryPhone: string;
  whatsappNumber: string;
  officialEmail: string;

  // Tax Identifiers (business_settings)
  gstin: string;
  pan: string;

  // Bank Coordinates (business_settings.bank_details jsonb)
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;

  // Invoice Terms (business_settings)
  invoiceTerms: string;

  // Operations Parameters (business_operations)
  serviceStartTime: string;
  serviceEndTime: string;
  minHeadcount: string;
  maxHeadcount: string;
  leadTimeHours: string;
  serviceAreas: string;
}

const EMPTY_FORM: BusinessSettingsFormState = {
  brandName: "",
  legalName: "",
  primaryPhone: "",
  whatsappNumber: "",
  officialEmail: "",
  gstin: "",
  pan: "",
  bankName: "",
  bankBranch: "",
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  invoiceTerms: "",
  serviceStartTime: "",
  serviceEndTime: "",
  minHeadcount: "",
  maxHeadcount: "",
  leadTimeHours: "",
  serviceAreas: "",
};

export default function SystemConfigurationPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [formData, setFormData] = useState<BusinessSettingsFormState>(EMPTY_FORM);
  const [savedData, setSavedData] = useState<BusinessSettingsFormState>(EMPTY_FORM);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string>("00000000-0000-0000-0000-000000000010");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const triggerToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage((c) => (c?.text === text ? null : c));
    }, 4000);
  };

  // Live Supabase fetch on mount and after save
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const supabase = createClient();

      // 1. Fetch current session and admin role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await (supabase.from("admin_profiles") as any)
          .select("role_id, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role_id) {
          setUserRole(profile.role_id);
        }
      }

      // 2. Fetch business_settings
      const { data: settingsRow, error: sErr } = await (supabase.from("business_settings") as any)
        .select("*")
        .limit(1)
        .maybeSingle();

      if (sErr) throw sErr;

      let opRow: any = null;
      if (settingsRow?.id) {
        setSettingsId(settingsRow.id);
        setLastUpdatedAt(settingsRow.updated_at);

        // 3. Fetch linked business_operations
        const { data: opsData, error: opErr } = await (supabase.from("business_operations") as any)
          .select("*")
          .eq("settings_id", settingsRow.id)
          .limit(1)
          .maybeSingle();

        if (opErr) throw opErr;
        opRow = opsData;
      }

      const bankDetails = (settingsRow?.bank_details as any) || {};

      const loaded: BusinessSettingsFormState = {
        brandName: settingsRow?.brand_name || "",
        legalName: settingsRow?.legal_name || "",
        primaryPhone: settingsRow?.primary_phone || "",
        whatsappNumber: settingsRow?.whatsapp_number || "",
        officialEmail: settingsRow?.official_email || "",
        gstin: settingsRow?.gstin || "",
        pan: settingsRow?.pan || "",
        bankName: bankDetails.bank_name || "",
        bankBranch: bankDetails.branch || "",
        accountName: bankDetails.account_name || "",
        accountNumber: bankDetails.account_number || "",
        ifscCode: bankDetails.ifsc_code || "",
        invoiceTerms: settingsRow?.invoice_terms || "",
        serviceStartTime: opRow?.service_start_time || "",
        serviceEndTime: opRow?.service_end_time || "",
        minHeadcount: opRow?.min_headcount != null ? String(opRow.min_headcount) : "",
        maxHeadcount: opRow?.max_headcount != null ? String(opRow.max_headcount) : "",
        leadTimeHours: opRow?.lead_time_hours != null ? String(opRow.lead_time_hours) : "",
        serviceAreas: opRow?.service_areas || "",
      };

      setFormData(loaded);
      setSavedData(loaded);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load business configuration from Supabase.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleFieldChange = <K extends keyof BusinessSettingsFormState>(
    field: K,
    value: BusinessSettingsFormState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData(savedData);
    triggerToast("Reset form inputs to persisted database configuration.");
  };

  // Permissions logic
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";
  const isStaff = userRole === "staff";

  // Corporate settings require Owner role
  const canEditCorporate = isOwner;
  // Operations parameters can be edited by Owner or Admin
  const canEditOperations = isOwner || isAdmin;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isStaff) {
      triggerToast("Access Denied: Staff accounts have read-only permissions.", true);
      return;
    }

    // Input Validations
    if (canEditCorporate && !formData.brandName.trim()) {
      triggerToast("Validation error: Brand name cannot be empty.", true);
      return;
    }

    if (
      canEditCorporate &&
      formData.officialEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail.trim())
    ) {
      triggerToast("Validation error: Please enter a valid official email address.", true);
      return;
    }

    if (
      canEditCorporate &&
      formData.gstin.trim() &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(formData.gstin.trim())
    ) {
      triggerToast(
        "Validation error: Invalid GSTIN format (15 characters expected, e.g. 33AAAAA0000A1Z5).",
        true
      );
      return;
    }

    if (
      canEditCorporate &&
      formData.pan.trim() &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan.trim())
    ) {
      triggerToast(
        "Validation error: Invalid PAN format (10 characters expected, e.g. ABCDE1234F).",
        true
      );
      return;
    }

    if (
      canEditCorporate &&
      formData.ifscCode.trim() &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode.trim())
    ) {
      triggerToast(
        "Validation error: Invalid IFSC Code format (11 characters expected, e.g. SBIN0001234).",
        true
      );
      return;
    }

    if (canEditOperations && formData.minHeadcount) {
      const minVal = parseInt(formData.minHeadcount, 10);
      if (isNaN(minVal) || minVal < 0) {
        triggerToast("Validation error: Minimum headcount must be 0 or a positive integer.", true);
        return;
      }
    }

    if (canEditOperations && formData.maxHeadcount) {
      const maxVal = parseInt(formData.maxHeadcount, 10);
      if (isNaN(maxVal) || maxVal < 0) {
        triggerToast("Validation error: Maximum headcount must be 0 or a positive integer.", true);
        return;
      }
    }

    if (canEditOperations && formData.minHeadcount && formData.maxHeadcount) {
      const minVal = parseInt(formData.minHeadcount, 10);
      const maxVal = parseInt(formData.maxHeadcount, 10);
      if (minVal > maxVal) {
        triggerToast("Validation error: Minimum headcount cannot exceed maximum headcount.", true);
        return;
      }
    }

    if (canEditOperations && formData.leadTimeHours) {
      const leadVal = parseInt(formData.leadTimeHours, 10);
      if (isNaN(leadVal) || leadVal < 0) {
        triggerToast("Validation error: Lead time hours must be a positive integer.", true);
        return;
      }
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const targetId = settingsId || "00000000-0000-0000-0000-000000000010";

      // 1. Update business_settings (Owner only)
      if (canEditCorporate) {
        const { error: sUpdateErr } = await (supabase.from("business_settings") as any)
          .update({
            brand_name: formData.brandName.trim() || null,
            legal_name: formData.legalName.trim() || null,
            primary_phone: formData.primaryPhone.trim() || null,
            whatsapp_number: formData.whatsappNumber.trim() || null,
            official_email: formData.officialEmail.trim() || null,
            gstin: formData.gstin.trim() ? formData.gstin.trim().toUpperCase() : null,
            pan: formData.pan.trim() ? formData.pan.trim().toUpperCase() : null,
            bank_details: {
              bank_name: formData.bankName.trim() || null,
              branch: formData.bankBranch.trim() || null,
              account_name: formData.accountName.trim() || null,
              account_number: formData.accountNumber.trim() || null,
              ifsc_code: formData.ifscCode.trim() ? formData.ifscCode.trim().toUpperCase() : null,
            },
            invoice_terms: formData.invoiceTerms.trim() || null,
            updated_by: currentUserId || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetId);

        if (sUpdateErr) throw sUpdateErr;
      }

      // 2. Update business_operations (Owner or Admin)
      if (canEditOperations) {
        const { error: opUpdateErr } = await (supabase.from("business_operations") as any)
          .update({
            service_start_time: formData.serviceStartTime.trim() || null,
            service_end_time: formData.serviceEndTime.trim() || null,
            min_headcount: formData.minHeadcount ? parseInt(formData.minHeadcount, 10) : null,
            max_headcount: formData.maxHeadcount ? parseInt(formData.maxHeadcount, 10) : null,
            lead_time_hours: formData.leadTimeHours ? parseInt(formData.leadTimeHours, 10) : null,
            service_areas: formData.serviceAreas.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("settings_id", targetId);

        if (opUpdateErr) throw opUpdateErr;
      }

      setSavedData(formData);
      triggerToast("Business settings successfully updated in Supabase.");
      await fetchSettings();
    } catch (err: any) {
      triggerToast(`Update failed: ${err?.message || "Database write rejected."}`, true);
    } finally {
      setIsSaving(false);
    }
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Business Profile", icon: Building2 },
    { id: "contact", label: "Contact Information", icon: Phone },
    { id: "tax", label: "Tax & Identifiers", icon: ShieldCheck },
    { id: "bank", label: "Bank & Terms", icon: CreditCard },
    { id: "operations", label: "Operations Parameters", icon: Clock },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-[2px] px-4 py-2.5 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 border ${
            toastMessage.isError
              ? "bg-[#fff2f2] text-[#991b1b] border-[#f87171]"
              : "bg-[#123c2c] text-[#faf8f1] border-[#c7a45b]"
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#c7a45b] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#e5ddcd]">
        <div>
          <div className="flex items-center gap-2 text-[#8e7139] text-[10.5px] font-bold uppercase tracking-[2px] mb-1">
            <Settings className="w-3.5 h-3.5 text-[#8e7139]" />
            <span>Application Administration</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#123c2c] m-0">
            Business Settings
          </h1>
          <p className="text-xs md:text-sm text-[#5c685e] mt-1 max-w-2xl leading-relaxed m-0">
            Official catering business identity, communication channels, statutory identifiers and operational parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#123c2c] bg-[#ffffff] hover:bg-[#faf7ef] border border-[#dcd0b5] rounded-[2px] transition-colors shadow-xs"
          >
            <span>Back to Overview</span>
          </Link>
        </div>
      </div>

      {/* Role & Persistence Status Banner */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#faf7ef] p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[#fffefa] border border-[#dcd0b5] text-[#8e7139] grid place-items-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#123c2c] uppercase tracking-wide text-[11px]">
                  Database Connected: Supabase PostgreSQL
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                    isOwner
                      ? "bg-[#123c2c] text-[#faf8f1]"
                      : isAdmin
                      ? "bg-[#c7a45b]/20 text-[#8e7139] border border-[#c7a45b]"
                      : "bg-[#e5ddcd] text-[#5c685e]"
                  }`}
                >
                  Role: {userRole ? userRole.toUpperCase() : "AUTHENTICATING..."}
                </span>
              </div>
              <p className="text-[#5c685e] mt-0.5 leading-relaxed m-0 text-[11px]">
                {isOwner
                  ? "You have Owner privileges. All corporate identity, tax identifiers, bank coordinates, and operational parameters can be updated."
                  : isAdmin
                  ? "You have Admin privileges. Operations parameters are editable; corporate identity, tax, and bank coordinates require Owner privileges."
                  : "You have Staff privileges. Configuration is presented in view-only mode."}
              </p>
            </div>
          </div>

          {lastUpdatedAt && (
            <div className="text-[10.5px] text-[#8e7139] font-mono shrink-0 sm:text-right">
              Last saved: {new Date(lastUpdatedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Fetch Error Display */}
      {fetchError && (
        <div className="p-4 rounded-[2px] bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={fetchSettings}
            className="px-2.5 py-1 text-xs font-bold bg-white border border-red-300 rounded-[2px] hover:bg-red-50 text-red-700 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Settings Container */}
      {isLoading ? (
        <div className="p-16 text-center space-y-3 rounded-[2px] border border-[#e5ddcd] bg-white">
          <Loader2 className="w-7 h-7 text-[#8e7139] animate-spin mx-auto" />
          <p className="text-xs text-[#5c685e] font-semibold">
            Loading business configuration from Supabase PostgreSQL...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Navigation Tabs */}
          <div className="lg:col-span-3 space-y-3">
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-2 shadow-xs">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#8e7139]">
                Settings Categories
              </div>
              <nav className="space-y-0.5" aria-label="Settings configuration navigation">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[2px] text-xs font-semibold transition-all text-left cursor-pointer ${
                        active
                          ? "bg-[#123c2c] text-[#faf8f1] shadow-xs"
                          : "text-[#5c685e] hover:bg-[#faf7ef] hover:text-[#17271e]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-[#c7a45b]" : "text-[#8e7139]"
                          }`}
                        />
                        <span className="truncate">{t.label}</span>
                      </div>
                      {!canEditCorporate && t.id !== "operations" && (
                        <Lock className="w-3 h-3 text-[#a89f91] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 bg-[#faf7ef] border border-[#e5ddcd] rounded-[2px] text-[11px] text-[#69746a] space-y-1.5 hidden lg:block">
              <p className="font-semibold text-[#17271e] m-0 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>Security &amp; Persistence</span>
              </p>
              <p className="m-0 leading-relaxed text-[#5c685e]">
                Settings are validated on submit and persisted to <code>public.business_settings</code> and <code>public.business_operations</code> via Supabase Row-Level Security.
              </p>
            </div>
          </div>

          {/* Right Form Panel */}
          <form onSubmit={handleSave} noValidate className="lg:col-span-9 space-y-6">
            {/* TAB 1: BUSINESS PROFILE */}
            {activeTab === "profile" && (
              <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ddcd]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                      <Building2 className="w-5 h-5 text-[#123c2c]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                        Business Profile
                      </h2>
                      <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                        Brand identity and legal registration name.
                      </p>
                    </div>
                  </div>
                  {!canEditCorporate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5]">
                      <Lock className="w-3 h-3" /> Owner Only
                    </span>
                  )}
                </div>

                {/* Brand Visual Asset Card */}
                <div className="p-4 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full border border-[#c7a45b]/50 bg-[#fffefa] p-1.5 shadow-xs grid place-items-center shrink-0">
                    <Image
                      src="/images/bhavatarini-chef-logo.png"
                      alt="Bhavatarini Catering Logo"
                      width={56}
                      height={56}
                      unoptimized
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs font-bold text-[#123c2c]">Official Chef Logo Asset</span>
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#123c2c]/10 text-[#123c2c] text-[10px] font-bold">
                        Verified Asset
                      </span>
                    </div>
                    <p className="text-[11px] text-[#69746a] m-0">
                      High-resolution brand logo displayed in navigation headers and catering documentation.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Brand Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.brandName}
                      onChange={(e) => handleFieldChange("brandName", e.target.value)}
                      placeholder="e.g. Bhavatarini Catering Service"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Primary trading brand name recognized by corporate clients
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Registered Legal Name
                    </label>
                    <input
                      type="text"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.legalName}
                      onChange={(e) => handleFieldChange("legalName", e.target.value)}
                      placeholder="e.g. Bhavatarini Catering Service"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Official commercial registration name for banking and tax compliance
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACT INFORMATION */}
            {activeTab === "contact" && (
              <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ddcd]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                      <Phone className="w-5 h-5 text-[#123c2c]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                        Contact Information
                      </h2>
                      <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                        Booking contact phone numbers, WhatsApp line and official business email.
                      </p>
                    </div>
                  </div>
                  {!canEditCorporate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5]">
                      <Lock className="w-3 h-3" /> Owner Only
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Primary Booking Phone
                    </label>
                    <input
                      type="text"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.primaryPhone}
                      onChange={(e) => handleFieldChange("primaryPhone", e.target.value)}
                      placeholder="e.g. 9842211223"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Main telephone line for catering order discussions
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      WhatsApp Order Desk
                    </label>
                    <input
                      type="text"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.whatsappNumber}
                      onChange={(e) => handleFieldChange("whatsappNumber", e.target.value)}
                      placeholder="e.g. 9842211223"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Active mobile number linked to WhatsApp quick replies
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Official Business Email
                    </label>
                    <input
                      type="email"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.officialEmail}
                      onChange={(e) => handleFieldChange("officialEmail", e.target.value)}
                      placeholder="e.g. contact@bhavatarini.com"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Corporate email address for official quotes and customer correspondence
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TAX & STATUTORY IDENTIFIERS */}
            {activeTab === "tax" && (
              <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ddcd]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#123c2c]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                        Tax &amp; Statutory Identifiers
                      </h2>
                      <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                        Government tax registrations and compliance identifiers.
                      </p>
                    </div>
                  </div>
                  {!canEditCorporate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5]">
                      <Lock className="w-3 h-3" /> Owner Only
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      GSTIN (Goods &amp; Services Tax Identification Number)
                    </label>
                    <input
                      type="text"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.gstin}
                      onChange={(e) => handleFieldChange("gstin", e.target.value.toUpperCase())}
                      placeholder="e.g. 33AAAAA0000A1Z5"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono font-bold focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      15-digit statutory GST registration number for commercial invoices
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      PAN (Permanent Account Number)
                    </label>
                    <input
                      type="text"
                      disabled={!canEditCorporate || isSaving}
                      value={formData.pan}
                      onChange={(e) => handleFieldChange("pan", e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono font-bold focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      10-digit income tax permanent account identifier
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BANK COORDINATES & TERMS */}
            {activeTab === "bank" && (
              <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ddcd]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                      <CreditCard className="w-5 h-5 text-[#123c2c]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                        Bank Details &amp; Payment Terms
                      </h2>
                      <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                        Official corporate bank coordinates for client RTGS/NEFT transfers and standard payment terms.
                      </p>
                    </div>
                  </div>
                  {!canEditCorporate && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5]">
                      <Lock className="w-3 h-3" /> Owner Only
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#123c2c] uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-[#8e7139]" />
                    <span>Commercial Bank Account Coordinates</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#5c685e]">Bank Name</label>
                      <input
                        type="text"
                        disabled={!canEditCorporate || isSaving}
                        value={formData.bankName}
                        onChange={(e) => handleFieldChange("bankName", e.target.value)}
                        placeholder="e.g. State Bank of India"
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#5c685e]">Branch</label>
                      <input
                        type="text"
                        disabled={!canEditCorporate || isSaving}
                        value={formData.bankBranch}
                        onChange={(e) => handleFieldChange("bankBranch", e.target.value)}
                        placeholder="e.g. Coimbatore Main"
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#5c685e]">Beneficiary Name</label>
                      <input
                        type="text"
                        disabled={!canEditCorporate || isSaving}
                        value={formData.accountName}
                        onChange={(e) => handleFieldChange("accountName", e.target.value)}
                        placeholder="e.g. Bhavatarini Catering Service"
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] font-semibold outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#5c685e]">Account Number</label>
                      <input
                        type="text"
                        disabled={!canEditCorporate || isSaving}
                        value={formData.accountNumber}
                        onChange={(e) => handleFieldChange("accountNumber", e.target.value)}
                        placeholder="e.g. 389201004921"
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] font-mono font-bold outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#5c685e]">IFSC Code</label>
                      <input
                        type="text"
                        disabled={!canEditCorporate || isSaving}
                        value={formData.ifscCode}
                        onChange={(e) => handleFieldChange("ifscCode", e.target.value.toUpperCase())}
                        placeholder="e.g. SBIN0001234"
                        className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] font-mono font-bold outline-none disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Standard Invoice Terms &amp; Conditions
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canEditCorporate || isSaving}
                    value={formData.invoiceTerms}
                    onChange={(e) => handleFieldChange("invoiceTerms", e.target.value)}
                    placeholder="e.g. 1. Payment due within 15 days of invoice submission..."
                    className="w-full rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] p-3 text-xs text-[#17271e] leading-relaxed focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                  />
                  <span className="text-[10.5px] text-[#69746a] block">
                    Statutory terms printed on invoices and contract agreements
                  </span>
                </div>
              </div>
            )}

            {/* TAB 5: OPERATIONS PARAMETERS */}
            {activeTab === "operations" && (
              <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#e5ddcd]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                      <Clock className="w-5 h-5 text-[#123c2c]" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                        Operations &amp; Service Parameters
                      </h2>
                      <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                        Daily service schedule, capacity headcount limits, lead times and delivery areas.
                      </p>
                    </div>
                  </div>
                  {isStaff && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#faf7ef] text-[#8e7139] border border-[#dcd0b5]">
                      <Lock className="w-3 h-3" /> Staff View-Only
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Daily Service Start Time
                    </label>
                    <input
                      type="time"
                      disabled={!canEditOperations || isSaving}
                      value={formData.serviceStartTime}
                      onChange={(e) => handleFieldChange("serviceStartTime", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Earliest kitchen dispatch / service delivery window
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Daily Service End Time
                    </label>
                    <input
                      type="time"
                      disabled={!canEditOperations || isSaving}
                      value={formData.serviceEndTime}
                      onChange={(e) => handleFieldChange("serviceEndTime", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Latest scheduled catering shift completion
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Minimum Order Headcount
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEditOperations || isSaving}
                      value={formData.minHeadcount}
                      onChange={(e) => handleFieldChange("minHeadcount", e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Minimum order threshold for booking acceptance
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Maximum Kitchen Capacity Headcount
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEditOperations || isSaving}
                      value={formData.maxHeadcount}
                      onChange={(e) => handleFieldChange("maxHeadcount", e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Maximum daily simultaneous preparation capacity
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Advance Notice Lead Time (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={!canEditOperations || isSaving}
                      value={formData.leadTimeHours}
                      onChange={(e) => handleFieldChange("leadTimeHours", e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Minimum advance notice required before event or service commencement
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Catering Service Coverage Areas
                    </label>
                    <textarea
                      rows={2}
                      disabled={!canEditOperations || isSaving}
                      value={formData.serviceAreas}
                      onChange={(e) => handleFieldChange("serviceAreas", e.target.value)}
                      placeholder="e.g. Coimbatore, Peelamedu, Podanur, Gandhipuram, Chettipalayam"
                      className="w-full rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] p-3 text-xs text-[#17271e] leading-relaxed focus:bg-white focus:border-[#c7a45b] outline-none disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Active industrial zones, localities and regions serviced
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Action Controls */}
            <div className="p-4 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#5c685e]">
                {isStaff
                  ? "Staff accounts have view-only access to business settings."
                  : isAdmin && activeTab !== "operations"
                  ? "Corporate settings require Business Owner credentials to update."
                  : "Changes will be validated and persisted directly to Supabase PostgreSQL."}
              </span>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving || isStaff}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#17271e] bg-white hover:bg-[#faf7ef] border border-[#dcd0b5] rounded-[2px] transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
                  <span>Reset Form</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isStaff || (!canEditCorporate && activeTab !== "operations")}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a533d] border border-[#123c2c] rounded-[2px] transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c7a45b]" />
                      <span>Persisting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
