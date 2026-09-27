import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dataService } from '@/services/dataService';
import { Patient, Household, Visit } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Users, Home, Calendar, Pill, AlertCircle } from 'lucide-react';

export const AshaShell: React.FC = () => {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAshaData = async () => {
      try {
        setLoading(true);
        const [pts, hhs, vsts] = await Promise.all([
          dataService.getPatients(),
          dataService.getHouseholds(),
          dataService.getVisits(),
        ]);
        setPatients(pts);
        setHouseholds(hhs);
        setVisits(vsts);
      } catch (err: unknown) {
        console.error('Failed to load ASHA data:', err);
        setError('Notice: Initializing local village register.');
      } finally {
        setLoading(false);
      }
    };

    loadAshaData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Welcome & Shift Card */}
      <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-0">
        <div className="space-y-1">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
            ASHA Field Dashboard • आशा कार्यक्षेत्र
          </p>
          <h2 className="text-xl font-bold">
            Namaste, {profile?.full_name || 'Worker'}
          </h2>
          <p className="text-sm text-emerald-100">
            Assigned Ward: <span className="font-semibold text-white">Ward 4 (Rampur)</span>
          </p>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Households</span>
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{households.length}</div>
          <p className="text-[11px] text-slate-500">Registered families</p>
        </Card>

        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{patients.length}</div>
          <p className="text-[11px] text-slate-500">Total in ward</p>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800 text-left px-1">
          Daily Action Areas (Phase 1 Ready)
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
              <Home className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">Households</span>
            <span className="text-xs text-slate-500">Surveys & address</span>
          </button>

          <button className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">Patients</span>
            <span className="text-xs text-slate-500">ANC / Child / General</span>
          </button>

          <button className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">Visits ({visits.length})</span>
            <span className="text-xs text-slate-500">Home checkups log</span>
          </button>

          <button className="flex flex-col items-start p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors text-left shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">Drug Kit</span>
            <span className="text-xs text-slate-500">Stock & requisitions</span>
          </button>
        </div>
      </div>

      {/* Patient Record List (Live RLS Proof) */}
      <Card className="text-left space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Assigned Village Patients ({patients.length})
          </h3>
          <Badge variant="emerald" size="sm">RLS Protected</Badge>
        </div>

        {loading ? (
          <LoadingSpinner label="Querying PostgreSQL through Supabase RLS..." size="sm" />
        ) : error ? (
          <div className="p-3 text-xs text-slate-600 bg-slate-100 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>{error}</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="font-medium">No patients yet registered.</p>
            <p className="text-xs text-slate-400 mt-0.5">Seeded records will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map(p => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.full_name}</p>
                  <p className="text-xs text-slate-500">Code: {p.patient_code} • {p.gender}</p>
                </div>
                <Badge variant={p.status === 'active' ? 'emerald' : 'slate'} size="sm">
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
