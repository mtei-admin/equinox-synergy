-- Hide inventory quantity from dealer catalog view

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
  created_at,
  updated_at
FROM public.products
WHERE is_active = TRUE;

GRANT SELECT ON public.products_dealer_catalog TO authenticated;
