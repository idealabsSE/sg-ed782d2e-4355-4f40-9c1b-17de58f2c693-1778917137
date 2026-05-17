# Authentication Module

## Purpose
User authentication, session management, and access control.

## Public Interface
- **AuthContext**: React context for authentication state
- **AuthService**: Authentication operations (login, logout, session)
- **ProtectedRoute**: Component for route protection

## Dependencies
- sharedkernel

## Usage
```typescript
import { useAuth } from "@/auth/AuthContext"
import { ProtectedRoute } from "@/auth/ProtectedRoute"
```