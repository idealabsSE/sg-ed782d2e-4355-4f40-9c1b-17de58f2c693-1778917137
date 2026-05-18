import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AuthorityVerification = Database["public"]["Tables"]["authority_verification"]["Row"];
type AuthorityVerificationInsert = Database["public"]["Tables"]["authority_verification"]["Insert"];
type AuthorityVerificationUpdate = Database["public"]["Tables"]["authority_verification"]["Update"];

export interface CreateAuthorityVerificationParams {
  casePartyId: string;
  documentId?: string;
  mandateType: "power_of_attorney" | "management_contract" | "board_resolution" | "other";
  principalName: string;
  principalIdNumber?: string;
  agentName: string;
  agentIdNumber?: string;
  validFrom?: string;
  validUntil?: string;
  scopeOfAuthority?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface UpdateVerificationStatusParams {
  verificationId: string;
  status: "pending" | "verified" | "rejected" | "expired";
  rejectionReason?: string;
  notes?: string;
}

export const AuthorityVerificationService = {
  /**
   * Create a new authority verification record
   */
  async create(params: CreateAuthorityVerificationParams) {
    const insert: AuthorityVerificationInsert = {
      case_party_id: params.casePartyId,
      document_id: params.documentId,
      mandate_type: params.mandateType,
      principal_name: params.principalName,
      principal_id_number: params.principalIdNumber,
      agent_name: params.agentName,
      agent_id_number: params.agentIdNumber,
      valid_from: params.validFrom,
      valid_until: params.validUntil,
      scope_of_authority: params.scopeOfAuthority,
      notes: params.notes,
      metadata: params.metadata,
      verification_status: "pending",
    };

    const { data, error } = await supabase
      .from("authority_verification")
      .insert(insert)
      .select()
      .single();

    console.log("Create authority verification:", { data, error });
    if (error) throw error;
    return data;
  },

  /**
   * Get authority verification by ID
   */
  async getById(verificationId: string) {
    const { data, error } = await supabase
      .from("authority_verification")
      .select(`
        *,
        case_party:case_parties(
          id,
          role,
          verification_status,
          user:profiles(id, full_name, email)
        ),
        document:person_documents(
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          uploaded_at
        ),
        verified_by_user:profiles!authority_verification_verified_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq("id", verificationId)
      .single();

    console.log("Get authority verification:", { data, error });
    if (error) throw error;
    return data;
  },

  /**
   * Get authority verification by case party ID
   */
  async getByCasePartyId(casePartyId: string) {
    const { data, error } = await supabase
      .from("authority_verification")
      .select(`
        *,
        document:person_documents(
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          uploaded_at
        )
      `)
      .eq("case_party_id", casePartyId)
      .order("created_at", { ascending: false });

    console.log("Get authority verifications by case party:", { data, error });
    if (error) throw error;
    return data || [];
  },

  /**
   * Update verification status (admin only)
   */
  async updateStatus(params: UpdateVerificationStatusParams) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("Not authenticated");

    const update: AuthorityVerificationUpdate = {
      verification_status: params.status,
      rejection_reason: params.rejectionReason,
      notes: params.notes,
      verified_by: params.status === "verified" ? session.session.user.id : undefined,
      verified_at: params.status === "verified" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("authority_verification")
      .update(update)
      .eq("id", params.verificationId)
      .select()
      .single();

    console.log("Update authority verification status:", { data, error });
    if (error) throw error;

    // If verified, also update the case party status
    if (params.status === "verified") {
      const verification = await this.getById(params.verificationId);
      if (verification.case_party) {
        await supabase
          .from("case_parties")
          .update({ 
            verification_status: "verified",
            verified_at: new Date().toISOString()
          })
          .eq("id", verification.case_party_id);
      }
    }

    return data;
  },

  /**
   * Link a document to an authority verification
   */
  async linkDocument(verificationId: string, documentId: string) {
    const { data, error } = await supabase
      .from("authority_verification")
      .update({ 
        document_id: documentId,
        updated_at: new Date().toISOString()
      })
      .eq("id", verificationId)
      .select()
      .single();

    console.log("Link document to authority verification:", { data, error });
    if (error) throw error;
    return data;
  },

  /**
   * Get all pending authority verifications (admin view)
   */
  async getPendingVerifications() {
    const { data, error } = await supabase
      .from("authority_verification")
      .select(`
        *,
        case_party:case_parties(
          id,
          role,
          case:cases(
            id,
            case_number,
            property:properties(id, address, cadastral_reference)
          ),
          user:profiles(id, full_name, email)
        ),
        document:person_documents(
          id,
          file_name,
          file_path,
          file_size,
          mime_type,
          uploaded_at
        )
      `)
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false });

    console.log("Get pending authority verifications:", { data, error });
    if (error) throw error;
    return data || [];
  },
};