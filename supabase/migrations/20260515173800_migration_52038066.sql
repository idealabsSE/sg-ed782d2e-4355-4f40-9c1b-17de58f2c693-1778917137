-- Create regional_licenses table to store GVA tourism license data
CREATE TABLE IF NOT EXISTS regional_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'gva',
  source_id TEXT NOT NULL,
  cadastral_reference TEXT,
  license_number TEXT NOT NULL,
  license_type TEXT,
  address TEXT,
  municipality TEXT,
  region TEXT NOT NULL DEFAULT 'valencia',
  status TEXT NOT NULL DEFAULT 'active',
  beds INTEGER,
  capacity INTEGER,
  raw_data JSONB,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT regional_licenses_source_source_id_key UNIQUE (source, source_id),
  CONSTRAINT regional_licenses_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'removed'))
);

CREATE INDEX IF NOT EXISTS idx_regional_licenses_cadastral ON regional_licenses(cadastral_reference);
CREATE INDEX IF NOT EXISTS idx_regional_licenses_license_number ON regional_licenses(license_number);
CREATE INDEX IF NOT EXISTS idx_regional_licenses_source ON regional_licenses(source, status);

-- Create source_snapshots table to track ingestion runs
CREATE TABLE IF NOT EXISTS source_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  records_fetched INTEGER NOT NULL,
  records_new INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_removed INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  snapshot_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_snapshots_source_run_at ON source_snapshots(source, run_at DESC);

-- Create connector_metadata table for health tracking
CREATE TABLE IF NOT EXISTS connector_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL UNIQUE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_records_ingested BIGINT NOT NULL DEFAULT 0,
  health_status TEXT NOT NULL DEFAULT 'healthy',
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT connector_metadata_health_status_check CHECK (health_status IN ('healthy', 'degraded', 'failing', 'disabled'))
);

-- Enable RLS on new tables (public read, internal system writes)
ALTER TABLE regional_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_metadata ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public_read_regional_licenses" ON regional_licenses FOR SELECT USING (true);
CREATE POLICY "public_read_source_snapshots" ON source_snapshots FOR SELECT USING (true);
CREATE POLICY "public_read_connector_metadata" ON connector_metadata FOR SELECT USING (true);

-- Service role policies for Edge Function writes
CREATE POLICY "service_write_regional_licenses" ON regional_licenses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_write_source_snapshots" ON source_snapshots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_write_connector_metadata" ON connector_metadata FOR ALL USING (auth.role() = 'service_role');

-- Initialize GVA connector metadata
INSERT INTO connector_metadata (source, health_status, config) 
VALUES (
  'gva',
  'healthy',
  '{"url": "https://www.gva.es/es/inicio/datos_abiertos/catalogo/datasets/turisme_viviendas", "schedule": "0 2 * * *"}'::jsonb
) ON CONFLICT (source) DO NOTHING;

COMMENT ON TABLE regional_licenses IS 'Stores tourism license data from regional sources (GVA, etc)';
COMMENT ON TABLE source_snapshots IS 'Tracks each ingestion run with statistics';
COMMENT ON TABLE connector_metadata IS 'Health monitoring and configuration for each data connector';