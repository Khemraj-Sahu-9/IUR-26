# ASHA Digital Platform — Security & Access Control

## 1. Authentication & Session Security
- Authentication is handled exclusively through Supabase Auth using secure JWTs with short-lived access tokens and refresh tokens stored in secure browser storage.
- Passwords must meet minimum complexity (6+ characters).
- No sensitive service keys (`SUPABASE_SERVICE_ROLE_KEY`) are ever bundled in client code. Only `VITE_SUPABASE_ANON_KEY` is exposed, which has zero direct table bypass permissions.

## 2. Role-Based Access Control (RBAC) Matrix

| Entity / Action | ASHA Worker | Supervisor | Manager (PHC) |
|---|---|---|---|
| **Households & Patients** | Read/Write (Assigned Village only) | Read/Write (Assigned Sector) | Read/Write (PHC aggregated) |
| **Visits & Follow-ups** | Create & Read (Assigned Village only) | Read & Monitor Alerts | Read & Monitor Alerts |
| **Referrals** | Create / Update (Assigned) | Read / Coordinate | Read / Hospital transfer |
| **Medicine Catalog** | Read (Active medicines) | Read (Active medicines) | Full Catalog Management (Add/Edit) |
| **Medicine Stock** | Read (Kit Stock) | Read (All Sector Stocks) | Full Inventory Management (Update qty) |
| **Medicine Orders** | Create Orders / Read Own Orders | **Approve or Reject Orders** | Review & Fulfill Orders |
| **Notifications** | Read/Update Own Notifications | Read/Update Own Notifications | Read/Update Own Notifications |
| **Audit Logs** | Insert Action Logs | Read Sector Logs | Full Access to Audit Logs |

## 3. Supabase Row Level Security (RLS) Implementation

RLS is enabled unconditionally on all 12 tables in the `public` schema.

```sql
-- Role detection helper function
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Patients Table RLS:
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

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
```

## 4. Healthcare Privacy Compliance & Data Minimization
1. **Minimal Data Collection**: The app collects only field indicators required by NHM registers (name, age, basic vitals, vaccine doses). No biometric storage or unnecessary identifiers.
2. **No Diagnostic Engine**: The app acts solely as an operational record system and milestone tracker. No automatic clinical diagnoses or prescription recommendations are output.
3. **Audit Trails**: Critical operations (`PATIENT_CREATED`, `VISIT_CREATED`, `MEDICINE_REQUEST_CREATED`, `MEDICINE_REQUEST_APPROVED`, `USER_LOGIN`, `USER_LOGOUT`) trigger entries in the append-only `audit_logs` table without recording sensitive user credentials or tokens.
