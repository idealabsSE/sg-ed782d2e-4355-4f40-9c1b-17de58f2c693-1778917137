-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cadastral_reference TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  region TEXT NOT NULL,
  license_status TEXT CHECK (license_status IN ('compliant', 'pending', 'non_compliant', 'not_required')) DEFAULT 'pending',
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verifications table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'host')),
  country TEXT NOT NULL CHECK (country IN ('sweden', 'spain')),
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'verified', 'rejected', 'flagged')) DEFAULT 'pending',
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')) DEFAULT 'pending',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  case_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_parties table
CREATE TABLE case_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'host', 'property_manager')),
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected', 'flagged')) DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(case_id, user_id)
);

-- Create ownership_documents table
CREATE TABLE ownership_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  match_status TEXT CHECK (match_status IN ('matched', 'pending', 'mismatch', 'needs_review')) DEFAULT 'pending',
  owner_name TEXT,
  registry_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_cases_property_id ON cases(property_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_case_parties_case_id ON case_parties(case_id);
CREATE INDEX idx_case_parties_user_id ON case_parties(user_id);
CREATE INDEX idx_ownership_documents_property_id ON ownership_documents(property_id);

-- Generate case numbers automatically
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.case_number := 'CASE-' || TO_CHAR(NEW.created_at, 'YYYYMMDD') || '-' || LPAD(SUBSTRING(NEW.id::TEXT FROM 1 FOR 6), 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
BEFORE INSERT ON cases
FOR EACH ROW
EXECUTE FUNCTION generate_case_number();