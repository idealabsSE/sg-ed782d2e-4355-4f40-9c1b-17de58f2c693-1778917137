---
title: Case Result Export & Secure Sharing
status: todo
priority: medium
type: feature
tags: [cases, export, phase-4]
created_by: softgen
created_at: 2026-05-17
position: 27
---

## Notes
Implement Step 4.7 of the development plan. Case results must be shareable securely across parties using signed URLs, and an official PDF summary must be generated in the language of the requesting party.

## Checklist
- [ ] Build a server-side PDF generation utility for the `trust_risk_summary`
- [ ] Make the PDF layout locale-aware (EN, SV, ES) based on the requesting user
- [ ] Implement Supabase Storage signed URLs with strict expiry for sharing case results
- [ ] Ensure RLS policies prevent users from viewing raw evidence data of other parties (e.g., owner cannot see tenant's raw payslip, only the verified signal)

## Acceptance
- A case summary can be exported as a professional PDF in the user's preferred language.
- Shareable links utilize short-expiry signed URLs.
- Privacy is maintained: parties only see derived trust signals of other parties, not raw documents.