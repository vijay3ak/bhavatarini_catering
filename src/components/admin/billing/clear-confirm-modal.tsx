"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ClearConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="clear-modal-title" className="font-serif text-lg font-bold text-[#123c2c] m-0">
                Reset All Meal Counts?
              </h3>
              <p className="text-xs text-[#69746a] mt-0.5 m-0">Action cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[2px] p-1.5 text-[#69746a] hover:bg-[#faf7ef] hover:text-[#17271e] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#5c685e] leading-relaxed m-0">
          This will reset breakfast, lunch, dinner, snacks, and tea counts back to <strong className="text-[#17271e]">0</strong> across all days in the currently generated monthly calendar. Calendar dates and shift particulars will be retained.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#f0e9dc]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[2px] border border-[#dcd0b5] bg-[#faf7ef] hover:bg-[#eee7d7] px-4 py-2 text-xs font-bold text-[#123c2c] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-[2px] bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800 transition-colors cursor-pointer"
          >
            Reset All Counts to 0
          </button>
        </div>
      </div>
    </div>
  );
}
