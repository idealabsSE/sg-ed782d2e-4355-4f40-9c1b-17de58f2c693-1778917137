---
title: Nota Simple Ownership Workflow
status: in_progress
priority: medium
type: feature
tags: [ownership, verification, registry]
created_by: softgen
created_at: 2026-05-15
position: 6
---

## Notes
Build the Nota Simple (Spanish property registry document) upload and verification interface. Users upload a Nota Simple PDF, the system extracts ownership data, and matches it against the host's verified identity. This establishes the final trust layer: proving the host actually owns or legally controls the property they're listing.

## Checklist
- [x] Create /verify/ownership page with upload interface
- [x] Build NotaSimpleUpload component with PDF file validation
- [x] Create OwnershipMatchCard showing extracted registry data
- [x] Add match status visualization (matched/pending/mismatch)
- [x] Display matched owner details alongside host identity
- [x] Add ownership verification translations

## Acceptance
- Users can upload a Nota Simple PDF and see extracted ownership information.
- The interface clearly shows whether the registry owner matches the host's identity.
- Unmatched or ambiguous results correctly surface a warning state.