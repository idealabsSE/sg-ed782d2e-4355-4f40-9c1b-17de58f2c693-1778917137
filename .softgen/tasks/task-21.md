---
title: Extensibility - Signicat Identity Migration
status: todo
priority: low
type: feature
tags: [identity, post-mvp, phase-5]
created_by: softgen
created_at: 2026-05-15
position: 21
---

## Notes
Post-MVP Phase 5 task. Migrate identity verification from the MVP providers (TIC/Authway and Verifik) to the consolidated Signicat platform for broader European coverage, utilizing the Provider Abstraction Layer established in Task 16.

## Checklist
- [ ] Implement Signicat adapter in `[se|es]personverification/providers/signicat`
- [ ] Map Signicat BankID/Freja eID flows to the abstraction interface
- [ ] Map Signicat Electronic IDentification (eID) for Spanish DNI/NIE validation
- [ ] Conduct parallel testing against legacy providers
- [ ] Switch production routing to Signicat and decommission old providers

## Acceptance
- Both Swedish and Spanish verification flows utilize Signicat without changing the core application logic.
- Provider abstraction layer seamlessly translates Signicat responses to the internal `IdentityVerificationRecord` format.