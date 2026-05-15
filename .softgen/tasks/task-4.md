---
title: Spanish User Verification Flow
status: todo
priority: high
type: feature
tags: [verification, spanish, identity]
position: 4
---

## Notes
Create the verification wizard for Spanish users. This flow includes DNI/NIE validation steps and branches based on the user's role (owner, tenant, guarantor), requiring different evidence for each.

## Checklist
- [ ] Build a multi-step verification wizard tailored to Spanish users.
- [ ] Step 1: Identity evidence upload (simulating Verifik API for DNI/NIE/passport data capture).
- [ ] Step 2: Role selection (Owner/Host, Tenant, Guarantor) which dynamically alters the next steps.
- [ ] Step 3: Conditional document upload area (e.g., work contracts/bank statements for tenants; avalista docs for guarantors).
- [ ] Step 4: Display the generated Spanish Trust Profile Summary.

## Acceptance
- The wizard successfully branches requirements based on the user's selected role.
- The user can simulate uploading a DNI and relevant role-based documents.
- The flow supports Spanish localization seamlessly.