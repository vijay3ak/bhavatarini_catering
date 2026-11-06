"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Receipt,
  FileText,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Save,
  AlertCircle,
  HelpCircle,
  Info,
  User,
  CreditCard,
  Hash,
  Eye,
  Sliders,
  Calendar,
  DollarSign,
  Clock,
  Bell,
  Sparkles,
  Lock,
} from "lucide-react";

type SettingsTab =
  | "profile"
  | "contact"
  | "address"
  | "billing"
  | "tax"
  | "invoice"
  | "admin";

interface SystemSettingsState {
  // Section A - Business Profile
  businessName: string;
  tagline: string;
  description: string;
  logoUrl: string;

  // Section B - Contact Information
  primaryPhone: string;
  whatsappNumber: string;
  businessEmail: string;
  alternativePhone: string;

  // Section C - Business Address
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Section D - Billing Defaults
  defaultCurrency: string;
  invoicePrefix: string;
  defaultRate: number;
  defaultBillingPeriod: string;
  defaultDeliveryUnit: string;
  defaultPaymentTerms: string;
  invoiceDuePeriodDays: number;
  paymentInstructions: string;
  defaultPreset: "BREAKFAST & DINNER" | "LUNCH";
  sundayBillingPreference: "exclude" | "include";
  defaultInvoiceFooterMessage: string;

  // Section E - Tax Information
  gstin: string;
  pan: string;
  taxDisplayPreference: string;
  taxDeclaration: string;

  // Section F - Invoice Preferences
  invoiceFooterMessage: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  termsConditions: string;
  showContactOnInvoice: boolean;
  showAddressOnInvoice: boolean;

  // Section G - Admin Preferences
  adminDisplayName: string;
  defaultLandingPage: string;
  dateFormat: "DD-MM-YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  currencyDisplayFormat: "inr_lakhs" | "inr_standard";
  dashboardDensity: "comfortable" | "compact";
  showDemoDataIndicator: boolean;
  showRecentActivity: boolean;
  notificationPreference: string;
  emailNotificationPreference: boolean;
}

const INITIAL_SETTINGS: SystemSettingsState = {
  // Section A - Business Profile
  businessName: "Bhavatarini Catering Service",
  tagline: "Traditional Taste, Every Occasion",
  description:
    "Homely, hygienic and reliable traditional South Indian catering for corporate industrial canteens, institutional events, weddings and family gatherings in Coimbatore, Tamil Nadu.",
  logoUrl: "/images/bhavatarini-chef-logo.png",

  // Section B - Contact Information
  primaryPhone: "+91 97894 51699",
  whatsappNumber: "+91 97894 51699",
  businessEmail: "contact@bhavatarini.com",
  alternativePhone: "+91 94433 51699",

  // Section C - Business Address
  addressLine1: "Chettipalayam Road",
  addressLine2: "Near Industrial Estate",
  locality: "Podanur / Chettipalayam",
  city: "Coimbatore",
  state: "Tamil Nadu",
  pincode: "641201",
  country: "India",

  // Section D - Billing Defaults
  defaultCurrency: "INR (₹)",
  invoicePrefix: "BCS/2026-27/",
  defaultRate: 48.0,
  defaultBillingPeriod: "Monthly",
  defaultDeliveryUnit: "CHETTIPALAYAM / FACTORY CANTEEN",
  defaultPaymentTerms: "Net 15 Days",
  invoiceDuePeriodDays: 15,
  paymentInstructions:
    "Direct RTGS/NEFT transfer to company current account or verified UPI remittance with billing reference number.",
  defaultPreset: "BREAKFAST & DINNER",
  sundayBillingPreference: "exclude",
  defaultInvoiceFooterMessage:
    "Thank you for your valued partnership. Meals served with hygiene & traditional taste.",

  // Section E - Tax Information
  gstin: "33AAACH2910B1ZH",
  pan: "AAACH2910B",
  taxDisplayPreference: "Commercial invoice with statutory tax exemption declaration",
  taxDeclaration:
    "We declare that this invoice shows the actual price of the catering services described and that all particulars are true and correct.",

  // Section F - Invoice Preferences
  invoiceFooterMessage:
    "Thank you for your valued partnership. Meals served with hygiene & traditional taste.",
  bankName: "State Bank of India (SBI)",
  bankBranch: "Coimbatore Main Branch",
  accountName: "Bhavatarini Catering Service",
  accountNumber: "389201004921",
  ifscCode: "SBIN0001234",
  termsConditions:
    "1. Payment to be released within 15 days of invoice submission.\n2. Quantity tallies verified against daily supervisor signatures.",
  showContactOnInvoice: true,
  showAddressOnInvoice: true,

  // Section G - Admin Preferences
  adminDisplayName: "Catering Operations Manager",
  defaultLandingPage: "/admin",
  dateFormat: "DD-MM-YYYY",
  currencyDisplayFormat: "inr_lakhs",
  dashboardDensity: "comfortable",
  showDemoDataIndicator: true,
  showRecentActivity: true,
  notificationPreference: "All operational and billing alerts",
  emailNotificationPreference: false,
};

export default function SystemConfigurationPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("billing");
  const [formData, setFormData] = useState<SystemSettingsState>(INITIAL_SETTINGS);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const triggerToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => {
      setToastMessage((c) => (c?.text === text ? null : c));
    }, 4000);
  };

  const handleFieldChange = <K extends keyof SystemSettingsState>(
    field: K,
    value: SystemSettingsState[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_SETTINGS);
    triggerToast("Reset configuration to initial verified business defaults.");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.defaultRate < 0 || isNaN(formData.defaultRate)) {
      triggerToast("Validation error: Default Unit Rate must be 0 or a positive number.", true);
      return;
    }
    if (formData.invoiceDuePeriodDays < 1 || isNaN(formData.invoiceDuePeriodDays)) {
      triggerToast("Validation error: Invoice Due Period must be at least 1 day.", true);
      return;
    }
    if (!formData.invoicePrefix.trim()) {
      triggerToast("Validation error: Invoice Number Prefix cannot be empty.", true);
      return;
    }
    if (!formData.adminDisplayName.trim()) {
      triggerToast("Validation error: Administrator Display Name cannot be empty.", true);
      return;
    }

    triggerToast("Configuration updated for active session (Frontend state only).");
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Business Profile", icon: Building2 },
    { id: "contact", label: "Contact Information", icon: Phone },
    { id: "address", label: "Business Address", icon: MapPin },
    { id: "billing", label: "Billing Defaults", icon: Receipt },
    { id: "tax", label: "Tax Information", icon: ShieldCheck },
    { id: "invoice", label: "Invoice Preferences", icon: FileText },
    { id: "admin", label: "Admin Preferences", icon: User },
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
            System Configuration
          </h1>
          <p className="text-xs md:text-sm text-[#5c685e] mt-1 max-w-2xl leading-relaxed m-0">
            Manage business information, contact details, billing preferences and administrative settings.
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

      {/* Demo Frontend State Disclaimer */}
      <div className="rounded-[2px] border border-[#e5ddcd] bg-[#faf7ef] p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-[#fffefa] border border-[#dcd0b5] text-[#8e7139] grid place-items-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#123c2c] uppercase tracking-wide text-[11px]">
                Demo Session Mode
              </span>
              <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#fbf6e9] text-[#8e7139] border border-[#ddcca6]">
                In-Memory State
              </span>
            </div>
            <p className="text-[#5c685e] mt-1 leading-relaxed m-0">
              Settings modifications are held in temporary frontend state for workflow verification and will not persist across browser refreshes until a permanent backend database is connected.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Container: Left Tabs + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Navigation Pills */}
        <div className="lg:col-span-3 space-y-3">
          <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-2 shadow-xs">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#8e7139]">
              Configuration Modules
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[2px] text-xs font-semibold transition-all text-left cursor-pointer ${
                      active
                        ? "bg-[#123c2c] text-[#faf8f1] shadow-xs"
                        : "text-[#5c685e] hover:bg-[#faf7ef] hover:text-[#17271e]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-[#c7a45b]" : "text-[#8e7139]"
                      }`}
                    />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-[#faf7ef] border border-[#e5ddcd] rounded-[2px] text-[11px] text-[#69746a] space-y-1.5 hidden lg:block">
            <p className="font-semibold text-[#17271e] m-0 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8e7139]" />
              <span>Contract Data Integrity</span>
            </p>
            <p className="m-0 leading-relaxed text-[#5c685e]">
              Global billing defaults provide baseline values when setting up new client profiles. Verified customer contract rates (e.g. HYDAC @ ₹48, LMW @ ₹52) are never modified by changes made here.
            </p>
          </div>
        </div>

        {/* Right Content Panel */}
        <form onSubmit={handleSave} className="lg:col-span-9 space-y-6">
          {/* SECTION A: BUSINESS PROFILE */}
          {activeTab === "profile" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <Building2 className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Business Profile
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Primary business identity, corporate name, tagline and brand visual asset.
                  </p>
                </div>
              </div>

              {/* Logo Preview Row */}
              <div className="p-4 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-16 h-16 rounded-full border border-[#c7a45b]/50 bg-[#fffefa] p-1.5 shadow-xs grid place-items-center shrink-0">
                  <Image
                    src={formData.logoUrl}
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
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#69746a] m-0">
                    High-resolution brand logo displayed in navigation headers, receipts and printed customer invoices.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleFieldChange("businessName", e.target.value)}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleFieldChange("tagline", e.target.value)}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Company Overview &amp; Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="w-full rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] p-3 text-xs text-[#17271e] leading-relaxed focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION B: CONTACT INFORMATION */}
          {activeTab === "contact" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <Phone className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Contact Information
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Operational inquiry phone numbers, WhatsApp order line and official catering email.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Primary Booking Phone
                  </label>
                  <input
                    type="text"
                    value={formData.primaryPhone}
                    onChange={(e) => handleFieldChange("primaryPhone", e.target.value)}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    WhatsApp Orders Line
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleFieldChange("whatsappNumber", e.target.value)}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Official Catering Email
                  </label>
                  <input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleFieldChange("businessEmail", e.target.value)}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">
                    Alternate Operations Desk
                  </label>
                  <input
                    type="text"
                    value={formData.alternativePhone}
                    onChange={(e) => handleFieldChange("alternativePhone", e.target.value)}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION C: BUSINESS ADDRESS */}
          {activeTab === "address" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <MapPin className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Business Address &amp; Commercial Kitchen
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Registered office and preparation hub located in Coimbatore, Tamil Nadu.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Address Line 1 (Street)
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => handleFieldChange("addressLine1", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">
                      Address Line 2 (Landmark)
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => handleFieldChange("addressLine2", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">Area / Locality</label>
                    <input
                      type="text"
                      value={formData.locality}
                      onChange={(e) => handleFieldChange("locality", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleFieldChange("city", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleFieldChange("state", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17271e]">PIN Code</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleFieldChange("pincode", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono focus:bg-white focus:border-[#c7a45b] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION D: BILLING DEFAULTS (ENHANCED) */}
          {activeTab === "billing" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <Receipt className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Billing Defaults
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Standard baseline parameters for monthly industrial catering invoices, currency and meal configuration.
                  </p>
                </div>
              </div>

              {/* Data Integrity Callout Banner */}
              <div className="p-3.5 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-start gap-3 text-xs">
                <Info className="w-4 h-4 text-[#8e7139] shrink-0 mt-0.5" />
                <div className="space-y-1 text-[#5c685e]">
                  <p className="font-bold text-[#123c2c] m-0">
                    Global Defaults vs. Contractual Client Rates
                  </p>
                  <p className="m-0 leading-relaxed">
                    Values configured here serve as pre-filled suggestions when initializing new client profiles. Modifying default rates will <strong>never overwrite</strong> customer-specific contract rates (e.g. HYDAC @ ₹48, LMW @ ₹52) or historical billing archives.
                  </p>
                </div>
              </div>

              {/* Group 1: General Billing */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#f0e9dc]">
                  <Hash className="w-3.5 h-3.5 text-[#8e7139]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c2c] m-0">
                    General Billing
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Default Currency */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Currency
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.defaultCurrency}
                        disabled
                        aria-label="Default Currency"
                        className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#f0ede4] px-3 text-xs text-[#5c685e] font-mono font-semibold outline-none cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-[#8e7139] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Fixed to Indian Rupee (INR ₹)
                    </span>
                  </div>

                  {/* Invoice Number Prefix */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Invoice Number Prefix <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.invoicePrefix}
                      onChange={(e) => handleFieldChange("invoicePrefix", e.target.value)}
                      placeholder="e.g. BCS/2026-27/"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Sequence prefix prepended to bill numbers
                    </span>
                  </div>

                  {/* Default Unit Rate */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Unit Rate (₹) <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8e7139]">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.defaultRate}
                        onChange={(e) => handleFieldChange("defaultRate", parseFloat(e.target.value) || 0)}
                        className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] pl-7 pr-3 text-xs text-[#17271e] font-bold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Baseline proposal rate for new clients
                    </span>
                  </div>

                  {/* Default Billing Period */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Billing Period
                    </label>
                    <select
                      value={formData.defaultBillingPeriod}
                      onChange={(e) => handleFieldChange("defaultBillingPeriod", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="Monthly">Monthly (1st to 30th/31st)</option>
                      <option value="Bi-Weekly">Bi-Weekly (15 days cycle)</option>
                      <option value="Weekly">Weekly (Monday to Sunday)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Standard industrial billing cadence
                    </span>
                  </div>

                  {/* Default Delivery Unit / Plant */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Delivery Unit / Plant
                    </label>
                    <input
                      type="text"
                      value={formData.defaultDeliveryUnit}
                      onChange={(e) => handleFieldChange("defaultDeliveryUnit", e.target.value)}
                      placeholder="e.g. CHETTIPALAYAM / FACTORY CANTEEN"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] uppercase font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Primary catering delivery hub or plant designation
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 2: Payment Preferences */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#f0e9dc]">
                  <CreditCard className="w-3.5 h-3.5 text-[#8e7139]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c2c] m-0">
                    Payment Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Default Payment Terms */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Payment Terms
                    </label>
                    <select
                      value={formData.defaultPaymentTerms}
                      onChange={(e) => handleFieldChange("defaultPaymentTerms", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="Net 15 Days">Net 15 Days (Standard corporate term)</option>
                      <option value="Net 30 Days">Net 30 Days (Extended industrial term)</option>
                      <option value="Net 7 Days">Net 7 Days (Short-cycle term)</option>
                      <option value="Due upon receipt">Due Upon Receipt (Functions & Events)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Agreed credit window stated on tax bills
                    </span>
                  </div>

                  {/* Invoice Due Period */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Invoice Due Period (Days) <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={formData.invoiceDuePeriodDays}
                        onChange={(e) =>
                          handleFieldChange("invoiceDuePeriodDays", parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-bold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none font-mono"
                      />
                      <Clock className="w-3.5 h-3.5 text-[#8e7139] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Days added to invoice date to calculate payment due date
                    </span>
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Payment Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={formData.paymentInstructions}
                      onChange={(e) => handleFieldChange("paymentInstructions", e.target.value)}
                      placeholder="e.g. Direct RTGS/NEFT transfer to current account..."
                      className="w-full rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] p-3 text-xs text-[#17271e] leading-relaxed focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Printed on customer invoice footer for accounts payable departments
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 3: Meal Configuration */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#f0e9dc]">
                  <UtensilsIcon className="w-3.5 h-3.5 text-[#8e7139]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c2c] m-0">
                    Meal Configuration
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Default Meal Preset */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Meal Preset
                    </label>
                    <select
                      value={formData.defaultPreset}
                      onChange={(e) =>
                        handleFieldChange("defaultPreset", e.target.value as "BREAKFAST & DINNER" | "LUNCH")
                      }
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="BREAKFAST & DINNER">Breakfast &amp; Dinner (Shift 1 &amp; Shift 2)</option>
                      <option value="LUNCH">Lunch Full Meals (Single Shift)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Pre-selected shift presets when drafting daily meal counts
                    </span>
                  </div>

                  {/* Sunday Billing Preference */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Sunday Billing Preference
                    </label>
                    <select
                      value={formData.sundayBillingPreference}
                      onChange={(e) =>
                        handleFieldChange(
                          "sundayBillingPreference",
                          e.target.value as "exclude" | "include"
                        )
                      }
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="exclude">
                        Exclude Sundays (Standard weekly off – 0 billable qty)
                      </option>
                      <option value="include">
                        Include Sundays (Continuous industrial operations)
                      </option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Determines whether Sunday quantities tally into billable meal totals
                    </span>
                  </div>

                  {/* Default Invoice Footer Message */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Default Invoice Footer Message
                    </label>
                    <input
                      type="text"
                      value={formData.defaultInvoiceFooterMessage}
                      onChange={(e) => handleFieldChange("defaultInvoiceFooterMessage", e.target.value)}
                      placeholder="e.g. Thank you for your valued partnership..."
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Standard closing greeting rendered at the bottom of all generated customer invoices
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION E: TAX INFORMATION */}
          {activeTab === "tax" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Tax Information
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Commercial tax identifiers and statutory invoice declarations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">GSTIN</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => handleFieldChange("gstin", e.target.value.toUpperCase())}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono font-bold focus:bg-white focus:border-[#c7a45b] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17271e]">PAN</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => handleFieldChange("pan", e.target.value.toUpperCase())}
                    className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-mono font-bold focus:bg-white focus:border-[#c7a45b] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17271e]">
                  Tax Display Preference
                </label>
                <input
                  type="text"
                  value={formData.taxDisplayPreference}
                  onChange={(e) => handleFieldChange("taxDisplayPreference", e.target.value)}
                  className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17271e]">
                  Statutory Tax Declaration Statement
                </label>
                <textarea
                  rows={2}
                  value={formData.taxDeclaration}
                  onChange={(e) => handleFieldChange("taxDeclaration", e.target.value)}
                  className="w-full rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] p-3 text-xs text-[#17271e] leading-relaxed focus:bg-white focus:border-[#c7a45b] outline-none"
                />
              </div>
            </div>
          )}

          {/* SECTION F: INVOICE PREFERENCES */}
          {activeTab === "invoice" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <FileText className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Invoice Preferences &amp; Bank Details
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Bank transfer coordinates, invoice footer message, payment terms and layout toggles.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17271e]">
                  Invoice Footer Greeting Message
                </label>
                <input
                  type="text"
                  value={formData.invoiceFooterMessage}
                  onChange={(e) => handleFieldChange("invoiceFooterMessage", e.target.value)}
                  className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] focus:bg-white focus:border-[#c7a45b] outline-none"
                />
              </div>

              {/* Bank Details Sub-card */}
              <div className="p-4 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#123c2c] uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-[#8e7139]" />
                  <span>Corporate Bank Transfer Coordinates</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5c685e]">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => handleFieldChange("bankName", e.target.value)}
                      className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5c685e]">Branch</label>
                    <input
                      type="text"
                      value={formData.bankBranch}
                      onChange={(e) => handleFieldChange("bankBranch", e.target.value)}
                      className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5c685e]">Account Name</label>
                    <input
                      type="text"
                      value={formData.accountName}
                      onChange={(e) => handleFieldChange("accountName", e.target.value)}
                      className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] font-semibold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5c685e]">Account Number</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => handleFieldChange("accountNumber", e.target.value)}
                      className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] font-mono font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-[#5c685e]">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => handleFieldChange("ifscCode", e.target.value.toUpperCase())}
                      className="w-full h-8 rounded-[2px] border border-[#dcd0b5] bg-white px-2.5 text-xs text-[#17271e] font-mono font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17271e]">
                  Payment Terms &amp; Conditions
                </label>
                <textarea
                  rows={2}
                  value={formData.termsConditions}
                  onChange={(e) => handleFieldChange("termsConditions", e.target.value)}
                  className="w-full rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] p-3 text-xs text-[#17271e] leading-relaxed focus:bg-white focus:border-[#c7a45b] outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[#f0e9dc]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#17271e]">
                  <input
                    type="checkbox"
                    checked={formData.showContactOnInvoice}
                    onChange={(e) => handleFieldChange("showContactOnInvoice", e.target.checked)}
                    className="w-4 h-4 text-[#123c2c] rounded border-[#dcd0b5] focus:ring-[#c7a45b]"
                  />
                  <span>Show Business Contact Details on Invoice Header</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#17271e]">
                  <input
                    type="checkbox"
                    checked={formData.showAddressOnInvoice}
                    onChange={(e) => handleFieldChange("showAddressOnInvoice", e.target.checked)}
                    className="w-4 h-4 text-[#123c2c] rounded border-[#dcd0b5] focus:ring-[#c7a45b]"
                  />
                  <span>Show Kitchen Address on Invoice Footer</span>
                </label>
              </div>
            </div>
          )}

          {/* SECTION G: ADMIN PREFERENCES (ENHANCED) */}
          {activeTab === "admin" && (
            <div className="rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-5 md:p-6 shadow-xs space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5ddcd]">
                <div className="w-10 h-10 rounded-[2px] bg-[#faf7ef] border border-[#dcd0b5] flex items-center justify-center text-[#123c2c] shrink-0">
                  <User className="w-5 h-5 text-[#123c2c]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#123c2c] m-0">
                    Admin Preferences
                  </h2>
                  <p className="text-xs text-[#5c685e] mt-0.5 m-0">
                    Administrator profile, display formats, dashboard density and application preferences.
                  </p>
                </div>
              </div>

              {/* Group 1: Administrator Profile */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#f0e9dc]">
                  <User className="w-3.5 h-3.5 text-[#8e7139]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c2c] m-0">
                    Administrator Profile
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Admin Display Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Admin Display Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.adminDisplayName}
                      onChange={(e) => handleFieldChange("adminDisplayName", e.target.value)}
                      placeholder="e.g. Catering Operations Manager"
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
                    />
                    <span className="text-[10.5px] text-[#69746a] block">
                      Name rendered in header profile greetings and audit log records
                    </span>
                  </div>

                  {/* Dashboard Landing Page */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Dashboard Landing Page
                    </label>
                    <select
                      value={formData.defaultLandingPage}
                      onChange={(e) => handleFieldChange("defaultLandingPage", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-semibold focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="/admin">Operations Overview (/admin)</option>
                      <option value="/admin/enquiries">Customer Enquiries (/admin/enquiries)</option>
                      <option value="/admin/customers">Corporate Customers (/admin/customers)</option>
                      <option value="/admin/billing">Monthly Catering Billing (/admin/billing)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Initial landing module opened upon accessing the administration console
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 2: Display Preferences */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#f0e9dc]">
                  <Sliders className="w-3.5 h-3.5 text-[#8e7139]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c2c] m-0">
                    Display Preferences
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date Format */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Date Format
                    </label>
                    <select
                      value={formData.dateFormat}
                      onChange={(e) =>
                        handleFieldChange(
                          "dateFormat",
                          e.target.value as "DD-MM-YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
                        )
                      }
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="DD-MM-YYYY">DD-MM-YYYY (07-11-2026)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (07/11/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-11-07)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Calendar and table timestamp presentation
                    </span>
                  </div>

                  {/* Currency Display Format */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Currency Display Format
                    </label>
                    <select
                      value={formData.currencyDisplayFormat}
                      onChange={(e) =>
                        handleFieldChange(
                          "currencyDisplayFormat",
                          e.target.value as "inr_lakhs" | "inr_standard"
                        )
                      }
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="inr_lakhs">₹ 1,23,456.00 (Indian Lakhs)</option>
                      <option value="inr_standard">₹ 123,456.00 (Standard Decimal)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Rupee amount formatting across billing cards
                    </span>
                  </div>

                  {/* Dashboard Density */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Dashboard Density
                    </label>
                    <select
                      value={formData.dashboardDensity}
                      onChange={(e) =>
                        handleFieldChange(
                          "dashboardDensity",
                          e.target.value as "comfortable" | "compact"
                        )
                      }
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="comfortable">Comfortable (Standard)</option>
                      <option value="compact">Compact (Condensed table rows)</option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      Padding and vertical rhythm for admin tables
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 3: Application Preferences */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#f0e9dc]">
                  <Bell className="w-3.5 h-3.5 text-[#8e7139]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c2c] m-0">
                    Application Preferences
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Toggle 1: Show Demo Data Indicator */}
                  <div className="p-3.5 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#17271e]">
                          Show Demo Data Indicator
                        </span>
                        <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#ffffff] text-[#8e7139] border border-[#dcd0b5]">
                          UI Element
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5c685e] m-0 leading-relaxed">
                        Display the informative &ldquo;Sample Data&rdquo; notification banner and prototype disclaimer badges across dashboard pages.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.showDemoDataIndicator}
                      onClick={() =>
                        handleFieldChange(
                          "showDemoDataIndicator",
                          !formData.showDemoDataIndicator
                        )
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c7a45b] focus:ring-offset-1 ${
                        formData.showDemoDataIndicator ? "bg-[#123c2c]" : "bg-[#dcd0b5]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formData.showDemoDataIndicator ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Show Recent Activity Feed */}
                  <div className="p-3.5 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#17271e]">
                          Show Recent Activity Timeline
                        </span>
                        <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#ffffff] text-[#8e7139] border border-[#dcd0b5]">
                          Overview Feed
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5c685e] m-0 leading-relaxed">
                        Render the live operational log and status transitions sidebar on the Operations Overview landing page.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.showRecentActivity}
                      onClick={() =>
                        handleFieldChange("showRecentActivity", !formData.showRecentActivity)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c7a45b] focus:ring-offset-1 ${
                        formData.showRecentActivity ? "bg-[#123c2c]" : "bg-[#dcd0b5]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formData.showRecentActivity ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Notification Preferences Dropdown */}
                  <div className="p-3.5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1.5">
                    <label className="block text-xs font-semibold text-[#17271e]">
                      Notification Preferences
                    </label>
                    <select
                      value={formData.notificationPreference}
                      onChange={(e) => handleFieldChange("notificationPreference", e.target.value)}
                      className="w-full h-9 rounded-[2px] border border-[#dcd0b5] bg-[#faf8f1] px-3 text-xs text-[#17271e] font-medium focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none cursor-pointer"
                    >
                      <option value="All operational and billing alerts">
                        All operational and billing alerts (Recommended)
                      </option>
                      <option value="New customer enquiries and contract changes only">
                        New customer enquiries and contract changes only
                      </option>
                      <option value="Muted / Minimal alerts">
                        Muted / Minimal administrative alerts
                      </option>
                    </select>
                    <span className="text-[10.5px] text-[#69746a] block">
                      In-app notification badge frequency for lead coordination and ledger reconciliations
                    </span>
                  </div>

                  {/* Toggle 3: Email Notification Preference (Future Integration Only) */}
                  <div className="p-3.5 rounded-[2px] bg-[#faf7ef] border border-[#e5ddcd] flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#17271e]">
                          Email Notification Dispatch
                        </span>
                        <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-[#fbf6e9] text-[#8e7139] border border-[#ddcca6]">
                          Future Integration Only
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5c685e] m-0 leading-relaxed">
                        Placeholder setting for planned SMTP / transactional email notifications. No live external email service is connected during demo evaluation mode.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.emailNotificationPreference}
                      onClick={() =>
                        handleFieldChange(
                          "emailNotificationPreference",
                          !formData.emailNotificationPreference
                        )
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c7a45b] focus:ring-offset-1 ${
                        formData.emailNotificationPreference ? "bg-[#123c2c]" : "bg-[#dcd0b5]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formData.emailNotificationPreference
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="p-4 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-[#5c685e]">
              Changes apply to temporary frontend session state. Resetting will restore default presets.
            </span>
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#17271e] bg-white hover:bg-[#faf7ef] border border-[#dcd0b5] rounded-[2px] transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a533d] border border-[#123c2c] rounded-[2px] transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function UtensilsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 2v14a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2" />
      <path d="M21 15a4 4 0 0 1-4 4h-2" />
    </svg>
  );
}
