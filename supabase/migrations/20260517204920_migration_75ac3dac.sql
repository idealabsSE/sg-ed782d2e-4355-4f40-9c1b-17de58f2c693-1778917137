-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'en',
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT organizations_locale_check CHECK (locale IN ('en', 'sv', 'es'))
);

-- Create organization_roles lookup table
CREATE TABLE organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT organization_roles_unique UNIQUE (organization_id, name)
);

-- Create organization_members junction table
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES organization_roles(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  CONSTRAINT organization_members_unique UNIQUE (organization_id, user_id),
  CONSTRAINT organization_members_status_check CHECK (status IN ('pending', 'active', 'inactive'))
);

-- Add organization_id to cases table
ALTER TABLE cases ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to properties table  
ALTER TABLE properties ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_organization_roles_organization_id ON organization_roles(organization_id);
CREATE INDEX idx_cases_organization_id ON cases(organization_id);
CREATE INDEX idx_properties_organization_id ON properties(organization_id);

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations table
CREATE POLICY "members_read_own_orgs" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "creators_insert_orgs" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "admins_update_orgs" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT om.organization_id FROM organization_members om
      JOIN organization_roles r ON r.id = om.role_id
      WHERE om.user_id = auth.uid() 
        AND om.status = 'active'
        AND (r.permissions->>'manage_settings')::boolean = true
    )
  );

-- RLS Policies for organization_roles
CREATE POLICY "members_read_org_roles" ON organization_roles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "admins_manage_org_roles" ON organization_roles
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      JOIN organization_roles r ON r.id = om.role_id
      WHERE om.user_id = auth.uid() 
        AND om.status = 'active'
        AND (r.permissions->>'manage_roles')::boolean = true
    )
  );

-- RLS Policies for organization_members
CREATE POLICY "members_read_org_members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "admins_manage_members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      JOIN organization_roles r ON r.id = om.role_id
      WHERE om.user_id = auth.uid() 
        AND om.status = 'active'
        AND (r.permissions->>'manage_members')::boolean = true
    )
  );

CREATE POLICY "invited_users_join" ON organization_members
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status IN ('active', 'inactive'));

-- Update cases RLS to include org-scoped access
DROP POLICY IF EXISTS "select_related_cases" ON cases;
CREATE POLICY "select_related_cases" ON cases
  FOR SELECT USING (
    (auth.uid() = created_by) 
    OR (EXISTS (
      SELECT 1 FROM case_parties 
      WHERE case_parties.case_id = cases.id 
        AND case_parties.user_id = auth.uid()
    ))
    OR (organization_id IS NOT NULL AND organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ))
  );

DROP POLICY IF EXISTS "update_own_cases" ON cases;
CREATE POLICY "update_own_cases" ON cases
  FOR UPDATE USING (
    (auth.uid() = created_by) 
    OR (EXISTS (
      SELECT 1 FROM case_parties 
      WHERE case_parties.case_id = cases.id 
        AND case_parties.user_id = auth.uid()
    ))
    OR (organization_id IS NOT NULL AND organization_id IN (
      SELECT om.organization_id FROM organization_members om
      JOIN organization_roles r ON r.id = om.role_id
      WHERE om.user_id = auth.uid() 
        AND om.status = 'active'
        AND (r.permissions->>'manage_cases')::boolean = true
    ))
  );

-- Function to create default roles when org is created
CREATE OR REPLACE FUNCTION create_default_org_roles()
RETURNS TRIGGER AS $$
DECLARE
  owner_role_id UUID;
  admin_role_id UUID;
  member_role_id UUID;
BEGIN
  -- Create Owner role
  INSERT INTO organization_roles (organization_id, name, permissions, is_system_role)
  VALUES (
    NEW.id,
    'Owner',
    '{"manage_settings": true, "manage_roles": true, "manage_members": true, "manage_cases": true, "manage_properties": true}'::jsonb,
    true
  )
  RETURNING id INTO owner_role_id;
  
  -- Create Admin role
  INSERT INTO organization_roles (organization_id, name, permissions, is_system_role)
  VALUES (
    NEW.id,
    'Admin',
    '{"manage_settings": false, "manage_roles": true, "manage_members": true, "manage_cases": true, "manage_properties": true}'::jsonb,
    true
  )
  RETURNING id INTO admin_role_id;
  
  -- Create Member role
  INSERT INTO organization_roles (organization_id, name, permissions, is_system_role)
  VALUES (
    NEW.id,
    'Member',
    '{"manage_settings": false, "manage_roles": false, "manage_members": false, "manage_cases": true, "manage_properties": false}'::jsonb,
    true
  )
  RETURNING id INTO member_role_id;
  
  -- Add creator as Owner
  INSERT INTO organization_members (organization_id, user_id, role_id, invited_by, status, joined_at)
  VALUES (NEW.id, NEW.created_by, owner_role_id, NEW.created_by, 'active', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create default roles
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_org_roles();

-- Comment tables for documentation
COMMENT ON TABLE organizations IS 'Multi-tenant organizations for B2B customers';
COMMENT ON TABLE organization_roles IS 'Custom roles and permissions per organization';
COMMENT ON TABLE organization_members IS 'User membership in organizations with role assignments';