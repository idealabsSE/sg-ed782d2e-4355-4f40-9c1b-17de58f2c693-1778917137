# Notifications Module

## Purpose
Multi-channel notification delivery (email, SMS, in-app).

## Public Interface
- **NotificationService**: Send and track notifications
- **NotificationTypes**: TypeScript types for notification entities

## Dependencies
- sharedkernel
- auth
- organizations

## Usage
```typescript
import { notificationService } from "@/notifications/NotificationService"
```