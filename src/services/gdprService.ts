import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type DSAR = Tables<"data_subject_requests">;
type DSARInsert = Omit<DSAR, "id" | "created_at" | "updated_at" | "submitted_at" | "deadline">;
type ProcessingRecord = Tables<"data_processing_records">;
type RetentionPolicy = Tables<"retention_policies">;
type Vendor = Tables<"vendor_registry">;
type ConsentRecord = Tables<"consent_records">;

export const gdprService = {
  // ====== DSAR Management ======
  async submitDSAR(data: {
    request_type: "access" | "erasure" | "portability" | "rectification" | "restriction";
    requester_email: string;
    notes?: string;
  }) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30); // 30 days GDPR deadline

    const { data: result, error } = await supabase
      .from("data_subject_requests")
      .insert({
        request_type: data.request_type,
        requester_email: data.requester_email,
        status: "pending",
        deadline: deadline.toISOString(),
        notes: data.notes || null,
      })
      .select()
      .single();

    console.log("submitDSAR:", { result, error });
    if (error) throw error;
    return result;
  },

  async listDSARs(filters?: { status?: string; overdue?: boolean }) {
    let query = supabase
      .from("data_subject_requests")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.overdue) {
      query = query.lt("deadline", new Date().toISOString()).neq("status", "completed");
    }

    const { data, error } = await query;
    console.log("listDSARs:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async updateDSARStatus(
    id: string,
    status: "pending" | "in_progress" | "completed" | "rejected",
    updates?: {
      response_data?: Record<string, unknown>;
      rejection_reason?: string;
      notes?: string;
    }
  ) {
    const updateData: Partial<DSAR> = {
      status,
      updated_at: new Date().toISOString(),
      ...updates,
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) {
        updateData.completed_by = session.session.user.id;
      }
    }

    const { data, error } = await supabase
      .from("data_subject_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    console.log("updateDSARStatus:", { data, error });
    if (error) throw error;
    return data;
  },

  async processDSARAccess(userId: string) {
    // Collect all user data across tables
    const [profiles, verifications, cases, consents, audits] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("verifications").select("*").eq("user_id", userId),
      supabase.from("cases").select("*").eq("requester_id", userId),
      supabase.from("consent_records").select("*").eq("user_id", userId),
      supabase.from("audit_logs").select("*").eq("user_id", userId),
    ]);

    return {
      profile: profiles.data,
      verifications: verifications.data || [],
      cases: cases.data || [],
      consents: consents.data || [],
      audit_logs: audits.data || [],
      exported_at: new Date().toISOString(),
    };
  },

  async processDSARErasure(userId: string) {
    // Anonymize user data (preserve referential integrity for cases/verifications)
    const anonymizedEmail = `deleted_${userId.substring(0, 8)}@anonymized.local`;

    const { error } = await supabase
      .from("profiles")
      .update({
        email: anonymizedEmail,
        full_name: "Deleted User",
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    // Delete consent records (no longer relevant)
    await supabase.from("consent_records").delete().eq("user_id", userId);

    return { anonymized: true, user_id: userId };
  },

  // ====== Processing Records ======
  async listProcessingRecords() {
    const { data, error } = await supabase
      .from("data_processing_records")
      .select("*")
      .eq("is_active", true)
      .order("activity_name");

    console.log("listProcessingRecords:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async createProcessingRecord(record: Omit<ProcessingRecord, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("data_processing_records")
      .insert(record)
      .select()
      .single();

    console.log("createProcessingRecord:", { data, error });
    if (error) throw error;
    return data;
  },

  async updateProcessingRecord(id: string, updates: Partial<ProcessingRecord>) {
    const { data, error } = await supabase
      .from("data_processing_records")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    console.log("updateProcessingRecord:", { data, error });
    if (error) throw error;
    return data;
  },

  // ====== Retention Policies ======
  async listRetentionPolicies() {
    const { data, error } = await supabase
      .from("retention_policies")
      .select("*")
      .eq("is_active", true)
      .order("data_category");

    console.log("listRetentionPolicies:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async updateRetentionPolicy(id: string, updates: Partial<RetentionPolicy>) {
    const { data, error } = await supabase
      .from("retention_policies")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    console.log("updateRetentionPolicy:", { data, error });
    if (error) throw error;
    return data;
  },

  async recordRetentionSweep(policyId: string) {
    const { data, error } = await supabase
      .from("retention_policies")
      .update({ last_sweep_at: new Date().toISOString() })
      .eq("id", policyId)
      .select()
      .single();

    console.log("recordRetentionSweep:", { data, error });
    if (error) throw error;
    return data;
  },

  // ====== Vendor Registry ======
  async listVendors(filters?: { status?: string }) {
    let query = supabase
      .from("vendor_registry")
      .select("*")
      .order("vendor_name");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    console.log("listVendors:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async createVendor(vendor: Omit<Vendor, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("vendor_registry")
      .insert(vendor)
      .select()
      .single();

    console.log("createVendor:", { data, error });
    if (error) throw error;
    return data;
  },

  async updateVendor(id: string, updates: Partial<Vendor>) {
    const { data, error } = await supabase
      .from("vendor_registry")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    console.log("updateVendor:", { data, error });
    if (error) throw error;
    return data;
  },

  // ====== Consent Management ======
  async recordConsent(data: {
    user_id: string;
    consent_type: string;
    purpose: string;
    granted: boolean;
    consent_method: string;
    ip_address?: string;
    user_agent?: string;
  }) {
    const consentData: Omit<ConsentRecord, "id" | "created_at" | "updated_at"> = {
      ...data,
      granted_at: data.granted ? new Date().toISOString() : null,
      withdrawn_at: !data.granted ? new Date().toISOString() : null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
    };

    const { data: result, error } = await supabase
      .from("consent_records")
      .insert(consentData)
      .select()
      .single();

    console.log("recordConsent:", { result, error });
    if (error) throw error;
    return result;
  },

  async getUserConsents(userId: string) {
    const { data, error } = await supabase
      .from("consent_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    console.log("getUserConsents:", { data, error });
    if (error) throw error;
    return data || [];
  },

  async withdrawConsent(userId: string, consentType: string) {
    const { data, error } = await supabase
      .from("consent_records")
      .insert({
        user_id: userId,
        consent_type: consentType,
        purpose: "Consent withdrawn by user",
        granted: false,
        withdrawn_at: new Date().toISOString(),
        consent_method: "user_settings",
      })
      .select()
      .single();

    console.log("withdrawConsent:", { data, error });
    if (error) throw error;
    return data;
  },

  // ====== Dashboard Stats ======
  async getComplianceStats() {
    const [dsars, vendors, policies] = await Promise.all([
      supabase.from("data_subject_requests").select("status", { count: "exact" }),
      supabase.from("vendor_registry").select("status, dpa_signed", { count: "exact" }),
      supabase.from("retention_policies").select("*"),
    ]);

    const overdueDSARs = await supabase
      .from("data_subject_requests")
      .select("id", { count: "exact" })
      .lt("deadline", new Date().toISOString())
      .neq("status", "completed");

    return {
      dsar_total: dsars.count || 0,
      dsar_pending: dsars.data?.filter((d) => d.status === "pending").length || 0,
      dsar_overdue: overdueDSARs.count || 0,
      vendors_total: vendors.count || 0,
      vendors_without_dpa: vendors.data?.filter((v) => !v.dpa_signed).length || 0,
      retention_policies: policies.data?.length || 0,
    };
  },
};