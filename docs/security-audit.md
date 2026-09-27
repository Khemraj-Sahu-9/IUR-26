# Security Audit & Hardening Report — ASHA Saathi

**Platform Version:** Phase 9 Production Hardening  
**Target Environment:** Accredited Social Health Activist (ASHA) Field Operations (India NHM)  
**Classification:** Confidential Medical Data / Healthcare Information  

---

## 1. Executive Summary

ASHA Saathi is designed for rural and semi-urban community health workers operating in varied network environments. Under Phase 9, a comprehensive security, privacy, and production hardening audit was performed across all application tiers:
- **Authentication & RBAC:** Multi-tenant role separation between ASHA Workers, Supervisors (ANM/MOIC), and PHC Facility Managers.
- **Database & Row-Level Security (RLS):** 100% of PostgreSQL tables enforce strict RLS policies.
- **Offline Data Storage & IndexedDB Isolation:** Local storage sanitization on logout to prevent credential or patient record retention on shared hardware.
- **Client Bundling & Secret Management:** Verification that no privileged keys (`service_role` secrets or private certificates) are bundled or exposed.

---

## 2. Threat Model & Key Attack Vectors Evaluated

| Threat Vector | Mitigation Strategy | Status |
| :--- | :--- | :--- |
| **Unauthorized Data Access via Client Key** | Supabase anonymous public key is restricted by PostgreSQL Row Level Security (RLS) on every table and view. | Verified |
| **Privilege Escalation (ASHA -> Supervisor / Manager)** | PostgreSQL RLS checks `auth.uid()` against `profiles.role` using `SECURITY DEFINER` helper functions; frontend navigation guards enforce role gates. | Verified |
| **Shared Device Data Leakage** | Complete IndexedDB (`asha_offline_db`) cache purge and session destruction on user logout and auth state invalidation. | Hardened & Tested |
| **Offline Sync Forgery & Duplicate Mutations** | Client mutation queues generate deterministic UUIDs and track synchronization status (`pending`, `synced`, `failed`). Sync processing handles idempotent upserts. | Verified |
| **SQL Injection & Direct Schema Tampering** | Parameterized queries via Supabase PostgREST client and typed schemas; raw string concatenation prohibited. | Verified |

---

## 3. Database Security & Row Level Security (RLS) Matrix

All database tables have `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` actively applied.

| Table Name | RLS Enabled | Policies Applied | Access Rules |
| :--- | :---: | :--- | :--- |
| `profiles` | Yes | `profiles_select_policy`<br>`profiles_update_self` | Users can view active profiles within their jurisdiction; users can only modify their own name and contact fields. |
| `asha_workers` | Yes | `asha_select_policy`<br>`asha_supervisor_policy` | ASHA workers see their own record; supervisors/managers view assigned field workers. |
| `households` | Yes | `households_asha_policy`<br>`households_supervisor_policy` | ASHAs view/create/edit households in their assigned village/ward. Supervisors have read-only audit access. |
| `patients` | Yes | `patients_asha_policy`<br>`patients_supervisor_policy` | Full CRUD for assigned ASHA; read-only oversight for supervisors and PHC medical officers. |
| `visits` | Yes | `visits_asha_policy`<br>`visits_supervisor_policy` | ASHAs record home visits; supervisors review clinical history and follow-up flags. |
| `follow_ups` | Yes | `followups_asha_policy`<br>`followups_supervisor_policy` | CRUD for assigned ASHA; supervisors monitor overdue and completed tasks. |
| `referrals` | Yes | `referrals_asha_policy`<br>`referrals_supervisor_policy` | Created by ASHA; facility managers and supervisors can review and update triage status. |
| `medicines` | Yes | `medicines_read_all`<br>`medicines_manager_policy` | Public read access for standard medicine catalog; write operations restricted to PHC Managers. |
| `medicine_stock` | Yes | `stock_asha_view`<br>`stock_manager_policy` | ASHAs view their own drug bag inventory; PHC managers update central inventory levels. |
| `medicine_orders` | Yes | `orders_asha_policy`<br>`orders_supervisor_policy` | ASHAs submit drug kit requisitions; supervisors/managers approve or reject orders. |
| `notifications` | Yes | `notifications_recipient_policy` | Users only receive and update notifications addressed to their specific user ID or role broadcast. |
| `pregnancies` | Yes | `pregnancies_asha_policy`<br>`pregnancies_supervisor_policy` | Assigned ASHA tracks gestational progress and high-risk flags; supervisors monitor sectoral ANC rates. |
| `tasks` | Yes | `tasks_assigned_policy`<br>`tasks_supervisor_policy` | Assigned ASHA tracks daily action items; supervisors review task completion rates. |
| `audit_logs` | Yes | `audit_logs_insert_all`<br>`audit_logs_manager_select` | Append-only logging for sensitive operations; read-only access restricted to PHC managers. |

### Database Views Security
Reporting views created in Phase 8 (`asha_performance_metrics`, `sector_analytics`, `maternal_child_stats`, `medicine_consumption_monthly`) were declared with `security_invoker = true`. This guarantees that queries against the analytical views execute with the querying user's permissions, preserving all underlying RLS constraints.

---

## 4. Offline Storage & Multi-User Device Sanitization

In rural healthcare settings, mobile tablets or phones are frequently shared between ASHA workers across shifts or reassigned during equipment maintenance.

### Hardened Logout Lifecycle
In `src/hooks/useAuth.tsx`, the sign-out pipeline was hardened to guarantee complete local storage zeroing before and after session termination:
1. `offlineStorage.clearAllData()` deletes all local IndexedDB records (`households`, `patients`, `visits`, `followups`, `referrals`, `medicines`, `stock`, `orders`, `pregnancies`, `tasks`, and sync metadata).
2. `supabase.auth.signOut()` revokes the remote session tokens.
3. On `SIGNED_OUT` auth state change broadcast, a secondary cache wipe is triggered to prevent race conditions during ungraceful terminations.
4. E2E verification test `tests/offline_sync.spec.ts` ("should clear local cached data on user logout to enforce tenant security") asserts that zero patient or household records remain in IndexedDB after sign out.

---

## 5. Secret Key & Environment Variable Audit

- **VITE_SUPABASE_ANON_KEY:** Analyzed and confirmed to be the standard public client key. This key is safe for client exposure because all data operations are mediated by PostgreSQL RLS.
- **Service Role Key:** Audited repository source code and git history. No `supabase_admin` or `service_role` secret keys exist in the repository or compiled Vite client bundles.
- **Future Production Recommendation:** For hosted deployments, replace `.env` fallback defaults with runtime environment injection via Kubernetes secrets or hosting environment variables (e.g. Cloudflare / Vercel secrets).

---

## 6. Action Form Hardening (Double-Submission & Idempotency)

All clinical and transactional mutation forms implement submission locking:
- `saving` state disables primary submit buttons and displays active loading spinners (`disabled={saving || success}`).
- Network sync queue checks for existing idempotency tokens (`client_id` UUID) before inserting remote rows, preventing duplicate records on intermittent network handshakes.
