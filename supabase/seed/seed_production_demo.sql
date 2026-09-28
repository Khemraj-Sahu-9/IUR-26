-- ==============================================================================
-- ASHA Saathi (आशा साथी) — Production Synthetic Demo Seed Script
-- File: supabase/seed/seed_production_demo.sql
-- Environment: DEMO DATA ONLY (No PII / PHI — 100% Synthetic Healthcare Data)
-- ==============================================================================

-- 1. Ensure Demo Authentication Users (GoTrue auth.users)
-- Passwords are set to: Password123! ($2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, confirmation_sent_at, recovery_token,
  email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, phone_change, phone_change_token,
  email_change_token_current, email_change_confirm_status,
  is_sso_user, is_anonymous
) VALUES
  (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'asha.demo@gmail.com',
    '$2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2',
    now(), encode(gen_random_bytes(32), 'hex'), now(), '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"00000000-0000-0000-0001-000000000001","email":"asha.demo@gmail.com","full_name":"Sunita Devi","role":"asha","preferred_language":"hi"}'::jsonb,
    null, now(), now(), '', '', '', 0, false, false
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'supervisor.demo@gmail.com',
    '$2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2',
    now(), encode(gen_random_bytes(32), 'hex'), now(), '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"00000000-0000-0000-0002-000000000002","email":"supervisor.demo@gmail.com","full_name":"Dr. Anita Roy","role":"supervisor","preferred_language":"hi"}'::jsonb,
    null, now(), now(), '', '', '', 0, false, false
  ),
  (
    '00000000-0000-0000-0003-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'manager.demo@gmail.com',
    '$2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2',
    now(), encode(gen_random_bytes(32), 'hex'), now(), '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"sub":"00000000-0000-0000-0003-000000000003","email":"manager.demo@gmail.com","full_name":"Rajesh Sharma","role":"manager","preferred_language":"hi"}'::jsonb,
    null, now(), now(), '', '', '', 0, false, false
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- 2. Profiles
INSERT INTO public.profiles (id, full_name, phone, role, preferred_language, is_active)
VALUES
  ('00000000-0000-0000-0001-000000000001', 'Sunita Devi', '9876543210', 'asha', 'hi', true),
  ('00000000-0000-0000-0002-000000000002', 'Dr. Anita Roy', '9876543211', 'supervisor', 'hi', true),
  ('00000000-0000-0000-0003-000000000003', 'Rajesh Sharma', '9876543212', 'manager', 'hi', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();

-- 3. ASHA Worker Record
INSERT INTO public.asha_workers (
  id, profile_id, employee_id, assigned_supervisor_id, village, sub_centre, phc_name, is_active
) VALUES (
  '00000000-0000-0000-0001-000000000010',
  '00000000-0000-0000-0001-000000000001',
  'ASHA-UP-2026-401',
  '00000000-0000-0000-0002-000000000002',
  'Rampur',
  'Rampur Sub-Centre',
  'North Block PHC',
  true
) ON CONFLICT (id) DO NOTHING;

-- 4. Synthetic Households
INSERT INTO public.households (
  id, household_code, head_of_family, address, village, ward, assigned_asha_id, created_at
) VALUES
  (
    'a1111111-1111-1111-1111-111111111101',
    'HH-2026-001',
    'Ram Prasad Sharma',
    'House 12, Main Street, Rampur',
    'Rampur',
    'Ward 4',
    '00000000-0000-0000-0001-000000000001',
    now() - interval '60 days'
  ),
  (
    'a1111111-1111-1111-1111-111111111102',
    'HH-2026-002',
    'Ramesh Verma',
    'Near Primary School, Rampur',
    'Rampur',
    'Ward 4',
    '00000000-0000-0000-0001-000000000001',
    now() - interval '45 days'
  ),
  (
    'a1111111-1111-1111-1111-111111111103',
    'HH-2026-003',
    'Devendra Patel',
    'Kisan Basti, Rampur',
    'Rampur',
    'Ward 4',
    '00000000-0000-0000-0001-000000000001',
    now() - interval '30 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Synthetic Patients
INSERT INTO public.patients (
  id, household_id, assigned_asha_id, patient_code, full_name,
  date_of_birth, gender, phone, address, relationship_to_head, status, created_at
) VALUES
  (
    'b2222222-2222-2222-2222-222222222201',
    'a1111111-1111-1111-1111-111111111101',
    '00000000-0000-0000-0001-000000000001',
    'PT-2026-0101',
    'Pooja Sharma',
    '2000-04-12',
    'female',
    '9811223344',
    'House 12, Main Street, Rampur',
    'Daughter-in-law',
    'active',
    now() - interval '50 days'
  ),
  (
    'b2222222-2222-2222-2222-222222222202',
    'a1111111-1111-1111-1111-111111111102',
    '00000000-0000-0000-0001-000000000001',
    'PT-2026-0102',
    'Aarav Verma',
    (CURRENT_DATE - interval '14 months')::date,
    'male',
    null,
    'Near Primary School, Rampur',
    'Son',
    'active',
    now() - interval '40 days'
  ),
  (
    'b2222222-2222-2222-2222-222222222203',
    'a1111111-1111-1111-1111-111111111103',
    '00000000-0000-0000-0001-000000000001',
    'PT-2026-0103',
    'Kavita Patel',
    '1996-08-20',
    'female',
    '9844556677',
    'Kisan Basti, Rampur',
    'Wife',
    'active',
    now() - interval '25 days'
  ),
  (
    'b2222222-2222-2222-2222-222222222204',
    'a1111111-1111-1111-1111-111111111102',
    '00000000-0000-0000-0001-000000000001',
    'PT-2026-0104',
    'Ramesh Verma',
    '1972-01-15',
    'male',
    '9899887766',
    'Near Primary School, Rampur',
    'Self',
    'active',
    now() - interval '45 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Maternal & Pregnancy Tracking (Pooja Sharma: 18 weeks pregnant)
INSERT INTO public.pregnancies (
  id, patient_id, status, lmp_date, expected_due_date, registration_date, gravida, para, notes, created_at
) VALUES (
  'c3333333-3333-3333-3333-333333333301',
  'b2222222-2222-2222-2222-222222222201',
  'active',
  (CURRENT_DATE - interval '126 days')::date, -- ~18 weeks GA
  (CURRENT_DATE + interval '154 days')::date, -- Naegele EDD (+280 total)
  (CURRENT_DATE - interval '40 days')::date,
  2,
  1,
  'Second pregnancy. Blood pressure 118/76 mmHg. Mild fatigue, prescribed daily IFA.',
  now() - interval '40 days'
) ON CONFLICT (id) DO NOTHING;

-- 7. Recent Home Visits
INSERT INTO public.visits (
  id, patient_id, asha_id, visit_date, visit_type, notes, follow_up_required, next_follow_up_date, created_at
) VALUES
  (
    'd4444444-4444-4444-4444-444444444401',
    'b2222222-2222-2222-2222-222222222201',
    '00000000-0000-0000-0001-000000000001',
    (CURRENT_DATE - interval '3 days')::date,
    'routine_anc',
    'Routine 2nd trimester ANC checkup. Advised nutritious diet and verified IFA consumption.',
    true,
    (CURRENT_DATE + interval '14 days')::date,
    now() - interval '3 days'
  ),
  (
    'd4444444-4444-4444-4444-444444444402',
    'b2222222-2222-2222-2222-222222222202',
    '00000000-0000-0000-0001-000000000001',
    (CURRENT_DATE - interval '7 days')::date,
    'immunization',
    'Administered Vitamin A dose 2. Growth parameters recorded: weight 9.4 kg.',
    false,
    null,
    now() - interval '7 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Follow-Ups (1 Pending, 1 Overdue, 1 Completed)
INSERT INTO public.follow_ups (
  id, patient_id, assigned_asha_id, due_date, status, notes, completed_at, created_at
) VALUES
  (
    'e5555555-5555-5555-5555-555555555501',
    'b2222222-2222-2222-2222-222222222201',
    '00000000-0000-0000-0001-000000000001',
    (CURRENT_DATE + interval '1 day')::date,
    'pending',
    'ANC check: Check hemoglobin test report and replenish IFA tablet blister.',
    null,
    now() - interval '5 days'
  ),
  (
    'e5555555-5555-5555-5555-555555555502',
    'b2222222-2222-2222-2222-222222222204',
    '00000000-0000-0000-0001-000000000001',
    (CURRENT_DATE - interval '2 days')::date,
    'pending', -- Overdue reminder for Hypertension review
    'Blood pressure re-check post primary health centre visit.',
    null,
    now() - interval '10 days'
  ),
  (
    'e5555555-5555-5555-5555-555555555503',
    'b2222222-2222-2222-2222-222222222203',
    '00000000-0000-0000-0001-000000000001',
    (CURRENT_DATE - interval '5 days')::date,
    'completed',
    'PNC visit day 14: Mother and infant both healthy. Breastfeeding verified.',
    now() - interval '5 days',
    now() - interval '12 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 9. Active Referral
INSERT INTO public.referrals (
  id, patient_id, asha_id, referred_to, reason, referral_date, status, notes, created_at
) VALUES (
  'f6666666-6666-6666-6666-666666666601',
  'b2222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0001-000000000001',
  'North Block PHC',
  '2nd Trimester Ultrasound & Tetanus Toxoid (TT2) Injection',
  (CURRENT_DATE - interval '1 day')::date,
  'referred',
  'Referred for routine anomaly ultrasound scan and institutional ANC registration.',
  now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;

-- 10. Medicines Catalog & Stock (with real Low-Stock simulation)
INSERT INTO public.medicines (id, name, generic_name, unit, active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Paracetamol 500mg', 'Paracetamol', 'tablets', true),
  ('11111111-1111-1111-1111-111111111102', 'ORS Sachet 20.5g', 'Oral Rehydration Salts', 'sachet', true),
  ('11111111-1111-1111-1111-111111111103', 'Iron Folic Acid (IFA)', 'Ferrous Sulphate + Folic Acid', 'tablets', true),
  ('11111111-1111-1111-1111-111111111104', 'Zinc Sulphate 20mg', 'Zinc Sulphate Dispersible', 'tablets', true),
  ('11111111-1111-1111-1111-111111111105', 'Albendazole 400mg', 'Albendazole Chewable', 'tablets', true),
  ('11111111-1111-1111-1111-111111111106', 'Nishchay Pregnancy Kit', 'hCG Test Strip', 'kit', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.medicine_stock (id, medicine_id, location, quantity, minimum_quantity) VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Central PHC Depot', 1850, 500),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Central PHC Depot', 45, 200), -- LOW STOCK!
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'Central PHC Depot', 2100, 400),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'Central PHC Depot', 0, 150),   -- OUT OF STOCK!
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'Central PHC Depot', 540, 100),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', 'Central PHC Depot', 120, 50)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  minimum_quantity = EXCLUDED.minimum_quantity,
  updated_at = now();

-- 11. Medicine Orders (Simulating the 3-tier Supply Chain)
INSERT INTO public.medicine_orders (
  id, asha_id, medicine_id, requested_quantity, approved_quantity,
  status, requested_at, reviewed_by, reviewed_at, created_at
) VALUES
  (
    -- 1 Pending request for Supervisor action (Dr. Anita Roy)
    '33333333-3333-3333-3333-333333333301',
    '00000000-0000-0000-0001-000000000001',
    '11111111-1111-1111-1111-111111111103', -- IFA Tablets
    60,
    null,
    'pending',
    now() - interval '6 hours',
    null,
    null,
    now() - interval '6 hours'
  ),
  (
    -- 1 Approved request ready for Manager fulfillment (Rajesh Sharma)
    '33333333-3333-3333-3333-333333333302',
    '00000000-0000-0000-0001-000000000001',
    '11111111-1111-1111-1111-111111111101', -- Paracetamol
    100,
    100,
    'approved',
    now() - interval '2 days',
    '00000000-0000-0000-0002-000000000002',
    now() - interval '1 day',
    now() - interval '2 days'
  ),
  (
    -- 1 Fulfilled historical request
    '33333333-3333-3333-3333-333333333303',
    '00000000-0000-0000-0001-000000000001',
    '11111111-1111-1111-1111-111111111106', -- Nishchay Kits
    25,
    25,
    'fulfilled',
    now() - interval '14 days',
    '00000000-0000-0000-0002-000000000002',
    now() - interval '13 days',
    now() - interval '14 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 12. Unified Tasks (Phase 7)
INSERT INTO public.tasks (
  id, assigned_to, task_type, source_type, source_id, patient_id,
  title, description, due_date, priority, status, created_at
) VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    '00000000-0000-0000-0001-000000000001',
    'anc_visit',
    'pregnancy',
    'c3333333-3333-3333-3333-333333333301',
    'b2222222-2222-2222-2222-222222222201',
    'Pooja Sharma — High-Risk ANC Visit 2',
    'Follow up on blood pressure, hemoglobin testing, and verify IFA adherence.',
    CURRENT_DATE,
    'priority',
    'pending',
    now() - interval '2 days'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '00000000-0000-0000-0001-000000000001',
    'immunization',
    'patient',
    'b2222222-2222-2222-2222-222222222202',
    'b2222222-2222-2222-2222-222222222202',
    'Aarav Verma — DPT Booster Due',
    'Confirm child vaccination at upcoming Village Health and Nutrition Day (VHND).',
    (CURRENT_DATE + interval '3 days')::date,
    'normal',
    'pending',
    now() - interval '1 day'
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    '00000000-0000-0000-0001-000000000001',
    'follow_up',
    'follow_up',
    'e5555555-5555-5555-5555-555555555502',
    'b2222222-2222-2222-2222-222222222204',
    'Ramesh Verma — Hypertension Follow-up [OVERDUE]',
    'Overdue home visit to monitor blood pressure compliance.',
    (CURRENT_DATE - interval '2 days')::date,
    'priority',
    'pending',
    now() - interval '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 13. Notifications
INSERT INTO public.notifications (
  id, recipient_profile_id, title, message, type, is_read, created_at, source_type, source_id
) VALUES
  (
    '55555555-5555-5555-5555-555555555501',
    '00000000-0000-0000-0001-000000000001',
    'Drug Kit Order Approved',
    'Dr. Anita Roy approved your request for 100 units of Paracetamol 500mg.',
    'approval',
    false,
    now() - interval '1 day',
    'medicine_order',
    '33333333-3333-3333-3333-333333333302'
  ),
  (
    '55555555-5555-5555-5555-555555555502',
    '00000000-0000-0000-0001-000000000001',
    'High-Priority ANC Visit Scheduled',
    'Pooja Sharma (HH-2026-001) has an ANC checkup due today.',
    'alert',
    false,
    now() - interval '3 hours',
    'task',
    '44444444-4444-4444-4444-444444444401'
  )
ON CONFLICT (id) DO NOTHING;
