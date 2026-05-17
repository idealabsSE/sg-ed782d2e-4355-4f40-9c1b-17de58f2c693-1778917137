/**
 * IdentityProvider Interface
 * 
 * Abstract interface for identity verification providers.
 * Supports multiple verification methods and document types.
 */

export type VerificationMethod = 
  | "bankid"           // Swedish BankID
  | "document"         // Document upload and validation
  | "video"            // Video verification
  | "biometric"        // Biometric verification
  | "eidas"            // eIDAS-compliant verification
  | "custom";          // Provider-specific method

export type VerificationStatus = 
  | "pending"          // Verification initiated, waiting for user action
  | "in_progress"      // User is actively verifying
  | "completed"        // Verification completed successfully
  | "failed"           // Verification failed
  | "cancelled"        // User cancelled the verification
  | "expired";         // Verification session expired

export interface VerificationRequest {
  /** User identifier (from our system) */
  userId: string;
  /** Verification method to use */
  method: VerificationMethod;
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: "SE" | "ES" | string;
  /** User's personal number or national ID */
  nationalId?: string;
  /** Return URL after verification */
  returnUrl?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface VerificationSession {
  /** Session ID from the provider */
  sessionId: string;
  /** Current status */
  status: VerificationStatus;
  /** URL for user to complete verification */
  verificationUrl?: string;
  /** When the session was created */
  createdAt: Date;
  /** When the session expires */
  expiresAt: Date;
  /** Provider-specific session data */
  providerData?: Record<string, unknown>;
}

export interface VerificationResult {
  /** Unique result identifier */
  resultId: string;
  /** Final status */
  status: VerificationStatus;
  /** Whether the verification was successful */
  verified: boolean;
  /** Verified person data */
  person?: {
    /** Full name */
    fullName: string;
    /** First name */
    firstName?: string;
    /** Last name */
    lastName?: string;
    /** National ID or personal number */
    nationalId?: string;
    /** Date of birth */
    dateOfBirth?: string;
    /** Country of nationality */
    nationality?: string;
    /** Address information */
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
  };
  /** Document information if document verification */
  document?: {
    /** Document type (passport, national_id, drivers_license) */
    type: string;
    /** Document number */
    number?: string;
    /** Issuing country */
    issuingCountry?: string;
    /** Expiration date */
    expiresAt?: string;
  };
  /** Evidence references (document IDs, image URLs) */
  evidence: EvidenceReference[];
  /** When the verification was completed */
  completedAt?: Date;
  /** Error information if failed */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  /** Provider-specific result data */
  providerData?: Record<string, unknown>;
}

export interface EvidenceReference {
  /** Type of evidence */
  type: "document" | "photo" | "video" | "biometric" | "signature" | "other";
  /** Reference ID (document ID in our system or provider URL) */
  reference: string;
  /** Optional description */
  description?: string;
  /** When this evidence was created */
  createdAt: Date;
  /** Provider-specific evidence data */
  metadata?: Record<string, unknown>;
}

export interface NormalizedVerificationData {
  /** Person information */
  person: {
    fullName: string;
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  /** Document information */
  document?: {
    type: string;
    number?: string;
    issuingCountry?: string;
    expiresAt?: string;
  };
  /** Verification quality indicators */
  quality: {
    /** Overall confidence score (0-100) */
    confidence: number;
    /** Whether the verification meets regulatory requirements */
    compliant: boolean;
    /** Method used for verification */
    method: VerificationMethod;
  };
}

/**
 * Base interface for all identity verification providers
 */
export interface IdentityProvider {
  /** Unique identifier for this provider */
  readonly providerId: string;
  
  /** Human-readable name for this provider */
  readonly providerName: string;
  
  /** Countries this provider supports */
  readonly supportedCountries: string[];
  
  /** Verification methods this provider supports */
  readonly supportedMethods: VerificationMethod[];

  /**
   * Start a new verification session
   * 
   * @param request - Verification request details
   * @returns Promise resolving to verification session
   */
  startVerification(request: VerificationRequest): Promise<VerificationSession>;

  /**
   * Get the current status of a verification session
   * 
   * @param sessionId - Provider session ID
   * @returns Promise resolving to verification result
   */
  getVerificationStatus(sessionId: string): Promise<VerificationResult>;

  /**
   * Cancel an ongoing verification session
   * 
   * @param sessionId - Provider session ID
   * @returns Promise resolving to cancellation success
   */
  cancelVerification(sessionId: string): Promise<boolean>;

  /**
   * Normalize provider-specific result to standard format
   * 
   * @param providerResult - Raw result from provider
   * @returns Normalized verification data
   */
  normalizeResult(providerResult: unknown): NormalizedVerificationData;

  /**
   * Store evidence references for compliance
   * 
   * @param sessionId - Provider session ID
   * @param result - Verification result with evidence
   * @returns Promise resolving to storage success
   */
  storeEvidenceReference(
    sessionId: string,
    result: VerificationResult
  ): Promise<boolean>;

  /**
   * Check if this provider supports a specific country and method
   * 
   * @param countryCode - ISO country code
   * @param method - Verification method
   * @returns True if this provider supports the combination
   */
  supportsCountryAndMethod(
    countryCode: string,
    method: VerificationMethod
  ): boolean;

  /**
   * Validate provider configuration and connectivity
   * 
   * @returns Promise resolving to validation result
   */
  validateConfiguration(): Promise<{
    isValid: boolean;
    errors?: string[];
  }>;
}