"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ActiveSectionInfo } from "@/lib/hooks/use-active-section";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  activeSection: ActiveSectionInfo;
}

const NAV_LINKS = [
  { href: "#home", label: "Home", sectionId: "home" },
  { href: "#services", label: "Services", sectionId: "services" },
  { href: "#menu", label: "Menu", sectionId: "menu" },
  { href: "#why", label: "Why Us", sectionId: "why" },
  { href: "#contact", label: "Contact", sectionId: "contact" },
];

export function Header({ activeSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setMobileMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-[31px] max-sm:top-[28px] z-30 bg-[#faf8f1]/95 backdrop-blur-md border-b border-[#e5dece] transition-all">
      <div className="max-w-container mx-auto px-4 sm:px-[5%] py-[13px] max-sm:py-[9px] flex items-center justify-between gap-4 relative">
        {/* Brand Link */}
        <Link
          href="#home"
          className="flex items-center gap-[11px] text-[#173f2d] no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-sm shrink-0"
        >
          <span
            aria-hidden="true"
            className="w-[37px] h-[37px] max-sm:w-[33px] max-sm:h-[33px] rounded-full grid place-items-center text-[19px] max-sm:text-[17px] leading-none text-[#17432f] border border-[#c6a45e] shadow-[0_5px_18px_rgba(17,47,31,0.1),inset_0_0_0_4px_rgba(255,255,255,0.55)] transition-transform group-hover:scale-105"
            style={{
              background: "linear-gradient(145deg, #f6f0df, #e6d8b4)",
            }}
          >
            ♨
          </span>
          <span className="flex flex-col">
            <span className="font-serif text-[19px] sm:text-[21px] max-sm:text-[17px] font-bold leading-none tracking-[-0.2px] text-[#173f2d]">
              Bhavatarini
            </span>
            <small className="font-sans text-[9px] max-sm:text-[8px] font-semibold tracking-[1.8px] max-sm:tracking-[1.2px] uppercase text-[#876d3a] mt-[3px]">
              Catering Service
            </small>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          id="nav-desktop"
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-[28px]"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection.id === link.sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "location" : undefined}
                className={`text-[12px] font-bold tracking-[1px] uppercase transition-colors relative py-[12px] ${
                  isActive
                    ? "text-[#997b3e] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#c7a45b] before:content-[''] before:absolute before:w-[5px] before:h-[5px] before:rounded-full before:bg-[#c7a45b] before:top-1 before:left-1/2 before:-translate-x-1/2"
                    : "text-[#425047] hover:text-brand-green after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#c7a45b] hover:after:w-full after:transition-all after:duration-300"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Header Right Action & Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* CTA: hidden on mobile <= md as in original prototype */}
          <a
            href="#contact"
            className="btn-sheen hidden md:inline-flex items-center gap-1.5 px-[18px] py-[10px] rounded-[2px] text-[11px] font-bold tracking-[1px] uppercase text-[#f4ecda] border border-[#c7a45b]/35 shadow-sm transition-all duration-300 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            style={{
              background: "linear-gradient(135deg, #174a34, #0d3021)",
            }}
          >
            <span>Enquire Now</span>
            <span aria-hidden="true" className="text-brand-gold">
              ↗
            </span>
          </a>

          <button
            id="toggle"
            ref={toggleRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="nav-mobile"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            className="md:hidden w-9 h-9 flex items-center justify-center text-[#173f2d] rounded-sm hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        id="nav-mobile"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-[#e5dece] bg-[#faf8f1] shadow-[0_16px_32px_rgba(18,60,44,0.12)] ${
          mobileMenuOpen ? "max-h-96 opacity-100 py-4 px-[5%]" : "max-h-0 opacity-0 py-0 px-[5%]"
        }`}
      >
        <nav className="flex flex-col gap-2.5">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection.id === link.sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                aria-current={isActive ? "location" : undefined}
                className={`py-2 px-3 text-sm font-semibold rounded-sm transition-colors flex items-center justify-between ${
                  isActive
                    ? "bg-[#eee7d7] text-[#997b3e] font-bold"
                    : "text-[#536054] hover:bg-[#f5f0e4] hover:text-brand-green"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c7a45b]"></span>
                )}
              </a>
            );
          })}

          <div className="pt-2 border-t border-[#e5dece]/60 mt-1">
            <a
              href="#contact"
              onClick={handleLinkClick}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[2px] text-xs font-bold text-[#f4ecda] shadow-sm"
              style={{
                background: "linear-gradient(135deg, #174a34, #0d3021)",
              }}
            >
              <span>Enquire Now</span>
              <span aria-hidden="true" className="text-brand-gold">
                ↗
              </span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
