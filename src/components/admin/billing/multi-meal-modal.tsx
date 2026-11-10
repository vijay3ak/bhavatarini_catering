"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Utensils,
  Calculator,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { DailyBillingEntry, MealType, MealItemDetail, MultiMealBreakdown } from "@/types/billing";
import { formatDateDisplay, formatINR } from "@/lib/utils/billing-calculations";

interface MultiMealModalProps {
  isOpen: boolean;
  entry: DailyBillingEntry | null;
  defaultRate: number;
  onClose: () => void;
  onSave: (breakdown: MultiMealBreakdown) => void;
  onRevert?: () => void;
}

const ALL_MEAL_TYPES: { type: MealType; label: string; desc: string }[] = [
  { type: "BREAKFAST", label: "Breakfast", desc: "Morning shift / Idli, Dosa, Pongal & accompaniments" },
  { type: "LUNCH", label: "Lunch", desc: "Mid-day meals / Traditional South Indian Full Meals" },
  { type: "DINNER", label: "Dinner", desc: "Night shift / Tiffin & light meals" },
  { type: "SNACKS", label: "Evening Snacks", desc: "Savory & sweet evening refreshments" },
  { type: "TEA", label: "Tea & Beverages", desc: "Tea, filter coffee, or beverage service" },
];

export function MultiMealModal({
  isOpen,
  entry,
  defaultRate,
  onClose,
  onSave,
  onRevert,
}: MultiMealModalProps) {
  const [mealConfigs, setMealConfigs] = useState<Record<MealType, { enabled: boolean; quantity: number; rate: number; notes: string }>>({
    BREAKFAST: { enabled: false, quantity: 0, rate: defaultRate, notes: "" },
    LUNCH: { enabled: false, quantity: 0, rate: defaultRate, notes: "" },
    DINNER: { enabled: false, quantity: 0, rate: defaultRate, notes: "" },
    SNACKS: { enabled: false, quantity: 0, rate: defaultRate, notes: "" },
    TEA: { enabled: false, quantity: 0, rate: defaultRate, notes: "" },
  });

  // Initialize form state when entry opens
  useEffect(() => {
    if (!isOpen || !entry) return;

    const baseRate = Number.isFinite(defaultRate) && defaultRate >= 0 ? defaultRate : 48;

    if (entry.isMultiMeal && entry.mealBreakdown?.meals?.length) {
      const newConfigs: typeof mealConfigs = {
        BREAKFAST: { enabled: false, quantity: 0, rate: baseRate, notes: "" },
        LUNCH: { enabled: false, quantity: 0, rate: baseRate, notes: "" },
        DINNER: { enabled: false, quantity: 0, rate: baseRate, notes: "" },
        SNACKS: { enabled: false, quantity: 0, rate: baseRate, notes: "" },
        TEA: { enabled: false, quantity: 0, rate: baseRate, notes: "" },
      };

      for (const m of entry.mealBreakdown.meals) {
        newConfigs[m.mealType] = {
          enabled: m.enabled,
          quantity: m.quantity,
          rate: Number.isFinite(m.rate) ? m.rate : baseRate,
          notes: m.notes || "",
        };
      }
      setMealConfigs(newConfigs);
    } else {
      // Prefill from standard entry's existing counts if any
      const bfQty = entry.breakfast || 0;
      const lunchQty = entry.lunch || 0;
      const dinnerQty = entry.dinner || 0;
      const snacksQty = entry.snacks || 0;
      const teaQty = entry.tea || 0;

      setMealConfigs({
        BREAKFAST: { enabled: bfQty > 0, quantity: bfQty, rate: baseRate, notes: "" },
        LUNCH: { enabled: lunchQty > 0, quantity: lunchQty, rate: baseRate, notes: "" },
        DINNER: { enabled: dinnerQty > 0, quantity: dinnerQty, rate: baseRate, notes: "" },
        SNACKS: { enabled: snacksQty > 0, quantity: snacksQty, rate: baseRate, notes: "" },
        TEA: { enabled: teaQty > 0, quantity: teaQty, rate: baseRate, notes: "" },
      });
    }
  }, [isOpen, entry, defaultRate]);

  // Compute live rollups
  const liveTotals = useMemo(() => {
    let totalQty = 0;
    let totalAmount = 0;
    let activeCategoriesCount = 0;

    for (const mt of ALL_MEAL_TYPES) {
      const cfg = mealConfigs[mt.type];
      if (cfg.enabled) {
        totalQty += cfg.quantity;
        totalAmount += cfg.quantity * cfg.rate;
        if (cfg.quantity > 0) activeCategoriesCount++;
      }
    }

    return { totalQty, totalAmount, activeCategoriesCount };
  }, [mealConfigs]);

  if (!isOpen || !entry) return null;

  const handleToggle = (type: MealType) => {
    setMealConfigs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: !prev[type].enabled,
        // If enabling and quantity is 0, initialize to 0
        quantity: !prev[type].enabled && prev[type].quantity === 0 ? 0 : prev[type].quantity,
      },
    }));
  };

  const handleQuantityChange = (type: MealType, val: string) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setMealConfigs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        quantity: qty,
        enabled: qty > 0 ? true : prev[type].enabled,
      },
    }));
  };

  const handleRateChange = (type: MealType, val: string) => {
    const r = Math.max(0, parseFloat(val) || 0);
    setMealConfigs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        rate: r,
      },
    }));
  };

  const handleNotesChange = (type: MealType, val: string) => {
    setMealConfigs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        notes: val,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const meals: MealItemDetail[] = ALL_MEAL_TYPES.map((mt) => {
      const cfg = mealConfigs[mt.type];
      return {
        mealType: mt.type,
        enabled: cfg.enabled && cfg.quantity > 0,
        quantity: cfg.enabled ? cfg.quantity : 0,
        rate: cfg.rate,
        amount: cfg.enabled ? cfg.quantity * cfg.rate : 0,
        notes: cfg.notes.trim() || undefined,
      };
    });

    const breakdown: MultiMealBreakdown = {
      meals,
      totalQty: liveTotals.totalQty,
      totalAmount: liveTotals.totalAmount,
    };

    onSave(breakdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-[3px] border border-[#dcd0b5] bg-[#ffffff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="multi-meal-title"
      >
        {/* Header */}
        <div className="p-4 bg-[#faf7ef] border-b border-[#e5ddcd] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[#123c2c] text-[#d4af37] flex items-center justify-center shadow-xs">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 id="multi-meal-title" className="font-serif text-base font-bold text-[#123c2c] m-0">
                Multi-Meal Breakdown Configuration
              </h3>
              <p className="text-xs text-[#5c685e] m-0 flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-[#17271e]">{formatDateDisplay(entry.dateString)}</span>
                <span>({entry.dayName})</span>
                <span>• Default Rate: ₹{defaultRate.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5c685e] hover:text-[#123c2c] hover:bg-[#ece4d0] rounded-[2px] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Guidance */}
        <div className="px-5 py-3 bg-[#fdfcf9] border-b border-[#f0e9dc] text-xs text-[#5c685e] flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#8e7139] shrink-0 mt-0.5" />
          <div>
            Enable multiple meals (e.g. Breakfast, Lunch, Dinner) on this specific date with independent quantities and rates.
            The daily entry row and invoice will show the itemized line items and combined total.
          </div>
        </div>

        {/* Meal Categories Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          <div className="space-y-2.5">
            {ALL_MEAL_TYPES.map((mt) => {
              const cfg = mealConfigs[mt.type];
              const subtotal = cfg.enabled ? cfg.quantity * cfg.rate : 0;

              return (
                <div
                  key={mt.type}
                  className={`p-3 rounded-[2px] border transition-all ${
                    cfg.enabled
                      ? "bg-[#faf8f1] border-[#c7a45b] shadow-xs"
                      : "bg-[#ffffff] border-[#e5ddcd] opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Meal Toggle & Label */}
                    <div className="flex items-start sm:items-center gap-3">
                      <input
                        type="checkbox"
                        id={`meal-chk-${mt.type}`}
                        checked={cfg.enabled}
                        onChange={() => handleToggle(mt.type)}
                        className="w-4 h-4 mt-0.5 sm:mt-0 rounded text-[#123c2c] focus:ring-[#8e7139] border-[#dcd0b5] cursor-pointer"
                      />
                      <label htmlFor={`meal-chk-${mt.type}`} className="cursor-pointer">
                        <div className="font-bold text-xs text-[#123c2c] flex items-center gap-1.5">
                          <span>{mt.label}</span>
                          {cfg.enabled && cfg.quantity > 0 && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.2 rounded-[2px]">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#69746a]">{mt.desc}</div>
                      </label>
                    </div>

                    {/* Inputs: Quantity, Rate, Subtotal */}
                    <div className="flex items-center gap-2 pl-7 sm:pl-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#5c685e] font-semibold">Qty</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          disabled={!cfg.enabled}
                          value={cfg.quantity === 0 && !cfg.enabled ? "" : cfg.quantity}
                          placeholder="0"
                          onChange={(e) => handleQuantityChange(mt.type, e.target.value)}
                          className="w-20 h-7 text-center rounded-[2px] border border-[#dcd0b5] bg-white text-xs font-mono font-bold text-[#17271e] focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] disabled:bg-neutral-100 disabled:text-neutral-400 outline-none"
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#5c685e] font-semibold">Rate (₹)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          disabled={!cfg.enabled}
                          value={cfg.rate}
                          onChange={(e) => handleRateChange(mt.type, e.target.value)}
                          className="w-20 h-7 text-center rounded-[2px] border border-[#dcd0b5] bg-white text-xs font-mono text-[#17271e] focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b] disabled:bg-neutral-100 disabled:text-neutral-400 outline-none"
                        />
                      </div>

                      <div className="flex flex-col items-end min-w-[85px] pl-1">
                        <span className="text-[10px] text-[#5c685e] font-semibold">Subtotal</span>
                        <span className="text-xs font-mono font-bold text-[#123c2c] h-7 flex items-center">
                          {formatINR(subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Summary Footer within Form */}
          <div className="p-3.5 bg-[#faf7ef] rounded-[2px] border border-[#dcd0b5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#5c685e]">
              <span className="font-bold text-[#123c2c]">{liveTotals.activeCategoriesCount} meal categories</span> configured for this date.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[#69746a]">Total Meals: </span>
                <span className="font-mono font-bold text-sm text-[#123c2c]">{liveTotals.totalQty}</span>
              </div>
              <div className="border-l border-[#dcd0b5] pl-4">
                <span className="text-[#69746a]">Daily Amount: </span>
                <span className="font-mono font-bold text-sm text-[#123c2c]">{formatINR(liveTotals.totalAmount)}</span>
              </div>
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="p-4 bg-[#faf7ef] border-t border-[#e5ddcd] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            {entry.isMultiMeal && onRevert && (
              <button
                type="button"
                onClick={() => {
                  onRevert();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                <span>Revert to Standard Shift</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-[2px] border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[2px] bg-[#123c2c] hover:bg-[#1a4a37] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Apply to Date</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
