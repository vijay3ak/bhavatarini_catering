"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

export function HeroSection() {
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || !photoRef.current) return;

    const handleScroll = () => {
      if (window.innerWidth > 850 && photoRef.current) {
        const y = Math.min(window.scrollY, 500);
        photoRef.current.style.transform = `translateY(${y * 0.08}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappHref = siteConfig.contact.whatsapp
    ? `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        "Hello Bhavatarini Catering Service! I would like to enquire about catering."
      )}`
    : "";

  return (
    <section
      id="home"
      className="relative overflow-hidden p-0 isolation-isolate text-white"
      style={{
        background:
          "radial-gradient(ellipse at 15% 20%, #315d43 0%, #17432f 45%, #0b291d 100%)",
      }}
    >
      {/* Subtle Dot Matrix Pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[-1] opacity-12 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.35) 0.65px, transparent 0.65px)",
          backgroundSize: "7px 7px",
          maskImage: "linear-gradient(90deg, #000 0%, transparent 75%)",
          WebkitMaskImage: "linear-gradient(90deg, #000 0%, transparent 75%)",
        }}
      />

      <div className="w-full max-w-none grid grid-cols-1 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] min-h-[620px] max-lg:min-h-0 pl-[max(5%,calc((100%-1240px)/2))] max-lg:px-0">
        {/* Hero Copy Column */}
        <div className="py-[86px] pr-[4vw] pb-[82px] pl-0 max-lg:py-[68px] max-lg:px-[7%] max-lg:pb-[55px] max-sm:py-[48px] max-sm:px-[5%] max-sm:pb-[40px] flex flex-col justify-center max-w-[650px] z-10">
          <div className="eyebrow flex items-center gap-[13px] before:content-[''] before:w-[34px] before:h-[1px] before:bg-[#c9a85c] text-[10px] max-sm:text-[9px] tracking-[2.8px] max-sm:tracking-[2px] font-bold uppercase text-[#dfc77f] mb-3.5 font-sans animate-fade-in-up-1">
            Traditional South Indian Catering
          </div>

          <h1 className="font-serif text-[clamp(44px,5.2vw,76px)] max-sm:text-[clamp(30px,8vw,42px)] leading-[1.02] tracking-[-2px] max-sm:tracking-[-1px] font-semibold text-white my-0 mb-5 max-w-[650px] animate-fade-in-up-2">
            Good Food.
            <br />
            <em className="text-[#e2cb8e] font-medium not-italic">Beautifully</em> Served.
            <br />
            Every Occasion.
          </h1>

          <p className="text-[15px] max-sm:text-[13px] leading-[1.9] max-sm:leading-[1.75] text-white/80 max-w-[455px] my-0 mb-7 font-sans animate-fade-in-up-3">
            Homely, hygienic and reliable catering for corporate offices, startups, small functions and gatherings.
          </p>

          <div className="actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto animate-fade-in-up-4">
            <a
              href="#contact"
              className="btn-sheen inline-flex items-center justify-center px-6 py-3 rounded-[2px] text-[13px] font-bold tracking-[0.4px] text-[#15261d] border border-[#e5d19a] shadow-md transition-all duration-300 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-center"
              style={{
                background: "linear-gradient(135deg, #d4ba78, #b89347)",
              }}
            >
              Request a Quote →
            </a>

            {siteConfig.contact.whatsapp ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sheen inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[2px] text-[13px] font-semibold tracking-[0.4px] text-[#e9ece4] bg-white/[0.05] border border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-center"
              >
                <span>☏</span>
                <span>Chat on WhatsApp</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Hero Photo Column */}
        <div className="group relative min-h-[340px] lg:min-h-[620px] max-sm:min-h-[260px] overflow-hidden">
          <div
            ref={photoRef}
            className="absolute inset-[-5%] w-[110%] h-[110%] will-change-transform transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          >
            <Image
              src="/images/traditional-meals.jpg"
              alt="Traditional South Indian full meals served on a banana leaf"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center filter saturate-90"
            />
          </div>

          {/* Mask Gradient Overlays matching Prototype */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(17, 57, 39, 0.75) 0%, rgba(17, 57, 39, 0.25) 25%, transparent 50%), linear-gradient(0deg, rgba(10, 31, 21, 0.4) 0%, transparent 45%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
