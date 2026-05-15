---
title: Supabase Security Baseline (RLS & Vault)
status: todo
priority: urgent
type: chore
tags:
- security
- rls
- backend
created_by: softgen
created_at: 2026-05-15
position: 17
---

## Notes
Implement the strict security requirements detailed in the PRD. This includes establishing Row Level Security (RLS) on all non-public tables, configuring private storage buckets for documents, and migrating all provider API keys to Supabase Vault.

## Checklist
- [ ] Review and strengthen RLS policies on `verifications`, `cases`, `case_parties`, and `ownership_documents` tables
- [ ] Configure Supabase Storage bucket for identity/ownership documents with private access only
- [ ] Set up Supabase Vault for identity provider secrets (TIC/Authway, Verifik API keys)
- [ ] Audit Edge Functions to ensure servicerole keys are properly secured and never exposed
- [ ] Create security validation tests for RLS and storage access patterns

## Acceptance
- No user data can be queried without an authenticated session and matching case/role.
- Documents are inaccessible without a temporary signed URL.
- All secrets are managed via Vault/environment and never hardcoded in Edge Functions.
