"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 480);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      id="backTop"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed right-[22px] bottom-[22px] w-[46px] h-[46px] rounded-full z-30 flex items-center justify-center text-[#17251d] border border-white/55 shadow-[0_8px_25px_rgba(0,0,0,0.16)] transition-all duration-300 ${
        isVisible
          ? "opacity-100 visible translate-y-0 hover:-translate-y-1 hover:brightness-105"
          : "opacity-0 invisible translate-y-3 pointer-events-none"
      }`}
      style={{
        background: "linear-gradient(145deg, #e2ce94, #bd9a50)",
      }}
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
}
