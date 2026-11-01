# Bhavatarini Catering Service — Visual & Interaction Fidelity Audit

**Document Version:** 1.0.0  
**Target Date:** November 2026  
**Primary Reference:** `docs/reference/bhavatarini_catering_royal_green_premium_v2.html`  
**Application Target:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS

---

## 1. Executive Summary & Objective

A comprehensive line-by-line audit was performed comparing the complete CSS cascade (Layers 1 through 4) and JavaScript logic of the approved HTML prototype against the Phase 2 React components in `src/components/`.

While the layout structure, color tokens, and content hierarchy were faithfully migrated, several subtle styling refinements, transition easings, button sheen sweeps, card hover states, watermark decorations, and responsive micro-interactions from the prototype were simplified or omitted.

This audit identifies every gap across 15 critical areas and specifies the exact code additions needed to achieve 100% visual and interactive parity with the approved prototype.

---

## 2. Detailed Gap Analysis Across 15 Focus Areas

### 2.1. Button Hover, Active, Focus, and Transition Animations
* **Original Prototype Behaviour:**
  * All `.btn` elements include a diagonal light sheen reflection sweep via `.btn:before` (`width: 32%; height: 260%; transform: rotate(25deg); background: rgba(255,255,255,.24); transition: left .6s ease;`) moving from `left: -45%` to `left: 125%` on hover.
  * Standard green button hover uses `linear-gradient(135deg, #286246, #17432f)` with `transform: translateY(-2px)` to `-3px` and deep shadow `0 14px 28px rgba(18,59,42,.2)`.
  * Gold button hover uses `linear-gradient(135deg, #efdfb1, #d2b46e)`.
  * Outline button has `border: 1px solid rgba(255,255,255,.65)` with translucent background `rgba(255,255,255,.04)` shifting to `rgba(255,255,255,.12)` on hover.
  * CTA banner primary gold button has an ambient soft pulsing glow: `@keyframes softPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(216,182,92,0) } 50% { box-shadow: 0 0 0 8px rgba(216,182,92,.12) } }` with `animation: softPulse 3.2s ease-in-out infinite`.
* **Current Implementation:**
  * Uses simple Tailwind utility classes (`hover:brightness-105 active:scale-[0.98]`).
  * Missing: The `.btn:before` sheen reflection sweep, the `softPulse` ambient animation, and matching hover elevation shadows.
* **Correction Required:**
  * Implement reusable `.btn-sheen` and button styles in `globals.css` with the exact pseudo-element sweep and `softPulse` keyframe animation.

---

### 2.2. Card Hover Effects, Elevation, Borders, and Decorative Animations
* **Original Prototype Behaviour:**
  * **Services Section:**
    * `.service:before`: Top gold accent bar (`height: 3px; background: linear-gradient(90deg, #a98642, #e3d19c, #a98642); transform: scaleX(.18); transform-origin: left; transition: transform .4s ease;`). Expands to `scaleX(1)` on hover.
    * `.service:after`: Watermark concentric rings (`width: 150px; height: 150px; right: -74px; bottom: -82px; border: 1px solid rgba(184,151,83,.18); border-radius: 50%; box-shadow: 0 0 0 18px rgba(184,151,83,.035), 0 0 0 38px rgba(184,151,83,.025); transition: transform .5s ease;`). Scales to `1.25` on hover.
    * Card lift: `transform: translateY(-10px); border-color: #c9ad70; box-shadow: 0 24px 48px rgba(24,52,35,.12);`.
    * Icon disc: `transition: transform .35s ease, background .35s ease;`. On hover: `transform: translateY(-3px) rotate(-5deg); background: linear-gradient(145deg, #efe1b9, #dfc98d);`.
* **Current Implementation:**
  * Top bar used width transition (`w-12 group-hover:w-full`) instead of `scaleX(.18)` to `scaleX(1)` with `transform-origin: left`.
  * Icon hover had basic scale instead of `translateY(-3px) rotate(-5deg)` and gold gradient color shift.
* **Correction Required:**
  * Replicate the exact `scaleX` top bar origin animation, watermark rings `scale(1.25)`, and icon badge rotation with gradient shift.

---

### 2.3. Scroll Reveal Animations and Staggered Entrances
* **Original Prototype Behaviour:**
  * Reveals use 3 directional classes:
    * `.reveal`: `opacity: 0; transform: translateY(28px); transition: opacity .75s ease, transform .75s cubic-bezier(.2,.75,.25,1);`
    * `.reveal-left`: `opacity: 0; transform: translateX(-34px); transition: opacity .8s ease, transform .8s cubic-bezier(.2,.75,.25,1);`
    * `.reveal-right`: `opacity: 0; transform: translateX(34px); transition: opacity .8s ease, transform .8s cubic-bezier(.2,.75,.25,1);`
  * Applied to: `section .section-head, .service, .menu-card, .why-item, .cta, .contact-info, .form, .trust-item`.
  * Alternate pattern: `i % 5 === 1 ? 'reveal-left' : i % 5 === 3 ? 'reveal-right' : 'reveal'`.
  * Staggered transition delays: `(i % 4) * 85 + 'ms'` on `.service` and `.why-item`.
  * IntersectionObserver settings: `threshold: 0.12, rootMargin: '0px 0px -35px 0px'`.
* **Current Implementation:**
  * Simple opacity fade without exact directional offsets, cubic-bezier timing functions, or `(i % 4) * 85ms` staggered delays.
* **Correction Required:**
  * Add the exact directional CSS rules to `globals.css` and update `use-scroll-reveal.ts` to apply the prototype's staggered index delays and threshold parameters.

---

### 2.4. Hero Image Parallax and Background Effects
* **Original Prototype Behaviour:**
  * Background dot matrix: `radial-gradient(rgba(255, 255, 255, 0.35) 0.65px, transparent 0.65px)` with `background-size: 7px 7px` and `mask-image: linear-gradient(90deg, #000, transparent 75%)`.
  * Eyebrow header: Contains an authentic gold dash: `.eyebrow:before { content: ""; width: 34px; height: 1px; background: #c9a85c; }`.
  * Staggered page load entrances:
    * `.eyebrow`: `animation: fadeInUp .8s .08s both;`
    * `h1`: `animation: fadeInUp .9s .18s both;`
    * `p`: `animation: fadeInUp .9s .3s both;`
    * `.actions`: `animation: fadeInUp .9s .42s both;`
    * `@keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }`
  * Hero Photo: Dual gradient overlay (`linear-gradient(90deg, rgba(17,57,39,.5), transparent 30%), linear-gradient(0deg, rgba(10,31,21,.16), transparent 55%)`). Gentle hover scale: `.hero:hover .hero-photo { transform: scale(1.015); }`.
  * Parallax on screens >= 851px: `backgroundPosition: center ${50 + y * .035}%` where `y = Math.min(window.scrollY, 500)`.
* **Current Implementation:**
  * Missing the `eyebrow:before` horizontal gold dash.
  * Missing the staggered `fadeInUp` keyframe entrance sequence on hero text elements.
* **Correction Required:**
  * Add the `fadeInUp` keyframe animations to `globals.css` and style the hero copy elements with matching delay offsets.

---

### 2.5. Sticky Header and Active Section Tracker Transitions
* **Original Prototype Behaviour:**
  * Brand Topline: Sticky at `top: 0; z-index: 31`. Active section indicator includes pulsating gold dot (`#d8bd73` with subtle glow) and tabular numbers separated by subtle border line.
  * Nav Links:
    * Inactive link hover: Underline expands from left (`width: 0` to `width: 100%`) with `transition: width .3s ease`.
    * Active link: Displays centered top gold pip (`5px` dot at `top: 4px; left: 50%`) and full-width bottom underline (`height: 2px; background: #c7a45b`).
  * Section head hover: Subtly expands letter-spacing on hover: `.section-head:hover h2 { letter-spacing: .3px }`.
* **Current Implementation:**
  * Active state rendered correctly, but inactive hover underline expansion (`nav a:hover:after { width: 100% }`) was not fully articulated.
* **Correction Required:**
  * Add the `nav a:after` hover expansion animation to the navigation links.

---

### 2.6. Scroll Progress Indicator
* **Original Prototype Behaviour:**
  * Height: `3px`, fixed at top (`z-index: 100`).
  * Gradient: `linear-gradient(90deg, #c49b3b, #f1d98b)`.
  * Glow: `box-shadow: 0 0 9px rgba(216, 182, 92, .55)`.
* **Current Implementation:**
  * Functional, but styling needs exact token alignment.
* **Correction Required:**
  * Confirm box-shadow and gradient tokens match the Layer 4 specification.

---

### 2.7. Trust Strip Icon Animations
* **Original Prototype Behaviour:**
  * Container has top and bottom borders with background `#fffefa` (or `#fffdf8`).
  * Hover on `.trust-item`: `transform: translateY(-4px); transition: transform .3s ease`.
  * Hover on `.trust-icon`: `transform: scale(1.16) rotate(-7deg); transition: transform .35s ease`.
* **Current Implementation:**
  * Trust items and icons were completely static on hover.
* **Correction Required:**
  * Add `group hover:-translate-y-1` on the item and `group-hover:scale-[1.16] group-hover:-rotate-6` on the icon disc.

---

### 2.8. Experience Section Decorative Elements and Image Treatments
* **Original Prototype Behaviour:**
  * Outer border framing: Inset border at `18px` (`inset: 9px` on mobile) with `border: 1px solid rgba(210,184,117,.14)`.
  * Concentric circular watermark rings in top-right background:
    `width: 550px; height: 550px; border: 1px solid rgba(218,195,133,.13); border-radius: 50%; right: -180px; top: -230px; box-shadow: 0 0 0 45px rgba(218,195,133,.025), 0 0 0 90px rgba(218,195,133,.02); pointer-events: none;`
  * Card hover lift: `transform: translateY(-9px); box-shadow: 0 22px 40px rgba(0,0,0,.2);` with `cubic-bezier(.2,.8,.2,1)`.
  * Card icon hover: `transform: rotate(14deg) scale(1.15); transition: transform .4s;`.
  * Card 02 (Photo card) overlay: Deep gradient `linear-gradient(0deg, rgba(10,31,16,.88), rgba(10,31,16,.02) 75%)` with hover opacity transition.
* **Current Implementation:**
  * The top-right concentric watermark rings (`550px` disc with dual box-shadow rings) were missing.
  * Card lift was standard `translateY(-8px)` without cubic-bezier easing.
  * Icon rotation was `rotate-12` without scale `1.15`.
* **Correction Required:**
  * Add the concentric watermark background pseudo-element to `ExperienceSection`.
  * Implement the exact `rotate(14deg) scale(1.15)` and `-9px` lift transitions.

---

### 2.9. Menu Card Interactions
* **Original Prototype Behaviour:**
  * Card hover: `transform: translateY(-7px); box-shadow: 0 26px 60px rgba(28,48,32,.13); transition: transform .4s, box-shadow .4s;`.
  * Photo zoom and saturation on card hover:
    `.menu-card:hover .food-photo { transform: scale(1.035); filter: saturate(1.08); }` with `transition: transform .8s cubic-bezier(.2,.8,.2,1), filter .8s`.
  * Tiffin card badge:
    `position: absolute; left: 18px; bottom: 18px; padding: 8px 12px; background: rgba(13,42,29,.84); border: 1px solid rgba(220,194,129,.55); color: #f2dfaa; font-size: 8px; letter-spacing: 1.8px;`.
* **Current Implementation:**
  * Lacked the food image scale `1.035` and saturation boost `saturate(1.08)` on card hover.
* **Correction Required:**
  * Add `group-hover:scale-[1.035] group-hover:saturate-[1.08]` transition to both menu food photo wrappers.

---

### 2.10. Why Choose Us Hover Effects
* **Original Prototype Behaviour:**
  * Card hover lift: `transform: translateY(-8px); border-color: #c9ad70; box-shadow: 0 20px 42px rgba(24,52,35,.10); transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease;`.
  * Bottom gold accent bar:
    `.why-item:after { content: ""; position: absolute; inset: auto 0 0; height: 2px; background: linear-gradient(90deg, transparent, #c7a45b, transparent); transform: scaleX(0); transition: transform .35s; }`
    `.why-item:hover:after { transform: scaleX(1); }`.
  * Icon badge on hover:
    `.why-item:hover span { transform: rotate(12deg) scale(1.15); transition: transform .4s cubic-bezier(.2,.8,.2,1); }`.
* **Current Implementation:**
  * Bottom line and lift were present, but icon disc rotation and scale `rotate(12deg) scale(1.15)` on hover were missing.
* **Correction Required:**
  * Add `group-hover:rotate-12 group-hover:scale-110` transition on the icon badge.

---

### 2.11. CTA Banner Animations
* **Original Prototype Behaviour:**
  * Watermark concentric rings in top-right:
    `.cta:after { content: ""; position: absolute; width: 300px; height: 300px; border: 1px solid rgba(222,201,143,.2); border-radius: 50%; right: -110px; top: -130px; box-shadow: 0 0 0 35px rgba(222,201,143,.035), 0 0 0 70px rgba(222,201,143,.025); }`.
  * Ambient button pulse on primary gold CTA:
    `animation: softPulse 3.2s ease-in-out infinite`.
* **Current Implementation:**
  * Both the watermark rings and the ambient button pulse were missing.
* **Correction Required:**
  * Add the concentric circular decorative element and assign `animate-soft-pulse` to the primary quote button.

---

### 2.12. Footer and Back-to-Top Interactions
* **Original Prototype Behaviour:**
  * Back-to-Top button:
    * Gradient background: `linear-gradient(145deg, #e2ce94, #bd9a50)`.
    * Border: `1px solid rgba(255, 255, 255, .55)`.
    * Shadow: `0 8px 25px rgba(0,0,0,.16)`.
    * Initial state: `opacity: 0; visibility: hidden; transform: translateY(12px)`.
    * Active state (`.visible`): `opacity: 1; visibility: visible; transform: translateY(0)`.
    * Hover state: `transform: translateY(-4px); filter: brightness(1.08)`.
* **Current Implementation:**
  * Functional, but hover transition should elevate cleanly by `-4px`.
* **Correction Required:**
  * Ensure hover elevation is `-4px` with smooth transition.

---

### 2.13. Mobile Navigation Opening and Closing Animations
* **Original Prototype Behaviour:**
  * Dropdown drawer positioned directly under header (`top: 76px`, or `top: 72px` on small screens).
  * Smooth entry with border-bottom and shadow `0 18px 25px rgba(20,40,27,.08)`.
  * Link clicks immediately close navigation.
* **Current Implementation:**
  * Functionally sound, but drawer styling and top-offset should precisely match the prototype's fixed header height.
* **Correction Required:**
  * Align mobile dropdown positioning and backdrop blur with prototype specifications.

---

### 2.14. Responsive Typography, Spacing, and Alignment at All Breakpoints
* **Original Prototype Behaviour:**
  * Exact media query breakpoints:
    * `1000px`: Services, Why Us, and Trust switch to 2 columns.
    * `850px`: Navigation collapses to mobile toggle.
    * `620px`: Container `width: 90%`, Services `min-height: 255px`, Why Us `min-height: 155px`, Trust padding `13px 5%`.
    * `390px`: Services and Experience cards become 1-column full-width. Why Us remains 2 columns.
* **Current Implementation:**
  * 390px layout required adjustments to ensure no horizontal scrolling occurs.
* **Correction Required:**
  * Verify full responsive alignment across 390px, 620px, 850px, 1000px, and 1240px.

---

### 2.15. prefers-reduced-motion Behaviour
* **Original Prototype Behaviour:**
  ```css
  @media(prefers-reduced-motion:reduce){
    *,*:before,*:after{
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
    .reveal,.reveal-left,.reveal-right{
      opacity: 1 !important;
      transform: none !important;
    }
  }
  ```
  * In JS, IntersectionObserver and scroll parallax are bypassed if `prefers-reduced-motion: reduce` matches.
* **Current Implementation:**
  * Partially handled in hooks, but missing the universal global CSS reset rule.
* **Correction Required:**
  * Add the universal `@media(prefers-reduced-motion:reduce)` override block directly to `src/app/globals.css`.

---

## 3. Plan of Implementation

1. **Global CSS (`src/app/globals.css`):**
   * Add keyframes: `fadeInUp`, `softPulse`.
   * Add `.btn-sheen` reflection sweep.
   * Add directional reveal classes (`.reveal`, `.reveal-left`, `.reveal-right`, `.is-visible`).
   * Add universal `@media(prefers-reduced-motion:reduce)` rule.
2. **Component Updates:**
   * `hero-section.tsx`: Add eyebrow gold dash, `fadeInUp` animation classes, and photo hover zoom.
   * `trust-strip.tsx`: Add item hover lift and icon disc rotate/scale.
   * `services-section.tsx`: Add `scaleX` top bar origin animation, watermark rings `scale(1.25)`, and icon badge rotation.
   * `experience-section.tsx`: Add top-right concentric watermark rings and card icon rotate/scale.
   * `menu-section.tsx`: Add food photo hover zoom and saturation boost.
   * `why-us-section.tsx`: Add icon badge rotate/scale on hover.
   * `cta-banner.tsx`: Add top-right watermark rings and `softPulse` button animation.
   * `header.tsx`: Add inactive nav link underline expansion on hover.
   * `use-scroll-reveal.ts`: Match prototype threshold `0.12`, rootMargin `0px 0px -35px 0px`, and staggered delays.
3. **Verification:**
   * Run `npm run build` to verify clean compilation.
   * Validate both desktop and mobile viewports.
