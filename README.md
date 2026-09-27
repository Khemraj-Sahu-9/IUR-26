# ASHA Saathi (आशा साथी) — Offline-First Digital Field Platform

An offline-first, mobile-first progressive web application (PWA) designed to empower Accredited Social Health Activists (ASHA workers) across India to digitize maternal care, child immunization, household surveys, home visits, and drug kit inventory workflows.

---

## 🌟 Key Capabilities
- 📱 **Mobile-First Ergonomics**: Designed for budget smartphones with minimum 48px touch targets, high contrast, and minimal typing.
- ⚡ **True Offline-First**: Powered by IndexedDB and background Sync Engine. Fully functional without internet connectivity.
- 🔄 **Idempotent Auto-Sync**: Automatically reconciles local field records with the cloud backend when connectivity is restored without duplicates.
- 🔒 **Healthcare Security & RLS**: Strict PostgreSQL Row Level Security (RLS) guaranteeing data segregation between villages and sectors.
- 🌐 **Multilingual Ready**: Built-in support for English and Hindi (`हिन्दी`), architected for easy expansion to Marathi and Chhattisgarhi.
- 💊 **Closed-Loop Supply Chain**: ASHA drug kit stock tracking, digital refill requests, supervisor approvals, and PHC inventory tracking.

---

## 🏗️ Architecture & Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Local Persistence & Offline**: IndexedDB (Dexie.js), Service Worker (PWA)
- **Cloud Backend**: Supabase (PostgreSQL 17, Row Level Security, Supabase Auth)
- **End-to-End Testing**: Playwright Mobile Viewport Test Suite
- **Deployment**: Vercel / Netlify + Supabase

---

## 📂 Documentation Directory
- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database.md)
- [Security & Access Control](docs/security.md)
- [Offline-Sync Engine](docs/offline-sync.md)
- [Hackathon Demo Choreography](docs/demo.md)

---

## 👥 Personas & Roles
1. **ASHA Worker**: Daily visits, household registrations, maternal & child tracking, medicine refill requests.
2. **Supervisor**: Field monitoring, ASHA oversight, medicine request approval/rejection.
3. **PHC Manager**: Drug inventory management, aggregated facility reporting, sector supply distribution.
