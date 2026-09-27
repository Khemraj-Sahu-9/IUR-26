---
name: hackathon-demo
description: Rapid demo execution scripts, seed data strategies, and presentation choreography for hackathon judging.
---

# Hackathon Demo Choreography & Pitch Readiness

## Purpose
Structure the end-to-end demo flow, seeded realistic data, and interactive presentation to deliver an unforgettable 3-5 minute live demonstration to judges.

## When to Use
Use when preparing seed data, recording screen demos, rehearsing user flows, and scripting live presentations.

## 3-Minute Demo Choreography
1. **The Hook (30s) — The Problem**:
   - Contrast heavy paper registers (RCH register, visit diary, paper slips) with the mobile-first ASHA platform.
   - Show quick language switch (English <-> Hindi) for grassroots accessibility.
2. **Field Action (90s) — ASHA Workflow**:
   - Login as ASHA ("Sunita Devi").
   - Quick search or register household in "Ward 4".
   - Open Pregnant Patient profile ("Pooja Sharma", ANC Month 5).
   - Log ANC visit with high-risk check (normal BP, IFA given, next visit scheduled).
   - Check ASHA drug kit: Notice low ORS / Paracetamol -> 1-tap "Request Refill" (10 strips).
3. **Supervisor Collaboration (45s) — Real-Time Approvals**:
   - Switch tabs to Supervisor view ("Dr. Anita / Supervisor").
   - Review pending medicine order -> Approve with 1 tap.
   - Switch back to ASHA -> Instant notification pill "Order Approved".
4. **The Clincher (45s) — The Zero-Connectivity Test**:
   - Toggle browser DevTools network to "Offline" (or physical Airplane mode).
   - Notice persistent amber indicator: "⚡ Offline Mode - Saving to Local Device".
   - Register a new child ("Aarav", 6 weeks, OPV-1 due).
   - Show badge: "Pending Sync (1)".
   - Toggle network back "Online" -> Sync engine triggers immediately -> Green "Synced" badge appears with toast.
5. **Impact Summary (15s)**:
   - Zero lost records, zero paperwork, 100% field-ready.

## Quality Checklist
- [ ] Pre-seeded realistic demo data (households, maternal cases, drug items) loaded by default.
- [ ] Role switcher / quick demo login buttons available in development mode for instant role flipping.
- [ ] Visual network toggle for live presentation without breaking browser tabs.
