---
title: National Rental Registration (NRA) MVP
status: done
priority: medium
type: feature
tags:
- property
- compliance
- nra
created_by: softgen
created_at: 2026-05-15
position: 20
---

## Notes
Set up the National Rental Registration (NRA/NRUA) data model. Because the official API is not yet available/automated due to captchas, this MVP feature allows manual entry and partner-fed data for national compliance tracking.

## Checklist
- [x] Create `nationallicense` database schema (1:1 nullable per property)
- [x] Add manual NRA input form to the property/case dashboard
- [x] Update property compliance UI to display National Registration status alongside Regional
- [x] Implement partner API endpoint to allow third-party injection of NRA status

## Acceptance
- Properties can hold a distinct manual national license record separate from their regional license.
- Reviewers or users can manually input the NRA registration number and status.
- The UI reflects the dual-layer compliance (Regional + National).
