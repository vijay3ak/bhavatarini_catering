import React from "react";
import { CookingPot, ShieldCheck, SlidersHorizontal, Clock } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: CookingPot,
    title: "Traditional Taste",
    description: "Authentic South Indian food",
  },
  {
    icon: ShieldCheck,
    title: "Hygienic & Safe",
    description: "Care in every preparation",
  },
  {
    icon: SlidersHorizontal,
    title: "Flexible for Your Needs",
    description: "Meals, tiffin and custom orders",
  },
  {
    icon: Clock,
    title: "Reliable Service",
    description: "Planned and organised catering",
  },
];

export function TrustStrip() {
  return (
    <div className="w-full bg-[#faf8f1] border-b border-[#e5dece]">
      <div className="max-w-container mx-auto px-4 sm:px-[5%] py-[31px] max-sm:py-[13px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {TRUST_ITEMS.map((item, index) => {
            // Border logic: on desktop, 1, 2, 3 have right border. On tablet/mobile (2 cols), odd items (0, 2) have right border.
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`trust-item group min-h-[82px] max-sm:min-h-[77px] p-[14px_20px] max-sm:p-[12px_7px] flex items-center gap-[17px] max-sm:gap-[10px] transition-transform duration-300 ease-out hover:-translate-y-1 ${
                  index % 2 === 0 ? "border-r border-[#e5dece]" : ""
                } ${
                  index === 1 ? "lg:border-r border-[#e5dece]" : ""
                } ${
                  index === 2 ? "border-r border-[#e5dece]" : ""
                } ${
                  index === 3 ? "border-r-0" : ""
                } ${index >= 2 ? "max-lg:border-t border-[#e5dece]" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="trust-icon w-[48px] h-[48px] max-sm:w-[40px] max-sm:h-[40px] shrink-0 grid place-items-center rounded-full text-[#a18448] border border-[#c1a463]/40 shadow-sm transition-transform duration-300 ease-out group-hover:scale-[1.12]"
                  style={{
                    background: "linear-gradient(145deg, #fbf6e9, #eee5d0)",
                  }}
                >
                  <Icon className="w-5 h-5 max-sm:w-4 max-sm:h-4 text-[#a18448]" strokeWidth={1.75} />
                </span>

                <div>
                  <strong className="block mb-[5px] text-[#173e2d] text-[14px] max-sm:text-[11px] leading-[1.35] font-bold font-sans">
                    {item.title}
                  </strong>
                  <span className="block text-[#737b70] text-[11px] max-sm:text-[9px] leading-[1.6]">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
