# ASHA Saathi (आशा साथी)

> **The Offline-First Digital Field Platform for India's Community Health Workers**  
> *Replacing fragmented paper registers with unified patient tracking, doorstep clinical visits, maternal care, child immunizations, closed-loop medicine logistics, and intelligent offline synchronization.*

---

## 📖 The Problem & The Mission

Across India, over **1,000,000 Accredited Social Health Activists (ASHAs)** deliver life-saving doorstep healthcare to more than 800 million citizens. Yet, their daily workflow is severely burdened by manual paper processes:
- **10 to 15 Physical Registers**: ASHAs must manually carry and maintain separate paper books for maternal checkups, child immunizations, medicine kit logs, eligible couples, and daily visit diaries.
- **Connectivity Blindspots**: Doorstep care occurs in rural hamlets and dense urban settlements where 4G/5G mobile signals frequently drop. Standard web apps fail when disconnected.
- **Fragmented Supply Chain**: Delays in paper requisitions cause drug kit stockouts of essential items like Iron Folic Acid (IFA) and Oral Rehydration Salts (ORS).

**ASHA Saathi** replaces these paper registers with an **offline-first Progressive Web Application (PWA)** built specifically for budget smartphones, linking frontline health workers directly with sector supervisors and Primary Health Centre (PHC) pharmacies.

---

## 🌟 Core System Capabilities

- 📱 **Mobile-First Touch Ergonomics**: Minimum 48px touch targets, high sunlight contrast (>4.5:1 ratio), and rapid 1-tap actions.
- ⚡ **True Offline-First Architecture**: Writes directly to client-side IndexedDB (Dexie.js). Full functionality under zero connectivity.
- 🔄 **Relational Auto-Sync Engine**: Reconciles pending operations upon reconnect in strict foreign key dependency order with zero duplicate records.
- 🤰 **Maternal Care Engine**: Gestational age calculations, Expected Due Date (EDD) via Naegele's rule (+280 days), Gravida/Para tracking, and postnatal checkups.
- 👶 **Child Immunization & Growth**: Precision age calculations for children under 5 (days/months/years) with growth milestone tracking.
- 💊 **Closed-Loop Supply Chain**: ASHA digital refill requests → Supervisor in-place approvals → PHC Manager central inventory fulfillment.
- 🔒 **Healthcare Security & RLS**: 14 PostgreSQL tables secured by Row Level Security (RLS) policies and multi-user device cache wiping on logout.
- 🌐 **Runtime Bilingual Localization**: Instant 1-tap toggle between English and Hindi (`हिन्दी`).
- 📊 **Factual Operational Reports**: Non-punitive coverage analytics, pure CSS visit sparklines, and RFC-4180 Excel-compatible CSV downloads.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Vercel CDN Edge                      │
│   (App Shell, registerSW.js, manifest, assets/*.js)    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS (TLS 1.3)
                            ▼
┌────────────────────────────────────────────────────────┐
│          Client Device (Mobile Browser / PWA)          │
│   - Dexie.js (13 IndexedDB Persistent Stores)          │
│   - Background Sync Queue (FIFO + FK Ordering)         │
│   - Workbox Service Worker (Precached App Shell)       │
└───────────────────────────┬────────────────────────────┘
                            │ Authenticated JWT (REST / RPC)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Supabase Cloud (ap-southeast-1)            │
│   - GoTrue Auth (Session tokens & Cookies)             │
│   - PostgreSQL 17 + 14 RLS Protected Tables           │
│   - 11 B-Tree Performance Indexes + 5 SQL Views        │
│   - Non-blocking Audit Logger Engine                   │
└────────────────────────────────────────────────────────┘
```

---

## 👥 Verified 1-Tap Demo Personas

For hackathon judging and evaluation, the login screen includes 1-tap demo authentication:

| Role | Demo Persona | Email | Purpose & Scope |
|---|---|---|---|
| **ASHA Worker** | Sunita Devi | `asha.demo@gmail.com` | Ward 4 Frontline Field Worker (Rampur Village) |
| **Supervisor** | Dr. Anita Roy | `supervisor.demo@gmail.com` | North Block PHC Sector Supervision |
| **PHC Manager** | Rajesh Sharma | `manager.demo@gmail.com` | Central Health Centre Pharmacy Depot Admin |

*(Standard demo password: `Password123!`)*

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+

### 2. Installation
```bash
git clone <repository-url>
cd "IUR 26"
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your Supabase parameters are populated:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

### 5. Production Build & Preview
```bash
npm run build
npm run preview -- --port 3000
```

### 6. Run Automated Playwright Tests
```bash
npm run test:e2e
```
*Current test suite: 64 test runs (32 tests across Mobile Pixel 7 and Desktop Chrome), 100% pass rate.*

---

## 📂 Documentation Directory

| Document | Description |
|---|---|
| [System Architecture](docs/architecture.md) | Component architecture, data flows, and 4 pillars |
| [Database Schema & ERD](docs/database.md) | PostgreSQL 17 schema, foreign keys, and indexes |
| [Security & Access Control](docs/security.md) | Threat modeling and data minimization rules |
| [Security Audit & RLS Matrix](docs/security-audit.md) | Table-by-table RLS policies and audit trail |
| [Offline-Sync Engine](docs/offline-sync.md) | Dexie.js schemas, sync queue, and idempotency guarantees |
| [Performance Guide](docs/performance.md) | Bundle size metrics (<250KB gzip) and B-Tree indexing |
| [Accessibility Standards](docs/accessibility.md) | WCAG 2.1 AA audit and 48px touch ergonomics |
| [Reporting & Analytics](docs/reporting.md) | Non-punitive reporting architecture and RFC-4180 CSV exports |
| [QA Feature Matrix](docs/qa-matrix.md) | Complete 72-feature QA inventory |
| [QA Bug Tracking Log](docs/bug-log.md) | Resolved bugs, root causes, and regression tests |
| [Release Candidate Test Report](docs/release-test-report.md) | Playwright execution matrix across devices |
| [Production Deployment Guide](docs/deployment.md) | Vercel setup, headers, migrations, and PWA behavior |
| [Live Demo Runbook](docs/hackathon-demo-runbook.md) | 3.5-minute presentation script and failure fallbacks |
| [Production Rollback Guide](docs/rollback.md) | Disaster recovery and emergency demo data reset |
| [Hackathon Presentation Deck](docs/hackathon-presentation.md) | Full problem/solution presentation materials |
| [3-Minute Pitch Script](docs/hackathon-pitch.md) | Word-for-word spoken pitch script with cues |
| [Judge Q&A Defense](docs/judge-questions.md) | Factual answers to tough technical & clinical questions |
| [Final Feature Matrix](docs/final-feature-matrix.md) | Role-by-role capability and offline support audit |
| [Known Limitations](docs/limitations.md) | Transparent boundaries, iOS storage rules, and scope |
| [Stage-Ready Checklist](docs/final-demo-checklist.md) | 15-minute pre-stage verification checklist |

---

## ⚠️ Known Technical Limitations

1. **iOS Safari Storage Cap**: iOS purges uninstalled browser IndexedDB data after 7 days of inactivity. Users must install the PWA to the Home Screen for permanent persistence.
2. **Push Notifications**: Relies on an in-app Notification Center because background OS Push requires VAPID server configuration.
3. **Data Scope**: All pre-seeded demo records are 100% synthetic and comply with healthcare privacy regulations. No real patient data is ever used.

---

## 📜 License
Developed for the National Health Mission Digital Innovation Challenge. Open-source under the MIT License.
