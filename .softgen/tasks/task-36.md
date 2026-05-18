
---
title: "Nota Simple Document Extraction and Identity Matching"
status: "todo"
priority: "high"
type: "feature"
tags: ["backend", "verification", "ownership"]
created_by: "softgen"
created_at: "2026-05-18"
position: 36
---

## Notes
Ownership verification in Spain relies on the Nota Simple document. Since the direct API is deferred, the MVP uses user-uploaded PDFs or intermediary digital orders. Key fields must be extracted from the document and matched against the claimed person's identity to establish trust.

## Checklist
- [ ] Implement secure upload and intermediary order initiation for Nota Simple documents
- [ ] Add metadata fields to the `ownershipverification` module to store extracted owner name, NIE/DNI, and IDUFIR/CRU
- [ ] Create matching service to compare claimed identity details against Nota Simple extracted fields
- [ ] Map matching outcomes strictly to: `ownership_confirmed`, `mismatch`, and `manual_review_needed`
- [ ] Route all `mismatch` and `manual_review_needed` outcomes to the internal reviewer queue
