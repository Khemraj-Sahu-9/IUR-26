-- Demo Users Seed Script (Phase 1)
-- Verified configuration matching GoTrue authentication format
--
-- Demo accounts:
--   ASHA:       asha.demo@gmail.com       / Password123!
--   Supervisor: supervisor.demo@gmail.com / Password123!
--   Manager:    manager.demo@gmail.com    / Password123!

-- 1. ASHA Demo User
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, confirmation_sent_at, recovery_token,
  email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, phone_change, phone_change_token,
  email_change_token_current, email_change_confirm_status,
  is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'asha.demo@gmail.com',
  '$2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2',
  now(),
  encode(gen_random_bytes(32), 'hex'), now(), '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"sub":"00000000-0000-0000-0001-000000000001","email":"asha.demo@gmail.com","full_name":"Sunita Devi","role":"asha","preferred_language":"hi"}'::jsonb,
  null, now(), now(), '', '', '', 0, false, false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- 2. Supervisor Demo User
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, confirmation_sent_at, recovery_token,
  email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, phone_change, phone_change_token,
  email_change_token_current, email_change_confirm_status,
  is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0002-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'supervisor.demo@gmail.com',
  '$2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2',
  now(),
  encode(gen_random_bytes(32), 'hex'), now(), '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"sub":"00000000-0000-0000-0002-000000000002","email":"supervisor.demo@gmail.com","full_name":"Dr. Anita Roy","role":"supervisor","preferred_language":"hi"}'::jsonb,
  null, now(), now(), '', '', '', 0, false, false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- 3. Manager Demo User
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, confirmation_sent_at, recovery_token,
  email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  created_at, updated_at, phone_change, phone_change_token,
  email_change_token_current, email_change_confirm_status,
  is_sso_user, is_anonymous
) VALUES (
  '00000000-0000-0000-0003-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'manager.demo@gmail.com',
  '$2a$10$ZcVdC7DFLedykS.yWA3xGeWCyxJnvhwhS1ZeL5frXEdL2LTsUe7k2',
  now(),
  encode(gen_random_bytes(32), 'hex'), now(), '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"sub":"00000000-0000-0000-0003-000000000003","email":"manager.demo@gmail.com","full_name":"Rajesh Sharma","role":"manager","preferred_language":"hi"}'::jsonb,
  null, now(), now(), '', '', '', 0, false, false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- Profiles
INSERT INTO public.profiles (id, full_name, phone, role, preferred_language, is_active)
VALUES
  ('00000000-0000-0000-0001-000000000001', 'Sunita Devi', '9876543210', 'asha', 'hi', true),
  ('00000000-0000-0000-0002-000000000002', 'Dr. Anita Roy', '9876543211', 'supervisor', 'hi', true),
  ('00000000-0000-0000-0003-000000000003', 'Rajesh Sharma', '9876543212', 'manager', 'hi', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();
