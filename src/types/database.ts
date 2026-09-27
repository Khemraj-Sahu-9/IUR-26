export type UserRole = 'asha' | 'supervisor' | 'manager';
export type PreferredLanguage = 'en' | 'hi' | 'mr' | 'cg';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  preferred_language: PreferredLanguage;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AshaWorker {
  id: string;
  profile_id: string;
  employee_id: string | null;
  assigned_supervisor_id: string | null;
  village: string;
  sub_centre: string | null;
  phc_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  household_code: string;
  head_of_family: string;
  address: string;
  village: string;
  ward: string | null;
  assigned_asha_id: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  household_id: string;
  assigned_asha_id: string;
  patient_code: string;
  full_name: string;
  date_of_birth: string | null;
  gender: 'female' | 'male' | 'other';
  phone: string | null;
  address: string | null;
  relationship_to_head: string | null;
  status: 'active' | 'migrated' | 'deceased';
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  asha_id: string;
  visit_date: string;
  visit_type: 'routine_anc' | 'pnc' | 'immunization' | 'general_checkup' | 'communicable_disease';
  notes: string | null;
  follow_up_required: boolean;
  next_follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  patient_id: string;
  assigned_asha_id: string;
  due_date: string;
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  asha_id: string;
  referred_to: string;
  reason: string;
  referral_date: string;
  status: 'referred' | 'visited' | 'admitted' | 'discharged' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  unit: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicineStock {
  id: string;
  medicine_id: string;
  location: string;
  quantity: number;
  minimum_quantity: number;
  updated_at: string;
  medicine?: Medicine;
}

export interface MedicineOrder {
  id: string;
  asha_id: string;
  medicine_id: string;
  requested_quantity: number;
  approved_quantity: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  medicine?: Medicine;
  asha_profile?: Profile;
}

export interface Notification {
  id: string;
  recipient_profile_id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'approval' | 'sync';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_profile_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
