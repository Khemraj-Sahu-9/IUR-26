-- ============================================================
-- PHASE 8: Reporting Analytics — Indexes & Reporting Views
-- Migration: 20260928010000_phase8_reporting_indexes.sql
-- ============================================================

-- ─── 1. REPORTING INDEXES ─────────────────────────────────────
-- visits: fast date-range queries
CREATE INDEX IF NOT EXISTS idx_visits_asha_date ON visits(asha_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_date       ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_type       ON visits(visit_type);

-- follow_ups: reporting on status + date
CREATE INDEX IF NOT EXISTS idx_follow_ups_asha_status ON follow_ups(assigned_asha_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_date    ON follow_ups(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status      ON follow_ups(status);

-- referrals: reporting on status + date
CREATE INDEX IF NOT EXISTS idx_referrals_asha_date   ON referrals(asha_id, referral_date);
CREATE INDEX IF NOT EXISTS idx_referrals_status      ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_date        ON referrals(referral_date);

-- medicine_orders: reporting on status + date
CREATE INDEX IF NOT EXISTS idx_medicine_orders_asha      ON medicine_orders(asha_id, requested_at);
CREATE INDEX IF NOT EXISTS idx_medicine_orders_status    ON medicine_orders(status);
CREATE INDEX IF NOT EXISTS idx_medicine_orders_requested ON medicine_orders(requested_at);

-- patients: filtering by asha + status
CREATE INDEX IF NOT EXISTS idx_patients_asha_status ON patients(assigned_asha_id, status);

-- pregnancies
CREATE INDEX IF NOT EXISTS idx_pregnancies_status  ON pregnancies(status);
CREATE INDEX IF NOT EXISTS idx_pregnancies_patient ON pregnancies(patient_id);

-- tasks
CREATE INDEX IF NOT EXISTS idx_tasks_due_status ON tasks(due_date, status);

-- ─── 2. REPORTING VIEWS ───────────────────────────────────────

-- Visit counts by day (for sparkline charts)
CREATE OR REPLACE VIEW v_visits_by_day AS
SELECT
  asha_id,
  visit_date,
  COUNT(*) AS total_visits,
  COUNT(*) FILTER (WHERE visit_type = 'routine_anc')         AS anc_visits,
  COUNT(*) FILTER (WHERE visit_type = 'pnc')                 AS pnc_visits,
  COUNT(*) FILTER (WHERE visit_type = 'immunization')        AS immunization_visits,
  COUNT(*) FILTER (WHERE visit_type = 'general_checkup')     AS general_visits,
  COUNT(*) FILTER (WHERE visit_type = 'communicable_disease')AS cd_visits,
  COUNT(*) FILTER (WHERE visit_type = 'maternal_checkup')    AS maternal_visits,
  COUNT(*) FILTER (WHERE visit_type = 'child_growth')        AS child_growth_visits
FROM visits
GROUP BY asha_id, visit_date;

-- Follow-up summary by ASHA
CREATE OR REPLACE VIEW v_follow_up_summary AS
SELECT
  assigned_asha_id                                     AS asha_id,
  COUNT(*)                                             AS total,
  COUNT(*) FILTER (WHERE status = 'pending')           AS pending,
  COUNT(*) FILTER (WHERE status = 'completed')         AS completed,
  COUNT(*) FILTER (WHERE status = 'missed')            AS missed,
  COUNT(*) FILTER (WHERE status = 'cancelled')         AS cancelled,
  COUNT(*) FILTER (
    WHERE status = 'pending' AND due_date < CURRENT_DATE
  )                                                    AS overdue
FROM follow_ups
GROUP BY assigned_asha_id;

-- Referral summary by ASHA
CREATE OR REPLACE VIEW v_referral_summary AS
SELECT
  asha_id,
  COUNT(*)                                              AS total,
  COUNT(*) FILTER (WHERE status = 'referred')           AS referred,
  COUNT(*) FILTER (WHERE status = 'visited')            AS visited,
  COUNT(*) FILTER (WHERE status = 'admitted')           AS admitted,
  COUNT(*) FILTER (WHERE status = 'discharged')         AS discharged,
  COUNT(*) FILTER (WHERE status = 'cancelled')          AS cancelled
FROM referrals
GROUP BY asha_id;

-- Medicine order summary by ASHA
CREATE OR REPLACE VIEW v_medicine_order_summary AS
SELECT
  asha_id,
  COUNT(*)                                               AS total,
  COUNT(*) FILTER (WHERE status = 'pending')             AS pending,
  COUNT(*) FILTER (WHERE status = 'approved')            AS approved,
  COUNT(*) FILTER (WHERE status = 'rejected')            AS rejected,
  COUNT(*) FILTER (WHERE status = 'fulfilled')           AS fulfilled,
  COUNT(*) FILTER (WHERE status = 'cancelled')           AS cancelled
FROM medicine_orders
GROUP BY asha_id;

-- Stock level view (for inventory report)
CREATE OR REPLACE VIEW v_stock_levels AS
SELECT
  ms.id,
  ms.medicine_id,
  m.name        AS medicine_name,
  m.generic_name,
  m.unit,
  ms.location,
  ms.quantity,
  ms.minimum_quantity,
  CASE
    WHEN ms.quantity = 0                              THEN 'out_of_stock'
    WHEN ms.quantity <= ms.minimum_quantity           THEN 'low_stock'
    ELSE                                                   'adequate'
  END AS stock_status,
  ms.updated_at
FROM medicine_stock ms
JOIN medicines m ON m.id = ms.medicine_id
WHERE m.active = true;

-- ─── 3. RLS ON VIEWS (Secure views using security_invoker) ────
ALTER VIEW v_visits_by_day          SET (security_invoker = true);
ALTER VIEW v_follow_up_summary      SET (security_invoker = true);
ALTER VIEW v_referral_summary       SET (security_invoker = true);
ALTER VIEW v_medicine_order_summary SET (security_invoker = true);
-- v_stock_levels is visible to supervisor+manager, filtered by existing RLS on base tables
ALTER VIEW v_stock_levels           SET (security_invoker = true);
