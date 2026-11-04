import React from "react";
import { CookingPot, SlidersHorizontal, ShieldCheck, CalendarCheck } from "lucide-react";

const WHY_ITEMS = [
  {
    icon: CookingPot,
    title: "Traditional Recipes",
    description:
      "South Indian meals and tiffin prepared with customary care and authentic flavours.",
  },
  {
    icon: SlidersHorizontal,
    title: "Tailored Portions",
    description:
      "Arrangements organized around your specific guest count and event requirements.",
  },
  {
    icon: ShieldCheck,
    title: "Attentive Preparation",
    description:
      "Hygienic kitchen care and wholesome standards across every dish we serve.",
  },
  {
    icon: CalendarCheck,
    title: "Dependable Coordination",
    description:
      "Clear, organized catering support from initial planning through timely service.",
  },
];

export function WhyUsSection() {
  return (
    <section id="why" className="py-24 max-sm:py-14 bg-[#fffefa]">
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        {/* Section Head */}
        <div className="section-head text-center max-w-xl mx-auto mb-14 max-sm:mb-9">
          <span className="section-kicker block text-[9px] tracking-[2.6px] font-bold text-[#a18448] uppercase mb-3.5">
            04 / THE BHAVATARINI PROMISE
          </span>
          <h2 className="font-serif text-[clamp(34px,4vw,48px)] max-sm:text-3xl leading-[1.1] tracking-[-0.8px] text-brand-green font-semibold m-0">
            Why Bhavatarini Catering
          </h2>
          <p className="text-[15px] max-sm:text-[13px] leading-[1.8] text-brand-muted mt-3 mb-0">
            Good food, thoughtful preparation and dependable service.
          </p>
          <div
            aria-hidden="true"
            className="w-[42px] h-[1px] bg-[#c7a45b] mx-auto mt-[23px]"
          />
        </div>

        {/* Why Grid */}
        <div className="why grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-sm:gap-4">
          {WHY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="why-item group relative overflow-hidden rounded-[2px] p-7 max-sm:p-5 flex flex-col items-center text-center gap-4 border border-[#e5dcc9] shadow-[0_10px_28px_rgba(24,52,35,0.045)] transition-all duration-350 ease-out hover:-translate-y-2 hover:border-[#c9ad70] hover:shadow-[0_20px_42px_rgba(24,52,35,0.10)] cursor-default"
                style={{
                  background: "linear-gradient(145deg, #fffefa, #f7f2e7)",
                }}
              >
                {/* Bottom Gold Accent Line Animation */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-350 ease-out origin-center pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #c7a45b, transparent)",
                  }}
                />

                <div
                  aria-hidden="true"
                  className="w-14 h-14 shrink-0 rounded-full grid place-items-center border border-[#ddcca6] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.6)] transition-transform duration-400 ease-out group-hover:scale-110"
                  style={{
                    background: "linear-gradient(145deg, #f8f1df, #ebe1c9)",
                  }}
                >
                  <Icon
                    className="w-6 h-6 text-[#8e7139]"
                    strokeWidth={1.75}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-[#173e2d] text-[17px] max-sm:text-[15px] leading-[1.3] m-0">
                    {item.title}
                  </h3>
                  <p className="text-[13px] max-sm:text-[12px] leading-[1.65] text-[#69746a] m-0">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
