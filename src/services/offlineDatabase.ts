/**
 * offlineDatabase.ts
 * 
 * Dexie (IndexedDB) schema for ASHA Saathi offline-first storage.
 * Stores: profiles, households, patients, visits, follow_ups, referrals,
 *         medicines, medicine_stock, medicine_orders, notifications,
 *         sync_queue, sync_metadata
 *
 * Sync status values:
 *   'synced'   — confirmed written to server
 *   'pending'  — locally created, not yet sent
 *   'syncing'  — currently being uploaded
 *   'failed'   — last sync attempt failed
 */

import Dexie, { Table } from 'dexie';

// ─── Local record wrapper ─────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed';

/** Fields attached to every locally managed record */
export interface LocalMeta {
  /** Stable client-generated UUID used as primary key and idempotency token */
  id: string;
  /** Whether this record has been confirmed on the server */
  sync_status: SyncStatus;
  /** ISO timestamp when record was created locally */
  local_created_at: string;
  /** ISO timestamp of last local modification */
  local_updated_at: string;
  /** If true, this record was created while offline */
  created_offline?: boolean;
}

// ─── Local table schemas ──────────────────────────────────────────────────────

export interface LocalProfile extends LocalMeta {
  user_id: string;
  full_name: string;
  role: string;
  email?: string;
  village?: string;
  phone?: string;
}

export interface LocalHousehold extends LocalMeta {
  household_code: string;
  head_of_family: string;
  address: string;
  village: string;
  ward?: string | null;
  assigned_asha_id: string;
  member_count?: number;
}

export interface LocalPatient extends LocalMeta {
  household_id: string;
  patient_code: string;
  full_name: string;
  date_of_birth?: string | null;
  gender: 'female' | 'male' | 'other';
  phone?: string | null;
  address?: string | null;
  relationship_to_head?: string | null;
  status: 'active' | 'migrated' | 'deceased';
  assigned_asha_id: string;
}

export interface LocalVisit extends LocalMeta {
  patient_id: string;
  asha_id: string;
  visit_date: string;
  visit_type: string;
  notes?: string | null;
  follow_up_required: boolean;
  next_follow_up_date?: string | null;
  follow_up_note?: string | null;
}

export interface LocalFollowUp extends LocalMeta {
  patient_id: string;
  assigned_asha_id: string;
  due_date: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  completed_at?: string | null;
}

export interface LocalReferral extends LocalMeta {
  patient_id: string;
  asha_id: string;
  referred_to: string;
  reason: string;
  referral_date: string;
  notes?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

export interface LocalMedicine extends LocalMeta {
  name: string;
  unit: string;
  description?: string | null;
  active: boolean;
}

export interface LocalMedicineStock extends LocalMeta {
  medicine_id: string;
  quantity: number;
  min_threshold: number;
}

export interface LocalMedicineOrder extends LocalMeta {
  medicine_id: string;
  asha_id: string;
  requested_quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes?: string | null;
  approved_quantity?: number | null;
}

export interface LocalNotification extends LocalMeta {
  user_id?: string;
  recipient_profile_id?: string;
  title: string;
  message: string;
  type: string;
  read?: boolean;
  is_read?: boolean;
  source_type?: string | null;
  source_id?: string | null;
  action_type?: string | null;
}

export interface LocalPregnancy extends LocalMeta {
  patient_id: string;
  status: 'active' | 'delivered' | 'miscarriage' | 'aborted' | 'transferred';
  lmp_date?: string | null;
  expected_due_date?: string | null;
  registration_date: string;
  gravida: number;
  para: number;
  notes?: string | null;
}

// ─── Sync Operation Queue ─────────────────────────────────────────────────────

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncOperation {
  /** Stable client-generated UUID for this operation (idempotency token) */
  id: string;
  /** The Dexie table / Supabase table target */
  entity_type: string;
  /** The record's client-side UUID */
  entity_id: string;
  /** CREATE | UPDATE | DELETE */
  operation_type: SyncOperationType;
  /** Serialised record payload */
  payload: Record<string, unknown>;
  /** ISO timestamp when operation was enqueued */
  created_at: string;
  /** Number of sync attempts so far */
  retry_count: number;
  /** ISO timestamp of last attempt (or null) */
  last_attempted_at: string | null;
  /** Current status of the operation */
  sync_status: SyncStatus;
  /** Human-readable error info (no patient PII) */
  error_message: string | null;
  /**
   * If this operation depends on another entity being synced first
   * (e.g. a Patient CREATE depends on a Household CREATE), record its
   * entity_id here so the sync runner can enforce ordering.
   */
  depends_on_entity_id: string | null;
}

// ─── Sync Metadata ────────────────────────────────────────────────────────────

export interface SyncMetadata {
  key: string;
  value: string;
}

// ─── Dexie Database ───────────────────────────────────────────────────────────

export class AshaSaathiDB extends Dexie {
  profiles!: Table<LocalProfile, string>;
  households!: Table<LocalHousehold, string>;
  patients!: Table<LocalPatient, string>;
  visits!: Table<LocalVisit, string>;
  follow_ups!: Table<LocalFollowUp, string>;
  referrals!: Table<LocalReferral, string>;
  medicines!: Table<LocalMedicine, string>;
  medicine_stock!: Table<LocalMedicineStock, string>;
  medicine_orders!: Table<LocalMedicineOrder, string>;
  notifications!: Table<LocalNotification, string>;
  pregnancies!: Table<LocalPregnancy, string>;
  sync_queue!: Table<SyncOperation, string>;
  sync_metadata!: Table<SyncMetadata, string>;

  constructor() {
    super('AshaSaathiDB');

    this.version(1).stores({
      profiles:        '&id, user_id, sync_status',
      households:      '&id, assigned_asha_id, sync_status, household_code',
      patients:        '&id, household_id, assigned_asha_id, sync_status, patient_code, full_name',
      visits:          '&id, patient_id, asha_id, sync_status, visit_date',
      follow_ups:      '&id, patient_id, assigned_asha_id, sync_status, status, due_date',
      referrals:       '&id, patient_id, asha_id, sync_status',
      medicines:       '&id, name, sync_status',
      medicine_stock:  '&id, medicine_id, sync_status',
      medicine_orders: '&id, asha_id, medicine_id, sync_status',
      notifications:   '&id, user_id, sync_status, read',
      pregnancies:     '&id, patient_id, status, sync_status',
      sync_queue:      '&id, entity_type, entity_id, sync_status, created_at, depends_on_entity_id',
      sync_metadata:   '&key',
    });
  }
}

/** Singleton database instance */
export const db = new AshaSaathiDB();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a stable client UUID */
export const newLocalId = (): string => crypto.randomUUID();

/** Current ISO timestamp */
export const nowISO = (): string => new Date().toISOString();

/** Build LocalMeta for a brand-new offline record */
export const buildLocalMeta = (id?: string): LocalMeta => {
  const ts = nowISO();
  return {
    id: id ?? newLocalId(),
    sync_status: 'pending',
    local_created_at: ts,
    local_updated_at: ts,
    created_offline: !navigator.onLine,
  };
};

/**
 * Clear all locally scoped user data on logout.
 * Clears all tables EXCEPT sync_queue (to preserve pending operations for
 * a potential re-login scenario) — but pending operations are also cleared
 * since a new login context should not inherit another user's queue.
 */
export const clearLocalDatabase = async (): Promise<void> => {
  await Promise.all([
    db.profiles.clear(),
    db.households.clear(),
    db.patients.clear(),
    db.visits.clear(),
    db.follow_ups.clear(),
    db.referrals.clear(),
    db.medicines.clear(),
    db.medicine_stock.clear(),
    db.medicine_orders.clear(),
    db.notifications.clear(),
    db.pregnancies.clear(),
    db.sync_queue.clear(),
    db.sync_metadata.clear(),
  ]);
};
