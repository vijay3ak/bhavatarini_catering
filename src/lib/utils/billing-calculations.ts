import type { DailyBillingEntry, BillingKpiSummary, BillingRateSource } from "@/types/billing";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const PARTICULAR_OPTIONS = [
  "BREAKFAST & DINNER",
  "LUNCH",
  "SUNDAY",
  "BREAKFAST ONLY",
  "DINNER ONLY",
  "SPECIAL EVENT",
  "MULTI-MEAL BREAKDOWN",
] as const;

/**
 * Format ISO date string (YYYY-MM-DD) into Indian display format (DD-MM-YYYY)
 */
export function formatDateDisplay(isoDateString: string): string {
  if (!isoDateString) return "";
  const parts = isoDateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return isoDateString;
}

/**
 * Format currency in Indian numbering system with ₹ symbol (e.g. ₹ 1,70,400.00)
 */
export function formatINR(val: number): string {
  const num = Number(val) || 0;
  return "₹ " + num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Number to Words Converter in the Indian Numbering System (Crores, Lakhs, Thousands, Hundreds, Rupees, Paise)
 * Example: 170400 -> "Rupees One Lakh Seventy Thousand Four Hundred Only"
 */
export function numberToWordsINR(amount: number): string {
  const amt = Number(amount) || 0;
  if (amt === 0) return "Rupees Zero Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertUnderThousand(n: number): string {
    let str = "";
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    if (hundreds > 0) {
      str += a[hundreds] + " Hundred";
      if (rem > 0) str += " and ";
    }
    if (rem > 0) {
      if (rem < 20) {
        str += a[rem];
      } else {
        str += b[Math.floor(rem / 10)] + (rem % 10 > 0 ? " " + a[rem % 10] : "");
      }
    }
    return str.trim();
  }

  const rounded = Math.round(amt * 100) / 100;
  const parts = rounded.toFixed(2).split(".");
  let num = parseInt(parts[0], 10);
  const paise = parseInt(parts[1], 10);

  let words = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remaining = num;

  if (crore > 0) words += convertUnderThousand(crore) + " Crore ";
  if (lakh > 0) words += convertUnderThousand(lakh) + " Lakh ";
  if (thousand > 0) words += convertUnderThousand(thousand) + " Thousand ";
  if (remaining > 0) words += convertUnderThousand(remaining) + " ";

  words = words.trim();
  let result = "Rupees " + words;
  if (paise > 0) {
    result += " and " + convertUnderThousand(paise) + " Paise";
  }
  result += " Only";
  return result;
}

/**
 * Extract target numerical quantity from a combined meal notation string.
 * Example: "65 Breakfast, Dinner" -> 65
 * Example: "65 (B+D)" -> 65
 * Example: "85 Breakfast, Dinner (Merged: 65 + 20)" -> 85 (takes the first target quantity)
 * Returns null if notation is undefined, empty, or contains no valid number.
 */
export function extractCombinedQuantity(notation: string | undefined | null): number | null {
  if (!notation || typeof notation !== "string") return null;
  const trimmed = notation.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\b(\d+)\b/);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * Calculate Single Row Bill Quantity
 * Exact Business Rules from Prototype:
 * - When explicit combined notation is present (e.g. '65 Breakfast, Dinner'):
 *     Bill Quantity = 65 (represents total shift meals, NEVER doubled to 130).
 * - When particulars is 'BREAKFAST & DINNER': Bill Quantity = Breakfast + Dinner
 * - When particulars is 'LUNCH': Bill Quantity = Lunch
 * - When particulars is 'SUNDAY':
 *     - If overtime shift meals entered:
 *         if (bf + dinner > 0) return bf + dinner
 *         if (lunch > 0) return lunch
 *     - If no overtime meals: 0
 * - When particulars includes 'LUNCH': Bill Quantity = Lunch
 * - Else fallback: Bill Quantity = Breakfast + Dinner
 *
 * NOTE: Snacks and Tea are strictly NON-BILLABLE / AUDIT ONLY and never counted in billQty.
 */
export function calculateRowBillQty(entry: Partial<DailyBillingEntry>): number {
  // 0. If multi-meal breakdown exists, compute bill quantity as sum of all enabled meals
  if (entry.isMultiMeal && entry.mealBreakdown?.meals) {
    return entry.mealBreakdown.meals
      .filter((m) => m.enabled)
      .reduce((sum, m) => sum + Math.max(0, parseInt(String(m.quantity), 10) || 0), 0);
  }

  // 1. If explicit combined meal notation exists, extract the combined count
  // CRITICAL BUSINESS RULE:
  // "65 Breakfast, Dinner" means 65 total meals covering the shift, NOT 65 + 65 = 130.
  if (entry.combinedNotation) {
    const combinedQty = extractCombinedQuantity(entry.combinedNotation);
    if (combinedQty !== null) {
      return combinedQty;
    }
  }

  // 2. Otherwise compute from individual shift meal counts
  const bf = Math.max(0, parseInt(String(entry.breakfast), 10) || 0);
  const lunch = Math.max(0, parseInt(String(entry.lunch), 10) || 0);
  const dinner = Math.max(0, parseInt(String(entry.dinner), 10) || 0);

  const particulars = (entry.particulars || "").trim().toUpperCase();

  if (particulars === "BREAKFAST & DINNER") {
    return bf + dinner;
  } else if (particulars === "LUNCH") {
    return lunch;
  } else if (particulars === "SUNDAY") {
    // If sunday with overtime shift meals entered:
    if (bf + dinner > 0) return bf + dinner;
    if (lunch > 0) return lunch;
    return 0;
  } else if (particulars.includes("LUNCH")) {
    return lunch;
  } else {
    return bf + dinner;
  }
}

/**
 * Generate monthly calendar dates
 * - Uses JavaScript Date
 * - Computes all days for month (e.g. Nov 2026 -> 30, Feb 2028 -> 29, Feb 2026 -> 28)
 * - Correctly identifies Sundays
 * - Default: Sunday -> 'SUNDAY', Monday to Saturday -> selected preset
 * - If retainExisting is true, preserves previously entered meal counts and manual particulars
 */
export function generateMonthlyCalendar(
  monthIndex: number,
  year: number,
  preset: string = "BREAKFAST & DINNER",
  existingEntries?: DailyBillingEntry[],
  retainExisting: boolean = false
): DailyBillingEntry[] {
  if (isNaN(monthIndex) || isNaN(year) || year < 1900 || year > 2100) {
    throw new Error("Invalid month or year provided for calendar generation");
  }

  // Days in month: day 0 of monthIndex + 1 gives total days of target month
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");

  const newEntries: DailyBillingEntry[] = [];

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const dayOfWeekIndex = dateObj.getDay(); // 0 is Sunday
    const dayName = DAY_NAMES[dayOfWeekIndex];
    const isSunday = dayOfWeekIndex === 0;
    const isoDate = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

    let breakfast = 0;
    let lunch = 0;
    let dinner = 0;
    let snacks = 0;
    let tea = 0;
    let remarks = "";
    let combinedNotation: string | undefined = undefined;
    let particulars = isSunday ? "SUNDAY" : preset;
    let isManualParticulars = false;

    if (retainExisting && existingEntries && existingEntries[day - 1]) {
      const existing = existingEntries[day - 1];
      breakfast = existing.breakfast || 0;
      lunch = existing.lunch || 0;
      dinner = existing.dinner || 0;
      snacks = existing.snacks || 0;
      tea = existing.tea || 0;
      remarks = existing.remarks || "";
      combinedNotation = existing.combinedNotation;
      if (existing.isManualParticulars) {
        particulars = existing.particulars;
        isManualParticulars = true;
      }
    }

    const entry: DailyBillingEntry = {
      id: `row_${year}_${monthIndex + 1}_${day}`,
      dayNumber: day,
      dateString: isoDate,
      dayName: dayName,
      isSunday: isSunday,
      breakfast: breakfast,
      lunch: lunch,
      dinner: dinner,
      snacks: snacks,
      tea: tea,
      particulars: particulars,
      isManualParticulars: isManualParticulars,
      remarks: remarks,
      combinedNotation: combinedNotation,
      billQty: 0,
    };

    entry.billQty = calculateRowBillQty(entry);
    newEntries.push(entry);
  }

  return newEntries;
}

/**
 * Apply selected preset to all non-Sunday rows
 */
export function applyPresetToAllNonSundays(
  entries: DailyBillingEntry[],
  preset: string
): DailyBillingEntry[] {
  return entries.map((entry) => {
    if (!entry.isSunday) {
      const updated = {
        ...entry,
        particulars: preset,
        isManualParticulars: false,
      };
      return {
        ...updated,
        billQty: calculateRowBillQty(updated),
      };
    } else {
      if (!entry.isManualParticulars) {
        const updated = {
          ...entry,
          particulars: "SUNDAY",
        };
        return {
          ...updated,
          billQty: calculateRowBillQty(updated),
        };
      }
      return entry;
    }
  });
}

/**
 * Calculate Single Row Amount in INR
 * For multi-meal entries:
 *   Sums (quantity * mealRate) across all enabled meals, supporting independent rates per category.
 * For standard single-preset entries:
 *   Returns billQty * defaultRate.
 */
export function calculateRowAmount(entry: DailyBillingEntry, defaultRate: number): number {
  const safeRate = Number.isFinite(defaultRate) && defaultRate >= 0 ? defaultRate : 0;
  if (entry.isMultiMeal && entry.mealBreakdown?.meals) {
    return entry.mealBreakdown.meals
      .filter((m) => m.enabled && m.quantity > 0)
      .reduce((sum, m) => {
        const itemRate = Number.isFinite(m.rate) && m.rate >= 0 ? m.rate : safeRate;
        const qty = Math.max(0, parseInt(String(m.quantity), 10) || 0);
        return sum + qty * itemRate;
      }, 0);
  }
  return (entry.billQty || 0) * safeRate;
}

/**
 * Calculate KPI summaries across all daily entries
 */
export function calculateBillingKpis(
  entries: DailyBillingEntry[],
  rate: number,
  rateSource?: BillingRateSource
): BillingKpiSummary {
  const safeRate = Math.max(0, rate || 0);
  let totalSundays = 0;
  let totalBillQty = 0;
  let totalAmount = 0;

  for (const entry of entries) {
    if (entry.isSunday) {
      totalSundays++;
    }
    totalBillQty += entry.billQty;
    totalAmount += calculateRowAmount(entry, safeRate);
  }

  const totalDays = entries.length;

  return {
    totalDays,
    totalSundays,
    totalBillQty,
    rate: safeRate,
    rateSource,
    totalAmount,
    amountInWords: numberToWordsINR(totalAmount),
  };
}

/**
 * Generate realistic sample billing data (November 2026) for one-click testing
 */
export function generateSampleBillingData(
  monthIndex: number = 10,
  year: number = 2026,
  rate: number = 70.0
): DailyBillingEntry[] {
  const calendar = generateMonthlyCalendar(monthIndex, year, "BREAKFAST & DINNER");

  return calendar.map((entry) => {
    if (!entry.isSunday) {
      const dayNum = entry.dayNumber;
      const breakfast = 28 + (dayNum % 7);
      const lunch = 0;
      const dinner = 34 + ((dayNum * 3) % 9);
      const remarks = dayNum === 15 ? "Overtime shift team" : "";

      const updated: DailyBillingEntry = {
        ...entry,
        breakfast,
        lunch,
        dinner,
        remarks,
        particulars: "BREAKFAST & DINNER",
        billQty: 0,
      };
      updated.billQty = calculateRowBillQty(updated);
      return updated;
    } else {
      const updated: DailyBillingEntry = {
        ...entry,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        remarks: "",
        particulars: "SUNDAY",
        billQty: 0,
      };
      return updated;
    }
  });
}
