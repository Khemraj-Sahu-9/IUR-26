import { supabase } from '@/lib/supabaseClient';
import { 
  Household, 
  Patient, 
  Visit, 
  FollowUp, 
  Medicine, 
  MedicineStock, 
  MedicineOrder, 
  Notification,
  AshaWorker
} from '@/types/database';

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

  // Patients
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
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
};
