# Auditability Requirements for Reviewers

## Overview
This document outlines the audit logging requirements and best practices for internal reviewers working with sensitive data in X Trust.

## Audit Logging Scope

### Automatically Logged Actions
All of the following actions are automatically logged with user identity, timestamp, IP address, and metadata:

1. **Document Access**
   - Viewing verification documents (passports, NIE, DNI)
   - Downloading Nota Simple documents
   - Accessing property compliance documents
   - Viewing identity verification results

2. **Case Management**
   - Opening case details
   - Updating case status
   - Adding case notes or comments
   - Assigning cases to reviewers
   - Creating new case entries

3. **Profile Access**
   - Viewing user profiles
   - Accessing identity verification data
   - Viewing financial credibility information
   - Viewing property ownership records

4. **Administrative Actions**
   - Approving/rejecting verification requests
   - Modifying trust scores
   - Updating property compliance status
   - Creating manual verification overrides

## How to Use Audit Logging

### In Your Code
When implementing new features that access sensitive data, use the `auditService`:

```typescript
import { auditService } from "@/services/auditService";

// Log a view action
await auditService.logAccess({
  action: "view",
  resourceType: "document",
  resourceId: documentId,
  metadata: { documentType: "passport" }
});

// Log a download action
await auditService.logAccess({
  action: "download",
  resourceType: "document",
  resourceId: documentId,
  metadata: { format: "pdf", documentType: "nota_simple" }
});
```

### Supported Actions
- `view` - Viewing/reading data
- `download` - Downloading documents or exporting data
- `edit` - Modifying existing records
- `delete` - Removing data (use sparingly)
- `create` - Creating new records

### Supported Resource Types
- `verification` - Identity/ownership verifications
- `case` - Case management entries
- `document` - Files and attachments
- `profile` - User profiles and personal data

## Security Incident Reporting

### When to Report
Report security incidents when you observe:
- Suspicious access patterns (unusual volume or timing)
- Unauthorized access attempts
- Data integrity issues
- Privacy violations
- System misuse

### How to Report
```typescript
import { auditService } from "@/services/auditService";

await auditService.reportIncident({
  severity: "high", // low, medium, high, critical
  incidentType: "suspicious_access", // or unauthorized_attempt, data_breach, anomaly
  description: "User attempted to access case files outside assigned region",
  affectedUserId: userId,
  metadata: { caseId, attemptedAction: "view" }
});
```

## Anomaly Detection

### Automated Alerts
The system automatically detects and reports:
- **Volume anomalies**: >50 actions per minute from a single user
- **Pattern anomalies**: Unusual access sequences (e.g., bulk downloads)
- **Time anomalies**: Access outside normal working hours (future enhancement)

### Alert Thresholds
- **Low**: 30-50 actions/minute
- **Medium**: 50-100 actions/minute
- **High**: >100 actions/minute
- **Critical**: Suspected data exfiltration or breach

Alerts trigger automatic security incident reports viewable in the Admin panel.

## Compliance & Data Protection

### GDPR Requirements
1. **Purpose Limitation**: Only access data necessary for your assigned tasks
2. **Data Minimization**: View only the fields required for verification
3. **Storage Limitation**: Do not download or save sensitive data locally
4. **Integrity & Confidentiality**: Protect access credentials and session tokens

### Retention Policies
- Audit logs: Retained for 7 years (regulatory requirement)
- Security incidents: Retained indefinitely until resolved
- Personal data access: Logged per GDPR Article 15 (right of access)

### User Rights
Users can request:
- Access to their audit logs (who viewed their data, when)
- Correction of inaccurate data
- Erasure (right to be forgotten) - triggers cascading audit logs
- Data portability - generates audit trail

## Admin Access

### Viewing Audit Logs
Admins with `@xtrust.com` email can:
1. Navigate to `/admin/audit`
2. Filter by user, action, resource type, date range
3. Export logs as CSV for compliance reports
4. Review security incidents and update status

### Query Examples
- "Who viewed property ID abc123 in the last 30 days?"
- "Show all document downloads by user xyz between Jan-Mar 2026"
- "List all failed authorization attempts this week"
- "Export all case access logs for compliance audit"

### Best Practices
1. **Regular Reviews**: Check audit logs weekly for anomalies
2. **Incident Response**: Investigate "high" and "critical" incidents within 24 hours
3. **Access Controls**: Verify reviewer permissions quarterly
4. **Training**: Complete security awareness training annually
5. **Documentation**: Update this document when adding new logged actions

## Testing Audit Logging

### Development Environment
Test audit logging in development by:
1. Performing actions that should be logged
2. Checking the `access_audit_log` table in Supabase
3. Verifying anomaly detection with rapid successive actions
4. Confirming security incidents appear in admin panel

### Manual Verification
```sql
-- Check recent audit logs
SELECT * FROM access_audit_log 
ORDER BY created_at DESC 
LIMIT 50;

-- Check for anomalies
SELECT user_id, COUNT(*) as action_count 
FROM access_audit_log 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id 
HAVING COUNT(*) > 50;

-- Check security incidents
SELECT * FROM security_incidents 
WHERE status = 'open' 
ORDER BY created_at DESC;
```

## Questions & Support
For questions about audit logging or security incidents:
- Technical: Contact development team
- Compliance: Contact legal/compliance team
- Security: Report to security@xtrust.com