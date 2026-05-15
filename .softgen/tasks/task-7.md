---
title: Internal Reviewer Operations
status: todo
priority: medium
type: feature
tags: [admin, reviewer, ops]
position: 7
---

## Notes
Platform staff need a secure queue to manually review ambiguous cases, ownership mismatches, and complex document validations before issuing a final trust decision.

## Checklist
- [ ] Create an admin-only reviewer dashboard displaying a queue of pending manual reviews.
- [ ] Build a side-by-side review interface: raw user evidence on one side, extracted/registry data on the other.
- [ ] Add an action panel to approve, reject, or request more information for a specific verification case.
- [ ] Include an audit notes text area where the reviewer must log the reasoning for their decision.
- [ ] Add a GDPR/Privacy ops tab with mock data subject access requests (DSAR) and retention schedules.

## Acceptance
- Reviewers can view a dedicated queue separate from the standard user dashboards.
- The review interface allows secure, fast comparison of identity data.
- Reviewer decisions require a logged note and update the global case status.