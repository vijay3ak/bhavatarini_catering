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
  MessageSquare,
} from "lucide-react";

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  kind: string;
  food: string;
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
    food: "Full meals",
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

    // Phase 2: Show clear development verification message
    // Never claim fake database persistence or simulate false success
    setDevStatusModal({ open: true, data: { ...formData } });
  };

  const buildWhatsAppPreviewUrl = () => {
    const v = formData;
    const lines = [
      "Hello Bhavatarini Catering Service! I would like to enquire about catering.",
      `Name: ${v.name}`,
      `Mobile: ${v.phone}`,
      v.email ? `Email: ${v.email}` : null,
      `Location / Area: ${v.location}`,
      `Requirement: ${v.kind}`,
      `Food Preference: ${v.food}`,
      v.qty ? `Approx. Quantity: ${v.qty}` : null,
      v.eventDate ? `Event Date: ${v.eventDate}` : null,
      v.details ? `Additional Details: ${v.details}` : null,
    ].filter(Boolean);

    const msg = lines.join("\n");
    const destinationNumber = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");
    return destinationNumber
      ? `https://wa.me/${destinationNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section
      id="contact"
      className="py-24 max-sm:py-14"
      style={{
        background: "linear-gradient(180deg, #f1ecdf 0%, #f8f5ec 100%)",
      }}
    >
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        {/* Section Head */}
        <div className="section-head text-center max-w-xl mx-auto mb-14 max-sm:mb-9">
          <span className="section-kicker block text-[9px] tracking-[2.6px] font-bold text-[#a18448] uppercase mb-3.5">
            05 / LET’S TALK
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

        {/* Form Container (Top Visual Priority) */}
        <div className="max-w-3xl mx-auto">
          <form
            id="enquiry"
            onSubmit={handleSubmit}
            noValidate
            className="form bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] rounded-[2px] p-9 max-sm:p-6 shadow-[0_20px_55px_rgba(31,47,34,0.07)] grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {/* Field 1: Name (Required) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Your name <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`w-full bg-[#faf7ef] border ${
                  errors.name ? "border-red-500" : "border-[#dcd3bf]"
                } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
              />
              {errors.name && (
                <span id="name-error" className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </div>

            {/* Field 2: Mobile Number (Required, Strict Numeric 10-digit) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Mobile number <span className="text-red-600">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={formData.phone}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, phone: digitsOnly });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                className={`w-full bg-[#faf7ef] border ${
                  errors.phone ? "border-red-500" : "border-[#dcd3bf]"
                } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
              />
              {errors.phone && (
                <span id="phone-error" className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </span>
              )}
            </div>

            {/* Field 3: Email (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Email address <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`w-full bg-[#faf7ef] border ${
                  errors.email ? "border-red-500" : "border-[#dcd3bf]"
                } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
              />
              {errors.email && (
                <span id="email-error" className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </span>
              )}
            </div>

            {/* Field 4: Location / Area (Required) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="location"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Location / Area <span className="text-red-600">*</span>
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                placeholder="e.g. Gandhipuram, RS Puram, Peelamedu"
                value={formData.location}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? "location-error" : undefined}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (errors.location) setErrors({ ...errors, location: "" });
                }}
                className={`w-full bg-[#faf7ef] border ${
                  errors.location ? "border-red-500" : "border-[#dcd3bf]"
                } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
              />
              {errors.location && (
                <span id="location-error" className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.location}
                </span>
              )}
            </div>

            {/* Field 5: Requirement Type (Required) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="kind"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Requirement type <span className="text-red-600">*</span>
              </label>
              <select
                id="kind"
                name="kind"
                value={formData.kind}
                onChange={(e) =>
                  setFormData({ ...formData, kind: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 cursor-pointer"
              >
                <option value="Corporate office">Corporate office</option>
                <option value="Startup / team">Startup / team</option>
                <option value="Small function">Small function</option>
                <option value="Group gathering">Group gathering</option>
              </select>
            </div>

            {/* Field 6: Food Preference (Required) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="food"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Food preference <span className="text-red-600">*</span>
              </label>
              <select
                id="food"
                name="food"
                value={formData.food}
                onChange={(e) =>
                  setFormData({ ...formData, food: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 cursor-pointer"
              >
                <option value="Full meals">Full meals</option>
                <option value="Customised tiffin">Customised tiffin</option>
                <option value="Both meals and tiffin">Both meals and tiffin</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            {/* Field 7: Approx Quantity (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="qty"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Approx. quantity <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <select
                id="qty"
                name="qty"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 cursor-pointer"
              >
                <option value="">Select quantity range</option>
                <option value="Below 50">Below 50 persons</option>
                <option value="50–100">50–100 persons</option>
                <option value="100–200">100–200 persons</option>
                <option value="200–500">200–500 persons</option>
                <option value="Above 500">Above 500 persons</option>
              </select>
            </div>

            {/* Field 8: Event / Date (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="eventDate"
                className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider"
              >
                Event date <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                id="eventDate"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
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
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20 resize-y"
              />
            </div>

            {/* Submit Button */}
            <button
              ref={submitBtnRef}
              type="submit"
              className="btn-sheen sm:col-span-2 h-[46px] inline-flex items-center justify-center gap-2 rounded-[2px] text-[13px] font-bold tracking-[0.4px] text-[#f4ecda] border border-[#c7a45b]/35 shadow-md transition-all duration-300 hover:brightness-110 active:scale-[0.98] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #174a34, #0d3021)",
              }}
            >
              <span>Submit Enquiry</span>
              <span aria-hidden="true" className="text-brand-gold">
                →
              </span>
            </button>
          </form>
        </div>

        {/* Supporting Contact Info & Direct Coordination (Moved Below Form) */}
        <div className="mt-14 pt-10 border-t border-[#dfd6c0] max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-serif text-[26px] max-sm:text-[22px] leading-[1.25] text-brand-green font-semibold mb-3">
              Made for teams, gatherings and good food.
            </h3>
            <p className="text-[14px] max-sm:text-[13px] leading-[1.8] text-[#69746a] max-w-xl mx-auto m-0">
              Whether you need regular office meals or catering for a one-time event, our team coordinates customized menus and scheduling directly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Service Location Card */}
            <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_6px_18px_rgba(24,52,35,0.03)] flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f4eee1] grid place-items-center shrink-0 text-[#8e7139]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#8e7139] uppercase tracking-wider mb-0.5">
                  Location
                </span>
                <span className="text-[13px] font-medium text-[#17271e]">
                  {siteConfig.location}
                </span>
              </div>
            </div>

            {/* Direct Phone Card */}
            <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_6px_18px_rgba(24,52,35,0.03)] flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f4eee1] grid place-items-center shrink-0 text-[#8e7139]">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#8e7139] uppercase tracking-wider mb-0.5">
                  Direct Phone
                </span>
                {siteConfig.contact.phone ? (
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-[13px] font-medium text-brand-green hover:underline"
                  >
                    {siteConfig.contact.phone}
                  </a>
                ) : (
                  <span className="text-[12px] text-brand-muted">
                    Via Enquiry Form
                  </span>
                )}
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="p-4 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-[0_6px_18px_rgba(24,52,35,0.03)] flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f4eee1] grid place-items-center shrink-0 text-[#8e7139]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#8e7139] uppercase tracking-wider mb-0.5">
                  WhatsApp
                </span>
                {siteConfig.contact.whatsapp ? (
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-brand-green hover:underline"
                  >
                    +{siteConfig.contact.whatsapp}
                  </a>
                ) : (
                  <span className="text-[12px] text-brand-muted">
                    Available on Enquiry
                  </span>
                )}
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
                <li><strong>Requirement:</strong> {devStatusModal.data?.kind}</li>
                <li><strong>Food:</strong> {devStatusModal.data?.food}</li>
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
              {siteConfig.contact.whatsapp ? (
                <a
                  href={buildWhatsAppPreviewUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[2px] text-brand-green bg-[#eee7d7] hover:bg-[#e4dac4] transition-colors"
                >
                  <span>Test WhatsApp Handoff</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}

              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-bold rounded-[2px] text-white bg-brand-green hover:bg-brand-green2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
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
