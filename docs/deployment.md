# ASHA Saathi (आशा साथी) — Production Deployment Guide

> **Phase 11 Deployment Specification**  
> **Platform**: React + Vite + Tailwind CSS + PWA (Workbox)  
> **Target Hosting**: Vercel (recommended) / Netlify / Cloudflare Pages  
> **Backend & Auth**: Supabase Managed PostgreSQL with Row Level Security  
> **Target Release**: Release Candidate 1 (RC-1)

---

## 1. Architecture Overview

ASHA Saathi is built as a static Progressive Web Application (SPA/PWA) communicating directly with Supabase via PostgREST and GoTrue Auth over HTTPS. No custom node/express backend is required.

```
┌────────────────────────────────────────────────────────┐
│                   Vercel CDN Edge                      │
│   (index.html, registerSW.js, manifest, assets/*.js)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS (TLS 1.3)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Client Device (Browser / PWA)            │
│   - Dexie.js (13 IndexedDB Stores)                     │
│   - Background Sync Engine                             │
│   - Service Worker (App Shell Cache)                   │
└───────────────────────────┬────────────────────────────┘
                            │ Authenticated JWT (REST / RPC)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Supabase Cloud (ap-southeast-1)            │
│   - GoTrue Auth (Session tokens & Cookies)             │
│   - PostgreSQL 17 + 14 RLS Protected Tables           │
│   - Audit Trail Engine (audit_logs)                    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Required Environment Variables

All variables used by the client are prefixed with `VITE_` per Vite conventions.

| Variable Name | Client Safe? | Purpose | Deployment Location | Example / Format |
|---|:---:|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Target Supabase endpoint | Vercel Environment Variables | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anonymous API key | Vercel Environment Variables | `eyJhbGciOiJIUzI1Ni...` |

> [!IMPORTANT]
> **No Service Role Keys in Frontend**: Under no circumstances should `SUPABASE_SERVICE_ROLE_KEY` be added to Vercel or frontend `.env` files. Client authorization is governed entirely by user JWTs evaluated against PostgreSQL Row Level Security (RLS) policies.

---

## 3. Frontend Deployment (Vercel)

### 3.1 Vercel Project Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (runs `tsc && vite build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `18.x` or `20.x`

### 3.2 Vercel Configuration (`vercel.json`)
The project includes a production-tuned [`vercel.json`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/vercel.json):
1. **SPA Rewrites**: Redirects all path requests to `/index.html`.
2. **Service Worker Cache-Control**: Serves `/sw.js` and `/registerSW.js` with `max-age=0, must-revalidate` so updates deploy instantaneously to client devices.
3. **Asset Immutability**: Hashes in `/assets/*` cached with `max-age=31536000, immutable`.
4. **Security Headers**: Injects `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.

### 3.3 Deploy via Vercel CLI (or Git Integration)
```bash
# Option A: Deploy via GitHub / GitLab integration
# Simply push branch 'main' to your connected remote repository.

# Option B: Deploy via Vercel CLI
npx vercel --prod
```

---

## 4. Supabase Production Database Configuration

### 4.1 Migration Order
Database migrations must be applied sequentially:
1. `supabase/migrations/20260927000000_phase1_foundation.sql`
   - Core tables, RLS policies, `get_current_role()`, trigger `handle_new_user`.
2. `supabase/migrations/20260927120000_phase5_maternal_child.sql`
   - `pregnancies` table, ANC indexes, and maternal RLS policies.
3. `supabase/migrations/20260928000000_phase7_tasks_notifications.sql`
   - `tasks` table, notification deep-linking, priority enums, and procedures.
4. `supabase/migrations/20260928010000_phase8_reporting_indexes.sql`
   - 11 B-tree performance indexes and 5 analytical reporting SQL views.

### 4.2 Applying Migrations via Supabase CLI or SQL Editor
```bash
# If using Supabase CLI:
supabase db push

# If using Supabase Web Dashboard:
# Open Database -> SQL Editor, copy and execute each file in numbered order.
```

### 4.3 Supabase Authentication URL Configuration
In the Supabase Dashboard under **Authentication -> URL Configuration**:
- **Site URL**: `https://<your-deployed-domain>.vercel.app`
- **Redirect URLs**:
  - `https://<your-deployed-domain>.vercel.app/**`
  - `http://localhost:3000/**` (for local development fallback)

---

## 5. Synthetic Demo Data Seeding

To seed the initial hackathon demo state:
1. Open the Supabase **SQL Editor**.
2. Run [`supabase/seed/seed_production_demo.sql`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/supabase/seed/seed_production_demo.sql).
3. This creates:
   - 3 Verified Demo Accounts (ASHA, Supervisor, Manager) with pre-confirmed emails.
   - 3 Synthetic Households in Rampur Village.
   - 4 Synthetic Patients (including pregnant woman and child under 5).
   - 1 Active 18-week pregnancy record with calculated EDD.
   - 3 Follow-ups (1 pending, 1 overdue, 1 completed).
   - 1 Active PHC referral.
   - 6 Medicines with simulated Central PHC low-stock warnings.
   - 3 Supply-chain requests (1 pending review, 1 approved, 1 fulfilled).
   - 3 Actionable daily tasks.

---

## 6. PWA Production Behavior & Cache Invalidation

- **Registration Mode**: `autoUpdate` configured in `vite.config.ts`.
- **Precached Assets**: HTML, JS, CSS, icons, and fonts precached on first boot.
- **Data Isolation**: IndexedDB stores live data. The Service Worker **explicitly excludes** `/rest/v1/*` and `/auth/v1/*` from Workbox runtime caching to prevent stale healthcare state.
- **Offline Shell**: If internet is cut, the application shell loads from cache, connects to Dexie.js, and renders the offline banner.

---

## 7. Known Deployment Limitations & Operational Constraints

1. **Browser Cookie Policies**: Safari iOS enforces strict 7-day ITP on client-side storage if not installed to the Home Screen. Users should be encouraged to "Add to Home Screen" for durable persistence.
2. **Push Notifications**: Web Push requires an active VAPID key pair; in-app notification center is currently used for immediate offline/online notifications.
3. **Demo Scope**: Production demo data is purely synthetic. Do not enter real patient names or Indian National Identification (Aadhaar) numbers.
