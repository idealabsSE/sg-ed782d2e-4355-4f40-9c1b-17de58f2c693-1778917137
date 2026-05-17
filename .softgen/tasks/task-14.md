---
title: Organization Multi-Tenancy System
status: todo
priority: medium
type: feature
tags:
- backend
- organizations
- multi-tenant
- rbac
created_by: softgen
created_at: 2026-05-15
position: 14
---

## Notes
Implement organization structure for B2B customers per PRD Section 3.3 and Data Domain. Agencies and property managers need to manage multiple clients, cases, and team members under a single organizational account.

## Checklist
- [x] Create `organizations` table with settings and locale preference
- [x] Build `organization_members` linking users to orgs
- [x] Implement `organization_roles` for permission management
- [x] Add RLS policies for org-scoped data access
- [x] Create org creation and setup workflow
- [x] Build member invitation system
- [x] Implement role assignment interface
- [x] Add org-level settings page (locale, branding, notification preferences)
- [x] Document org-scoped RLS patterns for new features

## Acceptance
- Users can create and manage organizations
- Org admins can invite members and assign roles
- RLS correctly enforces org-scoped access to cases and properties
- Org-level locale preference applies to all members by default
- Multi-tenant data isolation verified across all features
