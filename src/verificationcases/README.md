# Verification Cases Module

## Purpose
B2B multi-party case management for verification workflows.

## Public Interface
- **CaseService**: Case creation, updates, and status management
- **CaseTypes**: TypeScript types for case entities

## Dependencies
- sharedkernel
- auth
- organizations
- notifications

## Usage
```typescript
import { caseService } from "@/verificationcases/CaseService"
```