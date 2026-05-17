# Organizations Domain — Multi-Tenancy & RBAC

## Overview
Organizations enable B2B customers (agencies, property managers) to manage multiple clients, cases, and team members under a single account. This implements the multi-tenant architecture with role-based access control (RBAC).

## Database Schema

### `organizations`
Main organization entity with settings and branding.

**Key fields:**
- `id` (UUID) — Primary identifier
- `name` (TEXT) — Organization name
- `slug` (TEXT, UNIQUE) — URL-friendly identifier
- `locale` (TEXT) — Default language (en/sv/es)
- `settings` (JSONB) — Notification preferences, feature flags
- `branding` (JSONB) — Color scheme, logo references
- `created_by` (UUID) — User who created the org

### `organization_members`
Links users to organizations with roles.

**Key fields:**
- `id` (UUID) — Primary identifier
- `organization_id` (UUID) — FK to organizations
- `user_id` (UUID) — FK to profiles
- `role_id` (UUID) — FK to organization_roles
- `status` (TEXT) — `pending`, `active`, `inactive`
- `invited_by` (UUID) — Who sent the invitation
- `joined_at` (TIMESTAMP) — When invitation was accepted

### `organization_roles`
Defines permissions for organization members.

**System roles (created automatically):**
- **Owner** — Full control: manage members, settings, billing, delete org
- **Admin** — Manage members and settings (cannot delete org)
- **Member** — Read/write access to cases and properties

**Permission structure (JSONB):**
```json
{
  "manage_members": true,
  "manage_settings": true,
  "manage_billing": false,
  "delete_organization": false,
  "create_cases": true,
  "view_cases": true,
  "edit_cases": true,
  "delete_cases": false
}
```

## RLS Patterns for Organization-Scoped Data

### Pattern 1: Org-owned entities (properties, cases)
For tables that belong to an organization:

```sql
-- Example: properties table
ALTER TABLE properties ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- SELECT: Members can view org data
CREATE POLICY "org_members_select" ON properties
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- INSERT: Active members can create
CREATE POLICY "org_members_insert" ON properties
FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- UPDATE: Members with edit permission
CREATE POLICY "org_members_update" ON properties
FOR UPDATE USING (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    JOIN organization_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid()
      AND om.status = 'active'
      AND (r.permissions->>'edit_cases')::boolean = true
  )
);

-- DELETE: Only Owner/Admin roles
CREATE POLICY "org_admin_delete" ON properties
FOR DELETE USING (
  organization_id IN (
    SELECT om.organization_id FROM organization_members om
    JOIN organization_roles r ON om.role_id = r.id
    WHERE om.user_id = auth.uid()
      AND om.status = 'active'
      AND r.name IN ('Owner', 'Admin')
  )
);
```

### Pattern 2: Cross-org references (verification_cases)
Cases may reference properties from different orgs (tenant's org requesting landlord's property):

```sql
-- Cases belong to requestor's org, but reference external properties
CREATE POLICY "case_creator_access" ON verification_cases
FOR ALL USING (
  created_by = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);
```

### Pattern 3: Permission-based policies
Check specific permissions from the role:

```sql
CREATE POLICY "permission_based_delete" ON cases
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    JOIN organization_roles r ON om.role_id = r.id
    WHERE om.organization_id = cases.organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND (r.permissions->>'delete_cases')::boolean = true
  )
);
```

## Service Layer Usage

### Creating an organization
```typescript
const org = await OrganizationService.createOrganization({
  name: "Acme Property Management",
  slug: "acme-property",
  locale: "en"
});
// Creator is automatically assigned Owner role via trigger
```

### Managing members
```typescript
// Invite a user
await OrganizationService.inviteMember(
  organizationId,
  "colleague@example.com",
  adminRoleId
);

// User accepts invitation
await OrganizationService.acceptInvitation(memberId);

// Change role
await OrganizationService.updateMemberRole(memberId, memberRoleId);

// Remove member
await OrganizationService.removeMember(memberId);
```

### Updating settings
```typescript
await OrganizationService.updateOrganization(organizationId, {
  locale: "sv",
  settings: {
    email_notifications: true,
    case_updates: true
  },
  branding: {
    primary_color: "#2B5BA6"
  }
});
```

## UI Components

### `<OrganizationSwitcher />`
Dropdown for switching between user's organizations. Auto-selects first org on mount.

```typescript
<OrganizationSwitcher
  currentOrgId={currentOrgId}
  onOrgChange={setCurrentOrgId}
/>
```

### `<CreateOrganizationDialog />`
Modal for creating new organizations.

```typescript
<CreateOrganizationDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  onSuccess={() => refetchOrganizations()}
/>
```

### `<MemberManagement />`
Full member management interface with invite/remove/role assignment.

```typescript
<MemberManagement
  organizationId={currentOrgId}
  canManageMembers={hasManageMembersPermission}
/>
```

### `<OrganizationSettings />`
Settings page for org name, locale, branding, notifications.

```typescript
<OrganizationSettings
  organizationId={currentOrgId}
  canManageSettings={hasManageSettingsPermission}
/>
```

## Migration Guide for New Features

When adding a new org-scoped table:

1. **Add `organization_id` column:**
```sql
ALTER TABLE your_table ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

2. **Create RLS policies using Pattern 1 above**

3. **Update service layer to scope queries:**
```typescript
const { data } = await supabase
  .from("your_table")
  .select("*")
  .eq("organization_id", currentOrgId);
```

4. **Check permissions in UI:**
```typescript
const hasPermission = organization.permissions.your_permission;
if (hasPermission) {
  // Show edit button
}
```

## Testing Multi-Tenancy Isolation

Verify data isolation:
1. Create two organizations with different users
2. Add test data to each org
3. Confirm User A cannot query User B's org data
4. Test cross-org case creation (should work per Pattern 2)
5. Verify permission-based operations (delete, manage members)

## Future Enhancements
- Custom role creation (beyond Owner/Admin/Member)
- Org-level billing and subscription management
- Audit log for org-level actions
- Org-scoped analytics dashboard
- Cross-org collaboration workflows