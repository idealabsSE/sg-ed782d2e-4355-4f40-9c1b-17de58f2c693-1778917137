---
title: Swedish Tenant & Host Verification Flow
status: todo
priority: high
type: feature
tags: [verification, swedish, identity]
position: 3
---

## Notes
Implement the wizard for Swedish users to verify their identity and solvency. This abstracts the BankID/Freja flow and handles document uploads for financial evidence (payslips, employment certificates). 

## Checklist
- [ ] Build a multi-step verification wizard specifically for Swedish users.
- [ ] Step 1: Mock interface for Swedish Identity Verification (simulating a TIC/Authway BankID flow).
- [ ] Step 2: Document upload area for financial evidence with drag-and-drop support and clear file type constraints.
- [ ] Step 3: A derived "Trust Profile Summary" screen showing the verified status without exposing the raw uploaded files.
- [ ] Ensure all wizard steps have English, Swedish, and Spanish copy placeholders.

## Acceptance
- A user can step through the mock identity check and arrive at the document upload screen.
- Uploaded files simulate secure attachment to the user's profile.
- The final step displays a clean, shareable summary of the user's trust signals.