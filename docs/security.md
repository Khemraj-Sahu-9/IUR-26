# ASHA Digital Platform — Security & Access Control

## 1. Authentication & Session Security
- Authentication is handled exclusively through Supabase Auth using secure JWTs with short-lived access tokens and refresh tokens stored in HttpOnly cookies / secure client storage.
- Passwords must meet minimum complexity (8+ characters, alphanumeric).
- No sensitive service keys (`SUPABASE_SERVICE_ROLE_KEY`) are ever bundled in client code. Only `NEXT_PUBLIC_` / `VITE_` public anonymous keys with zero direct table bypass permissions are shipped.

## 2. Role-Based Access Control (RBAC) Matrix

| Entity / Action | ASHA Worker | Supervisor | Manager (PHC) |
|---|---|---|---|
| **Households & Patients** | Read/Write (Assigned Village only) | Read (Assigned Sector) | Read (PHC aggregated) |
| **Pregnancies & Children** | Read/Write (Assigned Village only) | Read (Assigned Sector) | Read (PHC aggregated) |
| **Visits & Follow-ups** | Read/Write (Assigned Village only) | Read (Assigned Sector) | Read (PHC aggregated) |
| **Referrals** | Create / Update (Assigned) | Read / Coordinate | Read / Hospital transfer |
| **Own Medicine Kit Stock** | Read (Own kit) | Read (Assigned ASHAs) | Read (All stocks) |
| **Medicine Requisition** | Create / Read Own Orders | Approve / Reject Orders | Manage Inventory / Fulfill |
| **Supervisor Monitoring** | No Access | Read sector activity | Read all supervisors & ASHAs |
| **Audit Logs** | No Direct Access | Read sector logs | Read PHC audit logs |

## 3. Supabase Row Level Security (RLS) Policy Design

```sql
-- Helper function to extract current authenticated user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Patients Table RLS:
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 1. ASHA can select/insert/update patients assigned to them
CREATE POLICY "ASHA can view assigned patients"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    assigned_asha_id = auth.uid()
    OR get_current_user_role() IN ('supervisor', 'manager')
  );

CREATE POLICY "ASHA can insert patients in their village"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (
    assigned_asha_id = auth.uid()
  );

CREATE POLICY "ASHA can update assigned patients"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (assigned_asha_id = auth.uid())
  WITH CHECK (assigned_asha_id = auth.uid());
```

## 4. Healthcare Privacy Compliance
1. **Minimal Data Collection**: The app collects only field indicators required by NHM registers (name, age, basic vitals, vaccine doses). No biometric storage or unnecessary identifiers.
2. **No Diagnostic Engine**: The app acts solely as an operational record system and milestone tracker. No automatic clinical diagnoses or prescription recommendations are output.
3. **Audit Trails**: Critical operations (approving medicine shipments, updating high-risk pregnancy tags, role changes) trigger entries in the append-only `audit_logs` table.
