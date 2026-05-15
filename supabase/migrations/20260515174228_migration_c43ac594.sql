-- Access Audit Log table
CREATE TABLE access_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'view', 'download', 'edit', 'delete', 'create'
  resource_type TEXT NOT NULL, -- 'verification', 'case', 'document', 'profile'
  resource_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB, -- Additional context (search params, filters, etc)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_log_user_id ON access_audit_log(user_id);
CREATE INDEX idx_audit_log_action ON access_audit_log(action);
CREATE INDEX idx_audit_log_resource ON access_audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON access_audit_log(created_at DESC);
CREATE INDEX idx_audit_log_user_action_time ON access_audit_log(user_id, action, created_at DESC);

-- Security Incidents table
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  incident_type TEXT NOT NULL, -- 'suspicious_access', 'unauthorized_attempt', 'data_breach', 'anomaly'
  description TEXT NOT NULL,
  affected_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  detected_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Can be system or user
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB, -- IP patterns, access patterns, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_incidents_status ON security_incidents(status);
CREATE INDEX idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_security_incidents_created_at ON security_incidents(created_at DESC);
CREATE INDEX idx_security_incidents_affected_user ON security_incidents(affected_user_id);

-- Security Review Records table
CREATE TABLE security_review_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type TEXT NOT NULL, -- 'periodic_audit', 'incident_review', 'compliance_check'
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  review_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  findings TEXT NOT NULL,
  recommendations TEXT,
  audit_log_entries_reviewed INTEGER DEFAULT 0,
  incidents_reviewed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_review_records_reviewer ON security_review_records(reviewer_id);
CREATE INDEX idx_security_review_records_period ON security_review_records(review_period_start, review_period_end);
CREATE INDEX idx_security_review_records_status ON security_review_records(status);

-- RLS Policies for access_audit_log
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert audit logs (automated logging)
CREATE POLICY "service_insert_audit_log" ON access_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admins can read all audit logs
CREATE POLICY "admin_read_audit_log" ON access_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@xtrust.com'
    )
  );

-- RLS Policies for security_incidents
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Admins can manage security incidents
CREATE POLICY "admin_all_security_incidents" ON security_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@xtrust.com'
    )
  );

-- RLS Policies for security_review_records
ALTER TABLE security_review_records ENABLE ROW LEVEL SECURITY;

-- Reviewers can create and read their own reviews
CREATE POLICY "reviewers_manage_own_reviews" ON security_review_records
  FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@xtrust.com'
    )
  );