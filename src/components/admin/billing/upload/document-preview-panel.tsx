"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  FileImage,
  ExternalLink,
  Eye,
  Loader2,
  ScanLine,
} from "lucide-react";
import type { ExtractionDocumentMeta } from "@/types/billing";

interface DocumentPreviewPanelProps {
  fileMeta: ExtractionDocumentMeta | null;
  isProcessing: boolean;
  processingStep: string;
}

export function DocumentPreviewPanel({
  fileMeta,
  isProcessing,
  processingStep,
}: DocumentPreviewPanelProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
  };

  return (
    <div className="rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] shadow-xs flex flex-col h-full min-h-[580px]">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#f0e9dc] flex flex-wrap items-center justify-between gap-3 bg-[#faf8f2]">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#997b3e]" />
          <h3 className="font-serif text-sm font-bold text-[#123c2c]">
            Document Preview
          </h3>
          {fileMeta && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-[2px] bg-[#eee7d7] text-[#123c2c] border border-[#d8ceba]">
              {fileMeta.fileType}
            </span>
          )}
        </div>

        {/* Zoom Controls (Images & Demo SVG) */}
        {fileMeta && fileMeta.fileType !== "PDF" && (
          <div className="flex items-center gap-1.5 bg-white border border-[#e5ddcd] rounded-[2px] p-1 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1 text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-mono font-bold text-[#123c2c] px-2 min-w-[48px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.0}
              className="p-1 text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3.5 bg-[#e5ddcd] mx-0.5" />

            <button
              type="button"
              onClick={handleZoomReset}
              disabled={zoomLevel === 1.0}
              className="p-1 text-[#69746a] hover:text-[#123c2c] hover:bg-[#eee7d7] rounded-[2px] transition-colors disabled:opacity-30"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PDF External Tab Link */}
        {fileMeta && fileMeta.fileType === "PDF" && fileMeta.fileUrl && (
          <a
            href={fileMeta.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#123c2c] bg-white hover:bg-[#eee7d7] border border-[#e5ddcd] rounded-[2px] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#997b3e]" />
            <span>Open in Tab</span>
          </a>
        )}
      </div>

      {/* Viewport Area */}
      <div className="relative flex-1 p-4 bg-[#fbf9f3] overflow-auto flex items-center justify-center min-h-[480px] max-h-[750px]">
        {/* Active Scan Laser Animation during Processing */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-[#123c2c]/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center">
            {/* Animated Laser Line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#c7a45b] to-transparent shadow-[0_0_12px_#c7a45b] animate-bounce" />

            <div className="p-5 rounded-[4px] bg-[#fffefa] border border-[#c7a45b] shadow-lg max-w-sm w-full space-y-3">
              <div className="flex items-center justify-center gap-2 text-[#997b3e]">
                <Loader2 className="w-6 h-6 animate-spin text-[#123c2c]" />
                <ScanLine className="w-6 h-6 text-[#c7a45b] animate-pulse" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#123c2c]">
                Optical Layout Analysis
              </h4>
              <p className="text-xs text-[#69746a] leading-relaxed">
                {processingStep || "Analyzing handwritten register layout & values..."}
              </p>
            </div>
          </div>
        )}

        {/* Render Preview according to File Type */}
        {fileMeta ? (
          fileMeta.fileType === "PDF" ? (
            /* PDF Document Viewer */
            <div className="w-full h-full min-h-[520px] flex flex-col">
              <iframe
                src={fileMeta.fileUrl}
                title={fileMeta.fileName}
                className="w-full h-[520px] rounded border border-[#e5ddcd] shadow-xs bg-white"
              />
              <p className="text-[11px] text-[#69746a] text-center mt-2">
                PDF rendered via browser native viewer. Use the top button to open full document if required.
              </p>
            </div>
          ) : (
            /* Image & Synthetic SVG Viewer */
            <div
              className="flex items-center justify-center w-full transition-transform duration-150 ease-out py-2"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileMeta.fileUrl}
                alt={fileMeta.fileName}
                className="max-w-full h-auto max-h-[640px] rounded-[2px] shadow-sm border border-[#e2d8c3] object-contain bg-white"
              />
            </div>
          )
        ) : (
          /* Empty State */
          <div className="text-center p-8 max-w-sm text-[#69746a] space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#eee7d7] text-[#997b3e] flex items-center justify-center mx-auto border border-[#d8ceba]">
              <FileImage className="w-7 h-7 text-[#997b3e]" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#123c2c]">
              No Document Selected
            </h4>
            <p className="text-xs text-[#69746a] leading-relaxed">
              Upload a photograph of your company canteen daily ledger (JPG, PNG) or a PDF scan to inspect it here while reviewing counts.
            </p>
            <p className="text-[11px] text-[#997b3e] italic">
              Tip: Click &quot;Load Demo Sheet&quot; on the left for instant synthetic testing.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      {fileMeta && (
        <div className="p-3 bg-[#faf8f2] border-t border-[#f0e9dc] flex items-center justify-between text-[11px] text-[#69746a]">
          <span className="truncate max-w-[260px] sm:max-w-md">
            File: <strong className="text-[#123c2c]">{fileMeta.fileName}</strong>
          </span>
          <span className="font-mono text-[#997b3e]">
            {fileMeta.fileType === "DEMO_SVG" ? "SVG Vector Slip" : fileMeta.mimeType}
          </span>
        </div>
      )}
    </div>
  );
}
