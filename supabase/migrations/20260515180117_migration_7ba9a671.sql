-- GDPR Compliance Tables

-- 1. Data Subject Access Requests (DSAR)
CREATE TABLE data_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'erasure', 'portability', 'rectification', 'restriction')),
  requester_email TEXT NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL, -- 30 days from submission
  response_data JSONB, -- for access/portability requests
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dsar_status ON data_subject_requests(status);
CREATE INDEX idx_dsar_deadline ON data_subject_requests(deadline);
CREATE INDEX idx_dsar_email ON data_subject_requests(requester_email);

COMMENT ON TABLE data_subject_requests IS 'GDPR Data Subject Access Requests (DSAR) tracking';

-- 2. Data Processing Records (Article 30)
CREATE TABLE data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests')),
  data_categories TEXT[] NOT NULL, -- e.g., ['identity', 'contact', 'financial']
  data_subjects TEXT[] NOT NULL, -- e.g., ['tenants', 'hosts', 'property_managers']
  recipients TEXT[], -- who receives this data
  retention_period TEXT NOT NULL, -- e.g., '3 years after contract end'
  security_measures TEXT NOT NULL,
  transfers_outside_eu BOOLEAN NOT NULL DEFAULT false,
  transfer_safeguards TEXT, -- for non-EU transfers
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_processing_records_active ON data_processing_records(is_active);

COMMENT ON TABLE data_processing_records IS 'Article 30 GDPR processing activities register';

-- 3. Retention Policies
CREATE TABLE retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_category TEXT NOT NULL UNIQUE,
  retention_period_days INTEGER NOT NULL,
  legal_basis TEXT NOT NULL,
  deletion_method TEXT NOT NULL CHECK (deletion_method IN ('hard_delete', 'anonymize', 'archive')),
  last_sweep_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_retention_policies_active ON retention_policies(is_active);

COMMENT ON TABLE retention_policies IS 'Data retention rules per category';

-- 4. Vendor Registry (Third-party processors)
CREATE TABLE vendor_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('processor', 'sub_processor', 'controller')),
  service_provided TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  eu_based BOOLEAN NOT NULL DEFAULT false,
  dpa_signed BOOLEAN NOT NULL DEFAULT false, -- Data Processing Agreement
  dpa_signed_date DATE,
  dpa_expires_date DATE,
  contact_email TEXT,
  contact_name TEXT,
  privacy_policy_url TEXT,
  security_certifications TEXT[], -- e.g., ['ISO27001', 'SOC2']
  last_audit_date DATE,
  next_audit_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_registry_status ON vendor_registry(status);
CREATE INDEX idx_vendor_dpa_expiry ON vendor_registry(dpa_expires_date);

COMMENT ON TABLE vendor_registry IS 'Third-party data processors tracking';

-- 5. Consent Records
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- e.g., 'marketing', 'analytics', 'third_party_sharing'
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  consent_method TEXT NOT NULL, -- e.g., 'registration', 'settings_update', 'cookie_banner'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consent_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type, granted);

COMMENT ON TABLE consent_records IS 'User consent tracking for GDPR compliance';

-- RLS Policies

-- Data Subject Requests: Users can submit and view their own, admins can manage all
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_submit_dsar" ON data_subject_requests
  FOR INSERT WITH CHECK (requester_email = (SELECT email FROM profiles WHERE id = auth.uid()));

CREATE POLICY "users_view_own_dsar" ON data_subject_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "admin_manage_dsar" ON data_subject_requests
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@xtrust.com'
  ));

-- Data Processing Records: Read-only for authenticated users, admin-only write
ALTER TABLE data_processing_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_processing_records" ON data_processing_records
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_processing_records" ON data_processing_records
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@xtrust.com'
  ));

-- Retention Policies: Read-only for authenticated users, admin-only write
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_retention_policies" ON retention_policies
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_retention_policies" ON retention_policies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@xtrust.com'
  ));

-- Vendor Registry: Read-only for authenticated users, admin-only write
ALTER TABLE vendor_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_vendor_registry" ON vendor_registry
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admin_manage_vendor_registry" ON vendor_registry
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@xtrust.com'
  ));

-- Consent Records: Users can view/update their own, admins can view all
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_consent" ON consent_records
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_view_consent" ON consent_records
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND email LIKE '%@xtrust.com'
  ));

-- Seed initial retention policies
INSERT INTO retention_policies (data_category, retention_period_days, legal_basis, deletion_method) VALUES
  ('user_profiles', 2555, 'contract', 'anonymize'), -- 7 years
  ('verification_documents', 2555, 'legal_obligation', 'archive'), -- 7 years
  ('case_data', 2555, 'contract', 'anonymize'), -- 7 years
  ('audit_logs', 1825, 'legal_obligation', 'archive'), -- 5 years
  ('consent_records', 1825, 'legal_obligation', 'archive'), -- 5 years
  ('marketing_data', 1095, 'consent', 'hard_delete'), -- 3 years
  ('support_tickets', 1095, 'legitimate_interests', 'anonymize'); -- 3 years

-- Seed initial processing activities
INSERT INTO data_processing_records (
  activity_name, purpose, legal_basis, data_categories, data_subjects, 
  recipients, retention_period, security_measures, transfers_outside_eu
) VALUES
  (
    'User Registration and Authentication',
    'Create and manage user accounts, enable platform access',
    'contract',
    ARRAY['identity', 'contact', 'authentication'],
    ARRAY['tenants', 'hosts', 'property_managers'],
    ARRAY['Supabase (infrastructure)', 'internal_team'],
    '7 years after account closure',
    'Encryption at rest and in transit, MFA support, password hashing',
    false
  ),
  (
    'Identity Verification',
    'Verify user identity for trust and compliance',
    'legal_obligation',
    ARRAY['identity', 'identity_documents', 'biometric'],
    ARRAY['tenants', 'hosts'],
    ARRAY['TIC (Spain)', 'Authway (Sweden)', 'Verifik (Sweden)', 'internal_team'],
    '7 years after verification',
    'End-to-end encryption, access controls, audit logging',
    true
  ),
  (
    'Property Verification',
    'Verify property licensing and ownership',
    'contract',
    ARRAY['property_data', 'ownership_documents'],
    ARRAY['hosts', 'property_managers'],
    ARRAY['GVA (public registry)', 'internal_team'],
    '7 years after case closure',
    'Document encryption, access controls, audit logging',
    false
  );

-- Seed initial vendors
INSERT INTO vendor_registry (
  vendor_name, vendor_type, service_provided, data_categories, eu_based, 
  dpa_signed, contact_email, status
) VALUES
  (
    'Supabase Inc.',
    'processor',
    'Database and authentication infrastructure',
    ARRAY['all_categories'],
    true,
    true,
    'privacy@supabase.io',
    'active'
  ),
  (
    'TIC (Trámites de Identificación de Clientes)',
    'processor',
    'Spanish identity verification',
    ARRAY['identity', 'identity_documents'],
    true,
    false,
    'contact@tic.es',
    'active'
  ),
  (
    'Authway AB',
    'processor',
    'Swedish BankID verification',
    ARRAY['identity', 'identity_documents'],
    true,
    false,
    'support@authway.se',
    'active'
  ),
  (
    'Verifik AB',
    'processor',
    'Swedish identity verification (fallback)',
    ARRAY['identity', 'identity_documents'],
    true,
    false,
    'info@verifik.se',
    'active'
  );