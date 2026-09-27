import { supabase } from '@/lib/supabaseClient';
import { auditLogger } from '@/services/auditLogger';
import { 
  Household, 
  Patient, 
  Visit, 
  FollowUp, 
  Referral,
  Medicine, 
  MedicineStock, 
  MedicineOrder, 
  Notification,
  AshaWorker,
  Pregnancy,
  PregnancyStatus,
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
} from '@/types/database';
import { db, newLocalId, nowISO } from './offlineDatabase';
import { syncManager } from './syncManager';
import { connectivityService } from './connectivityService';


export interface CreateHouseholdInput {
  household_code: string;
  head_of_family: string;
  address: string;
  village: string;
  ward?: string | null;
  assigned_asha_id: string;
}

export interface CreatePatientInput {
  household_id: string;
  patient_code: string;
  full_name: string;
  date_of_birth?: string | null;
  gender: 'female' | 'male' | 'other';
  phone?: string | null;
  address?: string | null;
  relationship_to_head?: string | null;
  status?: 'active' | 'migrated' | 'deceased';
  assigned_asha_id: string;
}

export interface UpdatePatientInput {
  full_name?: string;
  date_of_birth?: string | null;
  gender?: 'female' | 'male' | 'other';
  phone?: string | null;
  relationship_to_head?: string | null;
  status?: 'active' | 'migrated' | 'deceased';
}

export const dataService = {
  // Households
  async getHouseholds(): Promise<Household[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('households')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          // Merge to Dexie
          for (const item of data) {
            const existing = await db.households.get(item.id);
            if (!existing || existing.sync_status === 'synced') {
              await db.households.put({
                ...item,
                sync_status: 'synced',
                local_created_at: item.created_at || nowISO(),
                local_updated_at: item.updated_at || nowISO(),
              });
            }
          }
          return data;
        }
      }
    } catch (err) {
      console.warn('Network getHouseholds failed, using local cache', err);
    }
    const local = await db.households.toArray();
    return local.map(h => ({
      id: h.id,
      household_code: h.household_code,
      head_of_family: h.head_of_family,
      address: h.address,
      village: h.village,
      ward: h.ward,
      assigned_asha_id: h.assigned_asha_id,
      created_at: h.local_created_at,
    })) as Household[];
  },

  async getHouseholdById(id: string): Promise<Household | null> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('households')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.households.get(id);
    if (!local) return null;
    return {
      id: local.id,
      household_code: local.household_code,
      head_of_family: local.head_of_family,
      address: local.address,
      village: local.village,
      ward: local.ward,
      assigned_asha_id: local.assigned_asha_id,
      created_at: local.local_created_at,
    } as Household;
  },

  async createHousehold(input: CreateHouseholdInput): Promise<Household> {
    const isOnline = connectivityService.isOnline();
    const id = newLocalId();
    const ts = nowISO();

    const localRecord = {
      id,
      household_code: input.household_code.trim(),
      head_of_family: input.head_of_family.trim(),
      address: input.address.trim(),
      village: input.village.trim(),
      ward: input.ward?.trim() || null,
      assigned_asha_id: input.assigned_asha_id,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !isOnline,
    };

    await db.households.put(localRecord);

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('households')
          .insert({
            id: localRecord.id,
            household_code: localRecord.household_code,
            head_of_family: localRecord.head_of_family,
            address: localRecord.address,
            village: localRecord.village,
            ward: localRecord.ward,
            assigned_asha_id: localRecord.assigned_asha_id,
          })
          .select()
          .single();
        if (!error && data) {
          await db.households.update(id, { sync_status: 'synced' });
          return data;
        }
      } catch (err) {
        console.warn('Direct createHousehold online failed, fallback to sync_queue', err);
      }
    }

    // Save to queue for background synchronization
    await syncManager.enqueue('households', id, 'CREATE', {
      id: localRecord.id,
      household_code: localRecord.household_code,
      head_of_family: localRecord.head_of_family,
      address: localRecord.address,
      village: localRecord.village,
      ward: localRecord.ward,
      assigned_asha_id: localRecord.assigned_asha_id,
    });

    return {
      id: localRecord.id,
      household_code: localRecord.household_code,
      head_of_family: localRecord.head_of_family,
      address: localRecord.address,
      village: localRecord.village,
      ward: localRecord.ward,
      assigned_asha_id: localRecord.assigned_asha_id,
      created_at: localRecord.local_created_at,
    } as Household;
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          for (const item of data) {
            const existing = await db.patients.get(item.id);
            if (!existing || existing.sync_status === 'synced') {
              await db.patients.put({
                ...item,
                sync_status: 'synced',
                local_created_at: item.created_at || nowISO(),
                local_updated_at: item.updated_at || nowISO(),
              });
            }
          }
          return data;
        }
      }
    } catch {
      // offline fallback
    }
    const local = await db.patients.toArray();
    return local.map(p => ({
      id: p.id,
      household_id: p.household_id,
      patient_code: p.patient_code,
      full_name: p.full_name,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      phone: p.phone,
      address: p.address,
      relationship_to_head: p.relationship_to_head,
      status: p.status,
      assigned_asha_id: p.assigned_asha_id,
      created_at: p.local_created_at,
    })) as Patient[];
  },

  async getPatientsByHousehold(householdId: string): Promise<Patient[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('household_id', householdId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.patients.where('household_id').equals(householdId).toArray();
    return local.map(p => ({
      id: p.id,
      household_id: p.household_id,
      patient_code: p.patient_code,
      full_name: p.full_name,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      phone: p.phone,
      address: p.address,
      relationship_to_head: p.relationship_to_head,
      status: p.status,
      assigned_asha_id: p.assigned_asha_id,
      created_at: p.local_created_at,
    })) as Patient[];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.patients.get(id);
    if (!local) return null;
    return {
      id: local.id,
      household_id: local.household_id,
      patient_code: local.patient_code,
      full_name: local.full_name,
      date_of_birth: local.date_of_birth,
      gender: local.gender,
      phone: local.phone,
      address: local.address,
      relationship_to_head: local.relationship_to_head,
      status: local.status,
      assigned_asha_id: local.assigned_asha_id,
      created_at: local.local_created_at,
    } as Patient;
  },

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    const isOnline = connectivityService.isOnline();
    const id = newLocalId();
    const ts = nowISO();

    const localRecord = {
      id,
      household_id: input.household_id,
      patient_code: input.patient_code.trim(),
      full_name: input.full_name.trim(),
      date_of_birth: input.date_of_birth || null,
      gender: input.gender,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      relationship_to_head: input.relationship_to_head?.trim() || null,
      status: input.status || 'active',
      assigned_asha_id: input.assigned_asha_id,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !isOnline,
    };

    await db.patients.put(localRecord);

    const payload = {
      id: localRecord.id,
      household_id: localRecord.household_id,
      patient_code: localRecord.patient_code,
      full_name: localRecord.full_name,
      date_of_birth: localRecord.date_of_birth,
      gender: localRecord.gender,
      phone: localRecord.phone,
      address: localRecord.address,
      relationship_to_head: localRecord.relationship_to_head,
      status: localRecord.status,
      assigned_asha_id: localRecord.assigned_asha_id,
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          await db.patients.update(id, { sync_status: 'synced' });
          return data;
        }
      } catch (err) {
        console.warn('Direct createPatient online failed, fallback to sync_queue', err);
      }
    }

    // Enqueue with dependency on household_id
    await syncManager.enqueue('patients', id, 'CREATE', payload, input.household_id);

    return {
      ...payload,
      created_at: localRecord.local_created_at,
    } as Patient;
  },

  async updatePatient(id: string, input: UpdatePatientInput): Promise<Patient> {
    const isOnline = connectivityService.isOnline();
    const ts = nowISO();

    const existing = await db.patients.get(id);
    const updatedLocal = {
      ...(existing || {}),
      ...(input.full_name !== undefined ? { full_name: input.full_name.trim() } : {}),
      ...(input.date_of_birth !== undefined ? { date_of_birth: input.date_of_birth } : {}),
      ...(input.gender !== undefined ? { gender: input.gender } : {}),
      ...(input.phone !== undefined ? { phone: input.phone?.trim() || null } : {}),
      ...(input.relationship_to_head !== undefined ? { relationship_to_head: input.relationship_to_head?.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      id,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_updated_at: ts,
    };

    await db.patients.put(updatedLocal as any);

    const payload: Record<string, unknown> = {
      id,
      updated_at: ts,
    };
    if (input.full_name !== undefined) payload.full_name = input.full_name.trim();
    if (input.date_of_birth !== undefined) payload.date_of_birth = input.date_of_birth;
    if (input.gender !== undefined) payload.gender = input.gender;
    if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
    if (input.relationship_to_head !== undefined) payload.relationship_to_head = input.relationship_to_head?.trim() || null;
    if (input.status !== undefined) payload.status = input.status;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          await db.patients.update(id, { sync_status: 'synced' });
          return data;
        }
      } catch (err) {
        console.warn('Direct updatePatient failed, enqueued', err);
      }
    }

    await syncManager.enqueue('patients', id, 'UPDATE', payload);
    return updatedLocal as unknown as Patient;
  },

  // Visits
  async getVisits(): Promise<Visit[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .order('visit_date', { ascending: false });
        if (!error && data) {
          for (const item of data) {
            const existing = await db.visits.get(item.id);
            if (!existing || existing.sync_status === 'synced') {
              await db.visits.put({
                ...item,
                sync_status: 'synced',
                local_created_at: item.created_at || nowISO(),
                local_updated_at: item.created_at || nowISO(),
              });
            }
          }
          return data;
        }
      }
    } catch {
      // offline fallback
    }
    const local = await db.visits.toArray();
    return local.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()) as unknown as Visit[];
  },

  async getVisitsByPatient(patientId: string): Promise<Visit[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('patient_id', patientId)
          .order('visit_date', { ascending: false });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.visits.where('patient_id').equals(patientId).toArray();
    return local.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()) as unknown as Visit[];
  },

  // Follow-ups
  async getFollowUps(): Promise<FollowUp[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('follow_ups')
          .select('*')
          .order('due_date', { ascending: true });
        if (!error && data) {
          for (const item of data) {
            const existing = await db.follow_ups.get(item.id);
            if (!existing || existing.sync_status === 'synced') {
              await db.follow_ups.put({
                ...item,
                sync_status: 'synced',
                local_created_at: item.created_at || nowISO(),
                local_updated_at: item.updated_at || nowISO(),
              });
            }
          }
          return data;
        }
      }
    } catch {
      // offline fallback
    }
    const local = await db.follow_ups.toArray();
    return local.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) as unknown as FollowUp[];
  },

  // Medicines Catalog
  async getMedicines(): Promise<Medicine[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .eq('active', true)
          .order('name', { ascending: true });
        if (!error && data) {
          for (const item of data) {
            await db.medicines.put({
              ...item,
              sync_status: 'synced',
              local_created_at: item.created_at || nowISO(),
              local_updated_at: item.created_at || nowISO(),
            });
          }
          return data;
        }
      }
    } catch {
      // offline fallback
    }
    const local = await db.medicines.toArray();
    return local as unknown as Medicine[];
  },

  // Medicine Stock
  async getMedicineStock(): Promise<MedicineStock[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('medicine_stock')
          .select('*, medicine:medicines(*)')
          .order('quantity', { ascending: true });
        if (!error && data) {
          for (const item of data) {
            await db.medicine_stock.put({
              id: item.id,
              medicine_id: item.medicine_id,
              quantity: item.quantity,
              min_threshold: item.minimum_quantity || 10,
              sync_status: 'synced',
              local_created_at: item.created_at || nowISO(),
              local_updated_at: item.updated_at || nowISO(),
            });
          }
          return data;
        }
      }
    } catch {
      // offline fallback
    }
    const local = await db.medicine_stock.toArray();
    const medicines = await db.medicines.toArray();
    const medMap = new Map(medicines.map(m => [m.id, m]));
    return local.map(s => ({
      id: s.id,
      medicine_id: s.medicine_id,
      quantity: s.quantity,
      minimum_quantity: s.min_threshold,
      medicine: medMap.get(s.medicine_id),
    })) as unknown as MedicineStock[];
  },

  // Medicine Orders
  async getMedicineOrders(): Promise<MedicineOrder[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('medicine_orders')
          .select('*, medicine:medicines(*)')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.medicine_orders.toArray();
    const medicines = await db.medicines.toArray();
    const medMap = new Map(medicines.map(m => [m.id, m]));
    return local.map(o => ({
      id: o.id,
      medicine_id: o.medicine_id,
      asha_id: o.asha_id,
      requested_quantity: o.requested_quantity,
      status: o.status,
      notes: o.notes,
      approved_quantity: o.approved_quantity,
      medicine: medMap.get(o.medicine_id),
      created_at: o.local_created_at,
    })) as unknown as MedicineOrder[];
  },



  // ASHA Workers (For Supervisor/Manager views)
  async getAshaWorkers(): Promise<AshaWorker[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('asha_workers')
          .select('*')
          .order('village', { ascending: true });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    return [];
  },

  // Get a single visit by ID
  async getVisitById(id: string): Promise<Visit | null> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.visits.get(id);
    return (local as unknown as Visit) || null;
  },

  // Create a new visit (and optional auto follow-up)
  async createVisit(input: {
    patient_id: string;
    asha_id: string;
    visit_date?: string;
    visit_type: string;
    notes?: string;
    follow_up_required?: boolean;
    next_follow_up_date?: string;
    follow_up_note?: string;
  }): Promise<Visit> {
    const isOnline = connectivityService.isOnline();
    const id = newLocalId();
    const ts = nowISO();

    const localRecord = {
      id,
      patient_id: input.patient_id,
      asha_id: input.asha_id,
      visit_date: input.visit_date || ts.split('T')[0],
      visit_type: input.visit_type,
      notes: input.notes?.trim() || null,
      follow_up_required: input.follow_up_required ?? false,
      next_follow_up_date: input.follow_up_required && input.next_follow_up_date ? input.next_follow_up_date : null,
      follow_up_note: input.follow_up_required && input.follow_up_note ? input.follow_up_note.trim() : null,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !isOnline,
    };

    await db.visits.put(localRecord);

    const payload: Record<string, unknown> = {
      id: localRecord.id,
      patient_id: localRecord.patient_id,
      asha_id: localRecord.asha_id,
      visit_type: localRecord.visit_type,
      notes: localRecord.notes,
      follow_up_required: localRecord.follow_up_required,
      visit_date: localRecord.visit_date,
    };
    if (localRecord.follow_up_required && localRecord.next_follow_up_date) {
      payload.next_follow_up_date = localRecord.next_follow_up_date;
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('visits')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          await db.visits.update(id, { sync_status: 'synced' });
        }
      } catch (err) {
        console.warn('Direct createVisit online failed, queued', err);
      }
    }

    // Enqueue sync operation with dependency on patient_id
    await syncManager.enqueue('visits', id, 'CREATE', payload, input.patient_id);

    await auditLogger.log({
      action: 'VISIT_CREATED',
      tableName: 'visits',
      recordId: id,
      metadata: { patient_id: input.patient_id, visit_type: input.visit_type },
    });

    // Auto-create follow-up if requested
    if (input.follow_up_required && input.next_follow_up_date) {
      await this.createFollowUp({
        patient_id: input.patient_id,
        assigned_asha_id: input.asha_id,
        due_date: input.next_follow_up_date,
        notes: input.follow_up_note,
      });
    }

    return localRecord as unknown as Visit;
  },

  // Get follow-ups for a specific patient
  async getFollowUpsByPatient(patientId: string): Promise<FollowUp[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('follow_ups')
          .select('*')
          .eq('patient_id', patientId)
          .order('due_date', { ascending: true });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.follow_ups.where('patient_id').equals(patientId).toArray();
    return local.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) as unknown as FollowUp[];
  },

  // Create a follow-up (standalone or from visit)
  async createFollowUp(input: {
    patient_id: string;
    assigned_asha_id: string;
    due_date: string;
    notes?: string;
  }): Promise<FollowUp> {
    const isOnline = connectivityService.isOnline();
    const id = newLocalId();
    const ts = nowISO();

    const localRecord = {
      id,
      patient_id: input.patient_id,
      assigned_asha_id: input.assigned_asha_id,
      due_date: input.due_date,
      notes: input.notes || null,
      status: 'pending' as const,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !isOnline,
    };

    await db.follow_ups.put(localRecord);

    const payload = {
      id: localRecord.id,
      patient_id: localRecord.patient_id,
      assigned_asha_id: localRecord.assigned_asha_id,
      due_date: localRecord.due_date,
      notes: localRecord.notes,
      status: localRecord.status,
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          await db.follow_ups.update(id, { sync_status: 'synced' });
        }
      } catch (err) {
        console.warn('Direct createFollowUp failed, queued', err);
      }
    }

    await syncManager.enqueue('follow_ups', id, 'CREATE', payload, input.patient_id);

    await auditLogger.log({
      action: 'FOLLOW_UP_CREATED',
      tableName: 'follow_ups',
      recordId: id,
      metadata: { patient_id: input.patient_id, due_date: input.due_date },
    });

    return localRecord as unknown as FollowUp;
  },

  // Update follow-up (mark completed, missed, etc.)
  async updateFollowUp(id: string, updates: { status: string; completed_at?: string; notes?: string }): Promise<FollowUp> {
    const isOnline = connectivityService.isOnline();
    const ts = nowISO();

    const existing = await db.follow_ups.get(id);
    const updated = {
      ...(existing || {}),
      status: updates.status as any,
      ...(updates.completed_at ? { completed_at: updates.completed_at } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      id,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_updated_at: ts,
    };

    await db.follow_ups.put(updated as any);

    const payload: Record<string, unknown> = {
      id,
      status: updates.status,
      updated_at: ts,
    };
    if (updates.completed_at) payload.completed_at = updates.completed_at;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          await db.follow_ups.update(id, { sync_status: 'synced' });
        }
      } catch (err) {
        console.warn('Direct updateFollowUp failed, queued', err);
      }
    }

    await syncManager.enqueue('follow_ups', id, 'UPDATE', payload);

    const auditAction = updates.status === 'completed' ? 'FOLLOW_UP_COMPLETED' : 'FOLLOW_UP_MISSED';
    await auditLogger.log({
      action: auditAction,
      tableName: 'follow_ups',
      recordId: id,
      metadata: { status: updates.status },
    });

    return updated as unknown as FollowUp;
  },

  // Get referrals for a specific patient
  async getReferralsByPatient(patientId: string): Promise<Referral[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('patient_id', patientId)
          .order('referral_date', { ascending: false });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.referrals.where('patient_id').equals(patientId).toArray();
    return local.sort((a, b) => new Date(b.referral_date).getTime() - new Date(a.referral_date).getTime()) as unknown as Referral[];
  },

  // Get all referrals
  async getReferrals(): Promise<Referral[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .order('referral_date', { ascending: false });
        if (!error && data) return data;
      }
    } catch {
      // offline fallback
    }
    const local = await db.referrals.toArray();
    return local.sort((a, b) => new Date(b.referral_date).getTime() - new Date(a.referral_date).getTime()) as unknown as Referral[];
  },

  // Create a referral
  async createReferral(input: {
    patient_id: string;
    asha_id: string;
    referred_to: string;
    reason: string;
    referral_date?: string;
    status?: string;
    notes?: string;
  }): Promise<Referral> {
    const isOnline = connectivityService.isOnline();
    const id = newLocalId();
    const ts = nowISO();

    const localRecord = {
      id,
      patient_id: input.patient_id,
      asha_id: input.asha_id,
      referred_to: input.referred_to,
      reason: input.reason,
      referral_date: input.referral_date || ts.split('T')[0],
      status: (input.status || 'pending') as any,
      notes: input.notes || null,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !isOnline,
    };

    await db.referrals.put(localRecord);

    const payload = {
      id: localRecord.id,
      patient_id: localRecord.patient_id,
      asha_id: localRecord.asha_id,
      referred_to: localRecord.referred_to,
      reason: localRecord.reason,
      referral_date: localRecord.referral_date,
      status: localRecord.status,
      notes: localRecord.notes,
    };

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          await db.referrals.update(id, { sync_status: 'synced' });
        }
      } catch (err) {
        console.warn('Direct createReferral failed, queued', err);
      }
    }

    await syncManager.enqueue('referrals', id, 'CREATE', payload, input.patient_id);

    await auditLogger.log({
      action: 'REFERRAL_CREATED',
      tableName: 'referrals',
      recordId: id,
      metadata: { patient_id: input.patient_id, referred_to: input.referred_to },
    });

    return localRecord as unknown as Referral;
  },

  // Update referral status/details
  async updateReferral(id: string, updates: { status?: string; notes?: string; referral_date?: string }): Promise<Referral> {
    const isOnline = connectivityService.isOnline();
    const ts = nowISO();

    const existing = await db.referrals.get(id);
    const updated = {
      ...(existing || {}),
      ...(updates.status ? { status: updates.status as any } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
      ...(updates.referral_date ? { referral_date: updates.referral_date } : {}),
      id,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_updated_at: ts,
    };

    await db.referrals.put(updated as any);

    const payload: Record<string, unknown> = {
      id,
      updated_at: ts,
    };
    if (updates.status) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.referral_date) payload.referral_date = updates.referral_date;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('referrals')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          await db.referrals.update(id, { sync_status: 'synced' });
        }
      } catch (err) {
        console.warn('Direct updateReferral failed, queued', err);
      }
    }

    await syncManager.enqueue('referrals', id, 'UPDATE', payload);

    await auditLogger.log({
      action: 'REFERRAL_STATUS_UPDATED',
      tableName: 'referrals',
      recordId: id,
      metadata: { status: updates.status },
    });

    return updated as unknown as Referral;
  },

  // ASHA creates a medicine request
  async createMedicineOrder(input: {
    asha_id: string;
    medicine_id: string;
    requested_quantity: number;
  }): Promise<MedicineOrder> {
    const isOnline = connectivityService.isOnline();
    const id = newLocalId();
    const ts = nowISO();

    const localRecord = {
      id,
      asha_id: input.asha_id,
      medicine_id: input.medicine_id,
      requested_quantity: input.requested_quantity,
      status: 'pending' as const,
      sync_status: (isOnline ? 'synced' : 'pending') as 'synced' | 'pending',
      local_created_at: ts,
      local_updated_at: ts,
      created_offline: !isOnline,
    };

    await db.medicine_orders.put(localRecord);

    const payload = {
      id: localRecord.id,
      asha_id: localRecord.asha_id,
      medicine_id: localRecord.medicine_id,
      requested_quantity: localRecord.requested_quantity,
      status: localRecord.status,
    };

    let resultRecord: MedicineOrder = localRecord as unknown as MedicineOrder;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('medicine_orders')
          .insert(payload)
          .select('*, medicine:medicines(*)')
          .single();
        if (!error && data) {
          await db.medicine_orders.update(id, { sync_status: 'synced' });
          resultRecord = data;
        }
      } catch (err) {
        console.warn('Direct createMedicineOrder failed, queued', err);
      }
    }

    await syncManager.enqueue('medicine_orders', id, 'CREATE', payload);

    await auditLogger.log({
      action: 'MEDICINE_REQUEST_CREATED',
      tableName: 'medicine_orders',
      recordId: id,
      metadata: { medicine_id: input.medicine_id, quantity: input.requested_quantity },
    });

    return resultRecord;
  },

  // Supervisor/Manager approves or rejects a medicine order
  async updateMedicineOrder(
    id: string,
    updates: {
      status: 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
      approved_quantity?: number;
      rejection_reason?: string;
      reviewed_by?: string;
    }
  ): Promise<MedicineOrder> {
    const payload: Record<string, unknown> = {
      status: updates.status,
      updated_at: new Date().toISOString(),
    };
    if (updates.approved_quantity !== undefined) payload.approved_quantity = updates.approved_quantity;
    if (updates.rejection_reason) payload.rejection_reason = updates.rejection_reason;
    if (updates.reviewed_by) {
      payload.reviewed_by = updates.reviewed_by;
      payload.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('medicine_orders')
      .update(payload)
      .eq('id', id)
      .select('*, medicine:medicines(*)')
      .single();
    if (error) throw error;

    const auditAction =
      updates.status === 'approved'
        ? 'MEDICINE_REQUEST_APPROVED'
        : updates.status === 'rejected'
        ? 'MEDICINE_REQUEST_REJECTED'
        : updates.status === 'fulfilled'
        ? 'MEDICINE_REQUEST_FULFILLED'
        : 'MEDICINE_REQUEST_CANCELLED';

    await auditLogger.log({
      action: auditAction,
      tableName: 'medicine_orders',
      recordId: data.id,
      metadata: { status: updates.status, approved_quantity: updates.approved_quantity },
    });

    return data as MedicineOrder;
  },

  // Manager updates stock quantity for an item
  async updateStockQuantity(
    stockId: string,
    newQuantity: number,
    minimumQuantity?: number
  ): Promise<MedicineStock> {
    const payload: Record<string, unknown> = {
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    };
    if (minimumQuantity !== undefined) payload.minimum_quantity = minimumQuantity;

    const { data, error } = await supabase
      .from('medicine_stock')
      .update(payload)
      .eq('id', stockId)
      .select('*, medicine:medicines(*)')
      .single();
    if (error) throw error;

    await auditLogger.log({
      action: 'STOCK_ADJUSTED',
      tableName: 'medicine_stock',
      recordId: stockId,
      metadata: { quantity: newQuantity, minimum_quantity: minimumQuantity },
    });

    return data as MedicineStock;
  },

  // ─── Phase 5: Maternal / Pregnancy Tracking ───────────────────

  // Helper for offline / local-fallback pregnancy store
  _getLocalPregnancies(): Pregnancy[] {
    try {
      const stored = localStorage.getItem('asha_local_pregnancies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  _saveLocalPregnancies(items: Pregnancy[]): void {
    try {
      localStorage.setItem('asha_local_pregnancies', JSON.stringify(items));
    } catch (err) {
      console.warn('Could not write local pregnancies', err);
    }
  },

  // Get all pregnancy records for a patient (history preserved)
  async getPregnanciesByPatient(patientId: string): Promise<Pregnancy[]> {
    try {
      const { data, error } = await supabase
        .from('pregnancies')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Merge or cache to local store
        return data as Pregnancy[];
      }
    } catch {
      // Table may not exist yet in live remote DB or offline, use local storage fallback
    }

    const localItems = this._getLocalPregnancies().filter(p => p.patient_id === patientId);
    return localItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Get current active pregnancy for a patient
  async getActivePregnancyByPatient(patientId: string): Promise<Pregnancy | null> {
    const records = await this.getPregnanciesByPatient(patientId);
    return records.find(p => p.status === 'active') || null;
  },

  // Get all active pregnancies (for dashboard & filters)
  async getAllActivePregnancies(): Promise<Pregnancy[]> {
    try {
      const { data, error } = await supabase
        .from('pregnancies')
        .select('*')
        .eq('status', 'active');
      
      if (!error && data) {
        return data as Pregnancy[];
      }
    } catch {
      // Fallback
    }

    return this._getLocalPregnancies().filter(p => p.status === 'active');
  },

  // Start / Create a new pregnancy record
  async createPregnancy(input: {
    patient_id: string;
    lmp_date?: string | null;
    expected_due_date?: string | null;
    registration_date?: string;
    gravida?: number;
    para?: number;
    notes?: string | null;
  }): Promise<Pregnancy> {
    const payload = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'preg-' + Date.now(),
      patient_id: input.patient_id,
      status: 'active' as PregnancyStatus,
      lmp_date: input.lmp_date || null,
      expected_due_date: input.expected_due_date || null,
      registration_date: input.registration_date || new Date().toISOString().split('T')[0],
      gravida: input.gravida ?? 1,
      para: input.para ?? 0,
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let resultRecord: Pregnancy = payload;

    try {
      const { data, error } = await supabase
        .from('pregnancies')
        .insert(payload)
        .select()
        .single();
      
      if (!error && data) {
        resultRecord = data as Pregnancy;
      } else {
        // Fallback save locally
        const list = this._getLocalPregnancies();
        list.push(payload);
        this._saveLocalPregnancies(list);
      }
    } catch {
      const list = this._getLocalPregnancies();
      list.push(payload);
      this._saveLocalPregnancies(list);
    }

    await auditLogger.log({
      action: 'PREGNANCY_RECORD_CREATED',
      tableName: 'pregnancies',
      recordId: resultRecord.id,
      metadata: { patient_id: input.patient_id, edd: input.expected_due_date },
    });

    return resultRecord;
  },

  // Update pregnancy record (e.g. mark completed, cancelled, update dates/notes)
  async updatePregnancy(
    id: string,
    updates: {
      status?: PregnancyStatus;
      lmp_date?: string | null;
      expected_due_date?: string | null;
      notes?: string | null;
      gravida?: number;
      para?: number;
    }
  ): Promise<Pregnancy> {
    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    let updatedRecord: Pregnancy | null = null;

    try {
      const { data, error } = await supabase
        .from('pregnancies')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        updatedRecord = data as Pregnancy;
      }
    } catch {
      // Fallback
    }

    // Always keep local fallback synced
    const list = this._getLocalPregnancies();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...payload } as Pregnancy;
      this._saveLocalPregnancies(list);
      if (!updatedRecord) updatedRecord = list[index];
    }

    if (!updatedRecord) {
      updatedRecord = {
        id,
        patient_id: '',
        status: updates.status || 'active',
        lmp_date: updates.lmp_date || null,
        expected_due_date: updates.expected_due_date || null,
        registration_date: new Date().toISOString().split('T')[0],
        gravida: updates.gravida || 1,
        para: updates.para || 0,
        notes: updates.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    if (updates.status) {
      await auditLogger.log({
        action: 'PREGNANCY_STATUS_CHANGED',
        tableName: 'pregnancies',
        recordId: id,
        metadata: { new_status: updates.status },
      });
    } else {
      await auditLogger.log({
        action: 'PREGNANCY_RECORD_UPDATED',
        tableName: 'pregnancies',
        recordId: id,
        metadata: updates,
      });
    }

    return updatedRecord;
  },

  // ─── Phase 7: Tasks ─────────────────────────────────────────────────────────

  async getTasks(filters?: { status?: TaskStatus; assignedTo?: string }): Promise<Task[]> {
    try {
      if (connectivityService.isOnline()) {
        let query = supabase
          .from('tasks')
          .select('*, patient:patients(id, full_name, patient_code)')
          .order('due_date', { ascending: true });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo);

        const { data, error } = await query;
        if (!error && data) return data as Task[];
      }
    } catch (err) {
      console.warn('getTasks network failed, returning empty', err);
    }
    return [];
  },

  async getTasksByDateRange(from: string, to: string): Promise<Task[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, patient:patients(id, full_name, patient_code)')
          .gte('due_date', from)
          .lte('due_date', to)
          .order('due_date', { ascending: true });
        if (!error && data) return data as Task[];
      }
    } catch (err) {
      console.warn('getTasksByDateRange failed', err);
    }
    return [];
  },

  async createTask(input: {
    assigned_to: string;
    task_type: TaskType;
    source_type?: string | null;
    source_id?: string | null;
    patient_id?: string | null;
    title: string;
    description?: string | null;
    due_date: string;
    priority?: TaskPriority;
  }): Promise<Task | null> {
    try {
      if (connectivityService.isOnline()) {
        // Idempotency: check if a non-completed task for same source already exists
        if (input.source_type && input.source_id) {
          const { data: existing } = await supabase
            .from('tasks')
            .select('*')
            .eq('source_type', input.source_type)
            .eq('source_id', input.source_id)
            .eq('task_type', input.task_type)
            .not('status', 'in', '("completed","dismissed")')
            .maybeSingle();
          if (existing) return existing as Task;
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert({ ...input, priority: input.priority || 'normal', status: 'pending' })
          .select()
          .single();
        if (!error && data) {
          await auditLogger.log({ action: 'TASK_CREATED', tableName: 'tasks', recordId: data.id, metadata: { task_type: input.task_type } });
          return data as Task;
        }
        console.error('createTask error:', error);
      }
    } catch (err) {
      console.error('createTask failed:', err);
    }
    return null;
  },

  async completeTask(taskId: string): Promise<Task | null> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', taskId)
          .select()
          .single();
        if (!error && data) {
          await auditLogger.log({ action: 'TASK_COMPLETED', tableName: 'tasks', recordId: taskId, metadata: {} });
          return data as Task;
        }
      }
    } catch (err) {
      console.error('completeTask failed:', err);
    }
    return null;
  },

  async dismissTask(taskId: string): Promise<Task | null> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ status: 'dismissed' })
          .eq('id', taskId)
          .select()
          .single();
        if (!error && data) return data as Task;
      }
    } catch (err) {
      console.error('dismissTask failed:', err);
    }
    return null;
  },

  async getOverdueTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, patient:patients(id, full_name, patient_code)')
          .lt('due_date', today)
          .in('status', ['pending', 'in_progress'])
          .order('due_date', { ascending: true });
        if (!error && data) return data as Task[];
      }
    } catch (err) {
      console.warn('getOverdueTasks failed', err);
    }
    return [];
  },

  async getTaskCountsByStatus(): Promise<Record<string, number>> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('tasks')
          .select('status');
        if (!error && data) {
          return data.reduce((acc: Record<string, number>, row: { status: string }) => {
            acc[row.status] = (acc[row.status] || 0) + 1;
            return acc;
          }, {});
        }
      }
    } catch (err) {
      console.warn('getTaskCountsByStatus failed', err);
    }
    return {};
  },

  // ─── Phase 7: Notifications (improved) ──────────────────────────────────────

  async getNotifications(): Promise<Notification[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data) {
          // Cache in local DB for offline display
          for (const n of data) {
            await db.notifications.put({
              ...n,
              sync_status: 'synced',
              local_created_at: n.created_at,
              local_updated_at: n.created_at,
            }).catch(() => {});
          }
          return data as Notification[];
        }
      }
    } catch (err) {
      console.warn('getNotifications network failed, using local cache', err);
    }
    const local = await db.notifications.orderBy('local_created_at').reverse().limit(50).toArray();
    return local.map(n => ({
      id: n.id,
      recipient_profile_id: n.recipient_profile_id || '',
      title: n.title,
      message: n.message,
      type: (n.type || 'info') as Notification['type'],
      is_read: n.is_read ?? false,
      created_at: n.local_created_at,
    }));
  },

  async getUnreadNotificationCount(): Promise<number> {
    try {
      if (connectivityService.isOnline()) {
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);
        if (!error && count !== null) return count;
      }
    } catch {/* fallback */}
    const local = await db.notifications.where('is_read').equals(0).count();
    return local;
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      if (connectivityService.isOnline()) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
      await db.notifications.update(id, { is_read: true, read: true }).catch(() => {});
    } catch (err) {
      console.error('markNotificationRead failed:', err);
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      if (connectivityService.isOnline()) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('is_read', false);
      }
      await db.notifications.toCollection().modify((notif) => {
        notif.is_read = true;
        notif.read = true;
      }).catch(() => {});
    } catch (err) {
      console.error('markAllNotificationsRead failed:', err);
    }
  },

  async sendNotification(input: {
    recipient_profile_id: string;
    title: string;
    message: string;
    type?: Notification['type'];
    source_type?: string;
    source_id?: string;
    action_type?: string;
  }): Promise<void> {
    try {
      if (connectivityService.isOnline()) {
        await supabase.from('notifications').insert({
          recipient_profile_id: input.recipient_profile_id,
          title: input.title,
          message: input.message,
          type: input.type || 'info',
          is_read: false,
          source_type: input.source_type || null,
          source_id: input.source_id || null,
          action_type: input.action_type || null,
        });
      }
    } catch (err) {
      console.error('sendNotification failed:', err);
    }
  },

  // ─── Phase 7: Supervisor — ASHA Activity Overview ───────────────────────────

  async getSupervisorStats(): Promise<{
    totalAshas: number;
    totalPatients: number;
    visitsThisWeek: number;
    pendingFollowUps: number;
    pendingReferrals: number;
    pendingMedicineOrders: number;
  }> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    try {
      if (connectivityService.isOnline()) {
        const [ashas, patients, visits, followUps, referrals, orders] = await Promise.all([
          supabase.from('asha_workers').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('visits').select('id', { count: 'exact', head: true }).gte('visit_date', weekAgo),
          supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('status', 'referred'),
          supabase.from('medicine_orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);
        return {
          totalAshas: ashas.count || 0,
          totalPatients: patients.count || 0,
          visitsThisWeek: visits.count || 0,
          pendingFollowUps: followUps.count || 0,
          pendingReferrals: referrals.count || 0,
          pendingMedicineOrders: orders.count || 0,
        };
      }
    } catch (err) {
      console.warn('getSupervisorStats failed', err);
    }
    return { totalAshas: 0, totalPatients: 0, visitsThisWeek: 0, pendingFollowUps: 0, pendingReferrals: 0, pendingMedicineOrders: 0 };
  },

  async getRecentVisitsForSupervisor(limit = 10): Promise<Visit[]> {
    try {
      if (connectivityService.isOnline()) {
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) return data as Visit[];
      }
    } catch (err) { console.warn(err); }
    return [];
  },

  // ─── Phase 7: Manager — Inventory & Operational View ────────────────────────

  async getManagerStats(): Promise<{
    pendingMedicineOrders: number;
    lowStockItems: number;
    outOfStockItems: number;
    fulfilledThisWeek: number;
  }> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    try {
      if (connectivityService.isOnline()) {
        const [pending, stock, fulfilled] = await Promise.all([
          supabase.from('medicine_orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('medicine_stock').select('quantity, minimum_quantity'),
          supabase.from('medicine_orders').select('id', { count: 'exact', head: true }).eq('status', 'fulfilled').gte('updated_at', weekAgo),
        ]);

        const stockData = stock.data || [];
        const lowStock = stockData.filter((s: { quantity: number; minimum_quantity: number }) => s.quantity > 0 && s.quantity <= s.minimum_quantity).length;
        const outOfStock = stockData.filter((s: { quantity: number }) => s.quantity === 0).length;

        return {
          pendingMedicineOrders: pending.count || 0,
          lowStockItems: lowStock,
          outOfStockItems: outOfStock,
          fulfilledThisWeek: fulfilled.count || 0,
        };
      }
    } catch (err) {
      console.warn('getManagerStats failed', err);
    }
    return { pendingMedicineOrders: 0, lowStockItems: 0, outOfStockItems: 0, fulfilledThisWeek: 0 };
  },
};


