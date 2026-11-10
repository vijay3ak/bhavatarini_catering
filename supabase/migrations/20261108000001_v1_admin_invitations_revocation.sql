-- ============================================================================
-- MIGRATION: 20261108000001_v1_admin_invitations_revocation.sql
-- Description: Hardened Additive Schema & Stored Procedures for Admin/Staff Invitations
-- Author: Bhavatarini Catering Platform Engineering
-- Scope:
--   1. Additive columns on public.admin_invitations (revocation, reservation lease, attempt tracking)
--   2. Partial unique index ensuring strictly one unsettled invitation per email
--   3. Hardened Owner-only RLS policies & Revocation of direct INSERT privilege from authenticated
--   4. Stored Procedure: create_admin_invitation (Owner-only, NULL-safe, atomic superseding)
--   5. Stored Procedure: revoke_admin_invitation (Owner-only, NULL-safe, row-locked)
--   6. Stored Procedure: reserve_admin_invitation (Service-role only, atomic 5-min lease)
--   7. Stored Procedure: complete_invitation_acceptance (Service-role only, 6-invariant verified)
--   8. Explicit execution grants and privilege restrictions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADDITIVE COLUMNS ON public.admin_invitations
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_invitations 
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS revoked_by uuid NULL REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reserved_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS reservation_token uuid NULL,
  ADD COLUMN IF NOT EXISTS reserved_by_ip varchar(64) NULL,
  ADD COLUMN IF NOT EXISTS auth_user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS attempt_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error text NULL;

-- ----------------------------------------------------------------------------
-- 2. PARTIAL UNIQUE INDEX (ONE UNSETTLED INVITATION PER EMAIL)
-- ----------------------------------------------------------------------------
-- Guarantees that at most one invitation per email can exist in unsettled state
-- (i.e. neither accepted nor revoked/superseded). Expired invitations have revoked_at
-- set to expires_at upon replacement, safely vacating this index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unsettled_email
  ON public.admin_invitations (email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

-- ----------------------------------------------------------------------------
-- 3. TABLE PRIVILEGES HARDENING
-- ----------------------------------------------------------------------------
-- Revoke direct client INSERT from authenticated. All invitation creation must
-- proceed through the validated security-definer procedure create_admin_invitation().
REVOKE INSERT ON TABLE public.admin_invitations FROM authenticated;

-- Ensure authenticated can only SELECT invitations (subject to RLS)
GRANT SELECT ON TABLE public.admin_invitations TO authenticated;

-- ----------------------------------------------------------------------------
-- 4. HARDENED OWNER-ONLY RLS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "invitations_select_admin_owner" ON public.admin_invitations;
DROP POLICY IF EXISTS "invitations_insert_admin_owner" ON public.admin_invitations;
DROP POLICY IF EXISTS "invitations_select_owner_only" ON public.admin_invitations;

CREATE POLICY "invitations_select_owner_only"
  ON public.admin_invitations FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() = 'owner');

-- ----------------------------------------------------------------------------
-- 5. STORED PROCEDURE: create_admin_invitation
-- ----------------------------------------------------------------------------
-- Creates an invitation with NULL-safe caller checks, role verification,
-- row-locked superseding of prior invitations for the email, and audit logging.
CREATE OR REPLACE FUNCTION public.create_admin_invitation(
  p_email citext,
  p_role_id varchar,
  p_token_hash varchar,
  p_allow_resend boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role varchar;
  v_caller_active boolean;
  v_caller_email varchar;
  v_new_id uuid;
BEGIN
  -- Strict NULL-safe caller identity and authorization checks
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Valid authenticated session is required.';
  END IF;

  SELECT role_id, is_active, email INTO v_caller_role, v_caller_active, v_caller_email
  FROM public.admin_profiles WHERE id = v_caller_id;

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND: Caller administrative profile does not exist.';
  END IF;

  IF v_caller_active IS NOT TRUE THEN
    RAISE EXCEPTION 'PROFILE_INACTIVE: Caller administrator account has been deactivated.';
  END IF;

  IF v_caller_role <> 'owner' THEN
    RAISE EXCEPTION 'FORBIDDEN_OWNER_ONLY: Only active Business Owners may create invitations.';
  END IF;

  -- Input validation
  IF p_email IS NULL OR trim(p_email::text) = '' THEN
    RAISE EXCEPTION 'INVALID_ARGUMENTS: Email address cannot be empty.';
  END IF;

  IF p_role_id IS NULL OR p_role_id NOT IN ('admin', 'staff') THEN
    RAISE EXCEPTION 'INVALID_ARGUMENTS: Role must be admin or staff. Inviting owner is prohibited.';
  END IF;

  IF p_token_hash IS NULL OR length(p_token_hash) <> 64 OR p_token_hash !~ '^[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'INVALID_ARGUMENTS: Token hash must be a 64-character SHA-256 hex string.';
  END IF;

  -- Verify target email is not already an active administrator
  IF EXISTS (SELECT 1 FROM public.admin_profiles WHERE email = p_email AND is_active = true) THEN
    RAISE EXCEPTION 'ALREADY_REGISTERED: An active administrator with this email already exists.';
  END IF;

  -- Lock previous invitation records for this email to serialize concurrent creations
  PERFORM id FROM public.admin_invitations WHERE email = p_email FOR UPDATE;

  -- Check if an active unexpired pending invitation already exists
  IF EXISTS (
    SELECT 1 FROM public.admin_invitations 
    WHERE email = p_email AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now()
  ) THEN
    IF NOT p_allow_resend THEN
      RAISE EXCEPTION 'ACTIVE_INVITATION_EXISTS: An active invitation is already pending for this email.';
    ELSE
      -- Resend requested: Supercede existing active invitation (revoked_by is caller)
      UPDATE public.admin_invitations 
      SET revoked_at = now(), revoked_by = v_caller_id
      WHERE email = p_email AND accepted_at IS NULL AND revoked_at IS NULL;
    END IF;
  ELSE
    -- Old expired invitations: Stamp revoked_at = expires_at to clear partial index
    UPDATE public.admin_invitations 
    SET revoked_at = expires_at 
    WHERE email = p_email AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at <= now();
  END IF;

  -- Insert fresh invitation
  INSERT INTO public.admin_invitations (
    email, role_id, token_hash, invited_by, expires_at
  ) VALUES (
    p_email, p_role_id, lower(p_token_hash), v_caller_id, now() + interval '7 days'
  ) RETURNING id INTO v_new_id;

  -- Record compliance audit log using schema-permitted action 'INSERT'
  INSERT INTO public.audit_logs (
    actor_id, actor_email, action, entity_name, entity_id, new_values, created_at
  ) VALUES (
    v_caller_id, v_caller_email, 'INSERT', 'admin_invitations', v_new_id,
    jsonb_build_object('email', p_email, 'role_id', p_role_id, 'expires_at', now() + interval '7 days'),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'email', p_email,
    'role_id', p_role_id,
    'expires_at', now() + interval '7 days'
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. STORED PROCEDURE: revoke_admin_invitation
-- ----------------------------------------------------------------------------
-- Revokes an invitation with NULL-safe caller checks, exclusive row lock,
-- and defensive handling of all terminal/expired states.
CREATE OR REPLACE FUNCTION public.revoke_admin_invitation(p_invitation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role varchar;
  v_caller_active boolean;
  v_caller_email varchar;
  v_inv_record RECORD;
BEGIN
  -- Strict NULL-safe caller checks
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHENTICATED', 'message', 'Valid authenticated session is required.');
  END IF;

  SELECT role_id, is_active, email INTO v_caller_role, v_caller_active, v_caller_email
  FROM public.admin_profiles WHERE id = v_caller_id;

  IF v_caller_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND', 'message', 'Administrative profile does not exist.');
  END IF;

  IF v_caller_active IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROFILE_INACTIVE', 'message', 'Administrator account is deactivated.');
  END IF;

  IF v_caller_role <> 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'FORBIDDEN_OWNER_ONLY', 'message', 'Only Business Owners can revoke invitations.');
  END IF;

  IF p_invitation_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_ARGUMENTS', 'message', 'Invitation ID cannot be NULL.');
  END IF;

  -- Acquire exclusive row lock on target invitation
  SELECT id, email, role_id, accepted_at, revoked_at, expires_at
  INTO v_inv_record
  FROM public.admin_invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  IF v_inv_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Invitation record not found.');
  END IF;

  IF v_inv_record.accepted_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ALREADY_ACCEPTED', 'message', 'Cannot revoke an invitation that has already been accepted.');
  END IF;

  IF v_inv_record.revoked_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ALREADY_REVOKED', 'message', 'Invitation is already revoked.');
  END IF;

  IF v_inv_record.expires_at <= now() THEN
    -- Clear index slot by recording expired timestamp as revoked_at
    UPDATE public.admin_invitations
    SET revoked_at = v_inv_record.expires_at
    WHERE id = p_invitation_id;
    RETURN jsonb_build_object('success', false, 'error', 'ALREADY_EXPIRED', 'message', 'Invitation has already expired.');
  END IF;

  -- Stamp active revocation
  UPDATE public.admin_invitations
  SET revoked_at = now(), revoked_by = v_caller_id
  WHERE id = p_invitation_id;

  -- Record compliance audit log using schema-permitted action 'UPDATE'
  INSERT INTO public.audit_logs (
    actor_id, actor_email, action, entity_name, entity_id, new_values, created_at
  ) VALUES (
    v_caller_id, v_caller_email, 'UPDATE', 'admin_invitations', p_invitation_id,
    jsonb_build_object('status', 'revoked', 'revoked_at', now(), 'email', v_inv_record.email),
    now()
  );

  RETURN jsonb_build_object('success', true, 'message', 'Invitation successfully revoked.');
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. STORED PROCEDURE: reserve_admin_invitation (Service Role Only)
-- ----------------------------------------------------------------------------
-- Atomically acquires a 5-minute reservation lease on an unaccepted, unrevoked,
-- unexpired invitation. Binds the lease to a client-specific reservation nonce.
CREATE OR REPLACE FUNCTION public.reserve_admin_invitation(
  p_invitation_id uuid,
  p_token_hash varchar,
  p_reservation_nonce uuid,
  p_ip_address varchar DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_record RECORD;
BEGIN
  IF p_invitation_id IS NULL OR p_token_hash IS NULL OR p_reservation_nonce IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_ARGUMENTS');
  END IF;

  UPDATE public.admin_invitations
  SET reserved_at = now(),
      reservation_token = p_reservation_nonce,
      reserved_by_ip = p_ip_address,
      attempt_count = attempt_count + 1
  WHERE id = p_invitation_id
    AND token_hash = lower(p_token_hash)
    AND accepted_at IS NULL
    AND revoked_at IS NULL
    AND expires_at > now()
    AND (reserved_at IS NULL OR reserved_at < now() - interval '5 minutes')
  RETURNING id, email, role_id INTO v_record;

  IF v_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_FAILED');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_record.id,
    'email', v_record.email,
    'role_id', v_record.role_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. STORED PROCEDURE: complete_invitation_acceptance (Service Role Only)
-- ----------------------------------------------------------------------------
-- Atomically finalizes invitation acceptance under an exclusive row lock.
-- Re-verifies all 6 invariants:
--   1. Record exists
--   2. accepted_at IS NULL
--   3. revoked_at IS NULL
--   4. expires_at > now()
--   5. reservation_token matches p_reservation_nonce
--   6. reserved_at >= now() - interval '5 minutes'
-- Inserts public.admin_profiles and writes compliance audit log with 'ROLE_CHANGE'.
CREATE OR REPLACE FUNCTION public.complete_invitation_acceptance(
  p_invitation_id uuid,
  p_reservation_nonce uuid,
  p_user_id uuid,
  p_full_name varchar,
  p_ip_address varchar DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inv RECORD;
  v_role_id varchar;
  v_email citext;
BEGIN
  -- 1. Input parameter validation
  IF p_invitation_id IS NULL OR p_reservation_nonce IS NULL OR p_user_id IS NULL OR p_full_name IS NULL THEN
    RAISE EXCEPTION 'INVALID_ARGUMENTS: Required parameters cannot be NULL.';
  END IF;

  IF trim(p_full_name) = '' THEN
    RAISE EXCEPTION 'INVALID_ARGUMENTS: Full name cannot be empty.';
  END IF;

  -- 2. Acquire exclusive row lock on the invitation
  SELECT id, email, role_id, expires_at, accepted_at, revoked_at, reserved_at, reservation_token
  INTO v_inv
  FROM public.admin_invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  -- 3. Verify INVARIANT 1: Record exists
  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'INVITATION_NOT_FOUND: Invitation record does not exist.';
  END IF;

  -- 4. Verify INVARIANT 2: Not already accepted
  IF v_inv.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'ALREADY_ACCEPTED: Invitation has already been accepted.';
  END IF;

  -- 5. Verify INVARIANT 3: Not revoked (Owner revoked while Auth was in-flight)
  IF v_inv.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'INVITATION_REVOKED: Invitation was revoked by an administrator.';
  END IF;

  -- 6. Verify INVARIANT 4: Not expired by wall-clock time
  IF v_inv.expires_at <= now() THEN
    RAISE EXCEPTION 'INVITATION_EXPIRED: Invitation has expired.';
  END IF;

  -- 7. Verify INVARIANT 5: Reservation nonce matches exactly
  IF v_inv.reservation_token IS NULL OR v_inv.reservation_token <> p_reservation_nonce THEN
    RAISE EXCEPTION 'RESERVATION_NONCE_MISMATCH: Invalid or superseded reservation lease.';
  END IF;

  -- 8. Verify INVARIANT 6: Reservation lease remains valid (under 5 minutes)
  IF v_inv.reserved_at IS NULL OR v_inv.reserved_at < now() - interval '5 minutes' THEN
    RAISE EXCEPTION 'RESERVATION_LEASE_EXPIRED: The 5-minute reservation lease has expired.';
  END IF;

  -- 9. Check for duplicate profile
  IF EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = p_user_id OR email = v_inv.email) THEN
    RAISE EXCEPTION 'PROFILE_ALREADY_EXISTS: An administrator profile already exists for this identity or email.';
  END IF;

  -- 10. Execute atomic state transition
  UPDATE public.admin_invitations
  SET accepted_at = now(),
      reserved_at = NULL,
      reservation_token = NULL,
      auth_user_id = p_user_id
  WHERE id = p_invitation_id;

  -- 11. Insert admin profile with immutable invited role
  INSERT INTO public.admin_profiles (
    id, email, full_name, role_id, is_active, created_at, updated_at
  ) VALUES (
    p_user_id, v_inv.email, trim(p_full_name), v_inv.role_id, true, now(), now()
  );

  -- 12. Write compliance audit log using schema-permitted action 'ROLE_CHANGE'
  INSERT INTO public.audit_logs (
    actor_id, actor_email, action, entity_name, entity_id, new_values, ip_address, user_agent, created_at
  ) VALUES (
    p_user_id, v_inv.email::varchar, 'ROLE_CHANGE', 'admin_profiles', p_user_id,
    jsonb_build_object('role_id', v_inv.role_id, 'invitation_id', p_invitation_id),
    p_ip_address, p_user_agent, now()
  );

  RETURN jsonb_build_object('success', true, 'role_id', v_inv.role_id, 'email', v_inv.email);
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. FUNCTION EXECUTION GRANTS & REVOCATIONS
-- ----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.create_admin_invitation(citext, varchar, varchar, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_admin_invitation(citext, varchar, varchar, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_admin_invitation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_admin_invitation(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.reserve_admin_invitation(uuid, varchar, uuid, varchar) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_admin_invitation(uuid, varchar, uuid, varchar) TO service_role;

REVOKE ALL ON FUNCTION public.complete_invitation_acceptance(uuid, uuid, uuid, varchar, varchar, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_invitation_acceptance(uuid, uuid, uuid, varchar, varchar, text) TO service_role;
