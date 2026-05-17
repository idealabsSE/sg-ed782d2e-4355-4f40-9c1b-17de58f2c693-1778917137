---
title: Auth Triggers & Middleware Hardening
status: todo
priority: high
type: feature
tags: [auth, security, phase-1]
created_by: softgen
created_at: 2026-05-17
position: 25
---

## Notes
Implement the specific authentication requirements detailed in Phase 1.6 of the development plan. This includes backend hooks for user initialization and frontend middleware to enforce strict access control.

## Checklist
- [ ] Create an Edge Function / Postgres Trigger to automatically create a `profiles` row when a new user signs up in Supabase Auth
- [ ] Implement Next.js Middleware to protect all non-public routes
- [ ] Ensure unauthenticated users are seamlessly redirected to the login flow
- [ ] Verify that public routes (like the property compliance search) remain accessible without auth

## Acceptance
- A new user registration automatically yields a corresponding `profiles` record.
- Unauthenticated users cannot access verification, case, or admin pages.
- The middleware successfully intercepts and redirects unauthorized requests.