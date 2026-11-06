import type { CorporateCustomer } from "./admin";

export interface DailyBillingEntry {
  id: string;
  dayNumber: number;
  dateString: string;
  dayName: string;
  isSunday: boolean;
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks?: number;
  tea?: number;
  particulars: string;
  isManualParticulars: boolean;
  remarks: string;
  billQty: number;
  combinedNotation?: string;
}

export interface CustomerPreset {
  id: string;
  name: string;
  address: string;
  gst: string;
  pan: string;
  location: string;
}

export interface InvoiceMetaData {
  billNo: string;
  month: number;
  year: number;
  invoiceDate: string;
  startDate: string;
  endDate: string;
  unit: string;
  rate: number;
  declaration: string;
}

export type HtrRecordStatus =
  | "CONFIDENT"
  | "UNCLEAR"
  | "ZERO_COUNT"
  | "COMBINED"
  | "MANUALLY_EDITED";

export interface HtrExtractedRecord {
  id: string;
  date: string; // ISO format: YYYY-MM-DD
  breakfast: number;
  lunch: number;
  dinner: number;
  snacks: number;
  tea: number;
  status: HtrRecordStatus;
  confidence: number; // 0.0 to 1.0
  notes: string;
  combinedNotation?: string; // Standardized camelCase notation across domain models
  isManuallyEdited?: boolean;
  rawText?: string;
}

export type ExtractionDocumentType = "IMAGE" | "PDF" | "DEMO_SVG";

export interface ExtractionDocumentMeta {
  fileName: string;
  fileSize: number; // In bytes
  fileType: ExtractionDocumentType;
  mimeType: string;
  fileUrl?: string; // Preview URL (Blob, data URI, or object URL)
  uploadedAt: string; // ISO timestamp
}

export interface ExtractionPayload {
  document: File | { type: "DEMO_SVG"; name?: string; content?: string; dataUrl?: string };
  month: number; // 0-indexed: 0 = January, 10 = November
  year: number; // e.g. 2026
  customerShortCode?: string;
}

export interface ExtractionStats {
  totalRecords: number;
  confidentCount: number;
  unclearCount: number;
  combinedCount: number;
  zeroCount: number;
  editedCount?: number;
}

export interface ExtractionServiceResponse {
  success: boolean;
  records: HtrExtractedRecord[];
  meta: ExtractionDocumentMeta;
  stats: ExtractionStats;
  engineName: string;
  isMock: boolean;
  warnings?: string[];
  errorMessage?: string;
}

export interface IExtractionService {
  extractLedger(payload: ExtractionPayload): Promise<ExtractionServiceResponse>;
}

export type ReconciliationRowAction = "ADD" | "UPDATE" | "NO_CHANGE" | "SKIP";

export type ReconciliationClassification =
  | "NEW"
  | "MATCHING"
  | "CONFLICT"
  | "DUPLICATE"
  | "MISSING";

export type ReconciliationDecision =
  | "PENDING"
  | "ACCEPT_EXTRACTED"
  | "KEEP_EXISTING"
  | "USE_MERGED"
  | "SKIP";

export interface ReconciliationComparisonRow {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  dayNumber: number;
  dayName: string;
  isSunday: boolean;
  classification: ReconciliationClassification;
  extractedRecord?: HtrExtractedRecord;
  duplicateRecords?: HtrExtractedRecord[];
  existingEntry?: DailyBillingEntry;
  hasExistingData: boolean;
  extractedBillQty: number;
  existingBillQty: number;
  diffQty: number;
  discrepancyReason?: string;
  decision: ReconciliationDecision;
  action?: ReconciliationRowAction;
  isConflict?: boolean;
  conflictReason?: string;
}

export interface ReconciliationSummary {
  totalCalendarDays: number;
  totalExtractedRecords: number;
  newCount: number;
  matchingCount: number;
  conflictCount: number;
  duplicateCount: number;
  missingCount: number;
  pendingDecisionCount: number;
  totalExtracted?: number;
  newDatesToAdd?: number;
  datesToUpdate?: number;
  datesWithConflicts?: number;
  datesUnchanged?: number;
  duplicateDates?: string[];
}

export type BillingRateSource = "CUSTOMER_DEFAULT" | "DEMO_SAMPLE" | "CUSTOM";

export interface BillingKpiSummary {
  totalDays: number;
  totalSundays: number;
  totalBillQty: number;
  rate: number;
  rateSource?: BillingRateSource;
  totalAmount: number;
  amountInWords: string;
}

export type AppliedRosterOperation = "ADD" | "REPLACE" | "RETAIN" | "MERGE" | "SKIP";

export interface FinalApprovalSummaryMetrics {
  totalDatesEvaluated: number;
  newApprovedCount: number;
  existingRetainedCount: number;
  conflictsAcceptedCount: number;
  duplicatesResolvedCount: number;
  recordsMergedCount: number;
  recordsSkippedCount: number;
  unresolvedCount: number;
}

export interface BeforeAfterPreviewRow {
  date: string;
  dayNumber: number;
  dayName: string;
  isSunday: boolean;
  existingMeals: {
    breakfast: number;
    lunch: number;
    dinner: number;
    combinedNotation?: string;
  };
  proposedMeals: {
    breakfast: number;
    lunch: number;
    dinner: number;
    combinedNotation?: string;
  };
  existingBillQty: number;
  proposedBillQty: number;
  varianceQty: number;
  decision: ReconciliationDecision;
  operation: AppliedRosterOperation;
  notes?: string;
}

export interface BillingSessionStagingPayload {
  customerId: string;
  month: number;
  year: number;
  rate: number;
  rateSource: BillingRateSource;
  unitLocation: string;
  billNo: string;
  startDate: string;
  endDate: string;
  invoiceDate: string;
  activePreset: "BREAKFAST & DINNER" | "LUNCH";
  dailyEntries: DailyBillingEntry[];
  priorEntriesSnapshot: DailyBillingEntry[];
  auditMeta: {
    appliedAt: string;
    totalUpdated: number;
    totalRetained: number;
    totalMerged: number;
    totalSkipped: number;
    sourceDocument: string;
  };
}

/**
 * Invoice Archive Status
 * Consistent uppercase enum union values
 */
export type InvoiceArchiveStatus = "PAID" | "PENDING" | "GENERATED";

/**
 * Archived Invoice Snapshot
 * Immutable historical record containing customer details, daily line items,
 * and reconciled KPI financial rollups.
 */
export interface ArchivedInvoice {
  id: string;
  billNo: string;
  customer: CorporateCustomer;
  month: string;
  year: number;
  startDate: string;
  endDate: string;
  invoiceDate: string;
  unitLocation: string;
  rate: number;
  rateSource: BillingRateSource;
  kpis: BillingKpiSummary;
  entries: DailyBillingEntry[];
  status: InvoiceArchiveStatus;
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
}

