import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { MapPin, Phone, MessageSquare, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative pt-16 pb-12 text-[#c8d3c8] border-t border-[#c7a45b]/25 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #09271a 0%, #123c2a 50%, #0c2b1d 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c7a45b]/60 to-transparent pointer-events-none"
      />
      <div className="max-w-container mx-auto px-4 sm:px-[5%] relative z-10">
        {/* Multi-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12">
          {/* Column 1: Brand & Heritage */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4 max-w-xl">
            <div className="flex items-center gap-3.5">
              <div className="relative w-[48px] h-[48px] max-sm:w-[42px] max-sm:h-[42px] shrink-0">
                <Image
                  src="/images/bhavatarini-chef-logo.png"
                  alt="Bhavatarini Catering Logo"
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
              <strong className="font-serif text-[22px] max-sm:text-[20px] text-[#e2cb8e] font-semibold block leading-[1.15]">
                {siteConfig.name}
              </strong>
            </div>
            <p className="text-[12px] max-sm:text-[11.5px] leading-[1.75] text-[#c8d3c8]/80 m-0">
              Traditional South Indian meals and customised tiffin catering for corporate offices, startups, small functions and gatherings in Coimbatore.
            </p>
            <div className="flex items-center gap-2 text-[12px] text-[#c7a45b]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{siteConfig.location}</span>
            </div>
          </div>

          {/* Navigation & Offerings Unit: Side-by-side on sm+ (>=640px) & desktop, stacked below 640px */}
          <div className="md:col-span-7 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold tracking-[2px] text-[#e2cb8e] uppercase m-0">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-[13px] list-none p-0 m-0">
                <li>
                  <a
                    href="#services"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Catering Services
                  </a>
                </li>
                <li>
                  <a
                    href="#experience"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    The Experience
                  </a>
                </li>
                <li>
                  <a
                    href="#menu"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Menu Selections
                  </a>
                </li>
                <li>
                  <a
                    href="#why"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Why Bhavatarini
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Enquiry Form
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Offerings (Immediately to the right of Quick Links on sm+, stacked with identical alignment on mobile) */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold tracking-[2px] text-[#e2cb8e] uppercase m-0">
                Offerings
              </h4>
              <ul className="space-y-2.5 text-[13px] list-none p-0 m-0">
                <li>
                  <a
                    href="#services"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Corporate Office Catering
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Startup & Team Food
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Small Private Functions
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Group Gatherings
                  </a>
                </li>
                <li>
                  <a
                    href="#menu"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Customised Tiffin
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Contact & Engagement */}
          <div className="md:col-span-5 lg:col-span-3 space-y-4">
            <h4 className="text-[11px] font-bold tracking-[2px] text-[#e2cb8e] uppercase m-0">
              Get in Touch
            </h4>
            <p className="text-[12px] leading-[1.7] text-[#c8d3c8]/80 m-0">
              Planning food for an office or occasion in Coimbatore? Send your requirement details for a tailored proposal.
            </p>
            <div className="space-y-2.5 text-[13px]">
              {siteConfig.contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#c7a45b] shrink-0" />
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    {siteConfig.contact.phone}
                  </a>
                </div>
              )}
              {siteConfig.contact.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#c7a45b] shrink-0" />
                  <a
                    href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] hover:translate-x-1.5 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    WhatsApp Chat
                  </a>
                </div>
              )}
            </div>
            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[1.2px] text-[#e2cb8e] uppercase hover:underline"
              >
                <span>Request a Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-[#c7a45b]/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] text-[#a4b5a4]">
          <p className="m-0 text-center sm:text-left">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-[#a4b5a4]/80">
              Coimbatore, Tamil Nadu · South Indian Catering
            </span>
            <Link
              href="#home"
              className="hover:text-[#e2cb8e] transition-colors font-semibold"
            >
              Back to Top ↑
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
