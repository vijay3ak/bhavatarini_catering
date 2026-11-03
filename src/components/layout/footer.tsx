import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { MapPin, Phone, MessageSquare, ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="pt-16 pb-12 text-[#c8d3c8] border-t border-[#c7a45b]/25"
      style={{
        background: "linear-gradient(135deg, #09271a 0%, #123c2a 50%, #0c2b1d 100%)",
      }}
    >
      <div className="max-w-container mx-auto px-4 sm:px-[5%]">
        {/* Multi-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">
          {/* Column 1: Brand & Heritage */}
          <div className="space-y-4">
            <strong className="font-serif text-[24px] max-sm:text-[22px] text-[#e2cb8e] font-semibold block leading-[1.2]">
              {siteConfig.name}
            </strong>
            <p className="text-[13px] leading-[1.8] text-[#c8d3c8]/85 m-0">
              Traditional South Indian meals and customised tiffin catering for corporate offices, startups, small functions and gatherings in Coimbatore.
            </p>
            <div className="flex items-center gap-2 text-[12px] text-[#c7a45b]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{siteConfig.location}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold tracking-[2px] text-[#e2cb8e] uppercase m-0">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-[13px] list-none p-0 m-0">
              <li>
                <a
                  href="#services"
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1"
                >
                  Catering Services
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1"
                >
                  The Experience
                </a>
              </li>
              <li>
                <a
                  href="#menu"
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1"
                >
                  Our Menu
                </a>
              </li>
              <li>
                <a
                  href="#why"
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1"
                >
                  Why Bhavatarini Catering
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1"
                >
                  Contact & Enquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Confirmed Services */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold tracking-[2px] text-[#e2cb8e] uppercase m-0">
              Catering Services
            </h4>
            <ul className="space-y-2.5 text-[13px] list-none p-0 m-0 text-[#c8d3c8]/85">
              <li>Corporate Catering</li>
              <li>Startup & Office Catering</li>
              <li>Small Family Functions</li>
              <li>Group Gatherings</li>
              <li>Daily Meal Supply</li>
            </ul>
          </div>

          {/* Column 4: Enquiries & Planning */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold tracking-[2px] text-[#e2cb8e] uppercase m-0">
              Enquiries & Bookings
            </h4>
            <p className="text-[13px] leading-[1.8] text-[#c8d3c8]/85 m-0">
              Share your event dates, head counts, and menu preferences to receive a tailored catering proposal.
            </p>
            <div className="pt-1">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-[2px] text-[#123c2c] bg-[#e2cb8e] hover:bg-[#d5bc7c] transition-colors"
              >
                <span>Plan Your Catering</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
            {siteConfig.contact.phone ? (
              <div className="pt-1 text-[12px]">
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#c7a45b]" />
                  <span>{siteConfig.contact.phone}</span>
                </a>
              </div>
            ) : null}
            {siteConfig.contact.whatsapp ? (
              <div className="pt-0.5 text-[12px]">
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c8d3c8]/85 hover:text-[#e2cb8e] transition-colors inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#c7a45b]" />
                  <span>+{siteConfig.contact.whatsapp}</span>
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] tracking-[0.3px] text-[#c8d3c8]/70 text-center sm:text-left">
          <p className="m-0">
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="m-0 text-[#c8d3c8]/50">
            Traditional Taste · Quality Service · Coimbatore, Tamil Nadu
          </p>
        </div>
      </div>
    </footer>
  );
}
