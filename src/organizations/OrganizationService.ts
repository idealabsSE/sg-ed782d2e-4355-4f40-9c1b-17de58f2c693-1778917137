import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
export type OrganizationRole = Database["public"]["Tables"]["organization_roles"]["Row"];

export interface OrganizationWithRole extends Organization {
  role: string;
  permissions: Record<string, boolean>;
}

export interface MemberWithProfile extends OrganizationMember {
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
  role: {
    name: string;
    permissions: Record<string, boolean>;
  };
}

export class OrganizationService {
  /**
   * Get all organizations the current user belongs to
   */
  static async getUserOrganizations(): Promise<OrganizationWithRole[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        organization_id,
        role_id,
        organizations!inner(
          id,
          name,
          slug,
          locale,
          settings,
          branding,
          created_by,
          created_at,
          updated_at
        ),
        organization_roles!inner(
          name,
          permissions
        )
      `)
      .eq("user_id", session.session.user.id)
      .eq("status", "active");

    console.log("getUserOrganizations:", { data, error });
    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item.organizations,
      role: item.organization_roles.name,
      permissions: (item.organization_roles.permissions || {}) as Record<string, boolean>,
    }));
  }

  /**
   * Get a single organization by ID
   */
  static async getOrganization(orgId: string): Promise<OrganizationWithRole> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        organization_id,
        role_id,
        organizations!inner(
          id,
          name,
          slug,
          locale,
          settings,
          branding,
          created_by,
          created_at,
          updated_at
        ),
        organization_roles!inner(
          name,
          permissions
        )
      `)
      .eq("organization_id", orgId)
      .eq("user_id", session.session.user.id)
      .eq("status", "active")
      .single();

    console.log("getOrganization:", { data, error });
    if (error) throw error;

    return {
      ...data.organizations,
      role: data.organization_roles.name,
      permissions: (data.organization_roles.permissions || {}) as Record<string, boolean>,
    };
  }

  /**
   * Create a new organization
   */
  static async createOrganization(input: {
    name: string;
    slug: string;
    locale?: string;
  }): Promise<Organization> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name: input.name,
        slug: input.slug,
        locale: input.locale || "en",
        created_by: session.session.user.id,
      })
      .select()
      .single();

    console.log("createOrganization:", { data, error });
    if (error) throw error;
    return data;
  }

  /**
   * Update organization settings
   */
  static async updateOrganization(
    orgId: string,
    updates: Partial<Pick<Organization, "name" | "locale" | "settings" | "branding">>
  ): Promise<Organization> {
    const { data, error } = await supabase
      .from("organizations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orgId)
      .select()
      .single();

    console.log("updateOrganization:", { data, error });
    if (error) throw error;
    return data;
  }

  /**
   * Get all members of an organization
   */
  static async getOrganizationMembers(orgId: string): Promise<MemberWithProfile[]> {
    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        id,
        organization_id,
        user_id,
        role_id,
        invited_by,
        invited_at,
        joined_at,
        status,
        profiles!organization_members_user_id_fkey(
          id,
          email,
          full_name
        ),
        organization_roles!organization_members_role_id_fkey(
          name,
          permissions
        )
      `)
      .eq("organization_id", orgId)
      .order("joined_at", { ascending: false });

    console.log("getOrganizationMembers:", { data, error });
    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      user: {
        id: item.profiles.id,
        email: item.profiles.email,
        full_name: item.profiles.full_name,
      },
      role: {
        name: item.organization_roles.name,
        permissions: (item.organization_roles.permissions || {}) as Record<string, boolean>,
      },
    }));
  }

  /**
   * Invite a user to an organization
   */
  static async inviteMember(
    orgId: string,
    userEmail: string,
    roleId: string
  ): Promise<OrganizationMember> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (profileError) throw new Error("User not found");

    const { data, error } = await supabase
      .from("organization_members")
      .insert({
        organization_id: orgId,
        user_id: profile.id,
        role_id: roleId,
        invited_by: session.session.user.id,
        status: "pending",
      })
      .select()
      .single();

    console.log("inviteMember:", { data, error });
    if (error) throw error;
    return data;
  }

  /**
   * Accept an organization invitation
   */
  static async acceptInvitation(memberId: string): Promise<OrganizationMember> {
    const { data, error } = await supabase
      .from("organization_members")
      .update({
        status: "active",
        joined_at: new Date().toISOString(),
      })
      .eq("id", memberId)
      .select()
      .single();

    console.log("acceptInvitation:", { data, error });
    if (error) throw error;
    return data;
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    memberId: string,
    roleId: string
  ): Promise<OrganizationMember> {
    const { data, error } = await supabase
      .from("organization_members")
      .update({ role_id: roleId })
      .eq("id", memberId)
      .select()
      .single();

    console.log("updateMemberRole:", { data, error });
    if (error) throw error;
    return data;
  }

  /**
   * Remove a member from an organization
   */
  static async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);

    console.log("removeMember:", { error });
    if (error) throw error;
  }

  /**
   * Get all roles for an organization
   */
  static async getOrganizationRoles(orgId: string): Promise<OrganizationRole[]> {
    const { data, error } = await supabase
      .from("organization_roles")
      .select("*")
      .eq("organization_id", orgId)
      .order("name");

    console.log("getOrganizationRoles:", { data, error });
    if (error) throw error;
    return data || [];
  }

  /**
   * Create a custom role
   */
  static async createRole(
    orgId: string,
    name: string,
    permissions: Record<string, boolean>
  ): Promise<OrganizationRole> {
    const { data, error } = await supabase
      .from("organization_roles")
      .insert({
        organization_id: orgId,
        name,
        permissions,
        is_system_role: false,
      })
      .select()
      .single();

    console.log("createRole:", { data, error });
    if (error) throw error;
    return data;
  }

  /**
   * Get pending invitations for the current user
   */
  static async getPendingInvitations(): Promise<Array<OrganizationMember & { organization: Organization }>> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        *,
        organizations!inner(*)
      `)
      .eq("user_id", session.session.user.id)
      .eq("status", "pending");

    console.log("getPendingInvitations:", { data, error });
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...item,
      organization: item.organizations,
    }));
  }
}