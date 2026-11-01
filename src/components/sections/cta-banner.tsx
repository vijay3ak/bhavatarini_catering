import React from "react";

export function CtaBanner() {
  return (
    <div className="w-full bg-[#faf8f1] py-8">
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        <div
          className="cta relative overflow-hidden rounded-[2px] p-12 max-sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border border-[#c7a45b]/50 shadow-lg text-white"
          style={{
            background:
              "radial-gradient(ellipse at 90% 0%, #2c6244 0%, #17432f 48%, #0e3021 100%)",
          }}
        >
          {/* Top-Right Concentric Decorative Rings from Prototype */}
          <div
            aria-hidden="true"
            className="absolute w-[300px] h-[300px] rounded-full border border-[rgba(222,201,143,0.2)] right-[-110px] top-[-130px] shadow-[0_0_0_35px_rgba(222,201,143,0.035),0_0_0_70px_rgba(222,201,143,0.025)] pointer-events-none z-0"
          />

          <div className="relative z-10">
            <h2 className="font-serif text-[clamp(28px,3.5vw,42px)] max-sm:text-2xl leading-[1.15] font-semibold text-white m-0 mb-2.5">
              Planning a Corporate Meal
              <br />
              or an Event?
            </h2>
            <p className="text-white/80 text-[14px] max-sm:text-[13px] leading-relaxed m-0">
              Tell us what you need. We’ll help you plan the right menu.
            </p>
          </div>

          <div className="cta-actions relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto">
            <a
              href="#contact"
              className="btn-sheen animate-soft-pulse inline-flex items-center justify-center px-6 py-3 rounded-[2px] text-[13px] font-bold tracking-[0.4px] text-[#15261d] border border-[#e5d19a] shadow-md transition-all duration-300 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-center"
              style={{
                background: "linear-gradient(135deg, #d4ba78, #b89347)",
              }}
            >
              Request a Catering Quote →
            </a>

            <a
              href="#contact"
              className="btn-sheen inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[2px] text-[13px] font-semibold tracking-[0.4px] text-[#e9ece4] bg-white/[0.05] border border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-center"
            >
              <span>☏</span>
              <span>Send an Enquiry</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
