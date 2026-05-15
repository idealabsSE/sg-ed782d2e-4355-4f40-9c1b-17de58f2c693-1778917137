/**
 * TIC/Authway Provider Adapter
 * 
 * Implements identity verification for Swedish users via BankID and Freja eID.
 * TIC/Authway is the MVP provider for Swedish identity verification.
 */

import type {
  IdentityVerificationProvider,
  ProviderVerificationRequest,
  ProviderVerificationResult,
  DocumentType,
  VerificationMethod,
  ProviderStatus
} from "./types";

export class TicAuthwayProvider implements IdentityVerificationProvider {
  readonly name = "TIC/Authway";
  readonly supportedCountries: Array<"SE" | "ES"> = ["SE"];
  readonly supportedDocumentTypes: DocumentType[] = [
    "swedish_passport",
    "swedish_national_id",
    "swedish_drivers_license"
  ];
  readonly supportedMethods: VerificationMethod[] = ["bankid", "freja"];
  
  private apiKey: string;
  private apiUrl: string;
  
  constructor(config: { apiKey: string; apiUrl: string }) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
  }
  
  async startVerification(request: ProviderVerificationRequest): Promise<{
    sessionId: string;
    redirectUrl?: string;
    qrCode?: string;
  }> {
    // TIC/Authway API integration
    // This is a placeholder - actual implementation depends on TIC/Authway API spec
    
    try {
      const response = await fetch(`${this.apiUrl}/verify/start`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          method: request.method === "bankid" ? "SE_BANKID" : "SE_FREJA",
          documentType: request.documentType,
          personalNumber: request.documentNumber, // Swedish personnummer
          metadata: request.userMetadata
        })
      });
      
      if (!response.ok) {
        throw new Error(`TIC/Authway API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        sessionId: data.sessionId || data.transactionId,
        redirectUrl: data.redirectUrl,
        qrCode: data.qrCode // For mobile BankID
      };
    } catch (error) {
      console.error("TIC/Authway startVerification error:", error);
      throw new Error(
        `Failed to start TIC/Authway verification: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  
  async getStatus(sessionId: string): Promise<ProviderVerificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/verify/status/${sessionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`TIC/Authway API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Normalize TIC/Authway response to our interface
      return this.normalizeResponse(data);
    } catch (error) {
      console.error("TIC/Authway getStatus error:", error);
      return {
        success: false,
        status: "failed",
        provider: {
          name: this.name,
          verificationId: sessionId,
          timestamp: new Date().toISOString(),
          method: "bankid"
        },
        error: {
          code: "PROVIDER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          retryable: true
        }
      };
    }
  }
  
  async cancelVerification(sessionId: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/verify/cancel/${sessionId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
    } catch (error) {
      console.error("TIC/Authway cancelVerification error:", error);
      // Don't throw - cancellation is best-effort
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Normalize TIC/Authway response to standardized format
   */
  private normalizeResponse(rawData: any): ProviderVerificationResult {
    const statusMap: Record<string, ProviderStatus> = {
      "pending": "pending",
      "started": "in_progress",
      "complete": "completed",
      "failed": "failed",
      "cancelled": "failed",
      "expired": "expired"
    };
    
    const status = statusMap[rawData.status] || "failed";
    const success = status === "completed" && rawData.verified === true;
    
    const result: ProviderVerificationResult = {
      success,
      status,
      provider: {
        name: this.name,
        verificationId: rawData.transactionId || rawData.sessionId,
        timestamp: rawData.timestamp || new Date().toISOString(),
        method: rawData.method === "SE_BANKID" ? "bankid" : "freja",
        confidence: success ? 100 : undefined // BankID/Freja = government-grade
      },
      rawResponse: rawData
    };
    
    // Extract identity data if verification succeeded
    if (success && rawData.userData) {
      result.identity = {
        fullName: rawData.userData.name || rawData.userData.fullName,
        dateOfBirth: rawData.userData.dateOfBirth,
        documentNumber: rawData.userData.personalNumber,
        documentType: this.mapDocumentType(rawData.userData.documentType),
        nationality: "SE",
        address: rawData.userData.address
      };
    }
    
    // Extract error if present
    if (!success && rawData.error) {
      result.error = {
        code: rawData.error.code || "UNKNOWN_ERROR",
        message: rawData.error.message || "Verification failed",
        retryable: rawData.error.retryable !== false
      };
    }
    
    return result;
  }
  
  private mapDocumentType(providerType?: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
      "passport": "swedish_passport",
      "id_card": "swedish_national_id",
      "drivers_license": "swedish_drivers_license"
    };
    return typeMap[providerType || ""] || "swedish_national_id";
  }
}