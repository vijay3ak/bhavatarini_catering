"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UtensilsCrossed, CookingPot, LayoutGrid } from "lucide-react";

const FULL_MEALS_ITEMS = [
  "Rice",
  "Sambar",
  "Rasam",
  "Kuzhambu",
  "Poriyal",
  "Appalam",
  "Curd",
  "Vadai",
  "Payasam",
  "Pickle",
];

const TIFFIN_ITEMS = [
  "Idli",
  "Dosa",
  "Pongal",
  "Poori",
  "Chapathi",
  "Biriyani",
  "Upma",
  "Vada",
];

export function MenuSection() {
  const [activeTab, setActiveTab] = useState<"all" | "meals" | "tiffin">("all");

  return (
    <section
      id="menu"
      className="py-24 max-sm:py-14"
      style={{
        background: "linear-gradient(180deg, #faf8f1 0%, #f5efe2 100%)",
      }}
    >
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        {/* Section Head */}
        <div className="section-head text-center max-w-xl mx-auto mb-10 max-sm:mb-7">
          <span className="section-kicker block text-[9px] tracking-[2.6px] font-bold text-[#a18448] uppercase mb-3.5">
            03 / FROM OUR KITCHEN
          </span>
          <h2 className="font-serif text-[clamp(34px,4vw,48px)] max-sm:text-3xl leading-[1.1] tracking-[-0.8px] text-brand-green font-semibold m-0">
            Our Menu
          </h2>
          <p className="text-[15px] max-sm:text-[13px] leading-[1.8] text-brand-muted mt-3 mb-0">
            Wholesome traditional meals and customised tiffin options to suit your requirements.
          </p>
          <div
            aria-hidden="true"
            className="w-[42px] h-[1px] bg-[#c7a45b] mx-auto mt-[23px]"
          />
        </div>

        {/* Interactive Tab Switcher with Animated Antique Gold Underline */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12 max-sm:mb-8 border-b border-[#e5dece]/80 max-w-md mx-auto">
          {/* Tab 1: All Selections */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`relative pb-3 text-[12px] sm:text-[13px] font-bold tracking-[1.2px] uppercase transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold rounded-sm ${
              activeTab === "all"
                ? "text-brand-green"
                : "text-brand-muted hover:text-brand-green"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-[#c7a45b]" strokeWidth={1.75} />
            <span>All Offerings</span>
            {activeTab === "all" && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#c7a45b] rounded-full transition-all duration-300 ease-out"
              />
            )}
          </button>

          {/* Tab 2: Full Meals */}
          <button
            type="button"
            onClick={() => setActiveTab("meals")}
            className={`relative pb-3 text-[12px] sm:text-[13px] font-bold tracking-[1.2px] uppercase transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold rounded-sm ${
              activeTab === "meals"
                ? "text-brand-green"
                : "text-brand-muted hover:text-brand-green"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-[#c7a45b]" strokeWidth={1.75} />
            <span>Full Meals</span>
            {activeTab === "meals" && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#c7a45b] rounded-full transition-all duration-300 ease-out"
              />
            )}
          </button>

          {/* Tab 3: Customised Tiffin */}
          <button
            type="button"
            onClick={() => setActiveTab("tiffin")}
            className={`relative pb-3 text-[12px] sm:text-[13px] font-bold tracking-[1.2px] uppercase transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold rounded-sm ${
              activeTab === "tiffin"
                ? "text-brand-green"
                : "text-brand-muted hover:text-brand-green"
            }`}
          >
            <CookingPot className="w-4 h-4 text-[#c7a45b]" strokeWidth={1.75} />
            <span>Customised Tiffin</span>
            {activeTab === "tiffin" && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#c7a45b] rounded-full transition-all duration-300 ease-out"
              />
            )}
          </button>
        </div>

        {/* Tab Panels with Smooth Content Fade & Layout Stability */}
        <div className="min-h-[520px]">
          <div
            className={`menu-grid grid gap-6 max-w-5xl mx-auto transition-opacity duration-300 ease-out ${
              activeTab === "all"
                ? "grid-cols-1 lg:grid-cols-2"
                : "grid-cols-1 max-w-2xl mx-auto"
            }`}
          >
            {/* Card 1: Full Meals */}
            {(activeTab === "all" || activeTab === "meals") && (
              <article className="menu-card group rounded-[2px] overflow-hidden bg-[#fffefa] border border-[#e0d5bd] shadow-[0_18px_45px_rgba(28,48,32,0.08)] transition-all duration-350 ease-out hover:-translate-y-2 hover:border-[#c7a45b]/50 hover:shadow-[0_26px_60px_rgba(28,48,32,0.13)] flex flex-col">
                <div className="relative min-h-[300px] sm:min-h-[345px] w-full overflow-hidden bg-[#173b2b]">
                  <Image
                    src="/images/traditional-meals.jpg"
                    alt="Traditional South Indian full meals on banana leaf"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-[1.10]"
                  />
                </div>

                <div className="menu-copy p-10 max-sm:p-6 flex-1 flex flex-col justify-start">
                  <div className="flex items-center gap-2.5 mb-3 min-h-[32px]">
                    <UtensilsCrossed className="w-5 h-5 text-[#a18448] shrink-0" strokeWidth={1.75} />
                    <h3 className="font-serif text-[26px] max-sm:text-2xl leading-[1.2] text-[#153e2c] font-semibold m-0">
                      Full Meals
                    </h3>
                  </div>
                  <div className="mb-4">
                    <span className="inline-block bg-[#eee5d0] border border-[#dcd0b5] text-[#8e7139] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Traditional Full Meals
                    </span>
                  </div>
                  <p className="text-[#697469] text-[14px] max-sm:text-[13px] leading-[1.9] m-0">
                    {FULL_MEALS_ITEMS.join(" · ")}
                  </p>
                </div>
              </article>
            )}

            {/* Card 2: Customised Tiffin */}
            {(activeTab === "all" || activeTab === "tiffin") && (
              <article className="menu-card group rounded-[2px] overflow-hidden bg-[#fffefa] border border-[#e0d5bd] shadow-[0_18px_45px_rgba(28,48,32,0.08)] transition-all duration-350 ease-out hover:-translate-y-2 hover:border-[#c7a45b]/50 hover:shadow-[0_26px_60px_rgba(28,48,32,0.13)] flex flex-col">
                <div className="relative min-h-[300px] sm:min-h-[345px] w-full overflow-hidden bg-[#173b2b]">
                  <Image
                    src="/images/a_high_quality_well_lit_food_product_photography.png"
                    alt="Customised stainless steel tiffin container with South Indian tiffin items"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-[1.10]"
                  />
                </div>

                <div className="menu-copy p-10 max-sm:p-6 flex-1 flex flex-col justify-start">
                  <div className="flex items-center gap-2.5 mb-3 min-h-[32px]">
                    <CookingPot className="w-5 h-5 text-[#a18448] shrink-0" strokeWidth={1.75} />
                    <h3 className="font-serif text-[26px] max-sm:text-2xl leading-[1.2] text-[#153e2c] font-semibold m-0">
                      Customised Tiffin
                    </h3>
                  </div>
                  <div className="mb-4">
                    <span className="inline-block bg-[#eee5d0] border border-[#dcd0b5] text-[#8e7139] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Customised Selections
                    </span>
                  </div>
                  <p className="text-[#697469] text-[14px] max-sm:text-[13px] leading-[1.8] m-0 mb-3">
                    Tiffin combinations curated based on your team&apos;s needs and preferences.
                  </p>
                  <p className="text-[#697469] text-[14px] max-sm:text-[13px] leading-[1.9] m-0">
                    {TIFFIN_ITEMS.join(" · ")}
                  </p>
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
