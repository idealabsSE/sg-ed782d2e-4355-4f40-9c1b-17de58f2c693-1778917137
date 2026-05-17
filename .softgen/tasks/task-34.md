---
title: Complete Application Translations
status: todo
priority: high
type: chore
tags:
- i18n
- translations
- sv
- es
created_by: softgen
created_at: '2026-05-17'
position: 34
---

## Notes
The application's English (`en`) locale has a complete set of translations in `src/lib/i18n.ts`, but the Swedish (`sv`) and Spanish (`es`) locales are currently missing most of the keys (they only have `nav` and `property.spotCheck` defined). We need to fill in the missing dictionary keys for Swedish and Spanish to provide a fully localized experience for cross-border users.

## Checklist
- [x] Add missing Swedish (sv) translations to `src/lib/i18n.ts` for: `home`, `property` (search, profile, compliance, notFound), `identity`, `cases`, `admin`, and `common`
- [x] Add missing Spanish (es) translations to `src/lib/i18n.ts` for: `home`, `property` (search, profile, compliance, notFound), `identity`, `cases`, `admin`, and `common`
- [x] Verify that the nested object structures for `sv` and `es` exactly match the structure defined in the `en` locale

## Acceptance
- Switching the application language to Swedish fully translates the homepage, property search, and verification cases
- Switching the application language to Spanish fully translates the homepage, property search, and verification cases
