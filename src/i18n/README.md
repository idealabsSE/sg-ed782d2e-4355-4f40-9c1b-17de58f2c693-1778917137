# Internationalization Module

## Purpose
Multi-language support (English, Swedish, Spanish).

## Public Interface
- **LocaleContext**: React context for language state
- **useTranslation**: Hook for accessing translations
- **i18n**: Translation dictionaries

## Dependencies
- sharedkernel

## Usage
```typescript
import { useTranslation } from "@/i18n/useTranslation"
const { t } = useTranslation()
```