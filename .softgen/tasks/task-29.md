---
title: 'Domain Migration: Core Services'
status: todo
priority: high
type: chore
tags:
- architecture
- refactoring
- domain-driven
created_by: softgen
created_at: 2026-05-17
position: 29
---

## Notes
The project architecture has transitioned to a Domain-Driven structure, but the core service implementations are still located in the legacy `src/services/` directory. We need to move these services into their respective domain modules and update all imports across the app to use the new module paths.

## Checklist
- [ ] Move `src/services/authService.ts` to `src/auth/AuthService.ts`
- [ ] Move `src/services/propertyService.ts` to `src/properties/PropertyService.ts`
- [ ] Move `src/services/caseService.ts` to `src/verificationcases/CaseService.ts`
- [ ] Move `src/services/auditService.ts` to `src/securityandaudit/AuditService.ts`
- [ ] Move `src/services/gdprService.ts` to `src/privacyandgdpr/GdprService.ts`
- [ ] Move `src/services/identityVerificationService.ts` to `src/sharedkernel/providers/IdentityVerificationService.ts`
- [ ] Search the codebase for `@/services/...` imports and update them to use the new domain paths (e.g., `@/verificationcases/CaseService`)
- [ ] Ensure all pages and components compile successfully after the import path updates

## Acceptance
- The legacy `src/services/` folder no longer contains the core domain services.
- The app builds and runs without any broken import errors.
