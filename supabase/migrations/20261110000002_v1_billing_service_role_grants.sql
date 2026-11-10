-- ============================================================================
-- Bhavatarini Catering Service — Billing & Invoicing Service Role Grants (V1)
-- Migration: 20261110000002_v1_billing_service_role_grants.sql
-- Description: Explicitly grant standard table access to postgres and service_role
--              for backend operations, integration test scripts, and background workers.
-- ============================================================================

GRANT ALL ON public.invoices TO postgres, service_role;
GRANT ALL ON public.invoice_daily_entries TO postgres, service_role;
GRANT ALL ON public.invoice_payments TO postgres, service_role;
