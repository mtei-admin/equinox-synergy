-- Phase 9: WMS inbound/outbound process flow schema
-- Maps purchasing (inbound) and ordering/delivery (outbound) diagrams.
-- See docs/PHASE9_SCHEMA.md for step-by-step table mapping.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.purchase_request_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected',
  'converted',
  'cancelled'
);

CREATE TYPE public.supplier_order_status AS ENUM (
  'draft',
  'sent',
  'partially_received',
  'received',
  'cancelled'
);

CREATE TYPE public.inbound_shipment_status AS ENUM (
  'scheduled',
  'in_transit',
  'arrived',
  'cancelled'
);

CREATE TYPE public.goods_receipt_status AS ENUM (
  'draft',
  'validated',
  'posted',
  'exception',
  'cancelled'
);

CREATE TYPE public.receipt_line_condition AS ENUM (
  'ok',
  'damaged',
  'short',
  'wrong_item',
  'other'
);

CREATE TYPE public.receipt_exception_type AS ENUM (
  'damage',
  'short_ship',
  'over_ship',
  'wrong_item',
  'quality',
  'other'
);

CREATE TYPE public.exception_resolution_status AS ENUM (
  'open',
  'supplier_claim',
  'return_pending',
  'replacement_pending',
  'resolved',
  'written_off'
);

CREATE TYPE public.inventory_txn_type AS ENUM (
  'receive',
  'ship',
  'reserve',
  'release',
  'adjust',
  'return_in',
  'return_out'
);

CREATE TYPE public.inventory_unit_status AS ENUM (
  'available',
  'reserved',
  'picked',
  'shipped',
  'quarantined',
  'scrapped'
);

CREATE TYPE public.sales_invoice_status AS ENUM (
  'draft',
  'issued',
  'paid',
  'void'
);

CREATE TYPE public.delivery_receipt_status AS ENUM (
  'draft',
  'authorized',
  'picking',
  'picked',
  'loaded',
  'dispatched',
  'delivered',
  'cancelled'
);

CREATE TYPE public.pick_list_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE public.outbound_shipment_status AS ENUM (
  'scheduled',
  'loaded',
  'in_transit',
  'delivered',
  'cancelled'
);

CREATE TYPE public.inventory_reference_type AS ENUM (
  'goods_receipt',
  'supplier_purchase_order',
  'purchase_order',
  'delivery_receipt',
  'pick_list',
  'manual_adjustment',
  'receipt_exception'
);

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_document_number(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  suffix TEXT := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 6));
BEGIN
  RETURN prefix || '-' || date_part || '-' || suffix;
END;
$$;

-- Sync products.stock_quantity after ledger writes.
CREATE OR REPLACE FUNCTION public.sync_product_stock_from_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = GREATEST(
    0,
    (
      SELECT COALESCE(SUM(it.quantity_delta), 0)::INTEGER
      FROM public.inventory_transactions it
      WHERE it.product_id = NEW.product_id
    )
  )
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Inbound: suppliers & purchase requests (diagram steps 1–2)
-- ---------------------------------------------------------------------------

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER suppliers_set_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number TEXT NOT NULL UNIQUE,
  requested_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  status public.purchase_request_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  approved_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER purchase_requests_set_updated_at
  BEFORE UPDATE ON public.purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.purchase_request_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_request_id UUID NOT NULL REFERENCES public.purchase_requests (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (purchase_request_id, product_id)
);

CREATE TABLE public.supplier_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spo_number TEXT NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id) ON DELETE RESTRICT,
  purchase_request_id UUID REFERENCES public.purchase_requests (id) ON DELETE SET NULL,
  status public.supplier_order_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  expected_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER supplier_purchase_orders_set_updated_at
  BEFORE UPDATE ON public.supplier_purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.supplier_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_purchase_order_id UUID NOT NULL REFERENCES public.supplier_purchase_orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantity_received INTEGER NOT NULL DEFAULT 0 CHECK (quantity_received >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (supplier_purchase_order_id, product_id)
);

-- ---------------------------------------------------------------------------
-- Inbound: logistics & receiving (diagram steps 3–8)
-- ---------------------------------------------------------------------------

CREATE TABLE public.inbound_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_purchase_order_id UUID NOT NULL REFERENCES public.supplier_purchase_orders (id) ON DELETE RESTRICT,
  status public.inbound_shipment_status NOT NULL DEFAULT 'scheduled',
  carrier TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  expected_arrival_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER inbound_shipments_set_updated_at
  BEFORE UPDATE ON public.inbound_shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL UNIQUE,
  supplier_purchase_order_id UUID NOT NULL REFERENCES public.supplier_purchase_orders (id) ON DELETE RESTRICT,
  inbound_shipment_id UUID REFERENCES public.inbound_shipments (id) ON DELETE SET NULL,
  status public.goods_receipt_status NOT NULL DEFAULT 'draft',
  received_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  received_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER goods_receipts_set_updated_at
  BEFORE UPDATE ON public.goods_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.goods_receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts (id) ON DELETE CASCADE,
  supplier_order_line_id UUID REFERENCES public.supplier_order_lines (id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity_received INTEGER NOT NULL CHECK (quantity_received >= 0),
  quantity_accepted INTEGER NOT NULL DEFAULT 0 CHECK (quantity_accepted >= 0),
  quantity_rejected INTEGER NOT NULL DEFAULT 0 CHECK (quantity_rejected >= 0),
  condition public.receipt_line_condition NOT NULL DEFAULT 'ok',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (quantity_accepted + quantity_rejected <= quantity_received)
);

CREATE TABLE public.receipt_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_line_id UUID NOT NULL REFERENCES public.goods_receipt_lines (id) ON DELETE CASCADE,
  exception_type public.receipt_exception_type NOT NULL,
  resolution_status public.exception_resolution_status NOT NULL DEFAULT 'open',
  quantity_affected INTEGER NOT NULL CHECK (quantity_affected > 0),
  notes TEXT,
  resolved_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER receipt_exceptions_set_updated_at
  BEFORE UPDATE ON public.receipt_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Inventory ledger & unit tracking (diagram step 9 / center node)
-- ---------------------------------------------------------------------------

CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  inventory_unit_id UUID,
  txn_type public.inventory_txn_type NOT NULL,
  quantity_delta INTEGER NOT NULL,
  reference_type public.inventory_reference_type,
  reference_id UUID,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX inventory_transactions_product_id_idx
  ON public.inventory_transactions (product_id);

CREATE INDEX inventory_transactions_reference_idx
  ON public.inventory_transactions (reference_type, reference_id);

CREATE TRIGGER inventory_transactions_sync_stock
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_product_stock_from_ledger();

CREATE TABLE public.inventory_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  serial_number TEXT NOT NULL,
  model TEXT,
  status public.inventory_unit_status NOT NULL DEFAULT 'available',
  goods_receipt_line_id UUID REFERENCES public.goods_receipt_lines (id) ON DELETE SET NULL,
  order_item_id UUID REFERENCES public.order_items (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (serial_number)
);

CREATE TRIGGER inventory_units_set_updated_at
  BEFORE UPDATE ON public.inventory_units
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.inventory_transactions
  ADD CONSTRAINT inventory_transactions_unit_fkey
  FOREIGN KEY (inventory_unit_id) REFERENCES public.inventory_units (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Outbound: invoice, DR, picking, delivery (diagram steps 3–8)
-- ---------------------------------------------------------------------------

CREATE TABLE public.sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders (id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status public.sales_invoice_status NOT NULL DEFAULT 'draft',
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sales_invoices_set_updated_at
  BEFORE UPDATE ON public.sales_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.delivery_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders (id) ON DELETE RESTRICT,
  dr_number TEXT NOT NULL UNIQUE,
  status public.delivery_receipt_status NOT NULL DEFAULT 'draft',
  authorized_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  authorized_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER delivery_receipts_set_updated_at
  BEFORE UPDATE ON public.delivery_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.pick_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_receipt_id UUID NOT NULL REFERENCES public.delivery_receipts (id) ON DELETE CASCADE,
  status public.pick_list_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER pick_lists_set_updated_at
  BEFORE UPDATE ON public.pick_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.pick_list_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pick_list_id UUID NOT NULL REFERENCES public.pick_lists (id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items (id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
  quantity_picked INTEGER NOT NULL DEFAULT 0 CHECK (quantity_picked >= 0),
  inventory_unit_id UUID REFERENCES public.inventory_units (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pick_list_id, order_item_id)
);

CREATE TABLE public.outbound_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_receipt_id UUID NOT NULL REFERENCES public.delivery_receipts (id) ON DELETE RESTRICT,
  status public.outbound_shipment_status NOT NULL DEFAULT 'scheduled',
  trucker_name TEXT,
  vehicle_plate TEXT,
  driver_phone TEXT,
  route_notes TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER outbound_shipments_set_updated_at
  BEFORE UPDATE ON public.outbound_shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.proof_of_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_shipment_id UUID NOT NULL REFERENCES public.outbound_shipments (id) ON DELETE CASCADE,
  signed_by TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_storage_path TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Posting functions (inventory events)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.post_goods_receipt(p_receipt_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_receipt public.goods_receipts%ROWTYPE;
  v_line RECORD;
BEGIN
  IF NOT public.is_employee() THEN
    RAISE EXCEPTION 'Only employees can post goods receipts';
  END IF;

  SELECT * INTO v_receipt
  FROM public.goods_receipts
  WHERE id = p_receipt_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goods receipt not found';
  END IF;

  IF v_receipt.status = 'posted' THEN
    RETURN;
  END IF;

  IF v_receipt.status NOT IN ('validated', 'draft') THEN
    RAISE EXCEPTION 'Goods receipt cannot be posted from status %', v_receipt.status;
  END IF;

  FOR v_line IN
    SELECT *
    FROM public.goods_receipt_lines
    WHERE goods_receipt_id = p_receipt_id
      AND quantity_accepted > 0
  LOOP
    INSERT INTO public.inventory_transactions (
      product_id,
      txn_type,
      quantity_delta,
      reference_type,
      reference_id,
      created_by,
      notes
    )
    VALUES (
      v_line.product_id,
      'receive',
      v_line.quantity_accepted,
      'goods_receipt',
      p_receipt_id,
      auth.uid(),
      'Posted from goods receipt ' || v_receipt.receipt_number
    );

    IF v_line.supplier_order_line_id IS NOT NULL THEN
      UPDATE public.supplier_order_lines
      SET quantity_received = quantity_received + v_line.quantity_accepted
      WHERE id = v_line.supplier_order_line_id;
    END IF;
  END LOOP;

  UPDATE public.supplier_purchase_orders spo
  SET status = CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.supplier_order_lines sol
      WHERE sol.supplier_purchase_order_id = spo.id
        AND sol.quantity_received < sol.quantity_ordered
    ) THEN 'partially_received'::public.supplier_order_status
    ELSE 'received'::public.supplier_order_status
  END
  WHERE spo.id = v_receipt.supplier_purchase_order_id;

  UPDATE public.goods_receipts
  SET
    status = 'posted',
    posted_at = NOW(),
    received_at = COALESCE(received_at, NOW())
  WHERE id = p_receipt_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.post_pick_list(p_pick_list_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pick public.pick_lists%ROWTYPE;
  v_line RECORD;
  v_dr public.delivery_receipts%ROWTYPE;
BEGIN
  IF NOT public.is_employee() THEN
    RAISE EXCEPTION 'Only employees can post pick lists';
  END IF;

  SELECT * INTO v_pick
  FROM public.pick_lists
  WHERE id = p_pick_list_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pick list not found';
  END IF;

  IF v_pick.posted_at IS NOT NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_dr
  FROM public.delivery_receipts
  WHERE id = v_pick.delivery_receipt_id;

  FOR v_line IN
    SELECT *
    FROM public.pick_list_lines
    WHERE pick_list_id = p_pick_list_id
      AND quantity_picked > 0
  LOOP
    INSERT INTO public.inventory_transactions (
      product_id,
      inventory_unit_id,
      txn_type,
      quantity_delta,
      reference_type,
      reference_id,
      created_by,
      notes
    )
    VALUES (
      v_line.product_id,
      v_line.inventory_unit_id,
      'ship',
      -v_line.quantity_picked,
      'pick_list',
      p_pick_list_id,
      auth.uid(),
      'Shipped via pick list for DR ' || v_dr.dr_number
    );

    IF v_line.inventory_unit_id IS NOT NULL THEN
      UPDATE public.inventory_units
      SET
        status = 'shipped',
        order_item_id = v_line.order_item_id
      WHERE id = v_line.inventory_unit_id;
    END IF;
  END LOOP;

  UPDATE public.pick_lists
  SET
    status = 'completed',
    completed_at = COALESCE(completed_at, NOW()),
    posted_at = NOW()
  WHERE id = p_pick_list_id;
END;
$$;

-- Seed opening balances for existing stock as adjustment transactions.
INSERT INTO public.inventory_transactions (
  product_id,
  txn_type,
  quantity_delta,
  reference_type,
  notes
)
SELECT
  p.id,
  'adjust',
  p.stock_quantity,
  'manual_adjustment',
  'Phase 9 opening balance migration'
FROM public.products p
WHERE p.stock_quantity > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.inventory_transactions it
    WHERE it.product_id = p.id
  );

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_list_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_deliveries ENABLE ROW LEVEL SECURITY;

-- Inbound: employees only
CREATE POLICY "Employees manage suppliers"
  ON public.suppliers FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage purchase requests"
  ON public.purchase_requests FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage purchase request lines"
  ON public.purchase_request_lines FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage supplier purchase orders"
  ON public.supplier_purchase_orders FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage supplier order lines"
  ON public.supplier_order_lines FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage inbound shipments"
  ON public.inbound_shipments FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage goods receipts"
  ON public.goods_receipts FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage goods receipt lines"
  ON public.goods_receipt_lines FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage receipt exceptions"
  ON public.receipt_exceptions FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage inventory transactions"
  ON public.inventory_transactions FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage inventory units"
  ON public.inventory_units FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

-- Outbound documents: employees manage; dealers read own order docs
CREATE POLICY "Employees manage sales invoices"
  ON public.sales_invoices FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Dealers view own sales invoices"
  ON public.sales_invoices FOR SELECT TO authenticated
  USING (
    public.is_dealer()
    AND EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = sales_invoices.purchase_order_id
        AND po.dealer_id = auth.uid()
    )
  );

CREATE POLICY "Employees manage delivery receipts"
  ON public.delivery_receipts FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Dealers view own delivery receipts"
  ON public.delivery_receipts FOR SELECT TO authenticated
  USING (
    public.is_dealer()
    AND EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = delivery_receipts.purchase_order_id
        AND po.dealer_id = auth.uid()
    )
  );

CREATE POLICY "Employees manage pick lists"
  ON public.pick_lists FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage pick list lines"
  ON public.pick_list_lines FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Employees manage outbound shipments"
  ON public.outbound_shipments FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Dealers view own outbound shipments"
  ON public.outbound_shipments FOR SELECT TO authenticated
  USING (
    public.is_dealer()
    AND EXISTS (
      SELECT 1
      FROM public.delivery_receipts dr
      JOIN public.purchase_orders po ON po.id = dr.purchase_order_id
      WHERE dr.id = outbound_shipments.delivery_receipt_id
        AND po.dealer_id = auth.uid()
    )
  );

CREATE POLICY "Employees manage proof of deliveries"
  ON public.proof_of_deliveries FOR ALL TO authenticated
  USING (public.is_employee()) WITH CHECK (public.is_employee());

CREATE POLICY "Dealers view own proof of deliveries"
  ON public.proof_of_deliveries FOR SELECT TO authenticated
  USING (
    public.is_dealer()
    AND EXISTS (
      SELECT 1
      FROM public.outbound_shipments os
      JOIN public.delivery_receipts dr ON dr.id = os.delivery_receipt_id
      JOIN public.purchase_orders po ON po.id = dr.purchase_order_id
      WHERE os.id = proof_of_deliveries.outbound_shipment_id
        AND po.dealer_id = auth.uid()
    )
  );
