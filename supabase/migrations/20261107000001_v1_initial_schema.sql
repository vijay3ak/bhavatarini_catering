-- ============================================================================
-- Bhavatarini Catering Service — Version 1 Schema Migration
-- Migration: 20261107000001_v1_initial_schema.sql
-- Description: Core tables, constraints, foreign keys, triggers, and sequences.
-- Compliance: Rule 14 (Zero invented defaults; all operational values nullable).
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. CONCURRENCY-SAFE ENQUIRY SEQUENCE & GENERATOR
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.enquiry_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE OR REPLACE FUNCTION public.set_enquiry_number()
RETURNS TRIGGER AS $$
DECLARE
  current_period text;
  seq_val bigint;
BEGIN
  IF NEW.enquiry_number IS NULL OR NEW.enquiry_number = '' THEN
    current_period := to_char(CURRENT_DATE, 'YYYYMM');
    seq_val := nextval('public.enquiry_number_seq');
    NEW.enquiry_number := 'ENQ-' || current_period || '-' || lpad(seq_val::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- ----------------------------------------------------------------------------
-- 2. ADMINISTRATIVE ROLES & PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_roles (
  role_id varchar(32) PRIMARY KEY,
  role_name varchar(64) NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_admin_roles_valid CHECK (role_id IN ('owner', 'admin', 'staff'))
);

-- Seed initial static roles
INSERT INTO public.admin_roles (role_id, role_name, description) VALUES
  ('owner', 'Business Owner', 'Full governance, business settings, user invitations, and financial control.'),
  ('admin', 'Catering Manager', 'Full customer and enquiry management, operational settings, and reporting.'),
  ('staff', 'Operations Staff', 'View-only access, enquiry note authoring, and status updates.')
ON CONFLICT (role_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email citext NOT NULL UNIQUE,
  full_name varchar(128) NOT NULL,
  role_id varchar(32) NOT NULL DEFAULT 'staff' REFERENCES public.admin_roles(role_id) ON DELETE RESTRICT,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles (role_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_active ON public.admin_profiles (is_active);

-- ----------------------------------------------------------------------------
-- 3. ADMINISTRATIVE INVITATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL,
  role_id varchar(32) NOT NULL REFERENCES public.admin_roles(role_id) ON DELETE RESTRICT,
  token_hash varchar(64) NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_invitation_role CHECK (role_id <> 'owner')
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.admin_invitations (token_hash) WHERE accepted_at IS NULL;

-- ----------------------------------------------------------------------------
-- 4. CORPORATE CUSTOMERS MASTER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code varchar(32) NOT NULL UNIQUE,
  company_name varchar(256) NOT NULL,
  gstin varchar(20) NULL,
  pan varchar(15) NULL,
  contract_status varchar(32) NOT NULL DEFAULT 'In Review',
  default_rate numeric(10,2) NULL, -- Strictly nullable; no unverified default values
  default_preset varchar(64) NULL, -- Strictly nullable; no unverified default values
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_customers_code CHECK (customer_code ~ '^[A-Z0-9_-]+$'),
  CONSTRAINT chk_customers_name CHECK (char_length(trim(company_name)) >= 2),
  CONSTRAINT chk_customers_status CHECK (contract_status IN ('Active Daily Contract', 'Periodic Orders', 'In Review', 'Archived')),
  CONSTRAINT chk_customers_rate CHECK (default_rate IS NULL OR default_rate > 0)
);

CREATE INDEX IF NOT EXISTS idx_customers_code ON public.customers (customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers (contract_status);

CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  contact_name varchar(128) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(128) NULL,
  designation varchar(64) NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_contacts_cust ON public.customer_contacts (customer_id);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  address_type varchar(32) NOT NULL DEFAULT 'delivery',
  address_line text NOT NULL,
  city varchar(64) NOT NULL DEFAULT 'Coimbatore',
  pincode varchar(10) NULL,
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_address_type CHECK (address_type IN ('billing', 'delivery'))
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_cust ON public.customer_addresses (customer_id);

-- ----------------------------------------------------------------------------
-- 5. PUBLIC ENQUIRIES MASTER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_number varchar(32) NOT NULL UNIQUE,
  name varchar(128) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(128) NULL,
  organisation varchar(128) NULL,
  requirement_type varchar(64) NOT NULL,
  food_preference varchar(64) NOT NULL,
  quantity_range varchar(32) NOT NULL,
  event_date date NULL,
  location varchar(256) NOT NULL,
  details text NULL,
  status varchar(32) NOT NULL DEFAULT 'new',
  whatsapp_initiated boolean NOT NULL DEFAULT false,
  converted_customer_id uuid NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  ip_hash varchar(64) NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_enquiries_name CHECK (char_length(trim(name)) >= 2),
  CONSTRAINT chk_enquiries_phone CHECK (phone ~ '^[0-9+() -]{10,20}$'),
  CONSTRAINT chk_enquiries_location CHECK (char_length(trim(location)) >= 2),
  CONSTRAINT chk_enquiries_status CHECK (status IN ('new', 'contacted', 'quote_sent', 'confirmed', 'completed', 'cancelled')),
  CONSTRAINT chk_enquiries_requirement CHECK (requirement_type IN ('Corporate office', 'Startup / team', 'Small function', 'Group gathering', 'Others')),
  CONSTRAINT chk_enquiries_food CHECK (food_preference IN ('Full meals', 'Customised tiffin', 'Both meals and tiffin', 'Others'))
);

CREATE TRIGGER trg_set_enquiry_number
  BEFORE INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_enquiry_number();

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.enquiries (phone);

CREATE TABLE IF NOT EXISTS public.enquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  note_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_notes_text CHECK (char_length(trim(note_text)) >= 1)
);

CREATE INDEX IF NOT EXISTS idx_enquiry_notes_enquiry ON public.enquiry_notes (enquiry_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.enquiry_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  old_status varchar(32) NOT NULL,
  new_status varchar(32) NOT NULL,
  changed_by uuid NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  reason text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_enquiry ON public.enquiry_status_history (enquiry_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. TRANSACTIONAL NOTIFICATION OUTBOX & ATOMIC ENQUEUE TRIGGER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  channel varchar(32) NOT NULL DEFAULT 'email',
  recipient varchar(255) NOT NULL,
  template_name varchar(64) NOT NULL,
  payload jsonb NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'pending',
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 5,
  last_error text NULL,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_outbox_channel CHECK (channel IN ('email', 'whatsapp', 'sms')),
  CONSTRAINT chk_outbox_status CHECK (status IN ('pending', 'processing', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_outbox_processing
  ON public.notification_outbox (status, next_retry_at)
  WHERE status IN ('pending', 'processing');

-- Atomic Trigger: Guarantee that creating an enquiry automatically commits an outbox job
CREATE OR REPLACE FUNCTION public.enqueue_enquiry_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Enqueue Administrator Alert
  INSERT INTO public.notification_outbox (
    enquiry_id,
    channel,
    recipient,
    template_name,
    payload,
    status
  ) VALUES (
    NEW.id,
    'email',
    'admin_notification_recipient', -- Resolved by worker from notification_settings
    'admin_new_enquiry',
    jsonb_build_object(
      'enquiry_number', NEW.enquiry_number,
      'name', NEW.name,
      'phone', NEW.phone,
      'email', NEW.email,
      'organisation', NEW.organisation,
      'requirement_type', NEW.requirement_type,
      'food_preference', NEW.food_preference,
      'quantity_range', NEW.quantity_range,
      'event_date', NEW.event_date,
      'location', NEW.location,
      'details', NEW.details,
      'created_at', NEW.created_at
    ),
    'pending'
  );

  -- 2. Enqueue Customer Confirmation (if customer provided an email address)
  IF NEW.email IS NOT NULL AND trim(NEW.email) <> '' THEN
    INSERT INTO public.notification_outbox (
      enquiry_id,
      channel,
      recipient,
      template_name,
      payload,
      status
    ) VALUES (
      NEW.id,
      'email',
      trim(NEW.email),
      'customer_confirmation',
      jsonb_build_object(
        'enquiry_number', NEW.enquiry_number,
        'name', NEW.name,
        'requirement_type', NEW.requirement_type,
        'created_at', NEW.created_at
      ),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE TRIGGER trg_enqueue_enquiry_notification
  AFTER INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_enquiry_notification();

-- ----------------------------------------------------------------------------
-- 7. BUSINESS SETTINGS & OPERATIONS (ZERO INVENTED VALUES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name varchar(256) NULL,
  brand_name varchar(256) NULL,
  primary_phone varchar(20) NULL,
  whatsapp_number varchar(20) NULL,
  official_email varchar(128) NULL,
  gstin varchar(20) NULL,
  pan varchar(15) NULL,
  bank_details jsonb NULL,
  invoice_terms text NULL,
  updated_by uuid NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id uuid NOT NULL REFERENCES public.business_settings(id) ON DELETE CASCADE,
  service_start_time time NULL,
  service_end_time time NULL,
  min_headcount int NULL,      -- Strictly nullable; no unverified default values
  max_headcount int NULL,      -- Strictly nullable; no unverified default values
  lead_time_hours int NULL,    -- Strictly nullable; no unverified default values
  service_areas text NULL,     -- Strictly nullable; no unverified default values
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id uuid NOT NULL REFERENCES public.business_settings(id) ON DELETE CASCADE,
  alert_emails text[] NULL,
  notify_on_new_enquiry boolean NOT NULL DEFAULT true,
  notify_on_status_change boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. COMPLIANCE AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NULL REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  actor_email varchar(128) NOT NULL,
  action varchar(64) NOT NULL,
  entity_name varchar(64) NOT NULL,
  entity_id uuid NULL,
  old_values jsonb NULL,
  new_values jsonb NULL,
  ip_address varchar(64) NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_audit_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ROLE_CHANGE', 'EXPORT'))
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs (entity_name, entity_id);
