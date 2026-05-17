---
title: Core Module Architecture & Interfaces
status: in_progress
priority: urgent
type: chore
tags:
- architecture
- phase-1
created_by: softgen
created_at: 2026-05-17
position: 24
---

## Notes
Establish the strict modular monolith architecture defined in Phase 1 of the development plan. This ensures boundaries are maintained and new features are added as modules rather than modifying existing ones. It also sets up the foundational TypeScript interfaces for connectors and providers.

## Checklist
- [x] Create domain folders in `src/`: `sharedkernel`, `auth`, `organizations`, `i18n`, `properties`, `regionallicenses`, `nationallicenses`, `swedishpersonverification`, `spanishpersonverification`, `documents`, `verificationcases`, `connectors`, `ownershipverification`, `scoringandrules`, `privacyandgdpr`, `securityandaudit`, `admin`, `notifications`
- [x] Add a `README.md` to every domain folder defining its purpose and public interface
- [x] Define `DataConnector` interface in `src/connectors/interface/` (fetchSnapshot, normalizeRows, resolvePropertyIdentifier)
- [x] Define `IdentityProvider` interface in `src/sharedkernel/providers/` (startVerification, getVerificationStatus, normalizeResult, storeEvidenceReference)

## Acceptance
- The codebase follows the exact folder structure specified in the plan.
- Every module has a README.md documenting its boundaries.
- The base TypeScript interfaces for Connectors and Identity Providers are committed and exported.
