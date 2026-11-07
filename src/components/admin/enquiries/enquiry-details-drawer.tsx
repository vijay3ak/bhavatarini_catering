"use client";

import React, { useState, useEffect, useRef } from "react";
import { EnquiryRecord, EnquiryStatus } from "@/types/enquiry";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  UtensilsCrossed,
  MessageSquare,
  Clock,
  Save,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface EnquiryDetailsDrawerProps {
  enquiry: EnquiryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: EnquiryStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
}

const STATUS_CONFIG: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: "New",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  contacted: {
    label: "Contacted",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  quote_sent: {
    label: "Quote Sent",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
  },
};

export function EnquiryDetailsDrawer({
  enquiry,
  isOpen,
  onClose,
  onStatusChange,
  onNotesChange,
}: EnquiryDetailsDrawerProps) {
  const [internalNotes, setInternalNotes] = useState("");
  const [notesSavedToast, setNotesSavedToast] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (enquiry) {
      setInternalNotes(enquiry.internal_notes || "");
    }
  }, [enquiry]);

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

  if (!isOpen || !enquiry) return null;

  const statusStyle = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.new;

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    onNotesChange(enquiry.id, internalNotes);
    setNotesSavedToast(true);
    setTimeout(() => setNotesSavedToast(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello ${enquiry.name}! Thank you for reaching out to Bhavatarini Catering Service regarding your catering requirement for ${enquiry.requirement_type}. We would be happy to discuss your menu preferences.`
  );
  const whatsappUrl = `https://wa.me/91${enquiry.phone.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full max-w-xl h-full bg-[#ffffff] shadow-2xl flex flex-col border-l border-[#e5ddcd] overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 bg-[#faf7ef] border-b border-[#e5ddcd] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >
                {statusStyle.label}
              </span>
              <span className="text-[11px] text-[#8e7139] font-semibold">
                Ref: #{enquiry.id}
              </span>
            </div>
            <h2 id="drawer-title" className="font-serif text-[20px] sm:text-[22px] font-bold text-[#123c2c] m-0">
              {enquiry.name}
            </h2>
            {enquiry.organisation && (
              <p className="text-xs font-semibold text-[#69746a] m-0 mt-0.5">
                {enquiry.organisation}
              </p>
            )}
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close enquiry details"
            className="w-8 h-8 rounded-full border border-[#dcd0b5] bg-white hover:bg-[#eee7d7] text-[#17271e] grid place-items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${enquiry.phone}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#ffffff] hover:bg-[#faf7ef] border border-[#dcd0b5] shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#8e7139]" />
              <span>Call ({enquiry.phone})</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[2px] text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Reply</span>
            </a>

            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[2px] text-xs font-semibold text-[#123c2c] bg-[#ffffff] border border-[#dcd0b5] hover:bg-[#faf7ef] shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>Email Client</span>
              </a>
            )}
          </div>

          {/* Status Updater Section */}
          <div className="p-4 rounded-[2px] bg-[#faf8f1] border border-[#e5ddcd] space-y-2.5">
            <span className="block text-[10.5px] font-bold text-[#69746a] uppercase tracking-wider">
              Update Lead Status (Session State)
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  "new",
                  "contacted",
                  "quote_sent",
                  "confirmed",
                  "completed",
                  "cancelled",
                ] as EnquiryStatus[]
              ).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange(enquiry.id, st)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-[2px] transition-all border ${
                    enquiry.status === st
                      ? "bg-[#123c2c] text-[#faf8f1] border-[#123c2c] shadow-xs"
                      : "bg-white text-[#526053] border-[#dcd0b5] hover:bg-[#f4efe4]"
                  }`}
                >
                  {STATUS_CONFIG[st].label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Event & Catering Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1">
              <span className="text-[#8e7139] font-bold tracking-wider uppercase text-[10px] block">
                Requirement Type
              </span>
              <div className="flex items-center gap-2 font-semibold text-[#17271e]">
                <FileText className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>{enquiry.requirement_type}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1">
              <span className="text-[#8e7139] font-bold tracking-wider uppercase text-[10px] block">
                Food Preference
              </span>
              <div className="flex items-center gap-2 font-semibold text-[#17271e]">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>{enquiry.food_preference}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1">
              <span className="text-[#8e7139] font-bold tracking-wider uppercase text-[10px] block">
                Expected Guest Count
              </span>
              <div className="flex items-center gap-2 font-semibold text-[#17271e]">
                <Users className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>{enquiry.quantity || enquiry.quantity_range || "Not specified"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1">
              <span className="text-[#8e7139] font-bold tracking-wider uppercase text-[10px] block">
                Event / Service Date
              </span>
              <div className="flex items-center gap-2 font-semibold text-[#17271e]">
                <Calendar className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>{enquiry.event_date || "Flexible / Not specified"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1 sm:col-span-2">
              <span className="text-[#8e7139] font-bold tracking-wider uppercase text-[10px] block">
                Event Location / Area
              </span>
              <div className="flex items-center gap-2 font-semibold text-[#17271e]">
                <MapPin className="w-3.5 h-3.5 text-[#8e7139]" />
                <span>{enquiry.location}</span>
              </div>
            </div>
          </div>

          {/* Customer Additional Requirements */}
          <div className="p-4 rounded-[2px] bg-[#ffffff] border border-[#e5ddcd] space-y-1.5">
            <span className="text-[10px] font-bold text-[#8e7139] tracking-wider uppercase block">
              Additional Requirements / Customer Notes
            </span>
            <p className="text-xs text-[#415042] leading-relaxed m-0 italic bg-[#faf8f1] p-3 rounded-[2px] border border-[#f0e8d9]">
              &ldquo;{enquiry.details || "No special requests specified."}&rdquo;
            </p>
          </div>

          {/* Internal Operations Notes Editor */}
          <form onSubmit={handleSaveNotes} className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="internal-notes-input"
                className="text-[10.5px] font-bold text-[#69746a] uppercase tracking-wider"
              >
                Internal Operations Notes
              </label>
              {notesSavedToast && (
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Saved to session state!
                </span>
              )}
            </div>
            <textarea
              id="internal-notes-input"
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Record coordination notes, custom quote figures, or special chef instructions..."
              className="w-full text-xs p-3 rounded-[2px] bg-[#faf8f1] border border-[#dcd0b5] text-[#17271e] focus:bg-white focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[2px] text-xs font-bold text-[#faf8f1] bg-[#123c2c] hover:bg-[#1a533d] border border-[#123c2c] shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#c7a45b]" />
              <span>Save Internal Notes</span>
            </button>
          </form>

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-[#f0e9dc] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#8e7139]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Received: {new Date(enquiry.created_at).toLocaleString()}</span>
            </span>
            <span className="text-[#69746a]">Channel: Website Contact Form</span>
          </div>
        </div>
      </div>
    </div>
  );
}
