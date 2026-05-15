---
title: Extensibility - Direct API Integrations
status: todo
priority: low
type: feature
tags: [automation, post-mvp, phase-5]
created_by: softgen
created_at: 2026-05-15
position: 22
---

## Notes
Post-MVP Phase 5 task. Automate the document-backed and manual workflows by integrating direct APIs for Nota Simple (Registradores), Credit Bureaus, and the NRA (once available).

## Checklist
- [ ] Integrate direct Registradores API for instant Nota Simple data extraction
- [ ] Integrate Swedish credit bureau API for automated financial/solvency profiling
- [ ] Build automated scraper/API integration for NRA national registration
- [ ] Update verification wizards to utilize automated lookups instead of document uploads where applicable

## Acceptance
- Users can verify ownership via direct registry API without waiting for intermediary PDF uploads.
- Swedish financial trust signals are derived instantly from credit bureau data.
- Manual fallback UI is preserved for API failures.