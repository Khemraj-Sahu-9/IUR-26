# ASHA Saathi (आशा साथी) — Hackathon Demo Runbook

> **Judge-Ready Live Demonstration Choreography**  
> **Duration**: 3.5 minutes total (90s ASHA, 60s Supervisor, 45s Manager, 15s Wrap-up)  
> **Key Value Proposition**: Transforming paper-based rural healthcare into an offline-first, closed-loop digital ecosystem for India's 1 million ASHA workers.

---

## 1. Pre-Demo Checklist (T-Minus 15 Minutes)

- [ ] **Production URL Available**: Open the live application in Chrome (preferably with mobile device emulation or on an actual Android smartphone).
- [ ] **Synthetic Data Verified**: Ensure seed script [`supabase/seed/seed_production_demo.sql`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/supabase/seed/seed_production_demo.sql) has been executed.
- [ ] **Demo Personas Functional**:
  - `Sunita Devi` (ASHA Worker) → Login takes user to Field Worker Dashboard.
  - `Dr. Anita Roy` (Supervisor) → Login takes user to Sector Supervision Portal.
  - `Rajesh Sharma` (Manager) → Login takes user to PHC Administration Portal.
- [ ] **Network Toggle Ready**: Locate Chrome DevTools Network offline toggle OR Device Airplane Mode switch.
- [ ] **Cache Primed**: Open the app once while connected so the PWA Service Worker precaches the application shell.

---

## 2. Minute-by-Minute Live Demo Choreography

### Act I: The Frontline ASHA Worker (Sunita Devi) — [0:00 - 1:30]
1. **Login (0:00 - 0:10)**:
   - Present the clean, high-contrast mobile login screen.
   - Tap **"Sunita Devi (ASHA Worker)"** 1-tap demo button.
   - *Key Talking Point*: *"Community health workers don't have time for complex credentials in remote fields. One tap brings Sunita directly to her daily agenda."*
2. **Dashboard & Daily Tasks (0:10 - 0:30)**:
   - Highlight the greeting in Hindi (*"शुभ प्रभात, आशा दीदी"*), weather/connection pill (🟢 Synced), and daily action cards.
   - Tap **"Tasks"** in bottom navigation: Show the unified task list with one priority ANC check and an overdue hypertension reminder.
3. **Maternal & Child Tracking (0:30 - 0:50)**:
   - Tap **"Patients"** → Filter by **"Pregnant"** chip.
   - Tap **Pooja Sharma**: Show the maternal section displaying **Gestational Age (18 weeks)** and **Expected Due Date** calculated via Naegele's rule.
   - Show child tracking for 14-month-old **Aarav Verma** with growth milestones.
4. **Offline Field Resilience (0:50 - 1:15)**:
   - **Show the magic**: Turn internet **OFF** (Airplane mode or DevTools Offline).
   - Notice the unobtrusive yellow **"Offline Mode"** banner.
   - Tap **"Record Visit"** for Pooja Sharma:
     - Select: Routine ANC
     - Notes: *"Patient compliant with daily IFA. BP normal."*
     - Check *"Follow-up required"* → Next week.
     - Tap **"Save Visit Record"**.
   - Notice the instant confirmation and the bottom sync pill: **🟡 Pending (1)**.
   - *Key Talking Point*: *"In remote villages with zero connectivity, field workers never stop. Data is safely stored in local IndexedDB."*
5. **Auto-Reconciliation (1:15 - 1:25)**:
   - Turn internet **ON**.
   - Watch the sync pill transition: **🔵 Syncing…** → **🟢 Synced (Just now)**.
   - *Key Talking Point*: *"The client-driven background sync engine automatically reconciles pending records with PostgreSQL in strict dependency order without creating duplicate rows."*
6. **Logistics Refill Request (1:25 - 1:30)**:
   - From Home, tap **"Drug Kit"** → Request 60 units of Iron Folic Acid (IFA) tablets.
   - Tap **"Sign Out"** (mentioning that multi-user device cache is instantly purged for privacy).

---

### Act II: Sector Supervision & Clinical Governance (Dr. Anita Roy) — [1:30 - 2:30]
1. **Supervisor Login (1:30 - 1:40)**:
   - Tap **"Dr. Anita Roy (Supervisor)"**.
   - Highlight the sector dashboard: North Block PHC, 4 active ASHAs, recent weekly visits, pending follow-ups.
2. **Activity Stream (1:40 - 2:05)**:
   - Tap **"Activity & Monitoring"**: Show real-time visibility into visits logged by field workers across the sector.
   - Tap **"Maternal"**: View sector-wide active pregnancies without paper registers.
3. **Closed-Loop Supply Chain Approval (2:05 - 2:30)**:
   - Tap **"Medicines"** → Orders Queue.
   - View Sunita Devi's pending request for 60 units of IFA.
   - Tap **"Approve"** (or adjust quantity to 50).
   - *Key Talking Point*: *"Supervisors prevent drug leakage and ensure critical maternal supplements reach the front lines before stockouts occur."*
   - Tap **"Reports"** → Highlight aggregate coverage analytics with zero worker-punitive gamification.
   - Sign Out.

---

### Act III: Primary Health Centre Administration (Rajesh Sharma) — [2:30 - 3:15]
1. **Manager Login (2:30 - 2:40)**:
   - Tap **"Rajesh Sharma (PHC Manager)"**.
   - Show the PHC Administration overview: central depot stock health.
2. **Inventory Depletion Alert (2:40 - 2:55)**:
   - Point out **Low Stock (ORS Sachet)** and **Out of Stock (Zinc Sulphate)** cards.
   - Tap **"Manage Stock"**: In-place threshold adjustment.
3. **Order Fulfillment (2:55 - 3:15)**:
   - Tap **"Requisitions"**: Find the approved request.
   - Tap **"Fulfill Request"** → Real-time stock decrement from depot.
   - Tap **"Reports"** → Tap **"Export CSV"**: Demonstrates compliance with National Health Mission reporting formats (RFC-4180).

---

### Act IV: Summary & Judge Takeaway — [3:15 - 3:30]
- *"ASHA Saathi closes the loop: From doorstep patient care in zero-connectivity villages, to sector clinical oversight, to institutional pharmacy fulfillment — completely open-source, secure, and ready for pilot deployment."*

---

## 3. Fallback Procedures ("If Something Goes Wrong")

| Potential Failure Point | Live Fallback Plan |
|---|---|
| **Internet completely drops during judge demo** | The app is **Offline-First**! Stay in offline mode, demonstrate full visit entry and local persistence, and explain that sync will trigger upon reconnection. |
| **Accidentally cleared demo data** | Run the 1-click reset query: copy [`supabase/seed/reset_demo_data.sql`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/supabase/seed/reset_demo_data.sql) into the Supabase SQL Editor and click Run. |
| **Browser cache holding old build** | Hard reload (`Ctrl+Shift+R` or `Cmd+Shift+R`). The `max-age=0` header on `sw.js` guarantees fresh service worker activation. |
| **Demo user shows incorrect role** | Tap "Sign Out" and re-tap the demo persona button on the login screen to re-authenticate cleanly. |
