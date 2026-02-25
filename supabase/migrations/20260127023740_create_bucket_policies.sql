-- Authenticated users can only upload to their own user folder
-- (this uses auth.uid() — only works for logged-in users)
CREATE POLICY "Authenticated users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('public-assets', 'private-assets')
  AND (storage.foldername(name))[1] = 'users'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

