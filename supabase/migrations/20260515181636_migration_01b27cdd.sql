-- Create private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

-- RLS policy for document uploads - users can only upload for their own verifications
CREATE POLICY "Users can upload own verification documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for document access - users can only access their own documents or documents for cases they're involved in
CREATE POLICY "Users can access own verification documents"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'verification-documents' AND
  (
    -- Own documents
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Documents in cases they're part of
    EXISTS (
      SELECT 1 FROM case_parties cp
      WHERE cp.user_id = auth.uid()
      AND (storage.foldername(name))[1] IN (
        SELECT cp2.user_id::text FROM case_parties cp2 WHERE cp2.case_id = cp.case_id
      )
    )
  )
);

-- RLS policy for document updates - users can only update their own documents
CREATE POLICY "Users can update own verification documents"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy for document deletion - users can only delete their own documents
CREATE POLICY "Users can delete own verification documents"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);