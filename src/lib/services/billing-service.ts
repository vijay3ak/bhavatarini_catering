import { createClient } from "@/lib/supabase/client";
import type { CorporateCustomer, CustomerRecord } from "@/types/admin";
import type {
  DailyBillingEntry,
  BillingKpiSummary,
  BillingRateSource,
  ArchivedInvoice,
  InvoicePaymentRecord,
} from "@/types/billing";
import { MOCK_CORPORATE_CUSTOMERS } from "@/lib/data/mock-admin-data";
import { MONTH_NAMES, calculateRowAmount } from "@/lib/utils/billing-calculations";

/**
 * Maps a Supabase relational CustomerRecord to the frontend CorporateCustomer interface.
 */
export function mapCustomerRecordToCorporateCustomer(record: CustomerRecord): CorporateCustomer {
  const billingAddr = record.customer_addresses?.find(
    (a) => a.address_type === "billing" && a.is_default
  ) || record.customer_addresses?.find((a) => a.address_type === "billing") || record.customer_addresses?.[0];

  const deliveryAddr = record.customer_addresses?.find(
    (a) => a.address_type === "delivery" && a.is_default
  ) || record.customer_addresses?.find((a) => a.address_type === "delivery");

  const primaryContact = record.customer_contacts?.find((c) => c.is_primary) || record.customer_contacts?.[0];

  const formattedBilling = billingAddr
    ? `${billingAddr.address_line}, ${billingAddr.city}${billingAddr.pincode ? ` - ${billingAddr.pincode}` : ""}`
    : "";

  const formattedDelivery = deliveryAddr
    ? `${deliveryAddr.address_line}, ${deliveryAddr.city}`
    : billingAddr?.city || "COIMBATORE";

  return {
    id: record.id,
    name: record.company_name,
    shortCode: record.customer_code,
    billingAddress: formattedBilling,
    deliveryLocation: formattedDelivery,
    gstin: record.gstin || "",
    pan: record.pan || "",
    contactPerson: primaryContact?.contact_name || "",
    contactPhone: primaryContact?.phone || "",
    contactEmail: primaryContact?.email || "",
    contractStatus: record.contract_status,
    defaultPreset: (record.default_preset as "BREAKFAST & DINNER" | "LUNCH" | "CUSTOM") || "BREAKFAST & DINNER",
    defaultRate: record.default_rate != null ? Number(record.default_rate) : 48.0,
    notes: record.notes || undefined,
    activeContractsCount: 1,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * Fetch all active corporate customers from Supabase.
 * Falls back gracefully to sample mock records if no database customers exist yet.
 */
export async function getActiveCustomers(): Promise<CorporateCustomer[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.from("customers") as any)
      .select(`
        id,
        customer_code,
        company_name,
        gstin,
        pan,
        contract_status,
        default_rate,
        default_preset,
        notes,
        created_at,
        updated_at,
        customer_addresses (
          id,
          address_type,
          address_line,
          city,
          pincode,
          is_default
        ),
        customer_contacts (
          id,
          contact_name,
          phone,
          email,
          designation,
          is_primary
        )
      `)
      .order("company_name", { ascending: true });

    if (error) {
      console.warn("Could not query customers from Supabase, using mock fallback:", error);
      return MOCK_CORPORATE_CUSTOMERS;
    }

    if (!data || data.length === 0) {
      return MOCK_CORPORATE_CUSTOMERS;
    }

    return (data as CustomerRecord[]).map(mapCustomerRecordToCorporateCustomer);
  } catch (err) {
    console.warn("Error in getActiveCustomers, falling back to mock:", err);
    return MOCK_CORPORATE_CUSTOMERS;
  }
}

export interface SaveDraftPayload {
  draftId?: string | null;
  customerId: string;
  month: number; // 0-indexed (0 = Jan, 10 = Nov)
  year: number;
  startDate: string;
  endDate: string;
  invoiceDate: string;
  unitLocation: string;
  rate: number;
  rateSource: BillingRateSource;
  activePreset: string;
  dailyEntries: DailyBillingEntry[];
  kpis: BillingKpiSummary;
  notes?: string;
}

/**
 * Persists an invoice draft and daily line items atomically to Supabase.
 */
export async function saveDraftInvoice(payload: SaveDraftPayload): Promise<{
  success: boolean;
  invoiceId?: string;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const formattedEntries = payload.dailyEntries.map((e) => ({
      entry_date: e.dateString,
      day_number: e.dayNumber,
      day_name: e.dayName,
      is_sunday: Boolean(e.isSunday),
      breakfast: Number(e.breakfast) || 0,
      lunch: Number(e.lunch) || 0,
      dinner: Number(e.dinner) || 0,
      snacks: Number(e.snacks) || 0,
      tea: Number(e.tea) || 0,
      particulars: e.particulars || payload.activePreset,
      is_manual_particulars: Boolean(e.isManualParticulars),
      combined_notation: e.combinedNotation || null,
      remarks: e.remarks || null,
      bill_qty: Number(e.billQty) || 0,
      daily_amount: calculateRowAmount(e, payload.rate),
      is_multi_meal: Boolean(e.isMultiMeal),
      meal_breakdown: e.mealBreakdown || null,
    }));

    const { data, error } = await supabase.rpc("save_invoice_draft", {
      p_draft_id: payload.draftId || null,
      p_customer_id: payload.customerId,
      p_billing_month: payload.month + 1, // Store 1-indexed (1-12)
      p_billing_year: payload.year,
      p_period_start_date: payload.startDate,
      p_period_end_date: payload.endDate,
      p_invoice_date: payload.invoiceDate,
      p_unit_location: payload.unitLocation,
      p_rate: payload.rate,
      p_rate_source: payload.rateSource,
      p_active_preset: payload.activePreset,
      p_total_days: payload.dailyEntries.length,
      p_total_sundays: payload.dailyEntries.filter((e) => e.isSunday).length,
      p_total_bill_qty: payload.kpis.totalBillQty,
      p_total_amount: payload.kpis.totalAmount,
      p_amount_in_words: payload.kpis.amountInWords,
      p_notes: payload.notes || null,
      p_entries: formattedEntries as any,
    });

    if (error) {
      console.error("Failed to save draft invoice:", error);
      return { success: false, error: error.message };
    }

    return { success: true, invoiceId: data as string };
  } catch (err: any) {
    console.error("Exception saving draft invoice:", err);
    return { success: false, error: err.message || "Failed to save draft invoice." };
  }
}

/**
 * Atomically issues a draft invoice, assigning next sequential invoice number (e.g. BCS/2026-27/001),
 * taking permanent customer & supplier snapshots, and locking it against further alteration.
 */
export async function issueInvoice(invoiceId: string): Promise<{
  success: boolean;
  invoice?: any;
  invoiceNumber?: string;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("issue_invoice", {
      p_invoice_id: invoiceId,
    });

    if (error) {
      console.error("Failed to issue invoice:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      invoice: data,
      invoiceNumber: (data as any)?.invoice_number,
    };
  } catch (err: any) {
    console.error("Exception issuing invoice:", err);
    return { success: false, error: err.message || "Failed to issue invoice." };
  }
}

/**
 * Fetch invoices list with customer relations and payment stats from Supabase.
 */
export async function getInvoices(filters?: {
  status?: string;
  customerId?: string;
  period?: string;
  search?: string;
}): Promise<ArchivedInvoice[]> {
  try {
    const supabase = createClient();

    let query = (supabase.from("invoices") as any)
      .select(`
        id,
        invoice_number,
        customer_id,
        billing_month,
        billing_year,
        period_start_date,
        period_end_date,
        invoice_date,
        unit_location,
        rate,
        rate_source,
        active_preset,
        total_days,
        total_sundays,
        total_bill_qty,
        total_amount,
        amount_in_words,
        status,
        payment_status,
        total_paid,
        outstanding_balance,
        customer_snapshot,
        supplier_snapshot,
        notes,
        cancellation_reason,
        created_at,
        updated_at,
        customers (
          id,
          customer_code,
          company_name,
          gstin,
          pan
        ),
        invoice_payments (
          id,
          amount,
          payment_date,
          payment_reference,
          notes,
          created_at
        )
      `)
      .order("invoice_date", { ascending: false });

    if (filters?.status && filters.status !== "ALL") {
      if (filters.status === "PAID") {
        query = query.eq("payment_status", "PAID");
      } else if (filters.status === "PENDING") {
        query = query.eq("status", "ISSUED").in("payment_status", ["UNPAID", "PARTIALLY_PAID"]);
      } else if (filters.status === "GENERATED") {
        query = query.eq("status", "ISSUED");
      } else if (filters.status === "CANCELLED") {
        query = query.eq("status", "CANCELLED");
      } else if (filters.status === "DRAFT") {
        query = query.eq("status", "DRAFT");
      }
    }

    if (filters?.customerId && filters.customerId !== "ALL") {
      query = query.eq("customer_id", filters.customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Failed to query invoices from Supabase:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as any[]).map((row) => {
      // Reconstruct customer details from snapshot or joined customer record
      const snap = row.customer_snapshot;
      const joinedCust = row.customers;

      const customer: CorporateCustomer = {
        id: snap?.customer_id || joinedCust?.id || row.customer_id,
        name: snap?.name || joinedCust?.company_name || "Unknown Customer",
        shortCode: snap?.customer_code || joinedCust?.customer_code || "BCS",
        billingAddress: snap?.billing_address || "",
        deliveryLocation: snap?.delivery_location || row.unit_location,
        gstin: snap?.gstin || joinedCust?.gstin || "",
        pan: snap?.pan || joinedCust?.pan || "",
        contactPerson: snap?.contact_name || "",
        contactPhone: snap?.contact_phone || "",
        contactEmail: snap?.contact_email || "",
        contractStatus: "Active Daily Contract",
        defaultPreset: (row.active_preset as any) || "BREAKFAST & DINNER",
        defaultRate: Number(row.rate),
        activeContractsCount: 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const monthName = MONTH_NAMES[row.billing_month - 1] || `Month ${row.billing_month}`;

      // Derive frontend display status
      let displayStatus: "PAID" | "PENDING" | "GENERATED" | "CANCELLED" | "DRAFT" = "PENDING";
      if (row.status === "CANCELLED") {
        displayStatus = "CANCELLED";
      } else if (row.status === "DRAFT") {
        displayStatus = "DRAFT";
      } else if (row.status === "ISSUED") {
        if (row.payment_status === "PAID") {
          displayStatus = "PAID";
        } else {
          displayStatus = "PENDING";
        }
      }

      const payments: InvoicePaymentRecord[] = (row.invoice_payments || []).map((p: any) => ({
        id: p.id,
        invoiceId: row.id,
        amount: Number(p.amount),
        paymentDate: p.payment_date,
        paymentReference: p.payment_reference || undefined,
        notes: p.notes || undefined,
        createdAt: p.created_at,
      }));

      const latestPayment = payments[0];

      return {
        id: row.id,
        billNo: row.invoice_number || "DRAFT",
        customer,
        month: monthName,
        year: row.billing_year,
        startDate: row.period_start_date,
        endDate: row.period_end_date,
        invoiceDate: row.invoice_date,
        unitLocation: row.unit_location,
        rate: Number(row.rate),
        rateSource: row.rate_source as BillingRateSource,
        kpis: {
          totalDays: row.total_days,
          totalSundays: row.total_sundays,
          totalBillQty: row.total_bill_qty,
          rate: Number(row.rate),
          totalAmount: Number(row.total_amount),
          amountInWords: row.amount_in_words,
        },
        entries: [], // Daily entries fetched on-demand in getInvoiceDetails
        status: displayStatus,
        rawStatus: row.status,
        paymentStatus: row.payment_status,
        totalPaid: Number(row.total_paid || 0),
        outstandingBalance: Number(row.outstanding_balance || row.total_amount),
        paymentDate: latestPayment?.paymentDate,
        paymentReference: latestPayment?.paymentReference,
        payments,
        cancellationReason: row.cancellation_reason || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at,
      };
    });
  } catch (err) {
    console.error("Exception in getInvoices:", err);
    return [];
  }
}

/**
 * Fetch complete invoice details, including full daily entries and payment records.
 */
export async function getInvoiceDetails(invoiceId: string): Promise<ArchivedInvoice | null> {
  try {
    const supabase = createClient();

    // 1. Fetch header
    const { data: inv, error: invErr } = await (supabase.from("invoices") as any)
      .select(`
        id,
        invoice_number,
        customer_id,
        billing_month,
        billing_year,
        period_start_date,
        period_end_date,
        invoice_date,
        unit_location,
        rate,
        rate_source,
        active_preset,
        total_days,
        total_sundays,
        total_bill_qty,
        total_amount,
        amount_in_words,
        status,
        payment_status,
        total_paid,
        outstanding_balance,
        customer_snapshot,
        supplier_snapshot,
        notes,
        cancellation_reason,
        created_at,
        updated_at,
        customers (
          id,
          customer_code,
          company_name,
          gstin,
          pan
        )
      `)
      .eq("id", invoiceId)
      .single();

    if (invErr || !inv) {
      console.error("Could not fetch invoice header:", invErr);
      return null;
    }

    // 2. Fetch daily line items
    const { data: entriesData, error: entriesErr } = await (supabase.from("invoice_daily_entries") as any)
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("entry_date", { ascending: true });

    if (entriesErr) {
      console.warn("Could not fetch daily entries for invoice:", entriesErr);
    }

    // 3. Fetch payments
    const { data: paymentsData, error: payErr } = await (supabase.from("invoice_payments") as any)
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: false });

    if (payErr) {
      console.warn("Could not fetch invoice payments:", payErr);
    }

    const snap = inv.customer_snapshot;
    const joinedCust = inv.customers;

    const customer: CorporateCustomer = {
      id: snap?.customer_id || joinedCust?.id || inv.customer_id,
      name: snap?.name || joinedCust?.company_name || "Unknown Customer",
      shortCode: snap?.customer_code || joinedCust?.customer_code || "BCS",
      billingAddress: snap?.billing_address || "",
      deliveryLocation: snap?.delivery_location || inv.unit_location,
      gstin: snap?.gstin || joinedCust?.gstin || "",
      pan: snap?.pan || joinedCust?.pan || "",
      contactPerson: snap?.contact_name || "",
      contactPhone: snap?.contact_phone || "",
      contactEmail: snap?.contact_email || "",
      contractStatus: "Active Daily Contract",
      defaultPreset: (inv.active_preset as any) || "BREAKFAST & DINNER",
      defaultRate: Number(inv.rate),
      activeContractsCount: 1,
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
    };

    const entries: DailyBillingEntry[] = (entriesData || []).map((row: any) => ({
      id: row.id,
      dayNumber: row.day_number,
      dateString: row.entry_date,
      dayName: row.day_name,
      isSunday: Boolean(row.is_sunday),
      breakfast: Number(row.breakfast || 0),
      lunch: Number(row.lunch || 0),
      dinner: Number(row.dinner || 0),
      snacks: Number(row.snacks || 0),
      tea: Number(row.tea || 0),
      particulars: row.particulars,
      isManualParticulars: Boolean(row.is_manual_particulars),
      combinedNotation: row.combined_notation || undefined,
      remarks: row.remarks || "",
      billQty: Number(row.bill_qty || 0),
      isMultiMeal: Boolean(row.is_multi_meal),
      mealBreakdown: row.meal_breakdown || undefined,
    }));

    const payments: InvoicePaymentRecord[] = (paymentsData || []).map((p: any) => ({
      id: p.id,
      invoiceId: inv.id,
      amount: Number(p.amount),
      paymentDate: p.payment_date,
      paymentReference: p.payment_reference || undefined,
      notes: p.notes || undefined,
      createdAt: p.created_at,
    }));

    let displayStatus: "PAID" | "PENDING" | "GENERATED" | "CANCELLED" | "DRAFT" = "PENDING";
    if (inv.status === "CANCELLED") {
      displayStatus = "CANCELLED";
    } else if (inv.status === "DRAFT") {
      displayStatus = "DRAFT";
    } else if (inv.status === "ISSUED") {
      if (inv.payment_status === "PAID") {
        displayStatus = "PAID";
      } else {
        displayStatus = "PENDING";
      }
    }

    const monthName = MONTH_NAMES[inv.billing_month - 1] || `Month ${inv.billing_month}`;

    return {
      id: inv.id,
      billNo: inv.invoice_number || "DRAFT",
      customer,
      month: monthName,
      year: inv.billing_year,
      startDate: inv.period_start_date,
      endDate: inv.period_end_date,
      invoiceDate: inv.invoice_date,
      unitLocation: inv.unit_location,
      rate: Number(inv.rate),
      rateSource: inv.rate_source as BillingRateSource,
      kpis: {
        totalDays: inv.total_days,
        totalSundays: inv.total_sundays,
        totalBillQty: inv.total_bill_qty,
        rate: Number(inv.rate),
        totalAmount: Number(inv.total_amount),
        amountInWords: inv.amount_in_words,
      },
      entries,
      status: displayStatus,
      rawStatus: inv.status,
      paymentStatus: inv.payment_status,
      totalPaid: Number(inv.total_paid || 0),
      outstandingBalance: Number(inv.outstanding_balance || inv.total_amount),
      paymentDate: payments[0]?.paymentDate,
      paymentReference: payments[0]?.paymentReference,
      payments,
      cancellationReason: inv.cancellation_reason || undefined,
      notes: inv.notes || undefined,
      createdAt: inv.created_at,
    };
  } catch (err) {
    console.error("Exception in getInvoiceDetails:", err);
    return null;
  }
}

/**
 * Records an invoice payment transaction atomically.
 */
export async function recordPayment(params: {
  invoiceId: string;
  amount: number;
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
}): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("record_invoice_payment", {
      p_invoice_id: params.invoiceId,
      p_amount: params.amount,
      p_payment_date: params.paymentDate || new Date().toISOString().split("T")[0],
      p_payment_reference: params.paymentReference || null,
      p_notes: params.notes || null,
    });

    if (error) {
      console.error("Failed to record payment:", error);
      return { success: false, error: error.message };
    }

    return { success: true, paymentId: data as string };
  } catch (err: any) {
    console.error("Exception recording payment:", err);
    return { success: false, error: err.message || "Failed to record payment." };
  }
}

/**
 * Cancels an issued invoice atomically while permanently preserving its number and historical audit record.
 */
export async function cancelInvoice(
  invoiceId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.rpc("cancel_invoice", {
      p_invoice_id: invoiceId,
      p_reason: reason,
    });

    if (error) {
      console.error("Failed to cancel invoice:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception cancelling invoice:", err);
    return { success: false, error: err.message || "Failed to cancel invoice." };
  }
}
