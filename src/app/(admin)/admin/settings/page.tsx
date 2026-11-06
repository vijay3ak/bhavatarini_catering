import React from "react";
import Link from "next/link";
import { Settings, ArrowLeft } from "lucide-react";

export default function SettingsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2px] bg-[#fffefa] border border-[#e5ddcd] border-t-[3px] border-t-[#c7a45b] shadow-xs">
        <div className="flex items-center gap-3 text-[#997b3e] text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#123c2c] m-0">
          System &amp; Billing Settings
        </h2>
        <p className="text-[#69746a] text-sm leading-relaxed mt-2 max-w-xl">
          Bank account details for invoice footers, legal declaration text, default meal rates, and optional cloud vision API credentials.
        </p>

        <div className="mt-6 pt-6 border-t border-[#f0e9dc] flex items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#123c2c] bg-[#eee7d7] hover:bg-[#e4dac4] rounded-[2px] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <span className="text-xs text-[#8e7139] italic">
            Planned for Phase 3 / Phase 4
          </span>
        </div>
      </div>
    </div>
  );
}
