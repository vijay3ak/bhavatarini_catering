-- ============================================================================
-- Bhavatarini Catering Service — Test Mode Cleanup Support (V1)
-- Migration: 20261110000004_v1_billing_test_mode_bypass.sql
-- Description: Allow automated test suites to clean up synthetic fixtures when
--              bcs.test_mode session variable is explicitly set to 'enabled'.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow automated test suite cleanup when session variable is explicitly enabled
  IF current_setting('bcs.test_mode', true) = 'enabled' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- 1. DELETE restriction: ISSUED and CANCELLED invoices can never be deleted
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('ISSUED', 'CANCELLED') THEN
      RAISE EXCEPTION 'Issued or cancelled invoices (Invoice %) cannot be deleted from the system.', OLD.invoice_number;
    END IF;
    RETURN OLD;
  END IF;

  -- 2. UPDATE restriction
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'CANCELLED' AND NEW.status <> 'CANCELLED' THEN
      RAISE EXCEPTION 'Cancelled invoices cannot be reopened or transitioned to any other status.';
    END IF;
    
    IF OLD.status = 'ISSUED' AND NEW.status = 'DRAFT' THEN
      RAISE EXCEPTION 'Issued invoices cannot be reverted to draft status.';
    END IF;

    IF OLD.status IN ('ISSUED', 'CANCELLED') THEN
      IF NEW.customer_id IS DISTINCT FROM OLD.customer_id
         OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
         OR NEW.billing_month IS DISTINCT FROM OLD.billing_month
         OR NEW.billing_year IS DISTINCT FROM OLD.billing_year
         OR NEW.period_start_date IS DISTINCT FROM OLD.period_start_date
         OR NEW.period_end_date IS DISTINCT FROM OLD.period_end_date
         OR NEW.invoice_date IS DISTINCT FROM OLD.invoice_date
         OR NEW.rate IS DISTINCT FROM OLD.rate
         OR NEW.total_bill_qty IS DISTINCT FROM OLD.total_bill_qty
         OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
         OR NEW.customer_snapshot IS DISTINCT FROM OLD.customer_snapshot
         OR NEW.supplier_snapshot IS DISTINCT FROM OLD.supplier_snapshot
         OR NEW.created_by IS DISTINCT FROM OLD.created_by
         OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Core financial details and historical snapshots of an issued invoice are strictly immutable.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

CREATE OR REPLACE FUNCTION public.enforce_invoice_daily_entries_immutability()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_status varchar;
BEGIN
  IF current_setting('bcs.test_mode', true) = 'enabled' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT status INTO v_parent_status
  FROM public.invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  IF v_parent_status IN ('ISSUED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Daily entries belonging to an issued or cancelled invoice cannot be created, updated, or removed.';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

CREATE OR REPLACE FUNCTION public.recalculate_invoice_payments()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id uuid;
  v_total_amount numeric(12,2);
  v_total_paid numeric(12,2);
  v_balance numeric(12,2);
  v_status varchar;
  v_inv_status varchar;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  IF current_setting('bcs.test_mode', true) = 'enabled' AND TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  SELECT total_amount, status INTO v_total_amount, v_inv_status
  FROM public.invoices
  WHERE id = v_invoice_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    IF current_setting('bcs.test_mode', true) = 'enabled' THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
    RAISE EXCEPTION 'Parent invoice % not found for payment recalculation.', v_invoice_id;
  END IF;
  
  IF v_inv_status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Payments cannot be recorded, updated, or removed for cancelled invoices.';
  END IF;
  
  SELECT COALESCE(SUM(amount), 0.00)
  INTO v_total_paid
  FROM public.invoice_payments
  WHERE invoice_id = v_invoice_id;
  
  IF v_total_paid > v_total_amount THEN
    RAISE EXCEPTION 'Total payments (₹%) cannot exceed total invoice amount (₹%).', v_total_paid, v_total_amount;
  END IF;
  
  v_balance := v_total_amount - v_total_paid;
  
  IF v_total_paid = 0 THEN
    v_status := 'UNPAID';
  ELSIF v_total_paid < v_total_amount THEN
    v_status := 'PARTIALLY_PAID';
  ELSE
    v_status := 'PAID';
  END IF;
  
  UPDATE public.invoices
  SET
    total_paid = v_total_paid,
    outstanding_balance = v_balance,
    payment_status = v_status,
    updated_at = pg_catalog.now()
  WHERE id = v_invoice_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;
