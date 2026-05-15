---
title: Supabase Database Schema & RLS Policies
status: done
priority: urgent
type: feature
tags: [database, schema, supabase, rls]
created_by: softgen
created_at: 2026-05-15
position: 8
---

## Notes
Now that Supabase is connected, we need to design and implement the database schema to support the cross-border verification flows. This includes storing property data, user verifications, multi-party cases, and ownership documents. Proper Row-Level Security (RLS) is critical to protect sensitive identity and property data.

## Checklist
- [x] Create `properties` table (cadastral_reference, address, license_status)
- [x] Create `verifications` table linked to profiles (role, country, document_type, status)
- [x] Create `cases` and `case_parties` tables for B2B multi-party workflow tracking
- [x] Create `ownership_documents` table to track Nota Simple uploads and match status
- [x] Apply T1 RLS policies (Private user data) to `verifications` and `ownership_documents`
- [x] Apply T2 RLS policies (Shared/Auth) to `cases`, `case_parties`, and `properties`

## Acceptance
- The database schema accurately reflects the domain models (Properties, Verifications, Cases).
- RLS policies ensure users can only see their own identity documents and cases they are party to.
- TypeScript types are successfully generated and synced.