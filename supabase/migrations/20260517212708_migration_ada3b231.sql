-- Create national_licenses table (1:1 nullable relationship with properties)
CREATE TABLE IF NOT EXISTS national_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'cancelled')),
  registered_at DATE,
  expires_at DATE,
  holder_name TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'partner_api', 'government_feed')),
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_national_licenses_property_id ON national_licenses(property_id);
CREATE INDEX IF NOT EXISTS idx_national_licenses_registration_number ON national_licenses(registration_number);
CREATE INDEX IF NOT EXISTS idx_national_licenses_status ON national_licenses(status);

-- Enable RLS
ALTER TABLE national_licenses ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can view national license status)
CREATE POLICY "public_read_national_licenses" ON national_licenses
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "auth_insert_national_licenses" ON national_licenses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "auth_update_national_licenses" ON national_licenses
  FOR UPDATE USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE national_licenses IS 'National Rental Registration (NRA/NRUA) compliance tracking per property';