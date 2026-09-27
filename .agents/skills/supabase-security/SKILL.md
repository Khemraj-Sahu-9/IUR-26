---
name: supabase-security
description: Security engineering rules for Supabase, Row Level Security (RLS), RBAC, and data privacy.
---

# Supabase Security & Healthcare Data Protection

## Purpose
Enforce robust security controls, Row Level Security (RLS) policies, and defense-in-depth data handling for healthcare workflows on Supabase.

## When to Use
Use when writing SQL migrations, database functions, RLS policies, client API queries, and auth configuration.

## Mandatory Security Principles
1. **Never Expose Service Role Keys**:
   - Only the public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY`) is ever permitted in client bundles.
   - The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must NEVER exist in client-side code.
2. **Universal RLS Enforcement**:
   - Every single table created in the `public` schema MUST have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
   - Never leave tables with default open access.
3. **Role-Based Access Control (RBAC)**:
   - Assign roles in a custom enum or `users` table: `'asha_worker'`, `'supervisor'`, `'manager'`.
   - Helper function `auth.jwt() ->> 'role'` or a secure helper function `get_user_role(auth.uid())` evaluated in RLS policies.
4. **Data Isolation Boundaries**:
   - `asha_worker`: Can only SELECT/INSERT/UPDATE patient, household, visit records where `assigned_asha_id = auth.uid()`.
   - `supervisor`: Can SELECT records belonging to ASHAs in their assigned jurisdiction/cluster; can UPDATE medicine orders (approve/reject).
   - `manager`: Can manage inventories, all medicine orders, and view aggregated reports across PHC sectors.
5. **No Medical Diagnosis Storage**:
   - System records observations, checklists, screening questions, and delivery dates. It does not generate automated diagnostic conclusions.
6. **Audit Trails**:
   - Sensitive modifications (approvals, role changes, patient edits) log to an immutable `audit_logs` table.

## Quality Checklist
- [ ] Every migration file explicitly enables RLS on newly created tables.
- [ ] Policies restrict cross-tenant / cross-ASHA data leakage.
- [ ] No secret or service keys bundled into client code.
- [ ] Input validation applied on client before DB submission.
