---
title: Global Layout and Localization Setup
status: in_progress
priority: urgent
type: feature
tags: [layout, i18n, design-system]
created_by: softgen
created_at: 2026-05-15
position: 1
---

## Notes
Establish the core application shell with multi-language support (English, Swedish, Spanish) and the institutional trust design system. This task sets up the foundational navigation, locale switching, and design tokens that all subsequent features will inherit.

## Checklist
- [x] Set up i18n framework with English, Swedish, Spanish
- [x] Create LocaleContext and useTranslation hook
- [x] Apply design system: Deep Navy (#1A2332), Trust Emerald (#1B7F5A), IBM Plex Sans/Mono
- [x] Update globals.css with design tokens and typography
- [x] Configure Tailwind with custom fonts and colors
- [x] Build Navigation component with locale switcher
- [x] Create main layout wrapper in _app.tsx
- [x] Build landing page (index.tsx) with hero and feature cards
- [ ] Add footer with legal links and language selector

## Acceptance
- User can switch between English, Swedish, and Spanish via the navigation dropdown.
- The interface reflects the Scandinavian minimalism aesthetic with sharp borders, generous whitespace, and high-contrast design.
- The navigation bar is responsive and anchors the core verification workflows.