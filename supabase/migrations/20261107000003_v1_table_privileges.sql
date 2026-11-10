-- =============================================================================
-- Migration: 20261107000003_v1_table_privileges.sql
-- Project: Bhavatarini Catering Service (bhavatarini-dev: tfmlkppomlbkyoerovgj)
-- Purpose:
--   1. Explicitly revoke all existing table privileges (including default inherited
--      Dxtm privileges) from PUBLIC, anon, authenticated, and service_role on the
--      14 verified application tables.
--   2. Completely strip TRUNCATE (D), REFERENCES (x), TRIGGER (t), and MAINTAIN (m)
--      from both authenticated and service_role on these 14 tables.
--   3. Apply least-privilege DML grants to authenticated matching V1 RLS policies.
--   4. Keep public.admin_roles and public.notification_outbox strictly inaccessible
--      to authenticated (0 grants).
--   5. Grant explicit operational DML privileges (SELECT, INSERT, UPDATE, DELETE)
--      to service_role across all 14 tables, plus USAGE, SELECT on
--      public.enquiry_number_seq.
--
-- Scope Note:
--   This migration adjusts explicit Access Control Lists (relacl) on the 14
--   existing operational tables. It cleans up ACLs on the explicitly listed
--   tables and does not alter PostgreSQL schema default privileges
--   (ALTER DEFAULT PRIVILEGES) for future tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: Explicit Table Privilege Revocation
-- Revokes existing table-level privileges from PUBLIC, anon, authenticated, and
-- service_role on the 14 explicitly listed application tables.
-- -----------------------------------------------------------------------------
REVOKE ALL ON TABLE
    public.admin_roles,
    public.admin_profiles,
    public.admin_invitations,
    public.customers,
    public.customer_contacts,
    public.customer_addresses,
    public.enquiries,
    public.enquiry_notes,
    public.enquiry_status_history,
    public.business_settings,
    public.business_operations,
    public.notification_settings,
    public.audit_logs,
    public.notification_outbox
FROM PUBLIC, anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- SECTION 2: Least-Privilege DML Grants for authenticated Role
-- Grants only standard operational DML privileges required by RLS policies.
-- (TRUNCATE, REFERENCES, TRIGGER, and MAINTAIN remain entirely revoked).
-- -----------------------------------------------------------------------------

-- Note: public.admin_roles has ZERO grants to authenticated.
-- (Role definitions are mapped statically in frontend code; table is strictly shielded).

-- Admin identity and staff management
GRANT SELECT, UPDATE ON TABLE public.admin_profiles TO authenticated;
GRANT SELECT, INSERT ON TABLE public.admin_invitations TO authenticated;

-- Customer CRM records
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public.customers,
    public.customer_contacts,
    public.customer_addresses
TO authenticated;

-- Operational enquiries, notes, and status audit trail
GRANT SELECT, UPDATE, DELETE ON TABLE public.enquiries TO authenticated;
GRANT SELECT, INSERT ON TABLE public.enquiry_notes TO authenticated;
GRANT SELECT, INSERT ON TABLE public.enquiry_status_history TO authenticated;

-- Business configuration and notification settings
GRANT SELECT, UPDATE ON TABLE
    public.business_settings,
    public.business_operations,
    public.notification_settings
TO authenticated;

-- Compliance audit logs (read-only inspection for authorized admins)
GRANT SELECT ON TABLE public.audit_logs TO authenticated;

-- Note: public.notification_outbox has ZERO grants to authenticated.
-- (Internal transactional messaging queue processed exclusively by service_role).

-- -----------------------------------------------------------------------------
-- SECTION 3: Explicit DML Grants for service_role
-- Grants least-privilege operational DML access to backend server handlers.
-- (TRUNCATE, REFERENCES, TRIGGER, and MAINTAIN remain entirely revoked).
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public.admin_roles,
    public.admin_profiles,
    public.admin_invitations,
    public.customers,
    public.customer_contacts,
    public.customer_addresses,
    public.enquiries,
    public.enquiry_notes,
    public.enquiry_status_history,
    public.business_settings,
    public.business_operations,
    public.notification_settings,
    public.audit_logs,
    public.notification_outbox
TO service_role;

GRANT USAGE, SELECT ON SEQUENCE public.enquiry_number_seq TO service_role;
