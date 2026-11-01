import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/config/site";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123c2c",
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Traditional Taste, Every Occasion`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Catering Service Coimbatore",
    "Traditional South Indian Catering",
    "Corporate Catering Coimbatore",
    "Office Lunch Catering Coimbatore",
    "Startup Catering Coimbatore",
    "Customised Tiffin Coimbatore",
    "Bhavatarini Catering",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: `${siteConfig.name} | Traditional Taste, Every Occasion`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-brand-cream text-brand-ink antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
