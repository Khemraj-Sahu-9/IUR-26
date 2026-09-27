---
name: healthcare-data-model
description: Data modeling standards and schema integrity rules for maternal, child, community health, and logistics.
---

# Healthcare Data Model Guidelines

## Purpose
Guide the schema structure, column types, relationship integrity, and normal forms for community healthcare, maternal-child tracking, and health commodities.

## When to Use
Use when writing database migrations, defining TypeScript interfaces, formulating local schema tables, and designing sync payloads.

## Key Modeling Principles
1. **Identities & Primary Keys**:
   - Use `UUID` (v4) for all primary keys to guarantee distributed unique generation during offline writes.
2. **Entity Hierarchies**:
   - `households` (1) ───< `patients` (many)
   - `patients` (1) ───< `pregnancies` (many)
   - `patients` (mother: 1) ───< `children` (many)
   - `patients` (1) ───< `visits` (many)
   - `patients` (1) ───< `follow_ups` (many)
   - `patients` (1) ───< `referrals` (many)
3. **Maternal Care Modeling**:
   - `pregnancies`: `id`, `patient_id`, `lmp_date` (Last Menstrual Period), `edd_date` (Estimated Due Date = LMP + 280 days), `gravida`, `para`, `high_risk_flags` (array or JSONB), `status` (`active`, `delivered`, `miscarriage`).
4. **Child Care Modeling**:
   - `children`: `id`, `patient_id`, `mother_id`, `dob`, `gender`, `birth_weight_kg`, `immunization_records` (JSONB or relation), `delivery_type` (`institutional`, `home`).
5. **Medicine Requisition & Inventory**:
   - `medicines`: Standard catalog (name, unit, standard_dosage, min_threshold).
   - `medicine_stock`: Location-specific stock levels (ASHA kit vs PHC warehouse).
   - `medicine_orders`: Status transitions (`pending` -> `approved` -> `fulfilled` / `rejected`).
6. **Audit & Synchronization**:
   - Standard audit columns on all tables: `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `created_by` (UUID).
   - Offline sync fields: `client_created_at`, `sync_status`.

## Quality Checklist
- [ ] Foreign keys have appropriate ON DELETE constraints (e.g., RESTRICT or CASCADE where safe).
- [ ] Dates use ISO 8601 formatting (`YYYY-MM-DD` or TIMESTAMPTZ).
- [ ] Types are shared consistently between PostgreSQL schemas and TypeScript interfaces.
