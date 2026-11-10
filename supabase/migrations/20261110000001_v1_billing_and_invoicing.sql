-- ============================================================================
-- Bhavatarini Catering Service — Billing & Invoicing Module (V1)
-- Migration: 20261110000001_v1_billing_and_invoicing.sql
-- Description: Core schema, relational tables, constraints, transactional invoice
--              number sequence generator, immutability triggers, payment tracking,
--              and Row Level Security policies for V1 Billing & Invoicing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TRANSACTIONAL INVOICE NUMBER SEQUENCE GENERATOR
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invoice_sequences (
  fiscal_year varchar(16) PRIMARY KEY,
  last_number integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_sequence_positive CHECK (last_number >= 0)
);

-- Ensure strict isolation: revoke direct client access to sequence table
REVOKE ALL ON public.invoice_sequences FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.invoice_sequences TO postgres, service_role;

/**
 * Calculates Indian Financial Year string (e.g., '2026-27') from a date.
 * Fiscal year begins April 1 and ends March 31.
 */
CREATE OR REPLACE FUNCTION public.get_fiscal_year(p_date date DEFAULT CURRENT_DATE)
RETURNS varchar AS $$
DECLARE
  v_year int;
  v_month int;
  v_start_year int;
  v_end_year int;
BEGIN
  v_year := EXTRACT(YEAR FROM p_date);
  v_month := EXTRACT(MONTH FROM p_date);
  
  IF v_month >= 4 THEN
    v_start_year := v_year;
    v_end_year := v_year + 1;
  ELSE
    v_start_year := v_year - 1;
    v_end_year := v_year;
  END IF;
  
  RETURN v_start_year::text || '-' || LPAD((v_end_year % 100)::text, 2, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE
SET search_path = pg_catalog, pg_temp;

/**
 * Transaction-safe invoice number generator using row-level locking on sequence table.
 * Generates unique sequence format: BCS/YYYY-YY/001
 * Resets automatically each April 1st for the new financial year.
 */
CREATE OR REPLACE FUNCTION public.generate_next_invoice_number(p_invoice_date date DEFAULT CURRENT_DATE)
RETURNS varchar AS $$
DECLARE
  v_fy varchar;
  v_next_val int;
BEGIN
  v_fy := public.get_fiscal_year(p_invoice_date);
  
  -- Atomic increment with row-level lock on the fiscal year record
  INSERT INTO public.invoice_sequences (fiscal_year, last_number, updated_at)
  VALUES (v_fy, 1, pg_catalog.now())
  ON CONFLICT (fiscal_year)
  DO UPDATE SET
    last_number = public.invoice_sequences.last_number + 1,
    updated_at = pg_catalog.now()
  RETURNING last_number INTO v_next_val;
  
  RETURN 'BCS/' || v_fy || '/' || LPAD(v_next_val::text, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.generate_next_invoice_number(date) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.generate_next_invoice_number(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_next_invoice_number(date) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 2. INVOICES MASTER TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number varchar(64) NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  billing_month smallint NOT NULL CHECK (billing_month BETWEEN 1 AND 12),
  billing_year integer NOT NULL CHECK (billing_year BETWEEN 2020 AND 2100),
  period_start_date date NOT NULL,
  period_end_date date NOT NULL,
  invoice_date date NOT NULL,
  unit_location varchar(256) NOT NULL,
  rate numeric(10,2) NOT NULL CHECK (rate >= 0),
  rate_source varchar(32) NOT NULL DEFAULT 'CUSTOMER_DEFAULT' CHECK (rate_source IN ('CUSTOMER_DEFAULT', 'DEMO_SAMPLE', 'CUSTOM')),
  active_preset varchar(64) NOT NULL DEFAULT 'BREAKFAST & DINNER',
  total_days integer NOT NULL CHECK (total_days >= 0),
  total_sundays integer NOT NULL DEFAULT 0 CHECK (total_sundays >= 0),
  total_bill_qty integer NOT NULL CHECK (total_bill_qty >= 0),
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  amount_in_words text NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'CANCELLED')),
  payment_status varchar(32) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID')),
  total_paid numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (total_paid >= 0),
  outstanding_balance numeric(12,2) NOT NULL DEFAULT 0.00 CHECK (outstanding_balance >= 0),
  customer_snapshot jsonb NULL,
  supplier_snapshot jsonb NULL,
  declaration text NULL,
  notes text NULL,
  created_by uuid NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  updated_by uuid NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  finalized_by uuid NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  finalized_at timestamptz NULL,
  cancelled_by uuid NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  cancelled_at timestamptz NULL,
  cancellation_reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_period_dates CHECK (period_end_date >= period_start_date),
  CONSTRAINT chk_issued_invoice_number CHECK (status = 'DRAFT' OR invoice_number IS NOT NULL),
  CONSTRAINT chk_issued_snapshots CHECK (status = 'DRAFT' OR (customer_snapshot IS NOT NULL AND supplier_snapshot IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices (payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices (invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON public.invoices (billing_year DESC, billing_month DESC);

-- ----------------------------------------------------------------------------
-- 3. INVOICE DAILY ENTRIES (DETAIL LINE ITEMS)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invoice_daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  day_number smallint NOT NULL CHECK (day_number BETWEEN 1 AND 31),
  day_name varchar(16) NOT NULL,
  is_sunday boolean NOT NULL DEFAULT false,
  breakfast integer NOT NULL DEFAULT 0 CHECK (breakfast >= 0),
  lunch integer NOT NULL DEFAULT 0 CHECK (lunch >= 0),
  dinner integer NOT NULL DEFAULT 0 CHECK (dinner >= 0),
  snacks integer NOT NULL DEFAULT 0 CHECK (snacks >= 0),
  tea integer NOT NULL DEFAULT 0 CHECK (tea >= 0),
  particulars varchar(64) NOT NULL DEFAULT 'BREAKFAST & DINNER',
  is_manual_particulars boolean NOT NULL DEFAULT false,
  combined_notation varchar(128) NULL,
  remarks text NULL,
  bill_qty integer NOT NULL DEFAULT 0 CHECK (bill_qty >= 0),
  daily_amount numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (daily_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_invoice_daily_entry UNIQUE (invoice_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_invoice_daily_entries_invoice ON public.invoice_daily_entries (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_daily_entries_date ON public.invoice_daily_entries (entry_date ASC);

-- ----------------------------------------------------------------------------
-- 4. INVOICE PAYMENTS (MULTI-PAYMENT & PARTIAL-PAYMENT TRACKING)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_reference varchar(128) NULL,
  notes text NULL,
  created_by uuid NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_date ON public.invoice_payments (payment_date DESC);

-- ----------------------------------------------------------------------------
-- 5. PAYMENT RECALCULATION TRIGGER
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.recalculate_invoice_payments()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id uuid;
  v_total_amount numeric(12,2);
  v_total_paid numeric(12,2);
  v_balance numeric(12,2);
  v_status varchar;
  v_inv_status varchar;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Lock parent invoice row for update to prevent concurrent race conditions
  SELECT total_amount, status INTO v_total_amount, v_inv_status
  FROM public.invoices
  WHERE id = v_invoice_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent invoice % not found for payment recalculation.', v_invoice_id;
  END IF;
  
  IF v_inv_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Payments cannot be recorded, updated, or removed for cancelled invoices.';
  END IF;
  
  -- Calculate total payments
  SELECT COALESCE(SUM(amount), 0.00)
  INTO v_total_paid
  FROM public.invoice_payments
  WHERE invoice_id = v_invoice_id;
  
  -- Enforce no-overpayment safeguard
  IF v_total_paid > v_total_amount THEN
    RAISE EXCEPTION 'Total payments (₹%) cannot exceed total invoice amount (₹%).', v_total_paid, v_total_amount;
  END IF;
  
  v_balance := v_total_amount - v_total_paid;
  
  IF v_total_paid = 0 THEN
    v_status := 'UNPAID';
  ELSIF v_total_paid < v_total_amount THEN
    v_status := 'PARTIALLY_PAID';
  ELSE
    v_status := 'PAID';
  END IF;
  
  UPDATE public.invoices
  SET
    total_paid = v_total_paid,
    outstanding_balance = v_balance,
    payment_status = v_status,
    updated_at = pg_catalog.now()
  WHERE id = v_invoice_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.recalculate_invoice_payments() OWNER TO postgres;

DROP TRIGGER IF EXISTS trg_recalculate_invoice_payments ON public.invoice_payments;
CREATE TRIGGER trg_recalculate_invoice_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_invoice_payments();

-- ----------------------------------------------------------------------------
-- 6. IMMUTABILITY TRIGGER (ISSUED & CANCELLED INVOICES)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. DELETE restriction: ISSUED and CANCELLED invoices can never be deleted
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('ISSUED', 'CANCELLED') THEN
      RAISE EXCEPTION 'Issued or cancelled invoices (Invoice %) cannot be deleted from the system.', OLD.invoice_number;
    END IF;
    RETURN OLD;
  END IF;

  -- 2. UPDATE restriction
  IF TG_OP = 'UPDATE' THEN
    -- If already cancelled, no status transitions allowed
    IF OLD.status = 'CANCELLED' AND NEW.status <> 'CANCELLED' THEN
      RAISE EXCEPTION 'Cancelled invoices cannot be reopened or transitioned to any other status.';
    END IF;
    
    -- If already issued, cannot revert to DRAFT
    IF OLD.status = 'ISSUED' AND NEW.status = 'DRAFT' THEN
      RAISE EXCEPTION 'Issued invoices cannot be reverted to draft status.';
    END IF;

    -- If invoice was already ISSUED or CANCELLED, core financial and snapshot fields are strictly immutable
    IF OLD.status IN ('ISSUED', 'CANCELLED') THEN
      IF NEW.customer_id IS DISTINCT FROM OLD.customer_id
         OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
         OR NEW.billing_month IS DISTINCT FROM OLD.billing_month
         OR NEW.billing_year IS DISTINCT FROM OLD.billing_year
         OR NEW.period_start_date IS DISTINCT FROM OLD.period_start_date
         OR NEW.period_end_date IS DISTINCT FROM OLD.period_end_date
         OR NEW.invoice_date IS DISTINCT FROM OLD.invoice_date
         OR NEW.rate IS DISTINCT FROM OLD.rate
         OR NEW.total_bill_qty IS DISTINCT FROM OLD.total_bill_qty
         OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
         OR NEW.customer_snapshot IS DISTINCT FROM OLD.customer_snapshot
         OR NEW.supplier_snapshot IS DISTINCT FROM OLD.supplier_snapshot
         OR NEW.created_by IS DISTINCT FROM OLD.created_by
         OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Core financial details and historical snapshots of an issued invoice are strictly immutable.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.enforce_invoice_immutability() OWNER TO postgres;

DROP TRIGGER IF EXISTS trg_enforce_invoice_immutability ON public.invoices;
CREATE TRIGGER trg_enforce_invoice_immutability
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_invoice_immutability();

-- Enforce immutability on daily line items of issued invoices
CREATE OR REPLACE FUNCTION public.enforce_invoice_daily_entries_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_status varchar;
BEGIN
  SELECT status INTO v_parent_status
  FROM public.invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  IF v_parent_status IN ('ISSUED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Daily entries belonging to an issued or cancelled invoice cannot be created, updated, or removed.';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.enforce_invoice_daily_entries_immutability() OWNER TO postgres;

DROP TRIGGER IF EXISTS trg_enforce_daily_entries_immutability ON public.invoice_daily_entries;
CREATE TRIGGER trg_enforce_daily_entries_immutability
  BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_invoice_daily_entries_immutability();

-- ----------------------------------------------------------------------------
-- 7. ATOMIC STORED PROCEDURE: SAVE BILLING DRAFT
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.save_invoice_draft(
  p_draft_id uuid,
  p_customer_id uuid,
  p_billing_month smallint,
  p_billing_year integer,
  p_period_start_date date,
  p_period_end_date date,
  p_invoice_date date,
  p_unit_location varchar,
  p_rate numeric,
  p_rate_source varchar,
  p_active_preset varchar,
  p_total_days integer,
  p_total_sundays integer,
  p_total_bill_qty integer,
  p_total_amount numeric,
  p_amount_in_words text,
  p_notes text,
  p_entries jsonb
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_user_role varchar;
  v_invoice_id uuid;
  v_existing_status varchar;
  v_elem jsonb;
BEGIN
  v_user_id := auth.uid();
  v_user_role := public.get_current_admin_role();
  
  IF v_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can save billing drafts.';
  END IF;

  IF p_rate < 0 THEN
    RAISE EXCEPTION 'Unit meal rate cannot be negative.';
  END IF;

  IF p_draft_id IS NOT NULL THEN
    -- Check existing status
    SELECT status INTO v_existing_status FROM public.invoices WHERE id = p_draft_id;
    IF FOUND AND v_existing_status <> 'DRAFT' THEN
      RAISE EXCEPTION 'Cannot overwrite finalized invoice % as a draft.', p_draft_id;
    END IF;
  END IF;

  -- Upsert Draft Invoice Header
  IF p_draft_id IS NOT NULL AND v_existing_status = 'DRAFT' THEN
    UPDATE public.invoices
    SET
      customer_id = p_customer_id,
      billing_month = p_billing_month,
      billing_year = p_billing_year,
      period_start_date = p_period_start_date,
      period_end_date = p_period_end_date,
      invoice_date = p_invoice_date,
      unit_location = p_unit_location,
      rate = p_rate,
      rate_source = p_rate_source,
      active_preset = p_active_preset,
      total_days = p_total_days,
      total_sundays = p_total_sundays,
      total_bill_qty = p_total_bill_qty,
      total_amount = p_total_amount,
      amount_in_words = p_amount_in_words,
      outstanding_balance = p_total_amount - total_paid,
      notes = p_notes,
      updated_by = v_user_id,
      updated_at = pg_catalog.now()
    WHERE id = p_draft_id
    RETURNING id INTO v_invoice_id;
    
    -- Delete prior daily entries to replace atomically
    DELETE FROM public.invoice_daily_entries WHERE invoice_id = v_invoice_id;
  ELSE
    INSERT INTO public.invoices (
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
      notes,
      created_by,
      updated_by
    ) VALUES (
      COALESCE(p_draft_id, gen_random_uuid()),
      NULL, -- Drafts have no invoice number
      p_customer_id,
      p_billing_month,
      p_billing_year,
      p_period_start_date,
      p_period_end_date,
      p_invoice_date,
      p_unit_location,
      p_rate,
      p_rate_source,
      p_active_preset,
      p_total_days,
      p_total_sundays,
      p_total_bill_qty,
      p_total_amount,
      p_amount_in_words,
      'DRAFT',
      'UNPAID',
      0.00,
      p_total_amount,
      p_notes,
      v_user_id,
      v_user_id
    )
    RETURNING id INTO v_invoice_id;
  END IF;

  -- Insert daily entries
  IF p_entries IS NOT NULL AND jsonb_array_length(p_entries) > 0 THEN
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_entries)
    LOOP
      INSERT INTO public.invoice_daily_entries (
        invoice_id,
        entry_date,
        day_number,
        day_name,
        is_sunday,
        breakfast,
        lunch,
        dinner,
        snacks,
        tea,
        particulars,
        is_manual_particulars,
        combined_notation,
        remarks,
        bill_qty,
        daily_amount
      ) VALUES (
        v_invoice_id,
        (v_elem->>'entry_date')::date,
        (v_elem->>'day_number')::smallint,
        (v_elem->>'day_name')::varchar,
        COALESCE((v_elem->>'is_sunday')::boolean, false),
        COALESCE((v_elem->>'breakfast')::integer, 0),
        COALESCE((v_elem->>'lunch')::integer, 0),
        COALESCE((v_elem->>'dinner')::integer, 0),
        COALESCE((v_elem->>'snacks')::integer, 0),
        COALESCE((v_elem->>'tea')::integer, 0),
        COALESCE((v_elem->>'particulars')::varchar, 'BREAKFAST & DINNER'),
        COALESCE((v_elem->>'is_manual_particulars')::boolean, false),
        v_elem->>'combined_notation',
        v_elem->>'remarks',
        COALESCE((v_elem->>'bill_qty')::integer, 0),
        COALESCE((v_elem->>'daily_amount')::numeric, 0.00)
      );
    END LOOP;
  END IF;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.save_invoice_draft OWNER TO postgres;
REVOKE ALL ON FUNCTION public.save_invoice_draft FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_invoice_draft TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 8. ATOMIC STORED PROCEDURE: ISSUE INVOICE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.issue_invoice(p_invoice_id uuid)
RETURNS public.invoices AS $$
DECLARE
  v_user_id uuid;
  v_user_role varchar;
  v_inv public.invoices%ROWTYPE;
  v_cust public.customers%ROWTYPE;
  v_addr public.customer_addresses%ROWTYPE;
  v_contact public.customer_contacts%ROWTYPE;
  v_settings public.business_settings%ROWTYPE;
  v_customer_snapshot jsonb;
  v_supplier_snapshot jsonb;
  v_invoice_number varchar;
  v_recomputed_qty integer;
  v_recomputed_amount numeric(12,2);
  v_total_days integer;
  v_total_sundays integer;
  v_result public.invoices%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  v_user_role := public.get_current_admin_role();
  
  IF v_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can issue finalized invoices.';
  END IF;

  -- Lock invoice row
  SELECT * INTO v_inv
  FROM public.invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found.', p_invoice_id;
  END IF;

  IF v_inv.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'Only DRAFT invoices can be issued. Invoice % is currently in status %.', p_invoice_id, v_inv.status;
  END IF;

  -- 1. Fetch customer details
  SELECT * INTO v_cust FROM public.customers WHERE id = v_inv.customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated customer % not found.', v_inv.customer_id;
  END IF;

  -- Fetch primary billing address
  SELECT * INTO v_addr
  FROM public.customer_addresses
  WHERE customer_id = v_inv.customer_id AND address_type = 'billing'
  ORDER BY is_default DESC, created_at ASC
  LIMIT 1;

  -- Fetch primary contact
  SELECT * INTO v_contact
  FROM public.customer_contacts
  WHERE customer_id = v_inv.customer_id
  ORDER BY is_primary DESC, created_at ASC
  LIMIT 1;

  -- Build immutable customer snapshot
  v_customer_snapshot := jsonb_build_object(
    'customer_id', v_cust.id,
    'customer_code', v_cust.customer_code,
    'name', v_cust.company_name,
    'gstin', v_cust.gstin,
    'pan', v_cust.pan,
    'billing_address', CASE 
      WHEN v_addr.address_line IS NOT NULL THEN v_addr.address_line || ', ' || v_addr.city || ' - ' || COALESCE(v_addr.pincode, '')
      ELSE ''
    END,
    'delivery_location', v_inv.unit_location,
    'contact_name', v_contact.contact_name,
    'contact_phone', v_contact.phone,
    'contact_email', v_contact.email
  );

  -- 2. Fetch business settings
  SELECT * INTO v_settings FROM public.business_settings LIMIT 1;

  -- Build immutable supplier snapshot
  v_supplier_snapshot := jsonb_build_object(
    'legal_name', COALESCE(v_settings.legal_name, 'A.S. Bhavatarini Catering Service'),
    'brand_name', COALESCE(v_settings.brand_name, 'Bhavatarini Catering Service'),
    'primary_phone', COALESCE(v_settings.primary_phone, '88389 13486, 93603 40603'),
    'official_email', COALESCE(v_settings.official_email, 'asbcateringservice@gmail.com'),
    'pan', COALESCE(v_settings.pan, 'BGZPS2638L'),
    'address', '16/17, Ayyavu Chettiar Street, Chettipalyam, Coimbatore - 641201',
    'bank_details', v_settings.bank_details
  );

  -- 3. Authoritatively recalculate billable quantities from stored daily entries
  SELECT
    COALESCE(SUM(bill_qty), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE is_sunday)
  INTO
    v_recomputed_qty,
    v_total_days,
    v_total_sundays
  FROM public.invoice_daily_entries
  WHERE invoice_id = p_invoice_id;

  IF v_total_days = 0 THEN
    RAISE EXCEPTION 'Cannot issue invoice with 0 daily billing entries.';
  END IF;

  v_recomputed_amount := v_recomputed_qty * v_inv.rate;

  -- 4. Assign atomic sequential invoice number
  v_invoice_number := public.generate_next_invoice_number(v_inv.invoice_date);

  -- 5. Finalize invoice record
  UPDATE public.invoices
  SET
    invoice_number = v_invoice_number,
    status = 'ISSUED',
    customer_snapshot = v_customer_snapshot,
    supplier_snapshot = v_supplier_snapshot,
    total_days = v_total_days,
    total_sundays = v_total_sundays,
    total_bill_qty = v_recomputed_qty,
    total_amount = v_recomputed_amount,
    outstanding_balance = v_recomputed_amount - total_paid,
    finalized_by = v_user_id,
    finalized_at = pg_catalog.now(),
    updated_at = pg_catalog.now()
  WHERE id = p_invoice_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.issue_invoice OWNER TO postgres;
REVOKE ALL ON FUNCTION public.issue_invoice FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_invoice TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 9. ATOMIC STORED PROCEDURE: RECORD INVOICE PAYMENT
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_invoice_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_payment_reference text,
  p_notes text
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_user_role varchar;
  v_payment_id uuid;
  v_inv_status varchar;
BEGIN
  v_user_id := auth.uid();
  v_user_role := public.get_current_admin_role();
  
  IF v_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can record payments.';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero.';
  END IF;

  SELECT status INTO v_inv_status FROM public.invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found.', p_invoice_id;
  END IF;

  IF v_inv_status = 'DRAFT' THEN
    RAISE EXCEPTION 'Payments cannot be recorded against draft invoices. Issue the invoice first.';
  END IF;

  IF v_inv_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Payments cannot be recorded against cancelled invoices.';
  END IF;

  INSERT INTO public.invoice_payments (
    invoice_id,
    amount,
    payment_date,
    payment_reference,
    notes,
    created_by
  ) VALUES (
    p_invoice_id,
    p_amount,
    COALESCE(p_payment_date, CURRENT_DATE),
    p_payment_reference,
    p_notes,
    v_user_id
  )
  RETURNING id INTO v_payment_id;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.record_invoice_payment OWNER TO postgres;
REVOKE ALL ON FUNCTION public.record_invoice_payment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_invoice_payment TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 10. ATOMIC STORED PROCEDURE: CANCEL INVOICE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cancel_invoice(
  p_invoice_id uuid,
  p_reason text
)
RETURNS boolean AS $$
DECLARE
  v_user_id uuid;
  v_user_role varchar;
  v_inv_status varchar;
BEGIN
  v_user_id := auth.uid();
  v_user_role := public.get_current_admin_role();
  
  IF v_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can cancel invoices.';
  END IF;

  SELECT status INTO v_inv_status FROM public.invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found.', p_invoice_id;
  END IF;

  IF v_inv_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Invoice % is already cancelled.', p_invoice_id;
  END IF;

  IF v_inv_status = 'DRAFT' THEN
    RAISE EXCEPTION 'Draft invoices should be deleted or edited, not cancelled.';
  END IF;

  UPDATE public.invoices
  SET
    status = 'CANCELLED',
    cancelled_by = v_user_id,
    cancelled_at = pg_catalog.now(),
    cancellation_reason = p_reason,
    updated_at = pg_catalog.now()
  WHERE id = p_invoice_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.cancel_invoice OWNER TO postgres;
REVOKE ALL ON FUNCTION public.cancel_invoice FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_invoice TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- Revoke all public/anon privileges
REVOKE ALL ON public.invoices FROM anon;
REVOKE ALL ON public.invoice_daily_entries FROM anon;
REVOKE ALL ON public.invoice_payments FROM anon;

-- Grant standard DML to authenticated role (governed strictly by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_daily_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_payments TO authenticated;

-- Policies for public.invoices
CREATE POLICY "invoices_select_active_admin"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "invoices_insert_admin_owner"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "invoices_update_admin_owner"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "invoices_delete_owner_only"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner');

-- Policies for public.invoice_daily_entries
CREATE POLICY "daily_entries_select_active_admin"
  ON public.invoice_daily_entries FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "daily_entries_insert_admin_owner"
  ON public.invoice_daily_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "daily_entries_update_admin_owner"
  ON public.invoice_daily_entries FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "daily_entries_delete_admin_owner"
  ON public.invoice_daily_entries FOR DELETE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'));

-- Policies for public.invoice_payments
CREATE POLICY "payments_select_active_admin"
  ON public.invoice_payments FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "payments_insert_admin_owner"
  ON public.invoice_payments FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "payments_update_owner_only"
  ON public.invoice_payments FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner')
  WITH CHECK (public.get_current_admin_role() = 'owner');

CREATE POLICY "payments_delete_owner_only"
  ON public.invoice_payments FOR DELETE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner');
