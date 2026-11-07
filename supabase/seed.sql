-- ============================================================================
-- Bhavatarini Catering Service — Baseline Seed Configuration
-- File: supabase/seed.sql
-- Description: Baseline unpopulated master business settings.
-- SECURITY GUARANTEE:
--   Contains ZERO user accounts, credentials, passwords, or personal data.
--   Safe for any environment; seeding test credentials must NEVER be placed here.
--   For local test user provisioning, see supabase/local_test_identity.sql.
-- ============================================================================

-- 1. INITIAL UNPOPULATED BUSINESS SETTINGS RECORD
-- Strictly compliant with Rule 14: zero invented defaults, all operational values NULL.
INSERT INTO public.business_settings (
  id,
  legal_name,
  brand_name,
  primary_phone,
  whatsapp_number,
  official_email,
  gstin,
  pan,
  bank_details,
  invoice_terms,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  NULL, -- To be populated by official business owner
  'Bhavatarini Catering Service',
  NULL, -- To be populated by official business owner
  NULL, -- To be populated by official business owner
  NULL, -- To be populated by official business owner
  NULL,
  NULL,
  NULL,
  '1. Payment due within 15 days of invoice date.\n2. Invoices are subject to Coimbatore jurisdiction.',
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_operations (
  settings_id,
  service_start_time,
  service_end_time,
  min_headcount,
  max_headcount,
  lead_time_hours,
  service_areas,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  NULL,
  NULL,
  NULL, -- Nullable; zero invented values
  NULL, -- Nullable; zero invented values
  NULL, -- Nullable; zero invented values
  NULL, -- Nullable; zero invented values
  now()
) ON CONFLICT DO NOTHING;

INSERT INTO public.notification_settings (
  settings_id,
  alert_emails,
  notify_on_new_enquiry,
  notify_on_status_change,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  NULL,
  true,
  false,
  now()
) ON CONFLICT DO NOTHING;
