"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AdminSidebar, type AdminProfileSummary } from "./admin-sidebar";

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: AdminProfileSummary | null;
}

export function AdminMobileDrawer({
  isOpen,
  onClose,
  initialProfile,
}: AdminMobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus close button on open
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin Navigation Menu"
      className="fixed inset-0 z-50 lg:hidden flex"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl flex flex-col bg-[#123c2c]"
      >
        {/* Mobile Close Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#faf8f1] grid place-items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          <AdminSidebar onNavigate={onClose} initialProfile={initialProfile} />
        </div>
      </div>
    </div>
  );
}
