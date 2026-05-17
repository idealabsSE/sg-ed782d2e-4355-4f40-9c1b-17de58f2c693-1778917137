---
title: Fix Broken Wizard Component & Service Migration
status: done
priority: urgent
type: bug
tags:
- bug
- ui
- architecture
created_by: softgen
created_at: 2026-05-17
position: 32
---

## Notes
The previous refactoring tasks incorrectly gutted `VerificationWizard.tsx` and left leftover services in `src/services/`. We must restore the multi-step wizard state and finish the file migration.

`VerificationWizard.tsx` MUST contain state to track the current step (e.g., `step 1: property`, `step 2: identity`, `step 3: ownership`) and compose the domain components (`PropertyVerificationStep`, `SwedishIdentityStep`/`SpanishIdentityStep`, `OwnershipStep`) so the user can navigate through them sequentially.

## Checklist
- [x] Refactor `src/components/VerificationWizard.tsx` to restore state management (e.g., `currentStep`, `nextStep()`, `prevStep()`).
- [x] Render the `PropertyVerificationStep` for step 1, the Identity steps for step 2, and the `OwnershipStep` for step 3 within the wizard.
- [x] Migrate any remaining core logic from `src/services/verificationService.ts` to `src/properties/PropertyService.ts` (or the appropriate domain service).
- [x] Delete `src/services/verificationService.ts` completely so we strictly use the domain architecture.
- [x] Delete `src/services/securityTests.ts` or move it to `src/securityandaudit/`.

## Acceptance
- `VerificationWizard.tsx` functions as a full multi-step wizard again.
- The `src/services/` folder no longer contains `verificationService.ts` or `securityTests.ts`.
- The application compiles and runs without missing import errors.
