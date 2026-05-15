---
title: Swedish Tenant & Host Verification Flow
status: in_progress
priority: high
type: feature
tags: [identity, verification, sweden]
created_by: softgen
created_at: 2026-05-15
position: 3
---

## Notes
Build the Swedish identity verification wizard for both tenants and hosts. Users select their role, provide their Swedish identity documentation (personnummer, ID card, or passport), and upload verification documents. The wizard should guide users through each step and present a final trust profile summary.

## Checklist
- [x] Create /verify/identity/swedish page with role selection (tenant/host)
- [x] Build multi-step wizard component (RoleSelect → DocumentUpload → Review)
- [x] Create form for Swedish personnummer and document type selection
- [x] Build document upload interface with file validation
- [x] Create final summary card showing trust signals and verification status
- [x] Add Swedish translations for all identity-related content

## Acceptance
- Swedish users can complete the verification flow by selecting role, entering personnummer, and uploading ID documents.
- Each step is clearly labeled with progress indicators.
- The final summary displays a clean, shareable overview of the user's trust signals.