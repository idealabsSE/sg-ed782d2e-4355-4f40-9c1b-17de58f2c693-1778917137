-- Notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  case_invite BOOLEAN NOT NULL DEFAULT true,
  verification_complete BOOLEAN NOT NULL DEFAULT true,
  review_decision BOOLEAN NOT NULL DEFAULT true,
  status_update BOOLEAN NOT NULL DEFAULT true,
  digest_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  preferred_locale TEXT NULL CHECK (preferred_locale IN ('en', 'sv', 'es')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Notification templates (multi-lingual)
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL, -- e.g., 'case_invite', 'verification_complete'
  locale TEXT NOT NULL CHECK (locale IN ('en', 'sv', 'es')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  variables JSONB NULL, -- List of template variables: ["userName", "caseNumber", "actionUrl"]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_key, locale)
);

CREATE INDEX idx_notification_templates_key ON notification_templates(template_key);
CREATE INDEX idx_notification_templates_locale ON notification_templates(locale);

-- Notification queue with retry logic
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('case_invite', 'verification_complete', 'review_decision', 'status_update')),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'sv', 'es')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  template_data JSONB NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ NULL,
  last_error TEXT NULL,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_next_retry ON notification_queue(next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_recipient ON notification_queue(recipient_user_id);
CREATE INDEX idx_notification_queue_type ON notification_queue(notification_type);

-- Notification history (for tracking and audit)
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NULL REFERENCES notification_queue(id) ON DELETE SET NULL,
  recipient_user_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
  provider_response JSONB NULL,
  error_message TEXT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ NULL,
  opened_at TIMESTAMPTZ NULL,
  clicked_at TIMESTAMPTZ NULL,
  metadata JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notification_history_recipient ON notification_history(recipient_user_id);
CREATE INDEX idx_notification_history_type ON notification_history(notification_type);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history(status);

-- RLS Policies

-- notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- notification_templates
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_templates" ON notification_templates
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@xtrust.com'
    )
  );

-- notification_queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_manage_queue" ON notification_queue
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "users_read_own_queue" ON notification_queue
  FOR SELECT USING (recipient_user_id = auth.uid());

-- notification_history
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_history" ON notification_history
  FOR SELECT USING (recipient_user_id = auth.uid());

CREATE POLICY "admin_read_history" ON notification_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email LIKE '%@xtrust.com'
    )
  );

CREATE POLICY "service_insert_history" ON notification_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();