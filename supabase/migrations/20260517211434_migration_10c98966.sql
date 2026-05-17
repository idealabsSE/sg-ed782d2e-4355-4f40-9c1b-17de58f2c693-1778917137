-- Create person_documents table for document metadata tracking
CREATE TABLE person_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_id UUID NULL REFERENCES verifications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('identity', 'financial', 'ownership', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage bucket path
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE NULL,
  access_count INTEGER NOT NULL DEFAULT 0,
  retention_until DATE NULL, -- Based on retention policy
  metadata JSONB NULL, -- Additional context like OCR results, extraction data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_person_documents_user_id ON person_documents(user_id);
CREATE INDEX idx_person_documents_verification_id ON person_documents(verification_id);
CREATE INDEX idx_person_documents_type ON person_documents(document_type);
CREATE INDEX idx_person_documents_retention ON person_documents(retention_until) WHERE retention_until IS NOT NULL;

-- Add comment
COMMENT ON TABLE person_documents IS 'Metadata for user-uploaded verification documents stored in private Storage bucket';

-- Enable RLS
ALTER TABLE person_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own documents
CREATE POLICY "users_view_own_documents" ON person_documents
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Users can upload their own documents
CREATE POLICY "users_upload_own_documents" ON person_documents
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND uploaded_by = auth.uid());

-- RLS Policy: Admins can view all documents for review
CREATE POLICY "admins_view_documents" ON person_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@xtrust.com'
    )
  );

-- RLS Policy: System can update access tracking
CREATE POLICY "system_update_access_tracking" ON person_documents
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');