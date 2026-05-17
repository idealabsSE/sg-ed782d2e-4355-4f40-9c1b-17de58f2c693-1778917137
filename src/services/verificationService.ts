import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { auditService } from "@/securityandaudit/AuditService";

type Verification = Database["public"]["Tables"]["verifications"]["Row"];
type VerificationInsert = Database["public"]["Tables"]["verifications"]["Insert"];

export const verificationService = {
  /**
   * Create a new identity verification
   */
  async createVerification(
    verification: Omit<VerificationInsert, "user_id">
  ): Promise<{ data: Verification | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error("User not authenticated") };
      }

      const { data, error } = await supabase
        .from("verifications")
        .insert({
          ...verification,
          user_id: user.id,
        })
        .select()
        .single();

      console.log("verificationService.createVerification:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("verificationService.createVerification error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Get all verifications for the current user
   */
  async getUserVerifications(): Promise<{
    data: Verification[];
    error: Error | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: [], error: new Error("User not authenticated") };
      }

      const { data, error } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log("verificationService.getUserVerifications:", { data, error });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error("verificationService.getUserVerifications error:", err);
      return {
        data: [],
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Get a specific verification by ID
   */
  async getVerificationById(
    id: string
  ): Promise<{ data: Verification | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("verifications")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      console.log("verificationService.getVerificationById:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Log verification access
      if (data) {
        await auditService.logAccess({
          action: "view",
          resourceType: "verification",
          resourceId: id,
          metadata: { documentType: data.document_type, status: data.status }
        });
      }

      return { data, error: null };
    } catch (err) {
      console.error("verificationService.getVerificationById error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Update verification status (typically by admin reviewers)
   */
  async updateVerificationStatus(
    verificationId: string,
    status: string,
    reviewNotes?: string
  ): Promise<{ data: Verification | null; error: Error | null }> {
    try {
      const updateData: any = { status };
      if (reviewNotes) {
        updateData.review_notes = reviewNotes;
      }

      const { data, error } = await supabase
        .from("verifications")
        .update(updateData)
        .eq("id", verificationId)
        .select()
        .single();

      console.log("verificationService.updateVerificationStatus:", {
        data,
        error,
      });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Log verification status update (critical reviewer action)
      await auditService.logAccess({
        action: "edit",
        resourceType: "verification",
        resourceId: verificationId,
        metadata: { 
          newStatus: status, 
          hasReviewNotes: !!reviewNotes,
          action: "status_update"
        }
      });

      return { data, error: null };
    } catch (err) {
      console.error("verificationService.updateVerificationStatus error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },
};