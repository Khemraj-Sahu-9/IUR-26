# ASHA Worker Digital Platform — Demo Video Timeline

**Reference Audio:** `uploaded_media_1790627822688.mp3`
**Audio Duration:** 04:38.31 (278.31 seconds)
**Target Resolution:** 1920 × 1080 (16:9, Desktop Frame with Centered Responsive App Viewport)
**Narrator:** ElevenLabs Voiceover (Reading `docs/application-breakdown-script.md`)

---

## High-Level Storyboard & Timeline

| Time Range | Duration | Chapter / Section | Screen / State | Primary Audio Narration Cue |
| :--- | :--- | :--- | :--- | :--- |
| **00:00 – 00:27** | 27s | Chapter 1: Introduction & Login Screen | Login Screen (`/`) | "This is the ASHA Worker Digital Platform... bilingual support... right here on the login screen" |
| **00:27 – 00:42** | 15s | Chapter 2: ASHA Worker Authentication | Login Screen ➔ Authenticating | "We tap the ASHA worker persona, Sunita Devi... identifies her role and loads her portal" |
| **00:42 – 01:16** | 34s | Chapter 3: ASHA Field Dashboard | ASHA Dashboard (`/home`) | "This is the ASHA dashboard... greeting, assigned ward, notification bell, live KPI cards, navigation tiles" |
| **01:16 – 01:30** | 14s | Chapter 4: Household & Family Members | Households List ➔ Household Details | "Here are all the households assigned... search by name or add a new family... family members" |
| **01:30 – 01:52** | 22s | Chapter 5: Patient Clinical Profile | Patient Profile (`/patient_profile`) | "The patient profile is the central hub... demographics, visit history, pregnancy tracking with gestational age" |
| **01:52 – 02:14** | 22s | Chapter 6: Clinical Visit Recording & Follow-up | Add Visit View (`/add_visit`) | "The visit form captures visit type... clinical notes, follow-up required... save the visit" |
| **02:14 – 02:28** | 14s | Chapter 7: Facility Referrals | Add Referral View (`/add_referral`) | "To create a referral, the ASHA enters destination facility, reason... tracked through statuses" |
| **02:28 – 02:39** | 11s | Chapter 8: Drug Kit & Medicine Requests | Drug Kit View (`/medicine_requests`) | "In the drug kit section, the ASHA sees current stock, submits refill request... enters queue" |
| **02:39 – 03:19** | 40s | Chapter 9: Sector Supervisor Portal | Supervisor Portal (`SupervisorShell`) | "Now we switch to the supervisor... Dr. Anita Roy... 5 tabs: overview, monitoring, maternal, medicines, reports" |
| **03:19 – 03:42** | 23s | Chapter 10: PHC Manager Portal | Manager Portal (`ManagerShell`) | "The PHC manager sees the administration portal... requisitions, manage stock, adjust inventory" |
| **03:42 – 04:00** | 18s | Chapter 11: Real Offline-First Operation | Offline Mode (`context.setOffline(true)`) | "We disconnect the device from the internet entirely... create household, patient, visit locally in IndexedDB" |
| **04:00 – 04:20** | 20s | Chapter 12: Automatic Topological Synchronization | Reconnect (`context.setOffline(false)`) | "Now we restore connectivity... sync engine activates automatically... dependency order... all synced" |
| **04:20 – 04:38** | 18s | Chapter 13: Closing & Operations Summary | Field Reports / Dashboard | "This platform digitalizes the complete rural healthcare workflow... keeps working when internet does not. Thank you." |

---

## Detailed Second-by-Second Synchronization Markers

* **00:00.00** — Video begins on clean Login screen (`ASHA Saathi | आशा साथी`).
* **00:17.00** — Narration: *"The entire interface works in English and Hindi, switchable at any time..."* ➔ Cursor moves to language selector in top header; switches to हिन्दी (`Hindi`), views translated UI.
* **00:23.00** — Narration: *"including right here on the login screen, before signing in."* ➔ Switches back to English.
* **00:27.00** — Narration: *"Let us start by logging in as an ASHA worker."* ➔ Cursor hovers over Quick Demo Personas.
* **00:30.00** — Narration: *"We tap the ASHA worker persona, Sunita Devi..."* ➔ Click on Sunita Devi card.
* **00:35.00** — Loading spinner (`Authenticating with Supabase...`).
* **00:42.00** — Narration: *"Show ASHA dashboard. This is the ASHA dashboard."* ➔ ASHA Field Dashboard renders cleanly.
* **00:46.00** — Narration: *"At the top, a personalized greeting shows her name, and assigned ward."* ➔ Banner visible ("Good Morning, Sunita Devi • Ward 4 (Rampur)").
* **00:50.00** — Narration: *"The notification bell shows unread alerts."* ➔ Subtle hover over notification icon.
* **00:54.00** — Narration: *"Below that, four live cards display today's visit count, pending follow ups, pending medicine requests, and patients needing attention."* ➔ Gentle scroll to highlight the 4 operational metric cards.
* **01:04.00** — Narration: *"Below the summary, four navigation tiles lead to households, patients, tasks, and the drug kit..."* ➔ Cursor hovers across the four tiles with live count badges.
* **01:12.00** — Narration: *"Quick action buttons let her register a new household, or patient immediately."* ➔ Highlights `+ Add Household` and `+ Add Patient` buttons.
* **01:16.00** — Narration: *"Household and patient. Here are all the households assigned to this ASHA worker."* ➔ Clicks `Households` navigation tile.
* **01:21.00** — Narration: *"She can search by name or add a new family."* ➔ Types into search bar or browses household cards.
* **01:24.00** — Narration: *"Open a household, open a patient."* ➔ Clicks first household card (Sharma household).
* **01:26.00** — Narration: *"Inside a household, we see the family members."* ➔ Shows list of family members.
* **01:28.00** — Narration: *"Tapping a patient opens their full profile."* ➔ Clicks patient card (Priya Sharma).
* **01:30.00** — Narration: *"The patient profile is the central hub. It shows demographics, visit history, pending follow ups, referrals..."* ➔ Scrolls smoothly down patient profile.
* **01:38.00** — Narration: *"and, for female patients, pregnancy tracking with gestational age."* ➔ Pauses on Maternal Care section (Active Pregnancy, LMP, EDD, Gestational Age: e.g., 24 weeks).
* **01:42.00** — Narration: *"For children, an immunization and growth tracking section appears."* ➔ Highlights child section badge.
* **01:47.00** — Narration: *"From here, the ASHA can record a visit, create a referral, or edit the patient's information."* ➔ Primary action buttons `Record Visit` and `Refer Patient` visible.
* **01:52.00** — Narration: *"Recording a visit."* ➔ Clicks `Record Visit` button.
* **01:54.00** — Narration: *"The visit form captures the visit type..."* ➔ Selects `Routine ANC` from dropdown.
* **02:01.00** — Narration: *"She selects the date, adds clinical notes..."* ➔ Date selected; types clinical notes: *"Routine 2nd Trimester ANC checkup. BP 118/76, fetal movement active. Dispensed IFA tablets."*
* **02:05.00** — Narration: *"and can optionally mark that a follow up is required."* ➔ Checks `Follow-up Required` checkbox; next follow-up date and note appear.
* **02:10.00** — Narration: *"Save the visit."* ➔ Clicks `Save Visit` button.
* **02:12.00** — Narration: *"The visit is saved, and the patient's history updates immediately."* ➔ Confirmation alert, redirects back to patient profile; visit history shows the newly logged encounter.
* **02:15.00** — Narration: *"Referral and medicines. To create a referral, the ASHA enters the destination facility, the reason for referral, and any notes."* ➔ Clicks `Refer Patient`, displays referral modal/form with destination facility dropdown.
* **02:24.00** — Narration: *"Referrals are tracked through statuses, referred, visited, admitted, discharged, or cancelled."* ➔ Closes referral form, shows existing referrals list with status badges.
* **02:29.00** — Narration: *"In the drug kit section, the ASHA sees her current medicine stock, and can submit a refill request."* ➔ Clicks back to home or bottom nav, opens `Drug Kit` (`MedicineRequestView`). Shows stock levels and pending requests.
* **02:35.00** — Narration: *"This request enters a queue visible to both the supervisor and the manager."* ➔ Displays submitted requests with `pending` badge.
* **02:40.00** — Narration: *"Supervisor portal. Log out to log in as Dr. Anita Roy, supervisor."* ➔ Clicks `Logout` in top header; returns to login screen.
* **02:44.00** — Narration: *"Now we switch to the supervisor."* ➔ Clicks `Dr. Anita Roy (Supervisor)` demo button.
* **02:47.00** — Narration: *"Dr. Anita Roy sees the sector supervision portal with five tabs. Overview, monitoring, maternal, medicines, and reports."* ➔ Supervisor shell loads with 5 tabs.
* **02:55.00** — Narration: *"The overview shows aggregated sector statistics, active ASHAs, weekly visits, pending follow ups, and open referrals."* ➔ Overview tab cards displayed with live metrics.
* **03:02.00** — Narration: *"The maternal tab lists all active pregnancies across the sector, showing each patient's LMP date, expected due date, and calculated gestational age."* ➔ Clicks `Maternal` tab. Displays list of active pregnancies with gestational age badges.
* **03:11.00** — Narration: *"On the medicines tab, the supervisor reviews and approves or rejects medicine requests submitted by ASHA workers."* ➔ Clicks `Medicines` tab. Shows ASHA requests with `Approve` and `Reject` buttons.
* **03:19.00** — Narration: *"Manager portal. Log out to log in as Rajesh Sharma, manager."* ➔ Clicks `Logout` in top header.
* **03:22.00** — Clicks `Rajesh Sharma (PHC Manager)` demo button on login screen.
* **03:24.00** — Narration: *"The PHC manager sees the administration portal with four tabs. Overview, requisitions, manage stock, and reports."* ➔ Manager shell loads with 4 tabs.
* **03:30.00** — Narration: *"The overview highlights pending requests, low stock items, out of stock items, and fulfilled orders this week."* ➔ Highlights inventory summary cards.
* **03:37.00** — Narration: *"The stock management tab lets the manager view and adjust inventory quantities for each medicine."* ➔ Clicks `Manage Stock` tab. Shows full medicine formulary with quantities and edit buttons.
* **03:42.00** — Narration: *"Offline demonstration. Now the most important demonstration."* ➔ Logout and switch back to ASHA Worker (Sunita Devi).
* **03:46.00** — Narration: *"We disconnect the device from the internet entirely."* ➔ DevTools network disabled (`context.setOffline(true)`).
* **03:48.00** — Narration: *"The application remains fully functional. Pause."* ➔ `SyncStatusBar` immediately switches to red: *"Offline — changes saved on this device"*.
* **03:52.00** — Narration: *"We create a new household, register a patient, and record a visit. All of this data is stored locally on the device using IndexedDB."* ➔ Navigates while offline, records offline visit; pending badge shows `1 pending change waiting to sync`.
* **04:01.00** — Narration: *"Now we restore connectivity."* ➔ DevTools network restored (`context.setOffline(false)`).
* **04:03.00** — Narration: *"The synchronization engine activates automatically."* ➔ Status bar pulses blue: *"Syncing changes..."*.
* **04:07.00** — Narration: *"It processes records in dependency order, households first, then patients, then visits, using unique identifiers that prevent any duplicate records."* ➔ Sync engine processes IndexedDB queue.
* **04:16.00** — Narration: *"All records have been uploaded. No data was lost, no duplicates were created."* ➔ Status bar turns green: *"All changes synced"*.
* **04:20.00** — Narration: *"Closing. This platform digitalizes the complete rural healthcare workflow, from the ASHA worker's daily field visits, through supervisor oversight, to PHC inventory management."* ➔ Navigates to ASHA Work Report view or Field Dashboard showing complete updated data.
* **04:31.00** — Narration: *"It captures structured data, coordinates across roles, and most importantly it keeps working when the internet does not. Thank you."* ➔ Steady view of the clean, synced platform dashboard as audio concludes at 04:38.31.
