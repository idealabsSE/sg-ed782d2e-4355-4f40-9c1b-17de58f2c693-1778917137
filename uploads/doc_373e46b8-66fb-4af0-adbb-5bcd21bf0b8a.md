# Trust Platform PRD v0.4

**Purpose:** Foundation document for vibe coding a cross-border rental verification SaaS  
**Stack:** Supabase Postgres · Auth · RLS · Storage · Edge Functions · Next.js frontend  
**Status:** Active working draft  
**Updated:** May 2026

---

## 1. Product Vision

Build a cross-border trust and compliance platform for rentals in Spain, serving Swedish and Spanish users in any combination. The platform answers three questions:

1. **Is this property legitimate?** Regional tourist license, registry presence, compliance status
2. **Is this person credible?** Identity, solvency, documentation, verified profile
3. **Are they actually connected to this property?** Ownership, authority, tenant or guarantor role verified against evidence

> Verify the property. Verify the person. Verify their connection to it.

The product is a unified verification platform with country-specific modules — not a Swedish tool bolted onto a Spanish property lookup.

---

## 2. What the App Must Do (Core Jobs)

| Job | Who needs it | Output |
|-----|-------------|--------|
| Look up a Spanish rental property | Anyone | Address, license number, compliance status |
| Check regional tourist license | Owner, agency, tenant | License valid / not found / expired |
| Check NRA registration status | Owner, agency, tenant | Registered / not registered / pending |
| Verify claimed owner is registered owner | Tenant, agency | Ownership confirmed / unconfirmed |
| Verify Swedish person identity & solvency | Spanish owner, agency | Verified Swedish trust profile |
| Verify Spanish person identity & solvency | Swedish tenant, agency | Verified Spanish trust profile |
| Verify guarantor tied to a case | Owner, agency | Guarantor evidence confirmed |
| Create a multi-party verification case | Agency, platform | Case with property, parties, evidence summary |
| Review a case manually | Internal reviewer | Review outcome + risk summary |
| Monitor property data sources | Ops | Alerts on changes or anomalies |

---

## 3. Users

### 3.1 Primary user types

| User | Country | Role in platform |
|------|---------|-----------------|
| Swedish tenant | SE | Self-verifies, submits trust profile for rental |
| Spanish tenant | ES | Self-verifies, submits trust profile for rental |
| Swedish owner/host | SE | Lists property, gets tenant verified |
| Spanish owner/host | ES | Lists property, gets tenant verified |
| Swedish guarantor | SE | Links to a case, submits solvency evidence |
| Spanish guarantor | ES | Links to a case, submits solvency evidence |
| Agency/property manager | SE or ES | Manages multiple clients and cases |
| Internal reviewer | Platform staff | Reviews cases, manual fallback decisions |
| Ops admin | Platform staff | Ingestion, monitoring, privacy, security |

### 3.2 All supported user combinations

The system must handle all of these without treating any as a special edge case:
- Spanish owner + Spanish tenant
- Spanish owner + Swedish tenant
- Swedish owner + Spanish tenant
- Swedish owner + Swedish tenant
- Agency (either country) managing any mix of the above
- Spanish or Swedish guarantor on any case
- Mixed multi-party cases (e.g., two co-owners + foreign tenant + guarantor)

### 3.3 B2B/B2C distinction

- **B2C prosumer** — individual owners or tenants, single property or case, paid per report or subscription
- **B2B** — agencies, property managers, platforms; org-level account, multiple cases and properties
- **API white-label** — partner platforms building verification into their own product

---

## 4. Product Layers

### Layer A — Property Trust

Verify the Spanish property through official sources:
- Regional tourist-rental license (starts with Comunidad Valenciana)
- Open-data datasets for property registration (GVA CSV)
- National rental registration (NRA/NRUA) — manual MVP, CORPME API post-MVP
- Future: direct automated NRA status via confirmed B2B access

### Layer B — Person Trust

Verify people involved in the rental:
- **Swedish identity** via TIC/Authway (MVP) → Signicat (post-MVP); financial evidence via documents
- **Spanish identity** via Verifik (MVP) → Signicat (post-MVP); DNI/NIE/passport evidence, solvency documents
- Both countries: document-backed workflows, derived trust profile summary

### Layer C — Relationship Trust

Verify that the person is actually connected to the property in the claimed role:
- Registered owner via registry evidence (Nota Simple)
- Authorized representative (property manager, power of attorney)
- Tenant linked to a specific rental case
- Guarantor linked to a specific case with solvency evidence

**This is not optional — it is a first-class product feature.**

---

## 5. Business Model

| Stream | Target | Model |
|--------|--------|-------|
| B2B subscription | Agencies, property managers, platforms | Monthly/annual, seat or case-based |
| B2C prosumer | Individual owners and tenants | Pay-per-report or personal subscription |
| White-label API | Partner platforms and marketplaces | API access pricing |
| Manual premium services | NRA checks, ownership research, enhanced review | Per-service fee |

Start simple — per-report or freemium for B2C, subscription tiers for B2B. Do not over-engineer pricing before product-market fit.

---

## 6. Confirmed Technical Constraints

### 6.1 GVA open data is the primary property ingestion source (MVP)

Comunitat Valenciana (GVA) publishes open-data CSV datasets for tourist-use dwellings containing: signatura, province, municipality, postal code, address, registration date, cadastral reference, capacity. Ingestion must be batch/scheduled, not real-time API polling.

### 6.2 GVA SForms is secondary only

SForms-based search works for spot-checking individual properties. Do not use it as primary ingestion. Use for secondary validation, manual lookup, fallback spot-check only.

### 6.3 No single national Spain-wide property API exists

Use a federated regional ingestion model — start with GVA, add regions as connector modules.

### 6.4 NRA/NRUA — API confirmed, automation blocked by Friendly Captcha

#### Confirmed findings (May 2026)

The NRA lookup API has been confirmed via DevTools inspection:

- **Endpoint:** `POST https://api-sede-pub.registradores.org/sede-nra-core/public/api/v1/estado/nra`
- **Request body:**
  ```json
  { "nra": "<nra_number>", "captcha": "<friendly_captcha_token>" }
  ```
- **CORS:** requires `Origin: https://sede.registradores.org`
- **Auth:** no API key, but Friendly Captcha token is mandatory per request
- **Captcha type:** Friendly Captcha — JavaScript proof-of-work, tokens are single-use and session-bound

#### Why automation is blocked

Friendly Captcha tokens cannot be generated without a real browser running JavaScript. This makes direct programmatic access impossible without either a B2B agreement that bypasses captcha, or a headless browser approach (fragile, likely ToS violation, not production-safe).

#### NRA number format

Structured identifier, e.g. `ESFCTU0000030510000453450000000000000000000VT459096A4`:
- `ES` — country prefix
- Region/municipality segment follows
- Ends with property-specific identifier

Implement local format validation before any API call.

#### Who can deliver NRA lookup programmatically

| Source | Capability | Notes |
|--------|-----------|-------|
| **CORPME/Registradores direct** | Likely yes — they own the API | Existing B2B programs for Nota Simple and registry publicity — NRA B2B API access should be requested. Contact via sede.registradores.org |
| **Nota Simple intermediary** (RegistroPortal, Tinsa) | Possibly | Already CORPME partners — ask if NRA status is in their product portfolio |
| **Verifik** | No | Covers DNI/NIE and CIF/NIF only — no property registry or NRA data |
| **Headless browser scraping** | Not recommended | Fragile, likely ToS violation, not production-safe |

#### Contact template for CORPME

> *"¿Existe un programa de acceso API para consulta del estado del Número de Registro de Alquiler (NRA) para plataformas de verificación de alquileres? Hemos identificado el endpoint `/sede-nra-core/public/api/v1/estado/nra` y nos interesa acceso programático sin captcha para uso B2B."*

#### MVP treatment

Manual NRA entry by owner/agent. NRA connector module built with `pending_automation` flag. Never block a case on NRA API availability — always have manual fallback active.

### 6.5 Swedish verification — abstraction first

BankID-based identity: use a provider abstraction layer. **MVP provider: TIC / Authway.** Never hardcode a specific SDK. Credit/financial: document-backed MVP. Direct credit bureau API deferred.

### 6.6 Spanish person verification is required, not optional

DNI/NIE/passport evidence workflows. Solvency via documents. Property-linked role verification via Nota Simple. **MVP provider: Verifik** for DNI/NIE and CIF/NIF validation. Verifik does **not** cover NRA or property registry data — those are separate modules.

### 6.7 Nota Simple for ownership/authority verification

MVP: manual upload or digital order via third-party intermediary (RegistroPortal, Tinsa, or equivalent). Direct Registradores API deferred. Full workflow: order initiation → document storage → key field extraction → person identity match → result status → reviewer queue.

Result states: `ownership_confirmed` | `mismatch` | `manual_review_needed`

### 6.8 Identity provider strategy — phased

**MVP:** TIC/Authway (SE) + Verifik (ES) — narrow, market-specific, fast integration.  
**Post-MVP:** Signicat replaces both — consolidated European identity platform with BankID abstraction, biometrics, eID orchestration, and Spanish eID via acquired Electronic IDentification.  

**Architectural requirement:** never call providers directly from app logic — always through internal provider interface. This makes the Signicat migration a module swap, not a rewrite.

### 6.9 Scope separation — identity vs property ownership

| Concern | Provider |
|---------|---------|
| Who is this person? (identity) | Verifik / Signicat |
| Is this person the registered property owner? (ownership) | Nota Simple module |
| Is this property registered for tourist rental? (license) | GVA connector |
| Is this property registered nationally? (NRA) | NRA module — manual MVP, CORPME API post-MVP |

These are four separate modules. No identity provider replaces the Nota Simple or NRA modules.

---

## 7. Multilingual Requirement (ARCHITECTURE CONSTRAINT)

| Language | Status |
|----------|--------|
| English | Default — required from first build |
| Swedish | Required before MVP completion |
| Spanish | Required before MVP completion |

- All user-facing strings from translation resources. No hardcoded copy anywhere.
- Email templates, notifications, documents, and trust summaries must be locale-aware.
- Shareable trust profiles renderable in all three languages.
- Backend error messages and Edge Function responses must be translatable.
- Language selection: user preference → org default → browser → English fallback.
- Use next-intl or i18next from the first frontend build.
- No MVP feature is done unless it works in all three languages.

---

## 8. Architecture Principles

| Principle | What it means |
|-----------|--------------|
| Supabase-native | Postgres, Auth, RLS, Storage, Edge Functions. Minimize third-party infrastructure. |
| Modular monolith | Single deployable unit. Strong module boundaries. Not premature microservices. |
| Open/closed | Add features by creating modules, not editing existing ones. |
| RLS as primary authorization | Every non-public table has RLS. No client-side auth logic as sole control. |
| Privacy by default | Minimum data collected. Strict separation of public property data vs. private person data. |
| Security by design | Least privilege, default deny, auditability, defense in depth from day one. |
| Multilingual from day one | i18n architecture in place before any user-facing string is hardcoded. |
| Plugin-ready | Connectors, providers, validators are pluggable modules, not inline logic. |
| Provider-agnostic identity | TIC, Authway, Verifik, Signicat always behind internal abstraction layer. |
| Explicit contracts | Modules communicate through defined interfaces, not internal imports. |

---

## 9. Supabase Backend Rules

| Rule | Detail |
|------|--------|
| RLS on all tables | Every non-public table has RLS. No exceptions. |
| servicerole never in client | servicerole key only in Edge Functions and server-side jobs. |
| Edge Functions for trusted logic | Auth checks, integrations, sensitive ops, scheduled jobs. |
| Private storage buckets | All user documents in private buckets. Signed URLs with expiry. |
| Audit logging | All sensitive access written to accessauditlog. |
| Secrets in Vault | All API keys in Supabase Vault. Never hardcoded, never logged. |

---

## 10. Data Domains

### Property side

```
property
  regionallicense       one or more per property (regional connector)
  nationallicense       NRA/NRUA record
    nra_number          stored NRA identifier
    nra_status          confirmed | pending | manual_entry | automation_pending
    nra_source          manual | corpme_api
    nra_verified_at     timestamp
  sourcesnapshot        raw ingestion record per connector run
  connectormetadata     connector registry, run history, health
```

### Person side

```
person
  identityverification  one per method/provider/country
  financialprofile      derived summary of financial evidence
  persondocument        metadata only — file in Storage
  persontrustprofile    derived shareable trust summary
```

### Relationship and case side

```
verificationcase
  verificationcaseparty     person + role
  propertyrelationship      person ↔ property ↔ role ↔ evidence
  ownershipverification     Nota Simple workflow + result
  authorityverification     manager/rep authority evidence
  reviewoutcome             reviewer decision + notes
  trustrisksummary          derived trust signal
```

### Organization and auth side

```
auth.users ↔ profiles · organizationmembers · organizations · organizationroles
```

### Compliance side

```
dataprocessingrecord · datasubjectrequest · vendorregistry
accessauditlog · securityincident · securityreviewrecord
```

---

## 11. Feature Areas

### A. Property Verification
- Resolve property by address, cadastral reference, CRU, license number, or municipality
- Fetch regional license data from ingested source (GVA)
- Return compliance profile with source name, ingestion timestamp, and status
- Display NRA registration status (manual MVP, CORPME API post-MVP)
- Support secondary SForms spot-check

### B. Bulk Ingestion and Source Monitoring
- Scheduled Edge Function to fetch GVA open-data CSV
- Normalize and diff against previous snapshot
- Write new/updated/removed to regionallicense
- Log run results in connectormetadata
- Alert ops on anomalies
- Connector interface pluggable — new regions without changing core

### C. Person Verification

**Swedish (TIC/Authway MVP → Signicat post-MVP):**
- BankID/Freja eID via provider abstraction
- Document upload: payslips, employment certificate, income statements
- Derived trust profile summary (no raw data exposed)

**Spanish (Verifik MVP → Signicat post-MVP):**
- DNI/NIE/passport validation via Verifik
- Owner/host: Nota Simple ownership document (Feature Area D)
- Tenant: payslips, work contract, bank statements
- Guarantor: avalista documents, income evidence
- Derived trust profile summary

### D. Ownership and Authority Verification (Nota Simple Module)
- Initiate ownership check (user upload or intermediary order)
- PDF stored in private Storage; metadata in ownershipverification
- Key fields extracted: owner name, NIE/DNI, IDUFIR
- Match against claimed person identity
- Result: `ownership_confirmed` | `mismatch` | `manual_review_needed`
- Reviewer queue for ambiguous cases

### E. NRA Status Module
- Store NRA number entered by owner/agent
- Manual status entry and reviewer confirmation (MVP)
- NRA connector scaffolded with `pending_automation` flag
- Post-MVP: CORPME B2B API replaces manual entry when access confirmed
- Never block a verification case on NRA status — always allow manual fallback

### F. Verification Cases
- Create case with linked property
- Invite parties (owner, tenant, guarantor, co-tenant, representative)
- Each party completes verification in their language
- Evidence aggregated per case
- Trust/risk summary generated
- Case result shared per RLS

### G. Admin and Compliance Operations
- Manual review queue
- DSAR intake, tracking, resolution
- Retention/deletion schedules and sweep execution
- Vendor registry (TIC, Authway, Verifik, Signicat, Nota Simple intermediary, CORPME)
- Audit log review
- Manual NRA status update (MVP fallback)

### H. Multilingual Experience
- i18n from first build — EN default, SV and ES before MVP
- All UI, notifications, exports, summaries, admin screens localized
- Per-user and per-org language preference

### I. Extensibility (Phase 5)
- Migrate identity providers to Signicat
- CORPME B2B API for NRA automation
- Additional regional connectors
- MCP adapter layer
- Partner API / white-label
- Direct Nota Simple API

---

## 12. Key User Flows

### Flow 1 — Property lookup
Address / CRU / license number → resolve property → query regionallicense → return compliance profile → display NRA status if available → optional SForms spot-check

### Flow 2 — Swedish person verification
TIC/Authway BankID/Freja eID → document upload → private Storage → automated rules → optional review → trust profile generated

### Flow 3 — Spanish person verification
DNI/NIE upload → Verifik validation → role-specific documents → private Storage → trust profile generated

### Flow 4 — Cross-border verification case
Agency creates case → links property → invites all parties → each verifies in their language → ownership verified via Nota Simple → reviewer review → trustrisksummary → result shared per RLS

### Flow 5 — GVA ingestion
Scheduled Edge Function → fetch CSV → normalize → diff → write regionallicense → log → alert on anomaly

### Flow 6 — Nota Simple ownership verification
Initiate → order or upload → PDF stored → fields extracted → match against person → result set → reviewer if ambiguous → ownershipverification updated → trustrisksummary updated

### Flow 7 — NRA status (MVP: manual)
Owner/agent inputs NRA number → stored in nationallicense → status: `manual_entry` → reviewer confirms against document → post-MVP: CORPME API replaces manual step

---

## 13. Security Requirements

**Principles:** least privilege, default deny, defense in depth, secure defaults, auditability, minimized blast radius.

**Implementation:**
- Private documents: signed URLs with short expiry
- Edge Functions: validate auth before any privileged action
- servicerole never in browser context
- All secrets in Vault — never hardcoded, never logged
- Ingestion: validate and sanitize all external data before writing to DB
- Admin tooling: separate role, separate RLS policy, full audit trail

---

## 14. GDPR Requirements

| Principle | Implementation |
|-----------|---------------|
| Lawfulness & transparency | Legal basis in dataprocessingrecord per activity |
| Purpose limitation | Only collect data needed for the specific case |
| Data minimization | Derived summaries over raw storage where possible |
| Storage limitation | Retention/deletion schedules, automated sweep jobs |
| Integrity & confidentiality | RLS, private buckets, signed URLs, encryption at rest |
| Accountability | Audit log, vendor registry, DSAR workflow |

All third-party processors (TIC, Authway, Verifik, Signicat, Nota Simple intermediary, CORPME when integrated) must be in vendorregistry. DSAR requests must be processable within legal deadlines.

---

## 15. MVP Definition

### Included in MVP

- i18n architecture (EN default, SV and ES before sign-off)
- GVA open-data CSV ingestion (Comunitat Valenciana)
- Property lookup and regional license resolution
- Swedish person verification — TIC/Authway + document-backed financial
- Spanish person verification — Verifik (DNI/NIE) + identity/owner/tenant/guarantor
- Nota Simple ownership workflow — upload or intermediary + match logic + reviewer queue
- NRA manual entry module with pending_automation connector scaffold
- Document upload, secure storage, signed URL access
- Verification case workflow (multi-party)
- Internal reviewer queue
- GDPR baseline: minimization, retention policy, DSAR intake, audit log
- Security baseline: RLS everywhere, private storage, Vault, audit
- Modular/plugin-ready architecture
- Provider abstraction layer (enables post-MVP Signicat migration)

### Deferred from MVP

- Signicat integration
- CORPME B2B API for NRA automation (pending access)
- Direct Nota Simple API
- Direct credit bureau API
- MCP adapter layer
- Partner/white-label API
- Additional regional connectors beyond GVA
- ML-based scoring

---

## 16. Phased Roadmap

| Phase | Focus |
|-------|-------|
| 1 | Foundation — Supabase, auth, orgs, RLS, i18n EN/SV/ES, core schema, GDPR model, security baseline, connector + provider interface contracts |
| 2 | Property Trust Layer — GVA CSV connector, ingestion, snapshot diff, property lookup, compliance profile, SForms fallback |
| 3 | Person Trust Layer — TIC/Authway (SE), Verifik (ES), Nota Simple ownership workflow, NRA manual module + connector scaffold, document upload, trust profile, reviewer queue |
| 4 | Relationship and Case Workflows — verification case, multi-party, ownership/authority, case summary, per-party notifications, full review flow |
| 5 | Extensibility — Signicat migration, CORPME NRA API (when confirmed), additional regions, MCP adapters, partner API |

---

## 17. Open Questions

| # | Question | Blocker? | Priority |
|---|----------|----------|----------|
| 1 | NRA official B2B API — has CORPME been contacted? | Yes for NRA automation | High |
| 2 | Does Nota Simple intermediary also cover NRA status lookup? | Partially | High |
| 3 | Nota Simple intermediary selection — RegistroPortal, Tinsa, other? | Yes for ownership MVP | High |
| 4 | TIC vs Authway — which as primary SE provider? | Yes for SE module | High |
| 5 | Verifik pricing and contract terms | Yes for ES module | High |
| 6 | Signicat migration timeline post-MVP | No | Medium |
| 7 | GDPR legal basis formal legal review before launch | Yes for launch | High |
| 8 | Swedish credit check provider | No (document-backed MVP) | Medium |
| 9 | Multi-region rollout priority after GVA | No | Medium |
| 10 | B2B onboarding — self-serve or assisted? | No | Medium |
| 11 | Frontend framework — Next.js + next-intl confirmed? | Yes Phase 1 | Medium |
| 12 | Translation workflow — who owns translation keys? | Yes Phase 1 | Medium |
| 13 | White-label API format and auth model | No | Low |

---

*Trust Platform PRD v0.4 — optimized for vibe coding foundation*
