# Authority Verification Module

Verifies Power of Attorney, management mandates, and other delegation documents for representatives acting on behalf of property owners.

## Purpose
When a user participates in a verification case as a property manager or representative (not the direct owner), they must provide proof of their authority to act on behalf of the owner.

## Workflow
1. User selects "property_manager" role when joining a case
2. System prompts for authority document upload (Power of Attorney, management contract, etc.)
3. Document is securely stored with metadata in `person_documents`
4. Authority verification record created in `authority_verification` table
5. Admin reviewer examines the document and verifies:
   - Document authenticity
   - Scope of authority matches required actions
   - Validity period covers the verification timeframe
   - Principal (owner) and agent (representative) identities match
6. Upon approval, case party status updated to "verified"

## Database Schema
- `authority_verification`: Core tracking table
- Links to: `case_parties`, `person_documents`, `profiles`

## API Surface
- `AuthorityVerificationService`: CRUD operations and status management
- `AuthorityVerificationStep`: UI component for document upload and review