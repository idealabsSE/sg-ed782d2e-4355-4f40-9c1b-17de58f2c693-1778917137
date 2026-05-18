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
| NRA status lookup | Spain | Manual / CORPME partner (MVP) | API confirmed but Friendly Captcha blocks automation — B2B access pending |

### Post-MVP Provider Migration Path

- **Signicat** replaces TIC/Authway (SE) and/or Verifik (ES) when app exits MVP
- Signicat provides broader European identity orchestration, BankID abstraction, eID, biometrics, data verification across markets, and acquired Spanish Electronic IDentification (eID)
- Migration is low-risk **only if** a provider abstraction layer is in place from day one (see Plugin Extension Contract below)

### Provider Abstraction Layer — Mandatory Pattern

Never call TIC, Authway, Verifik, or any identity/registry provider directly from app logic. All verification must go through an internal provider interface:

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

#### Confirmed technical findings (May 2026)

The NRA status lookup endpoint has been confirmed via DevTools inspection of `sede.registradores.org/sede/sede-nra-web/nra`:

- **Endpoint:** `POST https://api-sede-pub.registradores.org/sede-nra-core/public/api/v1/estado/nra`
- **Domain:** `api-sede-pub.registradores.org` — a separate, public-facing API backend
- **Request format:** JSON body with two fields:
  ```json
  { "nra": "ESFCTU0000...", "captcha": "<friendly-captcha-token>" }
  ```
- **CORS:** requires `Origin: https://sede.registradores.org` header
- **Auth:** no API key observed — but Friendly Captcha token is required per request

#### The Friendly Captcha blocker

The API requires a **Friendly Captcha** token generated by JavaScript proof-of-work in a real browser. Tokens are single-use and session-bound. This makes direct programmatic access without a browser impossible without either:

1. A **CORPME B2B API agreement** that bypasses captcha
2. A **headless browser** (Playwright/Puppeteer) — technically possible but fragile, expensive, and likely against ToS
3. A **partner intermediary** (e.g., Nota Simple intermediary) that already has CORPME B2B access and covers NRA status

#### NRA number format

The NRA number follows a structured format, e.g.: `ESFCTU0000030510000453450000000000000000000VT459096A4`
- `ES` — country code
- Region/municipality prefix follows
- Ends with property-specific identifiers

Local format validation (regex/checksum) should be implemented before any API call is attempted.

#### Who can deliver NRA lookup

| Source | Can deliver? | Notes |
|--------|-------------|-------|
| **CORPME/Registradores direct** | Likely yes | They own the API and have existing B2B programs (Nota Simple, registry publicity). Contact them directly about NRA B2B API access. |
| **Verifik** | No | Verifik covers DNI/NIE and CIF/NIF only — no NRA or property registry data in their product catalog |
| **Nota Simple intermediary** | Possibly | Intermediaries (RegistroPortal, Tinsa) are existing CORPME partners — worth asking if they cover NRA status |
| **Headless scraping** | Not recommended | Fragile, likely ToS violation, not production-safe |

#### Action required (pre-Phase 3)

Contact CORPME via `sede.registradores.org` and ask:

> *"¿Existe un programa de acceso API para consulta del estado del Número de Registro de Alquiler (NRA) para plataformas de verificación de alquileres? Hemos identificado el endpoint `/sede-nra-core/public/api/v1/estado/nra` y nos interesa acceso programático sin captcha para uso B2B."*

#### MVP treatment

- Manual NRA number entry by owner/agent, stored as `nationallicense` record
- NRA connector module built now with correct interface and `pending_automation` status flag
- Manual fallback always active — never block a case on NRA API availability
- Automate when CORPME B2B access is confirmed

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
| NRA status (MVP) | Manual entry + CORPME contact | API confirmed, captcha blocks automation — B2B access pending |
| NRA status (post-MVP) | CORPME B2B API | When B2B access confirmed |
| AI tooling | MCP adapters | Phase 5 — property/license lookup, case tools |

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
  nationallicenses/     NRA/NRUA data model — manual MVP, CORPME API post-MVP
    providers/
      manual/           Manual entry and status update
      corpme/           CORPME B2B API adapter (post-MVP, pending access)
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

Every module owns its Supabase migrations, RLS policies, Edge Function handlers, translation keys, tests, and public interface.

When adding a new connector: create `connectors/newregion` → implement interface → register → add config, migrations, tests. No other module files change.

When adding a new identity provider: create `[se|es]personverification/providers/newprovider` → implement provider interface → register → add config, tests. No core files modified.

---

## Data Model

### Property side

```
property              canonical property record
  regionallicense     1:many — one per region/connector
  nationallicense     1:1, nullable — NRA/NRUA
    nra_number        stored NRA number
    nra_status        confirmed | pending | manual_entry | automation_pending
    nra_source        manual | corpme_api
    nra_verified_at   timestamp
  sourcesnapshot      audit trail per ingestion run
  connectormetadata   connector registry, run log, health
```

### Person side

```
person
  identityverification  1:many — per method/provider/country
  financialprofile      1:1 — derived summary
  persondocument        1:many — metadata only, file in Storage
  persontrustprofile    1:1 — derived shareable summary
```

### Relationship and case side

```
verificationcase
  verificationcaseparty   1:many — person + role
  propertyrelationship    person ↔ property ↔ role ↔ evidence ref
  ownershipverification   Nota Simple workflow and result
  authorityverification   manager/rep authority check
  reviewoutcome           reviewer decision + notes
  trustrisksummary        derived trust signal
```

### Org and auth side

```
auth.users ↔ profiles · organizationmembers · organizations · organizationroles
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

**RLS rule:** All roles enforced via Supabase RLS on every non-public table. Never trust frontend role checks alone.

---

## Key Flows

### Flow 1 — Property lookup
Address / cadastral ref / CRU / license number → resolve property identifier → query regionallicense (GVA data) → return compliance profile (source, timestamp, status) → optional SForms spot-check → display NRA status if present

### Flow 2 — Swedish person verification (TIC/Authway MVP → Signicat post-MVP)
BankID/Freja eID identity step (provider abstraction) → document upload (payslips, income proof) → private Storage, metadata in persondocument → automated rules → optional manual review → persontrustprofile generated → shareable via signed link

### Flow 3 — Spanish person verification (Verifik MVP → Signicat post-MVP)
DNI/NIE/passport upload → Verifik validation → role-specific step (owner: Nota Simple / tenant: payslips / guarantor: avalista docs) → private Storage → reviewer review → persontrustprofile generated

### Flow 4 — Cross-border verification case
Agency creates case → links property → invites owner (ES) + tenant (SE) + optional guarantor → each party completes flow in their language → ownership verified against Nota Simple → reviewer review → trustrisksummary → result shared per RLS → all notifications in correct language per party

### Flow 5 — GVA ingestion (scheduled ops)
Scheduled Edge Function → fetch GVA CSV → normalize → diff against sourcesnapshot → write new/updated/removed to regionallicense → log in connectormetadata → alert ops on anomaly

### Flow 6 — Nota Simple ownership verification
User/agency initiates → Nota Simple ordered (intermediary) or uploaded → PDF in private Storage → key fields extracted (owner name, NIE/DNI, IDUFIR) → matched against claimed person → result: `ownership_confirmed` | `mismatch` | `manual_review_needed` → reviewer queue if ambiguous → ownershipverification updated → case trustrisksummary updated

### Flow 7 — NRA status lookup (MVP: manual)
Owner/agent inputs NRA number → stored in nationallicense → status set to `manual_entry` → reviewer can verify against Nota Simple or official document → post-MVP: replace with CORPME API call when B2B access confirmed

---

## Security Model

- Public data: open, no auth (basic property compliance status)
- Auth required: Supabase JWT (all user-facing data)
- Tenant-scoped: RLS — auth.uid() + org membership check
- Sensitive documents: private Storage + signed URL + audit log entry
- Admin actions: admin role RLS + mandatory audit log
- Privileged backend: Edge Functions only — servicerole never in client
- Secrets: Supabase Vault — never hardcoded, never logged

---

## GDPR Design Rules

| Rule | What it means in code |
|------|----------------------|
| Legal basis documented | Insert to dataprocessingrecord for each processing activity |
| Data minimization | Store derived signals, not raw copies wherever possible |
| Retention schedules | Automated deletion Edge Functions per data category |
| DSAR workflow | datasubjectrequest table + Edge Function handler |
| Private by default | New tables default to RLS deny-all |
| Vendor registry | All third-party processors registered in vendorregistry — includes TIC, Authway, Verifik, Signicat, Nota Simple intermediary, CORPME (when integrated) |

---

## Plugin Extension Contract

### Adding a new regional connector
1. Create `connectors/newregion`
2. Implement interface: `fetchSnapshot` · `normalizeRows` · `resolvePropertyIdentifier`
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
- [ ] Nota Simple ownership workflow — upload or intermediary order + match logic + reviewer queue
- [ ] NRA number storage and manual status workflow (nationallicense module)
- [ ] Document upload with private Storage and signed URLs
- [ ] Verification case workflow — multi-party, multi-language
- [ ] Reviewer queue — manual review and decision
- [ ] RLS on all non-public tables
- [ ] Audit log for sensitive data access
- [ ] DSAR intake workflow
- [ ] Retention policy config and sweep job
- [ ] All secrets in Vault
- [ ] Modular connector interface documented and tested
- [ ] Provider abstraction layer for identity providers (enables post-MVP Signicat migration)
- [ ] NRA connector module scaffolded with pending_automation status (enables CORPME API drop-in)

### Deferred from MVP

- Signicat integration (replaces TIC/Authway + Verifik)
- CORPME B2B API for automated NRA lookup (pending access confirmation)
- Automated NRA status via CORPME (connector built, not wired)
- Direct credit bureau API
- Direct Nota Simple API (Registradores direct)
- MCP adapter layer
- Partner/white-label API
- More regional connectors beyond GVA
- ML-based scoring

---

## Phased Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Foundation — Supabase, auth, orgs, RLS, i18n EN/SV/ES, core schema, GDPR model, security baseline, connector + provider interface contracts |
| 2 | Property Trust Layer — GVA CSV connector, ingestion, snapshot diff, property lookup, compliance profile, SForms fallback |
| 3 | Person Trust Layer — TIC/Authway (SE), Verifik (ES), Nota Simple ownership workflow, NRA manual module, document upload, trust profile, reviewer queue |
| 4 | Relationship and Case Workflows — verification case, multi-party, ownership/authority verification, case trust/risk summary, per-party notifications, full review flow |
| 5 | Extensibility — Signicat migration, CORPME NRA API (when access confirmed), additional regions, MCP adapters, partner API |

---

## Open Questions

| # | Question | Blocks | Priority |
|---|----------|--------|----------|
| 1 | TIC vs Authway — which as primary SE provider in MVP? | Phase 3 SE module | High |
| 2 | Verifik pricing and contract terms | Phase 3 ES module | High |
| 3 | Nota Simple intermediary selection — RegistroPortal, Tinsa, or other? | Phase 3/4 ES ownership | High |
| 4 | **CORPME B2B API access for NRA — contact initiated?** | Phase 3/5 NRA automation | High |
| 5 | Does Nota Simple intermediary also cover NRA status lookup? | Phase 3 NRA | Medium |
| 6 | Signicat migration timeline | Post-MVP | Medium |
| 7 | NRA official API access — any formal partner program? | Phase 5 | High |
| 8 | i18n framework — next-intl vs i18next? | Phase 1 | Medium |
| 9 | Translation key ownership | Phase 1 | Medium |
| 10 | GDPR legal review before commercial launch | Pre-launch | High |
| 11 | Swedish credit check provider | Phase 3 deferred | Medium |
| 12 | Multi-region connector priority after GVA | Phase 5 | Medium |
| 13 | B2B onboarding — self-serve or assisted? | Pre-launch | Medium |
| 14 | White-label API format and auth model | Phase 5 | Low |

---

*Trust Platform App Plan v0.3 — optimized for vibe coding foundation*
