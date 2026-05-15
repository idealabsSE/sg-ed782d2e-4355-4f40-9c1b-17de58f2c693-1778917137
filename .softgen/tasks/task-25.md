---
title: Route Protection and Navigation Update
status: todo
priority: high
type: feature
tags: [auth, routing, navigation]
position: 25
---

## Notes
Features should only be accessible to logged-in users. The public landing page can remain accessible, but all functional areas need to be guarded. The top navigation should also reflect the user's authentication status.

## Checklist
- [ ] Route guard mechanism that intercepts unauthenticated users and redirects them to the login page
- [ ] Apply the protection to all feature areas: Verification workflows, Case management, and Admin sections
- [ ] Update the main navigation bar to display "Log in" and "Register" options for guest visitors
- [ ] Update the main navigation bar to show the logged-in user's email address and a "Sign out" button for authenticated users

## Acceptance
- Navigating directly to a protected feature URL while logged out forces a redirect to the login page.
- The top navigation correctly displays user controls based on whether someone is logged in or a guest.
- Clicking "Sign out" successfully ends the session and returns the user to a public page.