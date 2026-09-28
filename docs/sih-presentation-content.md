# ASHA Worker Digital Platform - SIH 2026 Presentation Content

## Slide 1: Title Slide
**Title:** ASHA Worker Digital Platform
**Subtitle:** Offline-First Healthcare Ecosystem for Rural India
**Details:** 
- Smart India Hackathon (SIH) 2026
- Team Name: [Team Name]
- Institute: [College Name]
- Problem Statement Code: [PS Code]

## Slide 2: Problem Statement
**Title:** The Paper Problem in Rural Healthcare
**Visual:** Diagram showing the manual workflow.
- **Current State:** ASHA workers rely on fragile paper registers.
- **Pain Points:** 
  - Data loss and duplication.
  - No real-time tracking for pregnancies and immunizations.
  - Supply chain delays for essential medicines.
  - Zero connectivity in remote areas halts digital data entry.

## Slide 3: Existing vs Proposed System
**Title:** Existing vs Proposed System
**Content:**
**Existing (Paper-Based):**
- Manual data entry in multiple registers.
- High error rate and redundancy.
- Post-visit data entry at PHCs.
- No offline digital support.

**Proposed (ASHA Saathi Platform):**
- Single source of truth via Digital Profiles.
- Automated scheduling and alerts.
- Real-time sync when internet is available.
- Offline-First PWA (Progressive Web App) architecture.

## Slide 4: Our Solution
**Title:** The Solution Ecosystem
**Visual:** Core ecosystem diagram with ASHA Worker (Mobile), Supervisor (Tablet), and PHC Manager (Desktop).
**Content:**
A unified, multi-role Progressive Web Application that digitizes the entire rural healthcare workflow, ensuring zero data loss even in completely offline environments.
*Placeholders for actual screenshots: Login, Dashboard.*

## Slide 5: Key Features
**Title:** Key Features
**Content:**
- **Household & Patient Management:** Unified family trees.
- **Maternal & Child Tracking:** ANC/PNC visits and immunizations.
- **Inventory & Medicine Requests:** Track drug kits and request refills.
- **Offline PWA Engine:** Work seamlessly without internet.
- **Bilingual Support:** Natively supports English and Hindi.
- **Role-Based Access Control:** Secure views for ASHAs, Supervisors, and Managers.

## Slide 6: End-to-End Workflow
**Title:** End-to-End ASHA Workflow
**Visual:** Flowchart of the daily routine.
**Content:**
1. **Login & Sync:** Start the day, download assigned households.
2. **Dashboard:** View daily tasks and pending follow-ups.
3. **Visit Execution:** Navigate to Household -> Patient -> Add Visit.
4. **Data Entry (Offline):** Record vitals, notes, and next follow-up.
5. **Auto-Sync:** Data automatically uploads when network is restored.

## Slide 7: Offline-First Innovation
**Title:** Offline-First PWA Innovation
**Visual:** State transition diagram (Online -> Offline -> Pending Sync -> Synced).
**Content:**
- **App Shell Caching:** Loads instantly without network via Service Workers.
- **Local Data Store:** Uses IndexedDB (Dexie.js) for structured local storage.
- **Optimistic UI:** Instant feedback for user actions.
- **Background Sync:** Queues mutations locally and processes them sequentially upon reconnection.

## Slide 8: Synchronization Algorithm
**Title:** Robust Synchronization Engine
**Visual:** Diagram of sync queues and dependency graphs.
**Content:**
- **Lock-Based Concurrency:** Prevents race conditions during sync.
- **Topological Ordering:** Resolves foreign-key dependencies (e.g., Households -> Patients -> Visits).
- **Idempotent Operations:** UUID-based upserts prevent data duplication on retries.
- **Error Recovery:** Granular retry logic for individual failed records.

## Slide 9: Technical Architecture
**Title:** System Architecture
**Visual:** Multi-tier architecture diagram.
**Content:**
- **Frontend:** React + TypeScript + Vite.
- **PWA Engine:** vite-plugin-pwa (Workbox) + Dexie.js.
- **Styling:** Tailwind CSS.
- **Backend/Database:** Supabase (PostgreSQL 17).
- **Hosting:** Vercel (Frontend) + Supabase Cloud (Backend).

## Slide 10: Backend + Data Architecture
**Title:** Data Architecture
**Visual:** Simplified ER Diagram.
**Content:**
- **Core Entities:** `users`, `households`, `patients`, `visits`, `pregnancies`, `children`, `medicine_orders`.
- **Relational Integrity:** Strict foreign key constraints and cascading behaviors.
- **UUIDs:** Universal identifiers generated client-side for seamless offline creation.

## Slide 11: Security & Compliance
**Title:** Security & Data Privacy
**Content:**
- **Authentication:** JWT-based secure sessions via Supabase Auth.
- **Role-Based Access Control (RBAC):** Strict isolation between ASHA, Supervisor, and Manager roles.
- **Row Level Security (RLS):** 26 distinct policies ensure users only access authorized data.
- **Audit Logging:** Comprehensive tracking of all critical data mutations.

## Slide 12: Three-Role Ecosystem
**Title:** The Three-Role Ecosystem
**Visual:** Three columns highlighting role-specific tools.
**Content:**
- **ASHA Worker (Field):** Mobile-first UI, offline entry, visit tracking.
- **Sector Supervisor (Tablet):** Activity monitoring, report aggregation, medicine approvals.
- **PHC Manager (Desktop):** Inventory control, system-wide analytics, requisition management.

## Slide 13: Innovation & Differentiation
**Title:** What Makes Us Different?
**Content:**
- **True Offline Capability:** Not just offline-viewing, but full offline data creation and editing.
- **Data Deduplication:** Client-generated UUIDs ensure perfect synchronization without duplicate records.
- **Accessibility:** Mobile-first, lightweight UI optimized for low-end Android devices in rural areas.
- **Multilingual UI:** One-tap switch between English and Hindi, fully persisted.

## Slide 14: Feasibility, Scalability & Future
**Title:** Feasibility & Future Scope
**Content:**
- **Scalability:** Serverless frontend and auto-scaling PostgreSQL backend.
- **Feasibility:** Low operational cost, minimal training required for ASHA workers.
- **Future Enhancements:** 
  - AI-powered predictive healthcare alerts.
  - Integration with ABHA (Ayushman Bharat Health Account).
  - Voice-based data entry in regional languages.

## Slide 15: Demo & Closing
**Title:** Thank You
**Subtitle:** "Digitize the field workflow. Keep it working when connectivity does not."
**Content:**
- **Live Demo:** Transition to application demonstration.
- **Q&A Session.**
