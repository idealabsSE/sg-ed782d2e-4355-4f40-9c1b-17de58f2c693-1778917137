---
title: Spanish User Verification Flow
status: done
priority: high
type: feature
tags: [identity, verification, spain]
created_by: softgen
created_at: 2026-05-15
position: 4
---

## Notes
Build the Spanish identity verification wizard for tenants and hosts. Users provide their Spanish identity documentation (DNI/NIE), select their role, and upload verification documents. This mirrors the Swedish flow but adapts to Spanish document types and validation patterns.

## Checklist
- [x] Create /verify/identity/spanish page
- [x] Adapt VerificationWizard to support Spanish document types (DNI, NIE)
- [x] Add Spanish-specific validation patterns and placeholders
- [x] Build Spanish identity form with DNI/NIE selection
- [x] Add Spanish translations for identity verification content
- [x] Test the complete Spanish verification flow

## Acceptance
- Spanish users can complete verification by selecting role and uploading a DNI and relevant role-based documents.
- The flow supports Spanish localization seamlessly.