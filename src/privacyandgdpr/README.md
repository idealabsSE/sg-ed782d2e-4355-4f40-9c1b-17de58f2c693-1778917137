# Privacy and GDPR Module

## Purpose
GDPR compliance: data retention, export, deletion, and consent management.

## Public Interface
- **GdprService**: GDPR operations (export, deletion, retention)
- **GdprTypes**: TypeScript types for GDPR entities

## Dependencies
- sharedkernel
- auth

## Usage
```typescript
import { gdprService } from "@/privacyandgdpr/GdprService"
```