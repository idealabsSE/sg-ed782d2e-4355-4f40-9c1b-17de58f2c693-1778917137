-- Create authority_verification table to track Power of Attorney / Management Mandate verifications
CREATE TABLE authority_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_party_id UUID NOT NULL REFERENCES case_parties(id) ON DELETE CASCADE,
  document_id UUID REFERENCES person_documents(id) ON DELETE SET NULL,
  mandate_type TEXT NOT NULL CHECK (mandate_type IN ('power_of_attorney', 'management_contract', 'board_resolution', 'other')),
  principal_name TEXT NOT NULL, -- Name of the property owner/company being represented
  principal_id_number TEXT, -- ID/Tax number of the principal
  agent_name TEXT NOT NULL, -- Name of the person with authority (the case party)
  agent_id_number TEXT, -- ID number of the agent
  valid_from DATE,
  valid_until DATE,
  scope_of_authority TEXT, -- Description of what the mandate allows (e.g., "rental operations", "full property management")
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  metadata JSONB, -- Store extracted data, OCR results, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE authority_verification IS 'Tracks verification of Power of Attorney and management mandates for representatives';
COMMENT ON COLUMN authority_verification.principal_name IS 'The property owner or company being represented';
COMMENT ON COLUMN authority_verification.agent_name IS 'The person acting with delegated authority';
COMMENT ON COLUMN authority_verification.scope_of_authority IS 'What actions the mandate permits (rental, sales, full management, etc.)';

-- Indexes for efficient queries
CREATE INDEX idx_authority_verification_case_party ON authority_verification(case_party_id);
CREATE INDEX idx_authority_verification_status ON authority_verification(verification_status);
CREATE INDEX idx_authority_verification_document ON authority_verification(document_id);

-- RLS policies
ALTER TABLE authority_verification ENABLE ROW LEVEL SECURITY;

-- Users can view their own authority verifications
CREATE POLICY "users_view_own_authority_verifications" ON authority_verification
  FOR SELECT
  USING (
    case_party_id IN (
      SELECT id FROM case_parties WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own authority verifications
CREATE POLICY "users_insert_own_authority_verifications" ON authority_verification
  FOR INSERT
  WITH CHECK (
    case_party_id IN (
      SELECT id FROM case_parties WHERE user_id = auth.uid()
    )
  );

-- Admins and case participants can view all authority verifications for their cases
CREATE POLICY "case_participants_view_authority_verifications" ON authority_verification
  FOR SELECT
  USING (
    case_party_id IN (
      SELECT cp.id FROM case_parties cp
      INNER JOIN cases c ON c.id = cp.case_id
      WHERE c.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM case_parties cp2
          WHERE cp2.case_id = c.id AND cp2.user_id = auth.uid()
        )
    )
  );

-- Admins can update verification status
CREATE POLICY "admins_update_authority_verifications" ON authority_verification
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.email LIKE '%@xtrust.com'
    )
  );