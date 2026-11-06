import type {
  DailyBillingEntry,
  ReconciliationComparisonRow,
  FinalApprovalSummaryMetrics,
  BeforeAfterPreviewRow,
  AppliedRosterOperation,
  BillingSessionStagingPayload,
  BillingKpiSummary,
  BillingRateSource,
} from "@/types/billing";
import {
  calculateRowBillQty,
  calculateBillingKpis,
} from "@/lib/utils/billing-calculations";

const SESSION_STORAGE_KEY = "bcs_staged_session_v1";

// In-memory runtime fallback for same-page operations or environments where sessionStorage is restricted
let inMemoryStagedPayload: BillingSessionStagingPayload | null = null;

/**
 * Derives dynamic summary metrics from active reconciliation rows.
 * Strictly calculated from user decisions - never hardcoded.
 */
export function computeFinalApprovalMetrics(
  rows: ReconciliationComparisonRow[]
): FinalApprovalSummaryMetrics {
  let newApprovedCount = 0;
  let existingRetainedCount = 0;
  let conflictsAcceptedCount = 0;
  let duplicatesResolvedCount = 0;
  let recordsMergedCount = 0;
  let recordsSkippedCount = 0;
  let unresolvedCount = 0;

  for (const r of rows) {
    if (r.decision === "PENDING") {
      unresolvedCount++;
    }

    if (r.decision === "KEEP_EXISTING") {
      existingRetainedCount++;
    } else if (r.decision === "ACCEPT_EXTRACTED") {
      if (r.classification === "NEW") {
        newApprovedCount++;
      } else if (r.classification === "CONFLICT") {
        conflictsAcceptedCount++;
      }
    } else if (r.decision === "USE_MERGED") {
      recordsMergedCount++;
      duplicatesResolvedCount++;
    } else if (r.decision === "SKIP") {
      recordsSkippedCount++;
    }

    if (r.classification === "DUPLICATE" && r.decision !== "PENDING" && r.decision !== "USE_MERGED") {
      duplicatesResolvedCount++;
    }
  }

  return {
    totalDatesEvaluated: rows.length,
    newApprovedCount,
    existingRetainedCount,
    conflictsAcceptedCount,
    duplicatesResolvedCount,
    recordsMergedCount,
    recordsSkippedCount,
    unresolvedCount,
  };
}

/**
 * Builds a before-and-after comparison preview for every evaluated date.
 */
export function buildBeforeAfterPreview(
  rows: ReconciliationComparisonRow[]
): BeforeAfterPreviewRow[] {
  return rows.map((row) => {
    const existing = row.existingEntry;
    const ext = row.extractedRecord;

    const existingMeals = {
      breakfast: existing ? existing.breakfast : 0,
      lunch: existing ? existing.lunch : 0,
      dinner: existing ? existing.dinner : 0,
      combinedNotation: existing?.combinedNotation,
    };

    let proposedMeals = { ...existingMeals };
    let proposedBillQty = row.existingBillQty;
    let operation: AppliedRosterOperation = "RETAIN";

    if (row.decision === "SKIP") {
      operation = "SKIP";
      // If skipped, existing values are retained or new dates are omitted
      proposedMeals = { ...existingMeals };
      proposedBillQty = existing ? row.existingBillQty : 0;
    } else if (row.decision === "KEEP_EXISTING") {
      operation = "RETAIN";
      proposedMeals = { ...existingMeals };
      proposedBillQty = row.existingBillQty;
    } else if (row.decision === "USE_MERGED" && ext) {
      operation = "MERGE";
      proposedMeals = {
        breakfast: ext.breakfast,
        lunch: ext.lunch,
        dinner: ext.dinner,
        combinedNotation: ext.combinedNotation,
      };
      proposedBillQty = row.extractedBillQty;
    } else if (row.decision === "ACCEPT_EXTRACTED" && ext) {
      operation = row.classification === "NEW" ? "ADD" : "REPLACE";
      proposedMeals = {
        breakfast: ext.breakfast,
        lunch: ext.lunch,
        dinner: ext.dinner,
        combinedNotation: ext.combinedNotation,
      };
      proposedBillQty = row.extractedBillQty;
    }

    const varianceQty = proposedBillQty - row.existingBillQty;

    return {
      date: row.date,
      dayNumber: row.dayNumber,
      dayName: row.dayName,
      isSunday: row.isSunday,
      existingMeals,
      proposedMeals,
      existingBillQty: row.existingBillQty,
      proposedBillQty,
      varianceQty,
      decision: row.decision,
      operation,
      notes: ext?.notes || row.discrepancyReason,
    };
  });
}

/**
 * Safely applies approved reconciliation decisions into the calendar entries.
 *
 * Rules:
 * - KEEP_EXISTING: Preserves existing DailyBillingEntry unchanged.
 * - ACCEPT_EXTRACTED: Updates with extracted meal quantities, notes, and combinedNotation.
 * - USE_MERGED: Updates with resolved duplicate/merged entry.
 * - SKIP: Leaves calendar unchanged (or omits new date).
 * - Never modifies unrelated dates.
 * - Single calculation engine: Recomputes billQty via calculateRowBillQty().
 */
export function applyReconciliationDecisions(
  reconciliationRows: ReconciliationComparisonRow[],
  existingCalendar: DailyBillingEntry[],
  rate: number = 48.0,
  rateSource: BillingRateSource = "CUSTOMER_DEFAULT"
): {
  updatedCalendar: DailyBillingEntry[];
  beforeAfterRows: BeforeAfterPreviewRow[];
  metrics: FinalApprovalSummaryMetrics;
  updatedKpis: BillingKpiSummary;
} {
  const metrics = computeFinalApprovalMetrics(reconciliationRows);
  const beforeAfterRows = buildBeforeAfterPreview(reconciliationRows);

  const rowDecisionMap = new Map<string, ReconciliationComparisonRow>();
  for (const r of reconciliationRows) {
    rowDecisionMap.set(r.date, r);
  }

  // Update existing calendar entries
  const updatedCalendar: DailyBillingEntry[] = existingCalendar.map((entry) => {
    const reconRow = rowDecisionMap.get(entry.dateString);
    if (!reconRow) {
      // Unrelated date not present in reconciliation set - preserve exactly
      return entry;
    }

    // Process based on decision
    if (reconRow.decision === "ACCEPT_EXTRACTED" || reconRow.decision === "USE_MERGED") {
      const ext = reconRow.extractedRecord;
      if (!ext) return entry;

      const updatedRow: DailyBillingEntry = {
        ...entry,
        breakfast: ext.breakfast,
        lunch: ext.lunch,
        dinner: ext.dinner,
        snacks: ext.snacks,
        tea: ext.tea,
        combinedNotation: ext.combinedNotation,
        remarks: ext.notes
          ? entry.remarks
            ? `${entry.remarks} | ${ext.notes}`
            : ext.notes
          : entry.remarks,
        billQty: 0,
      };

      updatedRow.billQty = calculateRowBillQty(updatedRow);
      return updatedRow;
    }

    // For KEEP_EXISTING or SKIP: preserve entry as-is
    return entry;
  });

  // Check for any NEW date that was not in existingCalendar
  const existingDateSet = new Set(existingCalendar.map((e) => e.dateString));
  for (const reconRow of reconciliationRows) {
    if (
      reconRow.classification === "NEW" &&
      reconRow.decision === "ACCEPT_EXTRACTED" &&
      !existingDateSet.has(reconRow.date) &&
      reconRow.extractedRecord
    ) {
      const ext = reconRow.extractedRecord;
      const parts = reconRow.date.split("-");
      const dayNumber = parseInt(parts[2], 10) || 1;

      const newEntry: DailyBillingEntry = {
        id: `row_reconciled_${reconRow.date}`,
        dayNumber,
        dateString: reconRow.date,
        dayName: reconRow.dayName,
        isSunday: reconRow.isSunday,
        breakfast: ext.breakfast,
        lunch: ext.lunch,
        dinner: ext.dinner,
        snacks: ext.snacks,
        tea: ext.tea,
        particulars: reconRow.isSunday ? "SUNDAY" : "BREAKFAST & DINNER",
        isManualParticulars: false,
        remarks: ext.notes || "Added from handwritten slip",
        combinedNotation: ext.combinedNotation,
        billQty: 0,
      };

      newEntry.billQty = calculateRowBillQty(newEntry);
      updatedCalendar.push(newEntry);
    }
  }

  // Ensure calendar is sorted chronologically
  updatedCalendar.sort((a, b) => a.dateString.localeCompare(b.dateString));

  // Recompute KPIs through the central calculation engine
  const updatedKpis = calculateBillingKpis(updatedCalendar, rate, rateSource);

  return {
    updatedCalendar,
    beforeAfterRows,
    metrics,
    updatedKpis,
  };
}

/**
 * Stages the reconciled billing session into browser session memory.
 * Never touches localStorage (strictly for in-session state transfer).
 */
export function stageReconciledSession(payload: BillingSessionStagingPayload): void {
  inMemoryStagedPayload = payload;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch (err) {
    console.warn("Could not stage billing session to sessionStorage:", err);
  }
}

/**
 * Retrieves the currently staged billing session if present.
 */
export function getStagedSession(): BillingSessionStagingPayload | null {
  if (inMemoryStagedPayload) {
    return inMemoryStagedPayload;
  }
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const data = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as BillingSessionStagingPayload;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve staged billing session:", err);
  }
  return null;
}

/**
 * Clears any staged billing session.
 */
export function clearStagedSession(): void {
  inMemoryStagedPayload = null;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Checks if a staged session is pending consumption.
 */
export function hasStagedSession(): boolean {
  return getStagedSession() !== null;
}
