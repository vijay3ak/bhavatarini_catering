# Bhavatarini Catering Service Website --- Project Handover

**Document purpose:** Transfer the complete known project context to a
new ChatGPT account and continue implementation with Google Antigravity
as the AI coding agent.

**Handover date:** 1 November 2026\
**Current prototype to continue from:**
`bhavatarini_catering_royal_green_premium_v2.html`\
**Project status:** Frontend prototype exists; production backend, admin
dashboard, real contact details, deployment and marketing integrations
are not yet verified as implemented.

> **Evidence labels used throughout** - **CONFIRMED** --- explicitly
> stated by the user or directly visible in an available project file. -
> **IMPLEMENTED IN PROTOTYPE** --- directly verified in the latest
> available HTML. - **SUGGESTED / REFERENCE** --- discussed as a design
> direction or future possibility, but not a confirmed implementation
> decision. - **PENDING** --- requires the business owner to decide or
> provide information. - **UNAVAILABLE / NOT VERIFIED** --- referenced
> or requested, but no accessible source or working implementation was
> found in the files inspected.
>
> This document deliberately distinguishes the existing prototype from a
> production-ready website. Do not assume that a visible frontend
> control is connected to a backend.

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 Business identity

  -----------------------------------------------------------------------
  Item                    Current understanding   Status
  ----------------------- ----------------------- -----------------------
  Business name           **Bhavatarini Catering  CONFIRMED
                          Service**               

  Business type           Catering service        CONFIRMED
                          focused on traditional  
                          South Indian food and   
                          meal arrangements       

  Business location       Coimbatore, Tamil Nadu, CONFIRMED
                          India                   

  Service area            Coimbatore and nearby   CONFIRMED in prototype
                          locations               copy; exact
                                                  radius/areas pending

  Primary positioning     Traditional taste,      CONFIRMED as website
                          homely food, hygiene,   messaging
                          flexibility and         
                          dependable service      

  Website purpose         Present the business    CONFIRMED
                          professionally and      
                          generate customer       
                          enquiries for catering  
                          requirements            

  Primary audience        Corporate offices,      CONFIRMED
                          startups, office teams, 
                          small functions and     
                          group gatherings        

  Business owner/contact  A family catering       PARTLY KNOWN / CONTACT
                          business is associated  DETAILS PENDING
                          with the user; no       
                          verified public contact 
                          identity or contact     
                          number is in the        
                          prototype               
  -----------------------------------------------------------------------

### 1.2 Services represented

The latest prototype names four service categories:

1.  **Corporate Catering** --- daily meals, office lunches, meetings and
    corporate events.
2.  **Startup & Office Catering** --- breakfast, lunch and food
    arrangements for growing teams.
3.  **Small Functions** --- housewarming, birthdays and private
    celebrations.
4.  **Group Gatherings** --- food arrangements for social and community
    events.

The menu currently presents two broad offerings:

-   **Full Meals:** Rice, sambar, rasam, kuzhambu, poriyal, appalam,
    curd, payasam and pickle.
-   **Tiffin (Customised):** Idli, dosa, pongal, upma, vada, bajji,
    samosa and more; combinations are to be curated based on
    team/customer needs.

No final price list, minimum order quantity, delivery fee, per-plate
rate or confirmed operating schedule was found.

### 1.3 Website objectives

**Primary objectives** - Build trust in the catering service through a
polished, premium, food-led website. - Clearly communicate the services
and available food options. - Encourage prospective customers to submit
a catering enquiry. - Make it easy to start an enquiry through
WhatsApp. - Support business enquiries from offices, startups, functions
and groups.

**Secondary objectives / future opportunities** - Improve discovery
through local SEO and Google Business Profile. - Measure enquiries and
conversion sources. - Support future paid campaigns and dedicated
landing pages. - Potentially provide an admin interface to manage
incoming enquiries. This was included in the handover request, but no
admin dashboard implementation was found in the current prototype.

------------------------------------------------------------------------

## 2. Complete Website Requirements

### 2.1 Current information architecture

The latest HTML is a **single-page website** with these implemented
section IDs and navigation destinations:

  -----------------------------------------------------------------------
  Section                 HTML ID                 Current status
  ----------------------- ----------------------- -----------------------
  Home / Hero             `home`                  IMPLEMENTED

  Services                `services`              IMPLEMENTED

  About / process         `our-approach`          IMPLEMENTED as "The
  narrative                                       Bhavatarini
                                                  Experience"; not a
                                                  separate About page

  Menu                    `menu`                  IMPLEMENTED

  Why Choose Us           `why`                   IMPLEMENTED

  Contact / Enquiry       `contact`               IMPLEMENTED

  Gallery                 ---                     NOT FOUND in latest
                                                  prototype

  Admin dashboard         ---                     NOT FOUND

  Separate About page     ---                     NOT FOUND;
                                                  process/brand story
                                                  section is present
                                                  instead
  -----------------------------------------------------------------------

The navigation currently includes Home, Services, Menu, Why Us and
Contact. The scroll-based active-section indicator also includes Our
Approach.

### 2.2 Home page / hero

**Purpose:** Immediately explain what the business does and guide
visitors to enquire.

**Current content in HTML** - Eyebrow: "Traditional South Indian
Catering" - Main heading: "Good Food. Beautifully Served. Every
Occasion." - Supporting copy: "Homely, hygienic and reliable catering
for corporate offices, startups, small functions and gatherings." -
Primary CTA: "Request a Quote" - Secondary CTA: "Chat on WhatsApp"

**Layout and expected behaviour** - Premium hero layout with a prominent
food/brand image area. - Clear heading hierarchy and concise supporting
copy. - Prominent enquiry CTA and WhatsApp CTA. - Responsive layout for
smaller screens.

**Status:** IMPLEMENTED as a hero section. Confirm whether the final
production hero image and final CTA wording should remain as currently
shown.

### 2.3 About / "The Bhavatarini Experience"

**Purpose:** Explain the service process and communicate that catering
is organised and easy for the customer.

The latest prototype uses an "Our Approach" / "The Bhavatarini
Experience" section rather than a conventional About page.

**Current content** - Heading: "Good food. Thoughtfully served." -
Intro: "From the first conversation to the final serving, we make
catering feel simple, organised and welcoming." - Step 01 --- "Tell us
what you're planning."\
"Share your occasion, guest count, location and food preferences." -
Step 02 --- "Choose your menu."\
"Our signature full meals or a tiffin combination curated around your
needs." - Step 03 --- "We prepare. You enjoy."\
"We coordinate the food arrangements for your office, function or
gathering." - Supporting brand line: "PEOPLE / FOOD / OCCASIONS ---
BHAVATARINI CATERING SERVICE"

**Status:** IMPLEMENTED in the latest prototype.\
**Pending:** Actual business history, founding story, team details,
kitchen/process photographs, founder profile and any verified
credentials. Do not invent these.

### 2.4 Services

**Purpose:** Help customers identify which catering category suits their
requirement.

**Current cards and copy** - Corporate Catering --- "Daily meals, office
lunches, meetings and corporate events." - Startup & Office Catering ---
"Breakfast, lunch and food arrangements for growing teams." - Small
Functions --- "Housewarming, birthdays and private celebrations." -
Group Gatherings --- "Food arrangements for social and community
events."

**Design requirements from iterative feedback** - Services cards should
look more enriched, premium and visually substantial. - Increase the
size of the content and iconography somewhat. - Give cards a more
dimensional and polished appearance rather than flat, undersized
tiles. - Maintain intentional alignment, spacing and visual hierarchy. -
Icons should be visually meaningful and consistent as a system, but not
mechanically identical in visual treatment if the design calls for
variation. - Latest v2 prototype includes enlarged service card styling,
larger icon circles (approximately 62px on desktop), larger
Playfair-style titles, gold hover accents and a more dimensional
hover/lift treatment.

**Status:** IMPLEMENTED in latest v2. Further visual refinement may be
needed after browser testing.

### 2.5 Menu

**Purpose:** Show the main food categories and give prospective
customers a realistic idea of the offering.

**Current menu categories** - **Full Meals --- "Our Signature Menu"**\
Rice · Sambar · Rasam · Kuzhambu · Poriyal · Appalam · Curd · Payasam ·
Pickle - **Tiffin (Customised)**\
"Tiffin combinations curated based on your team's needs and
preferences."\
Items shown: Idli, Dosa, Pongal, Upma, Vada, Bajji, Samosa & more.

**Image requirement** - A realistic customized stainless-steel tiffin
box/container image was specifically requested. - The current prototype
includes an embedded, generated food photograph showing a
stainless-steel compartment meal tray with South Indian foods. - The
image is embedded into the HTML as base64 in the latest prototype, so
the HTML can display it without a separate external image path. - The
standalone image file is also present in the available project files;
see Section 4 and Section 12.

**Pending** - Confirm exact menu items and which items are actually
offered. - Confirm vegetarian/non-vegetarian availability (the current
visible menu reads as vegetarian, but this has not been formally
confirmed as a business-wide restriction). - Confirm meal variations,
portion details, seasonal items, customisation limits and pricing. -
Confirm whether the menu needs separate breakfast/lunch/snacks/event
categories.

### 2.6 Gallery

**User-requested scope:** The user explicitly asked for the project
handover to cover a Gallery page/section.

**Current implementation:** No separate Gallery section, gallery grid,
gallery route or dedicated gallery assets were found in the latest HTML.

**Recommended implementation status:** PENDING --- do not treat it as
already built.

**Content to collect before implementation** - Real photographs of meals
and tiffin arrangements. - Food preparation and serving photographs, if
suitable for public use. - Catering setups at offices/functions, with
customer permission. - Packaging and delivery photographs. -
Captions/categories only where the business can verify them.

Use real business photographs in preference to AI-generated imagery for
proof of actual work. The generated tiffin image can be used as
illustrative menu imagery, but should not be represented as a photograph
of a specific completed customer order unless that is true.

### 2.7 Contact page / section

**Purpose:** Provide contact information and convert visitors into
enquiries.

**Current prototype content** - Heading: "Let's Plan Your Catering" -
Supporting copy: "Share a few details and we'll get back to you." -
"Made for teams, gatherings and good food." - "Whether you need regular
office meals or catering for a one-time event, send us your
requirements." - Service area: "Coimbatore and nearby locations" - Phone
/ WhatsApp: "Add your business number before publishing"

**Status:** Contact section exists. Public business phone number and
full address are not populated.

**Pending contact content** - Business phone number. - WhatsApp number
in international format, including country code. - Public business
email, if any. - Exact business address, if it should be displayed. -
Business hours / enquiry response hours. - Social media profile URLs. -
Serviceable nearby towns/areas and any delivery radius.

### 2.8 Enquiry form

**Purpose:** Collect enough information to understand and respond to a
catering request.

**Fields visible in current HTML** 1. Name --- placeholder "Name" 2.
Mobile number --- placeholder "10-digit mobile number" 3. Company /
Organisation --- optional 4. Requirement type --- options: - Corporate
office - Startup / team - Small function - Group gathering 5. Food
preference --- options: - Full meals - Customised tiffin - Both meals
and tiffin - Snacks 6. Approx. quantity --- options: - Below 50 -
50--100 - 100--200 - 200--500 - Above 500 7. Date, location and other
details --- free-text area with placeholder: "Tell us your date,
delivery location, frequency or special requests" 8. Submit button:
"Send Enquiry via WhatsApp"

**Current behaviour verified in JavaScript** - Form submission is
intercepted with `preventDefault()`. - Values are read from the form
fields. - A formatted WhatsApp enquiry message is assembled containing
name, mobile, organisation, requirement, food preference, quantity and
details. - The browser opens `https://wa.me/?text=` plus the URL-encoded
message in a new tab/window.

**Important limitation** - The WhatsApp URL currently has no recipient
phone number (`https://wa.me/?text=...`). The business WhatsApp number
must be added before publishing, otherwise the user is not directed to
the intended business chat. - No server-side form submission or database
storage is present. - No email notification is present. - Do not
describe this as a fully persisted enquiry workflow. It is currently a
client-side WhatsApp message handoff.

**Validation** - The current script reads values and formats a message,
but the available code inspection did not establish robust custom
validation or server-side validation. - Inspect the HTML input
attributes for any native `required` or `pattern` validation before
changing them; implement appropriate client and server validation if a
backend is later added. - Confirm whether the mobile number should be
validated as an Indian 10-digit number or allow international numbers.

### 2.9 WhatsApp integration

**Current status:** Basic client-side WhatsApp handoff exists.

**Current message format** - Greeting: "Hello Bhavatarini Catering
Service! I would like to enquire about catering." - Name - Mobile -
Organisation (or "Not specified") - Requirement - Food preference -
Quantity - Details (or "Not specified")

**Pending** - Insert the real business WhatsApp number in
`https://wa.me/<countrycode+number>?text=...`. - Verify number ownership
and test on desktop/mobile. - Add click/conversion tracking only after
analytics setup. - Decide whether standalone WhatsApp buttons should
open a direct chat with a prefilled message. - Confirm whether WhatsApp
Business is being used.

### 2.10 Admin dashboard

**Scope requested in this handover brief:** Admin login, enquiry
viewing/management and status updates are specifically called out.

**Current implementation:** No admin page, login, protected route,
backend API or enquiry database was found in the available prototype.

**Therefore this is a PENDING / FUTURE BUILD requirement, not an
existing feature.**

Potential functional scope to confirm: - Secure admin login/logout. -
Enquiry list with received date/time and customer details. - Search,
filter and sort. - Enquiry detail view. - Status workflow (e.g. New,
Contacted, Quoted, Confirmed, Closed, Rejected) --- these exact labels
are suggestions, not confirmed decisions. - Internal notes and follow-up
date --- suggested only. - Ability to update status and persist the
change. - Role/access model if more than one staff member will use it.

### 2.11 Additional features visible in the prototype

**IMPLEMENTED** - Responsive mobile navigation toggle. - Navigation
links close the mobile menu after selection. - Dynamic current year in
footer (via `#year`). - Scroll reveal effects for section headings,
service cards, menu cards, why-us items, CTA, contact and form
elements. - Scroll progress indicator. - Back-to-top control that
appears after scrolling. - Gentle hero image parallax on larger
screens. - Active section indicator in a slim top bar and active
navigation styling. - Reduced-motion preference handling for animations.

**NOT FOUND / NOT VERIFIED** - Customer testimonials/reviews section. -
Pricing calculator. - Online ordering or payment. - Booking calendar. -
Customer accounts. - Blog/CMS. - Newsletter subscription. - Live chat
other than WhatsApp handoff. - Admin dashboard.

------------------------------------------------------------------------

## 3. Design and UI/UX Requirements

### 3.1 Overall visual direction

**CONFIRMED direction:** Premium, rich, elegant, spacious and editorial,
with a food-led presentation. The user asked for inspiration from the
Sri Shakthi Institute of Engineering and Technology website
(`https://siet.ac.in`) and wanted a similar level of polish/visual
richness, not a direct copy of that institution's identity.

The website should feel: - Premium and trustworthy. - Warm and welcoming
rather than corporate-cold. - Rooted in traditional South Indian food. -
Spacious, structured and easy to scan. - Image-led, with strong
typography and restrained decorative accents. - Consistent across
desktop, tablet and mobile.

### 3.2 Colour palette

The latest prototype's final appended design token block uses the
following exact values:

  Token        HEX         Intended role
  ------------ ----------- ----------------------------
  `--green`    `#123C2C`   Primary royal/forest green
  `--green2`   `#1C573E`   Secondary green
  `--leaf`     `#718B62`   Muted leaf green
  `--cream`    `#FAF8F1`   Main warm ivory background
  `--cream2`   `#EEE7D7`   Secondary warm background
  `--gold`     `#C7A45B`   Antique gold accent
  `--ink`      `#17271E`   Main dark text
  `--muted`    `#6F786F`   Supporting text
  `--line`     `#E5DECE`   Borders/dividers

**Brand palette summary:** Royal forest green + antique gold + warm
ivory.

Earlier prototype iterations contain other green/cream/gold values in
earlier CSS blocks, including `#123B1D`, `#245B2C`, `#173D25`,
`#285B38`, `#D8B65C` and related shades. These are historical/overridden
styling iterations. For future development, use the latest final token
set above as the source of truth unless the owner explicitly requests a
palette change. The HTML contains multiple accumulated CSS blocks, so
inspect cascade order before editing.

### 3.3 Fonts and typography

Latest prototype loads Google Fonts: - **Playfair Display** --- headings
and editorial display typography (weights include 500, 600, 700, 800 in
the later stylesheet). - **DM Sans** --- body copy, navigation, labels
and interface text (weights 400, 500, 600, 700).

Earlier prototype CSS also references Inter and Georgia as
fallback/legacy styles. The intended latest pairing is Playfair
Display + DM Sans, with Georgia/Arial/sans-serif fallbacks.

Typography direction: - Strong, elegant serif headings. - Clean
sans-serif body copy. - Clear heading/body hierarchy. - Avoid tiny text
in key feature areas. - Service, Why Choose Us and trust-strip content
should be legible and visually prominent.

### 3.4 Header and navigation

**Current prototype** - Brand wordmark text: "Bhavatarini Catering
Service". - Navigation: Home, Services, Menu, Why Us, Contact. - CTA
links include "Enquire Now", "Request a Quote", "Chat on WhatsApp",
"Request a Catering Quote" and "Send an Enquiry" in different parts of
the page. - Mobile navigation toggle. - Slim top active-section
indicator with section number and label. It cycles through: - 01 HOME -
02 SERVICES - 03 OUR APPROACH - 04 MENU - 05 WHY US - 06 CONTACT - The
nav also highlights the active section while scrolling.

**Design requirements** - Keep the header refined and uncluttered. -
Preserve clear CTA hierarchy. - Ensure mobile menu is usable and closes
when a navigation item is selected. - Verify contrast and keyboard
accessibility.

**Logo status:** A separate approved logo asset was not found. Current
identity is a text wordmark. Do not invent a final logo; request an
approved logo file if the owner has one.

### 3.5 Hero design

-   Large editorial heading and concise intro.
-   Strong food imagery / hero photograph.
-   Green/ivory/gold palette.
-   CTA buttons should be easy to identify.
-   Responsive image crop and text stacking.
-   Maintain sufficient contrast over/around imagery.

### 3.6 Services cards

User explicitly requested richer service styling and somewhat larger
content/icons.

Latest v2 implementation includes: - Larger service cards. - More
dimensional visual treatment. - Approximately 62px icon circles on
desktop. - Larger serif titles. - Gold accent/decorative details. -
Lift/hover treatment. - Responsive adjustments.

Further requested quality checks: - Text should not appear cramped. -
Icon-to-title spacing should be balanced. - Keep a consistent card grid
and baseline alignment. - On mobile, cards should stack cleanly without
oversized icons consuming the viewport.

### 3.7 "Why Choose Bhavatarini?" and trust strip

The user specifically requested increasing the size of both the content
and iconography in these areas.

**Why Choose Bhavatarini? items** - Consistent Quality - Flexible &
Customisable - Carefully Prepared - Service You Can Rely On

Latest v2 styling changes: - Approximately 66px icon circles. -
Approximately 34px symbols. - Larger, bolder labels (around 15px). -
Larger cards and spacing.

**Trust strip items** - Traditional Taste --- "Authentic South Indian
food" - Hygienic & Safe --- "Care in every preparation" - Flexible for
Your Needs --- "Meals, tiffin and custom orders" - Reliable Service ---
"Planned and organised catering"

Latest v2 styling changes: - Approximately 48px icon circles. -
Approximately 34px symbols. - Approximately 14px titles and 11px
descriptions. - Improved spacing.

**Specific icon-layout feedback from the user** - Icons should not all
be the same size/alignment in a way that makes the row look mechanically
repetitive; the user asked for the icons to look visually considered and
the items to have a polished, consistent overall alignment. - Interpret
this as a request for a balanced visual rhythm: align the content
consistently while allowing icon shapes/visual weight to vary where
appropriate. Do not create chaotic misalignment.

### 3.8 Menu imagery and tiffin container

The user explicitly called out the "Tiffin (Customised)" image not
appearing and asked for the image to look real. A generated high-quality
food photograph was created and incorporated into the latest prototype.

Visual subject: - Stainless-steel compartment tiffin tray. - South
Indian foods including idli, dosa, pongal/upma-like preparation, sambar
and vada. - Banana-leaf/green presentation details. - Dark green and
warm gold styling around the food photograph.

The latest HTML contains the image embedded as base64. Preserve it when
editing unless replacing it with approved real business photography.

### 3.9 Buttons, forms and interaction styling

-   CTAs should be prominent but not visually aggressive.
-   Gold should be used as a restrained accent.
-   Form should feel clean, premium and approachable.
-   Inputs need clear labels, focus states, error states and adequate
    touch target size.
-   Primary CTA wording should be consistent across the page.
-   Do not use fake success messages if no actual backend submission
    occurs.

### 3.10 Spacing, alignment and hierarchy

-   Use generous section spacing.
-   Use a clear content max-width and consistent side gutters.
-   Keep heading, body and CTA alignment deliberate.
-   Avoid overly dense layouts.
-   Ensure service cards, Why Choose items and trust strip have balanced
    visual weight.
-   Maintain consistent border radii, shadows and hover transitions.
-   Use gold accent lines/decorations sparingly.

### 3.11 Responsive behaviour

The latest HTML includes media queries at multiple breakpoints,
including around 850px, 520px, 950px, 600px, 390px, 620px, 1000px and
380px. Because styles accumulated across iterations, these breakpoints
should be consolidated during refactoring rather than blindly
duplicated.

Test: - Wide desktop. - Laptop. - Tablet portrait/landscape. - Mobile
widths, including narrow devices around 360--390px. - Mobile
navigation. - Form fields and CTA wrapping. - Image crop and card
stacking. - Avoid horizontal overflow.

### 3.12 Animation and motion

**IMPLEMENTED** - Scroll-triggered reveal transitions using
`IntersectionObserver`. - Reveal classes include `reveal`,
`reveal-left`, `reveal-right`, and `is-visible`. - Small stagger delays
for selected service/Why items. - Scroll progress indicator. -
Back-to-top button after approximately 480px scroll. - Smooth scrolling
for back-to-top unless reduced motion is preferred. - Gentle hero image
parallax on larger screens only. - `prefers-reduced-motion` support.

**Requirement:** Keep motion subtle and purposeful. Preserve
reduced-motion accessibility.

------------------------------------------------------------------------

## 4. Prototype and Reference Materials

### 4.1 Files available in the current working environment

The following exact files were present and inspected in the current
runtime on 1 November 2026. Download/copy all relevant files before
moving accounts.

  -----------------------------------------------------------------------------------------------------------
  File                                                        What it is              Status / purpose
  ----------------------------------------------------------- ----------------------- -----------------------
  `bhavatarini_catering_homepage (2).html`                    Original uploaded HTML  SOURCE STARTING POINT;
                                                              prototype               inspect if needed for
                                                                                      original content/layout

  `bhavatarini_catering_premium_siet_inspired.html`           First premium redesign  Historical prototype
                                                              inspired by the SIET    
                                                              design reference        

  `bhavatarini_catering_royal_green_premium.html`             Royal green premium     Historical prototype
                                                              iteration; includes     
                                                              embedded tiffin food    
                                                              image and               
                                                              active-section          
                                                              indicator               

  `bhavatarini_catering_royal_green_enriched_sections.html`   Intermediate enriched   Historical prototype
                                                              sections version        

  `bhavatarini_catering_royal_green_premium_v2.html`          Latest iteration with   **CURRENT SOURCE OF
                                                              enriched services and   TRUTH**
                                                              enlarged Why            
                                                              Choose/trust strip      
                                                              styling                 

  `a_high_quality_well_lit_food_product_photography.png`      Generated food/tiffin   Visual asset for
                                                              photograph              customised tiffin/menu
                                                                                      imagery
  -----------------------------------------------------------------------------------------------------------

The latest v2 HTML is approximately 4.08 MB because the generated food
photograph is embedded in base64 as well as being available separately.

### 4.2 Reference website

-   **URL:** `https://siet.ac.in`
-   **Role:** Visual/design inspiration for a spacious, polished,
    editorial, image-led website.
-   **Status:** Discussed as a reference website. It is not the business
    website and should not be copied literally.
-   **What to take from the reference direction:** Strong hierarchy,
    refined spacing, high-quality visual presentation and structured
    section layouts.
-   **What not to copy:** SIET's logo, brand identity, institutional
    copy, exact page content or proprietary assets.

### 4.3 Screenshot/reference image availability

The currently accessible project runtime contains the standalone tiffin
photograph listed above and the HTML files. No separate uploaded
screenshot of the SIET website, approved catering logo, real food
gallery, business premises, staff, customer events or menu photographs
was identified in the available files.

If the original conversation included screenshots that are not present
in the new account or transfer bundle, upload them separately. Do not
claim to have inspected images that are not available.

### 4.4 What to inspect in the current HTML before editing

The latest file is a standalone HTML document with embedded CSS and
JavaScript. It includes: - Google Fonts stylesheet links. - All current
page sections. - Embedded base64 food imagery. - Responsive CSS. -
Client-side menu, scroll and form interactions.

It has multiple accumulated CSS blocks from iterative redesigns. When
taking over: 1. Open the latest v2 file in a browser. 2. Inspect it at
desktop, tablet and mobile widths. 3. Save a copy before editing. 4.
Identify the final CSS token block and cascade order. 5. Avoid deleting
the embedded base64 image accidentally. 6. Consolidate CSS only after
visual regression checks.

------------------------------------------------------------------------

## 5. Functional Requirements and Workflows

### 5.1 Customer enquiry workflow --- current prototype

1.  Visitor opens the website.
2.  Visitor selects a service/menu category and clicks an enquiry CTA.
3.  Visitor reaches the Contact section.
4.  Visitor enters name and mobile number.
5.  Visitor optionally enters company/organisation.
6.  Visitor selects requirement type, food preference and approximate
    quantity.
7.  Visitor enters date, location, frequency or special requests.
8.  Visitor clicks "Send Enquiry via WhatsApp".
9.  Frontend constructs a formatted message and opens a WhatsApp URL.

**Current limitation:** The form does not store the enquiry in a
backend/database. A business recipient number has not been inserted in
the visible `wa.me` URL.

### 5.2 Required form validation --- pending implementation decision

At minimum, decide and implement: - Required name. - Required mobile
number. - Indian mobile validation rules (if the service is
India-only). - Required requirement type. - Required food preference. -
Required approximate quantity, if needed. - Date/location details
optional or required depending on the business workflow. - Helpful
inline validation messages. - Prevent submission when required fields
are invalid. - Trim/sanitize data before storage or message
generation. - Server-side validation if the form is connected to a
backend.

Do not assume all of these are already present. The current script only
clearly establishes value collection and WhatsApp message composition.

### 5.3 WhatsApp workflow

-   Add the confirmed business WhatsApp number.
-   Build the destination URL using the international country code and
    number, without spaces or plus sign in the path.
-   Encode the message.
-   Test on mobile and desktop.
-   Ensure the message fields match the form.
-   Track the click as a conversion after analytics is configured.

### 5.4 Admin login and enquiry management --- not implemented

If confirmed by the owner, the future admin workflow could be: 1. Admin
visits a protected admin URL. 2. Admin logs in securely. 3. Admin sees
incoming enquiries. 4. Admin opens an enquiry to view customer and
requirement details. 5. Admin changes status and optionally adds notes.
6. Changes persist in the database. 7. Admin logs out.

The status values, roles, notification workflow and retention rules need
owner approval. Do not hard-code suggested status labels as settled
business policy.

### 5.5 Email notifications --- not implemented / not confirmed

No email service, SMTP/API provider, notification template or
email-sending code was found.

Pending questions: - Should the business receive an email for every new
enquiry? - Should customers receive an acknowledgement email? - Which
business email address should receive notifications? - Which provider is
preferred? - Is email needed if WhatsApp is the primary enquiry channel?

### 5.6 Security and privacy

No production backend/security implementation was found. If a
backend/admin dashboard is built, define: - Secure password hashing. -
Protected admin routes and API endpoints. - Session/token handling and
secure cookie policy. - Rate limiting and spam protection. - Input
validation and output escaping. - HTTPS. - Database access restrictions
and backups. - Privacy notice and consent language appropriate to
collected customer data. - Data retention/deletion policy.

These are future implementation requirements, not features already
present.

------------------------------------------------------------------------

## 6. Business Content and Content Inventory

### 6.1 Confirmed copy currently in the latest prototype

**Brand** - Bhavatarini Catering Service

**Hero** - "Traditional South Indian Catering" - "Good Food. Beautifully
Served. Every Occasion." - "Homely, hygienic and reliable catering for
corporate offices, startups, small functions and gatherings."

**Services** - Corporate Catering --- "Daily meals, office lunches,
meetings and corporate events." - Startup & Office Catering ---
"Breakfast, lunch and food arrangements for growing teams." - Small
Functions --- "Housewarming, birthdays and private celebrations." -
Group Gatherings --- "Food arrangements for social and community
events."

**Approach** - "Good food. Thoughtfully served." - "From the first
conversation to the final serving, we make catering feel simple,
organised and welcoming." - "Tell us what you're planning." - "Share
your occasion, guest count, location and food preferences." - "Choose
your menu." - "Our signature full meals or a tiffin combination curated
around your needs." - "We prepare. You enjoy." - "We coordinate the food
arrangements for your office, function or gathering."

**Menu** - Full Meals --- Rice, Sambar, Rasam, Kuzhambu, Poriyal,
Appalam, Curd, Payasam, Pickle. - Tiffin (Customised) --- Idli, Dosa,
Pongal, Upma, Vada, Bajji, Samosa & more.

**Why choose us** - Consistent Quality - Flexible & Customisable -
Carefully Prepared - Service You Can Rely On

**Trust strip** - Traditional Taste --- "Authentic South Indian food" -
Hygienic & Safe --- "Care in every preparation" - Flexible for Your
Needs --- "Meals, tiffin and custom orders" - Reliable Service ---
"Planned and organised catering"

**Contact** - "Let's Plan Your Catering" - "Share a few details and
we'll get back to you." - "Made for teams, gatherings and good food." -
"Whether you need regular office meals or catering for a one-time event,
send us your requirements." - "Service area: Coimbatore and nearby
locations" - "Phone / WhatsApp: Add your business number before
publishing"

### 6.2 Confirmed business information

-   Business name: Bhavatarini Catering Service.
-   Business type: catering.
-   Location: Coimbatore, Tamil Nadu.
-   Stated service area: Coimbatore and nearby locations.
-   Core food positioning: traditional South Indian meals and customised
    tiffin.
-   Target categories: corporate offices, startups, small functions and
    group gatherings.

### 6.3 Missing information --- must be supplied by owner

  -----------------------------------------------------------------------
  Information                         Status
  ----------------------------------- -----------------------------------
  Official phone number               PENDING

  WhatsApp number with country code   PENDING

  Public email address                PENDING

  Full business address               PENDING

  Exact delivery/service areas        PENDING

  Business operating hours            PENDING

  Social media links                  PENDING

  Approved logo                       UNAVAILABLE in inspected files

  Real food photographs               PENDING / not found in inspected
                                      files

  Real event/catering photographs     PENDING

  Menu with exact item names and      PENDING verification
  availability                        

  Prices / per-plate rates            PENDING

  Minimum order quantities            PENDING

  Delivery charges / delivery policy  PENDING

  Advance/payment/cancellation policy PENDING

  Booking lead time                   PENDING

  Customer testimonials and review    PENDING
  permissions                         

  FSSAI or other business             PENDING verification; do not invent
  credentials, if applicable          or display until confirmed

  Exact founder/business story        PENDING
  -----------------------------------------------------------------------

### 6.4 Content accuracy rules

-   Do not invent a phone number, email, address, hours, pricing or
    social profile.
-   Do not claim FSSAI certification, awards, years of experience,
    customer counts or corporate clients unless verified.
-   Do not use generated food images as proof of real past catering
    work.
-   "Hygienic", "safe", "reliable" and "consistent quality" are current
    brand promises in the copy; the owner should ensure the claims
    accurately reflect business practices.

------------------------------------------------------------------------

## 7. Technical Decisions and Architecture

### 7.1 Current implementation

**IMPLEMENTED:** The latest prototype is a standalone HTML file
containing: - HTML structure. - CSS styles in the document. - JavaScript
for interactions. - Embedded base64 image. - Google Fonts loaded from
Google Fonts.

No build system or framework is required to open the current prototype
in a browser.

### 7.2 Frontend framework

  -----------------------------------------------------------------------
  Option                              Status
  ----------------------------------- -----------------------------------
  Current standalone                  IMPLEMENTED
  HTML/CSS/JavaScript                 

  React / Next.js / Vite              NOT CONFIRMED for this catering
                                      website

  Google Antigravity                  User's planned AI coding agent for
                                      continued development; not part of
                                      the website runtime itself
  -----------------------------------------------------------------------

The user has technical familiarity with React, Vite, Tailwind,
Node/Express, MongoDB and other web technologies from separate projects,
but that does not establish that those technologies were selected for
this catering website.

**Do not migrate to React or another framework without confirming that
the owner wants a framework-based rebuild.** A clean static website may
be sufficient for the public site; a backend is needed only if
persistent enquiry management/admin functionality is required.

### 7.3 Backend and database

-   Backend: NOT DECIDED / NOT IMPLEMENTED.
-   Database: NOT DECIDED / NOT IMPLEMENTED.
-   API architecture: NOT DECIDED.
-   Current enquiry form: client-side WhatsApp handoff only.

If admin management and persistent enquiry records are approved, choose
a backend/database deliberately and document the reason. Do not silently
assume MongoDB, MySQL, Firebase, Supabase or any other option.

### 7.4 Authentication

-   Admin authentication: NOT IMPLEMENTED.
-   Provider/approach: NOT DECIDED.
-   No admin credentials or roles exist in the current prototype.

### 7.5 Email service

-   No provider selected.
-   No email integration found.
-   No confirmed business email address.

### 7.6 Third-party integrations

**Present** - Google Fonts. - WhatsApp URL handoff (`wa.me`) with a
prefilled message; recipient number still needs configuration.

**Not found / not configured** - Payment gateway. - Maps/embed. - Google
Analytics 4. - Google Tag Manager. - Google Search Console
verification. - Meta Pixel. - CRM. - Email provider. - Booking/order
platform. - Backend API.

### 7.7 Hosting and domain

-   Hosting provider: PENDING.
-   Domain registrar/provider: PENDING.
-   Final domain: PENDING.
-   The user previously discussed domain selection and shared
    domain-related screenshots, but no final domain name or registrar
    choice is confirmed in the available project context.
-   The domain should be confirmed before production deployment.
-   The prototype can currently be opened locally as an HTML file; that
    is not the same as public hosting.

### 7.8 SEO and performance

The current HTML includes a meta description:

> "Bhavatarini Catering Service --- traditional South Indian meals,
> customised tiffin and catering for offices, startups and special
> occasions."

It also includes a viewport meta tag. No full SEO implementation or
verification was established.

Future implementation should include semantic headings, page title,
metadata, image alt text, canonical URL when domain is known, sitemap,
robots.txt, structured data where accurate, and performance checks.

------------------------------------------------------------------------

## 8. Existing Implementation and Known Limitations

### 8.1 Current source file

**Use:** `bhavatarini_catering_royal_green_premium_v2.html`

This is the latest known prototype and includes the previous iterative
visual updates.

### 8.2 Sections implemented

-   Home hero.
-   Services.
-   Our Approach / The Bhavatarini Experience.
-   Menu.
-   Why Choose Bhavatarini?
-   Contact/enquiry section.
-   Trust-strip content.
-   Header/navigation and footer elements.

### 8.3 Interactions implemented

-   Mobile nav toggle and close-on-link-click.
-   Dynamic footer year.
-   Client-side enquiry message assembly.
-   WhatsApp handoff.
-   Scroll reveal animation.
-   Scroll progress bar.
-   Back-to-top button.
-   Hero parallax on larger screens.
-   Active section indicator and active nav state.
-   Reduced-motion preference support.

### 8.4 Not implemented / not verified

-   Separate About page.
-   Gallery page/section.
-   Admin login/dashboard.
-   Database persistence.
-   Enquiry management.
-   Enquiry status updates.
-   Email notifications.
-   Real WhatsApp recipient number.
-   Payment/online ordering.
-   CMS/blog.
-   Analytics and advertising pixels.
-   Search Console / Business Profile integration.
-   Deployment/domain configuration.
-   Cookie/privacy controls.

### 8.5 Known implementation limitations

1.  **WhatsApp recipient missing:** current script opens
    `https://wa.me/?text=...`; add the verified business number.
2.  **No persistence:** enquiries are not saved to a database.
3.  **No email:** no email service configured.
4.  **No admin:** no dashboard or authentication.
5.  **CSS accumulation:** multiple rounds of redesign have appended
    style blocks and root tokens. Refactor carefully after preserving
    appearance.
6.  **Potentially placeholder content:** phone number explicitly says
    "Add your business number before publishing."
7.  **Content verification required:** menu, service areas, hours,
    prices and claims need owner confirmation.
8.  **Gallery absent:** no separate gallery section found.
9.  **Logo absent:** text wordmark is present; no approved logo file
    found.
10. **Generated image:** tiffin photograph is illustrative/generated,
    not evidence of an actual catering order.

### 8.6 Suggested next technical action

Before adding new features, establish a clean baseline: - Copy the
latest v2 file to a safe backup. - Open and test it in a browser. -
Record any visual issues. - Create a clear project structure only after
confirming whether the owner wants to retain standalone HTML or migrate
to a framework. - Keep the existing prototype functional while building
additional features incrementally.

------------------------------------------------------------------------

## 9. Digital Marketing Readiness

The website is intended to support customer acquisition. The following
is a readiness plan, not a claim that the integrations are already
configured.

### 9.1 Initial launch priorities

**Required before or at launch** - Basic on-page SEO. - Local SEO
content for Coimbatore and confirmed service areas. - Google Business
Profile setup/claim/verification, if the business is eligible and the
owner wants a public listing. - Correct phone/WhatsApp number and
consistent business details. - Search-friendly page title and meta
description. - Clear enquiry CTAs. - Mobile usability and page-speed
checks. - A privacy notice describing enquiry data collection. -
Trackable WhatsApp and phone links once analytics is configured.

### 9.2 Google Analytics 4 (GA4)

**Suggested for initial launch, pending owner approval** - Create/choose
a GA4 property. - Add the GA4 tag directly or via Google Tag Manager. -
Track page views and relevant events. - Potential events: -
`generate_lead` for a successful enquiry handoff (define carefully; a
WhatsApp link click is not proof that a message was sent). -
`click_whatsapp`. - `click_phone`. - `form_start`. - `form_submit` or
`whatsapp_enquiry_click`. - Avoid sending personal form data (name,
phone, free-text enquiry) to analytics.

### 9.3 Google Tag Manager (GTM)

**Suggested implementation approach** - Use GTM if the owner wants
centralised tag management. - Configure GA4 and conversion tags through
GTM. - Document consent/privacy requirements before deploying
advertising or analytics tags. - Avoid installing duplicate GA4 tags
through both hard-coded code and GTM.

### 9.4 Google Search Console

**Suggested for launch** - Verify ownership after final domain is
selected. - Submit sitemap. - Monitor indexing, search queries,
click-through rate and technical issues. - Ensure canonical URLs and
robots directives are correct.

### 9.5 Google Business Profile

**High-value local marketing opportunity; setup not verified** - Use the
exact business name and accurate contact details. - Set the correct
primary/secondary categories. - Add service area details only where
genuinely served. - Add real food, packaging and catering photographs. -
Keep hours and contact information updated. - Encourage genuine customer
reviews without incentives or fabricated reviews. - Link to the website
and enquiry channel.

### 9.6 Google Ads

**Later phase / optional** - Consider search campaigns for high-intent
local catering searches after the website and conversion tracking are
reliable. - Build focused landing pages for corporate catering, office
meals or event catering if there is enough distinct content. - Do not
begin paid campaigns before phone/WhatsApp destination, service area,
enquiry handling and conversion measurement are tested.

### 9.7 Meta Ads and Meta Pixel

**Later phase / optional** - Instagram/Facebook organic content can
support brand awareness. - Meta Pixel should only be installed when the
owner intends to run Meta campaigns or needs the measurement. -
Configure relevant lead/contact events and consent/privacy handling. -
Do not claim a lead conversion solely because a user opened WhatsApp.

### 9.8 Conversion tracking

Potential conversions: - WhatsApp enquiry button click. - Enquiry
form-to-WhatsApp click. - Phone click. - Email click (if an email is
added). - Admin-recorded qualified enquiry / confirmed booking, if a
backend/CRM is introduced.

Distinguish click events from actual enquiries and confirmed bookings.

### 9.9 UTM tracking

Use UTMs for campaign links, for example: - `utm_source` -
`utm_medium` - `utm_campaign` - `utm_content`

Use consistent naming conventions. Do not add personal information to
UTM parameters.

### 9.10 Landing pages

Potential later landing pages: - Corporate Catering in Coimbatore. -
Daily Office Meals. - Startup & Team Catering. - Small Function
Catering. - Customised Tiffin Catering.

These are suggestions; confirm business priorities and service capacity
first.

### 9.11 Blog/content marketing

Potential content themes: - South Indian meal options for office
teams. - Planning food quantities for a small function. - Customised
tiffin options for teams. - Catering checklist for housewarming or
birthday gatherings.

No blog/CMS is currently implemented. Start with useful, accurate
content only if the business can maintain it.

### 9.12 CRO and performance analytics

Later improvements: - Compare CTA wording and placement. - Check form
completion/drop-off. - Review device-level conversion performance. -
Measure image and page performance. - Test the clarity of service
categories and menu options. - Improve enquiry quality by asking only
for details the business needs.

### 9.13 Suggested rollout stages

  -----------------------------------------------------------------------
  Stage                   Scope                   Priority
  ----------------------- ----------------------- -----------------------
  Launch baseline         SEO metadata, mobile    MUST HAVE
                          performance, correct    
                          contact details,        
                          working WhatsApp        
                          enquiry                 

  Local discovery         Google Business         HIGH
                          Profile, Search         
                          Console, local SEO      

  Measurement             GA4 and/or GTM,         HIGH
                          WhatsApp/call click     
                          events, UTM conventions 

  Paid campaigns          Google Ads / Meta Ads   LATER, after tracking
                          and pixels              is verified

  Growth content          Landing pages,          LATER
                          blog/content marketing, 
                          CRO experiments         
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Confirmed Decisions vs Pending Decisions

### 10.1 Confirmed decisions

1.  Business name is **Bhavatarini Catering Service**.
2.  Business is a catering service in **Coimbatore, Tamil Nadu**.
3.  Website targets corporate offices, startups/teams, small functions
    and group gatherings.
4.  Main positioning is traditional South Indian food, homely/hygienic
    preparation, flexibility and reliable service.
5.  The current website direction is premium, rich, elegant, spacious
    and image-led.
6.  `https://siet.ac.in` was used as a design reference/inspiration, not
    as a template to copy.
7.  Latest intended palette is royal forest green, antique gold and warm
    ivory. The final token values are listed in Section 3.2.
8.  Latest intended fonts are Playfair Display and DM Sans.
9.  A customised tiffin section should include a realistic
    food/container image.
10. The current menu includes Full Meals and Customised Tiffin.
11. The current service categories are Corporate Catering, Startup &
    Office Catering, Small Functions and Group Gatherings.
12. The user requested larger/richer styling for Services, Why Choose
    Bhavatarini and the trust strip.
13. The latest working prototype is
    `bhavatarini_catering_royal_green_premium_v2.html`.
14. The user intends to continue development in another ChatGPT account
    using Google Antigravity.

### 10.2 Implemented in the prototype (not necessarily final business decisions)

-   One-page layout.
-   Hero, Services, Our Approach, Menu, Why Us, Contact sections.
-   Enquiry form with the listed fields.
-   WhatsApp message handoff code.
-   Mobile nav, scroll reveal, progress indicator, back-to-top, hero
    parallax and active-section indicator.
-   Embedded generated tiffin food photograph.
-   Latest enlarged Services, Why Us and trust-strip styling.

### 10.3 Suggested but not confirmed

-   Separate About page.
-   Dedicated Gallery section/page.
-   Admin dashboard and enquiry status workflow.
-   Database-backed enquiry storage.
-   Email notifications.
-   GA4/GTM.
-   Search Console.
-   Meta Pixel.
-   Google Ads / Meta Ads.
-   Blog/CMS.
-   Dedicated SEO landing pages.
-   CRM integration.
-   Payment/online ordering.
-   Any particular frontend framework/backend/database.
-   Specific hosting provider or domain registrar.

### 10.4 Unresolved questions

1.  What is the final public business phone number?
2.  What is the WhatsApp number, including country code?
3.  Is there a business email address?
4.  What is the exact address, if it should be public?
5.  Which nearby towns/areas are served?
6.  What are business/enquiry hours?
7.  What is the final domain name?
8.  Is there an approved logo?
9.  Should the current standalone HTML be retained or rebuilt in
    React/Next/Vite?
10. Is a backend/admin dashboard actually required for the first launch?
11. Should enquiries be stored, emailed, sent to WhatsApp, or all three?
12. Which email provider should be used if email notifications are
    required?
13. What are the exact menu items, prices and minimum quantities?
14. Are all menu items vegetarian? Are there non-vegetarian options?
15. What are delivery fees, payment terms, cancellation policy and
    booking lead time?
16. Which real photos can be used publicly?
17. Which social media accounts exist?
18. Should Google Business Profile, GA4, GTM and Search Console be
    configured at launch?
19. Should paid advertising be part of the initial launch or a later
    phase?
20. What admin roles/status values are needed if the dashboard is built?

### 10.5 Changed decisions / iteration history

The project went through several visual iterations: 1. Original uploaded
homepage HTML. 2. Premium redesign inspired by SIET's editorial/spacious
design language. 3. Royal green premium visual direction. 4. Tiffin
image inclusion and active section indicator. 5. Enriched service
styling and increased icon/content sizes for Why Choose and trust strip.

Historical palette tokens remain in earlier CSS blocks. The latest root
token block in v2 is the intended palette baseline. Use v2 rather than
older prototypes for continued development.

------------------------------------------------------------------------

## 11. Final Website Feature Checklist

### 11.1 Public website

-   [ ] Home hero with final approved brand copy and imagery.
-   [ ] Brand wordmark or approved logo.
-   [ ] Header/navigation with mobile menu.
-   [ ] Services section with four service categories.
-   [ ] About / Bhavatarini Experience content.
-   [ ] Menu section with verified Full Meals and Customised Tiffin
    options.
-   [ ] Real/approved tiffin and food images.
-   [ ] Why Choose Bhavatarini section.
-   [ ] Trust strip: Traditional Taste, Hygienic & Safe, Flexible for
    Your Needs, Reliable Service.
-   [ ] Gallery section/page with genuine approved photos.
-   [ ] Contact section with confirmed contact details.
-   [ ] Enquiry form.
-   [ ] WhatsApp CTA with correct recipient number.
-   [ ] Phone click-to-call link.
-   [ ] Footer with accurate details and social links.
-   [ ] Responsive desktop/tablet/mobile layouts.
-   [ ] Accessible navigation, labels, focus states and contrast.
-   [ ] Reduced-motion support.
-   [ ] Clear privacy notice.

### 11.2 Admin dashboard (if confirmed)

-   [ ] Admin login/logout.
-   [ ] Protected admin route.
-   [ ] Enquiry list.
-   [ ] Enquiry detail view.
-   [ ] Search/filter/sort.
-   [ ] Enquiry status update.
-   [ ] Persisted status changes.
-   [ ] Optional internal notes/follow-up.
-   [ ] Optional notification preferences.
-   [ ] Role/access control if multiple users are required.
-   [ ] Responsive admin interface.

### 11.3 Backend and database (if confirmed)

-   [ ] Backend/API selection documented.
-   [ ] Database selection documented.
-   [ ] Enquiry create/read/update workflow.
-   [ ] Server-side validation.
-   [ ] Spam/rate-limit protection.
-   [ ] Error handling and logging.
-   [ ] Database backup plan.
-   [ ] Data retention/deletion approach.
-   [ ] Email notification integration if required.
-   [ ] Secure configuration/secrets management.

### 11.4 Security

-   [ ] HTTPS.
-   [ ] Secure admin authentication.
-   [ ] Password hashing if password-based auth is used.
-   [ ] Protected API endpoints.
-   [ ] Input validation and output escaping.
-   [ ] Rate limiting and anti-spam.
-   [ ] No secrets/API keys embedded in public frontend code.
-   [ ] Secure cookies/session configuration where applicable.
-   [ ] Privacy notice and data-handling policy.
-   [ ] Backups and recovery plan.

### 11.5 SEO

-   [ ] Final domain selected.
-   [ ] Unique title and meta description.
-   [ ] Semantic heading hierarchy.
-   [ ] Image alt text.
-   [ ] Canonical URL.
-   [ ] Sitemap.xml.
-   [ ] Robots.txt.
-   [ ] Search Console verification.
-   [ ] Local SEO copy for verified service areas.
-   [ ] Structured data only where accurate and appropriate.
-   [ ] Google Business Profile linked and updated, if applicable.

### 11.6 Analytics and marketing

-   [ ] GA4 property.
-   [ ] GTM container if selected.
-   [ ] WhatsApp click event.
-   [ ] Phone click event.
-   [ ] Enquiry/lead event definitions.
-   [ ] Avoid sending personal form details to analytics.
-   [ ] UTM naming convention.
-   [ ] Google Ads conversion tracking if campaigns are run.
-   [ ] Meta Pixel if Meta campaigns are run.
-   [ ] Consent/privacy handling for tracking.
-   [ ] Landing pages for priority services if needed.
-   [ ] Review performance and conversion data.

### 11.7 Deployment and launch

-   [ ] Final content approved.
-   [ ] Contact details tested.
-   [ ] WhatsApp number tested on mobile and desktop.
-   [ ] Form validation tested.
-   [ ] All links tested.
-   [ ] Mobile and tablet QA.
-   [ ] Cross-browser QA.
-   [ ] Accessibility checks.
-   [ ] Performance/image optimisation.
-   [ ] Domain and hosting configured.
-   [ ] HTTPS enabled.
-   [ ] Search Console setup.
-   [ ] Analytics verified.
-   [ ] Backups and rollback plan.
-   [ ] Launch checklist signed off by business owner.

------------------------------------------------------------------------

## 12. Files to Transfer to the New ChatGPT Account

### 12.1 Essential files --- transfer these first

1.  **`bhavatarini_catering_royal_green_premium_v2.html`**\
    Latest prototype and the current source of truth.

2.  **`a_high_quality_well_lit_food_product_photography.png`**\
    Standalone generated tiffin/food photograph. The latest HTML also
    embeds it, but transfer the standalone image so it can be reused
    independently.

3.  **`bhavatarini_catering_homepage (2).html`**\
    Original uploaded HTML prototype. Useful for tracing original
    structure and content.

### 12.2 Historical design iterations --- recommended to transfer

4.  `bhavatarini_catering_premium_siet_inspired.html`\
5.  `bhavatarini_catering_royal_green_premium.html`\
6.  `bhavatarini_catering_royal_green_enriched_sections.html`

These help another assistant understand how the current design evolved.
The latest v2 remains the preferred base for edits.

### 12.3 Additional references to provide if available

-   Any SIET screenshots or visual references used during the original
    design discussion.
-   Approved Bhavatarini Catering Service logo (if one exists).
-   Real food photographs.
-   Real catering/event photographs.
-   Menu/price list.
-   Business contact details and service-area list.
-   Any social media profile URLs.
-   Domain registration screenshots/details if a domain was purchased.
-   Any later screenshots showing the exact desired layout or visual
    corrections.

**Availability note:** No separate approved logo, real catering gallery,
final business contact sheet or verified pricing document was found in
the accessible files inspected for this handover. Upload these
separately if they exist. The only standalone image asset identified was
the generated tiffin food photograph.

### 12.4 Recommended transfer order

1.  Download the latest v2 HTML.
2.  Download the standalone tiffin photograph.
3.  Download the original uploaded HTML.
4.  Download the historical iterations if you want full design history.
5.  Upload this `PROJECT_HANDOVER.md` file to the new ChatGPT account.
6.  Upload the business logo, real photos, final menu and contact
    details when available.

------------------------------------------------------------------------

## 13. Instructions for the Next ChatGPT Assistant and Google Antigravity

Use the following as the continuation brief:

1.  Treat this handover document as the project context.
2.  Treat `bhavatarini_catering_royal_green_premium_v2.html` as the
    current implementation baseline.
3.  Inspect the actual HTML before proposing changes; do not assume the
    prototype is a React app or has a backend.
4.  Preserve the established royal forest green / antique gold / warm
    ivory theme and Playfair Display + DM Sans typography unless the
    owner requests a change.
5.  Preserve the realistic generated tiffin image and existing
    interactions when editing.
6.  Continue the iterative visual approach: implement requested changes
    in the actual project files, not only as design suggestions.
7.  Do not claim that an admin dashboard, database, email notification,
    Gallery page or analytics integration exists until it has actually
    been implemented and tested.
8.  Ask the owner for missing business facts instead of inventing them.
9.  Keep the prototype working while adding features incrementally.
10. Before a large refactor, create a backup and explain the migration
    plan.
11. Test all screen sizes and all enquiry/WhatsApp workflows after each
    change.
12. Clearly label proposed features as proposals until the owner
    approves them.

### Suggested first session in the new account

-   Verify the transferred files are present.
-   Open the latest v2 HTML and inspect the current appearance.
-   Ask the owner for the real WhatsApp number, public contact details,
    final domain and whether an admin dashboard is required for launch.
-   Create a short implementation backlog separating launch-critical
    work from later enhancements.
-   Then continue development with Google Antigravity using the actual
    project files.

------------------------------------------------------------------------

**End of handover document.**
