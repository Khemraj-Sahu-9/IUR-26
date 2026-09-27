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

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9+

### 2. Installation
```bash
git clone <repository-url>
cd "IUR 26"
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` (or `.env.local`):
```bash
cp .env.example .env
```
Ensure your Supabase project parameters are populated:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm run preview
```

### 6. Run Automated Playwright Tests
```bash
npm run test:e2e
```

---

## 👥 Demo Personas (1-Tap Fast Testing)

For judging, demonstrations, and E2E testing, 1-tap demo personas are available on the login screen:

| Role | Demo Persona | Email | Assigned Scope |
|---|---|---|---|
| **ASHA Worker** | Sunita Devi | `asha.sunita@demo.phc.in` | Ward 4 (Rampur Village) |
| **Supervisor** | Dr. Anita Roy | `supervisor.anita@demo.phc.in` | North Block PHC Sector |
| **PHC Manager** | Rajesh Sharma | `manager.rajesh@demo.phc.in` | Central Health Centre Depot |

---

## 📂 Documentation Directory
- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database.md)
- [Security & Access Control](docs/security.md)
- [Offline-Sync Engine](docs/offline-sync.md)
- [Hackathon Demo Choreography](docs/demo.md)
