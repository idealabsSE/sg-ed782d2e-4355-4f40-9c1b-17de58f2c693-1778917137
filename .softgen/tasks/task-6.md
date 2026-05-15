---
title: Nota Simple Ownership Workflow
status: todo
priority: medium
type: feature
tags: [property, ownership, documents]
position: 6
---

## Notes
A critical piece of Layer C is verifying that the claimed owner actually owns the property. For the MVP, this is a document-backed workflow using the Spanish land registry extract (Nota Simple).

## Checklist
- [ ] Build an interface on the case detail page to initiate an ownership check.
- [ ] Provide two mock pathways: "Order via Intermediary" and "Upload Existing Nota Simple PDF".
- [ ] Create a mock extraction results panel displaying parsed fields: Registered Owner Name, NIE/DNI, and IDUFIR/CRU.
- [ ] Add a match status indicator comparing the extracted Nota Simple data against the claimed host's verified identity.
- [ ] Implement a "Request Manual Review" fallback for ambiguous matches.

## Acceptance
- The user can simulate uploading a Nota Simple document.
- The interface displays the extracted fields and visualizes whether the registry name matches the host's identity.
- Unmatched or ambiguous results correctly surface a warning state.