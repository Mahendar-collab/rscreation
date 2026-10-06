-- ==============================================================================
-- RSCREATION - STORAGE POLICIES FOR PRODUCT PREVIEWS
-- Description: Ensures authenticated admins can upload, update, and delete
--              product preview images, while public users can view them.
-- ==============================================================================

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-previews', 'product-previews', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Policy 1: Public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read product previews'
  ) THEN
    CREATE POLICY "Public read product previews"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-previews');
  END IF;
END $$;

-- Policy 2: Admin upload (INSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin upload product previews'
  ) THEN
    CREATE POLICY "Admin upload product previews"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'product-previews' AND public.is_admin());
  END IF;
END $$;

-- Policy 3: Admin update (UPDATE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin update product previews'
  ) THEN
    CREATE POLICY "Admin update product previews"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'product-previews' AND public.is_admin());
  END IF;
END $$;

-- Policy 4: Admin delete (DELETE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin delete product previews'
  ) THEN
    CREATE POLICY "Admin delete product previews"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'product-previews' AND public.is_admin());
  END IF;
END $$;
