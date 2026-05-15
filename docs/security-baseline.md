# Security Baseline Documentation

## Overview
This document outlines the security implementation for X Trust's Supabase backend, covering Row Level Security (RLS) policies, Storage bucket configuration, and secrets management.

## Row Level Security (RLS)

All tables in the database have RLS enabled. Key security patterns:

### User Data Tables

**`profiles`**
- SELECT: Public (profile info is viewable)
- INSERT: User can create own profile only (`auth.uid() = id`)
- UPDATE: User can update own profile only

**`verifications`**
- SELECT/INSERT/UPDATE/DELETE: User can only access their own verifications (`auth.uid() = user_id`)
- Ensures identity documents and verification status remain private

### Case Management Tables

**`cases`**
- SELECT: User must be case creator OR a case party
- INSERT: Any authenticated user can create a case
- UPDATE: Case creator or case parties can update

**`case_parties`**
- SELECT: User must be a party in the case OR the case creator
- INSERT: Any authenticated user can add parties
- UPDATE: Only case creator can update party status

**`ownership_documents`**
- SELECT: Document uploader OR case parties for related property
- INSERT: User can upload for themselves only
- UPDATE: Document uploader only
- Ensures Nota Simple documents are only visible to authorized parties

### Admin/Audit Tables

**`access_audit_log`**
- SELECT: Admin users only (`email ~~ '%@xtrust.com'`)
- INSERT: Service role only (via Edge Functions)

**`security_incidents`**
- ALL: Admin users only

**`data_subject_requests` (GDPR)**
- SELECT: Requesters can see own requests, admins see all
- INSERT: Users can submit requests for their own email
- UPDATE/DELETE: Admin only

## Storage Security

### Verification Documents Bucket

**Bucket Configuration:**
- Name: `verification-documents`
- Public: `false` (all access via signed URLs)
- File Size Limit: 10MB
- Allowed MIME Types: PDF, JPEG, PNG, WebP

**RLS Policies:**
1. **Upload**: Users can only upload to their own folder (`/{user_id}/...`)
2. **Read**: Users can access:
   - Their own documents
   - Documents from other users in cases they're part of
3. **Update/Delete**: Users can only modify their own documents

**Folder Structure:**
```
verification-documents/
  {user_id}/
    identity/
      {document_id}.pdf
    ownership/
      {document_id}.pdf
```

**Access Pattern:**
```typescript
// Generate signed URL (valid for 1 hour)
const { data, error } = await supabase.storage
  .from('verification-documents')
  .createSignedUrl(`${userId}/identity/${docId}.pdf`, 3600);
```

## Secrets Management

### Supabase Vault

All sensitive credentials are stored in Supabase Vault and accessed only from Edge Functions:

**Secrets to Store:**
1. `TIC_API_KEY` - Swedish BankID provider (TIC/Authway)
2. `TIC_API_SECRET` - TIC authentication secret
3. `VERIFIK_API_KEY` - Spanish identity verification (Verifik)
4. `VERIFIK_API_SECRET` - Verifik authentication secret
5. `GVA_API_TOKEN` - Valencia tourism license API (if protected)

**Setup Commands:**
```bash
# Using Supabase CLI or Management API
supabase secrets set TIC_API_KEY=xxx
supabase secrets set TIC_API_SECRET=xxx
supabase secrets set VERIFIK_API_KEY=xxx
supabase secrets set VERIFIK_API_SECRET=xxx
```

**Edge Function Access:**
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Access secrets via Vault
const { data: secrets } = await supabase.rpc('vault_get', {
  secret_name: 'TIC_API_KEY'
});
```

### Service Role Key Protection

**Rules:**
1. ✅ **ALLOWED**: Use in Edge Functions (server-side only)
2. ✅ **ALLOWED**: Use in secure backend scripts
3. ❌ **NEVER**: Expose in frontend code
4. ❌ **NEVER**: Commit to git (use `.env.local`)
5. ❌ **NEVER**: Log in Edge Functions

**Edge Function Pattern:**
```typescript
// CORRECT - Service role used server-side only
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
```

## Security Testing

### Test Scenarios

**1. Unauthenticated Access (Default Deny)**
```typescript
// Should fail - no session
const { data, error } = await supabase
  .from('verifications')
  .select('*');
expect(error).toBeTruthy();
expect(data).toHaveLength(0);
```

**2. Cross-User Data Access**
```typescript
// User A tries to access User B's verification
const { data, error } = await supabase
  .from('verifications')
  .select('*')
  .eq('id', userBVerificationId);
expect(error).toBeTruthy();
expect(data).toHaveLength(0);
```

**3. Storage Access Without Signed URL**
```typescript
// Should fail - direct access blocked
const response = await fetch(
  `https://{project}.supabase.co/storage/v1/object/public/verification-documents/{userId}/doc.pdf`
);
expect(response.status).toBe(400);
```

**4. Case Party Access**
```typescript
// User B can see User A's verification in shared case
const { data, error } = await supabase
  .from('ownership_documents')
  .select('*')
  .eq('property_id', sharedPropertyId);
expect(error).toBeFalsy();
expect(data).toBeTruthy();
```

## Compliance Notes

### GDPR Requirements
- ✅ All personal data protected by RLS
- ✅ Document access logged in `access_audit_log`
- ✅ Data Subject Requests table for DSAR tracking
- ✅ Retention policies enforced via automated sweep

### Audit Trail
- All access to sensitive resources logged
- Logs immutable (service_role INSERT only)
- Admin-only access to audit logs
- Security incidents tracked separately

## Maintenance

### Regular Security Reviews
1. **Monthly**: Review RLS policies for new tables
2. **Quarterly**: Audit Edge Function secrets usage
3. **Quarterly**: Review storage bucket policies
4. **Annually**: Full security assessment

### Incident Response
1. Security incidents logged in `security_incidents` table
2. Automatic alerts for critical severity
3. Admin dashboard for incident tracking
4. Integration with audit log for forensics