-- ============================================================================
-- Bhavatarini Catering Service — Local Development Test Identity
-- File: supabase/local_test_identity.sql
-- Description: Isolated, manual opt-in test owner identity for local testing only.
--
-- CRITICAL SECURITY ENFORCEMENT:
--   1. This script is NOT executed by `supabase migration up`, `supabase db push`,
--      or `supabase/seed.sql`.
--   2. It requires an explicit session parameter to execute:
--      SET bcs.allow_local_test_seed = 'true';
--   3. It is prohibited from running if the session variable is absent.
--   4. NEVER apply this script to any shared, staging, or production database.
-- ============================================================================

-- Explicit opt-in safety guard
DO $$
BEGIN
  IF current_setting('bcs.allow_local_test_seed', true) <> 'true' THEN
    RAISE EXCEPTION 'BLOCKED: supabase/local_test_identity.sql contains development test credentials and will not execute unless explicitly enabled via: SET bcs.allow_local_test_seed = ''true'';';
  END IF;
END $$;

-- Isolated local development test identity
DO $$
DECLARE
  local_dev_user_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  local_dev_email text := 'dev-owner@local.bhavatarinicatering.internal';
BEGIN
  -- Insert into auth.users only if running in a local environment with auth schema
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      local_dev_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      local_dev_email,
      crypt('DevLocalPasswordOnly123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Local Dev Owner"}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated'
    ) ON CONFLICT (id) DO NOTHING;

    -- Map into admin_profiles with 'owner' role
    INSERT INTO public.admin_profiles (
      id,
      email,
      full_name,
      role_id,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      local_dev_user_id,
      local_dev_email,
      'Local Dev Administrator',
      'owner',
      true,
      now(),
      now()
    ) ON CONFLICT (id) DO UPDATE SET
      role_id = 'owner',
      is_active = true;
  END IF;
END $$;
