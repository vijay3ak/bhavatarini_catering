
# AGENTS.md

# Bhavatarini Catering Service - Project Instructions

## 1. Project Overview

Build a professional catering business website for Bhavatarini Catering Service, based in Coimbatore, Tamil Nadu, India.

The website should present traditional South Indian catering services and generate customer enquiries.

Target customers:
- Corporate offices
- Startups and office teams
- Small functions
- Group gatherings

## 2. Primary Reference Files

The following files are the primary project references:

- `docs/reference/PROJECT_HANDOVER.md`
- `docs/reference/bhavatarini_catering_royal_green_premium_v2.html`

Other historical HTML prototypes may be used for design history.

The latest royal green premium v2 HTML is the primary visual and behavioural source of truth.

Read the complete project handover before implementation.

## 3. Approved Technology Stack

### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend
- Next.js Route Handlers
- Supabase PostgreSQL
- Supabase Authentication
- Supabase SSR

### Forms and Email
- React Hook Form
- Zod
- Resend

### Development
- Node.js
- npm
- Git
- GitHub
- Google Antigravity

Do not introduce alternative frameworks without approval.

## 4. Design System

Preserve the existing premium visual identity.

### Colour Direction
- Royal forest green
- Antique gold
- Warm ivory
- Deep neutral tones

Use the exact colour tokens from the latest v2 HTML after inspecting its CSS.

### Typography
- Playfair Display for headings
- DM Sans for body text

### Design Principles
- Premium and elegant appearance.
- Spacious layouts.
- Strong visual hierarchy.
- Consistent spacing and alignment.
- Rich and polished cards.
- Thoughtful use of imagery.
- Responsive layouts.
- Consistent design across all sections.

Do not replace the design with a generic website template.

## 5. Prototype Fidelity - Mandatory

Before implementation, inspect the entire reference HTML.

Inspect:
- HTML structure
- CSS styles
- CSS variables
- Typography
- Spacing
- Dimensions
- Shadows
- Borders
- Gradients
- Hover effects
- Focus states
- Transitions
- Animations
- Media queries
- Responsive breakpoints
- JavaScript
- Event listeners
- Navigation interactions
- Scroll interactions
- Form interactions
- WhatsApp integration
- Reduced-motion support

Recreate the intended visual appearance and behaviour in React and TypeScript.

Do not blindly copy legacy JavaScript or accumulated CSS.

Refactor into clean, reusable and maintainable components.

Do not remove existing interactions without a valid technical reason.

## 6. Website Requirements

The planned public website includes:

1. Home / Hero
2. Services
3. About / Bhavatarini Experience
4. Menu
5. Why Choose Us
6. Gallery
7. Contact
8. Customer enquiry form
9. WhatsApp integration

Preserve the four existing service categories:
- Corporate Catering
- Startup & Office Catering
- Small Functions
- Group Gatherings

Preserve the Full Meals and Customised Tiffin menu categories.

Do not invent additional menu items, prices or business claims.

## 7. Admin Dashboard Requirements

The initial application must include a basic admin dashboard.

Expected features:
- Secure admin login and logout.
- Protected dashboard.
- Enquiry overview.
- Enquiry listing.
- Enquiry details.
- Search and filtering.
- Enquiry status updates.
- Internal notes.

Use Supabase for persistent enquiry storage and authentication.

## 8. Enquiry Workflow

The intended workflow:

1. Customer visits the website.
2. Customer completes the enquiry form.
3. Client and server validate the submitted information.
4. Server stores the enquiry in Supabase.
5. Email notification is sent through Resend.
6. Customer can also initiate a WhatsApp conversation.

If email delivery fails, the enquiry record must remain saved.

Never expose service-role keys or email API keys in browser code.

## 9. Security Requirements

- Protect admin routes.
- Validate all server inputs.
- Implement Supabase Row Level Security.
- Never expose database secrets.
- Never commit `.env` files.
- Do not enable public admin registration.
- Implement appropriate spam protection.
- Do not send personal enquiry information to analytics services.

## 10. Responsive Design

The website must work properly on:
- Desktop
- Laptop
- Tablet
- Mobile

Preserve the original responsive behaviour where possible.

Check:
- Navigation
- Cards
- Images
- Forms
- Spacing
- Typography
- Buttons
- Section layouts

## 11. Animation and Interaction Requirements

Preserve and recreate the prototype's:
- Mobile navigation toggle.
- Active navigation indicator.
- Scroll reveal animations.
- Scroll progress indicator.
- Back-to-top button.
- Hero image parallax where appropriate.
- Card hover effects.
- Button hover effects.
- Image overlays.
- Smooth transitions.
- Reduced-motion accessibility.

Animations must remain smooth and must not compromise usability.

## 12. SEO and Marketing Readiness

Prepare the architecture for:
- Next.js Metadata API.
- Sitemap.
- Robots configuration.
- Canonical URLs.
- Open Graph metadata.
- Appropriate structured data.
- Google Analytics 4.
- Google Tag Manager.
- Google Search Console.
- Meta Pixel.
- UTM tracking.
- WhatsApp and phone click tracking.

Do not add tracking scripts or fabricated business information without approval.

## 13. Code Quality

- Use TypeScript strict mode.
- Prefer reusable components.
- Follow clear naming conventions.
- Separate UI, services, validation and database logic.
- Avoid unnecessary dependencies.
- Handle loading, empty and error states.
- Use semantic HTML.
- Follow accessibility standards.
- Keep code readable and maintainable.

## 14. Business Information

Never invent:
- Business phone number.
- WhatsApp number.
- Email address.
- Exact address.
- Menu prices.
- Operating hours.
- Delivery charges.
- Customer testimonials.
- Business history.
- Certifications.

Use clearly identified placeholders until verified information is supplied.

## 15. Git and Project Safety

- Preserve the original reference files.
- Do not overwrite prototype files.
- Do not commit environment variables.
- Keep changes organized.
- Use meaningful Git commits.
- Do not push secrets to GitHub.
- Ask before destructive operations.

## 16. Development Workflow

Work in controlled phases.

Before implementation:
1. Read the project handover.
2. Inspect the complete prototype.
3. Document the design system.
4. Document all interactions and animations.
5. Create the implementation plan.
6. Identify missing business information.
7. Wait for project owner approval.

During implementation:
- Follow the approved implementation plan.
- Work incrementally.
- Test each completed feature.
- Preserve the visual reference.
- Report errors and unresolved issues.

## 17. Important Restrictions

- Do not independently redesign the website.
- Do not remove prototype features unnecessarily.
- Do not invent business details.
- Do not install unnecessary packages.
- Do not introduce paid services without approval.
- Do not deploy without explicit permission.
- Do not modify reference HTML files.
- Do not start implementation before the analysis and plan are approved.

## Final Objective

Create a polished, responsive, production-ready catering website and basic enquiry management dashboard while preserving the original Bhavatarini Catering visual identity and interactions.
