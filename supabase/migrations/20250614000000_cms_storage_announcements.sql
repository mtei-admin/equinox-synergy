-- Phase 5: CMS storage bucket, announcements, asset metadata

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER announcements_set_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view published announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    public.is_dealer()
    AND is_published = TRUE
    AND is_active = TRUE
  );

CREATE POLICY "Employees can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.is_employee())
  WITH CHECK (public.is_employee());

-- ---------------------------------------------------------------------------
-- CMS asset metadata
-- ---------------------------------------------------------------------------

ALTER TABLE public.cms_assets
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- ---------------------------------------------------------------------------
-- Supabase Storage: cms-assets bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('cms-assets', 'cms-assets', FALSE, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Employees can upload cms files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cms-assets'
    AND public.is_employee()
  );

CREATE POLICY "Employees can update cms files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cms-assets' AND public.is_employee())
  WITH CHECK (bucket_id = 'cms-assets' AND public.is_employee());

CREATE POLICY "Employees can delete cms files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cms-assets' AND public.is_employee());

CREATE POLICY "Authenticated users can read permitted cms files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cms-assets'
    AND (
      public.is_employee()
      OR (
        public.is_dealer()
        AND EXISTS (
          SELECT 1
          FROM public.cms_assets
          WHERE storage_path = storage.objects.name
            AND is_published = TRUE
            AND is_active = TRUE
        )
      )
    )
  );
