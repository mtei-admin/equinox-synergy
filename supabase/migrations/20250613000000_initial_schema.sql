-- Equinox Synergy: core schema & row-level security

-- ---------------------------------------------------------------------------
-- Custom types
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('dealer', 'employee');

CREATE TYPE public.purchase_order_status AS ENUM (
  'pending',
  'processing',
  'dispatched',
  'completed',
  'cancelled'
);

-- ---------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'dealer',
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, contact_email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  supplier_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  dealer_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  dealer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  status public.purchase_order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER purchase_orders_set_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (purchase_order_id, product_id)
);

-- ---------------------------------------------------------------------------
-- CMS assets
-- ---------------------------------------------------------------------------

CREATE TABLE public.cms_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER cms_assets_set_updated_at
  BEFORE UPDATE ON public.cms_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper functions for RLS
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_employee()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'employee'
      AND is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_dealer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'dealer'
      AND is_active = TRUE
  );
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_assets ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employees can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_employee());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Employees can manage profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_employee())
  WITH CHECK (public.is_employee());

-- Products: dealers see catalog without supplier cost
CREATE POLICY "Dealers can view active products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.is_dealer() AND is_active = TRUE);

CREATE POLICY "Employees can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_employee())
  WITH CHECK (public.is_employee());

-- Purchase orders
CREATE POLICY "Dealers can view own purchase orders"
  ON public.purchase_orders FOR SELECT
  TO authenticated
  USING (public.is_dealer() AND dealer_id = auth.uid());

CREATE POLICY "Dealers can create own purchase orders"
  ON public.purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (public.is_dealer() AND dealer_id = auth.uid());

CREATE POLICY "Employees can manage all purchase orders"
  ON public.purchase_orders FOR ALL
  TO authenticated
  USING (public.is_employee())
  WITH CHECK (public.is_employee());

-- Order items
CREATE POLICY "Dealers can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    public.is_dealer()
    AND EXISTS (
      SELECT 1
      FROM public.purchase_orders po
      WHERE po.id = order_items.purchase_order_id
        AND po.dealer_id = auth.uid()
    )
  );

CREATE POLICY "Dealers can insert own order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_dealer()
    AND EXISTS (
      SELECT 1
      FROM public.purchase_orders po
      WHERE po.id = order_items.purchase_order_id
        AND po.dealer_id = auth.uid()
        AND po.status = 'pending'
    )
  );

CREATE POLICY "Employees can manage all order items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (public.is_employee())
  WITH CHECK (public.is_employee());

-- CMS assets
CREATE POLICY "Dealers can view published assets"
  ON public.cms_assets FOR SELECT
  TO authenticated
  USING (public.is_dealer() AND is_published = TRUE AND is_active = TRUE);

CREATE POLICY "Employees can manage cms assets"
  ON public.cms_assets FOR ALL
  TO authenticated
  USING (public.is_employee())
  WITH CHECK (public.is_employee());

-- Hide supplier_cost from dealers via a public-facing view
CREATE VIEW public.products_dealer_catalog
WITH (security_invoker = true)
AS
SELECT
  id,
  sku,
  name,
  description,
  dealer_price,
  stock_quantity,
  created_at,
  updated_at
FROM public.products
WHERE is_active = TRUE;

GRANT SELECT ON public.products_dealer_catalog TO authenticated;
