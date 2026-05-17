-- Create private storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket
  10485760, -- 10MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage bucket access
-- Users can upload their own documents
CREATE POLICY "users_upload_own_documents_storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own documents
CREATE POLICY "users_read_own_documents_storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can read all documents
CREATE POLICY "admins_read_all_documents_storage"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email LIKE '%@xtrust.com'
  )
);

-- Service role can delete expired documents
CREATE POLICY "service_delete_expired_documents_storage"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'verification-documents');