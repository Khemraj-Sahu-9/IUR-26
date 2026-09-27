-- Phase 1: Database Foundation, Schema, and Row Level Security (RLS)
-- Enables strict UUID primary keys, role-based checks, and healthcare audit logging

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS FOR USER ROLES
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('asha', 'supervisor', 'manager')),
  preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('en', 'hi', 'mr', 'cg')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create profile automatically on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Healthcare Worker'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'asha'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'hi')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    preferred_language = EXCLUDED.preferred_language,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ASHA WORKERS TABLE
CREATE TABLE IF NOT EXISTS public.asha_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  employee_id TEXT UNIQUE,
  assigned_supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  village TEXT NOT NULL,
  sub_centre TEXT,
  phc_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. HOUSEHOLDS TABLE
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_code TEXT NOT NULL UNIQUE,
  head_of_family TEXT NOT NULL,
  address TEXT NOT NULL,
  village TEXT NOT NULL,
  ward TEXT,
  assigned_asha_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
  assigned_asha_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  patient_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT NOT NULL CHECK (gender IN ('female', 'male', 'other')),
  phone TEXT,
  address TEXT,
  relationship_to_head TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'migrated', 'deceased')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. VISITS TABLE
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  asha_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_type TEXT NOT NULL CHECK (visit_type IN ('routine_anc', 'pnc', 'immunization', 'general_checkup', 'communicable_disease')),
  notes TEXT,
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  next_follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. FOLLOW UPS TABLE
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  assigned_asha_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'cancelled')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  asha_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  referred_to TEXT NOT NULL,
  reason TEXT NOT NULL,
  referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'referred' CHECK (status IN ('referred', 'visited', 'admitted', 'discharged', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. MEDICINES TABLE (Catalog)
CREATE TABLE IF NOT EXISTS public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'tablets',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. MEDICINE STOCK TABLE
CREATE TABLE IF NOT EXISTS public.medicine_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  minimum_quantity INTEGER NOT NULL DEFAULT 10 CHECK (minimum_quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. MEDICINE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.medicine_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asha_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE RESTRICT,
  requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
  approved_quantity INTEGER CHECK (approved_quantity >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'alert', 'approval', 'sync')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asha_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view active profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 2. ASHA WORKERS POLICIES
DROP POLICY IF EXISTS "View asha worker mapping" ON public.asha_workers;
CREATE POLICY "View asha worker mapping"
  ON public.asha_workers FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR assigned_supervisor_id = auth.uid()
    OR public.get_current_role() = 'manager'
  );

-- 3. HOUSEHOLDS POLICIES
DROP POLICY IF EXISTS "ASHA manage own households" ON public.households;
CREATE POLICY "ASHA manage own households"
  ON public.households FOR ALL
  TO authenticated
  USING (
    assigned_asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  )
  WITH CHECK (
    assigned_asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  );

-- 4. PATIENTS POLICIES
DROP POLICY IF EXISTS "ASHA manage own patients" ON public.patients;
CREATE POLICY "ASHA manage own patients"
  ON public.patients FOR ALL
  TO authenticated
  USING (
    assigned_asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  )
  WITH CHECK (
    assigned_asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  );

-- 5. VISITS POLICIES
DROP POLICY IF EXISTS "ASHA manage own visits" ON public.visits;
CREATE POLICY "ASHA manage own visits"
  ON public.visits FOR ALL
  TO authenticated
  USING (
    asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  )
  WITH CHECK (
    asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  );

-- 6. FOLLOW UPS POLICIES
DROP POLICY IF EXISTS "ASHA manage own follow-ups" ON public.follow_ups;
CREATE POLICY "ASHA manage own follow-ups"
  ON public.follow_ups FOR ALL
  TO authenticated
  USING (
    assigned_asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  )
  WITH CHECK (
    assigned_asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  );

-- 7. REFERRALS POLICIES
DROP POLICY IF EXISTS "ASHA manage own referrals" ON public.referrals;
CREATE POLICY "ASHA manage own referrals"
  ON public.referrals FOR ALL
  TO authenticated
  USING (
    asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  )
  WITH CHECK (
    asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  );

-- 8. MEDICINES POLICIES
DROP POLICY IF EXISTS "Anyone can view active medicines" ON public.medicines;
CREATE POLICY "Anyone can view active medicines"
  ON public.medicines FOR SELECT
  TO authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Managers manage medicines catalog" ON public.medicines;
CREATE POLICY "Managers manage medicines catalog"
  ON public.medicines FOR ALL
  TO authenticated
  USING (public.get_current_role() = 'manager')
  WITH CHECK (public.get_current_role() = 'manager');

-- 9. MEDICINE STOCK POLICIES
DROP POLICY IF EXISTS "Anyone view medicine stock" ON public.medicine_stock;
CREATE POLICY "Anyone view medicine stock"
  ON public.medicine_stock FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers update medicine stock" ON public.medicine_stock;
CREATE POLICY "Managers update medicine stock"
  ON public.medicine_stock FOR ALL
  TO authenticated
  USING (public.get_current_role() = 'manager')
  WITH CHECK (public.get_current_role() = 'manager');

-- 10. MEDICINE ORDERS POLICIES
DROP POLICY IF EXISTS "ASHA manage own medicine orders" ON public.medicine_orders;
CREATE POLICY "ASHA manage own medicine orders"
  ON public.medicine_orders FOR SELECT
  TO authenticated
  USING (
    asha_id = auth.uid()
    OR public.get_current_role() IN ('supervisor', 'manager')
  );

DROP POLICY IF EXISTS "ASHA insert medicine orders" ON public.medicine_orders;
CREATE POLICY "ASHA insert medicine orders"
  ON public.medicine_orders FOR INSERT
  TO authenticated
  WITH CHECK (asha_id = auth.uid());

DROP POLICY IF EXISTS "Supervisors and Managers update orders" ON public.medicine_orders;
CREATE POLICY "Supervisors and Managers update orders"
  ON public.medicine_orders FOR UPDATE
  TO authenticated
  USING (public.get_current_role() IN ('supervisor', 'manager'))
  WITH CHECK (public.get_current_role() IN ('supervisor', 'manager'));

-- 11. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (recipient_profile_id = auth.uid())
  WITH CHECK (recipient_profile_id = auth.uid());

-- 12. AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Users can create audit logs" ON public.audit_logs;
CREATE POLICY "Users can create audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_profile_id = auth.uid());

DROP POLICY IF EXISTS "Supervisors and Managers view audit logs" ON public.audit_logs;
CREATE POLICY "Supervisors and Managers view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.get_current_role() IN ('supervisor', 'manager'));
