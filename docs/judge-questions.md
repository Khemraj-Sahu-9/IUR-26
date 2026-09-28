# ASHA Saathi (आशा साथी) — Judge Q&A Defense Guide

> **Preparation for Hackathon Technical & Clinical Judging**  
> Factual, technically precise, and transparent answers to expected questions.

---

### Q1: Why did you build this as "Offline-First" rather than adding an offline cache later?
**Answer**:  
Frontline health workers operate in rural, forested, and high-density slum environments where cellular signals drop frequently or don't exist inside concrete homes. In traditional "online-first" apps, network drops lead to failed requests, frozen screens, and lost field inputs.  
By building offline-first from day one, all write operations go directly to client-side IndexedDB (via Dexie.js). The app responds instantly (sub-50ms) regardless of connectivity. Synchronization is treated as an autonomous background process rather than a blocking prerequisite for data entry.

---

### Q2: What happens when the internet connection returns?
**Answer**:  
The `connectivityService` continuously monitors network state through active heartbeat probes (`HEAD` requests to the REST endpoint) rather than relying solely on `navigator.onLine` (which can be falsely positive on captive portals).  
When reachability is re-established:
1. The `syncManager` acquires a local lock to prevent race conditions.
2. It inspects the `sync_queue` in IndexedDB.
3. Operations are executed sequentially according to their foreign key dependency tree: `households` first, then `patients`, then `visits` / `follow_ups` / `referrals`, and finally `medicine_orders`.
4. As each item succeeds on Supabase, its local status transitions from `pending` to `synced`.

---

### Q3: How do you prevent duplicate records when syncing after a reconnect?
**Answer**:  
Every record created offline is assigned a stable client-generated UUID (`crypto.randomUUID()`) at the moment of creation. This UUID serves as both the primary key in IndexedDB and the idempotency token on the server.  
When syncing to Supabase, the engine uses PostgreSQL `UPSERT` semantics (`INSERT ... ON CONFLICT (id) DO UPDATE ...`). If a network connection drops halfway through a sync and retries, the server recognizes the UUID and updates the existing row instead of creating a duplicate.

---

### Q4: How do you protect patient information (PHI) on shared devices?
**Answer**:  
In Indian Primary Health Centres, smartphones and tablets are frequently shared across rotating shifts. ASHA Saathi employs a multi-layered privacy approach:
1. **Sign-out Purge**: When a worker signs out, `useAuth` invokes `clearLocalDatabase()`, which atomically wipes all 13 IndexedDB stores and clears session storage. The next worker cannot view previous patient records on that device.
2. **Data Minimization**: Audit logs and sync queue payloads strictly exclude sensitive clinical notes and passwords.
3. **Database RLS**: Records are segregated in PostgreSQL by role and village ward.

---

### Q5: How does Row Level Security (RLS) work in your architecture?
**Answer**:  
Every HTTP request to Supabase carries the authenticated user's JWT. In PostgreSQL, RLS policies evaluate `auth.uid()` against our custom `get_current_role()` security definer function:
- **ASHA Workers**: Can only read and write records where `assigned_asha_id = auth.uid()`.
- **Supervisors**: Can read all records within their assigned sector PHC and approve medicine orders.
- **Managers**: Can view and update central medicine inventory and fulfill orders.  
Even if a malicious actor attempted to invoke the REST API directly with another patient's ID, the PostgreSQL engine rejects the query at the database level.

---

### Q6: What happens if two users edit the same record simultaneously (Conflict Handling)?
**Answer**:  
In ASHA field operations, data ownership is naturally partition-tolerant: each patient is explicitly assigned to a single designated ASHA worker, so two ASHAs almost never edit the same patient concurrently.  
For collaborative workflows (e.g. ASHA requests a medicine refill and Supervisor reviews it):
- The ASHA initiates the record with status `pending`.
- The Supervisor transitions the record to `approved` or `rejected`.
- The system employs a "Last Write Wins with Field-Level Scoping" strategy: the review timestamp and reviewer ID are recorded, preventing state overwrites.

---

### Q7: Why did you choose Supabase over a custom Node/Express backend?
**Answer**:  
1. **Security at the Data Layer**: Supabase allows us to write security rules directly in SQL via PostgreSQL Row Level Security (RLS), eliminating an entire class of backend API authorization bugs.
2. **Speed of Development**: Instant PostgREST APIs allowed us to dedicate 100% of our engineering effort to the complex offline sync engine, clinical validations, and mobile UX.
3. **Reliability & Scalability**: Supabase provides enterprise-grade PostgreSQL with automatic backups, connection pooling, and real-time event streaming.

---

### Q8: Why did you build a Progressive Web Application (PWA) instead of a native Android app?
**Answer**:  
1. **Zero App Store Barrier**: ASHAs can access the app immediately via a short link or QR code without requiring a Google Play account or 50MB app store downloads.
2. **Instant Upgrades**: When a new version is released, the Workbox Service Worker updates the app shell automatically on the next launch (`max-age=0` headers on `sw.js`).
3. **Lightweight Footprint**: The entire precached production bundle is just ~202 KB gzipped, running smoothly on sub-₹8,000 Android devices with 2GB of RAM.
4. **Cross-Platform**: Operates identically on Android Chrome, desktop browsers at the PHC, and iOS devices.

---

### Q9: How would this platform scale to a full state or national rollout?
**Answer**:  
1. **Database Sharding & Tenant Segregation**: PostgreSQL tables can be partitioned by District or State Health Society (`state_code`, `district_id`).
2. **CDN Caching**: Static PWA assets are served via edge CDN (Vercel Edge / Cloudflare), offloading 99% of frontend traffic.
3. **Connection Pooling**: Supabase PgBouncer connection pooling comfortably handles tens of thousands of concurrent sync pulses.

---

### Q10: What would you build next (Phase 13+)?
**Answer**:  
1. **ABDM / ABHA Integration**: Linking patient profiles to the Ayushman Bharat Health Account (ABHA) national digital health IDs.
2. **Regional Languages**: Expanding beyond English and Hindi into Marathi, Chhattisgarhi, Odia, and Tamil.
3. **Non-Invasive Diagnostic Bluetooth Pairing**: Connecting via Web Bluetooth to digital blood pressure monitors and pulse oximeters.

---

### Q11: What are the current MVP limitations?
**Answer**:  
1. **Push Notifications**: Relies on an in-app Notification Center because native Web Push requires VAPID server configuration and background notification permissions.
2. **iOS Safari Storage Cap**: iOS enforces a 7-day storage cap on uninstalled PWAs (resolved when the user taps "Add to Home Screen").
3. **Automated Conflict Resolution**: Deep branch merges are not implemented; field-partitioned ownership is used instead.
