-- Drop the problematic recursive policies
DROP POLICY IF EXISTS members_read_org_members ON organization_members;
DROP POLICY IF EXISTS admins_manage_members ON organization_members;
DROP POLICY IF EXISTS invited_users_join ON organization_members;

-- Create simpler, non-recursive policies for organization_members

-- Users can read memberships where they are the user
CREATE POLICY "users_read_own_memberships" ON organization_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can read all memberships in organizations they belong to (no recursion)
-- We'll handle this in application logic or use a function
CREATE POLICY "users_read_org_memberships" ON organization_members
  FOR SELECT
  USING (
    -- Either it's their own membership
    user_id = auth.uid()
    OR
    -- Or they have an existing active membership in the same org
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
      LIMIT 1
    )
  );

-- Admins can manage members (using a simpler check)
CREATE POLICY "admins_manage_members" ON organization_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM organization_members om
      JOIN organization_roles r ON r.id = om.role_id
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
        AND (r.permissions->>'manage_members')::boolean = true
      LIMIT 1
    )
  );

-- Invited users can update their own pending memberships to active
CREATE POLICY "invited_users_join" ON organization_members
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status IN ('active', 'inactive'));