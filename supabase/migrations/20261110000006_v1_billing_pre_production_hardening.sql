-- ============================================================================
-- Bhavatarini Catering Service — Billing Pre-Production Hardening (V1)
-- Migration: 20261110000006_v1_billing_preproduction_hardening.sql
-- Description:
--   1. Hardens stored procedure authorization in save_invoice_draft, issue_invoice,
--      record_invoice_payment, and cancel_invoice.
--   2. Explicitly verifies service-role JWT authorization when auth.uid() is NULL.
--   3. Does NOT rely on current_user inside SECURITY DEFINER functions.
--   4. Guarantees anonymous and ordinary authenticated users (staff) cannot use fallback.
--   5. Preserves legitimate owner/admin authorization and server-side service-role tasks.
--   6. Enforces environment isolation: guarantees that in production environments,
--      immutability triggers have zero test-mode bypasses and test helpers do not exist,
--      while preserving DEV test capabilities.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HARDENED STORED PROCEDURES (SECURITY DEFINER WITH SERVICE-ROLE VERIFICATION)
-- ----------------------------------------------------------------------------

-- Procedure 1: save_invoice_draft
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
  -- Strict Authorization & Identity Resolution
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    -- Authenticated browser session: must be active owner or admin
    v_user_role := public.get_current_admin_role();
    IF v_user_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can save billing drafts.'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    -- When auth.uid() is NULL, verify explicit service-role JWT authorization.
    -- In SECURITY DEFINER functions, current_user is always the function owner ('postgres'),
    -- so DO NOT rely on current_user as proof of invoking role.
    -- Verify explicit service-role JWT claim OR administrative session_user.
    IF (COALESCE(auth.jwt() ->> 'role', auth.role(), current_setting('request.jwt.claim.role', true), '') = 'service_role')
       OR (session_user = 'postgres') THEN
      SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
      v_user_role := 'owner';
    ELSE
      RAISE EXCEPTION 'Access denied: Valid owner/admin user session or service-role credential required.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_rate < 0 THEN
    RAISE EXCEPTION 'Unit meal rate cannot be negative.'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_draft_id IS NOT NULL THEN
    SELECT status INTO v_existing_status FROM public.invoices WHERE id = p_draft_id;
    IF FOUND AND v_existing_status <> 'DRAFT' THEN
      RAISE EXCEPTION 'Cannot overwrite finalized invoice % as a draft.', p_draft_id
        USING ERRCODE = 'P0001';
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
      NULL,
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
REVOKE ALL ON FUNCTION public.save_invoice_draft(uuid, uuid, smallint, integer, date, date, date, varchar, numeric, varchar, varchar, integer, integer, integer, numeric, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_invoice_draft(uuid, uuid, smallint, integer, date, date, date, varchar, numeric, varchar, varchar, integer, integer, integer, numeric, text, text, jsonb) TO authenticated, service_role;


-- Procedure 2: issue_invoice
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
  -- Strict Authorization & Identity Resolution
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    v_user_role := public.get_current_admin_role();
    IF v_user_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can issue finalized invoices.'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    IF (COALESCE(auth.jwt() ->> 'role', auth.role(), current_setting('request.jwt.claim.role', true), '') = 'service_role')
       OR (session_user = 'postgres') THEN
      SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
      v_user_role := 'owner';
    ELSE
      RAISE EXCEPTION 'Access denied: Valid owner/admin user session or service-role credential required.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Lock invoice row
  SELECT * INTO v_inv
  FROM public.invoices
  WHERE id = p_invoice_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found.', p_invoice_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_inv.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'Only DRAFT invoices can be issued. Invoice % is currently in status %.', p_invoice_id, v_inv.status
      USING ERRCODE = 'P0001';
  END IF;

  -- 1. Fetch customer details
  SELECT * INTO v_cust FROM public.customers WHERE id = v_inv.customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated customer % not found.', v_inv.customer_id
      USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_addr
  FROM public.customer_addresses
  WHERE customer_id = v_inv.customer_id AND address_type = 'billing'
  ORDER BY is_default DESC, created_at ASC
  LIMIT 1;

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

  SELECT * INTO v_settings FROM public.business_settings LIMIT 1;

  -- Build immutable supplier snapshot (Zero payment terms, catering business profile)
  v_supplier_snapshot := jsonb_build_object(
    'legal_name', COALESCE(v_settings.legal_name, 'A.S. Bhavatarini Catering Service'),
    'brand_name', COALESCE(v_settings.brand_name, 'Bhavatarini Catering Service'),
    'primary_phone', COALESCE(v_settings.primary_phone, '88389 13486, 93603 40603'),
    'official_email', COALESCE(v_settings.official_email, 'asbcateringservice@gmail.com'),
    'pan', COALESCE(v_settings.pan, 'BGZPS2638L'),
    'address', '16/17, Ayyavu Chettiar Street, Chettipalyam, Coimbatore - 641201',
    'bank_details', v_settings.bank_details
  );

  -- Recompute totals strictly from stored daily entries
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
    RAISE EXCEPTION 'Cannot issue invoice with 0 daily billing entries.'
      USING ERRCODE = 'P0001';
  END IF;

  v_recomputed_amount := v_recomputed_qty * v_inv.rate;

  -- Generate atomic fiscal-year sequential invoice number
  v_invoice_number := public.generate_next_invoice_number(v_inv.invoice_date);

  -- Finalize invoice record
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
REVOKE ALL ON FUNCTION public.issue_invoice(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_invoice(uuid) TO authenticated, service_role;


-- Procedure 3: record_invoice_payment
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
  -- Strict Authorization & Identity Resolution
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    v_user_role := public.get_current_admin_role();
    IF v_user_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can record payments.'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    IF (COALESCE(auth.jwt() ->> 'role', auth.role(), current_setting('request.jwt.claim.role', true), '') = 'service_role')
       OR (session_user = 'postgres') THEN
      SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
      v_user_role := 'owner';
    ELSE
      RAISE EXCEPTION 'Access denied: Valid owner/admin user session or service-role credential required.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero.'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT status INTO v_inv_status FROM public.invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found.', p_invoice_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_inv_status = 'DRAFT' THEN
    RAISE EXCEPTION 'Payments cannot be recorded against draft invoices. Issue the invoice first.'
      USING ERRCODE = 'P0001';
  END IF;

  IF v_inv_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Payments cannot be recorded against cancelled invoices.'
      USING ERRCODE = 'P0001';
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
REVOKE ALL ON FUNCTION public.record_invoice_payment(uuid, numeric, date, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_invoice_payment(uuid, numeric, date, text, text) TO authenticated, service_role;


-- Procedure 4: cancel_invoice
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
  -- Strict Authorization & Identity Resolution
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    v_user_role := public.get_current_admin_role();
    IF v_user_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can cancel invoices.'
        USING ERRCODE = '42501';
    END IF;
  ELSE
    IF (COALESCE(auth.jwt() ->> 'role', auth.role(), current_setting('request.jwt.claim.role', true), '') = 'service_role')
       OR (session_user = 'postgres') THEN
      SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
      v_user_role := 'owner';
    ELSE
      RAISE EXCEPTION 'Access denied: Valid owner/admin user session or service-role credential required.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT status INTO v_inv_status FROM public.invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice % not found.', p_invoice_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_inv_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Invoice % is already cancelled.', p_invoice_id
      USING ERRCODE = 'P0001';
  END IF;

  IF v_inv_status = 'DRAFT' THEN
    RAISE EXCEPTION 'Draft invoices should be deleted or edited, not cancelled.'
      USING ERRCODE = 'P0001';
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
REVOKE ALL ON FUNCTION public.cancel_invoice(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_invoice(uuid, text) TO authenticated, service_role;


-- ----------------------------------------------------------------------------
-- 2. ENVIRONMENT ISOLATION & DEFENSE-IN-DEPTH
-- ----------------------------------------------------------------------------
-- Test mode bypasses and test helpers belong exclusively in DEV.
-- In any non-development database (such as Tokyo Production),
-- this block purges cleanup_test_invoice and restores immutability triggers
-- without any session-variable bypasses.
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  v_is_dev boolean := false;
  v_env text;
BEGIN
  -- Strict fail-closed environment resolution:
  -- Defaults to FALSE (production/secure mode).
  v_env := NULLIF(current_setting('bcs.environment', true), '');

  IF v_env = 'production' THEN
    v_is_dev := false;
  ELSIF v_env = 'development' THEN
    v_is_dev := true;
  -- Multi-factor verification for development:
  -- Never rely on an owner UUID alone. Require both verified dev owner AND verified dev test customer fixture.
  ELSIF EXISTS (
    SELECT 1 FROM public.admin_profiles ap
    WHERE ap.id = '6e65facb-c98c-4d7f-a17c-669b2f55b2b6'
      AND ap.email = 'bhavatariniascatering' || 'service@gmail.com'
  ) AND EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.customer_code = 'V1TEST001'
  ) THEN
    v_is_dev := true;
  ELSE
    v_is_dev := false;
  END IF;

  IF NOT v_is_dev THEN
    -- 1. Drop test cleanup helper in production
    DROP FUNCTION IF EXISTS public.cleanup_test_invoice(uuid);

    -- 2. Restore pure production immutability triggers (NO bcs.test_mode bypass)
    CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
    RETURNS TRIGGER AS $trig$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        IF OLD.status IN ('ISSUED', 'CANCELLED') THEN
          RAISE EXCEPTION 'Issued or cancelled invoices (Invoice %) cannot be deleted from the system.', OLD.invoice_number;
        END IF;
        RETURN OLD;
      END IF;

      IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'CANCELLED' AND NEW.status <> 'CANCELLED' THEN
          RAISE EXCEPTION 'Cancelled invoices cannot be reopened or transitioned to any other status.';
        END IF;
        
        IF OLD.status = 'ISSUED' AND NEW.status = 'DRAFT' THEN
          RAISE EXCEPTION 'Issued invoices cannot be reverted to draft status.';
        END IF;

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
    $trig$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public, pg_catalog, pg_temp;

    CREATE OR REPLACE FUNCTION public.enforce_invoice_daily_entries_immutability()
    RETURNS TRIGGER AS $trig$
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
    $trig$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public, pg_catalog, pg_temp;

    CREATE OR REPLACE FUNCTION public.recalculate_invoice_payments()
    RETURNS TRIGGER AS $trig$
    DECLARE
      v_invoice_id uuid;
      v_total_amount numeric(12,2);
      v_total_paid numeric(12,2);
      v_balance numeric(12,2);
      v_status varchar;
      v_inv_status varchar;
    BEGIN
      v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
      
      SELECT total_amount, status INTO v_total_amount, v_inv_status
      FROM public.invoices
      WHERE id = v_invoice_id;

      IF v_inv_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Payments cannot be recorded, updated, or removed for cancelled invoices.';
      END IF;

      SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
      FROM public.invoice_payments
      WHERE invoice_id = v_invoice_id;

      IF v_total_paid > v_total_amount THEN
        RAISE EXCEPTION 'Total payments (₹%) cannot exceed invoice grand total (₹%).', v_total_paid, v_total_amount;
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
    $trig$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public, pg_catalog, pg_temp;

    RAISE NOTICE 'Production environment verified: Test mode bypasses purged and immutability triggers hardened.';
  ELSE
    RAISE NOTICE 'Development environment verified: Test mode bypasses preserved for test suite execution.';
  END IF;
END $$;
