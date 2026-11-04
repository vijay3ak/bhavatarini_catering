"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export function LoadingScreen() {
  const [stage, setStage] = useState<"enter" | "drawing" | "complete" | "fadeout">("enter");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 1. Accessibility: Skip loading animation if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 2. Prevent repeating on internal hash navigation or multiple renders in same session
    const hasLoaded = sessionStorage.getItem("bhavatarini_loader_shown");
    if (hasLoaded || prefersReducedMotion) {
      setVisible(false);
      return;
    }

    sessionStorage.setItem("bhavatarini_loader_shown", "true");

    // Timed choreography for the signature animation sequence
    const t1 = setTimeout(() => setStage("drawing"), 180);
    const t2 = setTimeout(() => setStage("complete"), 850);
    const t3 = setTimeout(() => setStage("fadeout"), 1500);
    const t4 = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading Bhavatarini Catering Service"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none transition-opacity duration-500 ease-out ${
        stage === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #184834 0%, #123c2c 50%, #0a241a 100%)",
      }}
    >
      {/* Ambient Heritage Watermark in Background */}
      <div
        aria-hidden="true"
        className="absolute w-[440px] h-[440px] rounded-full border border-[#c7a45b]/10 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: stage === "enter" ? "scale(0.85)" : "scale(1)",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Delicate Steam SVG Animation Rising Above Logo */}
        <div
          aria-hidden="true"
          className="absolute -top-11 left-1/2 -translate-x-1/2 w-16 h-12 pointer-events-none overflow-visible"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 64 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Steam Line 1 */}
            <path
              d="M24 44 Q 20 28 26 18 T 24 2"
              stroke="#f2deb4"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="animate-steam-1 opacity-60"
            />
            {/* Steam Line 2 (Center) */}
            <path
              d="M32 46 Q 36 30 31 16 T 33 0"
              stroke="#e2cb8e"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-steam-2 opacity-70"
            />
            {/* Steam Line 3 */}
            <path
              d="M40 44 Q 44 28 38 18 T 40 2"
              stroke="#f2deb4"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="animate-steam-3 opacity-60"
            />
          </svg>
        </div>

        {/* Circular Medallion with Antique Gold Outline & Chef Logo */}
        <div className="relative w-[136px] h-[136px] flex items-center justify-center">
          {/* Animated SVG Circular Plate Outline */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 136 136"
            fill="none"
          >
            {/* Subtle Guide Track */}
            <circle
              cx="68"
              cy="68"
              r="62"
              stroke="#c7a45b"
              strokeWidth="1"
              strokeOpacity="0.15"
            />
            {/* Antique Gold Drawing Circle (Resembling Traditional Serving Cloche / Plate) */}
            <circle
              cx="68"
              cy="68"
              r="62"
              stroke="#c7a45b"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray={390}
              strokeDashoffset={stage === "enter" ? 390 : 0}
              className="transition-[stroke-dashoffset] duration-[850ms] ease-out"
            />
            {/* Fine Outer Decorative Ring Accent */}
            <circle
              cx="68"
              cy="68"
              r="66"
              stroke="#e2cb8e"
              strokeWidth="0.75"
              strokeOpacity={stage === "complete" || stage === "fadeout" ? 0.35 : 0}
              strokeDasharray="4 6"
              className="transition-opacity duration-500 ease-out"
            />
          </svg>

          {/* Central Official Chef Logo (Pristine, Transparent, Undistorted) */}
          <div
            className={`relative w-[86px] h-[86px] transition-all duration-700 ease-out ${
              stage === "enter"
                ? "opacity-0 scale-90 translate-y-1"
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <Image
              src="/images/bhavatarini-chef-logo.png"
              alt="Bhavatarini Catering Logo"
              width={86}
              height={86}
              priority
              unoptimized
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div
          className={`text-center mt-5 transition-all duration-600 ease-out ${
            stage === "enter" || stage === "drawing"
              ? "opacity-0 translate-y-2"
              : "opacity-100 translate-y-0"
          }`}
        >
          <span className="font-serif text-[24px] sm:text-[26px] font-bold text-white tracking-[-0.2px] block leading-tight">
            Bhavatarini
          </span>
          <span className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#e2cb8e] block mt-1 leading-none">
            Catering Service
          </span>
        </div>

        {/* Thin Antique Gold Progress Line */}
        <div
          className={`w-36 h-[2px] bg-[#0c2b1e] rounded-full overflow-hidden mt-6 transition-opacity duration-400 ${
            stage === "enter" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className="h-full bg-gradient-to-r from-[#c7a45b] via-[#f1dfaa] to-[#c7a45b] rounded-full transition-all duration-[750ms] ease-out origin-left"
            style={{
              transform: stage === "enter" ? "scaleX(0)" : "scaleX(1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
