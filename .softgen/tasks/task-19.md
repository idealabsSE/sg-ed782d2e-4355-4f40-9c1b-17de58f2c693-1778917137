---
title: Secondary Property Spot-Check (SForms)
status: done
priority: medium
type: feature
tags:
- property
- verification
- fallback
created_by: softgen
created_at: 2026-05-15
position: 19
---

## Notes
Implement the secondary spot-check mechanism using the SForms-based search as required by the PRD. This acts as a manual fallback/validation tool when the primary GVA open-data ingestion does not yield a match or requires live verification.

## Checklist
- [x] Build Edge Function to query the regional SForms URL with XML-parameter encoding
- [x] Implement HTML response parser to extract basic license validity
- [x] Add "Live Spot-Check" button to the Property Profile UI
- [x] Log spot-check results to the property history timeline

## Acceptance
- Users/Reviewers can trigger a live SForms lookup for a specific license number.
- The system correctly parses the SForms HTML response to verify license validity.
- This path is explicitly maintained as a secondary fallback, not bulk ingestion.
