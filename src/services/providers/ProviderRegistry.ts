/**
 * Provider Registry
 * 
 * Central registry for all identity verification providers.
 * Handles provider selection, health monitoring, and failover.
 */

import type {
  IdentityVerificationProvider,
  ProviderConfig,
  ProviderHealthStatus,
  DocumentType,
  VerificationMethod
} from "./types";
import { TicAuthwayProvider } from "./TicAuthwayProvider";
import { VerifikProvider } from "./VerifikProvider";

export class ProviderRegistry {
  private providers: Map<string, IdentityVerificationProvider> = new Map();
  private configs: Map<string, ProviderConfig> = new Map();
  private healthStatus: Map<string, ProviderHealthStatus> = new Map();
  
  constructor() {
    this.initializeProviders();
  }
  
  /**
   * Initialize all configured providers
   */
  private initializeProviders(): void {
    // Load from environment variables
    const ticAuthwayConfig: ProviderConfig = {
      name: "TIC/Authway",
      enabled: !!process.env.NEXT_PUBLIC_TIC_AUTHWAY_API_KEY,
      priority: 1,
      apiKey: process.env.NEXT_PUBLIC_TIC_AUTHWAY_API_KEY,
      apiUrl: process.env.NEXT_PUBLIC_TIC_AUTHWAY_API_URL || "https://api.tic-authway.se",
      timeout: 300,
      retryAttempts: 3
    };
    
    const verifikConfig: ProviderConfig = {
      name: "Verifik",
      enabled: !!process.env.NEXT_PUBLIC_VERIFIK_API_KEY,
      priority: 1,
      apiKey: process.env.NEXT_PUBLIC_VERIFIK_API_KEY,
      apiUrl: process.env.NEXT_PUBLIC_VERIFIK_API_URL || "https://api.verifik.com",
      timeout: 300,
      retryAttempts: 3
    };
    
    // Register providers
    if (ticAuthwayConfig.enabled && ticAuthwayConfig.apiKey) {
      const provider = new TicAuthwayProvider({
        apiKey: ticAuthwayConfig.apiKey,
        apiUrl: ticAuthwayConfig.apiUrl!
      });
      this.providers.set("TIC/Authway", provider);
      this.configs.set("TIC/Authway", ticAuthwayConfig);
      this.initHealthStatus("TIC/Authway");
    }
    
    if (verifikConfig.enabled && verifikConfig.apiKey) {
      const provider = new VerifikProvider({
        apiKey: verifikConfig.apiKey,
        apiUrl: verifikConfig.apiUrl!
      });
      this.providers.set("Verifik", provider);
      this.configs.set("Verifik", verifikConfig);
      this.initHealthStatus("Verifik");
    }
    
    console.log(`ProviderRegistry initialized with ${this.providers.size} provider(s):`, 
                Array.from(this.providers.keys()));
  }
  
  /**
   * Select the best provider for a given request
   */
  selectProvider(
    country: "SE" | "ES",
    documentType: DocumentType,
    method?: VerificationMethod
  ): IdentityVerificationProvider | null {
    const candidates: Array<{
      provider: IdentityVerificationProvider;
      config: ProviderConfig;
      health: ProviderHealthStatus;
    }> = [];
    
    // Find all providers that support this request
    for (const [name, provider] of this.providers) {
      const config = this.configs.get(name);
      const health = this.healthStatus.get(name);
      
      if (!config?.enabled || !health) continue;
      
      // Check country support
      if (!provider.supportedCountries.includes(country)) continue;
      
      // Check document type support
      if (!provider.supportedDocumentTypes.includes(documentType)) continue;
      
      // Check method support if specified
      if (method && !provider.supportedMethods.includes(method)) continue;
      
      candidates.push({ provider, config, health });
    }
    
    if (candidates.length === 0) {
      console.warn(`No provider available for ${country} ${documentType}${method ? ` via ${method}` : ""}`);
      return null;
    }
    
    // Sort by: healthy first, then by priority, then by consecutive failures (fewer is better)
    candidates.sort((a, b) => {
      if (a.health.healthy !== b.health.healthy) {
        return a.health.healthy ? -1 : 1;
      }
      if (a.config.priority !== b.config.priority) {
        return a.config.priority - b.config.priority;
      }
      return a.health.consecutiveFailures - b.health.consecutiveFailures;
    });
    
    const selected = candidates[0];
    console.log(`Selected provider: ${selected.provider.name} for ${country} ${documentType}`);
    
    return selected.provider;
  }
  
  /**
   * Get a specific provider by name
   */
  getProvider(name: string): IdentityVerificationProvider | null {
    return this.providers.get(name) || null;
  }
  
  /**
   * Get all registered providers
   */
  getAllProviders(): IdentityVerificationProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * Get health status for all providers
   */
  getHealthStatus(): ProviderHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }
  
  /**
   * Perform health checks on all providers
   */
  async checkAllProviders(): Promise<void> {
    const checks = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      const startTime = Date.now();
      
      try {
        const healthy = await provider.healthCheck();
        const responseTime = Date.now() - startTime;
        
        const status = this.healthStatus.get(name)!;
        status.healthy = healthy;
        status.lastChecked = new Date().toISOString();
        status.responseTime = responseTime;
        
        if (healthy) {
          status.consecutiveFailures = 0;
          status.lastSuccess = new Date().toISOString();
        } else {
          status.consecutiveFailures++;
          status.lastFailure = new Date().toISOString();
        }
        
        this.healthStatus.set(name, status);
      } catch (error) {
        console.error(`Health check failed for ${name}:`, error);
        const status = this.healthStatus.get(name)!;
        status.healthy = false;
        status.lastChecked = new Date().toISOString();
        status.consecutiveFailures++;
        status.lastFailure = new Date().toISOString();
        this.healthStatus.set(name, status);
      }
    });
    
    await Promise.all(checks);
  }
  
  /**
   * Record a successful verification for a provider
   */
  recordSuccess(providerName: string): void {
    const status = this.healthStatus.get(providerName);
    if (status) {
      status.consecutiveFailures = 0;
      status.lastSuccess = new Date().toISOString();
      status.healthy = true;
      this.healthStatus.set(providerName, status);
    }
  }
  
  /**
   * Record a failed verification for a provider
   */
  recordFailure(providerName: string): void {
    const status = this.healthStatus.get(providerName);
    if (status) {
      status.consecutiveFailures++;
      status.lastFailure = new Date().toISOString();
      // Mark unhealthy after 3 consecutive failures
      if (status.consecutiveFailures >= 3) {
        status.healthy = false;
      }
      this.healthStatus.set(providerName, status);
    }
  }
  
  /**
   * Initialize health status for a provider
   */
  private initHealthStatus(providerName: string): void {
    this.healthStatus.set(providerName, {
      provider: providerName,
      healthy: true,
      lastChecked: new Date().toISOString(),
      consecutiveFailures: 0
    });
  }
}

// Singleton instance
let registryInstance: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (!registryInstance) {
    registryInstance = new ProviderRegistry();
  }
  return registryInstance;
}