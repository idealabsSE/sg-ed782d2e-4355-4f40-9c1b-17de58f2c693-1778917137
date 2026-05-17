---
title: 'Domain Migration: Verification Wizard Component Splitting'
status: done
priority: high
type: chore
tags:
- architecture
- refactoring
- ui
created_by: softgen
created_at: 2026-05-17
position: 30
---

## Notes
The `VerificationWizard.tsx` component has grown too large (370+ lines) and contains logic that belongs to specific domain modules. We need to extract the individual steps of the wizard into their corresponding domain folders' `ui/` directories, and make the wizard component a composition of these smaller domain components.

## Checklist
- [x] Create `src/properties/ui/PropertyVerificationStep.tsx` and extract the property lookup/validation logic and UI from the wizard.
- [x] Create `src/swedishpersonverification/ui/SwedishIdentityStep.tsx` and extract the Swedish BankID/Authway logic and UI from the wizard.
- [x] Create `src/spanishpersonverification/ui/SpanishIdentityStep.tsx` and extract the Spanish NIE/DNI logic and UI from the wizard.
- [x] Create `src/ownershipverification/ui/OwnershipStep.tsx` and extract the Nota Simple logic and UI from the wizard.
- [x] Refactor `src/components/VerificationWizard.tsx` to import and compose these newly extracted domain step components instead of housing the full implementations.

## Acceptance
- `VerificationWizard.tsx` is significantly reduced in size.
- Domain-specific verification logic is isolated within the UI components of the respective domain folders.
- The wizard flow functions exactly as before visually and functionally.
