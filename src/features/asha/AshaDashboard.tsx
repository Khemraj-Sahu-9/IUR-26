import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Patient, Household, Visit, FollowUp, MedicineOrder } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { 
  Users, 
  Home, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Bell
} from 'lucide-react';

interface AshaDashboardProps {
  onNavigateHouseholds: () => void;
  onNavigatePatients: () => void;
  onNavigateTasks?: () => void;
  onNavigateMedicines?: () => void;
  onNavigateNotifications?: () => void;
  onAddHousehold: () => void;
  onAddPatient: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export const AshaDashboard: React.FC<AshaDashboardProps> = ({
  onNavigateHouseholds,
  onNavigatePatients,
  onNavigateTasks,
  onNavigateMedicines,
  onNavigateNotifications,
  onAddHousehold,
  onAddPatient,
  onSelectPatient,
}) => {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<MedicineOrder[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ptData, hhData, vstData, fuData, ordData, notifCount] = await Promise.all([
        dataService.getPatients(),
        dataService.getHouseholds(),
        dataService.getVisits(),
        dataService.getFollowUps(),
        dataService.getMedicineOrders(),
        dataService.getUnreadNotificationCount(),
      ]);
      setPatients(ptData);
      setHouseholds(hhData);
      setVisits(vstData);
      setFollowups(fuData);
      setMedicineOrders(ordData);
      setUnreadNotifications(notifCount);
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Database error loading field dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Time-appropriate dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Real database metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisitsCount = visits.filter((v) => v.visit_date === todayStr).length;
  const pendingFollowupsCount = followups.filter((f) => f.status === 'pending').length;
  const pendingOrdersCount = medicineOrders.filter((o) => o.status === 'pending').length;
  const attentionCount = patients.filter((p) => p.status === 'active' && p.gender === 'female').length;

  return (
    <div className="space-y-4 text-left">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-0 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
              {t.fieldDashboard}
            </p>
            <h2 className="text-xl font-bold">
              {getGreeting()}, {profile?.full_name || 'Worker'}
            </h2>
            <p className="text-sm text-emerald-100">
              {t.assignedWard}: <span className="font-semibold text-white">Ward 4 (Rampur)</span>
            </p>
          </div>
          {onNavigateNotifications && (
            <button
              type="button"
              onClick={onNavigateNotifications}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-emerald-700">
                  {unreadNotifications}
                </span>
              )}
            </button>
          )}
        </div>
      </Card>

      {/* Today's Operational Summary (Real DB Figures) */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800 px-1">
          Today's Field Summary (आज का कार्य विवरण)
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <Card className="p-3 text-left border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t.todayVisits}</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{todayVisitsCount}</div>
            <p className="text-[11px] text-slate-500">Scheduled checkups</p>
          </Card>

          <Card className="p-3 text-left border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t.pendingFollowups}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingFollowupsCount}</div>
            <p className="text-[11px] text-slate-500">ANC / Immunization due</p>
          </Card>

          <Card className="p-3 text-left border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t.medicineRefills}</span>
              <Pill className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingOrdersCount}</div>
            <p className="text-[11px] text-slate-500">Pending PHC review</p>
          </Card>

          <Card className="p-3 text-left border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">{t.attentionNeeded}</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{attentionCount}</div>
            <p className="text-[11px] text-slate-500">Mothers in care</p>
          </Card>
        </div>
      </div>

      {/* Primary Navigation & Registration Hub */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-800">
            {t.dailyActionAreas}
          </h3>
          <span className="text-xs font-semibold text-emerald-700">Phase 2 Active</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onNavigateHouseholds}
            className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-slate-800">{t.householdsTitle}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {households.length}
              </span>
            </div>
            <span className="text-xs text-slate-500">{t.surveysAndAddress}</span>
          </button>

          <button
            type="button"
            onClick={onNavigatePatients}
            className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-slate-800">{t.patientsTitle}</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {patients.length}
              </span>
            </div>
            <span className="text-xs text-slate-500">{t.clinicalCare}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateTasks}
            className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">Visits & Tasks</span>
            <span className="text-xs text-slate-500">{t.homeVisitsLog}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateMedicines}
            className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Pill className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-slate-800">Drug Kit</span>
              {pendingOrdersCount > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  {pendingOrdersCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">{t.drugKitRequisition}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Family / Patient Primary Action */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onAddHousehold}
          className="min-h-[48px] px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-4 h-4 text-emerald-700" />
          <span>+ {t.addHousehold}</span>
        </button>
        <button
          type="button"
          onClick={onAddPatient}
          className="min-h-[48px] px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4 text-blue-700" />
          <span>+ {t.addPatient}</span>
        </button>
      </div>

      {/* Recently Registered Community Members */}
      <Card className="text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Assigned Ward Members ({patients.length})
            </h3>
            <Badge variant="emerald" size="sm">RLS Enforced</Badge>
          </div>
          {patients.length > 0 && (
            <button
              type="button"
              onClick={onNavigatePatients}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              View All →
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading records through Supabase RLS..." size="sm" />
        ) : error ? (
          <ErrorState
            title="Database error"
            message={error}
            onRetry={loadData}
            retryLabel={t.retry}
          />
        ) : patients.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="font-semibold text-slate-700">{t.noPatientsYet}</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a household first, then register maternal & family members.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.slice(0, 5).map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectPatient(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectPatient(p);
                }}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.full_name}</p>
                  <p className="text-xs text-slate-500">
                    {p.patient_code} • {p.gender} {p.relationship_to_head ? `(${p.relationship_to_head})` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === 'active' ? 'emerald' : 'slate'} size="sm">
                    {p.status}
                  </Badge>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
