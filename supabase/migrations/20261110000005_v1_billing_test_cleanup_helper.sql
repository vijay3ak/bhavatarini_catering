-- ============================================================================
-- Bhavatarini Catering Service — Billing Integration Test Cleanup Helper (V1)
-- Migration: 20261110000005_v1_billing_test_cleanup_helper.sql
-- Description: Transaction-safe helper to purge synthetic test invoices and child records.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_test_invoice(p_invoice_id uuid)
RETURNS boolean AS $$
BEGIN
  PERFORM set_config('bcs.test_mode', 'enabled', true);
  DELETE FROM public.invoice_payments WHERE invoice_id = p_invoice_id;
  DELETE FROM public.invoice_daily_entries WHERE invoice_id = p_invoice_id;
  DELETE FROM public.invoices WHERE id = p_invoice_id;
  PERFORM set_config('bcs.test_mode', 'disabled', true);
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

REVOKE ALL ON FUNCTION public.cleanup_test_invoice(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cleanup_test_invoice(uuid) TO postgres, service_role;
