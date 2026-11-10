-- ============================================================================
-- Bhavatarini Catering Service — Billing Stored Procedures User Fallback (V1)
-- Migration: 20261110000003_v1_billing_service_role_user_fallback.sql
-- Description: In billing RPCs, fallback to active owner profile if auth.uid() is null
--              (such as during service_role calls, test scripts, or cron workers).
-- ============================================================================

-- 1. save_invoice_draft
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
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
    v_user_role := 'owner';
  ELSE
    v_user_role := public.get_current_admin_role();
  END IF;
  
  IF v_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can save billing drafts.';
  END IF;

  IF p_rate < 0 THEN
    RAISE EXCEPTION 'Unit meal rate cannot be negative.';
  END IF;

  IF p_draft_id IS NOT NULL THEN
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

-- 2. issue_invoice
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
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
    v_user_role := 'owner';
  ELSE
    v_user_role := public.get_current_admin_role();
  END IF;
  
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

  v_supplier_snapshot := jsonb_build_object(
    'legal_name', COALESCE(v_settings.legal_name, 'A.S. Bhavatarini Catering Service'),
    'brand_name', COALESCE(v_settings.brand_name, 'Bhavatarini Catering Service'),
    'primary_phone', COALESCE(v_settings.primary_phone, '88389 13486, 93603 40603'),
    'official_email', COALESCE(v_settings.official_email, 'asbcateringservice@gmail.com'),
    'pan', COALESCE(v_settings.pan, 'BGZPS2638L'),
    'address', '16/17, Ayyavu Chettiar Street, Chettipalyam, Coimbatore - 641201',
    'bank_details', v_settings.bank_details
  );

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
  v_invoice_number := public.generate_next_invoice_number(v_inv.invoice_date);

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

-- 3. record_invoice_payment
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
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
    v_user_role := 'owner';
  ELSE
    v_user_role := public.get_current_admin_role();
  END IF;
  
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

-- 4. cancel_invoice
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
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM public.admin_profiles WHERE is_active = true AND role_id = 'owner' LIMIT 1;
    v_user_role := 'owner';
  ELSE
    v_user_role := public.get_current_admin_role();
  END IF;
  
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
