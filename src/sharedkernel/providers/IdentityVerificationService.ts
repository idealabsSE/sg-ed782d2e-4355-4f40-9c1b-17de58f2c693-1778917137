/**
 * Identity Verification Service
 * 
 * High-level service that uses the provider abstraction layer.
 * Application code should use this service, not interact with providers directly.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getProviderRegistry } from "@/services/providers/ProviderRegistry";
import type {
  ProviderVerificationRequest,
  ProviderVerificationResult,
  DocumentType,
  VerificationMethod
} from "@/services/providers/types";
import { auditService } from "@/securityandaudit/AuditService";

type IdentityVerification = Database["public"]["Tables"]["verifications"]["Row"];

export interface StartVerificationParams {
  documentType: DocumentType;
  documentNumber: string;
  country: "SE" | "ES";
  role: string;
  method?: VerificationMethod;
  userMetadata?: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
}

export const identityVerificationService = {
  /**
   * Start a new identity verification
   * This method handles provider selection and session management
   */
  async startVerification(
    params: StartVerificationParams
  ): Promise<{
    verificationId: string;
    redirectUrl?: string;
    qrCode?: string;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { verificationId: "", error: "User not authenticated" };
      }

      // Select appropriate provider
      const registry = getProviderRegistry();
      const provider = registry.selectProvider(
        params.country,
        params.documentType,
        params.method
      );

      if (!provider) {
        return {
          verificationId: "",
          error: `No provider available for ${params.country} ${params.documentType}`
        };
      }

      // Start verification with provider
      const request: ProviderVerificationRequest = {
        documentType: params.documentType,
        documentNumber: params.documentNumber,
        country: params.country,
        method: params.method || (params.country === "SE" ? "bankid" : "dni_electronic"),
        userMetadata: params.userMetadata
      };

      const providerSession = await provider.startVerification(request);

      // Create verification record in database
      const { data: verification, error: dbError } = await supabase
        .from("verifications")
        .insert({
          user_id: user.id,
          country: params.country,
          document_type: params.documentType,
          document_number: params.documentNumber,
          role: params.role,
          status: "pending",
          notes: JSON.stringify({
            provider: provider.name,
            sessionId: providerSession.sessionId,
            method: request.method
          })
        })
        .select()
        .single();

      if (dbError || !verification) {
        console.error("Failed to create verification record:", dbError);
        // Try to cancel provider session
        await provider.cancelVerification(providerSession.sessionId).catch(() => {});
        return { verificationId: "", error: "Failed to create verification record" };
      }

      // Log verification initiation
      await auditService.logAccess({
        action: "create",
        resourceType: "verification",
        resourceId: verification.id,
        metadata: {
          provider: provider.name,
          method: request.method,
          documentType: params.documentType
        }
      });

      return {
        verificationId: verification.id,
        redirectUrl: providerSession.redirectUrl,
        qrCode: providerSession.qrCode
      };
    } catch (error) {
      console.error("identityVerificationService.startVerification error:", error);
      return {
        verificationId: "",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },

  /**
   * Check status of a verification
   * Polls the provider and updates our database
   */
  async checkVerificationStatus(
    verificationId: string
  ): Promise<{
    status: string;
    result?: ProviderVerificationResult;
    error?: string;
  }> {
    try {
      // Get verification from database
      const { data: verification, error: dbError } = await supabase
        .from("verifications")
        .select("*")
        .eq("id", verificationId)
        .maybeSingle();

      if (dbError || !verification) {
        return { status: "not_found", error: "Verification not found" };
      }

      // Parse provider info from notes
      const providerInfo = verification.notes 
        ? JSON.parse(verification.notes as string)
        : null;

      if (!providerInfo?.provider || !providerInfo?.sessionId) {
        return { status: verification.status || "unknown", error: "Invalid provider info" };
      }

      // Get provider
      const registry = getProviderRegistry();
      const provider = registry.getProvider(providerInfo.provider);

      if (!provider) {
        return { status: verification.status || "unknown", error: "Provider not available" };
      }

      // Check status with provider
      const result = await provider.getStatus(providerInfo.sessionId);

      // Update database with result
      const updateData: any = {
        status: result.status,
        updated_at: new Date().toISOString()
      };

      // If completed, store identity data
      if (result.success && result.identity) {
        updateData.notes = JSON.stringify({
          ...providerInfo,
          identity: result.identity,
          providerResult: {
            verificationId: result.provider.verificationId,
            timestamp: result.provider.timestamp,
            confidence: result.provider.confidence
          }
        });
      }

      // If failed, store error
      if (!result.success && result.error) {
        updateData.notes = JSON.stringify({
          ...providerInfo,
          error: result.error
        });
      }

      await supabase
        .from("verifications")
        .update(updateData)
        .eq("id", verificationId);

      // Record success/failure with registry
      if (result.success) {
        registry.recordSuccess(providerInfo.provider);
      } else if (result.status === "failed") {
        registry.recordFailure(providerInfo.provider);
      }

      return {
        status: result.status,
        result
      };
    } catch (error) {
      console.error("identityVerificationService.checkVerificationStatus error:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },

  /**
   * Get provider health status (for admin monitoring)
   */
  async getProvidersHealth() {
    const registry = getProviderRegistry();
    return registry.getHealthStatus();
  },

  /**
   * Perform health checks on all providers
   */
  async checkProvidersHealth() {
    const registry = getProviderRegistry();
    await registry.checkAllProviders();
    return registry.getHealthStatus();
  }
};