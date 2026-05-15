import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Case = Database["public"]["Tables"]["cases"]["Row"];
type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"];
type CaseParty = Database["public"]["Tables"]["case_parties"]["Row"];
type CasePartyInsert = Database["public"]["Tables"]["case_parties"]["Insert"];

export interface CaseWithDetails extends Case {
  property?: Database["public"]["Tables"]["properties"]["Row"];
  parties?: (CaseParty & {
    profile?: Database["public"]["Tables"]["profiles"]["Row"];
    verification?: Database["public"]["Tables"]["verifications"]["Row"];
  })[];
}

export const caseService = {
  /**
   * Get all cases accessible to the current user
   */
  async getUserCases(): Promise<{
    data: CaseWithDetails[];
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
        .from("cases")
        .select(
          `
          *,
          property:properties(*),
          parties:case_parties(
            *,
            profile:profiles(*),
            verification:verifications(*)
          )
        `
        )
        .order("created_at", { ascending: false });

      console.log("caseService.getUserCases:", { data, error });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: (data as CaseWithDetails[]) || [], error: null };
    } catch (err) {
      console.error("caseService.getUserCases error:", err);
      return {
        data: [],
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Get a specific case by ID with all related data
   */
  async getCaseById(
    caseId: string
  ): Promise<{ data: CaseWithDetails | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select(
          `
          *,
          property:properties(*),
          parties:case_parties(
            *,
            profile:profiles(*),
            verification:verifications(*)
          )
        `
        )
        .eq("id", caseId)
        .maybeSingle();

      console.log("caseService.getCaseById:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as CaseWithDetails, error: null };
    } catch (err) {
      console.error("caseService.getCaseById error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Create a new case
   */
  async createCase(
    caseData: Omit<CaseInsert, "created_by" | "case_number">
  ): Promise<{ data: Case | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error("User not authenticated") };
      }

      const { data, error } = await supabase
        .from("cases")
        .insert({
          ...caseData,
          created_by: user.id,
        })
        .select()
        .single();

      console.log("caseService.createCase:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("caseService.createCase error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Add a party to a case
   */
  async addPartyToCase(
    party: Omit<CasePartyInsert, "id">
  ): Promise<{ data: CaseParty | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("case_parties")
        .insert(party)
        .select()
        .single();

      console.log("caseService.addPartyToCase:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("caseService.addPartyToCase error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Update case status
   */
  async updateCaseStatus(
    caseId: string,
    status: string
  ): Promise<{ data: Case | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("cases")
        .update({ status })
        .eq("id", caseId)
        .select()
        .single();

      console.log("caseService.updateCaseStatus:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("caseService.updateCaseStatus error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Get all cases pending review (for admin)
   */
  async getPendingReviewCases(): Promise<{
    data: CaseWithDetails[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select(
          `
          *,
          property:properties(*),
          parties:case_parties(
            *,
            profile:profiles(*),
            verification:verifications(*)
          )
        `
        )
        .eq("status", "pending_review")
        .order("created_at", { ascending: true });

      console.log("caseService.getPendingReviewCases:", { data, error });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: (data as CaseWithDetails[]) || [], error: null };
    } catch (err) {
      console.error("caseService.getPendingReviewCases error:", err);
      return {
        data: [],
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },
};