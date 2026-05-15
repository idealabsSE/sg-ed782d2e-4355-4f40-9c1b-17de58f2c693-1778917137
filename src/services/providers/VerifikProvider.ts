/**
 * Verifik Provider Adapter
 * 
 * Implements identity verification for Spanish users via DNI/NIE electronic validation.
 * Verifik is the MVP provider for Spanish identity verification.
 */

import type {
  IdentityVerificationProvider,
  ProviderVerificationRequest,
  ProviderVerificationResult,
  DocumentType,
  VerificationMethod,
  ProviderStatus
} from "./types";

export class VerifikProvider implements IdentityVerificationProvider {
  readonly name = "Verifik";
  readonly supportedCountries: Array<"SE" | "ES"> = ["ES"];
  readonly supportedDocumentTypes: DocumentType[] = [
    "spanish_dni",
    "spanish_nie",
    "spanish_passport"
  ];
  readonly supportedMethods: VerificationMethod[] = [
    "dni_electronic",
    "document_scan",
    "video_call"
  ];
  
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
    // Verifik API integration
    // This is a placeholder - actual implementation depends on Verifik API spec
    
    try {
      const response = await fetch(`${this.apiUrl}/verification/start`, {
        method: "POST",
        headers: {
          "X-API-Key": this.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          verificationType: this.mapVerificationMethod(request.method),
          documentType: this.mapDocumentType(request.documentType),
          documentNumber: request.documentNumber,
          country: "ES",
          personalData: request.userMetadata
        })
      });
      
      if (!response.ok) {
        throw new Error(`Verifik API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        sessionId: data.verificationId || data.sessionId,
        redirectUrl: data.verificationUrl || data.redirectUrl
      };
    } catch (error) {
      console.error("Verifik startVerification error:", error);
      throw new Error(
        `Failed to start Verifik verification: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  
  async getStatus(sessionId: string): Promise<ProviderVerificationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/verification/${sessionId}`, {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Verifik API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Normalize Verifik response to our interface
      return this.normalizeResponse(data);
    } catch (error) {
      console.error("Verifik getStatus error:", error);
      return {
        success: false,
        status: "failed",
        provider: {
          name: this.name,
          verificationId: sessionId,
          timestamp: new Date().toISOString(),
          method: "dni_electronic"
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
      await fetch(`${this.apiUrl}/verification/${sessionId}/cancel`, {
        method: "POST",
        headers: {
          "X-API-Key": this.apiKey
        }
      });
    } catch (error) {
      console.error("Verifik cancelVerification error:", error);
      // Don't throw - cancellation is best-effort
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Normalize Verifik response to standardized format
   */
  private normalizeResponse(rawData: any): ProviderVerificationResult {
    const statusMap: Record<string, ProviderStatus> = {
      "initiated": "pending",
      "pending": "pending",
      "in_progress": "in_progress",
      "processing": "in_progress",
      "verified": "completed",
      "approved": "completed",
      "rejected": "failed",
      "failed": "failed",
      "cancelled": "failed",
      "expired": "expired"
    };
    
    const status = statusMap[rawData.status] || "failed";
    const success = status === "completed" && 
                   (rawData.result === "verified" || rawData.verified === true);
    
    const result: ProviderVerificationResult = {
      success,
      status,
      provider: {
        name: this.name,
        verificationId: rawData.verificationId || rawData.id,
        timestamp: rawData.timestamp || rawData.completedAt || new Date().toISOString(),
        method: this.normalizeMethod(rawData.verificationType),
        confidence: rawData.confidenceScore // Verifik provides confidence scores
      },
      rawResponse: rawData
    };
    
    // Extract identity data if verification succeeded
    if (success && rawData.extractedData) {
      result.identity = {
        fullName: rawData.extractedData.fullName || 
                  `${rawData.extractedData.firstName} ${rawData.extractedData.lastName}`,
        dateOfBirth: rawData.extractedData.dateOfBirth,
        documentNumber: rawData.extractedData.documentNumber || 
                       rawData.extractedData.dni || 
                       rawData.extractedData.nie,
        documentType: this.normalizeDocumentType(rawData.extractedData.documentType),
        nationality: rawData.extractedData.nationality || "ES",
        address: rawData.extractedData.address,
        expiryDate: rawData.extractedData.expiryDate
      };
    }
    
    // Extract error if present
    if (!success && rawData.error) {
      result.error = {
        code: rawData.error.errorCode || rawData.errorCode || "UNKNOWN_ERROR",
        message: rawData.error.message || rawData.errorMessage || "Verification failed",
        retryable: rawData.error.recoverable !== false
      };
    }
    
    return result;
  }
  
  private mapVerificationMethod(method: VerificationMethod): string {
    const methodMap: Record<VerificationMethod, string> = {
      "dni_electronic": "DNI_ELECTRONIC",
      "document_scan": "DOCUMENT_UPLOAD",
      "video_call": "VIDEO_VERIFICATION",
      "bankid": "BANKID", // Not supported by Verifik
      "freja": "FREJA" // Not supported by Verifik
    };
    return methodMap[method] || "DOCUMENT_UPLOAD";
  }
  
  private mapDocumentType(docType: DocumentType): string {
    const typeMap: Record<DocumentType, string> = {
      "spanish_dni": "DNI",
      "spanish_nie": "NIE",
      "spanish_passport": "PASSPORT",
      "swedish_passport": "PASSPORT",
      "swedish_national_id": "ID_CARD",
      "swedish_drivers_license": "DRIVERS_LICENSE"
    };
    return typeMap[docType] || "DNI";
  }
  
  private normalizeMethod(providerMethod?: string): VerificationMethod {
    const methodMap: Record<string, VerificationMethod> = {
      "DNI_ELECTRONIC": "dni_electronic",
      "DOCUMENT_UPLOAD": "document_scan",
      "VIDEO_VERIFICATION": "video_call"
    };
    return methodMap[providerMethod || ""] || "document_scan";
  }
  
  private normalizeDocumentType(providerType?: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
      "DNI": "spanish_dni",
      "NIE": "spanish_nie",
      "PASSPORT": "spanish_passport"
    };
    return typeMap[providerType || ""] || "spanish_dni";
  }
}