# Trust Platform App Plan v0.3

**Purpose:** High-level engineering blueprint for vibe coding the Trust platform  
**Audience:** AI coding agent and engineering leads  
**Stack:** Supabase · Next.js · i18n-first · Modular monolith  
**Updated:** May 2026

---

## What This App Is

A cross-border rental verification SaaS for Spain, serving Swedish and Spanish users in any combination. It verifies three things:

1. **The property** — regional tourist license, registry compliance, ingested from official Spanish open data
2. **The person** — identity, financial credibility, document-backed evidence for both Swedish and Spanish users
3. **The connection** — whether the person is actually the owner, tenant, manager or guarantor of that specific property

---

## Architecture in One Sentence

Supabase-native modular monolith, i18n from day one, RLS as the authorization layer, plugin-ready for new regions and providers.

---

## Identity & Verification Provider Strategy

### MVP Provider Selection (Decided)

| Layer | Country | MVP Provider | Rationale |
|-------|---------|--------------|-----------|
| Person identity | Sweden (SE) | TIC / Authway | Narrow BankID/Freja eID abstraction, simple API, fast integration |
| Person identity | Spain (ES) | Verifik | Spain-specific DNI/NIE endpoint, direct CIF/NIF validation, low integration overhead |
| Property license data | Spain | GVA open data CSV | Official open dataset, batch ingest, no API dependency |
| Ownership verification | Spain | Nota Simple (manual/intermediary) | No confirmed direct API — document-backed workflow in MVP |

### Post-MVP Provider Migration Path

- **Signicat** replaces TIC/Authway (SE) and/or Verifik (ES) when app exits MVP
- Signicat provides broader European identity orchestration, BankID abstraction, eID, biometrics, data verification across markets, and acquired Spanish Electronic IDentification (eID)
- Migration is low-risk **only if** a provider abstraction layer is in place from day one (see Plugin Extension Contract below)

### Provider Abstraction Layer — Mandatory Pattern

Never call TIC, Authway, or Verifik directly from app logic. All identity verification must go through an internal provider interface:

```
startVerification(provider, params) → verificationId
getVerificationStatus(verificationId) → status, result
normalizeIdentityResult(rawResult) → IdentityVerificationRecord
storeEvidenceReference(personId, verificationId, provider) → void
```

Adding Signicat post-MVP = create new provider module + register + add config. No core files change.

---

## Property Data Strategy

### Layer 1 — Regional License Data (GVA)

- Source: GVA open-data CSV (dades turisme habitatges, Comunitat Valenciana)
- Fields: signatura, province, municipality, postal code, address, registration date, cadastral reference, capacity
- Ingestion: scheduled Edge Function, batch, not real-time polling
- Process: fetch CSV → normalize → diff against sourcesnapshot → write new/updated/removed to regionallicense → log in connectormetadata → alert ops on anomaly
- Secondary spot-check: SForms lookup (not primary ingestion path)
- Scale: add new regions as separate connector modules — no core files change

### Layer 2 — Nota Simple / Ownership Verification

- Purpose: confirm that the claimed owner/host is actually the registered owner in the Spanish land registry (Registro de la Propiedad)
- What it contains: registered owner name, charges, encumbrances, property identifiers
- Request inputs: address, cadastral reference, or CRU/IDUFIR
- **MVP approach:** user-uploaded PDF or digital order via a third-party intermediary (e.g., RegistroPortal, Tinsa, or equivalent) — not a direct registry API
- **Direct API:** deferred from MVP; design the data model now, automate later
- **Workflow design:**
  1. User or agency initiates ownership check for a case
  2. Nota Simple ordered or uploaded → stored in private Storage
  3. Key fields extracted: owner name, NIE/DNI, property identifiers
  4. System matches against claimed person identity
  5. Result: `ownership_confirmed` | `mismatch` | `manual_review_needed`
  6. Reviewer queue handles ambiguous cases
- **Architecture note:** build as `ownershipverification` module with its own workflow state, document storage, reviewer integration, and RLS — not inline in person verification

### Layer 3 — National Rental Registration (NRA/NRUA)

- Status: no confirmed public REST API; SPA with Friendly Captcha blocks automation
- MVP: manual entry or partner-fed data
- Data model: nationallicense table (nullable per property) — design now, automate later
- Post-MVP: automate when official API access confirmed

---

## Multilingual Architecture Constraint

| Language | Status |
|----------|--------|
| English | Default — required from the first build |
| Swedish | Required before MVP completion |
| Spanish | Required before MVP completion |

The app is i18n-first from the first commit. Rules:
- No hardcoded strings anywhere in UI, emails, notifications, summaries, or Edge Function responses
- Use next-intl or equivalent from the first component
- Translation key files committed alongside every new component
- Locale-aware per-user preference → org default → browser → English fallback
- No MVP feature is done unless it works in all three languages

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Database | Supabase Postgres | Core data store |
| Auth | Supabase Auth | JWT, sessions, RLS-integrated |
| Authorization | Supabase RLS | Primary access control — every non-public table |
| File storage | Supabase Storage | Private buckets, signed URLs only |
| Backend logic | Supabase Edge Functions (Deno) | Trusted logic, integrations, scheduled jobs |
| Frontend | Next.js App Router | React, server components, SSR |
| Localization | next-intl or i18next | i18n framework from day one |
| Scheduled jobs | Edge Functions cron | Ingestion, retention sweeps |
| SE identity (MVP) | TIC / Authway | BankID/Freja eID abstraction |
| ES identity (MVP) | Verifik | DNI/NIE, CIF/NIF verification |
| SE+ES identity (post-MVP) | Signicat | European identity platform, replaces TIC + Verifik |
| Property license data | GVA open-data CSV | Batch ingestion, Comunitat Valenciana |
| Ownership verification | Nota Simple intermediary | Manual/intermediary MVP, API deferred |
| AI tooling | MCP adapters | Phase 5 — property/license lookup, case tools |

---

## System Architecture

```
CLIENT LAYER
  Next.js App ←→ EN/SV/ES ←→ Partner API ←→ MCP Tools

  HTTPS ↕ Supabase Auth JWT

SUPABASE PLATFORM
  Postgres · Edge Functions · Storage (private) · RLS · Auth JWT · Vault · RLS secrets

EXTERNAL INTEGRATIONS
  GVA Open Data (CSV) · Nota Simple intermediary · TIC/Authway (MVP SE) · Verifik (MVP ES)
  → Signicat (post-MVP, replaces SE+ES providers)
  · NRA API (future) · Credit providers · More regions
```

---

## Module Map

```
src/
  sharedkernel/         Types, result wrappers, auth helpers, config, i18n helpers
  auth/                 Auth, sessions, profile creation
  organizations/        Multi-tenant orgs, members, roles, locale preference
  i18n/                 Translation keys EN/SV/ES, locale detection, helpers
    locales/            en.json · sv.json · es.json · config.ts
  properties/           Property entity, lookup, identifier resolution
  regionallicenses/     Regional tourist license records and compliance profiles
  nationallicenses/     NRA/NRUA data model — manual MVP, auto future
  swedishpersonverification/   SE identity — provider abstraction, financial, profile
    providers/
      tic/              TIC/Authway adapter (MVP)
      signicat/         Signicat adapter (post-MVP)
  spanishpersonverification/   ES identity, solvency, ownership, guarantor
    providers/
      verifik/          Verifik adapter (MVP)
      signicat/         Signicat adapter (post-MVP)
  documents/            Secure upload, metadata, signed URL access
  verificationcases/    Case workflow — property, parties, evidence, review
  connectors/           Plugin interface for data ingestion
    interface/          Connector contract: fetchSnapshot, normalizeRows, resolve
    gvacsv/             GVA open-data CSV connector (Phase 2)
    template/           Copy this to add a new region
  ownershipverification/  Nota Simple workflow, document storage, match logic, reviewer
  scoringandrules/      Trust scoring and rules engine
  privacyandgdpr/       DSAR, retention schedules, consent, audit
  securityandaudit/     Access log, incident, security reviews
  admin/                Review queues, manual actions, ops tooling
  notifications/        Email, SMS, webhook — locale-aware templates
  mcpadapters/          MCP tool exposure (Phase 5)
```

### Module Ownership Rule

Every module owns:
- Its Supabase migrations
- Its RLS policies
- Its Edge Function handlers
- Its translation keys
- Its tests
- Its public interface (what other modules may call)

When adding a new connector: create `connectors/newregion` → implement interface → register → add config, migrations, tests. No other module files should change.

When adding a new identity provider: create `[se|es]personverification/providers/newprovider` → implement provider interface → register → add config, tests. No core files modified.

---

## Data Model

### Property side

```
property              canonical property record
  regionallicense     1:many — one per region/connector
  nationallicense     1:1, nullable — NRA/NRUA, manual MVP
  sourcesnapshot      audit trail per ingestion run
  connectormetadata   connector registry, run log, health
```

### Person side

```
person                canonical person record
  identityverification  1:many — per method/provider/country
  financialprofile      1:1 — derived summary of evidence
  persondocument        1:many — metadata only, file in Storage
  persontrustprofile    1:1 — derived shareable summary
```

### Relationship and case side

```
verificationcase
  verificationcaseparty   1:many — person + role
  propertyrelationship    person ↔ property ↔ role type ↔ evidence ref
  ownershipverification   registry-backed owner check (Nota Simple workflow)
  authorityverification   manager/rep authority check
  reviewoutcome           reviewer decision + notes
  trustrisksummary        derived trust signal
```

### Org and auth side

```
auth.users ↔ profiles   1:1
organizationmembers     1:many
organizations
organizationroles
```

### Compliance side

```
dataprocessingrecord · datasubjectrequest · vendorregistry
accessauditlog · securityincident · securityreviewrecord
```

---

## User Roles and RLS

| Role | What they can see |
|------|------------------|
| owner | Own profile, own cases, own properties |
| tenant | Own profile, own cases |
| agencymember | Org-scoped cases, properties, clients |
| agencyadmin | Full org management |
| reviewer | Assigned cases — read and write review outcome |
| ops | Ingestion jobs, connector health, source monitoring |
| admin | Full platform access — strictly audited |

**RLS rule:** All roles enforced via Supabase RLS policies on every non-public table. Never trust frontend role checks alone.

---

## Key Flows

### Flow 1 — Property lookup
Input: address / cadastral ref / CRU / license number → resolve property identifier → query regionallicense (ingested GVA data) → return compliance profile (source, timestamp, status) → optional SForms secondary spot-check

### Flow 2 — Swedish person verification (TIC/Authway MVP → Signicat post-MVP)
User starts → BankID/Freja eID identity step (provider abstraction) → document upload (payslips, employment cert, income proof) → stored in private Storage, metadata in persondocument → automated rules pass → optional manual review → persontrustprofile generated (derived, no raw data exposed) → shareable via signed link or case attachment → UI and notifications in user's language (SV/EN)

### Flow 3 — Spanish person verification (Verifik MVP → Signicat post-MVP)
User starts → identity evidence upload (DNI/NIE/passport) → role-specific step: owner (Nota Simple upload or intermediary order) / tenant (payslips, work contract, bank statements) / guarantor (avalista docs, income evidence) → documents in private Storage, metadata only in DB → reviewer review → persontrustprofile generated → UI and notifications in user's language (ES/EN)

### Flow 4 — Cross-border verification case
Agency creates case → links property → invites owner (ES) + tenant (SE) + optional guarantor → each party completes their flow in their language → ownership verified against registry evidence → reviewer holistic case review → trustrisksummary generated → result shared per RLS permissions → all notifications in correct language per party

### Flow 5 — GVA ingestion (scheduled ops)
Scheduled Edge Function → GVA connector → fetch open-data CSV from GVA portal → normalize to staging → diff against sourcesnapshot → write new/updated/removed to regionallicense → log run in connectormetadata → alert ops if anomaly (0 rows, schema change, fetch error)

### Flow 6 — Nota Simple ownership verification
User/agency initiates ownership check → Nota Simple ordered (via intermediary portal) or uploaded by user → PDF stored in private Storage → key fields extracted (owner name, NIE/DNI, IDUFIR) → matched against claimed person identity → result status set → reviewer queue if ambiguous → ownershipverification record updated → case trustrisksummary updated

---

## Security Model

- **Public data:** open, no auth — basic property compliance status
- **Auth required:** Supabase JWT — all user-facing data
- **Tenant-scoped:** RLS — `auth.uid()` + org membership check
- **Sensitive documents:** private Storage + signed URL + audit log entry
- **Admin actions:** admin role RLS + mandatory audit log
- **Privileged backend:** Edge Functions only — `servicerole` never in client
- **Secrets:** Supabase Vault — never hardcoded, never logged

---

## GDPR Design Rules

| Rule | What it means in code |
|------|----------------------|
| Legal basis documented | Insert to `dataprocessingrecord` for each processing activity |
| Data minimization | Store derived signals, not raw copies wherever possible |
| Retention schedules | Automated deletion Edge Functions per data category |
| DSAR workflow | `datasubjectrequest` table + Edge Function handler |
| Private by default | New tables default to RLS deny-all; explicitly open what needs opening |
| Vendor registry | All third-party processors (TIC, Authway, Verifik, Signicat, Nota Simple intermediary) registered in `vendorregistry` |

---

## Plugin Extension Contract

### Adding a new regional connector

1. Create `connectors/newregion`
2. Implement interface: `fetchSnapshot` (raw data from source) · `normalizeRows` (transform to staging schema) · `resolvePropertyIdentifier` (return property match)
3. Register in connector registry
4. Add Supabase migration, config, tests
5. No core files modified

### Adding a new identity/verification provider

1. Create provider module e.g. `swedishpersonverification/providers/newprovider`
2. Implement provider interface: `identityCheck`, `status`, `resultType`, `normalizeResult`
3. Register in provider registry
4. Add config + tests
5. No core files modified

---

## MVP Checklist

### Must ship in MVP

- [ ] i18n framework in place (EN default, SV and ES before release)
- [ ] GVA open-data CSV ingestion connector live
- [ ] Property lookup and compliance profile working
- [ ] Swedish person verification — TIC/Authway abstraction + document/financial
- [ ] Spanish person verification — Verifik (DNI/NIE) + identity owner/tenant/guarantor
- [ ] Nota Simple ownership workflow — manual upload or intermediary order + document storage + match logic
- [ ] Document upload with private Storage and signed URLs
- [ ] Verification case workflow — multi-party, multi-language
- [ ] Ownership/authority verification — document-backed
- [ ] Reviewer queue — manual review and decision
- [ ] RLS on all non-public tables
- [ ] Audit log for sensitive data access
- [ ] DSAR intake workflow
- [ ] Retention policy config and sweep job
- [ ] All secrets in Vault
- [ ] Modular connector interface documented and tested
- [ ] Provider abstraction layer for identity providers (enables post-MVP migration to Signicat)

### Deferred from MVP

- Signicat integration (replaces TIC/Authway + Verifik)
- Automated NRA integration
- Direct credit bureau API
- Direct Nota Simple API (registry direct access)
- MCP adapter layer
- Partner/white-label API
- More regional connectors beyond GVA
- ML-based scoring

---

## Phased Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Foundation — Supabase setup, auth, orgs, RLS baseline, i18n framework EN/SV/ES, core schema, GDPR data model, security baseline, connector interface contract |
| 2 | Property Trust Layer — GVA open-data CSV connector, property ingestion, snapshot diffing, source monitoring, property lookup API, regional license compliance profile, SForms secondary lookup |
| 3 | Person Trust Layer — Swedish verification module (TIC/Authway abstraction, documents), Spanish verification module (Verifik, identity/owner/tenant/guarantor), Nota Simple ownership workflow, document upload, Storage, signed URLs, trust profile summary, reviewer queue |
| 4 | Relationship and Case Workflows — verification case workflow, multi-party, ownership/authority verification, case trust/risk summary, per-party notifications, full review and decision flow |
| 5 | Extensibility — migrate identity providers to Signicat, additional regional connectors, additional identity/financial providers, MCP adapter layer, partner API/white-label, NRA automation path |

---

## Open Questions

| # | Question | Blocks | Priority |
|---|----------|--------|----------|
| 1 | TIC vs Authway — which to use as primary SE provider in MVP? | Phase 3 SE module | High |
| 2 | Verifik pricing and contract terms — acceptable for MVP scale? | Phase 3 ES module | High |
| 3 | Nota Simple intermediary selection — RegistroPortal, Tinsa, or other? | Phase 3/4 ES ownership | High |
| 4 | Signicat onboarding timeline — when does migration from TIC+Verifik make sense? | Post-MVP | Medium |
| 5 | NRA official API access available at all? | Phase 5 (deferred) | High |
| 6 | i18n framework choice — next-intl vs i18next? | Phase 1 | Medium |
| 7 | Translation key ownership — developer-led or translation tool? | Phase 1 | Medium |
| 8 | GDPR legal review before commercial launch | Pre-launch | High |
| 9 | Swedish credit check provider selection | Phase 3 (deferred from MVP) | Medium |
| 10 | Multi-region connector priority after GVA | Phase 5 | Medium |
| 11 | B2B onboarding — self-serve or assisted? | Pre-launch | Medium |
| 12 | White-label API format and auth model | Phase 5 | Low |

---

*Trust Platform App Plan v0.3 — optimized for vibe coding foundation*
