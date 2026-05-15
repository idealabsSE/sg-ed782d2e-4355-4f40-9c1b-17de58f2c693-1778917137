---
title: B2B Multi-Party Case Management
status: in_progress
priority: high
type: feature
tags: [cases, b2b, multi-party]
created_by: softgen
created_at: 2026-05-15
position: 5
---

## Notes
Build the B2B case management interface for agencies and property managers. Users can create cases, invite multiple parties (tenant + host + property), and track verification progress for all participants. This establishes the multi-party workflow that's central to the trust platform's value proposition.

## Checklist
- [x] Update /cases page with case list and "Create Case" action
- [x] Build case cards showing case status, parties, and progress
- [x] Add PartyStatusBadge component with verification states
- [x] Display property details within each case card
- [x] Add case management translations in all languages
- [ ] Build CreateCaseModal with property selection and party invitation fields (deferred to future iteration)
- [ ] Implement case detail view with party management (deferred to future iteration)

## Acceptance
- Users can view a list of cases with property and party information.
- Case cards display verification status for each party with color-coded badges.
- The interface shows relationships between the property and the invited persons.
- Status badges indicate which parties are pending, verified, or flagged.