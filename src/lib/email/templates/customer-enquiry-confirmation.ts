import "server-only";

import { escapeHtml, formatISTDateTime, formatEventDate } from "./utils";
import { siteConfig } from "@/lib/config/site";

export interface CustomerConfirmationPayload {
  enquiry_number: string;
  name: string;
  requirement_type: string;
  food_preference?: string | null;
  quantity_range?: string | null;
  event_date?: string | null;
  location?: string | null;
  created_at?: string;
}

export function renderCustomerConfirmation(payload: CustomerConfirmationPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const enquiryNumber = payload.enquiry_number || "ENQ-PENDING";
  const customerName = payload.name || "Valued Customer";
  const requirementType = payload.requirement_type || "Catering Enquiry";
  const submittedAt = formatISTDateTime(payload.created_at);
  const eventDateFormatted = payload.event_date ? formatEventDate(payload.event_date) : null;

  const phone = siteConfig.contact.phone;
  const whatsapp = siteConfig.contact.whatsapp;
  const officialEmail = siteConfig.contact.email;

  const subject = `Enquiry Received: ${enquiryNumber} - Bhavatarini Catering Service`;

  const contactSectionHtml = (phone || whatsapp || officialEmail) ? `
    <div style="background-color: #f7f3ec; border-left: 3px solid #c59b27; padding: 14px 16px; margin: 24px 0; border-radius: 4px; font-size: 13px; color: #4b5563;">
      <div style="font-weight: 600; color: #1b4332; margin-bottom: 6px;">Need to share immediate updates or have questions?</div>
      <div>Reach out to our team directly:</div>
      <div style="margin-top: 6px;">
        ${phone ? `<span>&#9742; Phone: <strong>${escapeHtml(phone)}</strong></span> &nbsp;&bull;&nbsp; ` : ""}
        ${whatsapp ? `<span>&#128172; WhatsApp: <strong>${escapeHtml(whatsapp)}</strong></span> &nbsp;&bull;&nbsp; ` : ""}
        ${officialEmail ? `<span>&#9993; Email: <strong>${escapeHtml(officialEmail)}</strong></span>` : ""}
      </div>
    </div>
  ` : `
    <div style="background-color: #f7f3ec; border-left: 3px solid #c59b27; padding: 14px 16px; margin: 24px 0; border-radius: 4px; font-size: 13px; color: #4b5563;">
      <div style="font-weight: 600; color: #1b4332; margin-bottom: 4px;">Our team is reviewing your requirements</div>
      <div>We will contact you shortly using the phone number provided in your enquiry.</div>
    </div>
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4efe6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f4efe6;
      padding: 32px 16px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 600px;
      border-radius: 8px;
      border: 1px solid #e5ded3;
      box-shadow: 0 4px 12px rgba(27, 67, 50, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #133324 0%, #1b4332 100%);
      padding: 28px 24px;
      text-align: center;
      border-bottom: 3px solid #c59b27;
    }
    .brand-title {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0 0 6px 0;
    }
    .brand-tagline {
      color: #d1dfd6;
      font-size: 12px;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #133324;
      margin: 0 0 14px 0;
    }
    .body-p {
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
      margin: 0 0 16px 0;
    }
    .card-ref {
      background-color: #fcfaf6;
      border: 1px solid #ebe4d8;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .card-ref-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #c59b27;
      margin-bottom: 6px;
    }
    .card-ref-number {
      font-size: 22px;
      font-weight: 700;
      color: #1b4332;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .ref-meta {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.5;
    }
    .steps-box {
      margin: 24px 0;
    }
    .step-item {
      display: flex;
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: #374151;
    }
    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background-color: #1b4332;
      color: #ffffff;
      font-size: 11px;
      font-weight: bold;
      display: inline-block;
      text-align: center;
      line-height: 22px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .footer {
      background-color: #faf7f2;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #ebe4d8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td class="header">
          <div class="brand-title">Bhavatarini Catering Service</div>
          <div class="brand-tagline">Traditional South Indian Catering &bull; Coimbatore</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="greeting">Vanakkam ${escapeHtml(customerName)},</div>

          <p class="body-p">
            Thank you for reaching out to <strong>Bhavatarini Catering Service</strong>. We have received your enquiry and our coordinator is reviewing your catering requirements.
          </p>

          <div class="card-ref">
            <div class="card-ref-title">Your Enquiry Reference</div>
            <div class="card-ref-number">${escapeHtml(enquiryNumber)}</div>
            <div class="ref-meta">
              <div><strong>Requirement:</strong> ${escapeHtml(requirementType)}</div>
              ${eventDateFormatted ? `<div><strong>Event Date:</strong> ${escapeHtml(eventDateFormatted)}</div>` : ""}
              ${payload.location ? `<div><strong>Location:</strong> ${escapeHtml(payload.location)}</div>` : ""}
              <div><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</div>
            </div>
          </div>

          <div class="steps-box">
            <div style="font-weight: 600; font-size: 14px; color: #133324; margin-bottom: 12px;">What happens next?</div>
            <div style="font-size: 13px; line-height: 1.6; color: #374151;">
              <p style="margin: 0 0 8px 0;">&bull; <strong>Requirement Review:</strong> We verify availability and kitchen scheduling for your requested date.</p>
              <p style="margin: 0 0 8px 0;">&bull; <strong>Coordinator Discussion:</strong> We will contact you directly to finalize your customized menu selections and headcount.</p>
              <p style="margin: 0;">&bull; <strong>Tailored Menu &amp; Quote:</strong> We prepare a clear, itemized proposal for your review.</p>
            </div>
          </div>

          ${contactSectionHtml}

          <p class="body-p" style="margin-top: 24px; margin-bottom: 4px;">
            Warm regards,
          </p>
          <p style="font-weight: 600; color: #1b4332; margin: 0;">
            Bhavatarini Catering Service
          </p>
          <p style="font-size: 12px; color: #6b7280; margin: 2px 0 0 0;">
            Coimbatore, Tamil Nadu
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          You are receiving this confirmation because a catering enquiry was submitted using your email address on the Bhavatarini Catering Service website.<br>
          Coimbatore, Tamil Nadu, India.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const text = `=======================================================
BHAVATARINI CATERING SERVICE, COIMBATORE
Traditional South Indian Catering
=======================================================

Vanakkam ${customerName},

Thank you for reaching out to Bhavatarini Catering Service. We have received your enquiry and our coordinator is reviewing your catering requirements.

YOUR ENQUIRY DETAILS:
-------------------------------------------------------
Reference Number:  ${enquiryNumber}
Requirement:       ${requirementType}
${eventDateFormatted ? `Event Date:        ${eventDateFormatted}\n` : ""}${payload.location ? `Location:          ${payload.location}\n` : ""}Submitted At:      ${submittedAt}

WHAT HAPPENS NEXT?
-------------------------------------------------------
1. Requirement Review: We verify kitchen scheduling and availability for your date.
2. Coordinator Discussion: Our coordinator will contact you directly via phone or WhatsApp to discuss your custom menu and preferences.
3. Tailored Menu & Quote: We prepare a clear, itemized proposal for your review.

${phone || whatsapp || officialEmail ? `NEED IMMEDIATE ASSISTANCE?
${phone ? `Phone: ${phone}\n` : ""}${whatsapp ? `WhatsApp: ${whatsapp}\n` : ""}${officialEmail ? `Email: ${officialEmail}\n` : ""}` : ""}

Warm regards,
Bhavatarini Catering Service
Coimbatore, Tamil Nadu
`;

  return { subject, html, text };
}
