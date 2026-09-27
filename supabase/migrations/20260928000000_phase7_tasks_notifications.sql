-- ============================================================
-- PHASE 7: Tasks, Notifications & Workflow Improvement
-- Migration: 20260928000000_phase7_tasks_notifications.sql
-- ============================================================

-- ─── 1. TASK TYPE ENUM ───────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE task_type AS ENUM (
    'anc_visit',
    'pnc_visit',
    'immunization',
    'follow_up',
    'referral_followup',
    'medicine_refill',
    'general_checkup',
    'overdue_alert'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('normal', 'priority');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'dismissed', 'overdue');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. TASKS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_type         task_type NOT NULL DEFAULT 'general_checkup',
  source_type       TEXT,                      -- 'follow_up' | 'referral' | 'pregnancy' | 'visit' | 'medicine_order'
  source_id         UUID,                      -- FK to source record (for deep-link navigation)
  patient_id        UUID REFERENCES patients(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  due_date          DATE NOT NULL,
  priority          task_priority NOT NULL DEFAULT 'normal',
  status            task_status NOT NULL DEFAULT 'pending',
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast filtered queries
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date    ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_source      ON tasks(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_tasks_patient     ON tasks(patient_id);

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_tasks_updated_at();

-- ─── 3. ENHANCE NOTIFICATIONS TABLE ─────────────────────────
-- Add deep-link fields if they don't exist yet
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS source_type TEXT,        -- e.g. 'medicine_order', 'follow_up', 'task'
  ADD COLUMN IF NOT EXISTS source_id   UUID,        -- FK id of related record
  ADD COLUMN IF NOT EXISTS action_type TEXT;        -- e.g. 'approve', 'view', 'complete'

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications(recipient_profile_id, is_read, created_at DESC);

-- ─── 4. RLS POLICIES FOR TASKS ───────────────────────────────
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ASHA: see own tasks
DROP POLICY IF EXISTS tasks_asha_select ON tasks;
CREATE POLICY tasks_asha_select ON tasks
  FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('supervisor', 'manager')
    )
  );

-- ASHA: update own task status (complete/dismiss)
DROP POLICY IF EXISTS tasks_asha_update ON tasks;
CREATE POLICY tasks_asha_update ON tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Supervisor/Manager: insert tasks for ASHAs they oversee
DROP POLICY IF EXISTS tasks_supervisor_insert ON tasks;
CREATE POLICY tasks_supervisor_insert ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('supervisor', 'manager')
    )
  );

-- System/service-role insert (for auto-generation)
DROP POLICY IF EXISTS tasks_service_insert ON tasks;
CREATE POLICY tasks_service_insert ON tasks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ─── 5. RLS POLICIES FOR NOTIFICATIONS ───────────────────────
-- Notifications table likely already has RLS; add/update policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT TO authenticated
  USING (recipient_profile_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE TO authenticated
  USING (recipient_profile_id = auth.uid())
  WITH CHECK (recipient_profile_id = auth.uid());

DROP POLICY IF EXISTS notifications_insert_auth ON notifications;
CREATE POLICY notifications_insert_auth ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS notifications_insert_service ON notifications;
CREATE POLICY notifications_insert_service ON notifications
  FOR INSERT TO service_role
  WITH CHECK (true);

-- ─── 6. HELPER FUNCTION: idempotent task creation ─────────────
-- Returns existing task if source_type+source_id+task_type already exists
CREATE OR REPLACE FUNCTION upsert_task(
  p_assigned_to  UUID,
  p_task_type    task_type,
  p_source_type  TEXT,
  p_source_id    UUID,
  p_patient_id   UUID,
  p_title        TEXT,
  p_description  TEXT,
  p_due_date     DATE,
  p_priority     task_priority DEFAULT 'normal'
)
RETURNS tasks LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result tasks;
BEGIN
  -- Try to find existing non-completed task for same source
  SELECT * INTO result
  FROM tasks
  WHERE source_type = p_source_type
    AND source_id = p_source_id
    AND task_type = p_task_type
    AND status NOT IN ('completed', 'dismissed')
  LIMIT 1;

  IF FOUND THEN
    RETURN result;
  END IF;

  -- Insert new task
  INSERT INTO tasks (
    assigned_to, task_type, source_type, source_id,
    patient_id, title, description, due_date, priority, status
  ) VALUES (
    p_assigned_to, p_task_type, p_source_type, p_source_id,
    p_patient_id, p_title, p_description, p_due_date, p_priority, 'pending'
  ) RETURNING * INTO result;

  RETURN result;
END;
$$;
