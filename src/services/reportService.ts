/**
 * reportService.ts
 *
 * Phase 8 — Reports, Analytics & Operational Insights
 *
 * All queries respect Supabase RLS — the user's session token is applied
 * automatically. No client-side-only access control here.
 *
 * Principles:
 *  - Prefer server-side aggregation (count queries, not full table downloads)
 *  - Use date ranges supplied by the caller, never default to "all time"
 *  - Never expose passwords, tokens, or secrets
 *  - Respect the analytics-only principle: counts, not clinical conclusions
 */

import { supabase } from '@/lib/supabaseClient';

// ─── Date Range Helpers ───────────────────────────────────────────────────────

export type DateRangePreset = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom';

export interface DateRange {
  from: string; // ISO date YYYY-MM-DD
  to: string;   // ISO date YYYY-MM-DD (inclusive)
}

export function getDateRange(preset: DateRangePreset, custom?: DateRange): DateRange {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toISODate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const todayStr = toISODate(today);

  switch (preset) {
    case 'today':
      return { from: todayStr, to: todayStr };
    case 'last7': {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: toISODate(d), to: todayStr };
    }
    case 'last30': {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { from: toISODate(d), to: todayStr };
    }
    case 'thisMonth': {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toISODate(d), to: todayStr };
    }
    case 'custom':
      return custom ?? { from: todayStr, to: todayStr };
  }
}

// ─── ASHA Personal Reports ────────────────────────────────────────────────────

export interface AshaVisitReport {
  total: number;
  byType: Record<string, number>;
  byDay: { date: string; count: number }[];
}

export async function getAshaVisitReport(range: DateRange): Promise<AshaVisitReport> {
  const { data, error } = await supabase
    .from('visits')
    .select('visit_date, visit_type')
    .gte('visit_date', range.from)
    .lte('visit_date', range.to)
    .order('visit_date', { ascending: true });

  if (error) throw new Error(`Visit report error: ${error.message}`);

  const rows = data ?? [];
  const byType: Record<string, number> = {};
  const byDayMap: Record<string, number> = {};

  for (const r of rows) {
    byType[r.visit_type] = (byType[r.visit_type] ?? 0) + 1;
    byDayMap[r.visit_date] = (byDayMap[r.visit_date] ?? 0) + 1;
  }

  const byDay = Object.entries(byDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return { total: rows.length, byType, byDay };
}

export interface AshaFollowUpReport {
  total: number;
  completed: number;
  pending: number;
  missed: number;
  overdue: number;
  cancelled: number;
}

export async function getAshaFollowUpReport(range: DateRange): Promise<AshaFollowUpReport> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('follow_ups')
    .select('status, due_date')
    .gte('due_date', range.from)
    .lte('due_date', range.to);

  if (error) throw new Error(`Follow-up report error: ${error.message}`);

  const rows = data ?? [];
  const result: AshaFollowUpReport = { total: rows.length, completed: 0, pending: 0, missed: 0, overdue: 0, cancelled: 0 };

  for (const r of rows) {
    if (r.status === 'completed')  result.completed++;
    else if (r.status === 'missed') result.missed++;
    else if (r.status === 'cancelled') result.cancelled++;
    else if (r.status === 'pending') {
      result.pending++;
      if (r.due_date < today) result.overdue++;
    }
  }

  return result;
}

export interface AshaReferralReport {
  total: number;
  referred: number;
  visited: number;
  admitted: number;
  discharged: number;
  cancelled: number;
}

export async function getAshaReferralReport(range: DateRange): Promise<AshaReferralReport> {
  const { data, error } = await supabase
    .from('referrals')
    .select('status')
    .gte('referral_date', range.from)
    .lte('referral_date', range.to);

  if (error) throw new Error(`Referral report error: ${error.message}`);

  const rows = data ?? [];
  const result: AshaReferralReport = { total: rows.length, referred: 0, visited: 0, admitted: 0, discharged: 0, cancelled: 0 };
  for (const r of rows) {
    const k = r.status as keyof AshaReferralReport;
    if (k in result) (result[k] as number)++;
  }
  return result;
}

export interface AshaMedicineOrderReport {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  fulfilled: number;
  cancelled: number;
}

export async function getAshaMedicineOrderReport(range: DateRange): Promise<AshaMedicineOrderReport> {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select('status')
    .gte('requested_at', range.from + 'T00:00:00')
    .lte('requested_at', range.to + 'T23:59:59');

  if (error) throw new Error(`Medicine order report error: ${error.message}`);

  const rows = data ?? [];
  const result: AshaMedicineOrderReport = { total: rows.length, pending: 0, approved: 0, rejected: 0, fulfilled: 0, cancelled: 0 };
  for (const r of rows) {
    const k = r.status as keyof AshaMedicineOrderReport;
    if (k in result) (result[k] as number)++;
  }
  return result;
}

export interface AshaTaskReport {
  total: number;
  pending: number;
  completed: number;
  dismissed: number;
  overdue: number;
}

export async function getAshaTaskReport(range: DateRange): Promise<AshaTaskReport> {
  const today = new Date().toISOString().split('T')[0];
  const result: AshaTaskReport = { total: 0, pending: 0, completed: 0, dismissed: 0, overdue: 0 };

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('status, due_date')
      .gte('due_date', range.from)
      .lte('due_date', range.to);

    if (error) {
      console.warn('Task report fetch error (falling back to empty):', error.message);
      return result;
    }

    const rows = data ?? [];
    result.total = rows.length;
    for (const r of rows) {
      if (r.status === 'completed') result.completed++;
      else if (r.status === 'dismissed') result.dismissed++;
      else if (r.status === 'pending' || r.status === 'in_progress') {
        result.pending++;
        if (r.due_date < today) result.overdue++;
      }
    }
  } catch (err) {
    console.warn('getAshaTaskReport caught error:', err);
  }

  return result;
}

// ─── Supervisor Reports ───────────────────────────────────────────────────────

export interface SupervisorSummaryReport {
  totalHouseholds: number;
  totalActivePatients: number;
  totalVisits: number;
  totalFollowUps: number;
  completedFollowUps: number;
  overdueFollowUps: number;
  totalReferrals: number;
  pendingReferrals: number;
  totalMedicineOrders: number;
  pendingMedicineOrders: number;
  activePregnancies: number;
}

export async function getSupervisorSummaryReport(range: DateRange): Promise<SupervisorSummaryReport> {
  const today = new Date().toISOString().split('T')[0];

  const [hh, patients, visits, followUps, referrals, orders, pregnancies] = await Promise.all([
    supabase.from('households').select('id', { count: 'exact', head: true }),
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('visits').select('id', { count: 'exact', head: true }).gte('visit_date', range.from).lte('visit_date', range.to),
    supabase.from('follow_ups').select('status, due_date').gte('due_date', range.from).lte('due_date', range.to),
    supabase.from('referrals').select('status').gte('referral_date', range.from).lte('referral_date', range.to),
    supabase.from('medicine_orders').select('status').gte('requested_at', range.from + 'T00:00:00').lte('requested_at', range.to + 'T23:59:59'),
    supabase.from('pregnancies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const fuRows = followUps.data ?? [];
  const completedFu = fuRows.filter(r => r.status === 'completed').length;
  const overdueFu = fuRows.filter(r => r.status === 'pending' && r.due_date < today).length;

  const refRows = referrals.data ?? [];
  const pendingRef = refRows.filter(r => r.status === 'referred').length;

  const ordRows = orders.data ?? [];
  const pendingOrd = ordRows.filter(r => r.status === 'pending').length;

  return {
    totalHouseholds: hh.count ?? 0,
    totalActivePatients: patients.count ?? 0,
    totalVisits: visits.count ?? 0,
    totalFollowUps: fuRows.length,
    completedFollowUps: completedFu,
    overdueFollowUps: overdueFu,
    totalReferrals: refRows.length,
    pendingReferrals: pendingRef,
    totalMedicineOrders: ordRows.length,
    pendingMedicineOrders: pendingOrd,
    activePregnancies: pregnancies.count ?? 0,
  };
}

export interface VisitsByType {
  visit_type: string;
  count: number;
}

export async function getVisitsByType(range: DateRange): Promise<VisitsByType[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('visit_type')
    .gte('visit_date', range.from)
    .lte('visit_date', range.to);

  if (error) throw new Error(error.message);
  const map: Record<string, number> = {};
  for (const r of data ?? []) {
    map[r.visit_type] = (map[r.visit_type] ?? 0) + 1;
  }
  return Object.entries(map).map(([visit_type, count]) => ({ visit_type, count })).sort((a, b) => b.count - a.count);
}

// ─── Manager/Inventory Reports ────────────────────────────────────────────────

export interface StockLevelItem {
  medicine_name: string;
  generic_name: string;
  unit: string;
  location: string;
  quantity: number;
  minimum_quantity: number;
  stock_status: 'out_of_stock' | 'low_stock' | 'adequate';
}

export async function getStockLevelReport(): Promise<StockLevelItem[]> {
  const { data, error } = await supabase
    .from('medicine_stock')
    .select('quantity, minimum_quantity, location, medicine:medicines(name, generic_name, unit, active)')
    .order('quantity', { ascending: true });

  if (error) throw new Error(`Stock report error: ${error.message}`);

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((row: any) => row.medicine?.active !== false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => ({
      medicine_name: row.medicine?.name ?? 'Unknown',
      generic_name: row.medicine?.generic_name ?? '',
      unit: row.medicine?.unit ?? '',
      location: row.location,
      quantity: row.quantity,
      minimum_quantity: row.minimum_quantity,
      stock_status:
        row.quantity === 0
          ? 'out_of_stock'
          : row.quantity <= row.minimum_quantity
          ? 'low_stock'
          : 'adequate',
    }));
}

export interface ManagerMedicineRequestReport {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  fulfilled: number;
  cancelled: number;
  rows: {
    medicine_name: string;
    requested_quantity: number;
    approved_quantity: number | null;
    status: string;
    requested_at: string;
  }[];
}

export async function getManagerMedicineRequestReport(range: DateRange): Promise<ManagerMedicineRequestReport> {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select('status, requested_quantity, approved_quantity, requested_at, medicine:medicines(name)')
    .gte('requested_at', range.from + 'T00:00:00')
    .lte('requested_at', range.to + 'T23:59:59')
    .order('requested_at', { ascending: false });

  if (error) throw new Error(`Manager medicine report error: ${error.message}`);

  const rows = data ?? [];
  const summary = { total: rows.length, pending: 0, approved: 0, rejected: 0, fulfilled: 0, cancelled: 0 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of rows as any[]) {
    const k = r.status as keyof typeof summary;
    if (k in summary) (summary[k] as number)++;
  }

  return {
    ...summary,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: (rows as any[]).map(r => ({
      medicine_name: r.medicine?.name ?? 'Unknown',
      requested_quantity: r.requested_quantity,
      approved_quantity: r.approved_quantity,
      status: r.status,
      requested_at: r.requested_at,
    })),
  };
}

export interface ManagerFieldActivityReport {
  totalHouseholds: number;
  totalActivePatients: number;
  totalVisits: number;
  totalFollowUps: number;
  totalReferrals: number;
  activePregnancies: number;
}

export async function getManagerFieldActivityReport(range: DateRange): Promise<ManagerFieldActivityReport> {
  const [hh, patients, visits, followUps, referrals, pregnancies] = await Promise.all([
    supabase.from('households').select('id', { count: 'exact', head: true }),
    supabase.from('patients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('visits').select('id', { count: 'exact', head: true }).gte('visit_date', range.from).lte('visit_date', range.to),
    supabase.from('follow_ups').select('id', { count: 'exact', head: true }).gte('due_date', range.from).lte('due_date', range.to),
    supabase.from('referrals').select('id', { count: 'exact', head: true }).gte('referral_date', range.from).lte('referral_date', range.to),
    supabase.from('pregnancies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return {
    totalHouseholds: hh.count ?? 0,
    totalActivePatients: patients.count ?? 0,
    totalVisits: visits.count ?? 0,
    totalFollowUps: followUps.count ?? 0,
    totalReferrals: referrals.count ?? 0,
    activePregnancies: pregnancies.count ?? 0,
  };
}

// ─── Sync Report (Offline/PWA) ────────────────────────────────────────────────

export interface SyncReport {
  pendingOps: number;
  failedOps: number;
  lastSyncedAt: string | null;
  isOnline: boolean;
}

import { syncManager } from '@/services/syncManager';
import { connectivityService } from '@/services/connectivityService';
import { db } from '@/services/offlineDatabase';

export async function getSyncReport(): Promise<SyncReport> {
  const state = syncManager.getState();
  const pendingOps = await db.sync_queue.where('sync_status').anyOf(['pending', 'syncing']).count();
  const failedOps = await db.sync_queue.where('sync_status').equals('failed').count();

  return {
    pendingOps,
    failedOps,
    lastSyncedAt: state.lastSyncedAt,
    isOnline: connectivityService.isOnline(),
  };
}
