import React from "react";
import Image from "next/image";

export function ExperienceSection() {
  return (
    <section
      id="our-approach"
      className="relative overflow-hidden pt-24 pb-12 max-sm:pt-14 max-sm:pb-8 text-white"
      style={{
        background:
          "radial-gradient(ellipse at 85% 10%, #28553d 0%, #163e2b 42%, #0c2b1e 100%)",
      }}
    >
      {/* Concentric Watermark Rings in Top-Right Background from Prototype */}
      <div
        aria-hidden="true"
        className="absolute w-[550px] h-[550px] rounded-full border border-[#dac385]/15 right-[-180px] top-[-230px] shadow-[0_0_0_45px_rgba(218,195,133,0.025),0_0_0_90px_rgba(218,195,133,0.02)] pointer-events-none z-0"
      />

      <div className="max-w-container mx-auto px-4 sm:px-[5%] relative z-10">
        {/* Top Header */}
        <div className="mb-11 max-sm:mb-8">
          <div className="text-[10px] tracking-[2.6px] font-extrabold text-[#e5c878] uppercase mb-4">
            02 — THE BHAVATARINI EXPERIENCE
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.65fr] gap-8 lg:gap-10 items-end">
            <h2 className="font-serif text-[clamp(39px,5.4vw,66px)] max-sm:text-3xl leading-[1.02] tracking-[-1.5px] font-semibold text-white m-0">
              Good food.
              <br />
              <em className="text-[#e7cb82] font-medium not-italic">Thoughtfully served.</em>
            </h2>
            <p className="text-[14px] max-sm:text-[13px] leading-[1.9] text-[#d5dfd2] max-w-[370px] m-0">
              From the first conversation to the final serving, we make catering feel simple, organised and welcoming.
            </p>
          </div>
        </div>

        {/* 4-Card Asymmetrical Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.05fr_1.25fr_1fr_1fr] gap-3.5">
          {/* Card 01 - Tell us planning */}
          <article
            className="group relative overflow-hidden rounded-[2px] p-7 max-sm:p-5 min-h-[310px] max-sm:min-h-[245px] flex flex-col justify-end border border-white/25 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-[400ms] ease-out hover:-translate-y-[9px] hover:shadow-[0_22px_40px_rgba(0,0,0,0.2)] text-[#17271e]"
            style={{
              background: "linear-gradient(145deg, #eee6d2, #dcd0b0)",
            }}
          >
            <div>
              <h3 className="font-serif text-[25px] max-sm:text-[21px] leading-[1.12] font-semibold text-[#17271e] mb-3">
                Tell us what
                <br />
                you’re planning.
              </h3>
              <p className="text-xs leading-[1.8] text-[#17271e]/80 max-w-[240px] m-0 mb-4">
                Share your occasion, guest count, location and food preferences.
              </p>
              <a
                href="#contact"
                className="inline-block text-[10px] tracking-[1.6px] font-bold text-[#123c2c] uppercase hover:underline"
              >
                START WITH AN ENQUIRY ↗
              </a>
            </div>
          </article>

          {/* Card 02 - Photo Card */}
          <article className="group relative overflow-hidden rounded-[2px] p-7 max-sm:p-5 min-h-[310px] max-sm:min-h-[245px] flex flex-col justify-end border border-white/25 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-[400ms] ease-out hover:-translate-y-[9px] hover:shadow-[0_22px_40px_rgba(0,0,0,0.2)]">
            <Image
              src="/images/traditional-meals.jpg"
              alt="Traditional catering setup"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Dark Mask Overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "linear-gradient(0deg, rgba(12, 43, 30, 0.94) 0%, rgba(12, 43, 30, 0.4) 60%, rgba(12, 43, 30, 0.15) 100%)",
              }}
            />
            <div className="relative z-20">
              <span className="block text-[9px] tracking-[1.5px] font-extrabold text-[#f0d98f] uppercase mb-2">
                MADE TO SUIT YOUR DAY
              </span>
              <h3 className="font-serif text-[25px] max-sm:text-[21px] leading-[1.12] font-semibold text-white m-0">
                A menu that
                <br />
                fits your people.
              </h3>
            </div>
          </article>

          {/* Card 03 - Choose Menu */}
          <article
            className="group relative overflow-hidden rounded-[2px] p-7 max-sm:p-5 min-h-[310px] max-sm:min-h-[245px] flex flex-col justify-end border border-white/25 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-[400ms] ease-out hover:-translate-y-[9px] hover:shadow-[0_22px_40px_rgba(0,0,0,0.2)] text-[#17271e]"
            style={{
              background: "linear-gradient(145deg, #fffdf7, #f0eadb)",
            }}
          >
            <div>
              <h3 className="font-serif text-[25px] max-sm:text-[21px] leading-[1.12] font-semibold text-[#17271e] mb-3">
                Choose your
                <br />
                menu.
              </h3>
              <p className="text-xs leading-[1.8] text-[#17271e]/80 max-w-[240px] m-0">
                Our signature full meals or a tiffin combination curated around your needs.
              </p>
            </div>
          </article>

          {/* Card 04 - We prepare You enjoy */}
          <article
            className="group relative overflow-hidden rounded-[2px] p-7 max-sm:p-5 min-h-[310px] max-sm:min-h-[245px] flex flex-col justify-end border border-white/25 shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-[400ms] ease-out hover:-translate-y-[9px] hover:shadow-[0_22px_40px_rgba(0,0,0,0.2)] text-[#15261d]"
            style={{
              background: "linear-gradient(145deg, #d8bd7d, #b9954c)",
            }}
          >
            <div>
              <h3 className="font-serif text-[25px] max-sm:text-[21px] leading-[1.12] font-semibold text-[#15261d] mb-3">
                We prepare.
                <br />
                You enjoy.
              </h3>
              <p className="text-xs leading-[1.8] text-[#15261d]/85 max-w-[240px] m-0">
                We coordinate the food arrangements for your office, function or gathering.
              </p>
            </div>
          </article>
        </div>

        {/* Section Foot: Responsive layout matching prototype */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-white/20 mt-8 pt-4 text-[9px] max-sm:text-[7.5px] tracking-[1.8px] max-sm:tracking-[1px] font-semibold text-white/60 uppercase select-none text-center sm:text-left">
          <span>PEOPLE&nbsp; / &nbsp;FOOD&nbsp; / &nbsp;OCCASIONS</span>
          <span>BHAVATARINI CATERING SERVICE</span>
        </div>
      </div>
    </section>
  );
}
