"use client";

import React, { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/lib/config/site";
import { CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    org: "",
    kind: "Corporate office",
    food: "Full meals",
    qty: "50–100",
    details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devStatusModal, setDevStatusModal] = useState<{
    open: boolean;
    data?: typeof formData;
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

    const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Please enter your 10-digit mobile number.";
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = "Mobile number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // In Phase 2: Show clear development-stage verification message
    // Never claim fake database persistence or simulate false success
    setDevStatusModal({ open: true, data: { ...formData } });
  };

  const buildWhatsAppPreviewUrl = () => {
    const v = formData;
    const msg = `Hello Bhavatarini Catering Service! I would like to enquire about catering.\nName: ${v.name}\nMobile: ${v.phone}\nOrganisation: ${v.org || "Not specified"}\nRequirement: ${v.kind}\nFood preference: ${v.food}\nQuantity: ${v.qty}\nDetails: ${v.details || "Not specified"}`;
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
            Share a few details and we&apos;ll get back to you.
          </p>
          <div
            aria-hidden="true"
            className="w-[42px] h-[1px] bg-[#c7a45b] mx-auto mt-[23px]"
          />
        </div>

        {/* Contact Grid */}
        <div className="contact-grid grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
          {/* Contact Info Column */}
          <div className="contact-info py-2">
            <h3 className="font-serif text-[36px] max-sm:text-[28px] leading-[1.12] text-brand-green font-semibold mb-5">
              Made for teams, gatherings and good food.
            </h3>

            <p className="text-[14px] leading-[1.9] text-[#69746a] mb-6">
              Whether you need regular office meals or catering for a one-time event, send us your requirements.
            </p>

            <div className="space-y-3.5 text-[14px] leading-relaxed text-[#17271e]">
              {siteConfig.serviceArea ? (
                <p className="m-0">
                  <strong className="font-bold text-brand-green">Service area:</strong>{" "}
                  <span className="text-[#69746a]">{siteConfig.serviceArea}</span>
                </p>
              ) : null}

              {siteConfig.contact.phone ? (
                <p className="m-0">
                  <strong className="font-bold text-brand-green">Phone:</strong>{" "}
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-brand-green underline hover:text-brand-goldDark"
                  >
                    {siteConfig.contact.phone}
                  </a>
                </p>
              ) : null}

              {siteConfig.contact.whatsapp ? (
                <p className="m-0">
                  <strong className="font-bold text-brand-green">WhatsApp:</strong>{" "}
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green underline hover:text-brand-goldDark"
                  >
                    +{siteConfig.contact.whatsapp}
                  </a>
                </p>
              ) : null}

              {!siteConfig.contact.phone && !siteConfig.contact.whatsapp ? (
                <p className="m-0 text-xs text-brand-muted bg-[#faf8f1] p-3 rounded border border-brand-line">
                  <strong className="font-bold text-brand-green block mb-1">
                    Enquiries & Bookings:
                  </strong>
                  Please submit your catering details using the form. Our team coordinates customized menus and scheduling directly.
                </p>
              ) : null}
            </div>
          </div>

          {/* Form Column */}
          <form
            id="enquiry"
            onSubmit={handleSubmit}
            noValidate
            className="form bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] rounded-[2px] p-9 max-sm:p-6 shadow-[0_20px_55px_rgba(31,47,34,0.07)] grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {/* Field: Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Your name <span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`w-full bg-[#faf7ef] border ${
                  errors.name ? "border-red-500" : "border-[#dcd3bf]"
                } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
              />
              {errors.name && (
                <span className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </div>

            {/* Field: Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Mobile number <span className="text-red-600">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                className={`w-full bg-[#faf7ef] border ${
                  errors.phone ? "border-red-500" : "border-[#dcd3bf]"
                } px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20`}
              />
              {errors.phone && (
                <span className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </span>
              )}
            </div>

            {/* Field: Organisation */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="org" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Company / Organisation <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="org"
                name="org"
                type="text"
                placeholder="Company or event name"
                value={formData.org}
                onChange={(e) =>
                  setFormData({ ...formData, org: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
              />
            </div>

            {/* Field: Requirement Type */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="kind" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Requirement type
              </label>
              <select
                id="kind"
                name="kind"
                value={formData.kind}
                onChange={(e) =>
                  setFormData({ ...formData, kind: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
              >
                <option value="Corporate office">Corporate office</option>
                <option value="Startup / team">Startup / team</option>
                <option value="Small function">Small function</option>
                <option value="Group gathering">Group gathering</option>
              </select>
            </div>

            {/* Field: Food Preference */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="food" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Food preference
              </label>
              <select
                id="food"
                name="food"
                value={formData.food}
                onChange={(e) =>
                  setFormData({ ...formData, food: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
              >
                <option value="Full meals">Full meals</option>
                <option value="Customised tiffin">Customised tiffin</option>
                <option value="Both meals and tiffin">Both meals and tiffin</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            {/* Field: Approx Quantity */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="qty" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Approx. quantity
              </label>
              <select
                id="qty"
                name="qty"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: e.target.value })
                }
                className="w-full bg-[#faf7ef] border border-[#dcd3bf] px-3.5 py-2.5 text-[13px] text-[#17271e] rounded-[2px] outline-none transition-all focus:bg-white focus:border-[#c7a45b] focus:ring-2 focus:ring-[#c7a45b]/20"
              >
                <option value="Below 50">Below 50</option>
                <option value="50–100">50–100</option>
                <option value="100–200">100–200</option>
                <option value="200–500">200–500</option>
                <option value="Above 500">Above 500</option>
              </select>
            </div>

            {/* Field: Details */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="details" className="text-[11px] font-bold text-[#616c61] uppercase tracking-wider">
                Date, location and other details
              </label>
              <textarea
                id="details"
                name="details"
                rows={3}
                placeholder="Tell us your date, delivery location, frequency or special requests"
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
            className="bg-[#fffefa] border border-[#e5ddcd] rounded-[2px] max-w-lg w-full p-6 shadow-2xl space-y-4"
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
                <li><strong>Org:</strong> {devStatusModal.data?.org || "None"}</li>
                <li><strong>Requirement:</strong> {devStatusModal.data?.kind}</li>
                <li><strong>Food:</strong> {devStatusModal.data?.food}</li>
                <li><strong>Quantity:</strong> {devStatusModal.data?.qty}</li>
                <li><strong>Details:</strong> {devStatusModal.data?.details || "None"}</li>
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
