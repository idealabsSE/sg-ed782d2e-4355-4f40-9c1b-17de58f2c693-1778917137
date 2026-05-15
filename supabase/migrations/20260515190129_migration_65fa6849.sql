-- Add provider-related columns to verifications table for provider-agnostic result storage
-- This enables switching providers without schema changes

ALTER TABLE verifications
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS provider_session_id TEXT,
ADD COLUMN IF NOT EXISTS verification_method TEXT,
ADD COLUMN IF NOT EXISTS provider_confidence INTEGER,
ADD COLUMN IF NOT EXISTS identity_data JSONB,
ADD COLUMN IF NOT EXISTS provider_raw_response JSONB,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_verifications_provider 
  ON verifications(provider_name);
CREATE INDEX IF NOT EXISTS idx_verifications_status 
  ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_verified_at 
  ON verifications(verified_at);

-- Add comment explaining the schema design
COMMENT ON COLUMN verifications.provider_name IS 
  'Name of identity verification provider (TIC/Authway, Verifik, Signicat, etc.)';
COMMENT ON COLUMN verifications.provider_session_id IS 
  'Provider-specific session/transaction ID for status tracking';
COMMENT ON COLUMN verifications.verification_method IS 
  'Method used: bankid, freja, dni_electronic, document_scan, video_call';
COMMENT ON COLUMN verifications.identity_data IS 
  'Normalized identity data extracted by provider: {fullName, dateOfBirth, documentNumber, nationality, address}';
COMMENT ON COLUMN verifications.provider_raw_response IS 
  'Complete raw response from provider for audit trail and debugging';
COMMENT ON COLUMN verifications.verified_at IS 
  'Timestamp when verification was successfully completed';