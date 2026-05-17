---
title: Admin role-based access control (RBAC)
status: done
priority: high
type: feature
tags:
- auth
- security
- admin
created_by: softgen
created_at: 2026-05-17
position: 33
---

## Notes
Currently, any logged-in user can access the `/admin` routes and see the "Admin" link in the navigation bar. We need to implement proper Role-Based Access Control (RBAC) to restrict admin access.
The database already uses Row Level Security (RLS) to grant admin privileges to `@xtrust.com` emails, but the frontend needs to enforce this as well.

The goal is to restrict the `/admin` pages and navigation links to authorized administrators only, falling back to a "Not Authorized" view or redirecting non-admins.

## Checklist
- [x] Update `AuthUser` interface and `AuthService.ts` to expose an `isAdmin` boolean (derived from user metadata, role, or the `@xtrust.com` email domain convention).
- [x] Create a new `AdminRoute` component (wrapping `ProtectedRoute`) that verifies the user has admin privileges. If they don't, render a 403 Not Authorized message or redirect to `/`.
- [x] Apply the new `AdminRoute` wrapper to `src/pages/admin/index.tsx`, `src/pages/admin/audit.tsx`, and `src/pages/admin/gdpr.tsx`.
- [x] Update `src/components/Navigation.tsx` so the "Admin" link only renders if the current `user` has the `isAdmin` flag set to true.

## Acceptance
- Non-admin logged-in users do not see the "Admin" link in the top navigation.
- If a non-admin user navigates directly to `/admin`, they are prevented from viewing the page content (e.g., redirected or shown an error).
- Users with `@xtrust.com` emails (or however the admin flag is defined) can see the navigation link and access the admin pages normally.
