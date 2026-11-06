import type {
  DailyBillingEntry,
  ExtractionDocumentMeta,
  ExtractionPayload,
  ExtractionServiceResponse,
  ExtractionStats,
  HtrExtractedRecord,
  HtrRecordStatus,
  IExtractionService,
  ReconciliationComparisonRow,
  ReconciliationClassification,
  ReconciliationDecision,
  ReconciliationRowAction,
  ReconciliationSummary,
} from "@/types/billing";
import {
  calculateRowBillQty,
  extractCombinedQuantity,
} from "@/lib/utils/billing-calculations";

/**
 * Calculates billable quantity from an extracted record or manual input,
 * strictly enforcing the Combined Meal Notation business rule.
 *
 * CRITICAL BUSINESS RULE (Prototype Parity):
 * If a record has a combined notation like "65 Breakfast, Dinner":
 * - The written quantity (65) represents the TOTAL shift meal count covering both meals.
 * - It must NEVER be doubled (e.g. 65, NOT 65 + 65 = 130).
 * - Individual breakfast/dinner columns must not silently duplicate the total.
 * - Directly delegates to the central calculation engine (Single Source of Truth).
 */
export function computeExtractedRowBillQty(
  record: Pick<
    HtrExtractedRecord,
    "breakfast" | "lunch" | "dinner" | "combinedNotation"
  >,
  preset: string = "BREAKFAST & DINNER"
): number {
  return calculateRowBillQty({
    breakfast: record.breakfast,
    lunch: record.lunch,
    dinner: record.dinner,
    particulars: preset,
    combinedNotation: record.combinedNotation,
  });
}

/**
 * Deterministic mock extraction records for November 2026.
 * Includes high-confidence, unclear, combined-notation, and Sunday zero-count examples.
 */
export const MOCK_NOVEMBER_2026_EXTRACTIONS: HtrExtractedRecord[] = [
  {
    id: "ext_nov2026_01",
    date: "2026-11-01",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
    tea: 0,
    status: "ZERO_COUNT",
    confidence: 0.99,
    notes: "Sunday - Non-operational shift (Zero meals logged)",
    rawText: "01/11 SUN --- --- Sign: --",
  },
  {
    id: "ext_nov2026_02",
    date: "2026-11-02",
    breakfast: 30,
    lunch: 0,
    dinner: 38,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.96,
    notes: "Clear handwriting (Supervisor sign: R.S.)",
    rawText: "02/11 MON 30 38 Sign: R.S. (Snacks: 5, Tea: 10)",
  },
  {
    id: "ext_nov2026_03",
    date: "2026-11-03",
    breakfast: 32,
    lunch: 0,
    dinner: 36,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.95,
    notes: "Clear handwriting (Supervisor sign: R.S.)",
    rawText: "03/11 TUE 32 36 Sign: R.S. (Snacks: 5, Tea: 10)",
  },
  {
    id: "ext_nov2026_04",
    date: "2026-11-04",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    combinedNotation: "65 Breakfast, Dinner",
    status: "COMBINED",
    confidence: 0.88,
    notes: "Combined notation: '65 Breakfast, Dinner' (65 total billable meals, not 130)",
    rawText: "04/11 WED 65 (B+D combined) Sign: R.S.",
  },
  {
    id: "ext_nov2026_05",
    date: "2026-11-05",
    breakfast: 31,
    lunch: 0,
    dinner: 35,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.94,
    notes: "Clear handwriting (Supervisor sign: R.S.)",
    rawText: "05/11 THU 31 35 Sign: R.S. (Snacks: 5, Tea: 10)",
  },
  {
    id: "ext_nov2026_06",
    date: "2026-11-06",
    breakfast: 34,
    lunch: 0,
    dinner: 0,
    snacks: 5,
    tea: 10,
    status: "UNCLEAR",
    confidence: 0.52,
    notes: "Dinner count smudged in original ledger. Please inspect source document to confirm.",
    rawText: "06/11 FRI 34 [smudge?] Sign: R.S. (Snacks: 5, Tea: 10)",
  },
  {
    id: "ext_nov2026_07",
    date: "2026-11-07",
    breakfast: 28,
    lunch: 0,
    dinner: 33,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.95,
    notes: "Clear handwriting (Supervisor sign: R.S.)",
    rawText: "07/11 SAT 28 33 Sign: R.S. (Snacks: 5, Tea: 10)",
  },
  {
    id: "ext_nov2026_08",
    date: "2026-11-08",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
    tea: 0,
    status: "ZERO_COUNT",
    confidence: 0.99,
    notes: "Sunday - Non-operational shift (Zero meals logged)",
    rawText: "08/11 SUN --- --- Sign: --",
  },
  {
    id: "ext_nov2026_09",
    date: "2026-11-09",
    breakfast: 29,
    lunch: 0,
    dinner: 35,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.97,
    notes: "Clear handwriting (Supervisor sign: R.S.)",
    rawText: "09/11 MON 29 35 Sign: R.S. (Snacks: 5, Tea: 10)",
  },
  {
    id: "ext_nov2026_10",
    date: "2026-11-10",
    breakfast: 33,
    lunch: 0,
    dinner: 35,
    snacks: 5,
    tea: 10,
    status: "CONFIDENT",
    confidence: 0.96,
    notes: "Clear handwriting (Supervisor sign: R.S.)",
    rawText: "10/11 TUE 33 35 Sign: R.S. (Snacks: 5, Tea: 10)",
  },
];

/**
 * Generates an SVG string representation of a handwritten company meal register.
 * Provides authentic, self-contained visual reference for one-click testing without external files.
 */
export function generateDemoHandwrittenSvg(monthName: string = "November", year: number = 2026): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="780" viewBox="0 0 600 780" style="background:#fffcf2; font-family:'Courier New', monospace;">
  <rect width="600" height="780" fill="#fdfaf0" stroke="#d5c8a5" stroke-width="2"/>
  <line x1="60" y1="0" x2="60" y2="780" stroke="#e8a8a8" stroke-width="1.5"/>
  <!-- Title -->
  <text x="75" y="45" font-size="16" font-weight="bold" fill="#1b2a4a" font-family="'Comic Sans MS', cursive, sans-serif">HYDAC INDIA PVT LTD - DAILY MEAL COUNT</text>
  <text x="75" y="70" font-size="13" fill="#333" font-family="'Comic Sans MS', cursive, sans-serif">Month: ${monthName} ${year} | Unit: Chettipalayam</text>
  <line x1="75" y1="85" x2="560" y2="85" stroke="#333" stroke-width="1.5"/>
  <!-- Table Header -->
  <text x="80" y="105" font-size="12" font-weight="bold" fill="#000">DATE</text>
  <text x="160" y="105" font-size="12" font-weight="bold" fill="#000">DAY</text>
  <text x="240" y="105" font-size="12" font-weight="bold" fill="#000">BREAKFAST</text>
  <text x="350" y="105" font-size="12" font-weight="bold" fill="#000">DINNER</text>
  <text x="460" y="105" font-size="12" font-weight="bold" fill="#000">SIGN</text>
  <line x1="75" y1="115" x2="560" y2="115" stroke="#777" stroke-dasharray="3,3"/>
  <!-- Rows -->
  <text x="80" y="140" font-size="13" fill="#0b2e63" font-family="cursive">01/11</text><text x="160" y="140" font-size="12" fill="#c0392b">SUN</text><text x="250" y="140" font-size="13" fill="#0b2e63" font-family="cursive">---</text><text x="360" y="140" font-size="13" fill="#0b2e63" font-family="cursive">---</text><text x="470" y="140" font-size="11" fill="#777">--</text>
  <text x="80" y="170" font-size="13" fill="#0b2e63" font-family="cursive">02/11</text><text x="160" y="170" font-size="12" fill="#333">MON</text><text x="250" y="170" font-size="13" fill="#0b2e63" font-family="cursive">30</text><text x="360" y="170" font-size="13" fill="#0b2e63" font-family="cursive">38</text><text x="470" y="170" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="200" font-size="13" fill="#0b2e63" font-family="cursive">03/11</text><text x="160" y="200" font-size="12" fill="#333">TUE</text><text x="250" y="200" font-size="13" fill="#0b2e63" font-family="cursive">32</text><text x="360" y="200" font-size="13" fill="#0b2e63" font-family="cursive">36</text><text x="470" y="200" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="230" font-size="13" fill="#0b2e63" font-family="cursive">04/11</text><text x="160" y="230" font-size="12" fill="#333">WED</text><text x="250" y="230" font-size="13" fill="#563d7c" font-weight="bold">65 (B+D)</text><text x="360" y="230" font-size="13" fill="#563d7c">--</text><text x="470" y="230" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="260" font-size="13" fill="#0b2e63" font-family="cursive">05/11</text><text x="160" y="260" font-size="12" fill="#333">THU</text><text x="250" y="260" font-size="13" fill="#0b2e63" font-family="cursive">31</text><text x="360" y="260" font-size="13" fill="#0b2e63" font-family="cursive">35</text><text x="470" y="260" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="290" font-size="13" fill="#0b2e63" font-family="cursive">06/11</text><text x="160" y="290" font-size="12" fill="#333">FRI</text><text x="250" y="290" font-size="13" fill="#0b2e63" font-family="cursive">34</text><text x="355" y="290" font-size="13" fill="#c0392b" font-weight="bold">[smudged]</text><text x="470" y="290" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="320" font-size="13" fill="#0b2e63" font-family="cursive">07/11</text><text x="160" y="320" font-size="12" fill="#333">SAT</text><text x="250" y="320" font-size="13" fill="#0b2e63" font-family="cursive">28</text><text x="360" y="320" font-size="13" fill="#0b2e63" font-family="cursive">33</text><text x="470" y="320" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="350" font-size="13" fill="#0b2e63" font-family="cursive">08/11</text><text x="160" y="350" font-size="12" fill="#c0392b">SUN</text><text x="250" y="350" font-size="13" fill="#0b2e63" font-family="cursive">---</text><text x="360" y="350" font-size="13" fill="#0b2e63" font-family="cursive">---</text><text x="470" y="350" font-size="11" fill="#777">--</text>
  <text x="80" y="380" font-size="13" fill="#0b2e63" font-family="cursive">09/11</text><text x="160" y="380" font-size="12" fill="#333">MON</text><text x="250" y="380" font-size="13" fill="#0b2e63" font-family="cursive">29</text><text x="360" y="380" font-size="13" fill="#0b2e63" font-family="cursive">35</text><text x="470" y="380" font-size="11" fill="#555">R.S.</text>
  <text x="80" y="410" font-size="13" fill="#0b2e63" font-family="cursive">10/11</text><text x="160" y="410" font-size="12" fill="#333">TUE</text><text x="250" y="410" font-size="13" fill="#0b2e63" font-family="cursive">33</text><text x="360" y="410" font-size="13" fill="#0b2e63" font-family="cursive">35</text><text x="470" y="410" font-size="11" fill="#555">R.S.</text>
  <!-- Supervisor Note Box -->
  <rect x="75" y="460" width="480" height="95" fill="#f7f1dd" stroke="#c7a45b" stroke-dasharray="4,4"/>
  <text x="90" y="490" font-size="12" font-weight="bold" fill="#123c2c">VERIFIED BY HYDAC ADMIN SUPERVISOR</text>
  <text x="90" y="515" font-size="11" fill="#555">Contract Mode: Breakfast &amp; Dinner | Contract Rate: ₹70.00 / meal</text>
  <text x="90" y="535" font-size="11" fill="#555">Snacks (5) &amp; Tea (10) tallied for audit; excluded from billable quantities.</text>
</svg>`;
}

/**
 * Computes statistical summaries from a list of extracted records.
 */
export function computeExtractionStats(records: HtrExtractedRecord[]): ExtractionStats {
  let confidentCount = 0;
  let unclearCount = 0;
  let combinedCount = 0;
  let zeroCount = 0;
  let editedCount = 0;

  for (const record of records) {
    if (record.isManuallyEdited || record.status === "MANUALLY_EDITED") {
      editedCount++;
    }
    if (record.status === "ZERO_COUNT") {
      zeroCount++;
    } else if (record.status === "COMBINED" || Boolean(record.combinedNotation)) {
      combinedCount++;
    } else if (record.status === "UNCLEAR" || record.confidence < 0.7) {
      unclearCount++;
    } else if (record.status === "CONFIDENT" || record.confidence >= 0.9) {
      confidentCount++;
    }
  }

  return {
    totalRecords: records.length,
    confidentCount,
    unclearCount,
    combinedCount,
    zeroCount,
    editedCount,
  };
}

/**
 * Safely merges two extracted daily records for the same date.
 * Handles:
 * 1. Combined + combined: sums combined quantities (e.g. 65 + 20 = 85)
 * 2. Combined + individual: preserves both contributions without double counting (e.g. 65 combined + 25 shift meals = 90 total)
 * 3. Individual + individual: sums shift quantities directly
 * 4. Audit-only snacks and tea are summed and kept distinct from meal totals.
 */
export function mergeTwoExtractedRecords(
  recA: HtrExtractedRecord,
  recB: HtrExtractedRecord
): HtrExtractedRecord {
  const cA = extractCombinedQuantity(recA.combinedNotation);
  const cB = extractCombinedQuantity(recB.combinedNotation);

  const mergedBreakfast = recA.breakfast + recB.breakfast;
  const mergedLunch = recA.lunch + recB.lunch;
  const mergedDinner = recA.dinner + recB.dinner;
  let mergedNotation: string | undefined = undefined;
  let mergedStatus: HtrRecordStatus = "MANUALLY_EDITED";

  if (cA !== null && cB !== null) {
    // Both records have combined notation (e.g. 65 + 20 = 85)
    const combinedTotal = cA + cB;
    mergedNotation = `${combinedTotal} Breakfast, Dinner (Merged: ${cA} + ${cB})`;
    mergedStatus = "COMBINED";
  } else if (cA !== null && cB === null) {
    // recA has combined notation, recB has individual shift meals
    const shiftMeals = recB.breakfast + recB.lunch + recB.dinner;
    if (shiftMeals > 0) {
      const combinedTotal = cA + shiftMeals;
      mergedNotation = `${combinedTotal} Breakfast, Dinner (Merged: ${cA} combined + ${shiftMeals} shift meals)`;
      mergedStatus = "COMBINED";
    } else {
      mergedNotation = recA.combinedNotation;
      mergedStatus = "COMBINED";
    }
  } else if (cA === null && cB !== null) {
    // recA has individual shift meals, recB has combined notation
    const shiftMeals = recA.breakfast + recA.lunch + recA.dinner;
    if (shiftMeals > 0) {
      const combinedTotal = cB + shiftMeals;
      mergedNotation = `${combinedTotal} Breakfast, Dinner (Merged: ${cB} combined + ${shiftMeals} shift meals)`;
      mergedStatus = "COMBINED";
    } else {
      mergedNotation = recB.combinedNotation;
      mergedStatus = "COMBINED";
    }
  } else {
    // Neither has combined notation (both individual shift counts)
    mergedNotation = undefined;
    mergedStatus = "MANUALLY_EDITED";
  }

  // Audit-only pantry tallies (never part of meal billing)
  const mergedSnacks = recA.snacks + recB.snacks;
  const mergedTea = recA.tea + recB.tea;

  // Deduplicate and combine notes
  let mergedNotes = recA.notes;
  if (recB.notes && recB.notes !== recA.notes) {
    mergedNotes = mergedNotes ? `${mergedNotes} | Merged shift entry: ${recB.notes}` : recB.notes;
  }

  // Combine raw text
  let mergedRaw = recA.rawText || "";
  if (recB.rawText && recB.rawText !== recA.rawText) {
    mergedRaw = mergedRaw ? `${mergedRaw} | ${recB.rawText}` : recB.rawText;
  }

  return {
    id: recA.id,
    date: recA.date,
    breakfast: mergedBreakfast,
    lunch: mergedLunch,
    dinner: mergedDinner,
    snacks: mergedSnacks,
    tea: mergedTea,
    status: mergedStatus,
    confidence: Math.min(recA.confidence, recB.confidence),
    notes: mergedNotes,
    combinedNotation: mergedNotation,
    isManuallyEdited: true,
    rawText: mergedRaw,
  };
}

/**
 * Detects duplicate date records and returns a merged list summing quantities for identical dates.
 */
export function mergeDuplicateExtractedRecords(records: HtrExtractedRecord[]): {
  mergedRecords: HtrExtractedRecord[];
  mergedDates: string[];
} {
  const dateCounts: Record<string, number> = {};
  for (const rec of records) {
    dateCounts[rec.date] = (dateCounts[rec.date] || 0) + 1;
  }

  const duplicateDates = Object.keys(dateCounts).filter((d) => dateCounts[d] > 1);
  if (duplicateDates.length === 0) {
    return { mergedRecords: records, mergedDates: [] };
  }

  const mergedMap: Record<string, HtrExtractedRecord> = {};
  for (const rec of records) {
    if (!mergedMap[rec.date]) {
      mergedMap[rec.date] = { ...rec };
    } else {
      mergedMap[rec.date] = mergeTwoExtractedRecords(mergedMap[rec.date], rec);
    }
  }

  return {
    mergedRecords: Object.values(mergedMap),
    mergedDates: duplicateDates,
  };
}

/**
 * Helper to identify whether a DailyBillingEntry represents an actively populated entry
 * or an unpopulated / default empty calendar row.
 */
export function isPopulatedCalendarEntry(entry: DailyBillingEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.isSunday) {
    // Normal Sundays are non-operational with 0 meals.
    // Considered populated only if overtime shift meals are logged:
    return entry.breakfast > 0 || entry.lunch > 0 || entry.dinner > 0;
  }
  return (
    entry.breakfast > 0 ||
    entry.lunch > 0 ||
    entry.dinner > 0 ||
    Boolean(entry.combinedNotation)
  );
}

/**
 * Compares an array of extracted records against the current calendar's existing DailyBillingEntry[]
 * to generate a structured reconciliation diff with clear action recommendations.
 * 
 * Classifications:
 * - NEW: Extracted record exists, but no corresponding populated billing entry exists.
 * - MATCHING: Both sides have records and quantities match exactly.
 * - CONFLICT: Both sides have records but quantities differ.
 * - DUPLICATE: Multiple extracted records resolve to the same date (requires operator decision).
 * - MISSING: Calendar has a populated entry, but extraction has no record for that date.
 */
export function buildReconciliationDiff(
  extractedRecords: HtrExtractedRecord[],
  existingEntries: DailyBillingEntry[] = []
): {
  diffRows: ReconciliationComparisonRow[];
  summary: ReconciliationSummary;
} {
  // 1. Group extracted records by date
  const extractedByDate = new Map<string, HtrExtractedRecord[]>();
  for (const rec of extractedRecords) {
    const list = extractedByDate.get(rec.date) || [];
    list.push(rec);
    extractedByDate.set(rec.date, list);
  }

  // 2. Map existing entries by date
  const existingMap = new Map<string, DailyBillingEntry>();
  for (const entry of existingEntries) {
    existingMap.set(entry.dateString, entry);
  }

  // 3. Collect all unique dates across both sets
  const allDateKeys = new Set<string>();
  for (const d of extractedByDate.keys()) allDateKeys.add(d);
  for (const d of existingMap.keys()) {
    if (isPopulatedCalendarEntry(existingMap.get(d))) {
      allDateKeys.add(d);
    }
  }

  // Sort dates chronologically
  const sortedDates = Array.from(allDateKeys).sort();

  let newCount = 0;
  let matchingCount = 0;
  let conflictCount = 0;
  let duplicateCount = 0;
  let missingCount = 0;
  let pendingDecisionCount = 0;
  const duplicateDatesList: string[] = [];

  const diffRows: ReconciliationComparisonRow[] = [];

  for (const date of sortedDates) {
    const recs = extractedByDate.get(date) || [];
    const existing = existingMap.get(date);
    const hasExistingData = isPopulatedCalendarEntry(existing);

    const parts = date.split("-");
    const dayNumber = parseInt(parts[2], 10) || 1;
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, dayNumber);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[dateObj.getDay()] || "Weekday";
    const isSunday = dateObj.getDay() === 0;

    let classification: ReconciliationClassification = "NEW";
    let decision: ReconciliationDecision = "PENDING";
    let discrepancyReason = "";
    let extractedRecord: HtrExtractedRecord | undefined = undefined;
    let duplicateRecords: HtrExtractedRecord[] | undefined = undefined;
    let action: ReconciliationRowAction = "ADD";
    let isConflict = false;

    // Case A: DUPLICATE (Multiple extracted records for this date)
    if (recs.length > 1) {
      classification = "DUPLICATE";
      duplicateRecords = recs;
      extractedRecord = recs[0]; // primary reference
      duplicateCount++;
      duplicateDatesList.push(date);
      pendingDecisionCount++;
      isConflict = true;
      action = "UPDATE";
      decision = "PENDING";
      discrepancyReason = `Found ${recs.length} separate handwritten logs for ${date}. Operator review required before merging.`;
    }
    // Case B: Extracted record exists (single)
    else if (recs.length === 1) {
      extractedRecord = recs[0];

      if (!existing || !hasExistingData) {
        classification = "NEW";
        newCount++;
        action = "ADD";
        decision = "ACCEPT_EXTRACTED";
        discrepancyReason = existing
          ? "Calendar date currently has 0 meals logged"
          : "Date not present in existing billing calendar";
      } else {
        // Both sides populated: compare values
        const isQtyDifferent =
          existing.breakfast !== extractedRecord.breakfast ||
          existing.lunch !== extractedRecord.lunch ||
          existing.dinner !== extractedRecord.dinner ||
          (existing.combinedNotation || "") !== (extractedRecord.combinedNotation || "");

        if (isQtyDifferent) {
          classification = "CONFLICT";
          conflictCount++;
          pendingDecisionCount++;
          isConflict = true;
          action = "UPDATE";
          decision = "PENDING";
          discrepancyReason = `Discrepancy: Extracted (B:${extractedRecord.breakfast}, L:${extractedRecord.lunch}, D:${extractedRecord.dinner}${
            extractedRecord.combinedNotation ? ` [${extractedRecord.combinedNotation}]` : ""
          }) vs Calendar (B:${existing.breakfast}, L:${existing.lunch}, D:${existing.dinner}${
            existing.combinedNotation ? ` [${existing.combinedNotation}]` : ""
          })`;
        } else {
          classification = "MATCHING";
          matchingCount++;
          action = "NO_CHANGE";
          decision = "KEEP_EXISTING";
          discrepancyReason = "Quantities match existing calendar entry exactly";
        }
      }
    }
    // Case C: MISSING from extraction (Calendar has populated entry, but extraction has no record)
    else {
      classification = "MISSING";
      missingCount++;
      pendingDecisionCount++;
      action = "SKIP";
      decision = "KEEP_EXISTING";
      discrepancyReason = `Calendar has logged shift meals (B:${existing?.breakfast || 0}, D:${existing?.dinner || 0}), but no entry was found on the uploaded slip`;
    }

    // Bill Quantities evaluated through central billing engine
    const extractedBillQty = extractedRecord
      ? calculateRowBillQty({
          breakfast: extractedRecord.breakfast,
          lunch: extractedRecord.lunch,
          dinner: extractedRecord.dinner,
          particulars: "BREAKFAST & DINNER",
          combinedNotation: extractedRecord.combinedNotation,
        })
      : 0;

    const existingBillQty = existing
      ? calculateRowBillQty(existing)
      : 0;

    const diffQty = extractedBillQty - existingBillQty;

    diffRows.push({
      id: `row_recon_${date}`,
      date,
      dayNumber,
      dayName,
      isSunday,
      classification,
      extractedRecord,
      duplicateRecords,
      existingEntry: existing,
      hasExistingData,
      extractedBillQty,
      existingBillQty,
      diffQty,
      discrepancyReason,
      decision,
      action,
      isConflict,
      conflictReason: isConflict ? discrepancyReason : undefined,
    });
  }

  const summary: ReconciliationSummary = {
    totalCalendarDays: existingEntries.length,
    totalExtractedRecords: extractedRecords.length,
    newCount,
    matchingCount,
    conflictCount,
    duplicateCount,
    missingCount,
    pendingDecisionCount,
    // Backwards compatibility:
    totalExtracted: extractedRecords.length,
    newDatesToAdd: newCount,
    datesToUpdate: conflictCount + duplicateCount,
    datesWithConflicts: conflictCount,
    datesUnchanged: matchingCount,
    duplicateDates: duplicateDatesList,
  };

  return { diffRows, summary };
}

/**
 * Provider-Neutral Mock Extraction Service
 *
 * Implements IExtractionService with simulated network latency and deterministic demo data.
 * Adheres strictly to the architectural boundary:
 * - Completely decouples UI components from backend vision providers.
 * - Allows future Gemini Multimodal / Document AI services to plug in seamlessly.
 */
export class MockExtractionService implements IExtractionService {
  private simulatedDelayMs: number;

  constructor(simulatedDelayMs: number = 950) {
    this.simulatedDelayMs = simulatedDelayMs;
  }

  async extractLedger(payload: ExtractionPayload): Promise<ExtractionServiceResponse> {
    // 1. Simulate network/OCR processing latency
    await new Promise((resolve) => setTimeout(resolve, this.simulatedDelayMs));

    // 2. Resolve document metadata safely
    let fileName = "handwritten_catering_ledger.jpg";
    let fileSize = 1245000;
    let fileType: ExtractionDocumentMeta["fileType"] = "IMAGE";
    let mimeType = "image/jpeg";
    let fileUrl: string | undefined = undefined;

    if (payload.document instanceof File) {
      fileName = payload.document.name;
      fileSize = payload.document.size;
      mimeType = payload.document.type || "image/jpeg";
      if (payload.document.type === "application/pdf") {
        fileType = "PDF";
      } else {
        fileType = "IMAGE";
      }
      try {
        fileUrl = URL.createObjectURL(payload.document);
      } catch {
        // Fallback if URL.createObjectURL is unavailable in test environment
        fileUrl = undefined;
      }
    } else if (payload.document && typeof payload.document === "object") {
      fileName = payload.document.name || "sample_hydac_meal_ledger_nov2026.svg";
      fileSize = 4280;
      fileType = "DEMO_SVG";
      mimeType = "image/svg+xml";
      fileUrl = payload.document.dataUrl;
    }

    const meta: ExtractionDocumentMeta = {
      fileName,
      fileSize,
      fileType,
      mimeType,
      fileUrl,
      uploadedAt: new Date().toISOString(),
    };

    // 3. Return deterministic records for target month/year (defaults to November 2026)
    const records = MOCK_NOVEMBER_2026_EXTRACTIONS.map((rec) => ({ ...rec }));
    const stats = computeExtractionStats(records);

    return {
      success: true,
      records,
      meta,
      stats,
      engineName: "Mock Document Vision Engine (Phase 3C Demo)",
      isMock: true,
      warnings: [
        "SIMULATED DEMO EXTRACTION: No external AI or cloud OCR services were invoked.",
        "These records demonstrate the human-in-the-loop review, unclear field flagging, and reconciliation workflow.",
      ],
    };
  }
}

/**
 * Singleton instance of the mock extraction service ready for injection.
 */
export const mockExtractionService = new MockExtractionService();
