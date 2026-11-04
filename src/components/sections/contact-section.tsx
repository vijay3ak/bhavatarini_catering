"use client";

import React, { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/lib/config/site";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  MapPin,
  Phone,
} from "lucide-react";

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  kind: string;
  kindOther: string;
  food: string;
  foodOther: string;
  qty: string;
  eventDate: string;
  location: string;
  details: string;
}

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phone: "",
    email: "",
    kind: "Corporate office",
    kindOther: "",
    food: "Full meals",
    foodOther: "",
    qty: "",
    eventDate: "",
    location: "",
    details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devStatusModal, setDevStatusModal] = useState<{
    open: boolean;
    data?: ContactFormData;
  }>({ open: false });

  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const closeModal = () => {
    setDevStatusModal({ open: false });
    submitBtnRef.current?.focus();
  };

  useEffect(() => {
    if (!devStatusModal.open) return;

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        closeModal();
      } else if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [devStatusModal.open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      newErrors.phone = "Please enter your 10-digit mobile number.";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone =
        "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address or leave blank.";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Please enter your location or event area in Coimbatore.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Show clear development verification message without fake API claims
    setDevStatusModal({ open: true, data: { ...formData } });
  };

  const buildWhatsAppPreviewUrl = () => {
    const v = formData;
    const requirementDisplay =
      v.kind === "Others" && v.kindOther.trim()
        ? `Others (${v.kindOther.trim()})`
        : v.kind;

    const foodDisplay =
      v.food === "Others" && v.foodOther.trim()
        ? `Others (${v.foodOther.trim()})`
        : v.food;

    const lines = [
      "Hello Bhavatarini Catering Service! I would like to enquire about catering.",
      `Name: ${v.name}`,
      `Mobile: ${v.phone}`,
      v.email ? `Email: ${v.email}` : null,
      `Location / Area: ${v.location}`,
      `Requirement: ${requirementDisplay}`,
      `Food Preference: ${foodDisplay}`,
      v.qty ? `Quantity: ${v.qty}` : null,
      v.eventDate ? `Event Date: ${v.eventDate}` : null,
      v.details ? `Additional Details: ${v.details}` : null,
    ].filter(Boolean);

    const msg = lines.join("\n");
    const destinationNumber = "919944458459";
    return `https://wa.me/${destinationNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section id="contact" className="py-24 max-sm:py-14 bg-[#faf8f1]">
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        {/* 1. TOP SECTION: Centered Section Head Restored to Original Position */}
        <div className="section-head text-center max-w-xl mx-auto mb-14 max-sm:mb-9">
          <span className="section-kicker block text-[9px] tracking-[2.6px] font-bold text-[#a18448] uppercase mb-3.5">
            05 / GET IN TOUCH
          </span>
          <h2 className="font-serif text-[clamp(34px,4vw,48px)] max-sm:text-3xl leading-[1.1] tracking-[-0.8px] text-brand-green font-semibold m-0">
            Let’s Plan Your Catering
          </h2>
          <p className="text-[15px] max-sm:text-[13px] leading-[1.8] text-brand-muted mt-3 mb-0">
            Share a few details and we&apos;ll get back to you with custom catering arrangements.
          </p>
          <div
            aria-hidden="true"
            className="w-[42px] h-[1px] bg-[#c7a45b] mx-auto mt-[23px]"
          />
        </div>

        {/* 2. CENTERED SINGLE-COLUMN ENQUIRY FORM */}
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="p-8 sm:p-10 max-sm:p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_16px_40px_rgba(24,52,35,0.06)] relative"
          >
            {/* Top Gold Accent Line */}
            <div
              aria-hidden="true"
              className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#a98642] via-[#e3d19c] to-[#a98642]"
            />

            <div className="mb-6 pb-4 border-b border-[#e5ddcd]">
              <h3 className="font-serif text-2xl max-sm:text-xl font-bold text-brand-green m-0">
                Catering Enquiry
              </h3>
              <p className="text-[13px] text-brand-muted mt-1.5 m-0">
                Please complete the details below. We review every requirement carefully before proposing menu options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-sm:gap-4 items-start">
              {/* Field 1: Name (Required) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Your name <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Sundararajan"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full h-[42px] bg-[#faf7ef] border ${
                    errors.name ? "border-red-500" : "border-[#dcd3bf]"
                  } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
                />
                {errors.name && (
                  <span
                    id="name-error"
                    className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Field 2: Mobile Number (Required, Digits-only with Numeric Keypad) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Mobile number <span className="text-red-600">*</span>
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#8b958b] select-none pointer-events-none">
                    +91
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      if (digits.length <= 10) {
                        setFormData({ ...formData, phone: digits });
                      }
                    }}
                    placeholder="9876543210"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className={`w-full h-[42px] bg-[#faf7ef] border ${
                      errors.phone ? "border-red-500" : "border-[#dcd3bf]"
                    } pl-11 pr-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
                  />
                </div>
                {errors.phone && (
                  <span
                    id="phone-error"
                    className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Field 3: Email (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Email address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g., yourname@domain.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full h-[42px] bg-[#faf7ef] border ${
                    errors.email ? "border-red-500" : "border-[#dcd3bf]"
                  } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
                />
                {errors.email && (
                  <span
                    id="email-error"
                    className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Field 4: Location / Area (Required) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="location"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Location / Area in Coimbatore <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Gandhipuram, RS Puram, Peelamedu"
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? "location-error" : undefined}
                  className={`w-full h-[42px] bg-[#faf7ef] border ${
                    errors.location ? "border-red-500" : "border-[#dcd3bf]"
                  } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
                />
                {errors.location && (
                  <span
                    id="location-error"
                    className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.location}
                  </span>
                )}
              </div>

              {/* Field 5: Requirement Type (Required + Others conditional input) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="kind"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Requirement type <span className="text-red-600">*</span>
                  </span>
                </label>
                <select
                  id="kind"
                  name="kind"
                  value={formData.kind}
                  onChange={(e) => {
                    const newKind = e.target.value;
                    setFormData({
                      ...formData,
                      kind: newKind,
                      kindOther: newKind === "Others" ? formData.kindOther : "",
                    });
                  }}
                  className="w-full h-[42px] bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 cursor-pointer"
                >
                  <option value="Corporate office">Corporate office</option>
                  <option value="Startup / team">Startup / team</option>
                  <option value="Small function">Small function</option>
                  <option value="Group gathering">Group gathering</option>
                  <option value="Others">Others</option>
                </select>

                {/* Conditional Text Input when Requirement Type is "Others" */}
                {formData.kind === "Others" && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label
                      htmlFor="kindOther"
                      className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                    >
                      <span>
                        Please specify your requirement <span className="text-gray-400 font-normal lowercase">(optional)</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="kindOther"
                      name="kindOther"
                      value={formData.kindOther}
                      onChange={(e) =>
                        setFormData({ ...formData, kindOther: e.target.value })
                      }
                      placeholder="e.g., Annual conference, cultural fest, daily executive dinner"
                      className="w-full h-[42px] bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
                    />
                  </div>
                )}
              </div>

              {/* Field 6: Food Preference (Required + Others conditional input) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="food"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Food preference <span className="text-red-600">*</span>
                  </span>
                </label>
                <select
                  id="food"
                  name="food"
                  value={formData.food}
                  onChange={(e) => {
                    const newFood = e.target.value;
                    setFormData({
                      ...formData,
                      food: newFood,
                      foodOther: newFood === "Others" ? formData.foodOther : "",
                    });
                  }}
                  className="w-full h-[42px] bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 cursor-pointer"
                >
                  <option value="Full meals">Full meals</option>
                  <option value="Customised tiffin">Customised tiffin</option>
                  <option value="Both meals and tiffin">Both meals and tiffin</option>
                  <option value="Others">Others</option>
                </select>

                {/* Conditional Text Input when Food Preference is "Others" */}
                {formData.food === "Others" && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label
                      htmlFor="foodOther"
                      className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                    >
                      <span>
                        Please specify your food preference <span className="text-gray-400 font-normal lowercase">(optional)</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      id="foodOther"
                      name="foodOther"
                      value={formData.foodOther}
                      onChange={(e) =>
                        setFormData({ ...formData, foodOther: e.target.value })
                      }
                      placeholder="e.g., Specific sweet & savory combination, South Indian breakfast spread"
                      className="w-full h-[42px] bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
                    />
                  </div>
                )}
              </div>

              {/* Field 7: Quantity (Optional, Editable Text Input) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="qty"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Quantity <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="qty"
                  name="qty"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({ ...formData, qty: e.target.value })
                  }
                  placeholder="e.g., 75 persons, 120 meals"
                  className="w-full h-[42px] bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
                />
              </div>

              {/* Field 8: Event / Date (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="eventDate"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider sm:min-h-[32px] flex items-end pb-1"
                >
                  <span>
                    Event date <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </span>
                </label>
                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  className="w-full h-[42px] bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
                />
              </div>

              {/* Field 9: Additional Requirements (Optional, Textarea) */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label
                  htmlFor="details"
                  className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
                >
                  Additional requirements <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={3}
                  placeholder="Specific dishes, meal timings, delivery notes, or special requests"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all placeholder:text-[#a0a89f] focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 resize-y"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="mt-8 pt-4 border-t border-[#e5ddcd] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-brand-muted m-0 text-center sm:text-left">
                Direct coordinator review · Clear proposal · No obligations
              </p>

              <button
                ref={submitBtnRef}
                type="submit"
                className="w-full sm:w-auto h-[48px] px-8 py-3 rounded-[2px] text-[13px] font-bold tracking-[0.5px] uppercase text-[#15261d] border border-[#e5d19a] shadow-md transition-all duration-300 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer inline-flex items-center justify-center relative overflow-hidden group/btn"
                style={{
                  background: "linear-gradient(135deg, #d4ba78, #b89347)",
                }}
              >
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  Submit Enquiry
                  <span className="inline-block transition-transform duration-200 group-hover/btn:translate-x-1">
                    →
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
                />
              </button>
            </div>
          </form>
        </div>

        {/* 3. CENTERED BRAND DESCRIPTION (IMMEDIATELY BELOW THE FORM) */}
        <div className="mt-14 max-sm:mt-10 text-center max-w-2xl mx-auto px-4">
          <h3 className="font-serif text-[clamp(24px,3vw,32px)] max-sm:text-xl leading-[1.25] text-brand-green font-semibold m-0 mb-3">
            Made for teams, gatherings and good food.
          </h3>
          <p className="text-[15px] max-sm:text-[13.5px] leading-[1.8] text-[#556357] m-0">
            Whether you need regular corporate lunches, team breakfast platters, or catering for a family function, we coordinate every detail carefully. Share a few details and we&apos;ll get back to you with custom catering arrangements.
          </p>
        </div>

        {/* 4. THREE CONTACT DETAILS IN ONE HORIZONTAL ROW (BELOW THE DESCRIPTION) */}
        <div className="mt-10 max-sm:mt-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Location Card */}
            <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_4px_16px_rgba(24,52,35,0.03)] flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#c7a45b]/60 hover:shadow-md cursor-default">
              <div className="w-11 h-11 rounded-full bg-[#f4eee1] grid place-items-center shrink-0 text-[#8e7139]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider mb-0.5">
                  Location
                </span>
                <span className="text-[13.5px] font-medium text-[#17271e]">
                  {siteConfig.location}
                </span>
              </div>
            </div>

            {/* Direct Phone Card (Number: 9944458459, Clickable tel:9944458459) */}
            <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_4px_16px_rgba(24,52,35,0.03)] flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#c7a45b]/60 hover:shadow-md cursor-default">
              <div className="w-11 h-11 rounded-full bg-[#f4eee1] grid place-items-center shrink-0 text-[#8e7139]">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider mb-0.5">
                  Direct Phone
                </span>
                <a
                  href="tel:9944458459"
                  className="text-[13.5px] font-medium text-brand-green hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold rounded-sm"
                >
                  +91 99444 58459
                </a>
              </div>
            </div>

            {/* WhatsApp Card (Number: 9944458459, Clickable https://wa.me/919944458459) */}
            <div className="p-5 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_4px_16px_rgba(24,52,35,0.03)] flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#c7a45b]/60 hover:shadow-md cursor-default">
              <div className="w-11 h-11 rounded-full bg-[#f4eee1] grid place-items-center shrink-0 text-[#128c7e]">
                {/* Authentic WhatsApp Brand SVG Icon */}
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-[#8e7139] uppercase tracking-wider mb-0.5">
                  WhatsApp
                </span>
                <a
                  href="https://wa.me/919944458459"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13.5px] font-medium text-brand-green hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold rounded-sm"
                >
                  +91 99444 58459
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2 Development Verification Modal */}
      {devStatusModal.open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dev-modal-title"
            className="bg-[#fffefa] border border-[#e5ddcd] rounded-[2px] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 id="dev-modal-title" className="font-serif text-lg font-bold">
                Frontend Validation Passed
              </h4>
            </div>

            <div className="bg-brand-cream p-4 rounded text-xs space-y-2 border border-brand-line font-sans">
              <p className="font-semibold text-brand-green">
                Captured Enquiry Payload:
              </p>
              <ul className="space-y-1 text-brand-muted">
                <li><strong>Name:</strong> {devStatusModal.data?.name}</li>
                <li><strong>Mobile:</strong> {devStatusModal.data?.phone}</li>
                <li><strong>Email:</strong> {devStatusModal.data?.email || "Not specified"}</li>
                <li><strong>Location / Area:</strong> {devStatusModal.data?.location}</li>
                <li>
                  <strong>Requirement:</strong>{" "}
                  {devStatusModal.data?.kind === "Others" && devStatusModal.data?.kindOther
                    ? `Others (${devStatusModal.data.kindOther})`
                    : devStatusModal.data?.kind}
                </li>
                <li>
                  <strong>Food:</strong>{" "}
                  {devStatusModal.data?.food === "Others" && devStatusModal.data?.foodOther
                    ? `Others (${devStatusModal.data.foodOther})`
                    : devStatusModal.data?.food}
                </li>
                <li><strong>Quantity:</strong> {devStatusModal.data?.qty || "Not specified"}</li>
                <li><strong>Event Date:</strong> {devStatusModal.data?.eventDate || "Not specified"}</li>
                <li><strong>Additional Requirements:</strong> {devStatusModal.data?.details || "Not specified"}</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-3 rounded border border-amber-200">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Phase 2 Status:</strong> Form validation is verified. In Phase 3, this will execute a server action to securely store the record in Supabase PostgreSQL and send email notifications via Resend.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href={buildWhatsAppPreviewUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[2px] text-brand-green bg-[#eee7d7] hover:bg-[#e4dac4] transition-colors"
              >
                <span>Test WhatsApp Handoff</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold rounded-[2px] text-white bg-brand-green hover:bg-brand-green2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
