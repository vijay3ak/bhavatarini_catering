-- ============================================================================
-- Migration: 20261109000002_v1_save_customer_profile_rpc.sql
-- Description: Atomic PostgreSQL RPC function for creating and editing
--              Corporate Customer profiles, structured addresses, and contacts,
--              with least-privilege child-table write hardening.
--
-- Security Guarantees:
--   1. Function is SECURITY DEFINER with search_path = pg_catalog, pg_temp.
--   2. Restricted execution: PUBLIC, anon, and service_role are denied.
--      Only authenticated administrators with role 'owner' or 'admin'
--      are authorized to execute this function.
--   3. All table operations (customers, customer_addresses, customer_contacts)
--      run in a single atomic transaction. Any validation or constraint failure
--      triggers an automatic rollback, preventing partial or orphaned records.
--   4. Concurrency Safety: edits acquire an exclusive row-level lock (FOR UPDATE)
--      on public.customers before updating addresses or contacts, serializing
--      concurrent edits for the same customer without contending across different customers.
--   5. Preserves existing customer records, secondary addresses, and contacts.
--   6. Mandatory delivery & billing cities with no silent hardcoded fallbacks.
--   7. Explicit contact clearing: contacts are never silently deleted when
--      optional fields are omitted unintentionally.
--   8. Single-default address consistency: when an address is designated as
--      default, sibling addresses of the same type for that customer are
--      atomically demoted (is_default = false), preserving secondary rows.
--   9. Contract status preservation: during edits, omitting p_contract_status
--      safely retains the existing status instead of resetting to 'In Review'.
--  10. Least-Privilege Child-Table Hardening: revokes direct INSERT, UPDATE,
--      and DELETE on customer_addresses and customer_contacts from authenticated,
--      dropping direct write RLS policies while preserving SELECT permissions.
--      All mutations must route through this verified, concurrency-locked RPC.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FUNCTION DEFINITION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_customer_profile(
  p_id uuid DEFAULT NULL,
  p_customer_code varchar DEFAULT NULL,
  p_company_name varchar DEFAULT NULL,
  p_gstin varchar DEFAULT NULL,
  p_pan varchar DEFAULT NULL,
  p_contract_status varchar DEFAULT NULL,
  p_default_rate numeric DEFAULT NULL,
  p_default_preset varchar DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_delivery_address_line text DEFAULT NULL,
  p_delivery_city varchar DEFAULT NULL,
  p_delivery_pincode varchar DEFAULT NULL,
  p_billing_address_line text DEFAULT NULL,
  p_billing_city varchar DEFAULT NULL,
  p_billing_pincode varchar DEFAULT NULL,
  p_contact_name varchar DEFAULT NULL,
  p_contact_phone varchar DEFAULT NULL,
  p_contact_email varchar DEFAULT NULL,
  p_contact_designation varchar DEFAULT NULL,
  p_clear_contact boolean DEFAULT false,
  p_delivery_address_id uuid DEFAULT NULL,
  p_billing_address_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_caller_role varchar;
  v_customer_id uuid;
  v_existing_status varchar;
  v_company_name varchar;
  v_customer_code varchar;
  v_gstin varchar;
  v_pan varchar;
  v_contract_status varchar;
  v_default_preset varchar;
  v_notes text;
  v_delivery_line text;
  v_delivery_city varchar;
  v_delivery_pincode varchar;
  v_billing_line text;
  v_billing_city varchar;
  v_billing_pincode varchar;
  v_contact_name varchar;
  v_contact_phone varchar;
  v_contact_email varchar;
  v_contact_designation varchar;
  v_target_delivery_id uuid;
  v_target_billing_id uuid;
  v_target_contact_id uuid;
BEGIN
  -- --------------------------------------------------------------------------
  -- 1. AUTHORIZATION CHECK
  -- --------------------------------------------------------------------------
  -- Verify caller is an active administrator with role 'owner' or 'admin'.
  -- Staff, anon, unauthenticated sessions, and inactive administrators are strictly denied.
  v_caller_role := public.get_current_admin_role();
  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Access denied: saving customer profiles requires active owner or admin privileges.'
      USING ERRCODE = '42501';
  END IF;

  -- --------------------------------------------------------------------------
  -- 2. CONCURRENCY CONTROL (ROW-LEVEL LOCK ON EDIT)
  -- --------------------------------------------------------------------------
  -- For existing customer edits, acquire an exclusive row lock on the customer
  -- record immediately. This serializes concurrent updates to the same customer's
  -- profile, addresses, and contacts, preventing race conditions (such as multiple
  -- concurrent default addresses).
  -- Different customers are completely unaffected and proceed in parallel without contention.
  IF p_id IS NOT NULL THEN
    SELECT id, contract_status
    INTO v_customer_id, v_existing_status
    FROM public.customers
    WHERE id = p_id
    FOR UPDATE;

    IF v_customer_id IS NULL THEN
      RAISE EXCEPTION 'Customer with ID % not found.', p_id
        USING ERRCODE = 'P0002';
    END IF;
  END IF;

  -- --------------------------------------------------------------------------
  -- 3. INPUT SANITIZATION & VALIDATION
  -- --------------------------------------------------------------------------
  -- Company Legal Name (mandatory, minimum 2 characters)
  v_company_name := pg_catalog.btrim(p_company_name);
  IF v_company_name IS NULL OR pg_catalog.char_length(v_company_name) < 2 THEN
    RAISE EXCEPTION 'Company name must be at least 2 characters.'
      USING ERRCODE = '23514';
  END IF;

  -- Customer Code (mandatory regex ^[A-Z0-9_-]+$)
  v_customer_code := pg_catalog.upper(pg_catalog.btrim(p_customer_code));
  IF v_customer_code IS NULL OR v_customer_code = '' THEN
    -- Auto-generate code from company name if omitted
    v_customer_code := pg_catalog.upper(pg_catalog.regexp_replace(v_company_name, '[^a-zA-Z0-9]', '', 'g'));
    v_customer_code := pg_catalog.substr(v_customer_code, 1, 8);
  END IF;

  IF v_customer_code IS NULL OR v_customer_code !~ '^[A-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Customer code must contain only uppercase alphanumeric characters, underscores, or hyphens.'
      USING ERRCODE = '23514';
  END IF;

  -- Contract Status Resolution:
  -- - On create: defaults to 'In Review' if omitted.
  -- - On edit: preserves existing customer status if omitted/null; updates if supplied.
  IF p_id IS NULL THEN
    v_contract_status := COALESCE(pg_catalog.btrim(p_contract_status), 'In Review');
  ELSE
    IF p_contract_status IS NOT NULL AND pg_catalog.btrim(p_contract_status) <> '' THEN
      v_contract_status := pg_catalog.btrim(p_contract_status);
    ELSE
      v_contract_status := v_existing_status;
    END IF;
  END IF;

  IF v_contract_status NOT IN ('Active Daily Contract', 'Periodic Orders', 'In Review', 'Archived') THEN
    RAISE EXCEPTION 'Invalid contract status: %', v_contract_status
      USING ERRCODE = '23514';
  END IF;

  -- Default Contract Rate (nullable; if provided, must be > 0)
  IF p_default_rate IS NOT NULL AND p_default_rate <= 0 THEN
    RAISE EXCEPTION 'Default contract rate must be greater than zero.'
      USING ERRCODE = '23514';
  END IF;

  -- Delivery Address Line (mandatory)
  v_delivery_line := pg_catalog.btrim(p_delivery_address_line);
  IF v_delivery_line IS NULL OR v_delivery_line = '' THEN
    RAISE EXCEPTION 'Delivery address line is required.'
      USING ERRCODE = '23514';
  END IF;

  -- Delivery City (mandatory; NO silent fallback)
  v_delivery_city := pg_catalog.btrim(p_delivery_city);
  IF v_delivery_city IS NULL OR v_delivery_city = '' THEN
    RAISE EXCEPTION 'Delivery city is required.'
      USING ERRCODE = '23514';
  END IF;

  -- Billing Address Line (mandatory)
  v_billing_line := pg_catalog.btrim(p_billing_address_line);
  IF v_billing_line IS NULL OR v_billing_line = '' THEN
    RAISE EXCEPTION 'Billing address line is required.'
      USING ERRCODE = '23514';
  END IF;

  -- Billing City (mandatory; NO silent fallback)
  v_billing_city := pg_catalog.btrim(p_billing_city);
  IF v_billing_city IS NULL OR v_billing_city = '' THEN
    RAISE EXCEPTION 'Billing city is required.'
      USING ERRCODE = '23514';
  END IF;

  -- Optional Pincodes (if provided, must be 6 digits)
  v_delivery_pincode := pg_catalog.btrim(p_delivery_pincode);
  IF v_delivery_pincode IS NOT NULL AND v_delivery_pincode <> '' THEN
    IF v_delivery_pincode !~ '^[0-9]{6}$' THEN
      RAISE EXCEPTION 'Delivery pincode must be exactly 6 digits.'
        USING ERRCODE = '23514';
    END IF;
  ELSE
    v_delivery_pincode := NULL;
  END IF;

  v_billing_pincode := pg_catalog.btrim(p_billing_pincode);
  IF v_billing_pincode IS NOT NULL AND v_billing_pincode <> '' THEN
    IF v_billing_pincode !~ '^[0-9]{6}$' THEN
      RAISE EXCEPTION 'Billing pincode must be exactly 6 digits.'
        USING ERRCODE = '23514';
    END IF;
  ELSE
    v_billing_pincode := NULL;
  END IF;

  -- Optional Tax IDs & Preset
  v_gstin := pg_catalog.upper(pg_catalog.btrim(p_gstin));
  IF v_gstin = '' THEN v_gstin := NULL; END IF;

  v_pan := pg_catalog.upper(pg_catalog.btrim(p_pan));
  IF v_pan = '' THEN v_pan := NULL; END IF;

  v_default_preset := pg_catalog.btrim(p_default_preset);
  IF v_default_preset = '' THEN v_default_preset := NULL; END IF;

  v_notes := pg_catalog.btrim(p_notes);
  IF v_notes = '' THEN v_notes := NULL; END IF;

  -- Optional Contact Sanitization & Format Validation
  v_contact_name := pg_catalog.btrim(p_contact_name);
  IF v_contact_name = '' THEN v_contact_name := NULL; END IF;

  v_contact_phone := pg_catalog.btrim(p_contact_phone);
  IF v_contact_phone = '' THEN v_contact_phone := NULL; END IF;

  v_contact_email := pg_catalog.btrim(p_contact_email);
  IF v_contact_email IS NOT NULL AND v_contact_email <> '' THEN
    IF v_contact_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Contact email format is invalid.'
        USING ERRCODE = '23514';
    END IF;
  ELSE
    v_contact_email := NULL;
  END IF;

  v_contact_designation := pg_catalog.btrim(p_contact_designation);
  IF v_contact_designation = '' THEN v_contact_designation := NULL; END IF;

  -- If either contact name or contact phone is provided, both must be provided
  IF (v_contact_name IS NOT NULL AND v_contact_phone IS NULL) OR
     (v_contact_name IS NULL AND v_contact_phone IS NOT NULL) THEN
    RAISE EXCEPTION 'Both contact person name and contact phone number are required to record contact details.'
      USING ERRCODE = '23514';
  END IF;

  -- --------------------------------------------------------------------------
  -- 4. ATOMIC PERSISTENCE (CREATE OR EDIT)
  -- --------------------------------------------------------------------------
  IF p_id IS NULL THEN
    -- ========================================================================
    -- A. CREATE NEW CUSTOMER
    -- ========================================================================
    INSERT INTO public.customers (
      customer_code,
      company_name,
      gstin,
      pan,
      contract_status,
      default_rate,
      default_preset,
      notes,
      created_at,
      updated_at
    ) VALUES (
      v_customer_code,
      v_company_name,
      v_gstin,
      v_pan,
      v_contract_status,
      p_default_rate,
      v_default_preset,
      v_notes,
      pg_catalog.now(),
      pg_catalog.now()
    ) RETURNING id INTO v_customer_id;

    -- Insert Primary Delivery Address (is_default = true)
    INSERT INTO public.customer_addresses (
      customer_id,
      address_type,
      address_line,
      city,
      pincode,
      is_default,
      created_at,
      updated_at
    ) VALUES (
      v_customer_id,
      'delivery',
      v_delivery_line,
      v_delivery_city,
      v_delivery_pincode,
      true,
      pg_catalog.now(),
      pg_catalog.now()
    );

    -- Insert Primary Billing Address (is_default = true)
    INSERT INTO public.customer_addresses (
      customer_id,
      address_type,
      address_line,
      city,
      pincode,
      is_default,
      created_at,
      updated_at
    ) VALUES (
      v_customer_id,
      'billing',
      v_billing_line,
      v_billing_city,
      v_billing_pincode,
      true,
      pg_catalog.now(),
      pg_catalog.now()
    );

    -- Insert Contact if both person name and phone are provided
    IF v_contact_name IS NOT NULL AND v_contact_phone IS NOT NULL THEN
      INSERT INTO public.customer_contacts (
        customer_id,
        contact_name,
        phone,
        email,
        designation,
        is_primary,
        created_at,
        updated_at
      ) VALUES (
        v_customer_id,
        v_contact_name,
        v_contact_phone,
        v_contact_email,
        v_contact_designation,
        true,
        pg_catalog.now(),
        pg_catalog.now()
      );
    END IF;

  ELSE
    -- ========================================================================
    -- B. UPDATE EXISTING CUSTOMER (Row lock already acquired in Section 2)
    -- ========================================================================
    -- Update Master Customer Attributes
    UPDATE public.customers
    SET customer_code = v_customer_code,
        company_name = v_company_name,
        gstin = v_gstin,
        pan = v_pan,
        contract_status = v_contract_status,
        default_rate = p_default_rate,
        default_preset = v_default_preset,
        notes = v_notes,
        updated_at = pg_catalog.now()
    WHERE id = v_customer_id;

    -- ------------------------------------------------------------------------
    -- Delivery Address Resolution, Single-Default Consistency & Update
    -- ------------------------------------------------------------------------
    IF p_delivery_address_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.customer_addresses 
        WHERE id = p_delivery_address_id AND customer_id = v_customer_id AND address_type = 'delivery'
      ) THEN
        RAISE EXCEPTION 'Delivery address ID % does not belong to customer %.', p_delivery_address_id, v_customer_id
          USING ERRCODE = '23503';
      END IF;
      v_target_delivery_id := p_delivery_address_id;
    ELSE
      SELECT id INTO v_target_delivery_id
      FROM public.customer_addresses 
      WHERE customer_id = v_customer_id AND address_type = 'delivery'
      ORDER BY is_default DESC, created_at ASC 
      LIMIT 1;
    END IF;

    IF v_target_delivery_id IS NOT NULL THEN
      UPDATE public.customer_addresses
      SET address_line = v_delivery_line,
          city = v_delivery_city,
          pincode = v_delivery_pincode,
          is_default = true,
          updated_at = pg_catalog.now()
      WHERE id = v_target_delivery_id;
    ELSE
      INSERT INTO public.customer_addresses (
        customer_id,
        address_type,
        address_line,
        city,
        pincode,
        is_default,
        created_at,
        updated_at
      ) VALUES (
        v_customer_id,
        'delivery',
        v_delivery_line,
        v_delivery_city,
        v_delivery_pincode,
        true,
        pg_catalog.now(),
        pg_catalog.now()
      ) RETURNING id INTO v_target_delivery_id;
    END IF;

    -- Ensure single-default delivery consistency:
    -- Demote any other delivery addresses for this customer to non-default
    UPDATE public.customer_addresses
    SET is_default = false,
        updated_at = pg_catalog.now()
    WHERE customer_id = v_customer_id
      AND address_type = 'delivery'
      AND id <> v_target_delivery_id
      AND is_default = true;

    -- ------------------------------------------------------------------------
    -- Billing Address Resolution, Single-Default Consistency & Update
    -- ------------------------------------------------------------------------
    IF p_billing_address_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.customer_addresses 
        WHERE id = p_billing_address_id AND customer_id = v_customer_id AND address_type = 'billing'
      ) THEN
        RAISE EXCEPTION 'Billing address ID % does not belong to customer %.', p_billing_address_id, v_customer_id
          USING ERRCODE = '23503';
      END IF;
      v_target_billing_id := p_billing_address_id;
    ELSE
      SELECT id INTO v_target_billing_id
      FROM public.customer_addresses 
      WHERE customer_id = v_customer_id AND address_type = 'billing'
      ORDER BY is_default DESC, created_at ASC 
      LIMIT 1;
    END IF;

    IF v_target_billing_id IS NOT NULL THEN
      UPDATE public.customer_addresses
      SET address_line = v_billing_line,
          city = v_billing_city,
          pincode = v_billing_pincode,
          is_default = true,
          updated_at = pg_catalog.now()
      WHERE id = v_target_billing_id;
    ELSE
      INSERT INTO public.customer_addresses (
        customer_id,
        address_type,
        address_line,
        city,
        pincode,
        is_default,
        created_at,
        updated_at
      ) VALUES (
        v_customer_id,
        'billing',
        v_billing_line,
        v_billing_city,
        v_billing_pincode,
        true,
        pg_catalog.now(),
        pg_catalog.now()
      ) RETURNING id INTO v_target_billing_id;
    END IF;

    -- Ensure single-default billing consistency:
    -- Demote any other billing addresses for this customer to non-default
    UPDATE public.customer_addresses
    SET is_default = false,
        updated_at = pg_catalog.now()
    WHERE customer_id = v_customer_id
      AND address_type = 'billing'
      AND id <> v_target_billing_id
      AND is_default = true;

    -- ------------------------------------------------------------------------
    -- Safe Contact Management
    -- ------------------------------------------------------------------------
    IF p_clear_contact IS TRUE THEN
      DELETE FROM public.customer_contacts
      WHERE customer_id = v_customer_id;
    ELSIF v_contact_name IS NOT NULL AND v_contact_phone IS NOT NULL THEN
      SELECT id INTO v_target_contact_id
      FROM public.customer_contacts
      WHERE customer_id = v_customer_id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1;

      IF v_target_contact_id IS NOT NULL THEN
        UPDATE public.customer_contacts
        SET contact_name = v_contact_name,
            phone = v_contact_phone,
            email = v_contact_email,
            designation = v_contact_designation,
            is_primary = true,
            updated_at = pg_catalog.now()
        WHERE id = v_target_contact_id;
      ELSE
        INSERT INTO public.customer_contacts (
          customer_id,
          contact_name,
          phone,
          email,
          designation,
          is_primary,
          created_at,
          updated_at
        ) VALUES (
          v_customer_id,
          v_contact_name,
          v_contact_phone,
          v_contact_email,
          v_contact_designation,
          true,
          pg_catalog.now(),
          pg_catalog.now()
        );
      END IF;
    END IF;

  END IF;

  RETURN v_customer_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. FUNCTION PERMISSIONS & EXECUTION HARDENING
-- ----------------------------------------------------------------------------
-- Revoke all default execute privileges from PUBLIC and anon roles
REVOKE ALL ON FUNCTION public.save_customer_profile(
  uuid, varchar, varchar, varchar, varchar, varchar, numeric, varchar, text,
  text, varchar, varchar, text, varchar, varchar, varchar, varchar, varchar, varchar,
  boolean, uuid, uuid
) FROM PUBLIC, anon;

-- Grant execution strictly to authenticated role
-- (Internal authorization check enforces active owner/admin membership)
GRANT EXECUTE ON FUNCTION public.save_customer_profile(
  uuid, varchar, varchar, varchar, varchar, varchar, numeric, varchar, text,
  text, varchar, varchar, text, varchar, varchar, varchar, varchar, varchar, varchar,
  boolean, uuid, uuid
) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. LEAST-PRIVILEGE HARDENING FOR CHILD CRM TABLES
-- ----------------------------------------------------------------------------
-- In V1, customer addresses and contacts are managed strictly through the
-- atomic, concurrency-locked save_customer_profile() RPC.
--
-- Direct table-level mutations (INSERT, UPDATE, DELETE) by authenticated users
-- circumvent the customer row lock, city validation, and single-default
-- address consistency.
--
-- Because save_customer_profile() is a SECURITY DEFINER function executing as
-- the table owner ('postgres'), it retains full operational DML privileges on
-- these tables even when direct client access is revoked from authenticated.
--
-- Read privileges (SELECT) and RLS SELECT policies are preserved untouched to
-- support dashboard metrics, customer listing, and customer detail drawers.
-- ----------------------------------------------------------------------------

-- Revoke direct table mutations from authenticated role
REVOKE INSERT, UPDATE, DELETE ON TABLE public.customer_addresses FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.customer_contacts FROM authenticated;

-- Drop obsolete direct write RLS policies
DROP POLICY IF EXISTS "cust_addresses_write_admin_owner" ON public.customer_addresses;
DROP POLICY IF EXISTS "cust_contacts_write_admin_owner" ON public.customer_contacts;
