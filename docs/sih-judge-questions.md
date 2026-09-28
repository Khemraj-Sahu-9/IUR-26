# ASHA Worker Digital Platform - SIH Judge Q&A Guide

## 1. How does your offline sync handle conflicts? For example, if two people edit the same patient offline?
**Answer:**
In our current architecture, data ownership is strictly partitioned by role. An ASHA worker is the sole owner and editor of her assigned households and patients. Supervisors and Managers have read-only access to patient data, eliminating the possibility of write-write conflicts on the same record from different devices. For offline creation, we use client-generated UUIDs, which guarantees that when data is eventually synced, it is perfectly idempotent and will not create duplicate entries even if network requests are retried.

## 2. What happens if the ASHA worker loses her phone? Is the data safe?
**Answer:**
Yes, the data is safe. The application requires authentication (via secure JWT tokens) to access. If the phone is lost, the session can be invalidated centrally by an administrator. Furthermore, because data is synced to our Supabase PostgreSQL backend as soon as connectivity is restored, the maximum data at risk is only what was collected during the current offline session. No other patient data outside her sector is stored on her device.

## 3. How do you ensure the app performs well on low-end smartphones?
**Answer:**
We built the application as a Progressive Web Application (PWA) using Vite, which yields highly optimized, minified bundles. We use Tailwind CSS to keep styling overhead low. Most importantly, by caching the app shell using Service Workers, the application loads instantly without waiting for network requests. Data operations are performed locally against IndexedDB (via Dexie.js), making the UI extremely responsive regardless of the device's processing power.

## 4. Why did you choose Supabase over Firebase or custom backend?
**Answer:**
We chose Supabase because it provides a true relational PostgreSQL database, which is essential for complex healthcare data (households -> patients -> visits -> pregnancies). It allows us to enforce strict data integrity through foreign keys and Row Level Security (RLS) policies directly at the database level. This level of relational structure and security is much harder to implement robustly in a NoSQL database like Firebase.

## 5. How did you test the reliability of this application?
**Answer:**
We implemented a robust automated testing suite using Playwright. We currently have 84 End-to-End (E2E) tests that cover all critical workflows, including authentication, role isolation, offline data creation, and synchronization algorithms. These tests run in a simulated offline browser environment to guarantee our sync logic behaves exactly as expected before any code is deployed.

## 6. Are there any actual APIs or ML models used in this current version?
**Answer:**
Currently, our focus has been on building an incredibly resilient, offline-first data capture ecosystem. We are not using external ML models yet, as our immediate goal was to solve the critical infrastructure problem of paper-based data loss in zero-connectivity areas. However, because our data is now cleanly structured in a centralized PostgreSQL database, adding predictive analytics (e.g., flagging high-risk pregnancies) is a straightforward future enhancement.

## 7. How does the language switching work, and does it require the internet?
**Answer:**
The language switching is handled completely on the client side using our custom React context and translation dictionaries. The English and Hindi translations are bundled within the application. Therefore, switching languages is instantaneous, does not require a page reload, and works perfectly when the device is completely offline.

## 8. Can a Supervisor edit patient records?
**Answer:**
No. Based on our Role-Based Access Control (RBAC) and Row Level Security (RLS) policies, Supervisors have read-only access to field data. Their role is to monitor activity, review reports, and approve medicine requests. Only the assigned ASHA worker can create or edit patient and visit records, ensuring strict accountability and a clear chain of custody for the data.
