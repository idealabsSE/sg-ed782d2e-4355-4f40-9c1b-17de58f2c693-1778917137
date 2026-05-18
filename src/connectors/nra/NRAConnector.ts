/**
 * NRA (National Rental Registration) Connector Interface
 * 
 * Scaffold for CORPME API integration with pending_automation support.
 * Currently blocked by Friendly Captcha requirements - manual workflow is active.
 * 
 * API Reference: https://sede.corpme.es/api/v1/nra/lookup
 * Status: PENDING_AUTOMATION (Captcha required for programmatic access)
 */

import type { DataConnector, PropertyIdentifier, DataSnapshot, FetchOptions, PropertyDataRow } from "@/connectors/interface/DataConnector";

export interface NRALookupResult {
  /** NRA registration number */
  nraNumber: string;
  /** Registration status */
  status: "active" | "pending" | "suspended" | "cancelled";
  /** Property holder name */
  holderName: string;
  /** Registration date */
  registeredAt: string;
  /** Expiration date (if applicable) */
  expiresAt?: string;
  /** Cadastral reference linked to NRA */
  cadastralReference?: string;
}

export interface NRAConnectorConfig {
  /** API endpoint (currently blocked by Captcha) */
  apiEndpoint: string;
  /** API credentials (not yet available for programmatic access) */
  apiKey?: string;
  /** Flag indicating automation is pending/blocked */
  pendingAutomation: boolean;
  /** Reason automation is blocked */
  automationBlockReason?: string;
}

/**
 * NRA Connector - Currently in Manual Mode
 * 
 * This connector provides the interface for CORPME NRA lookups.
 * Due to Friendly Captcha requirements, automated lookups are not currently possible.
 * 
 * Manual workflow is active until B2B API access is confirmed.
 */
export class NRAConnector implements DataConnector {
  readonly connectorId = "nra-corpme";
  readonly connectorName = "National Rental Registration (CORPME)";
  readonly sourceSystem = "CORPME NRA/NRUA";

  private config: NRAConnectorConfig;

  constructor(config?: Partial<NRAConnectorConfig>) {
    this.config = {
      apiEndpoint: "https://sede.corpme.es/api/v1/nra/lookup",
      pendingAutomation: true,
      automationBlockReason: "Friendly Captcha requirement blocks programmatic access",
      ...config,
    };
  }

  /**
   * Fetch NRA snapshot (currently returns pending_automation status)
   * 
   * @throws Error indicating manual process required
   */
  async fetchSnapshot(
    identifier: PropertyIdentifier,
    options?: FetchOptions
  ): Promise<DataSnapshot<NRALookupResult>> {
    if (this.config.pendingAutomation) {
      // Return structured response indicating automation is pending
      return {
        fetchedAt: new Date(),
        source: this.sourceSystem,
        rawData: {} as NRALookupResult,
        normalizedRows: [],
        metadata: {
          success: false,
          errors: [
            "NRA automation pending: CORPME API requires Friendly Captcha",
            "Please use manual entry workflow for NRA registration verification",
          ],
          warnings: [
            "Automated lookups will be available once B2B API access is confirmed",
          ],
        },
      };
    }

    // Future implementation when API access is available
    throw new Error("NRA API integration not yet implemented - use manual workflow");
  }

  /**
   * Normalize NRA lookup results into standard property data rows
   */
  normalizeRows(rawData: unknown): PropertyDataRow[] {
    if (!rawData || typeof rawData !== "object") {
      return [];
    }

    const nraData = rawData as NRALookupResult;

    return [
      {
        id: `nra-${nraData.nraNumber}`,
        propertyIdentifier: {
          reference: nraData.cadastralReference || "",
          type: "cadastral",
        },
        category: "national_registration",
        attributes: {
          nraNumber: nraData.nraNumber,
          status: nraData.status,
          holderName: nraData.holderName,
          registeredAt: nraData.registeredAt,
          expiresAt: nraData.expiresAt,
        },
        sourceUpdatedAt: new Date(nraData.registeredAt),
      },
    ];
  }

  /**
   * Resolve property identifier for NRA lookup
   */
  async resolvePropertyIdentifier(
    input: string | Partial<PropertyIdentifier>
  ): Promise<PropertyIdentifier | null> {
    if (typeof input === "string") {
      // Assume cadastral reference format
      return {
        reference: input,
        type: "cadastral",
      };
    }

    if (input.type === "cadastral" && input.reference) {
      return {
        reference: input.reference,
        type: "cadastral",
      };
    }

    return null;
  }

  /**
   * Check if connector supports identifier type
   */
  supportsIdentifierType(identifierType: string): boolean {
    return identifierType === "cadastral" || identifierType === "license";
  }

  /**
   * Validate connector configuration
   * Returns pending_automation status while API access is blocked
   */
  async validateConnection(): Promise<{
    isValid: boolean;
    errors?: string[];
  }> {
    if (this.config.pendingAutomation) {
      return {
        isValid: false,
        errors: [
          "NRA automation is pending",
          this.config.automationBlockReason || "API access not yet available",
          "Manual entry workflow is active",
        ],
      };
    }

    // Future validation when API becomes available
    return {
      isValid: true,
    };
  }

  /**
   * Get current automation status
   */
  getAutomationStatus(): {
    pending: boolean;
    reason?: string;
    manualWorkflowActive: boolean;
  } {
    return {
      pending: this.config.pendingAutomation,
      reason: this.config.automationBlockReason,
      manualWorkflowActive: true,
    };
  }

  /**
   * Enable automation when API access becomes available
   */
  enableAutomation(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.config.pendingAutomation = false;
    this.config.automationBlockReason = undefined;
  }
}

/**
 * Singleton instance with pending_automation flag set
 */
export const nraConnector = new NRAConnector({
  pendingAutomation: true,
  automationBlockReason: "CORPME API requires Friendly Captcha - awaiting B2B access confirmation",
});