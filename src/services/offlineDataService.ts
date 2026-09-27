/**
 * offlineDataService.ts
 *
 * Local-first data access layer for ASHA field workflows.
 *
 * Read path:  IndexedDB → (fallback to Supabase if empty)
 * Write path: IndexedDB → enqueue sync op → attempt online sync if possible
 *
 * Online write flow:
 *   write to IndexedDB (sync_status=pending)
 *   → enqueue sync op
 *   → if online: call syncManager.sync() immediately
 *   → supabase upsert (idempotent via onConflict:'id')
 *   → mark synced
 *
 * Offline write flow:
 *   write to IndexedDB (sync_status=pending, created_offline=true)
 *   → enqueue sync op
 *   → syncManager will pick it up when connectivity returns
 */

import { supabase } from '@/lib/supabaseClient';
import { connectivityService } from './connectivityService';
import { syncManager } from './syncManager';
import {
  db,
  newLocalId,
  nowISO,
  LocalHousehold,
  LocalPatient,
  LocalVisit,
  LocalFollowUp,
  LocalReferral,
  LocalMedicine,
  LocalMedicineStock,
  LocalMedicineOrder,
  LocalProfile,
} from './offlineDatabase';

// ─── Cache refresh ────────────────────────────────────────────────────────────

/**
 * Download server data into local IndexedDB.
 * Called on login / app load when online.
 * Never overwrites records that are pending sync.
 */
export async function refreshLocalCache(ashaId: string): Promise<void> {
  if (!connectivityService.isOnline()) return;

  try {
    // Parallel fetch all ASHA-scoped data
    const [
      { data: households },
      { data: patients },
      { data: visits },
      { data: followUps },
      { data: referrals },
      { data: medicines },
      { data: stock },
    ] = await Promise.all([
      supabase.from('households').select('*').eq('assigned_asha_id', ashaId),
      supabase.from('patients').select('*').eq('assigned_asha_id', ashaId),
      supabase.from('visits').select('*').eq('asha_id', ashaId).order('created_at', { ascending: false }).limit(200),
      supabase.from('follow_ups').select('*').eq('assigned_asha_id', ashaId).order('due_date', { ascending: true }).limit(200),
      supabase.from('referrals').select('*').eq('asha_id', ashaId).order('created_at', { ascending: false }).limit(100),
      supabase.from('medicines').select('*').eq('active', true),
      supabase.from('medicine_stock').select('*'),
    ]);

    // Helper: merge server data without overwriting pending local records
    const safeMerge = async <T extends { id: string }>(
      table: any,
      rows: T[] | null
    ) => {
      if (!rows) return;
      const pending = await table.where('sync_status').anyOf(['pending', 'syncing', 'failed']).primaryKeys();
      const pendingSet = new Set(pending as string[]);

      const toUpsert = rows
        .filter((r: T) => !pendingSet.has(r.id))
        .map((r: T) => ({
          ...r,
          sync_status: 'synced' as const,
          local_created_at: (r as Record<string,unknown>)['created_at'] as string ?? nowISO(),
          local_updated_at: (r as Record<string,unknown>)['updated_at'] as string ?? nowISO(),
        }));

      if (toUpsert.length > 0) await table.bulkPut(toUpsert);
    };

    await safeMerge(db.households, households);
    await safeMerge(db.patients, patients);
    await safeMerge(db.visits, visits);
    await safeMerge(db.follow_ups, followUps);
    await safeMerge(db.referrals, referrals);
    await safeMerge(db.medicines, medicines);
    await safeMerge(db.medicine_stock, stock);

    await db.sync_metadata.put({ key: 'last_cache_refresh', value: nowISO() });
    console.log('[OfflineDataService] Cache refreshed for ASHA', ashaId);
  } catch (err) {
    console.warn('[OfflineDataService] Cache refresh failed (offline?)', err);
  }
}

// ─── Households ───────────────────────────────────────────────────────────────

export const householdRepo = {
  async getAll(ashaId: string): Promise<LocalHousehold[]> {
    return db.households.where('assigned_asha_id').equals(ashaId).toArray();
  },

  async getById(id: string): Promise<LocalHousehold | undefined> {
    return db.households.get(id);
  },

  async create(input: Omit<LocalHousehold, 'id' | 'sync_status' | 'local_created_at' | 'local_updated_at' | 'created_offline'>): Promise<LocalHousehold> {
    const ts = nowISO();
    const record: LocalHousehold = {
      ...input,
      id: newLocalId(),
      sync_status: 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !connectivityService.isOnline(),
    };
    await db.households.add(record);
    await syncManager.enqueue('households', record.id, 'CREATE', record as unknown as Record<string, unknown>);
    if (connectivityService.isOnline()) syncManager.sync();
    return record;
  },
};

// ─── Patients ─────────────────────────────────────────────────────────────────

export const patientRepo = {
  async getAll(ashaId: string): Promise<LocalPatient[]> {
    return db.patients.where('assigned_asha_id').equals(ashaId).toArray();
  },

  async getById(id: string): Promise<LocalPatient | undefined> {
    return db.patients.get(id);
  },

  async create(
    input: Omit<LocalPatient, 'id' | 'sync_status' | 'local_created_at' | 'local_updated_at' | 'created_offline'>,
    householdLocalId?: string,
  ): Promise<LocalPatient> {
    const ts = nowISO();
    const record: LocalPatient = {
      ...input,
      id: newLocalId(),
      sync_status: 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !connectivityService.isOnline(),
    };
    await db.patients.add(record);
    // If the household was also created offline, declare dependency
    await syncManager.enqueue(
      'patients', record.id, 'CREATE',
      record as unknown as Record<string, unknown>,
      householdLocalId,
    );
    if (connectivityService.isOnline()) syncManager.sync();
    return record;
  },

  async update(id: string, changes: Partial<LocalPatient>): Promise<void> {
    const ts = nowISO();
    await db.patients.update(id, { ...changes, sync_status: 'pending', local_updated_at: ts });
    const record = await db.patients.get(id);
    if (record) {
      await syncManager.enqueue('patients', id, 'UPDATE', record as unknown as Record<string, unknown>);
      if (connectivityService.isOnline()) syncManager.sync();
    }
  },
};

// ─── Visits ───────────────────────────────────────────────────────────────────

export const visitRepo = {
  async getByPatient(patientId: string): Promise<LocalVisit[]> {
    return db.visits.where('patient_id').equals(patientId).reverse().sortBy('visit_date');
  },

  async getByAsha(ashaId: string): Promise<LocalVisit[]> {
    return db.visits.where('asha_id').equals(ashaId).reverse().sortBy('visit_date');
  },

  async create(
    input: Omit<LocalVisit, 'id' | 'sync_status' | 'local_created_at' | 'local_updated_at' | 'created_offline'>,
    patientLocalId?: string,
  ): Promise<LocalVisit> {
    const ts = nowISO();
    const record: LocalVisit = {
      ...input,
      id: newLocalId(),
      sync_status: 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !connectivityService.isOnline(),
    };
    await db.visits.add(record);
    await syncManager.enqueue(
      'visits', record.id, 'CREATE',
      record as unknown as Record<string, unknown>,
      patientLocalId,
    );
    if (connectivityService.isOnline()) syncManager.sync();
    return record;
  },
};

// ─── Follow-Ups ───────────────────────────────────────────────────────────────

export const followUpRepo = {
  async getAll(ashaId: string): Promise<LocalFollowUp[]> {
    return db.follow_ups.where('assigned_asha_id').equals(ashaId).toArray();
  },

  async getByPatient(patientId: string): Promise<LocalFollowUp[]> {
    return db.follow_ups.where('patient_id').equals(patientId).toArray();
  },

  async create(
    input: Omit<LocalFollowUp, 'id' | 'sync_status' | 'local_created_at' | 'local_updated_at' | 'created_offline'>,
    patientLocalId?: string,
  ): Promise<LocalFollowUp> {
    const ts = nowISO();
    const record: LocalFollowUp = {
      ...input,
      id: newLocalId(),
      sync_status: 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !connectivityService.isOnline(),
    };
    await db.follow_ups.add(record);
    await syncManager.enqueue(
      'follow_ups', record.id, 'CREATE',
      record as unknown as Record<string, unknown>,
      patientLocalId,
    );
    if (connectivityService.isOnline()) syncManager.sync();
    return record;
  },

  async complete(id: string): Promise<void> {
    const ts = nowISO();
    await db.follow_ups.update(id, {
      status: 'completed',
      completed_at: ts,
      sync_status: 'pending',
      local_updated_at: ts,
    });
    const record = await db.follow_ups.get(id);
    if (record) {
      await syncManager.enqueue('follow_ups', id, 'UPDATE', record as unknown as Record<string, unknown>);
      if (connectivityService.isOnline()) syncManager.sync();
    }
  },
};

// ─── Referrals ────────────────────────────────────────────────────────────────

export const referralRepo = {
  async getByPatient(patientId: string): Promise<LocalReferral[]> {
    return db.referrals.where('patient_id').equals(patientId).toArray();
  },

  async create(
    input: Omit<LocalReferral, 'id' | 'sync_status' | 'local_created_at' | 'local_updated_at' | 'created_offline'>,
    patientLocalId?: string,
  ): Promise<LocalReferral> {
    const ts = nowISO();
    const record: LocalReferral = {
      ...input,
      id: newLocalId(),
      sync_status: 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !connectivityService.isOnline(),
    };
    await db.referrals.add(record);
    await syncManager.enqueue(
      'referrals', record.id, 'CREATE',
      record as unknown as Record<string, unknown>,
      patientLocalId,
    );
    if (connectivityService.isOnline()) syncManager.sync();
    return record;
  },
};

// ─── Medicines ────────────────────────────────────────────────────────────────

export const medicineRepo = {
  async getAll(): Promise<LocalMedicine[]> {
    return db.medicines.toArray();
  },

  async getStock(): Promise<LocalMedicineStock[]> {
    return db.medicine_stock.toArray();
  },
};

// ─── Medicine Orders ─────────────────────────────────────────────────────────

export const medicineOrderRepo = {
  async getByAsha(ashaId: string): Promise<LocalMedicineOrder[]> {
    return db.medicine_orders.where('asha_id').equals(ashaId).toArray();
  },

  async create(
    input: Omit<LocalMedicineOrder, 'id' | 'sync_status' | 'local_created_at' | 'local_updated_at' | 'created_offline'>,
  ): Promise<LocalMedicineOrder> {
    const ts = nowISO();
    const record: LocalMedicineOrder = {
      ...input,
      id: newLocalId(),
      sync_status: 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !connectivityService.isOnline(),
    };
    await db.medicine_orders.add(record);
    await syncManager.enqueue(
      'medicine_orders', record.id, 'CREATE',
      record as unknown as Record<string, unknown>,
    );
    if (connectivityService.isOnline()) syncManager.sync();
    return record;
  },
};

// ─── Profile cache ────────────────────────────────────────────────────────────

export const profileRepo = {
  async save(profile: LocalProfile): Promise<void> {
    await db.profiles.put(profile);
  },

  async get(userId: string): Promise<LocalProfile | undefined> {
    return db.profiles.where('user_id').equals(userId).first();
  },
};
