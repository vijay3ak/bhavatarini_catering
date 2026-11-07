"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  FileImage,
  FileCode2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Trash2,
  FileUp,
  Info,
  Clock,
  Layers,
  HelpCircle,
} from "lucide-react";
import type { ExtractionDocumentMeta, ExtractionServiceResponse } from "@/types/billing";

interface LedgerUploadZoneProps {
  fileMeta: ExtractionDocumentMeta | null;
  onFileSelect: (file: File) => void;
  onLoadDemo: () => void;
  onRemoveFile: () => void;
  onStartExtraction: () => void;
  isProcessing: boolean;
  processingProgress: number; // 0 to 100
  processingStep: string;
  extractionResponse: ExtractionServiceResponse | null;
  errorMessage: string | null;
  onClearError: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

/**
 * Format bytes into human-readable string (KB / MB)
 */
function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function LedgerUploadZone({
  fileMeta,
  onFileSelect,
  onLoadDemo,
  onRemoveFile,
  onStartExtraction,
  isProcessing,
  processingProgress,
  processingStep,
  extractionResponse,
  errorMessage,
  onClearError,
}: LedgerUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Validate and forward selected file
  const handleFile = (file: File | null) => {
    if (!file) return;

    onClearError();

    // Check MIME type or file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      (fileExt && ["jpg", "jpeg", "png", "pdf"].includes(fileExt));

    if (!isValidType) {
      alert(
        "Unsupported file type. Please upload a photographic image (JPG, PNG) or a PDF document."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 10 MB.`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      // Reset input value so re-selecting the exact same file fires the event
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-5">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-[2px] bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">
              File Upload Error
            </h4>
            <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-xs text-red-600 hover:text-red-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="p-6 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#997b3e] text-[11px] font-bold uppercase tracking-wider">
              <UploadCloud className="w-4 h-4" />
              <span>Step 1 of 3 • Document Ingestion</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#123c2c] mt-0.5">
              Upload Daily Shift Ledger
            </h3>
          </div>

          {/* Quick Demo Action */}
          <button
            type="button"
            onClick={onLoadDemo}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors disabled:opacity-50"
            title="Load sample handwritten slip preview"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#997b3e]" />
            <span>Load Demo Sheet</span>
          </button>
        </div>

        {/* Drag-and-Drop Area (Visible when no document uploaded) */}
        {!fileMeta ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-[4px] p-8 text-center transition-all ${
              isDragOver
                ? "border-[#c7a45b] bg-[#f7f2e4] scale-[1.01]"
                : "border-[#d8ceba] bg-[#fbf9f4] hover:bg-[#f6f0e2] hover:border-[#b89445]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#eee7d7] text-[#123c2c] flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-[#997b3e]" />
            </div>

            <h4 className="text-sm font-bold text-[#123c2c] mb-1">
              Click to Upload or Drag & Drop Daily Quantity Sheet
            </h4>
            <p className="text-xs text-[#69746a] max-w-sm mx-auto mb-4 leading-relaxed">
              Accepts high-resolution photographic images (<strong className="text-[#123c2c]">JPG, PNG</strong>) or scanned multi-page documents (<strong className="text-[#123c2c]">PDF</strong>) up to 10 MB.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#fdfaf0] bg-[#123c2c] hover:bg-[#1a4a38] rounded-[2px] shadow-xs transition-colors"
            >
              <FileUp className="w-4 h-4" />
              <span>Browse Computer</span>
            </button>
          </div>
        ) : (
          /* Active File Metadata Card (When a file is loaded) */
          <div className="border border-[#e2d8c3] rounded-[4px] p-4 bg-[#f9f6ee] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[2px] bg-[#eee7d7] text-[#123c2c] flex items-center justify-center shrink-0 border border-[#d8ceba]">
                  {fileMeta.fileType === "PDF" ? (
                    <FileText className="w-5 h-5 text-red-700" />
                  ) : fileMeta.fileType === "DEMO_SVG" ? (
                    <FileCode2 className="w-5 h-5 text-[#997b3e]" />
                  ) : (
                    <FileImage className="w-5 h-5 text-[#123c2c]" />
                  )}
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#123c2c] truncate max-w-[220px] md:max-w-[280px]">
                      {fileMeta.fileName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] uppercase ${
                        fileMeta.fileType === "DEMO_SVG"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : fileMeta.fileType === "PDF"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {fileMeta.fileType === "DEMO_SVG"
                        ? "SAMPLE DEMO"
                        : fileMeta.fileType === "PDF"
                        ? "PDF DOCUMENT"
                        : "IMAGE SCAN"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#69746a] mt-0.5">
                    Size: {formatFileSize(fileMeta.fileSize)} • Type: {fileMeta.mimeType}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Replace / Remove */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="px-2.5 py-1 text-xs font-semibold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] border border-[#c7a45b] rounded-[2px] transition-colors disabled:opacity-50"
                  title="Choose a different file"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onRemoveFile}
                  disabled={isProcessing}
                  className="p-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-[2px] transition-colors disabled:opacity-50"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Demo Tag Notice */}
            {fileMeta.fileType === "DEMO_SVG" && (
              <div className="p-2.5 rounded-[2px] bg-amber-50/80 border border-amber-200/90 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Synthetic Demo Ledger:</strong> Loaded standard HYDAC November 2026 meal count register for zero-friction testing. Includes verified supervisor signatures, normal shift meals, smudged counts, and combined meal notation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Extraction Trigger Section */}
        {fileMeta && (
          <div className="pt-2 border-t border-[#f0e9dc] space-y-4">
            {/* Extraction CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#123c2c] uppercase tracking-wider">
                  Automated Recognition
                </h4>
                <p className="text-xs text-[#69746a]">
                  Scan and parse daily meal quantities into reviewable structured records.
                </p>
              </div>

              <button
                type="button"
                onClick={onStartExtraction}
                disabled={isProcessing}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#fdfaf0] bg-[#123c2c] hover:bg-[#1a4a38] border border-[#0d2c20] rounded-[2px] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#c7a45b]" />
                    <span>Extracting Quantities...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#c7a45b]" />
                    <span>Start AI Extraction</span>
                  </>
                )}
              </button>
            </div>

            {/* Processing Progress State */}
            {isProcessing && (
              <div className="p-4 rounded-[2px] bg-[#fdfaf0] border border-[#c7a45b] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#123c2c] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#997b3e] animate-pulse" />
                    {processingStep}
                  </span>
                  <span className="font-mono text-[#997b3e] font-bold">
                    {processingProgress}%
                  </span>
                </div>

                <div className="w-full bg-[#eee7d7] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#123c2c] h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Extraction Completed Summary */}
            {extractionResponse && !isProcessing && (
              <div className="p-4 rounded-[2px] bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">
                      Extraction Completed ({extractionResponse.engineName})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-emerald-200/70 text-emerald-900">
                    MOCK DEMO
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-[2px] bg-white border border-emerald-100">
                    <div className="text-[11px] text-[#69746a]">Total Records</div>
                    <div className="text-base font-bold text-[#123c2c]">
                      {extractionResponse.stats.totalRecords}
                    </div>
                  </div>
                  <div className="p-2 rounded-[2px] bg-white border border-emerald-100">
                    <div className="text-[11px] text-emerald-700">High Confidence</div>
                    <div className="text-base font-bold text-emerald-800">
                      {extractionResponse.stats.confidentCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-[2px] bg-white border border-emerald-100">
                    <div className="text-[11px] text-amber-700">Unclear (Flagged)</div>
                    <div className="text-base font-bold text-amber-800">
                      {extractionResponse.stats.unclearCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-[2px] bg-white border border-emerald-100">
                    <div className="text-[11px] text-purple-700">Combined Shift</div>
                    <div className="text-base font-bold text-purple-800">
                      {extractionResponse.stats.combinedCount}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed italic">
                  ✓ Extracted records are ready for Step 3: Human-in-the-loop review, conflict detection, and calendar reconciliation.
                </p>
              </div>
            )}

            {/* Explicit Demo Disclaimer */}
            <div className="p-3 rounded-[2px] bg-[#fcfbf7] border border-[#e5ddcd] flex items-start gap-2 text-[11px] text-[#69746a] leading-relaxed">
              <Info className="w-4 h-4 text-[#997b3e] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#123c2c]">Mock AI Architecture:</strong> This demonstration uses the provider-neutral <code className="text-[#123c2c] font-mono">IExtractionService</code> mock implementation with realistic handwritten sample records. No external OCR or vision APIs are called.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
