-- ============================================================================
-- BHAVATARINI CATERING SERVICE — V1 MULTI-MEAL BILLING EXTENSION
-- ============================================================================
-- Migration: 20261111000001_v1_multi_meal_billing_extension.sql
-- Purpose:
--   Extends the V1 Monthly Catering Billing engine to support optional same-day
--   multi-meal billing (Breakfast, Lunch, Dinner, Snacks, Tea) with independent
--   quantities, rates, and itemized line items while preserving 100% backward
--   compatibility with standard preset workflows (HYDAC, LMW, etc.).
--
-- Safety Guarantees:
--   1. Backward Compatible: The existing unique constraint (invoice_id, entry_date)
--      on public.invoice_daily_entries is strictly preserved.
--   2. Duplicate Prevention: Unique constraint (invoice_id, entry_date, meal_type)
--      on public.invoice_meal_items prevents duplicate entries per category.
--   3. Immutability: Issued and cancelled invoices cannot have meal items mutated.
--   4. Accurate Recomputation: issue_invoice accurately sums daily_amount across
--      all dates, supporting multi-meal independent pricing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD MULTI-MEAL COLUMNS TO INVOICE_DAILY_ENTRIES
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'invoice_daily_entries' 
      AND column_name = 'is_multi_meal'
  ) THEN
    ALTER TABLE public.invoice_daily_entries 
    ADD COLUMN is_multi_meal boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'invoice_daily_entries' 
      AND column_name = 'meal_breakdown'
  ) THEN
    ALTER TABLE public.invoice_daily_entries 
    ADD COLUMN meal_breakdown jsonb NULL;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CREATE INVOICE_MEAL_ITEMS TABLE (NORMALIZED LINE ITEMS)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invoice_meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  daily_entry_id uuid NULL REFERENCES public.invoice_daily_entries(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  meal_type varchar(32) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'TEA')),
  quantity integer NOT NULL CHECK (quantity >= 0),
  rate numeric(10,2) NOT NULL CHECK (rate >= 0),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_invoice_meal_item UNIQUE (invoice_id, entry_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_invoice_meal_items_invoice ON public.invoice_meal_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_meal_items_date ON public.invoice_meal_items (entry_date ASC);

-- ----------------------------------------------------------------------------
-- 3. IMMUTABILITY TRIGGER FOR INVOICE_MEAL_ITEMS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_meal_item_mutation_on_finalized_invoice()
RETURNS TRIGGER AS $$
DECLARE
  v_status varchar;
  v_inv_id uuid;
BEGIN
  IF current_setting('bcs.test_mode', true) = 'enabled' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_inv_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  SELECT status INTO v_status FROM public.invoices WHERE id = v_inv_id;

  IF v_status IN ('ISSUED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Meal items belonging to an issued or cancelled invoice cannot be created, updated, or removed.'
      USING ERRCODE = '42501';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_meal_item_mutation ON public.invoice_meal_items;
CREATE TRIGGER trg_prevent_meal_item_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_meal_items
FOR EACH ROW
EXECUTE FUNCTION public.prevent_meal_item_mutation_on_finalized_invoice();

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY & PRIVILEGES ON INVOICE_MEAL_ITEMS
-- ----------------------------------------------------------------------------

ALTER TABLE public.invoice_meal_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on invoice_meal_items" ON public.invoice_meal_items;
CREATE POLICY "Service role full access on invoice_meal_items"
  ON public.invoice_meal_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view invoice_meal_items" ON public.invoice_meal_items;
CREATE POLICY "Admins can view invoice_meal_items"
  ON public.invoice_meal_items
  FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Owner and Admin can insert invoice_meal_items" ON public.invoice_meal_items;
CREATE POLICY "Owner and Admin can insert invoice_meal_items"
  ON public.invoice_meal_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Owner and Admin can update invoice_meal_items" ON public.invoice_meal_items;
CREATE POLICY "Owner and Admin can update invoice_meal_items"
  ON public.invoice_meal_items
  FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Owner and Admin can delete invoice_meal_items" ON public.invoice_meal_items;
CREATE POLICY "Owner and Admin can delete invoice_meal_items"
  ON public.invoice_meal_items
  FOR DELETE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_meal_items TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 5. UPDATED SAVE_INVOICE_DRAFT STORED PROCEDURE
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
  v_daily_entry_id uuid;
  v_meal_elem jsonb;
BEGIN
  -- Strict Authorization & Identity Resolution
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    v_user_role := public.get_current_admin_role();
    IF v_user_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Unauthorized: Only Owner and Admin can save billing drafts.'
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
    
    DELETE FROM public.invoice_meal_items WHERE invoice_id = v_invoice_id;
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

  -- Insert daily entries & normalized meal items
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
        daily_amount,
        is_multi_meal,
        meal_breakdown
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
        COALESCE((v_elem->>'daily_amount')::numeric, 0.00),
        COALESCE((v_elem->>'is_multi_meal')::boolean, false),
        CASE 
          WHEN COALESCE((v_elem->>'is_multi_meal')::boolean, false) = true THEN v_elem->'meal_breakdown'
          ELSE NULL
        END
      )
      RETURNING id INTO v_daily_entry_id;

      -- If row is multi-meal, populate normalized invoice_meal_items
      IF COALESCE((v_elem->>'is_multi_meal')::boolean, false) = true 
         AND v_elem->'meal_breakdown'->'meals' IS NOT NULL THEN
        FOR v_meal_elem IN SELECT * FROM jsonb_array_elements(v_elem->'meal_breakdown'->'meals')
        LOOP
          IF COALESCE((v_meal_elem->>'enabled')::boolean, false) = true 
             AND COALESCE((v_meal_elem->>'quantity')::integer, 0) > 0 THEN
            INSERT INTO public.invoice_meal_items (
              invoice_id,
              daily_entry_id,
              entry_date,
              meal_type,
              quantity,
              rate,
              amount,
              notes
            ) VALUES (
              v_invoice_id,
              v_daily_entry_id,
              (v_elem->>'entry_date')::date,
              UPPER(v_meal_elem->>'mealType')::varchar,
              (v_meal_elem->>'quantity')::integer,
              (v_meal_elem->>'rate')::numeric,
              (v_meal_elem->>'amount')::numeric,
              v_meal_elem->>'notes'
            );
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

ALTER FUNCTION public.save_invoice_draft OWNER TO postgres;
REVOKE ALL ON FUNCTION public.save_invoice_draft(uuid, uuid, smallint, integer, date, date, date, varchar, numeric, varchar, varchar, integer, integer, integer, numeric, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_invoice_draft(uuid, uuid, smallint, integer, date, date, date, varchar, numeric, varchar, varchar, integer, integer, integer, numeric, text, text, jsonb) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6. UPDATED ISSUE_INVOICE STORED PROCEDURE
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

  -- Recompute totals strictly from stored daily entries
  SELECT
    COALESCE(SUM(bill_qty), 0),
    COALESCE(SUM(daily_amount), 0.00),
    COUNT(*),
    COUNT(*) FILTER (WHERE is_sunday)
  INTO
    v_recomputed_qty,
    v_recomputed_amount,
    v_total_days,
    v_total_sundays
  FROM public.invoice_daily_entries
  WHERE invoice_id = p_invoice_id;

  IF v_total_days = 0 THEN
    RAISE EXCEPTION 'Cannot issue invoice with 0 daily billing entries.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Fallback if daily_amount was not set on older draft records
  IF v_recomputed_amount = 0.00 AND v_recomputed_qty > 0 AND v_inv.rate > 0 THEN
    v_recomputed_amount := v_recomputed_qty * v_inv.rate;
  END IF;

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

-- ----------------------------------------------------------------------------
-- 7. CONDITIONAL TEST CLEANUP HELPER UPDATE (DEV ENVIRONMENT ONLY)
-- ----------------------------------------------------------------------------

DO $outer$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_test_invoice'
  ) THEN
    CREATE OR REPLACE FUNCTION public.cleanup_test_invoice(p_invoice_id uuid)
    RETURNS boolean AS $body$
    BEGIN
      PERFORM set_config('bcs.test_mode', 'enabled', true);
      DELETE FROM public.invoice_payments WHERE invoice_id = p_invoice_id;
      DELETE FROM public.invoice_meal_items WHERE invoice_id = p_invoice_id;
      DELETE FROM public.invoice_daily_entries WHERE invoice_id = p_invoice_id;
      DELETE FROM public.invoices WHERE id = p_invoice_id;
      PERFORM set_config('bcs.test_mode', 'disabled', true);
      RETURN true;
    END;
    $body$ LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public, pg_catalog, pg_temp;

    REVOKE ALL ON FUNCTION public.cleanup_test_invoice(uuid) FROM PUBLIC, anon;
    GRANT EXECUTE ON FUNCTION public.cleanup_test_invoice(uuid) TO postgres, service_role;
  END IF;
END $outer$;

