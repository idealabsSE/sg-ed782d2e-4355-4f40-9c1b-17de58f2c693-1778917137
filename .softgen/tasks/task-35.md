---
title: NRA Status Manual Module and Connector Scaffold
status: todo
priority: high
type: feature
tags:
- backend
- compliance
- nra
created_by: softgen
created_at: '2026-05-18'
position: 35
---

## Notes
The NRA/NRUA automation is currently blocked by Friendly Captcha requirements from the CORPME API. For the MVP, we need a manual entry module with a `pending_automation` scaffold so that the API can be dropped in seamlessly post-MVP when B2B access is confirmed. Cases should never be blocked by NRA API availability.

## Checklist
- [ ] Update `nationallicenses` schema to include `nra_number`, `nra_status` (confirmed, pending, manual_entry, automation_pending), `nra_source` (manual, corpme_api), and `nra_verified_at`
- [ ] Create NRA connector interface scaffold with a `pending_automation` flag
- [ ] Implement manual entry workflow for NRA number input by owner or agent
- [ ] Add internal reviewer confirmation step for manually entered NRA statuses
- [ ] Add logic to ensure verification cases proceed without being blocked by automated NRA checks
