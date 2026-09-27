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
  PregnancyStatus
} from '@/types/database';


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
    const { data, error } = await supabase
      .from('households')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getHouseholdById(id: string): Promise<Household | null> {
    const { data, error } = await supabase
      .from('households')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createHousehold(input: CreateHouseholdInput): Promise<Household> {
    const { data, error } = await supabase
      .from('households')
      .insert({
        household_code: input.household_code.trim(),
        head_of_family: input.head_of_family.trim(),
        address: input.address.trim(),
        village: input.village.trim(),
        ward: input.ward?.trim() || null,
        assigned_asha_id: input.assigned_asha_id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPatientsByHousehold(householdId: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert({
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
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePatient(id: string, input: UpdatePatientInput): Promise<Patient> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.full_name !== undefined) payload.full_name = input.full_name.trim();
    if (input.date_of_birth !== undefined) payload.date_of_birth = input.date_of_birth;
    if (input.gender !== undefined) payload.gender = input.gender;
    if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
    if (input.relationship_to_head !== undefined) payload.relationship_to_head = input.relationship_to_head?.trim() || null;
    if (input.status !== undefined) payload.status = input.status;

    const { data, error } = await supabase
      .from('patients')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Visits
  async getVisits(): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('visit_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getVisitsByPatient(patientId: string): Promise<Visit[]> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Follow-ups
  async getFollowUps(): Promise<FollowUp[]> {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Medicines Catalog
  async getMedicines(): Promise<Medicine[]> {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Medicine Stock
  async getMedicineStock(): Promise<MedicineStock[]> {
    const { data, error } = await supabase
      .from('medicine_stock')
      .select('*, medicine:medicines(*)')
      .order('quantity', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Medicine Orders
  async getMedicineOrders(): Promise<MedicineOrder[]> {
    const { data, error } = await supabase
      .from('medicine_orders')
      .select('*, medicine:medicines(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ASHA Workers (For Supervisor/Manager views)
  async getAshaWorkers(): Promise<AshaWorker[]> {
    const { data, error } = await supabase
      .from('asha_workers')
      .select('*')
      .order('village', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  // ─── Phase 3: Visits, Follow-ups, Referrals ───────────────────

  // Get a single visit by ID
  async getVisitById(id: string): Promise<Visit | null> {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
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
    const payload: Record<string, unknown> = {
      patient_id: input.patient_id,
      asha_id: input.asha_id,
      visit_type: input.visit_type,
      notes: input.notes?.trim() || null,
      follow_up_required: input.follow_up_required ?? false,
    };
    if (input.visit_date) payload.visit_date = input.visit_date;
    if (input.follow_up_required && input.next_follow_up_date) {
      payload.next_follow_up_date = input.next_follow_up_date;
    }

    const { data, error } = await supabase
      .from('visits')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    await auditLogger.log({
      action: 'VISIT_CREATED',
      tableName: 'visits',
      recordId: data.id,
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

    return data as Visit;
  },

  // Get follow-ups for a specific patient
  async getFollowUpsByPatient(patientId: string): Promise<FollowUp[]> {
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('patient_id', patientId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Create a follow-up (standalone or from visit)
  async createFollowUp(input: {
    patient_id: string;
    assigned_asha_id: string;
    due_date: string;
    notes?: string;
  }): Promise<FollowUp> {
    const { data, error } = await supabase
      .from('follow_ups')
      .insert({
        patient_id: input.patient_id,
        assigned_asha_id: input.assigned_asha_id,
        due_date: input.due_date,
        notes: input.notes || null,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;

    await auditLogger.log({
      action: 'FOLLOW_UP_CREATED',
      tableName: 'follow_ups',
      recordId: data.id,
      metadata: { patient_id: input.patient_id, due_date: input.due_date },
    });

    return data as FollowUp;
  },

  // Update follow-up (mark completed, missed, etc.)
  async updateFollowUp(id: string, updates: { status: string; completed_at?: string; notes?: string }): Promise<FollowUp> {
    const payload: Record<string, unknown> = { status: updates.status, updated_at: new Date().toISOString() };
    if (updates.completed_at) payload.completed_at = updates.completed_at;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase
      .from('follow_ups')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    const auditAction = updates.status === 'completed' ? 'FOLLOW_UP_COMPLETED' : 'FOLLOW_UP_MISSED';
    await auditLogger.log({
      action: auditAction,
      tableName: 'follow_ups',
      recordId: data.id,
      metadata: { status: updates.status },
    });

    return data as FollowUp;
  },

  // Get referrals for a specific patient
  async getReferralsByPatient(patientId: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('patient_id', patientId)
      .order('referral_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Get all referrals
  async getReferrals(): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('referral_date', { ascending: false });
    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        patient_id: input.patient_id,
        asha_id: input.asha_id,
        referred_to: input.referred_to,
        reason: input.reason,
        referral_date: input.referral_date || new Date().toISOString().split('T')[0],
        status: input.status || 'referred',
        notes: input.notes || null,
      })
      .select()
      .single();
    if (error) throw error;

    await auditLogger.log({
      action: 'REFERRAL_CREATED',
      tableName: 'referrals',
      recordId: data.id,
      metadata: { patient_id: input.patient_id, referred_to: input.referred_to },
    });

    return data as Referral;
  },

  // Update referral status/details
  async updateReferral(id: string, updates: { status?: string; notes?: string; referral_date?: string }): Promise<Referral> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.status) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.referral_date) payload.referral_date = updates.referral_date;

    const { data, error } = await supabase
      .from('referrals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await auditLogger.log({
      action: 'REFERRAL_STATUS_UPDATED',
      tableName: 'referrals',
      recordId: data.id,
      metadata: { status: updates.status },
    });

    return data as Referral;
  },

  // ─── Phase 4: Medicine Requests & Stock ────────────────────────

  // ASHA creates a medicine request
  async createMedicineOrder(input: {
    asha_id: string;
    medicine_id: string;
    requested_quantity: number;
  }): Promise<MedicineOrder> {
    const { data, error } = await supabase
      .from('medicine_orders')
      .insert({
        asha_id: input.asha_id,
        medicine_id: input.medicine_id,
        requested_quantity: input.requested_quantity,
        status: 'pending',
      })
      .select('*, medicine:medicines(*)')
      .single();
    if (error) throw error;

    await auditLogger.log({
      action: 'MEDICINE_REQUEST_CREATED',
      tableName: 'medicine_orders',
      recordId: data.id,
      metadata: { medicine_id: input.medicine_id, quantity: input.requested_quantity },
    });

    return data as MedicineOrder;
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
};


