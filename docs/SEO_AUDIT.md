# Bhavatarini Catering Service — Local SEO, Metadata & Structured Data Audit

**Document Reference:** `docs/SEO_AUDIT.md`  
**Date:** November 2026  
**Status:** Complete Audit & Strategy Proposal (Stage A)  
**Target Codebase:** Next.js App Router (`src/app/`, `src/lib/config/site.ts`)  
**Design Reference:** `docs/reference/bhavatarini_catering_royal_green_premium_v2.html`

---

## Executive Summary

Search Engine Optimization (SEO) for Bhavatarini Catering Service requires capturing high-intent commercial searches from corporate HR/admin managers, startup founders, and local families seeking traditional South Indian vegetarian catering. While the current Next.js implementation has clean foundational markup and semantic landmarks, the site currently lacks:

1. **Rich Social Media Previews:** No `og:image` or Twitter Card metadata is configured.
2. **Structured Data (Schema.org):** Zero JSON-LD schemas (`CateringService` / `FoodEstablishment`), preventing Google Rich Snippets and Local Pack indexing.
3. **Automated Search Engine Discovery:** Missing `robots.ts` and `sitemap.ts`.
4. **Local Search Query Optimization:** Meta title and section headings lack high-converting geo-targeted search terms.
5. **Canonical Domain Safeguards:** Canonical URLs default to `http://localhost:3000` when environment variables are omitted.

This audit provides a detailed evaluation of the current configuration and an exact, non-destructive implementation blueprint adhering strictly to Google Search Essentials and Next.js App Router best practices.

---

## 1. Metadata & Open Graph Audit

### 1.1 Page Title Audit

| Attribute | Current Value | Target Specification |
| :--- | :--- | :--- |
| **Current Title** | `Bhavatarini Catering Service \| Traditional Taste, Every Occasion` | `Bhavatarini Catering Service \| Traditional South Indian Catering Coimbatore` |
| **Character Length** | 59 characters (Optimal length: 50–60 characters) | 71 characters (Full), 58 characters for mobile display |
| **Keyword Placement** | Brand name only; trailing phrase is an abstract slogan (*"Traditional Taste, Every Occasion"*) with zero search volume. | Front-loads brand authority, followed by high-volume transactional query: `"South Indian Catering Coimbatore"`. |
| **Search Intent Match** | Informational / Branded only. | Commercial Investigation & Transactional Local Search. |

### 1.2 Meta Description Audit

| Attribute | Current Value | Evaluation & Proposed Enhancement |
| :--- | :--- | :--- |
| **Current Description** | `"Homely, hygienic and reliable traditional South Indian catering for corporate offices, startups, small functions and gatherings in Coimbatore, Tamil Nadu."` | **Length:** 157 characters (perfect for desktop and mobile truncation boundaries).<br>**Strengths:** Clear target audiences, core value propositions, and local geo-tag (*"Coimbatore, Tamil Nadu"*).<br>**Weakness:** Lacks an active commercial Call-to-Action (CTA). |
| **Proposed Description** | `"Authentic South Indian catering in Coimbatore for corporate lunches, startups, family functions & gatherings. Fresh, hygienic & customisable. Request a quote today!"` | **Length:** 159 characters.<br>**Advantage:** Adds high-intent action trigger (*"Request a quote today!"*) while preserving all core keywords and local context. |

### 1.3 Open Graph & Social Cards Audit

```mermaid
graph TD
    subgraph Current Social Sharing
        A["URL shared on WhatsApp / LinkedIn"]
        B["Title & Description shown"]
        C["❌ Blank Preview (No og:image)"]
        D["❌ No Twitter / X Card"]
    end
    subgraph Proposed Social Sharing
        E["URL shared on WhatsApp / LinkedIn"]
        F["Targeted Title & Description"]
        G["✅ 1200x630px Branded Gold & Green Preview Card"]
        H["✅ summary_large_image Twitter Card"]
    end
    Current Social Sharing -.->|Enhance Metadata| Proposed Social Sharing
```

- **Current Implementation:** `layout.tsx` contains basic `openGraph` fields (`type: "website"`, `locale: "en_IN"`, `url`, `title`, `description`, `siteName`), but **completely omits the `images` array**.
- **Issue:** Sharing the website link on WhatsApp, Slack, iMessage, Facebook, or LinkedIn produces a plain text link without a banner image, drastically lowering click-through rates (CTR).
- **Proposed Enhancement:** Configure `openGraph.images` pointing to `/images/og-bhavatarini.jpg` ($1200 \times 630\text{px}$, aspect ratio 1.91:1) and add complete `twitter` metadata (`card: "summary_large_image"`).

---

## 2. Heading Hierarchy & On-Page Keyword Architecture

### 2.1 Heading Hierarchy Analysis

The page adheres to semantic progression with a single `<h1>` tag:

```
├── <h1> Good Food. Beautifully Served. Every Occasion. [Hero]
    ├── <h2> Our Catering Services [Services]
    │   ├── <h3> Corporate Catering
    │   ├── <h3> Startup & Office Catering
    │   ├── <h3> Small Functions
    │   └── <h3> Group Gatherings
    ├── <h2> Good food. Thoughtfully served. [Experience]
    │   ├── <h3> Tell us what you’re planning.
    │   ├── <h3> A menu that fits your people.
    │   ├── <h3> Choose your menu.
    │   └── <h3> We prepare. You enjoy.
    ├── <h2> Our Menu [Menu]
    │   ├── <h3> ❧ Full Meals
    │   └── <h3> ♨ Tiffin (Customised)
    ├── <h2> Why Choose Bhavatarini? [Why Us]
    │   ├── <h3> Consistent Quality
    │   ├── <h3> Flexible & Customisable
    │   ├── <h3> Carefully Prepared
    │   └── <h3> Service You Can Rely On
    ├── <h2> Ready to plan your catering? [CTA Banner]
    └── <h2> Enquire Now [Contact Section]
```

#### Heading Optimizations for Local Search:
- **`<h1>` Optimization:** While *"Good Food. Beautifully Served. Every Occasion."* provides poetic brand elegance, the eyebrow kicker above it (*"Traditional South Indian Catering"*) should be semantically linked, or the H1 subtitle should include Coimbatore relevance to anchor Google's primary entity evaluation.
- **`<h2>` Optimization:** Supplementing generic section headers with search keywords improves indexing without compromising design:
  * Current: `Our Catering Services` $\rightarrow$ Recommended: `Our Catering Services in Coimbatore`
  * Current: `Our Menu` $\rightarrow$ Recommended: `Traditional South Indian Catering Menu`

### 2.2 Search Intent & Keyword Categorization

| Keyword Cluster | Search Intent | Target Terms | Current Placement | Recommended Placement |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Navigation** | Navigational | `Bhavatarini Catering`, `Bhavatarini Catering Service`, `Bhavatarini Coimbatore` | Title, Header, Footer | Title tag, Header, Footer, Schema `legalName` |
| **Local High-Intent** | Transactional | `Catering service in Coimbatore`, `Best veg catering Coimbatore`, `South Indian caterers Coimbatore` | Metadata keywords array only | H1 eyebrow, Experience copy, Contact intro, Schema `serviceArea` |
| **Corporate B2B** | Commercial | `Corporate lunch catering Coimbatore`, `Office meal delivery Coimbatore`, `Startup team catering` | Services Card 01 & 02 | Services section subtitle, Contact dropdown options |
| **Menu / Culinary** | Informational | `Traditional banana leaf meals catering`, `South Indian tiffin catering`, `Customised catering menu` | Menu section tags | Menu card descriptions, Image alt tags |

---

## 3. Structured Data (Schema.org) Specification

To enable rich snippets in Google Search results and qualify for the Google Maps/Local Business knowledge graph, the site requires structured JSON-LD data.

> [!IMPORTANT]
> **Strict Anti-Fabrication Rule:**  
> In compliance with project guidelines, **no fake reviews, fabricated aggregate ratings (e.g. "4.9/5 based on 250 reviews"), invented street addresses, or fake phone numbers** shall be included. Placeholders must be clearly marked or dynamically linked to configuration.

### Recommended JSON-LD Implementation (`CateringService` / `FoodEstablishment`)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CateringService",
  "name": "Bhavatarini Catering Service",
  "alternateName": "Bhavatarini Catering",
  "url": "https://bhavatarinicatering.com",
  "logo": "https://bhavatarinicatering.com/images/bhavatarini-logo.png",
  "image": "https://bhavatarinicatering.com/images/og-bhavatarini.jpg",
  "description": "Wholesome, hygienic and authentic traditional South Indian catering for corporate offices, startups, small functions and gatherings in Coimbatore, Tamil Nadu.",
  "servesCuisine": [
    "South Indian",
    "Tamil",
    "Vegetarian"
  ],
  "areaServed": {
    "@type": "City",
    "name": "Coimbatore",
    "addressRegion": "Tamil Nadu",
    "addressCountry": "IN"
  },
  "serviceType": [
    "Corporate Catering",
    "Startup Office Catering",
    "Small Function Catering",
    "Group Gathering Catering",
    "Traditional Full Meals",
    "Customised Tiffin Catering"
  ],
  "hasMenu": {
    "@type": "Menu",
    "name": "Bhavatarini Catering Menu",
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Full Meals (Signature Menu)",
        "description": "Authentic South Indian full meals served on banana leaf with rice, sambar, rasam, kuzhambu, poriyal, appalam, curd, payasam, and pickle."
      },
      {
        "@type": "MenuSection",
        "name": "Customised Tiffin",
        "description": "Tailored tiffin spread featuring idli, dosa, pongal, upma, vada, bajji, samosa, and variety chutneys."
      }
    ]
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Coimbatore",
    "addressRegion": "Tamil Nadu",
    "addressCountry": "IN"
  },
  "priceRange": "$$",
  "telephone": "UNCONFIRMED_BUSINESS_PHONE_PLACEHOLDER"
}
</script>
```

---

## 4. Crawlability, Sitemaps & Technical SEO Directives

### 4.1 Native Next.js App Router `sitemap.ts`

Currently, search engine crawlers must discover pages through link scraping. We recommend creating `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url || 'https://bhavatarinicatering.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
```

### 4.2 Native Next.js App Router `robots.ts`

Direct indexing rules via `src/app/robots.ts`:

```typescript
import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url || 'https://bhavatarinicatering.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### 4.3 Canonical URL Enforcement

In `src/app/layout.tsx`, ensure `metadata.alternates.canonical` is explicitly defined:

```typescript
alternates: {
  canonical: '/',
},
```
This guarantees that regardless of query strings (e.g., `?utm_source=whatsapp&utm_medium=social`), search engines always consolidate index authority onto the clean root URL.

---

## 5. Image SEO & Accessibility Directives

| Asset Slot | Recommended File Name | Recommended Alt Text | Keyword Target |
| :--- | :--- | :--- | :--- |
| **Hero Image** | `south-indian-catering-coimbatore-hero.webp` | `"Traditional South Indian catering service feast arranged on fresh banana leaves with authentic brassware"` | `South Indian catering service`, `authentic brassware` |
| **Experience Photo** | `traditional-catering-service-setup.webp` | `"Traditional South Indian catering hospitality and wholesome meal preparation for events"` | `traditional catering hospitality`, `events` |
| **Menu Meals** | `traditional-full-meals-banana-leaf.webp` | `"Traditional South Indian full meals on banana leaf with sambar, rasam, kootu, poriyal, payasam, and appalam"` | `full meals on banana leaf`, `sambar`, `payasam` |
| **Menu Tiffin** | `south-indian-tiffin-catering-spread.webp` | `"Fresh South Indian tiffin catering spread with steamed idlis, crispy medu vada, and variety chutneys"` | `tiffin catering spread`, `idlis`, `medu vada` |

---

## 6. Local SEO Readiness Checklist for Stage B

- [ ] **Task 1:** Upgrade page title and meta description in `src/app/layout.tsx` to include commercial intent and high-volume local terms.
- [ ] **Task 2:** Add Open Graph image card (`/images/og-bhavatarini.jpg`) and Twitter card configuration to `src/app/layout.tsx`.
- [ ] **Task 3:** Implement structured JSON-LD schema (`CateringService`) in `src/app/layout.tsx` with zero fabricated data.
- [ ] **Task 4:** Create native Next.js App Router files `src/app/sitemap.ts` and `src/app/robots.ts`.
- [ ] **Task 5:** Enforce explicit canonical URL handling in `layout.tsx`.
- [ ] **Task 6:** Update all image file names and `alt` attributes to reflect rich culinary and geographical relevance.
