-- Update national_licenses schema to support NRA manual workflow and future automation

-- Add new status values for manual workflow and automation readiness
ALTER TABLE national_licenses DROP CONSTRAINT IF EXISTS national_licenses_status_check;
ALTER TABLE national_licenses ADD CONSTRAINT national_licenses_status_check 
  CHECK (status IN ('active', 'pending', 'suspended', 'cancelled', 'confirmed', 'manual_entry', 'automation_pending'));

-- Add new source values including corpme_api for future automation
ALTER TABLE national_licenses DROP CONSTRAINT IF EXISTS national_licenses_source_check;
ALTER TABLE national_licenses ADD CONSTRAINT national_licenses_source_check 
  CHECK (source IN ('manual', 'partner_api', 'government_feed', 'corpme_api'));

-- Add nra_verified_at as alias/additional field (keeping last_verified_at for compatibility)
ALTER TABLE national_licenses ADD COLUMN IF NOT EXISTS nra_verified_at timestamp with time zone;

-- Add reviewer tracking for manual entries
ALTER TABLE national_licenses ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE national_licenses ADD COLUMN IF NOT EXISTS requires_review boolean NOT NULL DEFAULT false;

-- Add pending_automation flag to indicate when automation is blocked/pending
ALTER TABLE national_licenses ADD COLUMN IF NOT EXISTS pending_automation boolean NOT NULL DEFAULT false;

-- Create index for reviewer queue
CREATE INDEX IF NOT EXISTS idx_national_licenses_requires_review ON national_licenses(requires_review, created_at DESC) WHERE requires_review = true;

COMMENT ON COLUMN national_licenses.nra_verified_at IS 'Timestamp when NRA registration was verified (either manually or via API)';
COMMENT ON COLUMN national_licenses.verified_by IS 'Admin/reviewer who confirmed the NRA registration for manual entries';
COMMENT ON COLUMN national_licenses.requires_review IS 'Flag indicating manual entry needs admin confirmation';
COMMENT ON COLUMN national_licenses.pending_automation IS 'Flag indicating API automation is blocked (e.g., by Friendly Captcha) and manual process is being used';