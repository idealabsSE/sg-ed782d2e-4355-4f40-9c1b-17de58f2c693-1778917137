---
title: Notification System (Locale-Aware)
status: todo
priority: medium
type: feature
tags: [backend, notifications, email, i18n]
created_by: softgen
created_at: 2026-05-15
position: 15
---

## Notes
Implement notification system per PRD Section 11.H and multilingual requirements. All notifications must be sent in the recipient's preferred language (English, Swedish, Spanish).

## Checklist
- [ ] Create notification templates in EN/SV/ES for all events
- [ ] Build Edge Function for email sending via Supabase Auth email service
- [ ] Implement notification types: case_invite, verification_complete, review_decision, status_update
- [ ] Add user notification preferences table
- [ ] Create notification queue with retry logic
- [ ] Build notification history and tracking
- [ ] Implement locale detection: user preference → org default → browser → English
- [ ] Add notification testing/preview interface for admins

## Acceptance
- Case invitations sent in recipient's language
- Verification completion emails trigger correctly
- Review decisions notify all case parties
- Users can configure notification preferences
- Failed notifications retry with exponential backoff
- All notification text properly localized