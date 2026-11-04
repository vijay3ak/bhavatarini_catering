# Bhavatarini Catering Service — Visual Asset, Logo & Iconography Audit

**Document Reference:** `docs/WEBSITE_ASSET_AUDIT.md`  
**Date:** November 2026  
**Status:** Complete Audit & Strategy Proposal (Stage A)  
**Target Codebase:** Next.js App Router (`src/`, `public/`)  
**Design Reference:** `docs/reference/bhavatarini_catering_royal_green_premium_v2.html`

---

## Executive Summary

The visual identity of Bhavatarini Catering Service is anchored in a royal forest green (`#123c2c`), antique gold (`#c7a45b`), and warm ivory (`#faf8f1`) heritage palette. While the CSS tokens and card architecture reproduce the reference prototype faithfully, a forensic examination of the visual assets (`public/images/`, component SVGs, Unicode symbols, and icons) reveals four critical liabilities:

1. **Asset Duplication (3x Reuse):** A single 65.9 KB image (`traditional-meals.jpg`, $594 \times 403\text{px}$) is reused across the Hero section, Experience Section Card 02, and Menu Section Card 01.
2. **Massive AI Image Asset (2.75 MB):** The Customised Tiffin image (`a_high_quality_well_lit_food_product_photography.png`) is an uncompressed $1448 \times 1086\text{px}$ PNG with synthetic AI lighting and a literal AI prompt in its filename. This single asset accounts for >90% of the entire website's network payload.
3. **Absence of Brand Logo & Favicon Suite:** The brand mark currently relies on a Unicode hot springs glyph (`♨`) inside a CSS radial gradient circle. No vector SVG logo, favicon package, or Apple touch icon exists in `public/`.
4. **Symbol Inconsistency & Overuse:** Across seven sections, 10 different Unicode glyphs are scattered without visual hierarchy. The clover character `♧` is repeated 5 distinct times for unrelated concepts, and a modern cartoon rocket emoji `🚀` clashes directly with the traditional South Indian aesthetic.

This document provides a comprehensive audit of all existing assets and specifies actionable, non-destructive replacements to elevate the website to luxury culinary standards.

---

## 1. Inventory & Forensic Analysis of Existing Assets

### 1.1 Raster Image Inventory

| Asset Path | Format | Dimensions | File Size | Current Placements | Visual & Technical Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/images/traditional-meals.jpg` | JPEG | $594 \times 403\text{px}$ | 65.9 KB | 1. Hero Right Column<br>2. Experience Card 02<br>3. Menu Card 01 (Full Meals) | **Severe resolution deficiency for Hero:** Rendered on desktops at $650\text{px} \times 620\text{px}$, causing visible blurriness and interpolation artifacts.<br>**Triple reuse:** Visitors see the exact same meal photo 3 times while scrolling.<br>**Format:** Outdated JPEG lacking modern WebP/AVIF compression. |
| `public/images/a_high_quality_well_lit_food_product_photography.png` | PNG | $1448 \times 1086\text{px}$ | **2,751,194 B (2.75 MB)** | Menu Card 02 (Customised Tiffin) | **Critical performance bottleneck:** Takes 2.5–4s on mobile connections, severely degrading Google Core Web Vitals (LCP).<br>**AI synthetic aesthetic:** Unnatural plastic lighting on samosas/vadas and glossy rendering of stainless steel container.<br>**Uncompressed PNG format:** Unsuitable for photographic content. |

### 1.2 Missing Essential Web Assets

The root `public/` directory contains only the `images/` folder. The following mandatory web assets are completely absent:

- `public/favicon.ico` (multi-resolution 16x16, 32x32, 48x48)
- `public/icon.png` (32x32 standard browser icon)
- `public/apple-icon.png` (180x180 iOS home screen touch icon)
- `public/icon-192.png` & `public/icon-512.png` (PWA / Android manifests)
- `public/brand/bhavatarini-logo.svg` (scalable vector brand identity mark)
- `public/images/og-bhavatarini.jpg` (Open Graph / social preview card for WhatsApp, Facebook, LinkedIn, Twitter/X)
- `public/robots.txt` & `public/sitemap.xml` (SEO indexing directives)

---

## 2. Brand Identity & Logo Specification

### 2.1 Current Implementation: The Unicode `♨` Hot Springs Glyph

In `src/components/layout/header.tsx` (lines 50–58), the header brand mark is constructed as follows:

```tsx
<span
  aria-hidden="true"
  className="w-[37px] h-[37px] max-sm:w-[33px] max-sm:h-[33px] rounded-full grid place-items-center text-[19px] max-sm:text-[17px] leading-none text-[#17432f] border border-[#c6a45e] shadow-[0_5px_18px_rgba(17,47,31,0.1),inset_0_0_0_4px_rgba(255,255,255,0.55)] transition-transform group-hover:scale-105"
  style={{ background: "linear-gradient(145deg, #f6f0df, #e6d8b4)" }}
>
  ♨
</span>
```

#### Deficiencies:
1. **Cultural Mismatch:** Character U+2668 is the international onsen/hot-springs symbol. For a South Indian vegetarian catering establishment, it communicates steam baths rather than culinary heritage.
2. **Platform Inconsistency:** Unicode rendering varies wildly between platforms: Segoe UI (Windows) renders a thin black line glyph, Apple SF Pro renders a simplified monochrome sign, while some Android builds render an emoji-style colored icon.
3. **Zero Print / Vector Scalability:** Cannot be used for business cards, vehicle branding, catering invoice headers, or high-DPI retina screens.

### 2.2 Recommended Logo Specification

Until the business owner provides their official vector trademark, we recommend replacing the raw Unicode character with a clean, bespoke inline SVG emblem that preserves the exact same circular gold medallion dimensions ($37\text{px} \times 37\text{px}$):

- **Emblem Concept:** A traditional South Indian brass deepam (lamp of auspicious beginnings) or an artisanal culinary flame entwined with a grain stalk / banana leaf contour, drawn in vector strokes with brand antique gold (`#c7a45b`).
- **Typography Pairing:** "Bhavatarini" in Playfair Display Bold (tracking -0.2px) paired with "Catering Service" in DM Sans uppercase (tracking 1.8px).
- **Favicon Suite:** Export the circular medallion emblem to:
  * `app/favicon.ico` ($32 \times 32\text{px}$)
  * `app/apple-icon.png` ($180 \times 180\text{px}$)
  * `app/icon.png` ($512 \times 512\text{px}$)

---

## 3. Iconography & Symbol Harmonization Audit

### 3.1 Forensic Audit of Current Symbols Across Sections

| Section | Symbol | Symbol Name / Unicode | Concept Represented | Issues & Evaluation |
| :--- | :---: | :--- | :--- | :--- |
| **Header** | `♨` | U+2668 Hot Springs | Brand Medallion | Unrelated Japanese hot spring symbol; platform-dependent rendering. |
| **Hero CTA** | `☏` | U+260F White Telephone | WhatsApp Button | Outdated landline handset glyph on a modern WhatsApp button. |
| **Trust Strip (1)** | `❧` | U+2767 Rotated Floral Heart | Traditional Taste | Classical fleuron; acceptable heritage tone. |
| **Trust Strip (2)** | `♧` | U+2667 White Clover | Hygienic & Safe | Clover has no cultural link to food hygiene. |
| **Trust Strip (3)** | `♧` | U+2667 White Clover | Flexible for Your Needs | **Duplicate symbol in the very same strip!** |
| **Trust Strip (4)** | `▣` | U+25A3 White Square Containing Black Small Square | Reliable Service | Pure geometric math character; impersonal and cold. |
| **Services (1)** | `▦` | U+25A6 Square with Orthogonal Crosshatch | Corporate Catering | Window grille / grid symbol; generic. |
| **Services (2)** | `🚀` | U+1F680 Rocket Emoji | Startup & Office Catering | **Severe tonal clash:** Modern colored cartoon emoji in a luxury heritage layout. |
| **Services (3)** | `✧` | U+2727 White Four Pointed Star | Small Functions | Acceptable festive accent. |
| **Services (4)** | `♧` | U+2667 White Clover | Group Gatherings | **Clover repeated for a 3rd time across the site.** |
| **Experience (1)** | `✦` | U+2726 Black Four Pointed Star | Card 01 (Planning) | Elegant sparkle accent. |
| **Experience (3)** | `❋` | U+274B Heavy Eight Teardrop-Spoke Propeller Florette | Card 03 (Menu Choice) | Complex botanical snowflake. |
| **Experience (4)** | `♧` | U+2667 White Clover | Card 04 (We Prepare) | **Clover repeated for a 4th time across the site.** |
| **Why Us (1)** | `✿` | U+273F Black Florette | Consistent Quality | Clean floral symbol. |
| **Why Us (2)** | `▣` | U+25A3 Square Containing Square | Flexible & Customisable | Duplicate geometric symbol from Trust Strip. |
| **Why Us (3)** | `♧` | U+2667 White Clover | Carefully Prepared | **Clover repeated for a 5th time across the site!** |
| **Why Us (4)** | `♡` | U+2661 White Heart Suit | Service You Can Rely On | Playing card heart suit; feels casual/dating rather than commercial catering. |
| **Menu (1)** | `❧` | U+2767 Rotated Floral Heart | Full Meals Heading | Duplicate fleuron. |
| **Menu (2)** | `♨` | U+2668 Hot Springs | Tiffin Heading | Duplicate hot springs glyph. |

### 3.2 Harmonization Strategy: Lucide React / Tailored SVGs

The project already has `lucide-react` installed in `package.json` and utilized in `Header` (`Menu`, `X`) and `ContactSection` (`AlertCircle`, `Check`). We recommend replacing disparate Unicode characters with cohesive, hairline Lucide icons or dedicated micro-SVGs styled with antique gold strokes (`text-[#a18448]`):

```mermaid
graph TD
    subgraph Current Fragmented State
        A["♨ Landline / Rocket 🚀"]
        B["♧ Clover (Repeated 5x)"]
        C["▣ Geometric Math Grids"]
        D["♡ Card Suit Hearts"]
    end
    subgraph Proposed Harmonized System
        E["Corporate: Briefcase / Building2"]
        F["Startup & Office: Users / Sparkles"]
        G["Small Functions: PartyPopper / Home"]
        H["Group Gatherings: UtensilsCrossed"]
        I["Trust: ShieldCheck, Clock, Flame, Utensils"]
        J["Why Us: Award, Sparkles, ChefHat, HeartHandshake"]
    end
    Current Fragmented State -.->|Standardize with Lucide| Proposed Harmonized System
```

---

## 4. Photography Specification & Asset Replacement Plan

To eliminate image duplication and provide crisp retina-ready visuals across all devices, four distinct photographs are required:

### 4.1 Photo Specification Matrix

| Slot | Target Element | Subject Matter & Composition | Dimensions & Ratio | Target Format & Size | SEO Alt Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Photo 1** | **Hero Section** (Right Banner) | **Heritage South Indian Culinary Atmosphere:** Elegant, wide-angle presentation of a traditional South Indian feast or artisanal brass serving spread. Warm golden lighting highlighting steam, fresh banana leaf, and authentic cookware. | $1920 \times 1080\text{px}$<br>(16:9 Landscape) | WebP (80% quality)<br>**$\le 140\text{ KB}$** | `"Authentic South Indian catering service feast arranged on fresh banana leaves with traditional brass ware"` |
| **Photo 2** | **Experience Section** (Card 02 — "Made to Suit Your Day") | **Warm Hospitality & Serving Detail:** Vertical culinary framing showing warm service hospitality—such as traditional sambar being ladled into brass katori or a beautifully garnished festive thali. Deep, rich shadows in the top third to allow text overlay readability. | $800 \times 1000\text{px}$<br>(4:5 Portrait) | WebP (82% quality)<br>**$\le 85\text{ KB}$** | `"Traditional South Indian catering hospitality and wholesome meal preparation for events"` |
| **Photo 3** | **Menu Section** (Card 01 — Signature Full Meals) | **Traditional Banana Leaf Sapadu:** Top-down/45-degree angle of a complete Tamil Nadu ceremonial vegetarian meal on a clean green banana leaf: steaming Ponni rice with ghee & paruppu, drumstick sambar, pepper rasam, vatha kuzhambu, cabbage poriyal, avial, appalam, vadai, and semiya payasam in a brass bowl. | $1000 \times 750\text{px}$<br>(4:3 Landscape) | WebP (82% quality)<br>**$\le 95\text{ KB}$** | `"Traditional South Indian full meals on banana leaf with sambar, rasam, kootu, poriyal, payasam, and appalam"` |
| **Photo 4** | **Menu Section** (Card 02 — Customised Tiffin) | **Authentic Fresh South Indian Tiffin:** Authentic breakfast/evening spread featuring steaming soft idlis, crisp golden medu vada, fresh coconut and tomato chutney in small bowls, hot sambar, and a folded golden ghee roast dosa. Genuine culinary photography (replacing the synthetic AI image). | $1000 \times 750\text{px}$<br>(4:3 Landscape) | WebP (82% quality)<br>**$\le 95\text{ KB}$** | `"Fresh South Indian tiffin catering spread with steamed idlis, crispy medu vada, and variety chutneys"` |

### 4.2 Social Sharing Asset (Open Graph Card)

- **Path:** `public/images/og-bhavatarini.jpg`
- **Dimensions:** $1200 \times 630\text{px}$ (1.91:1 standard Open Graph ratio)
- **Composition:** Royal forest green background (`#123c2c`), subtle gold framing border, Bhavatarini medallion logo, Playfair Display title *"Bhavatarini Catering Service"*, subtitle *"Traditional South Indian Catering · Wholesome Full Meals & Customised Tiffin"*, and location footer *"Coimbatore, Tamil Nadu"*.
- **Target File Size:** $\le 120\text{ KB}$ JPEG/WebP.

---

## 5. Web Performance Impact Analysis

### Current Asset Weight vs. Proposed Asset Weight

| Metric | Current Implementation | Proposed Optimized Implementation | Net Difference |
| :--- | :--- | :--- | :--- |
| `traditional-meals.jpg` (Hero) | 65.9 KB (low resolution $594\text{px}$) | ~135 KB ($1920\text{px}$ WebP, high-res) | +69.1 KB (4x resolution gain) |
| `traditional-meals.jpg` (Experience) | Reused (0 additional KB) | ~80 KB ($800\text{px}$ portrait WebP) | +80 KB (unique relevant asset) |
| `traditional-meals.jpg` (Menu Meals) | Reused (0 additional KB) | ~90 KB ($1000\text{px}$ WebP) | +90 KB (unique relevant asset) |
| Customised Tiffin PNG | **2,751.2 KB (2.75 MB PNG)** | **~90 KB (WebP photographic)** | **-2,661.2 KB (-96.7% payload)** |
| Logo / Favicon Assets | 0 KB (inline unicode glyph) | ~25 KB (SVG + multi-res favicon) | +25 KB |
| **Total Media Payload** | **2,817.1 KB (~2.82 MB)** | **~420 KB** | **-2,397.1 KB (-85.1% Total Reduction)** |

> [!TIP]
> **Page Speed & Core Web Vitals Projection:**  
> By compressing the oversized 2.75 MB PNG into a 90 KB WebP and properly sizing the hero asset, the Largest Contentful Paint (LCP) on 4G mobile connections will drop from **~3.8s to <1.1s**, positioning the site for a **95+ Google Lighthouse Performance Score**.

---

## 6. Implementation Checklist for Stage B

When approved by the project owner:

- [ ] **Step 1:** Procure or prepare four high-resolution authentic food photographs following the composition specifications in Section 4.1.
- [ ] **Step 2:** Convert all photographic assets to modern `.webp` with 80–82% quality and responsive density targets ($1920\text{px}$, $1000\text{px}$, $800\text{px}$).
- [ ] **Step 3:** Design and generate the vector medallion logo (`bhavatarini-logo.svg`) and the favicon suite (`favicon.ico`, `icon.png`, `apple-icon.png`).
- [ ] **Step 4:** Generate the official $1200 \times 630\text{px}$ Open Graph social preview banner (`og-bhavatarini.jpg`).
- [ ] **Step 5:** Replace the 5 repeated clover symbols and cartoon rocket emoji with cohesive Lucide icons in `ServicesSection`, `TrustStrip`, and `WhyUsSection`.
- [ ] **Step 6:** Update `next/image` components with exact dimensions, descriptive alt text, and `priority` flags strictly for the Hero banner.
