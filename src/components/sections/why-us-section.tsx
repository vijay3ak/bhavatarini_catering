import React from "react";

const WHY_ITEMS = [
  {
    symbol: "✿",
    title: "Consistent Quality",
  },
  {
    symbol: "▣",
    title: "Flexible & Customisable",
  },
  {
    symbol: "♧",
    title: "Carefully Prepared",
  },
  {
    symbol: "♡",
    title: "Service You Can Rely On",
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
            Why Choose Bhavatarini?
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
        <div className="why grid grid-cols-2 lg:grid-cols-4 gap-[18px] max-sm:gap-[10px]">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="why-item group relative overflow-hidden rounded-[2px] min-h-[190px] max-sm:min-h-[155px] p-[30px_20px_27px] max-sm:p-[20px_10px] flex flex-col items-center justify-center text-center gap-5 max-sm:gap-3.5 border border-[#e5dcc9] shadow-[0_10px_28px_rgba(24,52,35,0.045)] transition-all duration-350 ease-out hover:-translate-y-2 hover:border-[#c9ad70] hover:shadow-[0_20px_42px_rgba(24,52,35,0.10)] cursor-default"
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

              <span
                aria-hidden="true"
                className="w-[66px] h-[66px] max-sm:w-[55px] max-sm:h-[55px] shrink-0 rounded-full grid place-items-center text-[34px] max-sm:text-[29px] leading-none text-[#947640] border border-[#ddcca6] shadow-[inset_0_0_0_5px_rgba(255,255,255,0.48)] transition-transform duration-400 ease-out group-hover:rotate-[12deg] group-hover:scale-[1.15]"
                style={{
                  background: "linear-gradient(145deg, #f8f1df, #ebe1c9)",
                }}
              >
                {item.symbol}
              </span>

              <b className="font-sans font-bold text-[#173e2d] text-[15px] max-sm:text-[12px] leading-[1.45] tracking-[0.05px] max-w-[190px]">
                {item.title}
              </b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
