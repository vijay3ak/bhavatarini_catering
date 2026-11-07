-- ============================================================================
-- Bhavatarini Catering Service — Version 1 RLS & Access Policies
-- Migration: 20261107000002_v1_rls_policies.sql
-- Description: Strict Row Level Security policies enforcing Owner, Admin,
--              and Staff role separation, and zero anonymous database access.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTION (SEARCH PATH HARDENED)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS varchar AS $$
  SELECT role_id 
  FROM public.admin_profiles
  WHERE id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, pg_temp;

-- ----------------------------------------------------------------------------
-- 2. OWNER ANTI-LOCKOUT TRIGGER (SEARCH PATH HARDENED)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_sole_owner_lockout()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role_id = 'owner' AND (NEW.role_id <> 'owner' OR NEW.is_active = false) THEN
    IF (SELECT count(*) FROM public.admin_profiles WHERE role_id = 'owner' AND is_active = true) <= 1 THEN
      RAISE EXCEPTION 'Cannot demote or deactivate the sole remaining active Owner account.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_sole_owner_lockout
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sole_owner_lockout();

-- ----------------------------------------------------------------------------
-- 3. STAFF ENQUIRY UPDATE ROLE ENFORCEMENT TRIGGER (NULL-SAFE)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_enquiry_update_roles()
RETURNS TRIGGER AS $$
DECLARE
  caller_role varchar;
BEGIN
  -- Immutable identity integrity: enquiry_number, id, and created_at cannot be changed by anyone
  IF NEW.id IS DISTINCT FROM OLD.id 
     OR NEW.enquiry_number IS DISTINCT FROM OLD.enquiry_number 
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Enquiry primary key, enquiry number, and creation timestamp are immutable.';
  END IF;

  caller_role := public.get_current_admin_role();

  -- Staff role is strictly restricted to updating enquiry status and updated_at only
  IF caller_role = 'staff' THEN
    IF NEW.name IS DISTINCT FROM OLD.name
       OR NEW.phone IS DISTINCT FROM OLD.phone
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.organisation IS DISTINCT FROM OLD.organisation
       OR NEW.requirement_type IS DISTINCT FROM OLD.requirement_type
       OR NEW.food_preference IS DISTINCT FROM OLD.food_preference
       OR NEW.quantity_range IS DISTINCT FROM OLD.quantity_range
       OR NEW.event_date IS DISTINCT FROM OLD.event_date
       OR NEW.location IS DISTINCT FROM OLD.location
       OR NEW.details IS DISTINCT FROM OLD.details
       OR NEW.whatsapp_initiated IS DISTINCT FROM OLD.whatsapp_initiated
       OR NEW.converted_customer_id IS DISTINCT FROM OLD.converted_customer_id
       OR NEW.ip_hash IS DISTINCT FROM OLD.ip_hash
       OR NEW.user_agent IS DISTINCT FROM OLD.user_agent THEN
      RAISE EXCEPTION 'Permission denied: Staff role is permitted to update enquiry status only.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

CREATE TRIGGER trg_enforce_enquiry_update_roles
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_enquiry_update_roles();

-- ----------------------------------------------------------------------------
-- 4. ENABLE RLS ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5. REVOKE ANONYMOUS ACCESS (ZERO ANON ACCESS TO OPERATIONAL DATA)
-- ----------------------------------------------------------------------------
REVOKE ALL ON public.admin_roles FROM anon;
REVOKE ALL ON public.admin_profiles FROM anon;
REVOKE ALL ON public.admin_invitations FROM anon;
REVOKE ALL ON public.enquiries FROM anon;
REVOKE ALL ON public.enquiry_notes FROM anon;
REVOKE ALL ON public.enquiry_status_history FROM anon;
REVOKE ALL ON public.notification_outbox FROM anon;
REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.customer_contacts FROM anon;
REVOKE ALL ON public.customer_addresses FROM anon;
REVOKE ALL ON public.business_settings FROM anon;
REVOKE ALL ON public.business_operations FROM anon;
REVOKE ALL ON public.notification_settings FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;

-- Function execution privilege hardening
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Explicitly grant execute only on required helper and trigger functions to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.get_current_admin_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prevent_sole_owner_lockout() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.enforce_enquiry_update_roles() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_enquiry_number() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_enquiry_notification() TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6. ADMIN PROFILES POLICIES (RECURSION-SAFE)
-- ----------------------------------------------------------------------------
-- Users can always read their own profile row directly via id = auth.uid(),
-- preventing recursive evaluation of get_current_admin_role().
CREATE POLICY "profiles_select_self_or_admin"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    public.get_current_admin_role() IN ('owner', 'admin')
  );

CREATE POLICY "profiles_update_self_or_owner"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.get_current_admin_role() = 'owner')
  WITH CHECK (
    -- Only an active Owner can change role_id or is_active
    (public.get_current_admin_role() = 'owner') OR
    (id = auth.uid() AND role_id = (SELECT role_id FROM public.admin_profiles WHERE id = auth.uid()) AND is_active = true)
  );

-- ----------------------------------------------------------------------------
-- 7. ADMIN INVITATIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "invitations_select_admin_owner"
  ON public.admin_invitations FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "invitations_insert_admin_owner"
  ON public.admin_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    invited_by = auth.uid() AND
    public.get_current_admin_role() IN ('owner', 'admin') AND
    role_id <> 'owner'
  );

-- ----------------------------------------------------------------------------
-- 8. ENQUIRIES & NOTES POLICIES (STAFF UPDATE RESTRICTED VIA TRIGGER)
-- ----------------------------------------------------------------------------
CREATE POLICY "enquiries_select_active_admin"
  ON public.enquiries FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

-- Admin and Owner can perform updates on enquiries (governed by trg_enforce_enquiry_update_roles)
CREATE POLICY "enquiries_update_admin_owner"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

-- Staff update permitted on status (column restrictions enforced by trg_enforce_enquiry_update_roles)
CREATE POLICY "enquiries_update_staff"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() = 'staff')
  WITH CHECK (public.get_current_admin_role() = 'staff');

CREATE POLICY "enquiries_delete_owner_only"
  ON public.enquiries FOR DELETE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner');

-- Enquiry notes
CREATE POLICY "notes_select_active_admin"
  ON public.enquiry_notes FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "notes_insert_active_admin"
  ON public.enquiry_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    public.get_current_admin_role() IN ('owner', 'admin', 'staff')
  );

-- Status history
CREATE POLICY "history_select_active_admin"
  ON public.enquiry_status_history FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "history_insert_active_admin"
  ON public.enquiry_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    changed_by = auth.uid() AND
    public.get_current_admin_role() IN ('owner', 'admin', 'staff')
  );

-- ----------------------------------------------------------------------------
-- 9. CUSTOMERS MASTER POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "customers_select_active_admin"
  ON public.customers FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "customers_write_admin_owner"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "customers_update_admin_owner"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "customers_delete_owner_only"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner');

-- Customer contacts & addresses
CREATE POLICY "cust_contacts_select_active_admin"
  ON public.customer_contacts FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "cust_contacts_write_admin_owner"
  ON public.customer_contacts FOR ALL
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "cust_addresses_select_active_admin"
  ON public.customer_addresses FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "cust_addresses_write_admin_owner"
  ON public.customer_addresses FOR ALL
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

-- ----------------------------------------------------------------------------
-- 10. BUSINESS SETTINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "settings_select_active_admin"
  ON public.business_settings FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "settings_update_owner_only"
  ON public.business_settings FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner')
  WITH CHECK (public.get_current_admin_role() = 'owner');

CREATE POLICY "operations_select_active_admin"
  ON public.business_operations FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "operations_update_admin_owner"
  ON public.business_operations FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'))
  WITH CHECK (public.get_current_admin_role() IN ('owner', 'admin'));

CREATE POLICY "notifications_select_active_admin"
  ON public.notification_settings FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin', 'staff'));

CREATE POLICY "notifications_update_owner_only"
  ON public.notification_settings FOR UPDATE
  TO authenticated
  USING (public.get_current_admin_role() = 'owner')
  WITH CHECK (public.get_current_admin_role() = 'owner');

-- ----------------------------------------------------------------------------
-- 11. COMPLIANCE AUDIT LOGS (IMMUTABLE JOURNAL)
-- ----------------------------------------------------------------------------
CREATE POLICY "audit_select_admin_owner"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.get_current_admin_role() IN ('owner', 'admin'));

-- Direct client inserts, updates, and deletes are strictly prohibited
CREATE POLICY "audit_no_direct_mutation"
  ON public.audit_logs FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "audit_no_direct_delete"
  ON public.audit_logs FOR DELETE
  TO authenticated
  USING (false);
