---
title: Document Upload & Secure Storage System
status: done
priority: high
type: feature
tags:
- backend
- storage
- security
- documents
created_by: softgen
created_at: 2026-05-15
position: 11
---

## Notes
Implement secure document upload and retrieval system per PRD Section 9 (Security Requirements). All user documents (ID cards, Nota Simple PDFs, financial evidence) must be stored in private Supabase Storage buckets with access via signed URLs only.

## Checklist
- [x] Create private Storage bucket for verification documents
- [x] Build document upload Edge Function with file validation (type, size, virus scanning path)
- [x] Implement signed URL generation with short expiry (1-hour default)
- [x] Create `person_documents` table for metadata (no file content in DB)
- [x] Add RLS policies for document access (owner + reviewer only)
- [x] Build document retrieval service with audit logging
- [x] Add document type categorization (identity, financial, ownership, other)
- [x] Implement document retention policy enforcement

## Acceptance
- Users can upload documents through verification flows
- Documents stored in private bucket, never publicly accessible
- Signed URLs expire after configured time window
- All document access logged to `access_audit_log`
- Document metadata queryable but file content isolated
