-- ==============================================================================
-- ASHA Saathi (आशा साथी) — Production Demo Data Reset Script
-- File: supabase/seed/reset_demo_data.sql
-- Purpose: Safely purge transient transactional records and re-seed clean synthetic data
-- ==============================================================================

BEGIN;

-- 1. Clean transient transactional entities in relational dependency order
DELETE FROM public.tasks;
DELETE FROM public.notifications;
DELETE FROM public.medicine_orders;
DELETE FROM public.referrals;
DELETE FROM public.follow_ups;
DELETE FROM public.visits;
DELETE FROM public.pregnancies;
DELETE FROM public.patients;
DELETE FROM public.households;

-- 2. Reset central medicine stock quantities to standard baseline
UPDATE public.medicine_stock SET quantity = 1850 WHERE id = '22222222-2222-2222-2222-222222222201'; -- Paracetamol
UPDATE public.medicine_stock SET quantity = 45   WHERE id = '22222222-2222-2222-2222-222222222202'; -- ORS (Low Stock)
UPDATE public.medicine_stock SET quantity = 2100 WHERE id = '22222222-2222-2222-2222-222222222203'; -- IFA
UPDATE public.medicine_stock SET quantity = 0    WHERE id = '22222222-2222-2222-2222-222222222204'; -- Zinc (Out of Stock)
UPDATE public.medicine_stock SET quantity = 540  WHERE id = '22222222-2222-2222-2222-222222222205'; -- Albendazole
UPDATE public.medicine_stock SET quantity = 120  WHERE id = '22222222-2222-2222-2222-222222222206'; -- Pregnancy Kits

COMMIT;

-- 3. Execute synthetic seed to restore fresh initial demo state
\i supabase/seed/seed_production_demo.sql;
