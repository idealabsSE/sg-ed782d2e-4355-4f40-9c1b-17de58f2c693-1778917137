# Connector Interface Specification

## Overview
Connectors ingest regional tourism license data into X Trust's `regional_licenses` table. Each connector is a Supabase Edge Function that fetches, parses, normalizes, and diffs external data sources on a scheduled basis.

## Architecture

```
┌─────────────────┐
│ External Source │ (GVA CSV, API, etc.)
└────────┬────────┘
         │ fetch
         ▼
┌─────────────────┐
│ Edge Function   │ (scheduled via pg_cron)
│  - Parse        │
│  - Normalize    │
│  - Diff         │
│  - Alert        │
└────────┬────────┘
         │ write
         ▼
┌─────────────────┐
│ Supabase Tables │
│  - regional_licenses
│  - source_snapshots
│  - connector_metadata
└─────────────────┘
```

## Connector Lifecycle

### 1. Scheduled Invocation
- Triggered via `pg_cron` (PostgreSQL extension)
- Default: daily at 2 AM UTC
- Customizable per connector via `connector_metadata.schedule`

### 2. Data Fetch
- HTTP GET from source URL (CSV, JSON, XML)
- Retry logic with exponential backoff
- Timeout: 30s default (configurable)
- User-Agent: `XTrust/1.0 DataIngestion`

### 3. Parsing & Normalization
Map source fields to canonical schema:
- `source_id` — unique identifier (cadastral ref or license number)
- `cadastral_reference` — property cadastral code
- `license_number` — tourism license ID
- `license_type` — classification (vivienda, apartamento, villa, etc.)
- `address` — full street address
- `municipality` — city/town name
- `region` — autonomous community (valencia, catalonia, andalucia, etc.)
- `status` — active | removed
- `beds` — sleeping capacity (integer)
- `capacity` — maximum occupancy (integer)
- `raw_data` — original record as JSONB

### 4. Snapshot Diffing
Compare current fetch against existing `regional_licenses` records:
- **New records**: Insert with `first_seen_at` = now
- **Updated records**: Update fields + `last_verified_at` = now
- **Removed records**: Mark `status = 'removed'` (soft delete)

### 5. Metadata Recording

#### source_snapshots
Record run statistics:
```sql
INSERT INTO source_snapshots (
  source, run_at, records_fetched, records_new,
  records_updated, records_removed, errors, snapshot_hash
)
```

#### connector_metadata
Update health tracking:
- `last_success_at` / `last_failure_at`
- `consecutive_failures` (reset to 0 on success)
- `total_runs` (increment)
- `total_records_ingested` (cumulative new records)
- `health_status` — healthy | degraded | failing

### 6. Alerting
Trigger ops alerts on:
- Zero records fetched (potential source outage)
- Parse errors exceeding threshold (schema change?)
- Consecutive failures ≥ 3 (mark `health_status = 'failing'`)
- Snapshot hash unchanged for 7+ days (stale data?)

## Implementation Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SourceRecord {
  // Define source-specific fields
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. Fetch external data
    const rawData = await fetchSourceData();
    
    // 2. Parse & normalize
    const records = parseRecords(rawData);
    
    // 3. Diff against existing
    const { data: existing } = await supabase
      .from("regional_licenses")
      .select("source_id, ...")
      .eq("source", "SOURCE_NAME");
    
    const { new, updated, removed } = diffRecords(records, existing);
    
    // 4. Apply changes
    await applyInserts(new);
    await applyUpdates(updated);
    await applyRemovals(removed);
    
    // 5. Record snapshot
    await recordSnapshot({ new, updated, removed });
    
    // 6. Update health
    await updateHealth(true);
    
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    await recordSnapshot({ error });
    await updateHealth(false);
    await alertOps(error);
    
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
});
```

## Adding New Regional Connectors

### Step 1: Database Setup
```sql
INSERT INTO connector_metadata (
  source, source_name, source_url, schedule, config
) VALUES (
  'catalonia',
  'Generalitat de Catalunya Tourism Registry',
  'https://example.cat/api/licenses',
  'daily',
  '{"region": "catalonia", "api_key_env": "CATALONIA_API_KEY"}'::jsonb
);
```

### Step 2: Create Edge Function
```bash
# Create function directory
mkdir -p supabase/functions/ingest-catalonia-licenses

# Implement index.ts following template above
```

### Step 3: Configure Schedule
```sql
SELECT cron.schedule(
  'catalonia-daily-ingestion',
  '0 3 * * *',  -- 3 AM UTC (offset from other regions)
  $$ SELECT net.http_post(...) $$
);
```

### Step 4: Test & Monitor
- Manual invocation: `supabase.functions.invoke('ingest-catalonia-licenses')`
- Check `source_snapshots` for run history
- Monitor `connector_metadata.health_status`

## Monitoring Dashboard Queries

### Connector Health Overview
```sql
SELECT source, health_status, last_success_at, consecutive_failures
FROM connector_metadata
ORDER BY last_success_at DESC NULLS LAST;
```

### Recent Ingestion Runs
```sql
SELECT source, run_at, records_new, records_updated, errors
FROM source_snapshots
ORDER BY run_at DESC
LIMIT 50;
```

### Stale Data Detection
```sql
SELECT source, MAX(run_at) as last_run
FROM source_snapshots
GROUP BY source
HAVING MAX(run_at) < NOW() - INTERVAL '2 days';
```

## Error Handling Best Practices

1. **Network failures**: Retry with exponential backoff (3 attempts)
2. **Parse errors**: Log sample records, alert if >10% fail
3. **Schema changes**: Detect via snapshot hash comparison
4. **Zero records**: Immediate alert (likely source outage)
5. **Consecutive failures**: Escalate after 3 runs

## Security Considerations

- Use `SUPABASE_SERVICE_ROLE_KEY` for writes (Edge Functions only)
- Store API keys in Edge Function secrets (not in code)
- Validate source URLs before fetch (prevent SSRF)
- Rate limit external requests (respect source ToS)
- Sanitize raw data before storing in `raw_data` JSONB

## Performance Optimization

- Batch inserts/updates (100 records per query)
- Use upsert operations where supported
- Index on `source + source_id` for fast lookups
- Partition `regional_licenses` by region (if >1M rows)
- Archive old `source_snapshots` (keep 90 days)

## Future Extensions

- **Multi-region support**: Catalonia, Andalucía, Balearic Islands
- **Real-time webhooks**: Receive push notifications from sources
- **Incremental sync**: Fetch only changed records (if API supports)
- **Data quality scoring**: Flag incomplete or suspicious records
- **Compliance tracking**: Monitor license expirations, renewals