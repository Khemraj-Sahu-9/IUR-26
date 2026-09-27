-- =========================================================
-- Phase 5 Migration: Maternal / Pregnancy & Child Tracking
-- =========================================================

-- 1. PREGNANCIES TABLE
CREATE TABLE IF NOT EXISTS public.pregnancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'unknown')),
  lmp_date DATE,
  expected_due_date DATE,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gravida INTEGER DEFAULT 1 CHECK (gravida >= 1),
  para INTEGER DEFAULT 0 CHECK (para >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast patient pregnancy lookups
CREATE INDEX IF NOT EXISTS idx_pregnancies_patient_id ON public.pregnancies(patient_id);
CREATE INDEX IF NOT EXISTS idx_pregnancies_status ON public.pregnancies(status);

-- Enable RLS on pregnancies table
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: ASHAs can manage pregnancies of patients assigned to them; Supervisors and Managers can view/manage
DROP POLICY IF EXISTS "ASHA manage own patient pregnancies" ON public.pregnancies;
CREATE POLICY "ASHA manage own patient pregnancies"
  ON public.pregnancies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = pregnancies.patient_id
      AND (
        p.assigned_asha_id = auth.uid()
        OR public.get_current_role() IN ('supervisor', 'manager')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = pregnancies.patient_id
      AND (
        p.assigned_asha_id = auth.uid()
        OR public.get_current_role() IN ('supervisor', 'manager')
      )
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_pregnancies_updated_at
  BEFORE UPDATE ON public.pregnancies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
