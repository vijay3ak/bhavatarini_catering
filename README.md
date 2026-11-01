# Bhavatarini Catering Service

A modern, high-performance catering platform and enquiry management system for Bhavatarini Catering Service, based in Coimbatore, Tamil Nadu, India.

Built with Next.js 15 (App Router), TypeScript (Strict), Tailwind CSS, Supabase PostgreSQL & SSR Auth, Resend, and Lucide React.

---

## 1. Project Overview

Bhavatarini Catering Service specializes in traditional South Indian food and meal arrangements for:
- Corporate offices
- Startups and teams
- Small private functions
- Group gatherings

The application features:
1. **Public Marketing Website:** Editorial, single-page presentation replicating the approved royal forest green and antique gold visual identity from `docs/reference/bhavatarini_catering_royal_green_premium_v2.html`.
2. **Protected Admin Management Portal:** Restricted back-office dashboard (`/admin`) for catering operators to track leads, update status, and manage customer catering requirements.
3. **Resilient Dual-Channel Enquiry Workflow:** Enquiries are strictly validated and saved to Supabase PostgreSQL first, an email notification is dispatched via Resend, and an optional WhatsApp handoff is provided if a business number is configured.

---

## 2. Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode enabled)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with approved Layer 4 design tokens
- **Typography:** Google Fonts (`Playfair Display` serif + `DM Sans` sans-serif) via `next/font`
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security & SSR Auth)
- **Form Management & Validation:** React Hook Form & [Zod](https://zod.dev/)
- **Email Notifications:** [Resend](https://resend.com/)

---

## 3. Design Tokens & Visual Direction

The visual system is derived from the approved Layer 4 v2 prototype:
- **Primary Royal Forest Green:** `#123C2C` (`--green`)
- **Secondary Forest Green:** `#1C573E` (`--green2`)
- **Muted Leaf Green:** `#718B62` (`--leaf`)
- **Warm Ivory Background:** `#FAF8F1` (`--cream`)
- **Secondary Warm Background:** `#EEE7D7` (`--cream2`)
- **Antique Gold Accent:** `#C7A45B` (`--gold`)
- **Deep Text Ink:** `#17271E` (`--ink`)
- **Muted Neutral:** `#6F786F` (`--muted`)
- **Border / Divider:** `#E5DECE` (`--line`)

---

## 4. Directory Structure

```text
bhavatarini_catering/
├── docs/
│   ├── reference/
│   │   ├── PROJECT_HANDOVER.md
│   │   ├── bhavatarini_catering_homepage (2) (1).html
│   │   └── bhavatarini_catering_royal_green_premium_v2.html
│   ├── PROTOTYPE_ANALYSIS.md
│   └── IMPLEMENTATION_PLAN.md
├── public/
│   └── images/
│       └── a_high_quality_well_lit_food_product_photography.png
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   └── login/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── sections/
│   │   ├── ui/
│   │   └── admin/
│   ├── lib/
│   │   ├── config/
│   │   │   └── site.ts
│   │   ├── supabase/
│   │   └── utils.ts
│   └── types/
│       ├── database.types.ts
│       └── enquiry.ts
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Getting Started Locally

### Prerequisites
- Node.js `18.18.0` or later (Node 20+ recommended)
- npm `9.0.0` or later

### Installation & Setup

1. **Clone or navigate to the workspace:**
   ```bash
   cd bhavatarini_catering
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Contact details are empty by default. Do not add fabricated phone numbers.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 6. Important Development & Security Policies

1. **No Fake Business Details:** Never display fabricated phone numbers, addresses, WhatsApp numbers, or prices. Unknown contact parameters remain empty and gracefully handled.
2. **Server-Side Security:** Database writes are executed via server-side Server Actions or Route Handlers. Anonymous users have zero read access to customer enquiries.
3. **Zero Secret Leakage:** `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are strictly server-only environment variables.
4. **Fidelity:** All upcoming public components must strictly adhere to the approved v2 prototype styling.

---

## 7. Project Documentation

- [`docs/PROTOTYPE_ANALYSIS.md`](docs/PROTOTYPE_ANALYSIS.md) — Exhaustive analysis of the v2 prototype, CSS cascade, and assets.
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Architectural blueprints, schema, workflows, and phased roadmap.
