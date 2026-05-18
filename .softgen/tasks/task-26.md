---
title: Authority Verification Workflow
status: todo
priority: medium
type: feature
tags:
- verification
- relationship
- phase-4
created_by: softgen
created_at: 2026-05-17
position: 26
---

## Notes
Address Layer C of the PRD / Step 4.4 of the plan for users acting in a manager or representative role. This workflow verifies authority (rather than direct ownership) through Power of Attorney or management mandates.

## Checklist
- [x] Build upload interface for Power of Attorney / Management Mandate documents
- [x] Implement secure storage of the document with metadata tracked in `authority_verification`
- [x] Add data extraction and matching logic vs claimed identity
- [x] Update case party status based on authority verification result
- [x] Ensure integration with the overall Case Review and Trust Summary

## Acceptance
- Users selecting the "manager/representative" role can upload a mandate.
- The document is securely stored and logged.
- Reviewers can view the mandate and confirm the user's authority to represent the property.
