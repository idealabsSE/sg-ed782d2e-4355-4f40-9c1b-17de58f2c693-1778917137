
---
title: "Identity Provider Abstraction and GDPR Vendor Registry"
status: "todo"
priority: "high"
type: "feature"
tags: ["architecture", "gdpr", "providers"]
created_by: "softgen"
created_at: "2026-05-18"
position: 37
---

## Notes
The platform must use TIC/Authway for Sweden and Verifik for Spain in the MVP, but will migrate to Signicat post-MVP. This requires a strict provider abstraction layer. Additionally, GDPR compliance mandates that all third-party processors are tracked in a Vendor Registry.

## Checklist
- [ ] Implement internal provider interface (`startVerification`, `getVerificationStatus`, `normalizeIdentityResult`) for identity services
- [ ] Refactor existing provider connections to ensure they are never called directly from frontend components
- [ ] Create `vendorregistry` schema for GDPR accountability
- [ ] Seed vendor registry with required MVP processors: TIC, Authway, Verifik, Signicat, Nota Simple intermediary, and CORPME
- [ ] Connect the vendor registry to Data Subject Access Request (DSAR) workflows
