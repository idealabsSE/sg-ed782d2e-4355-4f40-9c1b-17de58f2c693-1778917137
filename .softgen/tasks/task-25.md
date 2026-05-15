---
title: Route Protection and Navigation Update
status: done
priority: high
type: feature
tags: [auth, routing, frontend]
created_by: agent
created_at: 2026-05-15T18:27:01Z
position: 25
---

## Notes
Implement route protection to ensure all application features (verification flows, cases, admin) require authentication. Unauthenticated users attempting to access protected routes are redirected to the login page.

## Checklist
- [x] Create ProtectedRoute component that checks auth state
- [x] Wrap all verify/* pages with ProtectedRoute
- [x] Wrap cases/* pages with ProtectedRoute
- [x] Wrap admin/* pages with ProtectedRoute
- [x] Update Navigation to hide protected links when not logged in

## Acceptance
- Unauthenticated users attempting to access /verify, /cases, or /admin are redirected to /auth/login.
- The navigation bar shows "Log in" and "Register" buttons for guests, or user email and "Sign out" for authenticated users.
- Clicking "Sign out" successfully ends the session and returns the user to a public page.