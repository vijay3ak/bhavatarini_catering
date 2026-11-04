import React from "react";
import { Building2, Users, PartyPopper, UsersRound } from "lucide-react";

const SERVICES = [
  {
    icon: Building2,
    title: "Corporate Catering",
    description: "Daily meals, office lunches, meetings and corporate events.",
    icoBg: "linear-gradient(145deg, #f8f1df, #eae0c7)",
  },
  {
    icon: Users,
    title: "Startup & Office Catering",
    description: "Breakfast, lunch and food arrangements for growing teams.",
    icoBg: "linear-gradient(145deg, #f4edda, #e5dfc9)",
  },
  {
    icon: PartyPopper,
    title: "Small Functions",
    description: "Housewarming, birthdays and private celebrations.",
    icoBg: "linear-gradient(145deg, #f7edda, #ead9c0)",
  },
  {
    icon: UsersRound,
    title: "Group Gatherings",
    description: "Food arrangements for social and community events.",
    icoBg: "linear-gradient(145deg, #edf0e4, #dfe7d8)",
  },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      className="py-24 max-sm:py-14"
      style={{
        background: "linear-gradient(180deg, #faf8f1 0%, #f5f0e4 100%)",
      }}
    >
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        {/* Section Head */}
        <div className="section-head text-center max-w-xl mx-auto mb-14 max-sm:mb-9">
          <span className="section-kicker block text-[9px] tracking-[2.6px] font-bold text-[#a18448] uppercase mb-3.5">
            01 / WHAT WE DO
          </span>
          <h2 className="font-serif text-[clamp(34px,4vw,48px)] max-sm:text-3xl leading-[1.1] tracking-[-0.8px] text-brand-green font-semibold m-0">
            Our Catering Services
          </h2>
          <p className="text-[15px] max-sm:text-[13px] leading-[1.8] text-brand-muted mt-3 mb-0">
            Catering solutions tailored for offices, teams and special occasions.
          </p>
          <div
            aria-hidden="true"
            className="w-[42px] h-[1px] bg-[#c7a45b] mx-auto mt-[23px]"
          />
        </div>

        {/* Services Grid (2 cols on tablet/mobile, 4 cols on desktop) */}
        <div className="services grid grid-cols-2 lg:grid-cols-4 gap-[18px] max-sm:gap-[11px]">
          {SERVICES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="service group relative overflow-hidden rounded-[2px] p-[34px_24px_30px] max-sm:p-[20px_14px_18px] max-[380px]:p-[18px_11px] min-h-[320px] max-sm:min-h-[250px] flex flex-col justify-between border border-[#e8dfcc] shadow-[0_10px_28px_rgba(24,52,35,0.045)] transition-all duration-[380ms] ease-out hover:-translate-y-2.5 hover:border-[#c9ad70] hover:shadow-[0_24px_48px_rgba(24,52,35,0.12)] cursor-default"
                style={{
                  background: "linear-gradient(145deg, #fffefa, #fbf8ef)",
                }}
              >
                {/* Top Animated Gold Accent Line */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 w-full h-[3px] scale-x-[0.18] group-hover:scale-x-100 origin-left transition-transform duration-400 ease-out"
                  style={{
                    background:
                      "linear-gradient(90deg, #a98642, #e3d19c, #a98642)",
                  }}
                />

                {/* Decorative Concentric Rings Watermark */}
                <div
                  aria-hidden="true"
                  className="absolute right-[-74px] bottom-[-82px] w-[150px] h-[150px] rounded-full border border-[rgba(184,151,83,0.18)] shadow-[0_0_0_18px_rgba(184,151,83,0.035),0_0_0_38px_rgba(184,151,83,0.025)] pointer-events-none transition-transform duration-500 ease-out group-hover:scale-125"
                />

                {/* Card Icon & Content */}
                <div>
                  <div
                    aria-hidden="true"
                    className="ico w-[62px] h-[62px] max-sm:w-[50px] max-sm:h-[50px] shrink-0 rounded-full grid place-items-center leading-none text-[#8e7139] border border-[#d9c79e] mb-7 max-sm:mb-4 shadow-[inset_0_0_0_5px_rgba(255,255,255,0.48),0_7px_16px_rgba(99,78,35,0.08)] transition-all duration-350 ease-out group-hover:-translate-y-1 group-hover:-rotate-6"
                    style={{ background: item.icoBg }}
                  >
                    <Icon className="w-7 h-7 max-sm:w-6 max-sm:h-6 text-[#8e7139]" strokeWidth={1.75} />
                  </div>

                  <h3 className="font-serif text-[23px] max-sm:text-[17px] max-[380px]:text-[15px] leading-[1.2] tracking-[-0.35px] text-[#153e2c] font-semibold mb-3 max-sm:mb-2 max-w-[230px]">
                    {item.title}
                  </h3>
                </div>

                <p className="text-[#697469] text-[13px] max-sm:text-[11px] max-[380px]:text-[10px] leading-[1.9] max-sm:leading-[1.65] max-w-[260px] m-0">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
