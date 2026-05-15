---
title: Property Lookup Interface
status: in_progress
priority: high
type: feature
tags: [property, verification, compliance]
created_by: softgen
created_at: 2026-05-15
position: 2
---

## Notes
Build the property lookup and compliance profiling interface, allowing users to search by address or cadastral reference. Display property metadata, compliance requirements (tourist licenses), and basic verification status. This establishes trust at the property level before moving to identity verification.

## Checklist
- [ ] Create /verify/property page with search form (address + cadastral reference inputs)
- [ ] Build PropertySearchForm component with validation
- [ ] Create PropertyProfile component to display results (address, cadastral ref, license status)
- [ ] Add ComplianceCard showing regional license requirements
- [ ] Implement "Not Found" state with clear guidance
- [ ] Add data-value styling (tabular-nums) for IDs and references

## Acceptance
- User can search by address or cadastral reference and see structured property data.
- License compliance status is clearly displayed with color-coded badges.
- The interface uses sharp borders, generous whitespace, tabular numbers for high legibility.
- The interface handles "Not Found" properties gracefully.