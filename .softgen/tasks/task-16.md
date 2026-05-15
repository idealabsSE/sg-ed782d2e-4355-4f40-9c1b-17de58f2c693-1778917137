---
title: Provider Abstraction Layer (Identity Verification)
status: in_progress
priority: medium
type: feature
tags:
- backend
- providers
- architecture
- extensibility
created_by: softgen
created_at: 2026-05-15
position: 16
---

## Notes
Implement provider abstraction layer per PRD Section 2 and Plan's "Provider Abstraction Layer — Mandatory Pattern". This enables switching from TIC/Authway + Verifik to Signicat post-MVP without rewriting application logic.

## Checklist
- [x] Define provider interface contract: startVerification, getStatus, normalizeResult
- [x] Create provider registry and configuration system
- [x] Implement TIC/Authway adapter (Swedish BankID/Freja eID)
- [x] Implement Verifik adapter (Spanish DNI/NIE)
- [x] Build provider selection logic based on country and document type
- [x] Create provider health monitoring
- [x] Document adding new providers (Signicat migration path)
- [x] Add provider-agnostic result normalization to `identity_verifications` table

## Acceptance
- All identity verification calls go through provider interface
- TIC/Authway and Verifik wrapped as provider adapters
- Provider can be switched via configuration, no code changes
- Provider interface documented for Signicat migration
- New providers can be added by implementing interface only
