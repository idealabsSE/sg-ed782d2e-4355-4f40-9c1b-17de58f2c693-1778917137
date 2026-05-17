/**
 * DataConnector Interface
 * 
 * Abstract interface for external data sources that provide property-related information.
 * All connectors must implement this interface to ensure consistent data access patterns.
 */

export interface PropertyIdentifier {
  /** Property reference number (e.g., cadastral reference, license number) */
  reference: string;
  /** Type of identifier (e.g., "cadastral", "license", "address") */
  type: "cadastral" | "license" | "address" | "custom";
  /** Regional context if applicable */
  region?: string;
}

export interface DataSnapshot<T = unknown> {
  /** Timestamp when the data was fetched */
  fetchedAt: Date;
  /** Source system identifier */
  source: string;
  /** Raw data from the external system */
  rawData: T;
  /** Normalized data rows */
  normalizedRows: PropertyDataRow[];
  /** Metadata about the fetch operation */
  metadata: {
    success: boolean;
    errors?: string[];
    warnings?: string[];
  };
}

export interface PropertyDataRow {
  /** Unique identifier for this data row */
  id: string;
  /** Property identifier this row relates to */
  propertyIdentifier: PropertyIdentifier;
  /** Data category (e.g., "license", "ownership", "compliance") */
  category: string;
  /** Key-value pairs of property attributes */
  attributes: Record<string, unknown>;
  /** When this data was last updated at the source */
  sourceUpdatedAt?: Date;
}

export interface FetchOptions {
  /** Include historical data if available */
  includeHistory?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Additional provider-specific options */
  customOptions?: Record<string, unknown>;
}

/**
 * Base interface for all data connectors
 */
export interface DataConnector {
  /** Unique identifier for this connector */
  readonly connectorId: string;
  
  /** Human-readable name for this connector */
  readonly connectorName: string;
  
  /** Source system this connector interfaces with */
  readonly sourceSystem: string;

  /**
   * Fetch a snapshot of data from the external source
   * 
   * @param identifier - Property identifier to look up
   * @param options - Optional fetch configuration
   * @returns Promise resolving to a data snapshot
   */
  fetchSnapshot(
    identifier: PropertyIdentifier,
    options?: FetchOptions
  ): Promise<DataSnapshot>;

  /**
   * Normalize raw data from the source into standardized rows
   * 
   * @param rawData - Raw data from the external system
   * @returns Array of normalized property data rows
   */
  normalizeRows(rawData: unknown): PropertyDataRow[];

  /**
   * Resolve a property identifier to a standardized format
   * This handles cases where the input identifier might be ambiguous
   * 
   * @param input - Input identifier (string or partial identifier)
   * @returns Resolved property identifier or null if cannot resolve
   */
  resolvePropertyIdentifier(
    input: string | Partial<PropertyIdentifier>
  ): Promise<PropertyIdentifier | null>;

  /**
   * Check if this connector supports a given identifier type
   * 
   * @param identifierType - Type of identifier to check
   * @returns True if this connector can handle this identifier type
   */
  supportsIdentifierType(identifierType: string): boolean;

  /**
   * Validate connector configuration and connectivity
   * 
   * @returns Promise resolving to validation result
   */
  validateConnection(): Promise<{
    isValid: boolean;
    errors?: string[];
  }>;
}