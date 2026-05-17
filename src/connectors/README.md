# Connectors Module

## Purpose
Abstract interface for external data sources (GVA, Catastro, etc.).

## Public Interface
- **DataConnector**: Base interface for all connectors
- **GvaConnector**: GVA regional license connector
- **CatastroConnector**: Spanish cadastral connector

## Dependencies
- sharedkernel

## Usage
```typescript
import type { DataConnector } from "@/connectors/interface/DataConnector"
```