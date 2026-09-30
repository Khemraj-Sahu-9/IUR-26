# ASHA Saathi | आशा साथी

**An offline-first digital platform for ASHA workers to manage patient records, field visits, follow-ups, referrals, medicine requests, and supervisory workflows.**

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2017-3ecf8e?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Offline--First-5a0fc8?logo=pwa&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E%20Tests-2ead33?logo=playwright&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite&logoColor=white)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

---

## Overview

**ASHA Saathi** is a mobile-first Progressive Web App built for India's frontline community health workers — Accredited Social Health Activists (ASHAs) — who operate in rural and semi-urban areas under the National Health Mission (NHM).

The platform digitalizes field workflows that were previously paper-based: household census, patient registration, home visits, antenatal/postnatal care tracking, immunizations, referrals to PHC/hospitals, medicine requisitions, and operational reporting. The system supports three roles — ASHA worker, Sector Supervisor, and PHC Manager — each with a dedicated portal and appropriate data access permissions enforced by Row Level Security (RLS) at the database layer.

A key design principle is **offline-first**: the entire field workflow functions without internet connectivity. Data is persisted locally in IndexedDB and synchronized automatically when connectivity is restored.

---

## Problem

- ASHA workers maintain paper registers for households, patient visits, pregnancies, immunizations, and medicines — records that are difficult to aggregate, audit, or act on.
- Supervisors have limited real-time visibility into field activities, referral status, and follow-up completion.
- Medicine requisition workflows between field workers, supervisors, and PHC pharmacists are fragmented and slow.
- Rural field environments frequently have no reliable mobile internet connectivity, making real-time data entry infeasible without offline support.
- Follow-ups and antenatal care reminders are missed when records are manual and untracked.

---

## Solution

ASHA Saathi provides:

- Digital household and patient registration with unique auto-generated codes.
- Home visit recording across multiple visit types (ANC, PNC, immunization, general checkup, communicable disease, maternal checkup, child growth monitoring).
- Automated follow-up scheduling linked to visits, with overdue detection.
- Referral creation and status tracking (referred → visited → admitted → discharged → cancelled).
- Pregnancy tracking (LMP, EDD via Naegele's rule, gestational age, gravida/para, ANC history).
- Child health tracking for patients under 5 years (immunization visits, growth monitoring).
- A three-tier medicine workflow: ASHA requests → Supervisor approves → Manager fulfills with stock management.
- Sector-level supervision dashboards with live aggregation across all assigned ASHA workers.
- PHC administration with central medicine inventory management.
- Operational reports with date-range filters and CSV export for all three roles.
- Full offline operation for field data entry, backed by automatic background synchronization.
- Bilingual interface (English / हिन्दी) switchable at runtime.

---

## Key Features

| Feature | Description | Status |
|---|---|---|
| Household Management | Register families, search by name/village/code | Implemented |
| Patient Registration | Register patients linked to households with demographics | Implemented |
| Patient Profiles | Clinical hub with visits, follow-ups, referrals, maternal & child sections | Implemented |
| Home Visit Recording | 7 visit types, clinical notes, optional auto-scheduled follow-up | Implemented |
| Follow-up Tracking | Today / Upcoming / Overdue / Completed tabs, one-tap mark-done | Implemented |
| Referral Workflow | Create referrals to sub-centre/PHC/CHC/district hospital, track status | Implemented |
| Pregnancy Tracking | LMP, EDD (Naegele's rule), live gestational age, gravida/para, ANC visits | Implemented |
| Child Health Tracking | Growth visits, immunization records for patients <5 years | Implemented |
| Medicine Requests | ASHA submits refill requests from medicine catalog | Implemented |
| Supervisor Medicine Approval | Approve/reject requests with quantity and reason | Implemented |
| Manager Stock Management | View and adjust central PHC inventory with minimum quantity thresholds | Implemented |
| Task Management | Unified task queue with overdue detection and priority flags | Implemented |
| Notifications | In-app notifications with deep-link routing to relevant module | Implemented |
| Offline-First PWA | Full field workflow without internet connectivity | Implemented |
| Background Sync | Automatic topological synchronization on reconnection | Implemented |
| ASHA Work Reports | Personal operational reports with sparklines, CSV export | Implemented |
| Supervisor Reports | Sector aggregate metrics, CSV export | Implemented |
| Manager Reports | Inventory status, requisition logs, field activity summary, CSV export | Implemented |
| Bilingual UI | English / हिन्दी runtime switching with localStorage persistence | Implemented |
| Audit Logging | 28 clinical and administrative action types logged to `audit_logs` table | Implemented |
| Supabase RLS | Row Level Security policies on all tables — data isolation by role and assignment | Implemented |
| E2E Test Suite | 77 Playwright tests across 8 test files covering all major workflows | Implemented |
| ABHA / eHealth integration | Integration with national health identity infrastructure | Planned |
| Push Notifications | Native OS push notifications | Planned |
| Voice-based data entry | Voice input for low-literacy field workers | Planned |
| SMS OTP login | SMS-based authentication for workers without email | Planned |

---

## User Roles

### ASHA Worker (Field Worker Portal)
Mobile-first bottom navigation with 5 tabs: Home, Households, Patients, Tasks, Profile.

- Register and manage households
- Register, edit, and view patient profiles
- Record home visits across 7 visit types
- Schedule and complete follow-ups
- Create referrals to health facilities
- Track active pregnancies with gestational age
- Track child growth and immunizations
- Submit medicine refill requests to PHC
- View personal work reports and sync status
- Full offline data entry with automatic sync

### Supervisor (Sector Supervision Portal)
Tab navigation: Overview · Monitoring · Maternal · Medicines · Reports.

- Sector-level overview (active ASHAs, weekly visits, pending follow-ups, open referrals)
- Activity monitoring: recent field visits and open hospital referrals
- Active pregnancy monitoring with LMP, EDD, and gestational age
- Approve or reject ASHA medicine requests
- Sector aggregate reports with CSV export

### PHC Manager (Administration Portal)
Tab navigation: Overview · Requisitions · Manage Stock · Reports.

- Overview of pending requests, low-stock alerts, out-of-stock items
- Medicine requisition queue management
- Central medicine inventory with inline quantity and threshold editing
- Inventory status report, requisition logs, and field activity summary with CSV export

---

## Offline-First Architecture

ASHA Saathi uses a client-first data architecture. All data operations attempt Supabase first online, then fall back to IndexedDB. Writes are committed to IndexedDB immediately and queued for server upload.

```
┌────────────────────────────────────────────┐
│              ASHA Saathi PWA               │
│        (React + Vite + Service Worker)     │
└──────────────────┬─────────────────────────┘
                   │
           Application Layer
           (dataService.ts)
                   │
       ┌───────────┴───────────┐
       │                       │
  ONLINE PATH             OFFLINE PATH
       │                       │
       ▼                       ▼
  Supabase API            IndexedDB
  (PostgreSQL)           (Dexie.js)
       │                       │
       │               Sync Queue (13 stores)
       │                       │
       └───────────┬───────────┘
                   │
       Background Sync Engine
          (syncManager.ts)
                   │
         Topological ordering:
         households → patients →
         pregnancies → visits →
         follow_ups → referrals →
         medicine_orders
                   │
                   ▼
           PostgreSQL + RLS
```

**Key mechanisms:**
- **IndexedDB via Dexie.js** — 13 local stores mirror server tables. All data survives app restarts.
- **Sync Queue** — Every offline write is added to `sync_queue` with a unique UUID and optional `depends_on_entity_id` to maintain referential integrity during upload.
- **Connectivity Service** — HTTP HEAD probe to Supabase endpoint (not just `navigator.onLine`) with 5-second timeout and 2-second debounce. Triggers automatic sync on reconnection.
- **Topological ordering** — Operations are processed in dependency order so child records are never uploaded before their parent exists on the server.
- **Idempotent upserts** — `onConflict: 'id'` ensures retried uploads do not create duplicates.
- **Retry with backoff** — Failed operations are retained in the queue and retried up to 5 times.
- **Cache refresh on login** — `offlineDataService.refreshLocalCache()` performs a parallel fetch from Supabase and merges with `safeMerge` to protect locally-modified records.
- **Data isolation on logout** — `clearLocalDatabase()` wipes all local stores on sign-out, preventing cross-account data leakage.

---

## Demo Workflow

```
1. Login Screen (1-tap demo personas — ASHA / Supervisor / Manager)
       ↓
2. ASHA Dashboard (live KPIs: visits, follow-ups, medicine refills, maternal count)
       ↓
3. Households → Family Members
       ↓
4. Patient Profile (visits, follow-ups, referrals, pregnancy, child tracking)
       ↓
5. Record Home Visit (type, date, clinical notes, auto-schedule follow-up)
       ↓
6. Follow-up Queue (Today / Upcoming / Overdue / Completed)
       ↓
7. Create Referral (facility, reason, status tracking)
       ↓
8. Submit Medicine Request
       ↓
9. Supervisor Portal: Approve medicine request / review maternal pregnancies
       ↓
10. Manager Portal: Manage stock, view requisition queue
       ↓
11. [Network Off] ASHA records an offline visit → SyncStatusBar shows "Offline"
       ↓
12. [Network On] Auto-sync → SyncStatusBar shows "Syncing…" → "All changes synced"
       ↓
13. ASHA Work Report → CSV export
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI component framework |
| TypeScript | 5.7 | Type-safe development |
| Vite | 5.4 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Lucide React | 0.475 | Icon library |
| vite-plugin-pwa + Workbox | 1.3 / 7.4 | Service worker and PWA manifest |

### Backend & Database
| Technology | Purpose |
|---|---|
| Supabase | Hosted PostgreSQL, Auth (JWT), REST API, Row Level Security |
| PostgreSQL 17 | Primary database |

### Offline
| Technology | Version | Purpose |
|---|---|---|
| Dexie.js | 4.4.6 | IndexedDB wrapper — 13 local stores |
| Workbox (via vite-plugin-pwa) | 7.4 | Service worker, app shell caching |

### Validation
| Technology | Version | Purpose |
|---|---|---|
| Zod | 3.24 | Schema validation for forms |

### Testing
| Technology | Version | Purpose |
|---|---|---|
| Playwright | 1.50 | End-to-end browser automation tests |

### Deployment
| Technology | Purpose |
|---|---|
| Vercel | Frontend hosting, CDN, custom headers, SPA rewrites |

---

## Architecture

```
Browser
  │
  ├─ React App (SPA — App.tsx routes by role)
  │     ├─ AshaShell       (15 ASHA views, bottom navigation)
  │     ├─ SupervisorShell (5-tab sector portal)
  │     └─ ManagerShell    (4-tab PHC administration portal)
  │
  ├─ Service Layer
  │     ├─ dataService.ts       — Online-first CRUD with Dexie fallback
  │     ├─ offlineDataService.ts— Local cache refresh on login, safeMerge
  │     ├─ syncManager.ts       — Background sync engine with topological ordering
  │     ├─ connectivityService.ts— HTTP probe, online/offline event bus
  │     ├─ reportService.ts     — Aggregation for ASHA, Supervisor, Manager
  │     ├─ auditLogger.ts       — Non-blocking audit event recorder (28 action types)
  │     └─ authService.ts       — Supabase Auth sign-in / sign-out
  │
  ├─ Local Storage
  │     └─ Dexie (IndexedDB) — 13 stores: profiles, households, patients,
  │           visits, follow_ups, referrals, medicines, medicine_stock,
  │           medicine_orders, notifications, pregnancies, sync_queue, sync_metadata
  │
  └─ Service Worker (Workbox)
        └─ App shell: NetworkFirst with 3s timeout, StaleWhileRevalidate
           Data: Intentionally NOT cached — handled by IndexedDB

Supabase (Cloud)
  ├─ PostgreSQL 17
  │     ├─ 13 tables with UUID primary keys
  │     ├─ RLS enforced on every table (26+ policies)
  │     └─ Audit triggers and helper functions
  └─ Supabase Auth
        └─ JWT-based sessions, role stored in `profiles` table
```

---

## Database Model

All tables use UUID primary keys. Row Level Security is enabled on every table.

| Table | Purpose |
|---|---|
| `profiles` | User profile linked to `auth.users` — stores `role`, `full_name`, `phone`, `preferred_language` |
| `asha_workers` | ASHA-specific metadata: employee ID, assigned supervisor, village, sub-centre, PHC |
| `households` | Household registry: code, head of family, address, village, ward, assigned ASHA |
| `patients` | Patient records: demographics, DOB, gender, phone, relationship to head, status |
| `visits` | Home visit records: date, type, clinical notes, follow-up flag |
| `follow_ups` | Scheduled follow-ups: due date, status (pending/completed/missed/cancelled), instructions |
| `referrals` | Patient referrals: destination facility, reason, status progression |
| `medicines` | PHC medicine catalog: name, unit, description |
| `medicine_stock` | Current inventory: quantity, minimum threshold, location |
| `medicine_orders` | Medicine requests: status (pending/approved/rejected/fulfilled/cancelled), quantities |
| `pregnancies` | Pregnancy records: LMP, EDD, gravida, para, status (active/completed/lost) |
| `tasks` | Workflow tasks: type, due date, priority, linked patient, source entity |
| `notifications` | In-app notifications: type, title, message, read status, deep-link routing |
| `audit_logs` | Immutable audit trail: action type, actor, entity, before/after values, timestamp |

**Key relationships:**
- Each `household` belongs to one ASHA (`assigned_asha_id → profiles.id`)
- Each `patient` belongs to one `household` and one ASHA
- `visits`, `follow_ups`, `referrals`, `pregnancies`, and `tasks` link to `patients`
- `medicine_orders` link ASHA requests to the `medicines` catalog and `medicine_stock`

**Migrations:**
- `20260927000000_phase1_foundation.sql` — Core schema, RLS policies, audit logging
- `20260927120000_phase5_maternal_child.sql` — Pregnancies table, maternal RLS
- `20260928000000_phase7_tasks_notifications.sql` — Tasks and notifications tables
- `20260928010000_phase8_reporting_indexes.sql` — Performance indexes for reporting queries

---

## Security

- **Supabase Auth** — JWT-based sessions. Tokens are stored in localStorage by the Supabase client.
- **Row Level Security (RLS)** — Enforced on every database table. An ASHA worker can only read/write records assigned to their profile ID. Supervisors access sector data. Managers access PHC-level data. RLS policies are enforced at the PostgreSQL layer — bypassing the application UI does not bypass authorization.
- **Role enforcement** — User role is read from the `profiles` table after authentication, never from JWT claims alone.
- **Audit logging** — 28 clinical and administrative action types recorded non-blocking to `audit_logs`. Supervisors and Managers can query audit history.
- **Input validation** — Forms use Zod schemas for client-side validation before any data is sent to Supabase or written to IndexedDB.
- **Environment variable separation** — Only the Supabase `anon` (public) key is included in the frontend bundle. Service role keys are never exposed to the client.
- **Security headers** — `vercel.json` configures `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, and `Permissions-Policy` on all routes.
- **IndexedDB isolation** — Local data is wiped on sign-out via `clearLocalDatabase()` to prevent cross-account data access on shared devices.

> **Important:** This is an MVP / hackathon system. It has not undergone formal security audit, penetration testing, or clinical compliance validation (e.g., DISHA, PDPB). It should not be deployed as a production clinical system without independent security review, privacy impact assessment, and compliance validation.

---

## Screenshots

> A screen-recorded demo video with synchronized narration is available at `presentation/asha_demo_video.mp4`.

Screenshots can be added after final UI capture.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- A [Supabase](https://supabase.com) project (free tier sufficient)

### Installation

```bash
git clone <repository-url>
cd asha-saathi
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Both values are available in your Supabase project dashboard under **Settings → API**.

> Never commit `.env` — it is listed in `.gitignore`. Only `.env.example` (with placeholder values) is committed.

---

## Database Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy your **Project URL** and **anon public key** into `.env`.
3. Apply the database migrations in order using the Supabase SQL editor or the Supabase CLI:

```bash
# Using Supabase CLI
supabase db push

# Or manually, execute in the Supabase SQL editor in this order:
supabase/migrations/20260927000000_phase1_foundation.sql
supabase/migrations/20260927120000_phase5_maternal_child.sql
supabase/migrations/20260928000000_phase7_tasks_notifications.sql
supabase/migrations/20260928010000_phase8_reporting_indexes.sql
```

4. **Seed demo users** (required for the 1-tap demo login buttons):

```sql
-- Run in Supabase SQL editor
-- Creates demo accounts: asha.demo@gmail.com, supervisor.demo@gmail.com, manager.demo@gmail.com
-- Password for all: Password123!
```

See `supabase/seed/seed_demo_users.sql` and `supabase/seed/seed_production_demo.sql` for full seed scripts.

5. Enable **Row Level Security** on all tables (the migration scripts do this automatically with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

---

## Running Locally

```bash
# Start the development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview the production build locally (required for Playwright tests)
npm run preview
```

---

## Testing

The project uses **Playwright** for end-to-end testing. Tests run against the production preview server on port 3000.

```bash
# Run all E2E tests
npm run test:e2e

# Run a specific test file
npx playwright test tests/offline_sync.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed
```

**Test coverage (77 test cases across 8 files):**

| File | Tests | Coverage Area |
|---|---|---|
| `auth_and_roles.spec.ts` | 9 | Authentication, role routing, session management |
| `language_switcher.spec.ts` | 13 | English/Hindi language switching across all views |
| `maternal_child.spec.ts` | 10 | Pregnancy tracking, child health workflows |
| `offline_sync.spec.ts` | 9 | Offline data entry, sync status indicators, reconnection |
| `phase10_qa_master.spec.ts` | 16 | Master workflow QA for all three roles |
| `phase7_tasks_notifications.spec.ts` | 7 | Tasks and notification management |
| `phase8_reports.spec.ts` | 6 | Report views and date range filters |
| `visits_and_referrals.spec.ts` | 7 | Visit recording, referral creation and status |

Tests use the pre-seeded demo accounts. Ensure the Supabase demo seed has been applied before running tests.

---

## PWA

ASHA Saathi is a Progressive Web App installable on Android and iOS from the browser.

**Installation:** Chrome/Edge on Android or Safari on iOS will prompt to "Add to Home Screen" when the install criteria are met (HTTPS, service worker, manifest).

**Offline support — what works without internet:**
- All registered households and patients (cached on login)
- Recording new home visits
- Scheduling follow-ups
- Creating referrals
- Submitting medicine requests
- Viewing medicines catalog
- Completing tasks and follow-ups
- Reading notifications already received

**Offline limitations:**
- New data created on the server by other users is not visible until a sync/refresh
- Pregnancy tracking uses a `localStorage` fallback in addition to IndexedDB when offline
- The Supervisor and Manager portals aggregate live data from Supabase and show cached data when offline

**Synchronization:**
1. On reconnection, `connectivityService` probes the Supabase endpoint with an HTTP HEAD request.
2. `syncManager` processes the local `sync_queue` in topological order (households → patients → pregnancies → visits → follow_ups → referrals → medicine_orders).
3. Each operation uses `upsert` with `onConflict: 'id'` for idempotency.
4. Failed operations are retained in the queue (max 5 retries).
5. The `SyncStatusBar` component reflects real-time sync state (Online / Offline / Syncing / N pending / Synced / Failed).

---

## Project Structure

```
/
├── src/
│   ├── App.tsx                     # Root router — routes by authenticated role
│   ├── main.tsx                    # Entry point
│   ├── components/
│   │   ├── common/                 # Alert, Badge, Button, Card, Input, LoadingSpinner,
│   │   │                           #   SyncStatusBar, OfflineBanner, LanguageSelector, etc.
│   │   ├── households/             # HouseholdCard
│   │   ├── navigation/             # BottomNav (ASHA 5-tab mobile nav)
│   │   ├── patients/               # PatientCard
│   │   └── reports/                # ReportFilters, ReportStatCard, StatusBarChart, VisitSparkline
│   ├── constants/
│   │   └── demo.ts                 # Demo persona credentials
│   ├── features/
│   │   ├── asha/                   # AshaDashboard, AshaShell (15 views)
│   │   ├── auth/                   # LoginView
│   │   ├── followups/              # FollowUpsListView, FollowUpsSection
│   │   ├── households/             # HouseholdsListView, AddHouseholdView, HouseholdDetailsView
│   │   ├── manager/                # ManagerShell (4 tabs)
│   │   ├── maternal/               # MaternalSection, ChildTrackingSection
│   │   ├── medicines/              # MedicineRequestView, SupervisorMedicineView, ManagerStockView
│   │   ├── notifications/          # NotificationsView
│   │   ├── patients/               # PatientsListView, AddPatientView, EditPatientView, PatientProfileView
│   │   ├── profile/                # AshaProfileView
│   │   ├── referrals/              # AddReferralView, ReferralsSection
│   │   ├── reports/                # AshaReportView, SupervisorReportView, ManagerReportView
│   │   ├── supervisor/             # SupervisorShell (5 tabs)
│   │   ├── tasks/                  # TasksListView
│   │   └── visits/                 # AddVisitView, VisitHistorySection
│   ├── hooks/
│   │   ├── useAuth.tsx             # Authentication state, signIn, signOut, signInAsDemo
│   │   ├── useConnectivity.ts      # Live online/offline state
│   │   ├── useLanguage.tsx         # Language context (en/hi)
│   │   └── useSyncState.ts         # Sync engine state for SyncStatusBar
│   ├── layouts/
│   │   └── AppLayout.tsx           # Header, SyncStatusBar wrapper, footer
│   ├── lib/
│   │   └── supabaseClient.ts       # Supabase client instance
│   ├── locales/
│   │   └── translations.ts         # English and Hindi string dictionaries
│   ├── services/
│   │   ├── auditLogger.ts          # Non-blocking audit event logging (28 action types)
│   │   ├── authService.ts          # Auth operations
│   │   ├── connectivityService.ts  # HTTP probe, online/offline event emitter
│   │   ├── dataService.ts          # Online-first CRUD with IndexedDB fallback
│   │   ├── offlineDataService.ts   # Cache refresh, safeMerge, domain repos
│   │   ├── offlineDatabase.ts      # Dexie DB definition (13 stores)
│   │   ├── reportService.ts        # Report aggregation for all 3 roles
│   │   └── syncManager.ts          # Background sync engine
│   ├── types/
│   │   └── database.ts             # TypeScript type definitions for all entities
│   └── utils/
│       ├── csvExport.ts            # 6 CSV export functions
│       ├── maternalChildUtils.ts   # Gestational age, EDD calculation utilities
│       └── validation.ts           # Zod schemas for form validation
│
├── supabase/
│   ├── migrations/                 # 4 SQL migration files
│   └── seed/                       # Demo user and data seed scripts
│
├── tests/                          # 8 Playwright E2E test files (77 test cases)
│
├── docs/                           # Technical report, narration scripts, video timeline
│
├── presentation/
│   ├── asha_demo_video.mp4         # Recorded demo walkthrough (1080p, with narration)
│   └── asha_demo_video.webm        # WebM format
│
├── .env.example                    # Environment variable template
├── vercel.json                     # Deployment config: rewrites, security headers, cache
├── vite.config.ts                  # Build config: PWA manifest, Workbox, path aliases
├── playwright.config.ts            # Test config: Mobile Chrome (Pixel 7) + Desktop Chrome
├── tailwind.config.js              # Design tokens: health green, urgency colors, touch targets
└── tsconfig.json                   # TypeScript configuration
```

---

## Data Flow

### Online (Connected)

```
User Input (React Form)
        ↓
Client-side Validation (Zod)
        ↓
dataService (writes to IndexedDB immediately)
        ↓
Supabase REST API
        ↓
PostgreSQL + RLS Authorization
        ↓
Response merged to local IndexedDB cache
        ↓
UI state updated
```

### Offline

```
User Input (React Form)
        ↓
Client-side Validation (Zod)
        ↓
IndexedDB (Dexie — immediate local write)
        ↓
SyncOperation added to sync_queue
        ↓
SyncStatusBar shows "N changes waiting to sync"
        ↓
[Connectivity returns — HTTP probe confirms]
        ↓
syncManager processes queue (topological order)
        ↓
Supabase upsert (onConflict: 'id' — idempotent)
        ↓
PostgreSQL + RLS
        ↓
SyncStatusBar shows "All changes synced"
```

---

## Reports

Each role has access to operational reports with configurable date ranges (Today / Last 7 Days / Last 30 Days / This Month / Custom):

**ASHA Work Report:**
- Home visits: total count, breakdown by visit type, daily sparkline
- Follow-ups: total, completed, overdue, pending
- Referrals: total, pending, visited, admitted
- Medicine requests: total, fulfilled, pending, rejected
- Tasks: total, completed, overdue, pending
- Sync status: pending operations, failed operations, last sync timestamp
- CSV exports: Visits, Follow-ups, Referrals, Medicine Orders (4 files)

**Supervisor Sector Report:**
- Field coverage: households, active patients, active pregnancies, total visits
- Visits by type (bar chart)
- Follow-up completion: total due, completed, overdue
- Referral and medicine request aggregates
- CSV export: Sector summary

**PHC Manager Report:**
- Inventory status: out-of-stock, low-stock, adequate (expandable full formulary)
- Medicine request log: total, fulfilled, pending, rejected (expandable table)
- Aggregate field activity: households, patients, visits, follow-ups, referrals, pregnancies
- CSV exports: Stock Inventory, Medicine Requests, Field Activity Summary (3 files)

---

## Limitations

- **MVP status** — Built as a hackathon project. Not suitable for production clinical deployment without independent security review, privacy compliance validation, and operational testing.
- **Forgot Password** — Clicking "Forgot Password" shows guidance text advising the user to contact their PHC medical officer. It does not send an automated password reset email.
- **Ward and sector assignment** — Ward name ("Ward 4, Rampur"), sector name, and PHC name displayed in dashboard headers are static strings. Dynamic assignment from a database-backed admin panel is not yet implemented.
- **Pregnancy offline fallback** — Pregnancy records use a `localStorage` fallback in addition to IndexedDB when offline, due to a constraint in the sync ordering logic.
- **No push notifications** — Notifications are in-app only. Native OS-level push notifications (Web Push API) are not implemented.
- **No SMS integration** — Authentication is email/password only. SMS OTP for field workers without email accounts is not implemented.
- **Browser-based local storage** — IndexedDB data is stored in the browser profile and will be lost if the user clears browser data. A native app would provide more durable local storage.
- **No organizational hierarchy configuration** — Supervisor-to-ASHA assignment and ASHA-to-PHC mapping are configured via seed data, not via an admin UI.

---

## Future Scope

These features are identified as valuable next steps but are **not implemented** in the current codebase:

- **Additional Indian languages** — Marathi, Chhattisgarhi, Bengali, and other regional languages (the `preferred_language` column in `profiles` already reserves space for `mr` and `cg`).
- **Voice-assisted data entry** — For low-literacy field workers; integration with on-device speech recognition.
- **Native OS push notifications** — Background alerts for overdue follow-ups, approved medicine requests, and appointment reminders.
- **SMS OTP authentication** — For workers without email accounts.
- **ABHA / Ayushman Bharat Health Account integration** — Linking patient records to national health identity infrastructure.
- **Larger organizational hierarchy** — Block-level and district-level aggregation above PHC.
- **Community health event scheduling** — Immunization camps, antenatal group sessions.
- **Predictive overdue alerting** — Rule-based alerts for expected-but-missed ANC visits.
- **Admin portal** — UI for creating and managing ASHA worker accounts, supervisor assignments, and PHC configurations.
- **Expanded observability** — Structured logging, error tracking, and usage analytics.

---

## References

- [National Health Mission — ASHA Guidelines](https://nhm.gov.in/index1.php?lang=1&level=1&sublinkid=971&lid=154)
- [MoHFW — Community Health Workers](https://mohfw.gov.in)
- [ASHA Training Modules — NHM](https://nhsrcindia.org/category-resources/training/asha)
- [Supabase Documentation](https://supabase.com/docs)
- [Dexie.js — IndexedDB Wrapper](https://dexie.org)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app)
- [Playwright Testing](https://playwright.dev)

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes.
4. Run the test suite: `npm run test:e2e`
5. Commit and push your branch.
6. Open a pull request with a clear description of the change.

---

## License

License has not yet been specified.

---

## Hackathon Highlights

This project was developed as a **Smart India Hackathon (SIH) 2026** submission.

**Technically significant implemented aspects:**

| Aspect | Detail |
|---|---|
| Offline-first PWA | Full field workflow without internet. IndexedDB (Dexie.js) mirrors 13 server tables locally. |
| Topological sync engine | Dependency-aware upload ordering prevents foreign key violations during batch sync. |
| Idempotent synchronization | UUID-keyed upserts prevent duplicate records across multiple sync attempts. |
| Row Level Security | 26+ PostgreSQL RLS policies enforce data isolation at the database layer — not just the application layer. |
| Three-role RBAC | Role-determined at login from the `profiles` table. Each role sees a completely different portal and data scope. |
| 77 E2E tests | Playwright tests cover authentication, role isolation, offline indicators, sync behavior, maternal/child workflows, tasks, notifications, and reports. |
| Mobile-first design | 48px minimum touch targets, bottom navigation, Tailwind CSS responsive layout designed for budget Android devices. |
| Bilingual UI | Complete English and हिन्दी runtime switching with localStorage persistence, applied across all 29 feature views. |
| Audit trail | 28 distinct clinical and administrative action types recorded non-blocking to `audit_logs`. |
| CSV reporting | 6 configurable report exports covering visits, follow-ups, referrals, medicine orders, stock, and sector summaries. |

---

*Developed as a hackathon project for the ASHA Worker Digital Platform.*
