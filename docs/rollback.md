# ASHA Saathi (आशा साथी) — Production Rollback & Recovery Guide

> **Phase 11 Disaster Recovery & Rollback Runbook**  
> **Target Release**: Release Candidate 1 (RC-1)

---

## 1. Frontend Rollback Strategy (Vercel)

### 1.1 Instant Rollback via Vercel Dashboard (Recommended)
Vercel keeps immutable preview and production deployments for every build:
1. Navigate to the **Vercel Dashboard** -> Your Project -> **Deployments**.
2. Locate the last known healthy deployment (e.g. the commit preceding the broken build).
3. Click the three dots (`...`) on that deployment card.
4. Select **"Promote to Production"** (or **"Rollback"**).
5. The edge CDN instantly routes production traffic to the previous deployment within seconds without rebuilding.

### 1.2 Git-Based Rollback
If deploying via automated Git push integration:
```bash
# 1. Identify previous stable commit
git log --oneline -n 5

# 2. Revert the problematic commit
git revert <bad-commit-hash> -m "revert: rollback broken production deployment"

# 3. Push to main branch to trigger Vercel re-build
git push origin main
```

---

## 2. Database Migration Rollback Strategy

> [!CAUTION]
> **Never Execute Blind Destructive Drops**: Before rolling back any table or column, verify whether live patient data exists. Dropping columns or tables with active records leads to permanent data loss.

### 2.1 Forward-Compatible Rollback Principles
All migrations in ASHA Saathi are designed to be additive (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). If a migration causes application errors:

1. **Analytical Views Rollback (`Phase 8`)**:
   If an analytical view (`v_visits_by_day`, `v_follow_up_summary`, etc.) contains an issue:
   ```sql
   DROP VIEW IF EXISTS public.v_visits_by_day CASCADE;
   DROP VIEW IF EXISTS public.v_follow_up_summary CASCADE;
   DROP VIEW IF EXISTS public.v_referral_summary CASCADE;
   DROP VIEW IF EXISTS public.v_medicine_order_summary CASCADE;
   DROP VIEW IF EXISTS public.v_stock_levels CASCADE;
   ```
   *Data Impact: Zero.* Base tables remain completely intact.

2. **Tasks & Notifications Rollback (`Phase 7`)**:
   If the `tasks` schema must be isolated:
   ```sql
   DROP TABLE IF EXISTS public.tasks CASCADE;
   DROP TYPE IF EXISTS task_status CASCADE;
   DROP TYPE IF EXISTS task_priority CASCADE;
   DROP TYPE IF EXISTS task_type CASCADE;
   ```
   *Data Impact: Deletes transient task reminders. Patient, visit, and medical records are preserved.*

3. **Maternal Care Rollback (`Phase 5`)**:
   If the `pregnancies` table requires reconstruction:
   ```sql
   -- Verify row count before dropping
   SELECT COUNT(*) FROM public.pregnancies;
   -- Only drop if safe:
   DROP TABLE IF EXISTS public.pregnancies CASCADE;
   ```

---

## 3. Demo Environment Emergency Reset

If judges, testers, or automated suites leave the database in an inconsistent state during a live presentation:

1. Open the Supabase **SQL Editor**.
2. Run [`supabase/seed/reset_demo_data.sql`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/supabase/seed/reset_demo_data.sql).
3. This atomic script:
   - Cleans all transient test records (`tasks`, `notifications`, `medicine_orders`, `referrals`, `follow_ups`, `visits`, `pregnancies`, `patients`, `households`).
   - Resets central depot medicine stock levels to exact baseline figures.
   - Re-applies the realistic synthetic demo records in under 3 seconds.

---

## 4. Client-Side (PWA) Storage Recovery

If a user device encounters corrupted IndexedDB records or stale schema versions:
1. In the application UI: Navigate to **Profile -> Sign Out**.
2. The sign-out handler automatically executes `clearLocalDatabase()`, purging all 13 Dexie.js stores.
3. On next login, fresh clean state is hydrated from Supabase cloud.
4. For complete device reset: Open Chrome DevTools -> **Application -> Storage -> Clear Site Data**.
