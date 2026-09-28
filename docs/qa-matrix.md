# ASHA Saathi — QA Feature Matrix

> Phase 10 Complete QA Inventory  
> Generated: 2026-09-28

---

## 1. Authentication & Authorization

| Feature | Role | Route/View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-----------|-------------------|---------------|--------|--------------|
| Email/Password Login | All | `LoginView` | Signs in via Supabase Auth, loads profile, routes to role shell | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Demo Persona Login (ASHA) | asha | `LoginView` → `AshaShell` | Click "Sunita Devi" → ASHA dashboard | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Demo Persona Login (Supervisor) | supervisor | `LoginView` → `SupervisorShell` | Click "Dr. Anita Roy" → Supervisor portal | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Demo Persona Login (Manager) | manager | `LoginView` → `ManagerShell` | Click "Rajesh Sharma" → Manager portal | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Invalid Login Rejection | All | `LoginView` | Shows error alert for wrong credentials | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Logout | All | Profile → Logout | Clears session + IndexedDB, returns to LoginView | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Role Isolation | All | `App.tsx` switch | ASHA sees AshaShell, Supervisor sees SupervisorShell, Manager sees ManagerShell | `auth_and_roles.spec.ts` | ✅ Pass | None |
| Session Persistence | All | Refresh page | User stays logged in via Supabase session token | Manual | ✅ Works | None |
| IndexedDB Clearance on Logout | All | Logout flow | `clearLocalDatabase()` wipes all Dexie tables | `offline_sync.spec.ts` | ✅ Pass | None |

## 2. ASHA Worker Features

### 2.1 Dashboard

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Dashboard Stats | `AshaDashboard` | Shows patient count, pending tasks, overdue follow-ups | `phase10_qa_master.spec.ts` | ✅ Pass | Stats may show 0 in demo |
| Quick Action Shortcuts | `AshaDashboard` | Buttons for Households, Patients, Tasks, Medicines, Notifications, Reports | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Navigate to Households | Dashboard → Households | Links to HouseholdsListView | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Navigate to Patients | Dashboard → Patients | Links to PatientsListView | `phase10_qa_master.spec.ts` | ✅ Pass | None |

### 2.2 Households

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| List Households | `HouseholdsListView` | Shows all assigned households | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Add Household | `AddHouseholdView` | Form: code, head, address, village, ward | Manual | ✅ Works | None |
| Household Details | `HouseholdDetailsView` | Shows members, add patient from household | Manual | ✅ Works | None |
| Search Households | `HouseholdsListView` | SearchBar filters list by code/name | Manual | ✅ Works | None |

### 2.3 Patients

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| List Patients | `PatientsListView` | Shows all patients with filter chips | `maternal_child.spec.ts` | ✅ Pass | None |
| Filter Chips (All/Pregnant/Children/Overdue/Female/Male) | `PatientsListView` | 6 clickable filter chips | `maternal_child.spec.ts` | ✅ Pass | None |
| Add Patient | `AddPatientView` | Form: name, DOB, gender, phone, household | Manual | ✅ Works | None |
| Patient Profile | `PatientProfileView` | Shows patient info, action buttons, clinical sections | `maternal_child.spec.ts` | ✅ Pass | None |
| Edit Patient | `EditPatientView` | Modify name, DOB, gender, phone, status | Manual | ✅ Works | None |
| Patient Search | `PatientsListView` | SearchBar filters by name/code | Manual | ✅ Works | None |
| Patient Card data-testid | `PatientCard` | Has `data-testid="patient-card"` | `maternal_child.spec.ts` | ✅ Pass | None |

### 2.4 Visits

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Record Visit | `AddVisitView` | Form: date, type, notes, follow-up checkbox | `visits_and_referrals.spec.ts` | ✅ Pass | None |
| Visit Types | `AddVisitView` | 7 types: routine_anc, pnc, immunization, etc. | `visits_and_referrals.spec.ts` | ✅ Pass | None |
| Visit History | `VisitHistorySection` | Lists visits in patient profile | Manual | ✅ Works | None |
| Auto Follow-up Creation | `AddVisitView` | Creates follow-up when checkbox checked | Manual | ✅ Works | None |

### 2.5 Follow-ups

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Follow-ups List | `FollowUpsListView` | Tab filters: Today, Upcoming, Overdue, Completed | Manual | ✅ Works | None |
| Follow-ups in Patient Profile | `FollowUpsSection` | Shows patient-specific follow-ups | Manual | ✅ Works | None |
| Complete Follow-up | `FollowUpsListView` | Mark as completed with timestamp | Manual | ✅ Works | None |

### 2.6 Referrals

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Create Referral | `AddReferralView` | Form: referred_to, reason, date, notes | `visits_and_referrals.spec.ts` | ✅ Pass | None |
| Referrals Section | `ReferralsSection` | Shows in patient profile | Manual | ✅ Works | None |

### 2.7 Medicines

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Drug Kit View | `MedicineRequestView` | Shows available medicines, request form | `offline_sync.spec.ts` | ✅ Pass | None |
| Create Medicine Request | `MedicineRequestView` | Select medicine, enter quantity, submit | `offline_sync.spec.ts` | ✅ Pass | None |

### 2.8 Tasks (Phase 7)

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Tasks List | `TasksListView` | Shows pending/overdue/completed tasks | `phase7_tasks_notifications.spec.ts` | ✅ Pass | None |
| Complete Task | `TasksListView` | Mark task as completed | Manual | ✅ Works | None |

### 2.9 Notifications (Phase 7)

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Notification Center | `NotificationsView` | Lists all notifications with read/unread | `phase7_tasks_notifications.spec.ts` | ✅ Pass | None |
| Mark as Read | `NotificationsView` | Toggle read status | Manual | ✅ Works | None |

### 2.10 Reports (Phase 8)

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| ASHA Reports | `AshaReportView` | Date filters, stats, visit sparkline, CSV export | `phase8_reports.spec.ts` | ✅ Pass | None |
| CSV Export | `AshaReportView` | Downloads CSV with visit data | `phase8_reports.spec.ts` | ✅ Pass | None |

### 2.11 Profile

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| ASHA Profile | `AshaProfileView` | Shows name, village, language toggle | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Logout from Profile | `AshaProfileView` | Signs out, clears data | `auth_and_roles.spec.ts` | ✅ Pass | None |

## 3. Maternal & Child Tracking (Phase 6)

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Maternal Section | `MaternalSection` | Shows in female patient profile | `maternal_child.spec.ts` | ✅ Pass | None |
| Register Pregnancy | `MaternalSection` | Form: LMP, EDD, gravida, para, notes | Manual | ✅ Works | None |
| Pregnancy Status | `MaternalSection` | Active/completed/cancelled status tracking | Manual | ✅ Works | None |
| Child Tracking | `ChildTrackingSection` | Shows for children under 5 | Manual | ✅ Works | None |
| Gestational Age | `MaternalSection` | Calculates from LMP date | Manual | ✅ Works | None |

## 4. Supervisor Features

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Overview Stats | `SupervisorShell` (Overview tab) | ASHAs count, visits this week, pending follow-ups, referrals | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Activity Monitoring | `SupervisorShell` (Monitoring tab) | Recent visits, open referrals, pending follow-ups | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Maternal Overview | `SupervisorShell` (Maternal tab) | All active pregnancies in sector | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Medicine Approvals | `SupervisorMedicineView` | View/approve/reject medicine orders | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Supervisor Reports | `SupervisorReportView` | Sector-level analytics and CSV export | `phase10_qa_master.spec.ts` | ✅ Pass | None |

## 5. Manager Features

| Feature | View | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|------|-------------------|---------------|--------|--------------|
| Overview Stats | `ManagerShell` (Overview tab) | Pending requests, low stock, out of stock, fulfilled | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Requisitions Queue | `ManagerShell` (Requisitions tab) | All medicine orders with status badges | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Stock Management | `ManagerStockView` | View/adjust stock quantities | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Manager Reports | `ManagerReportView` | Facility-level operational reports | `phase10_qa_master.spec.ts` | ✅ Pass | None |

## 6. Offline-First / PWA (Phase 5)

| Feature | Component | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|-----------|-------------------|---------------|--------|--------------|
| Online Status Indicator | `ConnectionStatus` | Shows green online / red offline | `offline_sync.spec.ts` | ✅ Pass | None |
| Offline Banner | `OfflineBanner` | Shows warning when offline | `offline_sync.spec.ts` | ✅ Pass | None |
| IndexedDB Storage | `offlineDatabase.ts` | 13 Dexie tables for all entities | Code Review | ✅ Verified | None |
| Sync Queue | `syncManager.ts` | Enqueue/dequeue operations with dependency ordering | `offline_sync.spec.ts` | ✅ Pass | None |
| Offline Visit Creation | `dataService.createVisit` | Saves to IndexedDB + sync_queue when offline | `offline_sync.spec.ts` | ✅ Pass | None |
| Offline Medicine Request | `dataService.createMedicineOrder` | Saves locally when offline | `offline_sync.spec.ts` | ✅ Pass | None |
| Auto Sync on Reconnect | `syncManager.sync()` | Processes sync_queue when back online | Code Review | ✅ Verified | None |
| Duplicate Prevention | `syncManager` | Idempotency via client-generated UUIDs | Code Review | ✅ Verified | None |
| PWA Manifest | `vite.config.ts` | Name, icons, orientation, display:standalone | Code Review | ✅ Verified | None |
| Service Worker | Workbox via VitePWA | Precaches app shell, NetworkFirst for navigation | Build Output | ✅ Verified | None |
| Logout Cache Clear | `clearLocalDatabase()` | Wipes all 13 IndexedDB tables on sign out | `offline_sync.spec.ts` | ✅ Pass | None |

## 7. Cross-Cutting Concerns

| Feature | Component | Expected Behavior | Test Coverage | Status | Known Issues |
|---------|-----------|-------------------|---------------|--------|--------------|
| Bilingual (EN/HI) | `useLanguage`, `translations.ts` | Toggle English ↔ Hindi | Manual | ✅ Works | None |
| Input Validation | `validation.ts` | Zod schemas for forms | Code Review | ✅ Verified | None |
| Audit Logging | `auditLogger.ts` | Logs CRUD actions to `audit_logs` table | Code Review | ✅ Verified | None |
| Responsive Design | All views | Mobile-first with bottom nav | `phase10_qa_master.spec.ts` | ✅ Pass | None |
| Touch Targets | All buttons | Min 48px height | Code Review | ✅ Verified | None |

## 8. Database & Security

| Feature | Component | Expected Behavior | Status | Known Issues |
|---------|-----------|-------------------|--------|--------------|
| RLS on all tables | Supabase migrations | 14 tables with row-level security | ✅ Verified | None |
| Role-Based Access | `profiles.role` | ASHA sees own data, Supervisor sees sector, Manager sees PHC | ✅ Verified | None |
| Anon Key (not secret) | `.env` | Safe to expose — RLS enforces access | ✅ Correct | None |
| Migrations | 4 SQL files | Phase 1 foundation, Phase 5 maternal, Phase 7 tasks, Phase 8 indexes | ✅ Verified | None |

---

## Summary

| Category | Total Features | Tested (E2E) | Verified (Manual/Code) | Failing | Unknown |
|----------|---------------|-------------|----------------------|---------|---------|
| Auth & Authorization | 9 | 7 | 2 | 0 | 0 |
| ASHA Features | 29 | 16 | 13 | 0 | 0 |
| Maternal/Child | 5 | 1 | 4 | 0 | 0 |
| Supervisor | 5 | 5 | 0 | 0 | 0 |
| Manager | 4 | 4 | 0 | 0 | 0 |
| Offline/PWA | 11 | 5 | 6 | 0 | 0 |
| Cross-Cutting | 5 | 1 | 4 | 0 | 0 |
| Database/Security | 4 | 0 | 4 | 0 | 0 |
| **TOTAL** | **72** | **39** | **33** | **0** | **0** |
