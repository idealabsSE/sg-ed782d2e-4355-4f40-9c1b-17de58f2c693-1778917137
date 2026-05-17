---
title: 'Domain Migration: Page Logic Extraction'
status: done
priority: high
type: chore
tags:
- architecture
- refactoring
- pages
created_by: softgen
created_at: 2026-05-17
position: 31
---

## Notes
Next.js requires routes to live in `src/pages/`, but currently, some of these files are carrying heavy domain logic and UI implementation (e.g., `admin/gdpr.tsx` is 370+ lines). To comply with the domain-driven architecture, we need to extract the heavy lifting into domain-level UI views, leaving the page routes as thin wrappers.

## Checklist
- [x] Create `src/privacyandgdpr/ui/GdprAdminDashboard.tsx` and move all the data fetching, state management, and UI rendering from `src/pages/admin/gdpr.tsx` into this new component.
- [x] Update `src/pages/admin/gdpr.tsx` to simply import and render `<GdprAdminDashboard />`.
- [x] Create `src/securityandaudit/ui/AuditLogDashboard.tsx` and move the logic and UI from `src/pages/admin/audit.tsx`.
- [x] Update `src/pages/admin/audit.tsx` to simply import and render `<AuditLogDashboard />`.
- [x] Verify that the `/admin/gdpr` and `/admin/audit` routes still render and function perfectly in the browser.

## Acceptance
- The files `src/pages/admin/gdpr.tsx` and `src/pages/admin/audit.tsx` act only as Next.js route wrappers.
- The heavy UI and logic reside within the domain folders' `ui/` subdirectories.
