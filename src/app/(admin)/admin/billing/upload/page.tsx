"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ScanLine,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  GitCompare,
  Database,
  Layers,
  Settings2,
} from "lucide-react";
import { LedgerUploadZone } from "@/components/admin/billing/upload/ledger-upload-zone";
import { DocumentPreviewPanel } from "@/components/admin/billing/upload/document-preview-panel";
import { ExtractionReviewTable } from "@/components/admin/billing/upload/extraction-review-table";
import { ReconciliationTable } from "@/components/admin/billing/upload/reconciliation-table";
import { FinalApprovalCard } from "@/components/admin/billing/upload/final-approval-card";
import {
  mockExtractionService,
  generateDemoHandwrittenSvg,
  computeExtractionStats,
  buildReconciliationDiff,
} from "@/lib/services/extraction-service";
import {
  applyReconciliationDecisions,
  stageReconciledSession,
  clearStagedSession,
} from "@/lib/services/billing-session-store";
import {
  generateSampleBillingData,
  calculateRowBillQty,
} from "@/lib/utils/billing-calculations";
import type {
  ExtractionDocumentMeta,
  ExtractionServiceResponse,
  HtrExtractedRecord,
  ReconciliationComparisonRow,
  ReconciliationDecision,
  ReconciliationClassification,
  ReconciliationSummary,
  DailyBillingEntry,
  BillingKpiSummary,
} from "@/types/billing";

type CalendarSourceMode = "SAMPLE_ROSTER" | "SAVED_DRAFT" | "EMPTY";

export default function LedgerUploadPage() {
  const [fileMeta, setFileMeta] = useState<ExtractionDocumentMeta | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [extractionResponse, setExtractionResponse] =
    useState<ExtractionServiceResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reconciliation State
  const [showReconciliation, setShowReconciliation] = useState(false);
  const [calendarSource, setCalendarSource] =
    useState<CalendarSourceMode>("SAMPLE_ROSTER");
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftCount, setSavedDraftCount] = useState(0);
  const [includeTestDuplicate, setIncludeTestDuplicate] = useState(false);

  const [reconciliationRows, setReconciliationRows] = useState<
    ReconciliationComparisonRow[]
  >([]);
  const [reconciliationSummary, setReconciliationSummary] =
    useState<ReconciliationSummary | null>(null);

  // Step 3C: Final Applied State
  const [isApplied, setIsApplied] = useState(false);
  const [appliedKpis, setAppliedKpis] = useState<BillingKpiSummary | null>(null);
  const [appliedCalendar, setAppliedCalendar] = useState<DailyBillingEntry[]>([]);

  // Safely manage and revoke temporary object URLs to prevent memory leaks
  const activeObjectUrlRef = useRef<string | null>(null);

  const safelyRevokeObjectUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(activeObjectUrlRef.current);
      } catch {
        // Ignore errors if already revoked
      }
      activeObjectUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      safelyRevokeObjectUrl();
    };
  }, [safelyRevokeObjectUrl]);

  // Inspect localStorage for existing billing draft on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bcs_billing_draft_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.dailyEntries) &&
          parsed.dailyEntries.length > 0
        ) {
          setHasSavedDraft(true);
          setSavedDraftCount(parsed.dailyEntries.length);
          setCalendarSource("SAVED_DRAFT");
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Handle User File Selection (JPG, PNG, PDF)
  const handleFileSelect = (file: File) => {
    safelyRevokeObjectUrl();
    setErrorMessage(null);
    setExtractionResponse(null);
    setShowReconciliation(false);
    setReconciliationRows([]);
    setReconciliationSummary(null);
    setIsApplied(false);
    setAppliedKpis(null);
    setAppliedCalendar([]);
    clearStagedSession();

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const objectUrl = URL.createObjectURL(file);
    activeObjectUrlRef.current = objectUrl;

    const meta: ExtractionDocumentMeta = {
      fileName: file.name,
      fileSize: file.size,
      fileType: isPdf ? "PDF" : "IMAGE",
      mimeType: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
      fileUrl: objectUrl,
      uploadedAt: new Date().toISOString(),
    };

    setActiveFile(file);
    setFileMeta(meta);
  };

  // Handle Demo Ledger Generation (Vector SVG from prototype)
  const handleLoadDemo = () => {
    safelyRevokeObjectUrl();
    setErrorMessage(null);
    setExtractionResponse(null);
    setShowReconciliation(false);
    setReconciliationRows([]);
    setReconciliationSummary(null);
    setIsApplied(false);
    setAppliedKpis(null);
    setAppliedCalendar([]);
    clearStagedSession();

    const svgString = generateDemoHandwrittenSvg("November", 2026);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const objectUrl = URL.createObjectURL(blob);
    activeObjectUrlRef.current = objectUrl;

    const meta: ExtractionDocumentMeta = {
      fileName: "sample_hydac_meal_ledger_nov2026.svg",
      fileSize: blob.size,
      fileType: "DEMO_SVG",
      mimeType: "image/svg+xml",
      fileUrl: objectUrl,
      uploadedAt: new Date().toISOString(),
    };

    setActiveFile(null);
    setFileMeta(meta);
  };

  // Remove Active Document
  const handleRemoveFile = () => {
    safelyRevokeObjectUrl();
    setFileMeta(null);
    setActiveFile(null);
    setExtractionResponse(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setShowReconciliation(false);
    setReconciliationRows([]);
    setReconciliationSummary(null);
    setIsApplied(false);
    setAppliedKpis(null);
    setAppliedCalendar([]);
    clearStagedSession();
  };

  // Trigger Mock AI Extraction
  const handleStartExtraction = async () => {
    if (!fileMeta) return;

    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingStep("Detecting document borders & orientation...");
    setErrorMessage(null);
    setShowReconciliation(false);

    // Multi-stage visual progress for realistic user feedback
    const timer1 = setTimeout(() => {
      setProcessingProgress(35);
      setProcessingStep("Analyzing handwritten register layout & values...");
    }, 250);

    const timer2 = setTimeout(() => {
      setProcessingProgress(65);
      setProcessingStep("Parsing breakfast, dinner, and supervisor initials...");
    }, 550);

    const timer3 = setTimeout(() => {
      setProcessingProgress(88);
      setProcessingStep("Applying confidence scores & combined meal rules...");
    }, 800);

    try {
      const response = await mockExtractionService.extractLedger({
        document: activeFile || {
          type: "DEMO_SVG",
          name: fileMeta.fileName,
          dataUrl: fileMeta.fileUrl,
        },
        month: 10, // November (0-indexed)
        year: 2026,
        customerShortCode: "HYDAC",
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setProcessingProgress(100);
      setProcessingStep("Extraction completed successfully!");
      setExtractionResponse(response);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      const msg =
        err instanceof Error ? err.message : "Failed to extract ledger.";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Manual Correction Update on an Extracted Record
  const handleUpdateRecord = (updatedRecord: HtrExtractedRecord) => {
    if (!extractionResponse) return;

    const updatedRecords = extractionResponse.records.map((r) =>
      r.id === updatedRecord.id ? updatedRecord : r
    );

    const updatedStats = computeExtractionStats(updatedRecords);

    setExtractionResponse({
      ...extractionResponse,
      records: updatedRecords,
      stats: updatedStats,
    });

    // If reconciliation is currently open, refresh reconciliation diff to reflect manual edit
    if (showReconciliation) {
      runReconciliationDiff(updatedRecords);
    }
  };

  // Helper to load comparison calendar based on active source mode
  const getComparisonCalendar = useCallback((): {
    entries: DailyBillingEntry[];
    label: string;
  } => {
    if (calendarSource === "SAVED_DRAFT") {
      try {
        const saved = localStorage.getItem("bcs_billing_draft_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            Array.isArray(parsed.dailyEntries) &&
            parsed.dailyEntries.length > 0
          ) {
            return {
              entries: parsed.dailyEntries,
              label: `Saved Monthly Draft (${parsed.customerId || "HYDAC"})`,
            };
          }
        }
      } catch {
        // Fallback
      }
      return {
        entries: [],
        label: "Empty / Blank Roster (No draft found)",
      };
    } else if (calendarSource === "SAMPLE_ROSTER") {
      const sample = generateSampleBillingData(10, 2026, 48.0);
      return {
        entries: sample,
        label: "Sample Manufacturing Roster (Nov 2026)",
      };
    } else {
      return {
        entries: [],
        label: "Blank Roster (0 entries)",
      };
    }
  }, [calendarSource]);

  // Core Reconciliation Engine Execution
  const runReconciliationDiff = (
    baseRecords: HtrExtractedRecord[],
    forceDuplicate = includeTestDuplicate
  ) => {
    let recordsToCompare = [...baseRecords];

    // Optional duplicate-date injection for testing operator duplicate review workflow
    if (forceDuplicate) {
      const existingNov4Index = recordsToCompare.findIndex(
        (r) => r.date === "2026-11-04"
      );
      const duplicateRecordA: HtrExtractedRecord = {
        id: "dup_nov04_shift_a",
        date: "2026-11-04",
        breakfast: 30,
        lunch: 0,
        dinner: 0,
        snacks: 2,
        tea: 5,
        status: "CONFIDENT",
        confidence: 0.94,
        notes: "Morning Shift (Supervisor initial: A.K.)",
        rawText: "04/11 Morning 30 B Sign: A.K.",
      };
      const duplicateRecordB: HtrExtractedRecord = {
        id: "dup_nov04_shift_b",
        date: "2026-11-04",
        breakfast: 0,
        lunch: 0,
        dinner: 35,
        snacks: 3,
        tea: 5,
        status: "CONFIDENT",
        confidence: 0.91,
        notes: "Evening Shift (Supervisor initial: M.P.)",
        rawText: "04/11 Night 35 D Sign: M.P.",
      };

      if (existingNov4Index >= 0) {
        recordsToCompare.splice(
          existingNov4Index,
          1,
          duplicateRecordA,
          duplicateRecordB
        );
      } else {
        recordsToCompare.push(duplicateRecordA, duplicateRecordB);
      }
    }

    const { entries } = getComparisonCalendar();
    const result = buildReconciliationDiff(recordsToCompare, entries);

    setReconciliationRows(result.diffRows);
    setReconciliationSummary(result.summary);
    setShowReconciliation(true);
  };

  // Trigger from Review Table CTA
  const handleTriggerReconciliation = () => {
    if (!extractionResponse || !extractionResponse.records) return;
    runReconciliationDiff(extractionResponse.records, includeTestDuplicate);

    setTimeout(() => {
      const el = document.getElementById("reconciliation-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 120);
  };

  // Update Operator Decision for a Specific Row
  const handleUpdateDecision = (
    rowId: string,
    decision: ReconciliationDecision
  ) => {
    setReconciliationRows((prev) => {
      const next = prev.map((row) => {
        if (row.id === rowId) {
          return { ...row, decision };
        }
        return row;
      });

      const pendingCount = next.filter((r) => r.decision === "PENDING").length;
      setReconciliationSummary((s) =>
        s ? { ...s, pendingDecisionCount: pendingCount } : null
      );

      return next;
    });
  };

  // Resolve Duplicate Date (Record selection or merged record)
  const handleResolveDuplicate = (
    rowId: string,
    resolvedRecord: HtrExtractedRecord
  ) => {
    setReconciliationRows((prev) => {
      const next = prev.map((row) => {
        if (row.id === rowId) {
          const extractedBillQty = calculateRowBillQty({
            breakfast: resolvedRecord.breakfast,
            lunch: resolvedRecord.lunch,
            dinner: resolvedRecord.dinner,
            particulars: "BREAKFAST & DINNER",
            combinedNotation: resolvedRecord.combinedNotation,
          });
          const existingBillQty = row.existingBillQty;
          const diffQty = extractedBillQty - existingBillQty;

          let newClassification: ReconciliationClassification = "MATCHING";
          if (!row.hasExistingData) {
            newClassification = "NEW";
          } else if (diffQty !== 0) {
            newClassification = "CONFLICT";
          }

          return {
            ...row,
            classification: newClassification,
            extractedRecord: resolvedRecord,
            extractedBillQty,
            diffQty,
            decision: "USE_MERGED" as ReconciliationDecision,
            discrepancyReason: `Resolved duplicate: using merged/selected record (${extractedBillQty} meals)`,
          };
        }
        return row;
      });

      const newDuplicateCount = next.filter(
        (r) => r.classification === "DUPLICATE"
      ).length;
      const newConflictCount = next.filter(
        (r) => r.classification === "CONFLICT"
      ).length;
      const newMatchingCount = next.filter(
        (r) => r.classification === "MATCHING"
      ).length;
      const pendingCount = next.filter((r) => r.decision === "PENDING").length;

      setReconciliationSummary((s) =>
        s
          ? {
              ...s,
              duplicateCount: newDuplicateCount,
              conflictCount: newConflictCount,
              matchingCount: newMatchingCount,
              pendingDecisionCount: pendingCount,
            }
          : null
      );

      return next;
    });
  };

  // Step 3C: Apply Approved Decisions to Active Billing Session
  const handleApplyToSession = () => {
    const { entries } = getComparisonCalendar();
    const { updatedCalendar, metrics, updatedKpis } = applyReconciliationDecisions(
      reconciliationRows,
      entries,
      48.0,
      "CUSTOMER_DEFAULT"
    );

    stageReconciledSession({
      customerId: "cust-hydac",
      month: 10,
      year: 2026,
      rate: 48.0,
      rateSource: "CUSTOMER_DEFAULT",
      unitLocation: "CHETTIPALAYAM",
      billNo: "BCS/2026-27/084",
      startDate: "2026-11-01",
      endDate: "2026-11-30",
      invoiceDate: "2026-11-30",
      activePreset: "BREAKFAST & DINNER",
      dailyEntries: updatedCalendar,
      priorEntriesSnapshot: entries,
      auditMeta: {
        appliedAt: new Date().toISOString(),
        totalUpdated: metrics.newApprovedCount + metrics.conflictsAcceptedCount,
        totalRetained: metrics.existingRetainedCount,
        totalMerged: metrics.recordsMergedCount,
        totalSkipped: metrics.recordsSkippedCount,
        sourceDocument: fileMeta?.fileName || "Sample Handwritten Register",
      },
    });

    setIsApplied(true);
    setAppliedKpis(updatedKpis);
    setAppliedCalendar(updatedCalendar);

    setTimeout(() => {
      const el = document.getElementById("completion-summary-card");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Step 3C: Undo Application (Reversibility)
  const handleUndoApplication = () => {
    clearStagedSession();
    setIsApplied(false);
    setAppliedKpis(null);
    setAppliedCalendar([]);
  };

  const currentCalendarMeta = getComparisonCalendar();

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5ddcd]">
        <div className="flex items-center gap-2 text-xs text-[#69746a]">
          <Link
            href="/admin/billing"
            className="hover:text-[#123c2c] transition-colors font-medium flex items-center gap-1 text-[#997b3e]"
          >
            <span>Monthly Billing</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#c7a45b]" />
          <span className="text-[#123c2c] font-semibold">
            Handwritten Ledger Scanner
          </span>
        </div>

        <Link
          href="/admin/billing"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Monthly Billing</span>
        </Link>
      </div>

      {/* Main Header with Context Badges */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#997b3e] text-xs font-bold uppercase tracking-wider mb-1">
              <ScanLine className="w-4 h-4 text-[#c7a45b]" />
              <span>Phase 3C • Document Vision &amp; Ingestion</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#123c2c] m-0">
              Handwritten Ledger Upload &amp; Document Preview
            </h1>
            <p className="text-[#69746a] text-sm leading-relaxed mt-1 max-w-2xl">
              Upload daily catering ledger sheets, review document images and prepare quantities for reconciliation.
            </p>
          </div>

          {/* Context Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#faf8f2] border border-[#e2d8c3] text-xs text-[#123c2c]">
              <Building2 className="w-3.5 h-3.5 text-[#997b3e]" />
              <span className="font-bold">HYDAC INDIA PVT LTD</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#faf8f2] border border-[#e2d8c3] text-xs text-[#123c2c]">
              <Calendar className="w-3.5 h-3.5 text-[#997b3e]" />
              <span>November 2026</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Extraction Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Zone & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <LedgerUploadZone
            fileMeta={fileMeta}
            onFileSelect={handleFileSelect}
            onLoadDemo={handleLoadDemo}
            onRemoveFile={handleRemoveFile}
            onStartExtraction={handleStartExtraction}
            isProcessing={isProcessing}
            processingProgress={processingProgress}
            processingStep={processingStep}
            extractionResponse={extractionResponse}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        </div>

        {/* Right Column: Document Preview Viewport */}
        <div className="lg:col-span-7">
          <DocumentPreviewPanel
            fileMeta={fileMeta}
            isProcessing={isProcessing}
            processingStep={processingStep}
          />
        </div>
      </div>

      {/* Human-in-the-Loop Extraction Review Table */}
      {extractionResponse &&
        extractionResponse.records &&
        extractionResponse.records.length > 0 && (
          <div className="space-y-4">
            <ExtractionReviewTable
              records={extractionResponse.records}
              onUpdateRecord={handleUpdateRecord}
              documentMeta={extractionResponse.meta}
              onTriggerReconciliation={handleTriggerReconciliation}
              isReconciled={showReconciliation}
            />

            {/* Reconciliation Comparison Config Bar */}
            <div className="p-4 rounded-[2px] bg-[#fbf9f4] border border-[#d8ceba] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#123c2c]">
                  <Database className="w-3.5 h-3.5 text-[#997b3e]" />
                  <span>Comparison Target:</span>
                </div>

                <select
                  id="select-comparison-target"
                  value={calendarSource}
                  onChange={(e) => {
                    const newSource = e.target.value as CalendarSourceMode;
                    setCalendarSource(newSource);
                    if (showReconciliation && extractionResponse) {
                      setTimeout(() => {
                        runReconciliationDiff(
                          extractionResponse.records,
                          includeTestDuplicate
                        );
                      }, 50);
                    }
                  }}
                  className="py-1 px-2.5 text-xs bg-white border border-[#c7a45b] focus:border-[#123c2c] focus:outline-none rounded-[2px] text-[#123c2c] font-medium"
                >
                  <option value="SAMPLE_ROSTER">
                    Sample November 2026 Roster (30 Days)
                  </option>
                  {hasSavedDraft && (
                    <option value="SAVED_DRAFT">
                      Saved Monthly Draft ({savedDraftCount} days in session)
                    </option>
                  )}
                  <option value="EMPTY">
                    Blank Calendar (Test 100% New Entries)
                  </option>
                </select>

                {/* Duplicate Test Toggle */}
                <label className="flex items-center gap-1.5 text-xs text-[#123c2c] cursor-pointer ml-1 select-none">
                  <input
                    type="checkbox"
                    id="checkbox-test-duplicate"
                    checked={includeTestDuplicate}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIncludeTestDuplicate(checked);
                      if (showReconciliation && extractionResponse) {
                        runReconciliationDiff(
                          extractionResponse.records,
                          checked
                        );
                      }
                    }}
                    className="accent-[#123c2c] rounded-[2px] w-3.5 h-3.5"
                  />
                  <span className="text-[#69746a]">
                    Simulate Duplicate Date (Nov 4 Shifts A &amp; B)
                  </span>
                </label>
              </div>

              <button
                type="button"
                id="btn-recompare"
                onClick={handleTriggerReconciliation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors"
              >
                <GitCompare className="w-3.5 h-3.5 text-[#997b3e]" />
                <span>
                  {showReconciliation ? "Re-Run Comparison" : "Compare Now"}
                </span>
              </button>
            </div>
          </div>
        )}

      {/* Step 3B & 3C: Reconciliation Table & Final Approval */}
      {showReconciliation && reconciliationSummary && (
        <div className="space-y-6">
          <ReconciliationTable
            diffRows={reconciliationRows}
            summary={reconciliationSummary}
            calendarSourceLabel={currentCalendarMeta.label}
            calendarDaysCount={currentCalendarMeta.entries.length}
            onUpdateDecision={handleUpdateDecision}
            onResolveDuplicate={handleResolveDuplicate}
          />

          <FinalApprovalCard
            reconciliationRows={reconciliationRows}
            currentCalendar={currentCalendarMeta.entries}
            customerName="HYDAC INDIA PVT LTD"
            monthName="November"
            year={2026}
            rate={48.0}
            isApplied={isApplied}
            appliedKpis={appliedKpis}
            updatedCalendar={appliedCalendar}
            onApplyToSession={handleApplyToSession}
            onUndoApplication={handleUndoApplication}
          />
        </div>
      )}
    </div>
  );
}
