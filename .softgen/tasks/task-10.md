---
title: GVA Data Ingestion & Connector Infrastructure
status: todo
priority: high
type: feature
tags: [backend, ingestion, edge-functions, gva]
created_by: softgen
created_at: 2026-05-15
position: 10
---

## Notes
Implement the GVA open-data CSV ingestion system per PRD Section 11.B. This establishes the foundation for property license verification by ingesting official Comunitat Valenciana tourism data on a scheduled basis.

## Checklist
- [ ] Create Edge Function for scheduled GVA CSV fetch
- [ ] Implement CSV parsing and normalization logic
- [ ] Build snapshot diffing (detect new/updated/removed properties)
- [ ] Write ingestion results to `regional_licenses` and `source_snapshots` tables
- [ ] Create `connector_metadata` health tracking
- [ ] Add ops alerting for ingestion anomalies (zero rows, schema changes)
- [ ] Set up cron schedule for periodic runs
- [ ] Document connector interface for future regional additions

## Acceptance
- Scheduled Edge Function successfully fetches GVA CSV on schedule
- New/updated properties appear in `regional_licenses` table
- Connector health metrics visible in `connector_metadata`
- Ops receives alerts when ingestion fails or returns anomalies