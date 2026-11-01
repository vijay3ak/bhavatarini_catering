import React from "react";
import { siteConfig } from "@/lib/config/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-[52px] text-center text-[11px] tracking-[0.5px] leading-[2] text-[#c8d3c8] border-t border-white/10"
      style={{
        background: "linear-gradient(120deg, #09271a 0%, #123c2a 100%)",
      }}
    >
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        <strong className="font-serif text-[27px] max-sm:text-2xl text-[#e2cb8e] font-semibold block mb-1">
          {siteConfig.name}
        </strong>
        <p className="text-[#c8d3c8] m-0 mb-4">
          Traditional Taste. Quality Service. Every Occasion.
        </p>
        <p className="text-[#c8d3c8]/60 m-0 text-[10px]">
          © {currentYear} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
