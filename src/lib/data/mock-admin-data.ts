import type { CorporateCustomer, AdminActivityItem, AdminKpiMetrics } from "@/types/admin";
import type { EnquiryRecord } from "@/types/enquiry";
import type { ArchivedInvoice, DailyBillingEntry } from "@/types/billing";
import {
  generateMonthlyCalendar,
  calculateRowBillQty,
  calculateBillingKpis,
} from "@/lib/utils/billing-calculations";

/**
 * Corporate Customer Presets from billing prototype reference
 * Explicitly marks pending/unconfirmed details rather than inventing phone numbers or contacts.
 */
export const MOCK_CORPORATE_CUSTOMERS: CorporateCustomer[] = [
  {
    id: "cust-hydac",
    name: "HYDAC INDIA PRIVATE LIMITED",
    shortCode: "HYDAC",
    billingAddress: "CHETTIPALAYAM, COIMBATORE - 641201",
    deliveryLocation: "CHETTIPALAYAM",
    gstin: "33AAACH2910B1ZH",
    pan: "AAACH2910B",
    contactPerson: "HR & Plant Admin (Pending confirmation)",
    contactPhone: "Pending confirmation",
    contactEmail: "Pending confirmation",
    contractStatus: "Active Daily Contract",
    defaultPreset: "BREAKFAST & DINNER",
    defaultRate: 48.0,
    notes: "Daily canteen arrangements for Shift 1 breakfast and Shift 2 dinner. Sunday overtime as per monthly roster.",
    activeContractsCount: 1,
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "cust-lmw",
    name: "LAKSHMI MACHINE WORKS LIMITED",
    shortCode: "LMW",
    billingAddress: "SRK VIDYALAYA POST, PERIYANAICKENPALAYAM, COIMBATORE - 641020",
    deliveryLocation: "UNIT II",
    gstin: "33AAACL1234F1Z1",
    pan: "AAACL1234F",
    contactPerson: "Canteen Operations Committee (Pending confirmation)",
    contactPhone: "Pending confirmation",
    contactEmail: "Pending confirmation",
    contractStatus: "Active Daily Contract",
    defaultPreset: "LUNCH",
    defaultRate: 52.0,
    notes: "Daily full meals lunch supply delivered to Unit II distribution hub.",
    activeContractsCount: 1,
    createdAt: "2026-05-15T00:00:00Z",
    updatedAt: "2026-10-28T14:30:00Z",
  },
  {
    id: "cust-pricol",
    name: "PRICOL LIMITED",
    shortCode: "PRICOL",
    billingAddress: "109, RACE COURSE ROAD, COIMBATORE - 641018",
    deliveryLocation: "PLANT 1",
    gstin: "33AAACP5678K1Z5",
    pan: "AAACP5678K",
    contactPerson: "Facility Supervisor (Pending confirmation)",
    contactPhone: "Pending confirmation",
    contactEmail: "Pending confirmation",
    contractStatus: "Active Daily Contract",
    defaultPreset: "BREAKFAST & DINNER",
    defaultRate: 48.0,
    notes: "Industrial plant catering. Stainless steel hot-case containers required for delivery.",
    activeContractsCount: 1,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-11-02T16:00:00Z",
  },
  {
    id: "cust-custom",
    name: "CUSTOM CLIENT ENTERPRISE",
    shortCode: "CUSTOM",
    billingAddress: "INDUSTRIAL ESTATE, COIMBATORE - 641001",
    deliveryLocation: "COIMBATORE",
    gstin: "33AAAAA0000A1Z5",
    pan: "AAAAA0000A",
    contactPerson: "Site Coordinator (Pending confirmation)",
    contactPhone: "Pending confirmation",
    contactEmail: "Pending confirmation",
    contractStatus: "Periodic Orders",
    defaultPreset: "CUSTOM",
    defaultRate: 50.0,
    notes: "Ad-hoc team meals and special management review lunches on request.",
    activeContractsCount: 0,
    createdAt: "2026-08-10T00:00:00Z",
    updatedAt: "2026-10-15T09:00:00Z",
  },
];

/**
 * Realistic Sample Enquiry Records for UI testing
 * Clearly flagged as sample/demo data.
 */
export const MOCK_ENQUIRIES: EnquiryRecord[] = [
  {
    id: "enq-101",
    name: "R. Saravanan",
    phone: "9842100001",
    email: "saravanan.ops@example.com",
    organisation: "Coimbatore Auto Tech Components",
    location: "Peelamedu, Coimbatore",
    requirement_type: "Corporate office",
    food_preference: "Full meals",
    quantity: "65 persons",
    quantity_range: "50–100",
    event_date: "2026-11-15",
    details: "Daily lunch requirement for factory engineers. Banana leaf or hygienic steel container supply.",
    created_at: "2026-11-04T09:30:00Z",
    updated_at: "2026-11-04T09:30:00Z",
    status: "new",
    internal_notes: "Uncontacted lead from Peelamedu industrial area. Need to follow up with sample tasting schedule.",
    whatsapp_initiated: false,
    email_notification_sent: true,
  },
  {
    id: "enq-102",
    name: "M. Karthikeyan",
    phone: "9789200002",
    email: "karthi@nexgenstartup.in",
    organisation: "NexGen Digital Solutions",
    location: "Tidel Park, Coimbatore",
    requirement_type: "Startup / team",
    food_preference: "Customised tiffin",
    quantity: "35 persons",
    quantity_range: "Below 50",
    event_date: "2026-11-18",
    details: "Morning breakfast & filter coffee for team standup. Need weekly alternating tiffin menu.",
    created_at: "2026-11-03T14:15:00Z",
    updated_at: "2026-11-04T08:00:00Z",
    status: "contacted",
    internal_notes: "Spoke via phone. Customer requested sample pricing for 35 Pax Idli-Vada-Pongal rotation.",
    whatsapp_initiated: true,
    email_notification_sent: true,
  },
  {
    id: "enq-103",
    name: "Mrs. Revathi Sundaram",
    phone: "9443300003",
    email: "revathi.s@example.com",
    organisation: "Private Family Residence",
    location: "RS Puram, Coimbatore",
    requirement_type: "Small function",
    food_preference: "Full meals",
    quantity: "85 persons",
    quantity_range: "50–100",
    event_date: "2026-11-24",
    details: "Traditional South Indian lunch for housewarming (Grihapravesham). Including special payasam and appalam.",
    created_at: "2026-11-02T11:00:00Z",
    updated_at: "2026-11-03T16:30:00Z",
    status: "quote_sent",
    internal_notes: "Quote sent for 85 guests traditional banana leaf banquet. Customer reviewing with family.",
    whatsapp_initiated: true,
    email_notification_sent: true,
  },
  {
    id: "enq-104",
    name: "G. Vasanth Kumar",
    phone: "9894400004",
    email: "vasanth@texmach.co.in",
    organisation: "Coimbatore Textile Machinery Forum",
    location: "CODISSIA Trade Fair Complex, Coimbatore",
    requirement_type: "Group gathering",
    food_preference: "Both meals and tiffin",
    quantity: "220 persons",
    quantity_range: "200–500",
    event_date: "2026-12-05",
    details: "Full day symposium catering. Morning tiffin, traditional afternoon full meals, and evening filter tea.",
    created_at: "2026-11-01T16:45:00Z",
    updated_at: "2026-11-04T11:20:00Z",
    status: "confirmed",
    internal_notes: "Order confirmed. Advance token received. Kitchen staff schedule blocked for Dec 5.",
    whatsapp_initiated: true,
    email_notification_sent: true,
  },
  {
    id: "enq-105",
    name: "S. Prabhu",
    phone: "9843000005",
    email: "prabhu.eng@example.com",
    organisation: "L&T Bypass Logistics Hub",
    location: "Eachanari, Coimbatore",
    requirement_type: "Corporate office",
    food_preference: "Full meals",
    quantity: "40 persons",
    quantity_range: "Below 50",
    event_date: "2026-10-28",
    details: "One-time client audit lunch buffet. Traditional meals with South Indian desserts.",
    created_at: "2026-10-25T10:00:00Z",
    updated_at: "2026-10-29T18:00:00Z",
    status: "completed",
    internal_notes: "Completed successfully on Oct 28. Client expressed appreciation for timely delivery.",
    whatsapp_initiated: false,
    email_notification_sent: true,
  },
];

/**
 * Operational Activity Feed
 */
export const MOCK_ACTIVITY_FEED: AdminActivityItem[] = [
  {
    id: "act-1",
    title: "New Enquiry Received",
    description: "Coimbatore Auto Tech Components submitted requirement for 65 meals (Peelamedu).",
    timestamp: "Today at 09:30 AM",
    category: "enquiry",
    badgeText: "New Lead",
    badgeVariant: "gold",
  },
  {
    id: "act-2",
    title: "Enquiry Status Updated",
    description: "NexGen Digital Solutions moved to 'Contacted' following initial menu coordination.",
    timestamp: "Today at 08:00 AM",
    category: "enquiry",
    badgeText: "Contacted",
    badgeVariant: "blue",
  },
  {
    id: "act-3",
    title: "Catering Contract Confirmed",
    description: "CODISSIA Textile Symposium booking confirmed for 220 guests (Dec 5).",
    timestamp: "Yesterday at 04:45 PM",
    category: "enquiry",
    badgeText: "Confirmed",
    badgeVariant: "green",
  },
  {
    id: "act-4",
    title: "Monthly Billing Draft Reconciled",
    description: "Draft ledger tallies reconciled for HYDAC India Private Limited (Chettipalayam Unit).",
    timestamp: "Nov 02 at 03:15 PM",
    category: "billing",
    badgeText: "Billing Draft",
    badgeVariant: "neutral",
  },
  {
    id: "act-5",
    title: "Corporate Profile Updated",
    description: "LMW (Unit II) contract preset confirmed as LUNCH @ ₹52.00 per meal.",
    timestamp: "Oct 28 at 02:30 PM",
    category: "customer",
    badgeText: "Profile Updated",
    badgeVariant: "neutral",
  },
];

/**
 * Overview KPI Summary (Mock values clearly labeled)
 */
export const MOCK_KPI_METRICS: AdminKpiMetrics = {
  totalCustomers: 4,
  activeCustomers: 3,
  newEnquiries: 1,
  pendingEnquiries: 2,
  isSampleData: true,
};

/**
 * ==============================================================================
 * MOCK ARCHIVED INVOICES (DEMONSTRATION DATASET)
 * ==============================================================================
 *
 * NOTICE & DISCLAIMER:
 * This dataset provides realistic, deterministic mock historical invoice records
 * for the Bhavatarini Catering admin billing archive (Phase 3D).
 *
 * Fictitious Demonstration Data:
 * - Payment references (DEMO-*) and payment dates are simulation values.
 * - No actual customer financial, bank, or tax transactions are represented.
 * - Customer snapshots are deep-cloned immutable copies of the corporate master.
 *
 * Calculation Engine Conformance:
 * - Reconciled with central calculateRowBillQty() and calculateBillingKpis().
 * - Total billable quantities exclude non-billable snacks and audit-only tea.
 * - Combined meal notations (e.g. '65 Breakfast, Dinner') evaluate to single shift headcount.
 * - Calendar day counts correspond accurately to calendar months (Sep: 30, Oct: 31).
 */

function buildHydacOct2026Entries(): DailyBillingEntry[] {
  const calendar = generateMonthlyCalendar(9, 2026, "BREAKFAST & DINNER");
  return calendar.map((entry) => {
    const id = `entry_inv_hydac_2026_10_${entry.dayNumber}`;

    if (entry.isSunday) {
      if (entry.dayNumber === 11) {
        // 2nd Sunday: Overtime maintenance shift
        const row: DailyBillingEntry = {
          ...entry,
          id,
          breakfast: 15,
          dinner: 15,
          lunch: 0,
          tea: 30,
          snacks: 0,
          particulars: "SUNDAY",
          isManualParticulars: false,
          remarks: "Maintenance overtime shift team",
          billQty: 0,
        };
        row.billQty = calculateRowBillQty(row);
        return row;
      }
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        tea: 0,
        snacks: 0,
        particulars: "SUNDAY",
        isManualParticulars: false,
        remarks: "",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    if (entry.dayNumber === 14) {
      // Mid-month combined notation entry
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 35,
        dinner: 30,
        lunch: 0,
        tea: 45,
        snacks: 20,
        combinedNotation: "65 Breakfast, Dinner",
        particulars: "BREAKFAST & DINNER",
        isManualParticulars: false,
        remarks: "Combined shift headcount verified with plant supervisor",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    if (entry.dayNumber === 20) {
      // 2nd combined notation entry
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 38,
        dinner: 32,
        lunch: 0,
        tea: 50,
        snacks: 25,
        combinedNotation: "70 Breakfast, Dinner",
        particulars: "BREAKFAST & DINNER",
        isManualParticulars: false,
        remarks: "Special production batch overtime",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    const bf = 28 + (entry.dayNumber % 5);
    const dn = 34 + (entry.dayNumber % 4);
    const row: DailyBillingEntry = {
      ...entry,
      id,
      breakfast: bf,
      dinner: dn,
      lunch: 0,
      tea: 40,
      snacks: 20,
      particulars: "BREAKFAST & DINNER",
      isManualParticulars: false,
      remarks: "",
      billQty: 0,
    };
    row.billQty = calculateRowBillQty(row);
    return row;
  });
}

function buildLmwOct2026Entries(): DailyBillingEntry[] {
  const calendar = generateMonthlyCalendar(9, 2026, "LUNCH");
  return calendar.map((entry) => {
    const id = `entry_inv_lmw_2026_10_${entry.dayNumber}`;

    if (entry.isSunday) {
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        tea: 0,
        snacks: 0,
        particulars: "SUNDAY",
        isManualParticulars: false,
        remarks: "",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    const lunchQty = 46 + (entry.dayNumber % 6);
    const row: DailyBillingEntry = {
      ...entry,
      id,
      breakfast: 0,
      lunch: lunchQty,
      dinner: 0,
      tea: 48,
      snacks: 0,
      particulars: "LUNCH",
      isManualParticulars: false,
      remarks: entry.dayNumber === 15 ? "Special audit team extra lunch packs" : "",
      billQty: 0,
    };
    row.billQty = calculateRowBillQty(row);
    return row;
  });
}

function buildPricolSep2026Entries(): DailyBillingEntry[] {
  const calendar = generateMonthlyCalendar(8, 2026, "BREAKFAST & DINNER");
  return calendar.map((entry) => {
    const id = `entry_inv_pricol_2026_09_${entry.dayNumber}`;

    if (entry.isSunday) {
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        tea: 0,
        snacks: 0,
        particulars: "SUNDAY",
        isManualParticulars: false,
        remarks: "",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    const bf = 26 + (entry.dayNumber % 5);
    const dn = 32 + (entry.dayNumber % 4);
    const row: DailyBillingEntry = {
      ...entry,
      id,
      breakfast: bf,
      dinner: dn,
      lunch: 0,
      tea: 35,
      snacks: 15,
      particulars: "BREAKFAST & DINNER",
      isManualParticulars: false,
      remarks: "",
      billQty: 0,
    };
    row.billQty = calculateRowBillQty(row);
    return row;
  });
}

function buildHydacSep2026Entries(): DailyBillingEntry[] {
  const calendar = generateMonthlyCalendar(8, 2026, "BREAKFAST & DINNER");
  return calendar.map((entry) => {
    const id = `entry_inv_hydac_2026_09_${entry.dayNumber}`;

    if (entry.isSunday) {
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        tea: 0,
        snacks: 0,
        particulars: "SUNDAY",
        isManualParticulars: false,
        remarks: "",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    if (entry.dayNumber === 16) {
      const row: DailyBillingEntry = {
        ...entry,
        id,
        breakfast: 32,
        dinner: 28,
        lunch: 0,
        tea: 40,
        snacks: 20,
        combinedNotation: "60 Breakfast, Dinner",
        particulars: "BREAKFAST & DINNER",
        isManualParticulars: false,
        remarks: "Mid-month combined audit count",
        billQty: 0,
      };
      row.billQty = calculateRowBillQty(row);
      return row;
    }

    const bf = 27 + (entry.dayNumber % 6);
    const dn = 33 + (entry.dayNumber % 5);
    const row: DailyBillingEntry = {
      ...entry,
      id,
      breakfast: bf,
      dinner: dn,
      lunch: 0,
      tea: 40,
      snacks: 20,
      particulars: "BREAKFAST & DINNER",
      isManualParticulars: false,
      remarks: "",
      billQty: 0,
    };
    row.billQty = calculateRowBillQty(row);
    return row;
  });
}

// Generate immutable daily entries and KPI rollups for the 4 demonstration invoices
const hydacOctEntries = buildHydacOct2026Entries();
const lmwOctEntries = buildLmwOct2026Entries();
const pricolSepEntries = buildPricolSep2026Entries();
const hydacSepEntries = buildHydacSep2026Entries();

export const MOCK_ARCHIVED_INVOICES: ArchivedInvoice[] = [
  {
    id: "inv-2026-10-hydac",
    billNo: "BCS/2026-27/092",
    customer: JSON.parse(JSON.stringify(MOCK_CORPORATE_CUSTOMERS[0])),
    month: "October",
    year: 2026,
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    invoiceDate: "2026-11-02",
    unitLocation: "CHETTIPALAYAM",
    rate: 48.0,
    rateSource: "CUSTOMER_DEFAULT",
    kpis: calculateBillingKpis(hydacOctEntries, 48.0, "CUSTOMER_DEFAULT"),
    entries: hydacOctEntries,
    status: "PENDING",
    notes:
      "October 2026 regular canteen billing statement. Dispatched on Nov 02, 2026; awaiting payment under standard corporate credit cycle.",
    createdAt: "2026-11-02T10:00:00Z",
  },
  {
    id: "inv-2026-10-lmw",
    billNo: "BCS/2026-27/091",
    customer: JSON.parse(JSON.stringify(MOCK_CORPORATE_CUSTOMERS[1])),
    month: "October",
    year: 2026,
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    invoiceDate: "2026-11-01",
    unitLocation: "UNIT II",
    rate: 52.0,
    rateSource: "CUSTOMER_DEFAULT",
    kpis: calculateBillingKpis(lmwOctEntries, 52.0, "CUSTOMER_DEFAULT"),
    entries: lmwOctEntries,
    status: "GENERATED",
    notes:
      "October 2026 full meals lunch roster. Generated and approved internally; pending dispatch to LMW accounts.",
    createdAt: "2026-11-01T15:30:00Z",
  },
  {
    id: "inv-2026-09-pricol",
    billNo: "BCS/2026-27/082",
    customer: JSON.parse(JSON.stringify(MOCK_CORPORATE_CUSTOMERS[2])),
    month: "September",
    year: 2026,
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    invoiceDate: "2026-10-03",
    unitLocation: "PLANT 1",
    rate: 48.0,
    rateSource: "CUSTOMER_DEFAULT",
    kpis: calculateBillingKpis(pricolSepEntries, 48.0, "CUSTOMER_DEFAULT"),
    entries: pricolSepEntries,
    status: "PAID",
    paymentDate: "2026-10-24",
    paymentReference: "DEMO-NEFT-PRICOL-20261024-9021",
    notes:
      "September 2026 industrial catering bill. Payment settled in full via NEFT reference DEMO-NEFT-PRICOL-20261024-9021.",
    createdAt: "2026-10-03T11:00:00Z",
  },
  {
    id: "inv-2026-09-hydac",
    billNo: "BCS/2026-27/081",
    customer: JSON.parse(JSON.stringify(MOCK_CORPORATE_CUSTOMERS[0])),
    month: "September",
    year: 2026,
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    invoiceDate: "2026-10-02",
    unitLocation: "CHETTIPALAYAM",
    rate: 48.0,
    rateSource: "CUSTOMER_DEFAULT",
    kpis: calculateBillingKpis(hydacSepEntries, 48.0, "CUSTOMER_DEFAULT"),
    entries: hydacSepEntries,
    status: "PAID",
    paymentDate: "2026-10-20",
    paymentReference: "DEMO-RTGS-HYDAC-20261020-4412",
    notes:
      "September 2026 canteen bill. Payment received in full via RTGS reference DEMO-RTGS-HYDAC-20261020-4412.",
    createdAt: "2026-10-02T09:15:00Z",
  },
];

