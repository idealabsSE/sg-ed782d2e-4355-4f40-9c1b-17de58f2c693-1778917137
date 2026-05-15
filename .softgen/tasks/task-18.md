---
title: Trust Scoring & Rules Engine
status: todo
priority: high
type: feature
tags: [backend, scoring, trust]
created_by: softgen
created_at: 2026-05-15
position: 18
---

## Notes
Build the `scoringandrules` module responsible for evaluating identity documents, financial profiles, and ownership verification records to generate the final derived `trustrisksummary`. This ensures raw data is not exposed when sharing trust profiles.

## Checklist
- [ ] Create trust score calculation logic (pass/fail/manual review rules)
- [ ] Implement data minimization layer to abstract raw evidence into derived signals
- [ ] Build the `persontrustprofile` generation Edge Function
- [ ] Connect case workflow to automatically trigger scoring upon party completion
- [ ] Add score rendering UI to the Case review dashboard

## Acceptance
- Completing a verification flow automatically generates a derived trust profile.
- Shareable trust profiles expose only derived signals (e.g., "Identity Verified"), never raw documents.
- Ambiguous scores correctly flag the case for manual internal review.