/**
 * Provider Abstraction Layer - Core Types
 * 
 * This defines the contract that all identity verification providers must implement.
 * Following this interface enables swapping providers (e.g., TIC/Authway → Signicat) 
 * without changing application logic.
 */

export type DocumentType = 
  | "swedish_passport"
  | "swedish_national_id"
  | "swedish_drivers_license"
  | "spanish_dni"
  | "spanish_nie"
  | "spanish_passport";

export type VerificationMethod = 
  | "bankid"        // Swedish BankID
  | "freja"         // Swedish Freja eID
  | "dni_electronic" // Spanish DNI electrónico
  | "video_call"    // Manual video verification
  | "document_scan"; // Document upload + OCR

export type ProviderStatus = 
  | "pending"       // Verification initiated, awaiting user action
  | "in_progress"   // User interacting with provider
  | "completed"     // Provider returned result
  | "failed"        // Provider error or user abandonment
  | "expired";      // Session timeout

export interface ProviderVerificationRequest {
  documentType: DocumentType;
  documentNumber: string;
  country: "SE" | "ES";
  method: VerificationMethod;
  userMetadata?: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
}

export interface ProviderVerificationResult {
  // Normalized status
  success: boolean;
  status: ProviderStatus;
  
  // Identity data (extracted by provider)
  identity?: {
    fullName: string;
    dateOfBirth?: string;
    documentNumber: string;
    documentType: DocumentType;
    nationality?: string;
    address?: string;
    expiryDate?: string;
  };
  
  // Provider metadata
  provider: {
    name: string;
    verificationId: string;
    timestamp: string;
    method: VerificationMethod;
    confidence?: number; // 0-100 if provider supplies it
  };
  
  // Raw response for audit trail
  rawResponse?: unknown;
  
  // Errors
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface ProviderHealthStatus {
  provider: string;
  healthy: boolean;
  lastChecked: string;
  consecutiveFailures: number;
  lastSuccess?: string;
  lastFailure?: string;
  responseTime?: number; // ms
  errorRate?: number; // percentage
}

/**
 * Provider Interface Contract
 * 
 * All identity verification providers must implement these methods.
 */
export interface IdentityVerificationProvider {
  readonly name: string;
  readonly supportedCountries: Array<"SE" | "ES">;
  readonly supportedDocumentTypes: DocumentType[];
  readonly supportedMethods: VerificationMethod[];
  
  /**
   * Start a new verification session
   * Returns a session ID and optional redirect URL for user
   */
  startVerification(
    request: ProviderVerificationRequest
  ): Promise<{
    sessionId: string;
    redirectUrl?: string;
    qrCode?: string;
  }>;
  
  /**
   * Poll or retrieve verification status
   */
  getStatus(sessionId: string): Promise<ProviderVerificationResult>;
  
  /**
   * Cancel/abort an in-progress verification
   */
  cancelVerification(sessionId: string): Promise<void>;
  
  /**
   * Health check - returns true if provider is operational
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Provider Configuration
 */
export interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number; // Lower = higher priority when multiple providers available
  apiKey?: string;
  apiUrl?: string;
  webhookUrl?: string;
  timeout?: number; // seconds
  retryAttempts?: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}