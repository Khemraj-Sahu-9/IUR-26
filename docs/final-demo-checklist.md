# ASHA Saathi (आशा साथी) — Stage-Ready Demo Checklist

> **Final Pre-Stage Verification Runbook**  
> Complete these checks 15 minutes before presenting to hackathon judges.

---

## 1. Hardware & Environment Prep
- [ ] **Laptop Power**: Charged (>80%) or plugged into AC power.
- [ ] **Mobile Device**: Phone/tablet charged, screen sleep timeout set to 5+ minutes, brightness set high for stage lighting.
- [ ] **Display Resolution**: If presenting from laptop, use Chrome DevTools device mode set to **iPhone 14 / Pixel 7 (390×844)** with 100% zoom.
- [ ] **Browser Hygiene**: Close all unrelated tabs, disable distracting desktop notifications, close background messaging apps.
- [ ] **Network Access**: Confirm WiFi is active OR mobile hotspot is connected.

---

## 2. Database & Synthetic State Verification
- [ ] **Database Connection**: Open Supabase dashboard and confirm connection is healthy.
- [ ] **Clean Synthetic Baseline**:
  - If previous test runs created extra records, execute [`supabase/seed/reset_demo_data.sql`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/supabase/seed/reset_demo_data.sql) in Supabase SQL Editor.
  - Takes <3 seconds to re-seed clean baseline.
- [ ] **Confirm Key Seed Data**:
  - `Pooja Sharma`: Pregnant (18 weeks GA, EDD calculated).
  - `Aarav Verma`: 14-month child with immunization record.
  - `Ramesh Verma`: Overdue hypertension follow-up.
  - `Medicine Order`: 1 pending request for IFA tablets from Sunita Devi.
  - `Depot Stock`: ORS (Low Stock - 45 units) & Zinc (Out of Stock - 0 units).

---

## 3. Browser Tabs to Pre-Open

Prepare 3 browser windows or tabs in advance:
1. **Tab 1 (Primary - ASHA Worker)**:
   - URL: Live deployment or `http://localhost:3000`
   - State: Logged in as **Sunita Devi** (ASHA Worker) on Field Dashboard.
2. **Tab 2 (Supervisor Portal)**:
   - URL: Incognito window or secondary browser
   - State: Logged in as **Dr. Anita Roy** (Supervisor) on Sector Supervision Portal.
3. **Tab 3 (PHC Manager Portal)**:
   - URL: Secondary browser window
   - State: Logged in as **Rajesh Sharma** (Manager) on PHC Administration.

*Tip: Having the roles in separate browser windows allows instantaneous role transitions on stage without waiting for sign-in screens!*

---

## 4. Live Offline Demo Drill
Before stepping on stage, test the offline workflow once:
1. In Tab 1 (Sunita Devi), open DevTools -> Network -> Select **"Offline"** (or toggle device Airplane Mode).
2. Verify the top status banner displays: **"Offline — changes saved on this device"**.
3. Open patient **Pooja Sharma** -> Tap **"Record Visit"**.
4. Save the visit -> Verify instant feedback: **"Saved on this device. Will sync when online."**
5. Check sync indicator: **🟡 Pending (1)**.
6. Toggle Network back to **"Online"**.
7. Verify automatic synchronization: **🔵 Syncing…** -> **🟢 All changes synced**.

---

## 5. Emergency Quick-Fix Reference

| What Happens on Stage | Immediate Presenter Action |
|---|---|
| **WiFi drops completely** | Do not panic! State proudly: *"As you can see, ASHA Saathi was engineered for zero connectivity."* Complete the entire ASHA workflow offline. |
| **Accidental navigation away from screen** | Tap the sticky **Home** icon in the bottom navigation bar to return to the dashboard. |
| **Accidentally submitted wrong data** | Switch to Tab 2 (Supervisor) or Tab 3 (Manager); the multi-tier workflow remains completely believable. |
| **Browser tab freezes or crashes** | Refresh the page. The PWA Service Worker will restore the app shell from cache in under 1 second. |
