---
title: Supabase Services Integration
status: todo
priority: high
type: feature
tags: [services, integration, supabase]
created_by: softgen
created_at: 2026-05-15
position: 9
---

## Notes
With the database schema in place, we need to wire up the frontend to use real Supabase data. This involves creating dedicated service files in `src/services/` for each domain and updating the existing UI components to fetch and mutate real data instead of mock states.

## Checklist
- [ ] Create `src/services/propertyService.ts` for property lookups and creation
- [ ] Create `src/services/verificationService.ts` for identity data submission
- [ ] Create `src/services/caseService.ts` to fetch and update multi-party B2B cases
- [ ] Update `/verify/property` to use `propertyService` for real searches
- [ ] Update `/verify/identity/*` flows to persist data to the `verifications` table
- [ ] Update `/cases` and `/admin` dashboards to load real data from Supabase

## Acceptance
- The property lookup form fetches data from the Supabase database.
- Identity verification flows successfully insert rows into the `verifications` table.
- The admin and cases dashboards display real-time data from the backend.