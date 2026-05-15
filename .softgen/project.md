---
created_at: 2026-05-15
created_by: softgen
---
## Vision
A cross-border rental verification SaaS for Spain, bridging Swedish and Spanish users. The platform establishes trust by verifying the property's legitimacy, the person's identity and financial credibility, and their registered connection to the property.

## Design
- **Direction**: Scandinavian minimalism meets European institutional trust. High legibility, strict restraint, data-first.
- `--primary`: 222 47% 11% (Deep Navy)
- `--background`: 0 0% 100% (Crisp White)
- `--foreground`: 222 47% 11% (Slate Dark)
- `--muted`: 210 40% 96% (Soft Blue-Grey)
- `--accent`: 152 69% 31% (Trust Emerald)
- **Fonts**: Headings in IBM Plex Sans (institutional, clear), Body in IBM Plex Sans, Data/IDs in IBM Plex Mono (for tabular numbers).
- **Style**: Sharp borders, minimal elevation, generous whitespace. Restrained functional colors. Data screens use `tabular-nums` for identifiers.

## Features
- Supabase persistence for all domain entities (Users, Properties, Cases, Verifications).
- Property lookup and compliance profiling (regional licenses).
- Multi-lingual interface from day one (English, Swedish, Spanish).
- Swedish and Spanish identity/document verification workflows.
- B2B case management for multi-party verifications.
- Ownership verification (Nota Simple) workflow.
- Internal reviewer queue for manual trust profile approvals.