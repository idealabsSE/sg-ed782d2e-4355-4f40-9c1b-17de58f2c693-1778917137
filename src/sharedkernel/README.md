# Shared Kernel

## Purpose
Core domain primitives and cross-cutting concerns shared across all modules.

## Public Interface
- **Types**: Common TypeScript types and interfaces
- **Providers**: Base provider interfaces (IdentityProvider, etc.)
- **Utils**: Shared utility functions
- **Constants**: Application-wide constants

## Dependencies
None (this is the foundation layer)

## Usage
```typescript
import type { IdentityProvider } from "@/sharedkernel/providers/IdentityProvider"
```