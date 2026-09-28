# ASHA Saathi (आशा साथी) — Hackathon Presentation Deck & System Overview

> **Project Name**: ASHA Saathi | आशा साथी  
> **Tagline**: The Offline-First Digital Field Platform for Community Health Workers  
> **Domain**: Public Health • Primary Care Logistics • National Health Mission (NHM)

---

## 1. The Problem: The Paper-Register Burden

Across India, over **1,000,000 Accredited Social Health Activists (ASHAs)** deliver doorstep maternal, child, and community health services to 800+ million rural and peri-urban citizens.

However, their daily workflow remains severely constrained by manual paper processes:
- **Register Fatigue**: An ASHA worker must carry and maintain up to **10 to 15 separate physical paper registers** (MCH register, immunization tracking register, eligible couple register, medicine distribution ledger, visit diary, etc.).
- **Connectivity Blindspots**: Doorstep visits occur in rural hamlets, dense urban settlements, and remote tribal villages where 4G/5G mobile connectivity is frequently absent or intermittent.
- **Lost Follow-ups & Stockouts**: High-risk pregnancies, missed immunization booster doses, and depleted medicine kits are easily overlooked in paper notebooks, causing preventable complications.
- **Reporting Delays**: Monthly reporting requires tedious manual tabulation at the end of each month, delaying institutional epidemiological visibility at the Primary Health Centre (PHC).

---

## 2. The Solution: ASHA Saathi

**ASHA Saathi** replaces fragmented physical notebooks with a single, unified, **offline-first Progressive Web Application (PWA)** tailored specifically for budget smartphones.

It connects the three vital tiers of public healthcare delivery:
1. **The ASHA Worker in the Field**: Seamless doorstep data capture, automated schedule reminders, maternal/child clinical trackers, and instant drug kit refill requests.
2. **The Sector Supervisor**: Real-time visibility into field coverage, active pregnancy progress, and transparent requisition approvals.
3. **The PHC Facility Manager**: Central pharmacy depot monitoring, low-stock alerts, and institutional order fulfillment.

---

## 3. Key Technological Innovations

### A. True Offline-First Architecture
- Rather than an online-only portal with a simple network check, ASHA Saathi writes every record **locally to client IndexedDB (Dexie.js)** first.
- The ASHA can register families, document maternal visits, schedule follow-ups, and request medicines with **zero internet connection**.
- All essential application assets (HTML, CSS, JS, icons) are precached by a Workbox Service Worker.

### B. Relational Background Sync Engine
- Client-generated stable UUIDs serve as idempotency keys.
- When internet returns, the background sync queue automatically reconciles changes with Supabase PostgreSQL in strict relational dependency order (`households` → `patients` → `visits` / `follow_ups` / `referrals` → `medicine_orders`).
- Supabase `upsert` semantics (`onConflict: 'id'`) eliminate duplicate records on network flaps.

### C. Shared-Device Multi-User Sanitization
- In rural health centres, tablets and smartphones are frequently shared among community workers.
- When an ASHA signs out, the application triggers an atomic `clearLocalDatabase()`, wiping all 13 IndexedDB stores to guarantee complete Protected Health Information (PHI) privacy.

---

## 4. User Personas & Workflows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        3-TIER HEALTHCARE WORKFLOW                      │
└────────────────────────────────────────────────────────────────────────┘

    [ ASHA Worker ]                   [ Supervisor ]             [ PHC Manager ]
       Sunita Devi                    Dr. Anita Roy               Rajesh Sharma
            │                               │                           │
            ├─ 1. Home Visit Logged         │                           │
            ├─ 2. Auto-Scheduled Follow-up  │                           │
            ├─ 3. Maternal / Child Tracking ┼─ Monitors Activity ───────┤
            │                               │                           │
            ├─ 4. Drug Kit Refill Request ─►├─ Reviews & Approves ─────►├─ Fulfills Order
            │                               │                           │   (Stock Decremented)
            └─ 5. Offline Data Entry ───────┴───────────────────────────┴─ Exports RFC-4180 CSV
```

---

## 5. Main Functional Modules

1. **Family & Patient Registry**: Household codes (`HH-2026-XXX`), patient codes (`PT-2026-XXXX`), demographic profiles, and multi-condition filter chips (`Pregnant`, `Children <5y`, `Overdue`, `Female`, `Male`).
2. **Doorstep Home Visits**: 7 standard visit types (`routine_anc`, `pnc`, `immunization`, `general_checkup`, `communicable_disease`, `maternal_checkup`, `child_growth`).
3. **Maternal Care Engine**: Gestational Age calculation, Expected Due Date calculation via Naegele's rule (LMP + 280 days), Gravida/Para counters, and delivery outcome tracking.
4. **Child Immunization & Growth**: Precision age formatting (days, months, years) for children under 5, vaccination logs, and milestone follow-ups.
5. **Closed-Loop Drug Kit Logistics**: Field stock visibility, digital requisitions, supervisor approvals with quantity adjustments, and PHC depot inventory depletion.
6. **Actionable Tasks & Notifications**: Unified daily agenda with priority badges, overdue reminders, and deep-linking to patient profiles.
7. **Analytical Reports & CSV Exports**: Non-punitive coverage analytics, pure CSS visit sparklines, and RFC-4180 Excel-compatible CSV exports.

---

## 6. Technology Stack

- **Frontend Application**: React 18, TypeScript 5.7, Vite 5.4, Tailwind CSS 3.4, Lucide React
- **Local Storage & Offline Engine**: Dexie.js 4.4 (IndexedDB wrapper), VitePWA 1.3, Workbox Window 7.4
- **Cloud Backend & Database**: Supabase Cloud, PostgreSQL 17, GoTrue Auth
- **Security & Authorization**: PostgreSQL Row Level Security (RLS), custom `get_current_role()` security definer, asynchronous audit logger
- **Testing & Quality Assurance**: Playwright E2E Test Suite (64 test runs across Mobile Pixel 7 and Desktop Chrome), TypeScript compile checking (`tsc --noEmit`)

---

## 7. Operational Impact & Benefits

- **Zero Paper Duplication**: Eliminates manual cross-register copying and saves valuable field time.
- **Continuity of Care**: Automatic alerts for overdue follow-ups ensure mothers and children receive timely postnatal care and booster immunizations.
- **Stockout Prevention**: Replaces end-of-month emergency drug requests with continuous digital visibility and supervisor-verified fulfillment.
- **Bilingual Accessibility**: Instant 1-tap language toggle between English and Hindi (`हिन्दी`), designed for non-technical frontline health workers.
