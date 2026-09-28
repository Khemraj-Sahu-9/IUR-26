# ASHA Saathi (आशा साथी) — Known Limitations & Technical Boundaries

> **Phase 12 Architectural Transparency Document**  
> **Target Release**: v1.0.0-hackathon (RC-1 Verified)

To ensure technical and clinical integrity, this document transparently states the known boundaries, edge cases, and scope limitations of the current Minimum Viable Product (MVP).

---

## 1. Storage & Browser Limitations

### 1.1 iOS Safari 7-Day Storage Cap (ITP)
- **Constraint**: Apple's WebKit Intelligent Tracking Prevention (ITP) purges script-writable client storage (including IndexedDB) after 7 days of user inactivity if opened through the regular browser.
- **Mitigation / Workaround**: When installed to the Home Screen as a standalone PWA via Safari's "Share -> Add to Home Screen", WebKit exempts the origin from the 7-day eviction rule, allowing permanent local storage.
- **Production Recommendation**: Field workers on iOS devices must install the application to the Home Screen during initial onboarding.

### 1.2 Storage Quota on Budget Android Devices
- **Current Behavior**: Dexie.js relies on Chromium's transient storage quota (typically 10%–20% of free disk space, minimum 50MB).
- **Scale Limitation**: While 50MB is sufficient for over 100,000 JSON text records, storing raw binary attachments (such as high-resolution ultrasound scans or paper register photos) would rapidly exhaust device storage.
- **Current Scope**: The MVP purposefully restricts data entry to structured medical fields and notes; file/photo attachments are deferred to Phase 13+.

---

## 2. Synchronization & Conflict Handling

### 2.1 Partition-Tolerant Last-Write-Wins
- **Current Behavior**: Because each patient and household is explicitly assigned to a single designated ASHA worker (`assigned_asha_id`), concurrent conflicting edits by multiple field workers on the same patient are structurally impossible in standard operation.
- **Limitation**: If a Supervisor updates patient notes while the assigned ASHA is simultaneously updating the patient offline, the synchronization engine applies a field-scoped "Last Write Wins" rule based on server arrival time. Three-way interactive git-style branch merge resolution is not implemented in the MVP.

### 2.2 Offline Deletions
- **Current Scope**: The MVP intentionally disables hard record deletion (`DELETE`) from the mobile interface. Records can only transition status (e.g. `active` → `migrated` or `deceased`). This eliminates tombstone synchronization complexity and prevents accidental data destruction in disconnected environments.

---

## 3. Notifications & Device Hardware

### 3.1 In-App Notification Center vs. Native Web Push
- **Current Behavior**: Notifications for task reminders, medicine approvals, and overdue visits are delivered through the in-app Notification Center and global status bar.
- **Limitation**: Native OS push notifications when the browser app is completely closed are not active in this release because they require a dedicated Web Push VAPID server infrastructure and background worker daemon.
- **Roadmap**: Native VAPID Web Push is scheduled for pilot deployment in Phase 13.

### 3.2 Diagnostic Device Bluetooth Pairing
- **Current Scope**: Blood pressure, pulse oximetry, and blood glucose values are manually entered by the ASHA using validated numeric inputs. Direct Web Bluetooth hardware pairing with digital cuffs is architected but not enabled in the current software build.

---

## 4. Scalability & National Ecosystem Integration

### 4.1 ABDM / ABHA Integration
- **Current Scope**: Patients are identified via unique, formatted local clinic codes (`PT-2026-XXXX`).
- **Next Phase Integration**: Direct federation with the Ayushman Bharat Digital Mission (ABDM) sandbox to query and link Ayushman Bharat Health Account (ABHA) 14-digit IDs will be implemented in subsequent releases following government sandbox API approval.

### 4.2 Multi-State Localization
- **Current Scope**: Complete runtime bilingual support for English and Hindi (`हिन्दी`).
- **Roadmap**: Translation architecture is fully decoupled in [`src/locales/translations.ts`](file:///Users/khemrajsahu/Downloads/IUR%2026%20/src/locales/translations.ts). Regional state language packs (Marathi, Chhattisgarhi, Bengali, Odia) require only dictionary entries and no architectural modifications.
