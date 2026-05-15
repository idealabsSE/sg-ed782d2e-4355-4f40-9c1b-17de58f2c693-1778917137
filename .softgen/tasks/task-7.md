---
title: Internal Reviewer Operations
status: in_progress
priority: medium
type: feature
tags: [admin, review, operations]
created_by: softgen
created_at: 2026-05-15
position: 7
---

## Notes
Build the internal admin interface for manual verification review. Reviewers see a queue of pending cases, examine identity documents and property matches, and make approval/rejection decisions with logged notes. This completes the human-in-the-loop verification workflow for ambiguous or flagged cases.

## Checklist
- [x] Update /admin page with reviewer queue interface
- [x] Build ReviewQueue component displaying pending cases
- [x] Create CaseReviewCard with case details, parties, and documents
- [x] Add reviewer decision actions (Approve, Reject, Flag for Investigation)
- [x] Build decision logging interface with required note field
- [x] Add admin operation translations

## Acceptance
- Reviewers see a prioritized queue of cases requiring manual review.
- Each case displays full context: property, parties, verification status, uploaded documents.
- Reviewer decisions require a logged note and update the case status immediately.
- The interface maintains strict confidentiality protection of identity data.
- Reviewer decisions require a logged note and update the global case status.