---
title: Extensibility - Regional Connector Template
status: todo
priority: low
type: feature
tags: [connectors, extensibility, phase-5]
created_by: softgen
created_at: 2026-05-17
position: 28
---

## Notes
Address Step 5.2 of the extensibility plan by creating a scaffold/template for future regional data sources (e.g., Andalucía) to prove the modular architecture works.

## Checklist
- [ ] Create a generic `src/connectors/template/` folder with placeholder implementations of the `DataConnector` interface
- [ ] Document the steps required to add a new region (fetching, normalization mapping, resolving identifiers)
- [ ] Ensure the core ingestion Edge Function can dynamically load or iterate over multiple registered connectors without modifying its core logic

## Acceptance
- The codebase contains a clear, documented template for adding new property data sources.
- The ingestion architecture supports a plug-and-play model for multiple regional databases.