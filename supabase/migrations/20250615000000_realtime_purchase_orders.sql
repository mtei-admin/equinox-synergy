-- Enable Supabase Realtime for purchase order notifications (REQ-EMP-06)

ALTER TABLE public.purchase_orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
