---
title: Property Lookup Interface
status: todo
priority: high
type: feature
tags: [property, search, compliance]
position: 2
---

## Notes
Build the public-facing property verification interface. Users should be able to look up a Spanish property and view its compliance profile based on regional tourist license data (modeled on the GVA open-data concept).

## Checklist
- [ ] Build a search hero section accepting inputs like address, cadastral reference, CRU, or regional license number.
- [ ] Design a property compliance profile view showing the registration status, ingestion timestamp, and official data source name.
- [ ] Include a section for secondary spot-checks (SForms fallback notice).
- [ ] Present property capacity, exact registered address, and registration date in a clear, tabular format.
- [ ] Display empty states and clear error messaging for unverified or missing properties.

## Acceptance
- User can search for a mock property and see a structured compliance profile.
- All numeric identifiers use monospace, tabular numbers for high legibility.
- The interface handles "Not Found" properties gracefully.