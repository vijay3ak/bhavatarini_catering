import React from "react";
import Image from "next/image";
import { UtensilsCrossed, CookingPot } from "lucide-react";

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
        <div className="section-head text-center max-w-xl mx-auto mb-14 max-sm:mb-9">
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

        {/* Menu Grid */}
        <div className="menu-grid grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Full Meals */}
          <article className="menu-card group rounded-[2px] overflow-hidden bg-[#fffefa] border border-[#e0d5bd] shadow-[0_18px_45px_rgba(28,48,32,0.08)] transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_26px_60px_rgba(28,48,32,0.13)] flex flex-col">
            <div className="relative min-h-[300px] sm:min-h-[345px] w-full overflow-hidden bg-[#173b2b]">
              <Image
                src="/images/traditional-meals.jpg"
                alt="Traditional South Indian full meals on banana leaf"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.035] group-hover:saturate-[1.12]"
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

          {/* Card 2: Customised Tiffin */}
          <article className="menu-card group rounded-[2px] overflow-hidden bg-[#fffefa] border border-[#e0d5bd] shadow-[0_18px_45px_rgba(28,48,32,0.08)] transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_26px_60px_rgba(28,48,32,0.13)] flex flex-col">
            <div className="relative min-h-[300px] sm:min-h-[345px] w-full overflow-hidden bg-[#173b2b]">
              <Image
                src="/images/a_high_quality_well_lit_food_product_photography.png"
                alt="Customised stainless steel tiffin container with South Indian tiffin items"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.035] group-hover:saturate-[1.12]"
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
        </div>
      </div>
    </section>
  );
}
