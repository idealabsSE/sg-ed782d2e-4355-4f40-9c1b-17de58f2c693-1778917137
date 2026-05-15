# Provider Migration Guide

## Overview

The X Trust platform uses a **Provider Abstraction Layer** to decouple identity verification logic from specific vendor implementations. This enables seamless migration between providers (e.g., TIC/Authway → Signicat) without changing application code.

## Architecture

```
Application Code
       ↓
identityVerificationService
       ↓
ProviderRegistry (selects provider)
       ↓
IdentityVerificationProvider Interface
       ↓
   ┌─────┴─────┬─────────┬──────────┐
   ↓           ↓         ↓          ↓
TicAuthway  Verifik  Signicat  [Future]
```

## Current Providers (MVP)

### TIC/Authway
- **Region**: Sweden
- **Methods**: BankID, Freja eID
- **Document Types**: Swedish passport, national ID, driver's license
- **Priority**: 1 (primary)

### Verifik
- **Region**: Spain
- **Methods**: DNI electrónico, document scan, video call
- **Document Types**: Spanish DNI, NIE, passport
- **Priority**: 1 (primary)

## Adding a New Provider

### Step 1: Implement the Interface

Create a new provider class that implements `IdentityVerificationProvider`:

```typescript
// src/services/providers/SignicatProvider.ts

import type {
  IdentityVerificationProvider,
  ProviderVerificationRequest,
  ProviderVerificationResult
} from "./types";

export class SignicatProvider implements IdentityVerificationProvider {
  readonly name = "Signicat";
  readonly supportedCountries = ["SE", "ES"];
  readonly supportedDocumentTypes = [/* ... */];
  readonly supportedMethods = [/* ... */];
  
  async startVerification(request: ProviderVerificationRequest) {
    // Implement Signicat API integration
  }
  
  async getStatus(sessionId: string): Promise<ProviderVerificationResult> {
    // Poll Signicat API and normalize response
  }
  
  async cancelVerification(sessionId: string): Promise<void> {
    // Cancel Signicat session
  }
  
  async healthCheck(): Promise<boolean> {
    // Verify Signicat API is operational
  }
}
```

### Step 2: Normalize Provider Response

The most critical part is the response normalization. Your provider must transform vendor-specific responses into the standard `ProviderVerificationResult` format:

```typescript
private normalizeResponse(rawData: any): ProviderVerificationResult {
  return {
    success: boolean,
    status: "pending" | "in_progress" | "completed" | "failed" | "expired",
    identity: {
      fullName: string,
      dateOfBirth: string,
      documentNumber: string,
      documentType: DocumentType,
      nationality: string,
      address?: string,
      expiryDate?: string
    },
    provider: {
      name: this.name,
      verificationId: string,
      timestamp: string,
      method: VerificationMethod,
      confidence?: number
    },
    rawResponse: rawData, // Store complete response for audit
    error?: {
      code: string,
      message: string,
      retryable: boolean
    }
  };
}
```

### Step 3: Register in ProviderRegistry

Add your provider to the registry initialization:

```typescript
// src/services/providers/ProviderRegistry.ts

private initializeProviders(): void {
  // ... existing providers ...
  
  const signicatConfig: ProviderConfig = {
    name: "Signicat",
    enabled: !!process.env.NEXT_PUBLIC_SIGNICAT_API_KEY,
    priority: 1, // Adjust priority (lower = higher priority)
    apiKey: process.env.NEXT_PUBLIC_SIGNICAT_API_KEY,
    apiUrl: process.env.NEXT_PUBLIC_SIGNICAT_API_URL,
    timeout: 300,
    retryAttempts: 3
  };
  
  if (signicatConfig.enabled && signicatConfig.apiKey) {
    const provider = new SignicatProvider({
      apiKey: signicatConfig.apiKey,
      apiUrl: signicatConfig.apiUrl!
    });
    this.providers.set("Signicat", provider);
    this.configs.set("Signicat", signicatConfig);
    this.initHealthStatus("Signicat");
  }
}
```

### Step 4: Environment Variables

Add provider credentials to `.env.local`:

```bash
NEXT_PUBLIC_SIGNICAT_API_KEY=your_api_key
NEXT_PUBLIC_SIGNICAT_API_URL=https://api.signicat.com
```

### Step 5: Test Provider Selection

The registry automatically selects providers based on:
1. Country support
2. Document type support
3. Method support (if specified)
4. Health status (healthy providers first)
5. Priority (lower number = higher priority)
6. Consecutive failures (fewer is better)

No application code changes needed — the registry handles selection.

## Migration Example: TIC/Authway → Signicat

### Scenario
You want to migrate Swedish identity verification from TIC/Authway to Signicat.

### Steps

1. **Add Signicat provider** (Steps 1-4 above)

2. **Set priority** to favor Signicat:
   ```typescript
   const signicatConfig = {
     priority: 0  // Higher priority than TIC/Authway (priority: 1)
   };
   ```

3. **Deploy** — The registry now prefers Signicat for Swedish verifications

4. **Monitor** — Check provider health status via admin panel or API:
   ```typescript
   const health = await identityVerificationService.checkProvidersHealth();
   ```

5. **Disable old provider** (after validation):
   ```bash
   # Remove or comment out in .env.local
   # NEXT_PUBLIC_TIC_AUTHWAY_API_KEY=...
   ```

### Rollback
If Signicat has issues, the registry automatically fails over to TIC/Authway (if still enabled). Or manually adjust priorities:

```typescript
// Temporary rollback: boost TIC/Authway priority
const ticAuthwayConfig = {
  priority: 0  // Higher than Signicat
};
```

## Data Compatibility

All verification results are stored in a **provider-agnostic schema**:

```sql
verifications table:
- provider_name TEXT              -- "TIC/Authway", "Verifik", "Signicat", etc.
- provider_session_id TEXT        -- Vendor-specific session ID
- verification_method TEXT        -- "bankid", "freja", "dni_electronic", etc.
- identity_data JSONB             -- Normalized identity fields
- provider_raw_response JSONB    -- Complete vendor response for audit
- verified_at TIMESTAMPTZ         -- Completion timestamp
```

This means:
- ✅ Historical verifications remain queryable after provider changes
- ✅ Audit trails are preserved
- ✅ No data migration needed when switching providers

## Provider Health Monitoring

The system tracks provider health:

```typescript
interface ProviderHealthStatus {
  provider: string;
  healthy: boolean;
  lastChecked: string;
  consecutiveFailures: number;
  lastSuccess?: string;
  lastFailure?: string;
  responseTime?: number;
  errorRate?: number;
}
```

Providers are marked unhealthy after **3 consecutive failures** and temporarily excluded from selection until they recover.

## Testing Checklist

When adding a new provider:

- [ ] Implement all interface methods
- [ ] Handle all possible provider statuses
- [ ] Normalize identity data correctly
- [ ] Store raw response for audit
- [ ] Test error scenarios (network failure, API errors, user abandonment)
- [ ] Verify health check endpoint
- [ ] Test provider selection logic
- [ ] Validate data persistence in database
- [ ] Check audit logging
- [ ] Test failover to backup provider

## Support Contact

For provider integration questions:
- **Technical**: Review `src/services/providers/types.ts` for complete interface
- **Examples**: See `TicAuthwayProvider.ts` and `VerifikProvider.ts`
- **Testing**: Use admin panel → Provider Health section