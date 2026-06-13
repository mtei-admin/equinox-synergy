-- Add model and serial number to products

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS serial_number TEXT;

DROP VIEW IF EXISTS public.products_dealer_catalog;

CREATE VIEW public.products_dealer_catalog
WITH (security_invoker = true)
AS
SELECT
  id,
  sku,
  name,
  model,
  serial_number,
  description,
  dealer_price,
  stock_quantity,
  created_at,
  updated_at
FROM public.products
WHERE is_active = TRUE;

GRANT SELECT ON public.products_dealer_catalog TO authenticated;
