---
name: automated-testing
description: Playwright E2E and unit testing standards for role authentication, offline transitions, and core healthcare workflows.
---

# Automated Testing Strategy (Playwright & Vitest)

## Purpose
Ensure rock-solid reliability of the ASHA platform across network transitions, mobile viewports, and role authorizations.

## When to Use
Use when writing, executing, or debugging tests for UI flows, sync mechanisms, role permissions, and edge cases.

## Mandatory Test Suites
1. **Authentication & RBAC**:
   - Verify ASHA worker login and redirection to field dashboard.
   - Verify Supervisor login and authorization to review/approve requests.
   - Verify Manager login and inventory access.
   - Verify unauthenticated users are blocked from protected routes.
2. **Mobile Viewport Emulation**:
   - Default test viewport: `375px x 667px` (iPhone SE) and `390px x 844px` (Pixel 7 / iPhone 14).
   - Ensure no horizontal scrolling and all buttons remain within thumb zones.
3. **Core Field Workflows**:
   - Registration: Create household -> Create patient linked to household.
   - Clinical Record: Record ANC/PNC visit -> Mark follow-up date.
   - Commodity: Submit medicine kit refill request -> Verify status is 'Pending'.
4. **Offline Resilience Testing**:
   - Simulate offline via `page.context().setOffline(true)`.
   - Perform actions (e.g. register patient, add visit).
   - Verify UI displays "Pending Sync" and data remains accessible in IndexedDB.
   - Re-enable network via `page.context().setOffline(false)`.
   - Verify sync queue flushes and badge updates to "Synced".
5. **No Broken Selectors**:
   - Prefer user-visible roles and test-IDs: `page.getByRole()`, `page.getByLabel()`, `page.getByTestId()`.

## Quality Checklist
- [ ] Tests execute cleanly in headless CI/CD mode.
- [ ] Mobile responsive layout verified at 375px width.
- [ ] Offline-to-online transition test passes deterministically.
