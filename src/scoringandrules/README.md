# Scoring and Rules Module

## Purpose
Trust score calculation and rule engine for verification decisions.

## Public Interface
- **ScoringEngine**: Calculate trust scores
- **RulesEngine**: Evaluate verification rules
- **ScoringTypes**: TypeScript types for scoring entities

## Dependencies
- sharedkernel
- properties
- swedishpersonverification
- spanishpersonverification
- ownershipverification

## Usage
```typescript
import { scoringEngine } from "@/scoringandrules/ScoringEngine"
```