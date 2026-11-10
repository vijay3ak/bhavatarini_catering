import "server-only";

import { escapeHtml, formatISTDateTime, formatEventDate } from "./utils";

export interface AdminEnquiryAlertPayload {
  enquiry_number: string;
  name: string;
  phone: string;
  email?: string | null;
  organisation?: string | null;
  requirement_type: string;
  food_preference?: string | null;
  quantity_range?: string | null;
  event_date?: string | null;
  location?: string | null;
  details?: string | null;
  created_at?: string;
}

export function renderAdminEnquiryAlert(payload: AdminEnquiryAlertPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const enquiryNumber = payload.enquiry_number || "ENQ-PENDING";
  const customerName = payload.name || "Customer";
  const phone = (payload.phone || "").replace(/\D/g, "");
  const formattedPhone = phone.length === 10 ? `+91 ${phone}` : payload.phone;
  const email = payload.email?.trim() || null;
  const requirementType = payload.requirement_type || "Catering Enquiry";
  const foodPreference = payload.food_preference || "Not specified";
  const quantityRange = payload.quantity_range || "To be confirmed";
  const eventDateFormatted = formatEventDate(payload.event_date);
  const location = payload.location || "Not specified";
  const details = payload.details?.trim() || "None provided";
  const submittedAt = formatISTDateTime(payload.created_at);

  const cleanPhoneForWa = phone.length === 10 ? `91${phone}` : phone;
  const waPreFill = encodeURIComponent(
    `Vanakkam ${customerName}, this is regarding your catering enquiry (${enquiryNumber}) with Bhavatarini Catering Service Coimbatore.`
  );
  const waUrl = `https://wa.me/${cleanPhoneForWa}?text=${waPreFill}`;
  const telUrl = `tel:+91${phone}`;

  const subject = `[New Enquiry] ${enquiryNumber} - ${customerName} (${requirementType})`;

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
    .badge {
      display: inline-block;
      background-color: rgba(197, 155, 39, 0.2);
      border: 1px solid #c59b27;
      color: #ffd875;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 9999px;
    }
    .content {
      padding: 28px 24px;
    }
    .headline {
      font-size: 18px;
      font-weight: 600;
      color: #133324;
      margin: 0 0 16px 0;
    }
    .actions {
      margin: 0 0 24px 0;
      display: flex;
      gap: 12px;
    }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
    }
    .btn-call {
      background-color: #1b4332;
      color: #ffffff !important;
    }
    .btn-wa {
      background-color: #25d366;
      color: #ffffff !important;
    }
    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .detail-table tr {
      border-bottom: 1px solid #f0ebe1;
    }
    .detail-table tr:last-child {
      border-bottom: none;
    }
    .detail-label {
      width: 38%;
      padding: 10px 8px 10px 0;
      font-weight: 600;
      color: #6b7280;
      vertical-align: top;
    }
    .detail-value {
      width: 62%;
      padding: 10px 0 10px 8px;
      color: #111827;
      vertical-align: top;
    }
    .highlight-value {
      font-weight: 600;
      color: #1b4332;
    }
    .notes-box {
      background-color: #fcfaf6;
      border: 1px solid #ebe4d8;
      border-radius: 6px;
      padding: 14px 16px;
      margin-top: 16px;
      font-size: 13px;
      line-height: 1.5;
      color: #374151;
      white-space: pre-wrap;
    }
    .footer {
      background-color: #faf7f2;
      padding: 16px 24px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #ebe4d8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td class="header">
          <div class="brand-title">Bhavatarini Catering Service</div>
          <span class="badge">New Enquiry Alert &bull; Coimbatore</span>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="headline">Enquiry Reference: ${escapeHtml(enquiryNumber)}</div>

          <div style="margin-bottom: 20px;">
            <a href="${escapeHtml(telUrl)}" class="btn btn-call" style="margin-right: 8px;">&#9742; Call Customer</a>
            <a href="${escapeHtml(waUrl)}" class="btn btn-wa" target="_blank" rel="noopener noreferrer">&#128172; WhatsApp Chat</a>
          </div>

          <table class="detail-table" role="presentation">
            <tr>
              <td class="detail-label">Customer Name</td>
              <td class="detail-value highlight-value">${escapeHtml(customerName)}</td>
            </tr>
            <tr>
              <td class="detail-label">Mobile Number</td>
              <td class="detail-value"><a href="${escapeHtml(telUrl)}" style="color: #1b4332; text-decoration: none; font-weight: 600;">${escapeHtml(formattedPhone)}</a></td>
            </tr>
            <tr>
              <td class="detail-label">Email Address</td>
              <td class="detail-value">${email ? `<a href="mailto:${escapeHtml(email)}" style="color: #1b4332;">${escapeHtml(email)}</a>` : '<span style="color: #9ca3af; font-style: italic;">Not provided</span>'}</td>
            </tr>
            <tr>
              <td class="detail-label">Requirement Type</td>
              <td class="detail-value">${escapeHtml(requirementType)}</td>
            </tr>
            <tr>
              <td class="detail-label">Food Preference</td>
              <td class="detail-value">${escapeHtml(foodPreference)}</td>
            </tr>
            <tr>
              <td class="detail-label">Estimated Guests</td>
              <td class="detail-value highlight-value">${escapeHtml(quantityRange)}</td>
            </tr>
            <tr>
              <td class="detail-label">Event Date</td>
              <td class="detail-value highlight-value">${escapeHtml(eventDateFormatted)}</td>
            </tr>
            <tr>
              <td class="detail-label">Event Location</td>
              <td class="detail-value">${escapeHtml(location)}</td>
            </tr>
            <tr>
              <td class="detail-label">Submitted At (IST)</td>
              <td class="detail-value">${escapeHtml(submittedAt)}</td>
            </tr>
          </table>

          <div style="font-weight: 600; font-size: 13px; color: #4b5563;">Special Instructions / Details:</div>
          <div class="notes-box">${escapeHtml(details)}</div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          This is an automated notification from Bhavatarini Catering Service enquiry system.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const text = `=======================================================
BHAVATARINI CATERING SERVICE - NEW ENQUIRY ALERT
=======================================================

Enquiry Reference: ${enquiryNumber}
Submitted At:      ${submittedAt}

CUSTOMER DETAILS:
-------------------------------------------------------
Name:              ${customerName}
Phone:             ${formattedPhone}
Email:             ${email || "Not provided"}

EVENT & CATERING DETAILS:
-------------------------------------------------------
Requirement Type:  ${requirementType}
Food Preference:   ${foodPreference}
Estimated Guests:  ${quantityRange}
Event Date:        ${eventDateFormatted}
Location:          ${location}

DETAILS & SPECIAL INSTRUCTIONS:
-------------------------------------------------------
${details}

QUICK ACTIONS:
- Call:     tel:+91${phone}
- WhatsApp: ${waUrl}

=======================================================
Bhavatarini Catering Service, Coimbatore
`;

  return { subject, html, text };
}
