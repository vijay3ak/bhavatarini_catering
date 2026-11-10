"use client";

import React, { useState, useEffect } from "react";
import { IndianRupee, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ArchivedInvoice } from "@/types/billing";
import { formatINR } from "@/lib/utils/billing-calculations";
import { recordPayment } from "@/lib/services/billing-service";

interface RecordPaymentModalProps {
  isOpen: boolean;
  invoice: ArchivedInvoice | null;
  onClose: () => void;
  onSuccess: (paymentAmount: number) => void;
}

export function RecordPaymentModal({
  isOpen,
  invoice,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const maxPayable = invoice ? invoice.outstandingBalance ?? invoice.kpis.totalAmount : 0;

  const [amount, setAmount] = useState<number>(maxPayable);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      const balance = invoice.outstandingBalance ?? invoice.kpis.totalAmount;
      setAmount(balance);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentReference("");
      setNotes("");
      setErrorMessage(null);
    }
  }, [invoice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (amount <= 0) {
      setErrorMessage("Payment amount must be greater than zero.");
      return;
    }

    if (amount > maxPayable) {
      setErrorMessage(
        `Payment amount cannot exceed outstanding balance of ${formatINR(maxPayable)}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordPayment({
        invoiceId: invoice.id,
        amount,
        paymentDate,
        paymentReference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to record payment transaction.");
        setIsSubmitting(false);
        return;
      }

      onSuccess(amount);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg rounded-[2px] border border-[#e5ddcd] bg-[#ffffff] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#f0e9dc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 id="record-payment-title" className="font-serif text-lg font-bold text-[#123c2c] m-0">
                Record Invoice Payment
              </h3>
              <p className="text-xs text-[#69746a] mt-0.5 m-0 font-mono">
                Invoice {invoice.billNo} • {invoice.customer.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-[2px] p-1.5 text-[#69746a] hover:bg-[#faf7ef] hover:text-[#17271e] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Financial Context Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#faf7ef] border border-[#dcd0b5] rounded-[2px] text-xs">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-[#69746a]">Total Invoiced</span>
            <p className="font-mono font-bold text-[#123c2c] mt-0.5 m-0">
              {formatINR(invoice.kpis.totalAmount)}
            </p>
          </div>
          <div>
            <span className="text-[10.5px] uppercase font-bold text-[#69746a]">Total Paid</span>
            <p className="font-mono font-bold text-emerald-700 mt-0.5 m-0">
              {formatINR(invoice.totalPaid ?? 0)}
            </p>
          </div>
          <div>
            <span className="text-[10.5px] uppercase font-bold text-[#69746a]">Balance Due</span>
            <p className="font-mono font-bold text-amber-800 mt-0.5 m-0">
              {formatINR(maxPayable)}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-[2px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="pay-amount" className="font-bold uppercase tracking-wider text-[#17271e] text-[11px]">
                Payment Amount (₹) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#8e7139] font-bold">₹</span>
                <input
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxPayable}
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-[2px] border border-[#dcd0b5] bg-white pl-7 pr-3 py-1.5 font-mono text-xs font-bold text-[#123c2c] focus:outline-hidden focus:border-[#123c2c]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="pay-date" className="font-bold uppercase tracking-wider text-[#17271e] text-[11px]">
                Payment Date <span className="text-red-600">*</span>
              </label>
              <input
                id="pay-date"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-[2px] border border-[#dcd0b5] bg-white px-3 py-1.5 font-mono text-xs font-semibold text-[#17271e] focus:outline-hidden focus:border-[#123c2c]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="pay-ref" className="font-bold uppercase tracking-wider text-[#17271e] text-[11px]">
              Payment Reference / UTR / Transaction No
            </label>
            <input
              id="pay-ref"
              type="text"
              placeholder="e.g. UTR / NEFT / IMPS / Bank Cheque No"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full rounded-[2px] border border-[#dcd0b5] bg-white px-3 py-1.5 text-xs text-[#17271e] focus:outline-hidden focus:border-[#123c2c]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="pay-notes" className="font-bold uppercase tracking-wider text-[#17271e] text-[11px]">
              Notes / Remarks (Optional)
            </label>
            <textarea
              id="pay-notes"
              rows={2}
              placeholder="e.g. Received via State Bank of India account transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-[2px] border border-[#dcd0b5] bg-white px-3 py-1.5 text-xs text-[#17271e] focus:outline-hidden focus:border-[#123c2c]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0e9dc]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-[2px] border border-[#dcd0b5] bg-[#faf7ef] hover:bg-[#eee7d7] px-4 py-2 text-xs font-bold text-[#123c2c] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0 || amount > maxPayable}
              className="inline-flex items-center gap-1.5 rounded-[2px] bg-[#123c2c] hover:bg-[#1a4a38] disabled:opacity-50 px-4 py-2 text-xs font-bold text-[#faf8f1] shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c7a45b]" />
                  <span>Record Payment ({formatINR(amount)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
