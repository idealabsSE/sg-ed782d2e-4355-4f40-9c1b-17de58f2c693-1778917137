---
title: Notification System (Locale-Aware)
status: done
priority: medium
type: feature
tags:
- backend
- notifications
- email
- i18n
created_by: softgen
created_at: 2026-05-15
position: 15
---

## Notes
Implement notification system per PRD Section 11.H and multilingual requirements. All notifications must be sent in the recipient's preferred language (English, Swedish, Spanish).

## Checklist
- [x] Create notification templates in EN/SV/ES for all events
- [x] Build Edge Function for email sending via Supabase Auth email service
- [x] Implement notification types: case_invite, verification_complete, review_decision, status_update
- [x] Add user notification preferences table
- [x] Create notification queue with retry logic
- [x] Build notification history and tracking
- [x] Implement locale detection: user preference → org default → browser → English
- [x] Add notification testing/preview interface for admins

## Acceptance
- Case invitations sent in recipient's language
- Verification completion emails trigger correctly
- Review decisions notify all case parties
- Users can configure notification preferences
- Failed notifications retry with exponential backoff
- All notification text properly localized
