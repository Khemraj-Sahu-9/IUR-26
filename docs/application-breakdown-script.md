# ASHA Worker Digital Platform — Demo Narration Script

**VERSION B — Screen-by-Screen Demo Narration**
**Target Duration: ~4–5 minutes (~700 words)**

---

## OPENING

`[Show Login Screen]`

This is the ASHA Worker Digital Platform — a mobile-first Progressive Web App built to digitize rural healthcare field operations. It supports three roles: the ASHA field worker, a Sector Supervisor, and a PHC Manager. The entire interface works in English and Hindi, switchable at any time — including right here on the login screen, before signing in.

Let us start by logging in as an ASHA worker.

---

## LOGIN AND DASHBOARD

`[Tap Sunita Devi — ASHA Worker persona]`

We tap the ASHA worker persona — Sunita Devi — and the system authenticates through Supabase, retrieves her profile from the database, identifies her role, and loads her Field Worker Portal.

`[Show ASHA Dashboard]`

This is the ASHA dashboard. At the top, a personalized greeting shows her name and assigned ward. The notification bell shows unread alerts. Below that, four live cards display today's visit count, pending follow-ups, pending medicine requests, and patients needing attention. These numbers are pulled directly from the database.

Below the summary, four navigation tiles lead to Households, Patients, Tasks, and the Drug Kit — each with live counts. Quick-action buttons let her register a new household or patient immediately.

---

## HOUSEHOLD AND PATIENT

`[Tap Households tile]`

Here are all the households assigned to this ASHA worker. She can search by name or add a new family.

`[Open a Household → Open a Patient]`

Inside a household, we see the family members. Tapping a patient opens their full profile.

`[Show Patient Profile]`

The patient profile is the central hub. It shows demographics, visit history, pending follow-ups, referrals, and — for female patients — pregnancy tracking with gestational age. For children, an immunization and growth tracking section appears. From here, the ASHA can record a visit, create a referral, or edit the patient's information.

---

## RECORDING A VISIT

`[Tap Record Visit]`

The visit form captures the visit type — Routine ANC, Post-Natal Care, Immunization, General Checkup, and others. She selects the date, adds clinical notes, and can optionally mark that a follow-up is required. If she does, the system automatically schedules a follow-up with a due date.

`[Save the Visit]`

The visit is saved and the patient's history updates immediately.

---

## REFERRAL AND MEDICINES

`[Tap Refer Patient]`

To create a referral, the ASHA enters the destination facility, the reason for referral, and any notes. Referrals are tracked through statuses: referred, visited, admitted, discharged, or cancelled.

`[Navigate to Drug Kit]`

In the Drug Kit section, the ASHA sees her current medicine stock and can submit a refill request. This request enters a queue visible to both the Supervisor and the Manager.

---

## SUPERVISOR PORTAL

`[Logout → Login as Dr. Anita Roy — Supervisor]`

Now we switch to the Supervisor. Dr. Anita Roy sees the Sector Supervision Portal with five tabs: Overview, Monitoring, Maternal, Medicines, and Reports.

`[Show Overview Tab]`

The overview shows aggregated sector statistics — active ASHAs, weekly visits, pending follow-ups, and open referrals.

`[Tap Maternal Tab]`

The Maternal tab lists all active pregnancies across the sector, showing each patient's LMP date, expected due date, and calculated gestational age.

`[Tap Medicines Tab]`

On the Medicines tab, the Supervisor reviews and approves or rejects medicine requests submitted by ASHA workers.

---

## MANAGER PORTAL

`[Logout → Login as Rajesh Sharma — Manager]`

The PHC Manager sees the Administration Portal with four tabs: Overview, Requisitions, Manage Stock, and Reports.

`[Show Overview]`

The overview highlights pending requests, low-stock items, out-of-stock items, and fulfilled orders this week.

`[Tap Manage Stock]`

The stock management tab lets the Manager view and adjust inventory quantities for each medicine.

---

## OFFLINE DEMONSTRATION

`[EMPHASIZE]`

Now, the most important demonstration.

`[Turn Internet OFF — Airplane Mode]`

We disconnect the device from the internet entirely. The application remains fully functional. [PAUSE]

`[Create a new Household → Add a Patient → Record a Visit — all offline]`

We create a new household, register a patient, and record a visit. All of this data is stored locally on the device using IndexedDB.

`[Turn Internet ON]`

Now we restore connectivity. The synchronization engine activates automatically. It processes records in dependency order — households first, then patients, then visits — using unique identifiers that prevent any duplicate records.

`[Show Sync Complete]`

All records have been uploaded. No data was lost. No duplicates were created.

---

## CLOSING

`[PAUSE]`

This platform digitizes the complete rural healthcare workflow — from the ASHA worker's daily field visits, through supervisor oversight, to PHC inventory management. It captures structured data, coordinates across roles, and most importantly, it keeps working when the internet does not.

Thank you.
