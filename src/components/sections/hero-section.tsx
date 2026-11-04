"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";

export function HeroSection() {
  const photoRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setIsRevealed(true);
      return;
    }

    // Check if loading screen is active in this session
    const hasLoader = !sessionStorage.getItem("bhavatarini_loader_shown");
    // If loader is active, wait until it begins fading out (1600ms); otherwise start immediately (120ms)
    const delay = hasLoader ? 1600 : 120;

    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delay);

    const handleScroll = () => {
      if (window.innerWidth > 850 && photoRef.current) {
        const y = Math.min(window.scrollY, 500);
        photoRef.current.style.transform = `translateY(${y * 0.08}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
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
          "radial-gradient(ellipse at 20% 25%, #1c573e 0%, #123c2c 55%, #0b291d 100%)",
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
          <div className="eyebrow flex items-center gap-[13px] text-[10px] max-sm:text-[9px] tracking-[2.8px] max-sm:tracking-[2px] font-bold uppercase text-[#dfc77f] mb-3.5 font-sans">
            {/* Animated Gold Accent Line via SVG stroke drawing */}
            <svg
              className="w-[34px] h-[2px] shrink-0 overflow-visible"
              viewBox="0 0 34 2"
              fill="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="1"
                x2="34"
                y2="1"
                stroke="#c7a45b"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={isRevealed ? "animate-gold-line-draw" : "opacity-0"}
                style={{
                  strokeDasharray: 34,
                  strokeDashoffset: isRevealed ? undefined : 34,
                }}
              />
            </svg>
            <span
              className={`transition-opacity duration-500 ${
                isRevealed ? "opacity-100" : "opacity-0"
              }`}
            >
              Traditional South Indian Catering
            </span>
          </div>

          <h1 className="font-serif text-[clamp(44px,5.2vw,76px)] max-sm:text-[clamp(30px,8vw,42px)] leading-[1.05] tracking-[-2px] max-sm:tracking-[-1px] font-semibold text-white my-0 mb-5 max-w-[650px]">
            {/* Line 1: Good Food. */}
            <div className="overflow-hidden py-1 -my-1">
              <span
                className={`block will-change-transform ${
                  isRevealed
                    ? "animate-hero-line-1"
                    : "opacity-0 translate-y-[108%]"
                }`}
              >
                Good Food.
              </span>
            </div>

            {/* Line 2: Beautifully Served. */}
            <div className="overflow-hidden py-1 -my-1">
              <span
                className={`block will-change-transform ${
                  isRevealed
                    ? "animate-hero-line-2"
                    : "opacity-0 translate-y-[108%]"
                }`}
              >
                <em className="text-[#e2cb8e] font-medium not-italic">
                  Beautifully
                </em>{" "}
                Served.
              </span>
            </div>

            {/* Line 3: Every Occasion. */}
            <div className="overflow-hidden py-1 -my-1">
              <span
                className={`block will-change-transform ${
                  isRevealed
                    ? "animate-hero-line-3"
                    : "opacity-0 translate-y-[108%]"
                }`}
              >
                Every Occasion.
              </span>
            </div>
          </h1>

          <p
            className={`text-[15px] max-sm:text-[13px] leading-[1.9] max-sm:leading-[1.75] text-white/80 max-w-[455px] my-0 mb-7 font-sans ${
              isRevealed ? "animate-hero-desc" : "opacity-0 translate-y-3"
            }`}
          >
            Homely, hygienic and reliable catering for corporate offices, startups, small functions and gatherings.
          </p>

          <div className="actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <a
              href="#contact"
              className={`btn-sheen-gold group/btn h-[46px] min-h-[46px] inline-flex items-center justify-center gap-1.5 px-6 rounded-[2px] text-[13px] font-bold tracking-[0.4px] text-[#15261d] border border-[#e5d19a] shadow-md transition-all duration-300 hover:brightness-[1.04] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(199,164,91,0.28)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-center ${
                isRevealed ? "animate-hero-btn-1" : "opacity-0 translate-y-3"
              }`}
              style={{
                background: "linear-gradient(135deg, #d4ba78, #b89347)",
              }}
            >
              <span>Request a Quote</span>
              <span className="inline-block transition-transform duration-250 ease-out group-hover/btn:translate-x-1.5">
                →
              </span>
            </a>

            {siteConfig.contact.whatsapp ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-sheen group/btn h-[46px] min-h-[46px] inline-flex items-center justify-center gap-2 px-6 rounded-[2px] text-[13px] font-semibold tracking-[0.4px] text-[#e9ece4] bg-white/[0.05] border border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold text-center ${
                  isRevealed ? "animate-hero-btn-2" : "opacity-0 translate-y-3"
                }`}
              >
                <span className="inline-block transition-transform duration-200 group-hover/btn:scale-110">☏</span>
                <span>Chat on WhatsApp</span>
              </a>
            ) : null}
          </div>

          {/* Restrained Scroll Prompt Indicator with gentle drift */}
          <div
            className={`hidden lg:flex items-center gap-2.5 mt-10 text-[10px] font-bold uppercase tracking-[2px] text-white/50 select-none ${
              isRevealed ? "animate-hero-scroll" : "opacity-0 translate-y-3"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c7a45b] shadow-[0_0_8px_rgba(199,164,91,0.6)]" />
            <span>Scroll to explore</span>
            <span className="inline-block animate-gentle-drift text-[#c7a45b]">↓</span>
          </div>
        </div>

        {/* Hero Photo Column with Subtle Initial Scale & Gentle Parallax */}
        <div className="group relative min-h-[340px] lg:min-h-[620px] max-sm:min-h-[260px] overflow-hidden bg-[#0b291d]">
          <div
            ref={photoRef}
            className="absolute inset-[-5%] w-[110%] h-[110%] will-change-transform transition-transform duration-700 ease-out"
          >
            <div
              className={`relative w-full h-full group-hover:scale-[1.02] transition-transform duration-700 ease-out ${
                isRevealed ? "animate-hero-photo" : "opacity-0 scale-[1.05]"
              }`}
            >
              <Image
                src="/images/traditional-meals.jpg"
                alt="Traditional South Indian full meals served on a banana leaf"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                quality={95}
                className="object-cover object-center filter saturate-90"
              />
            </div>
          </div>

          {/* Mask Gradient Overlays matching Prototype */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(18, 60, 44, 0.75) 0%, rgba(18, 60, 44, 0.25) 25%, transparent 50%), linear-gradient(0deg, rgba(11, 41, 29, 0.4) 0%, transparent 45%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
