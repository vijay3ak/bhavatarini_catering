import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, LayoutDashboard, Home } from "lucide-react";

export default function RootNotFound() {
  return (
    <main className="min-h-screen bg-[#faf8f1] text-[#17271e] flex flex-col justify-between p-6">
      {/* Top brand accent bar */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-[#123c2c] via-[#c7a45b] to-[#1c573e] fixed top-0 left-0"
      />

      <div className="max-w-xl mx-auto my-auto text-center py-12 px-4">
        {/* Logo */}
        <div className="mx-auto w-20 h-20 mb-6 rounded-full border border-[#c7a45b]/40 bg-[#fffefa] p-2 shadow-md flex items-center justify-center">
          <Image
            src="/images/bhavatarini-chef-logo.png"
            alt="Bhavatarini Catering Logo"
            width={64}
            height={64}
            priority
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>

        {/* Status code */}
        <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#997b3e] block mb-2">
          Error 404 • Page Not Found
        </span>

        {/* Heading */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#123c2c] tracking-tight mb-4">
          This Page Could Not Be Found
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-[#69746a] leading-relaxed mb-8 max-w-md mx-auto">
          The page or record you requested does not exist or may have been moved. You can return to the public website or access the operations hub.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] text-xs font-bold text-[#123c2c] bg-[#faf7ef] hover:bg-[#eee7d7] border border-[#e5ddcd] transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 text-[#8e7139]" />
            <span>Return to Public Website</span>
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] text-xs font-bold text-[#f4ecda] bg-gradient-to-r from-[#174a34] to-[#0d3021] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 transition-all"
          >
            <LayoutDashboard className="w-4 h-4 text-[#c7a45b]" />
            <span>Open Admin Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#8e7139]/80 py-4 border-t border-[#e5ddcd]/60">
        Bhavatarini Catering Service • Coimbatore, Tamil Nadu
      </footer>
    </main>
  );
}
