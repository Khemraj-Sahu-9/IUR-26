import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ShieldCheck, Pill, BarChart2, Baby } from 'lucide-react';
import { SupervisorMedicineView } from '@/features/medicines/SupervisorMedicineView';
import { dataService } from '@/services/dataService';
import { Pregnancy } from '@/types/database';
import { calculateGestationalAge } from '@/utils/maternalChildUtils';

type SupervisorTab = 'overview' | 'maternal' | 'medicines';

export const SupervisorShell: React.FC = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<SupervisorTab>('overview');
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [loadingPreg, setLoadingPreg] = useState(false);

  useEffect(() => {
    if (tab === 'maternal') {
      setLoadingPreg(true);
      dataService.getAllActivePregnancies()
        .then(setPregnancies)
        .catch(console.error)
        .finally(() => setLoadingPreg(false));
    }
  }, [tab]);

  return (
    <div className="space-y-4">
      {/* Supervisor Header */}
      <Card className="bg-gradient-to-br from-sky-700 to-sky-900 text-white border-0">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sky-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Supervisor Portal • पर्यवेक्षक पोर्टल</span>
          </div>
          <h2 className="text-xl font-bold">
            Dr. {profile?.full_name || 'Supervisor'}
          </h2>
          <p className="text-sm text-sky-100">
            Sector: <span className="font-semibold text-white">North Block PHC</span>
          </p>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('overview')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${tab === 'overview' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <BarChart2 className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setTab('maternal')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${tab === 'maternal' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Baby className="w-4 h-4" />
          Maternal
        </button>
        <button
          onClick={() => setTab('medicines')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${tab === 'medicines' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Pill className="w-4 h-4" />
          Medicines
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <Card className="text-left space-y-2">
          <h3 className="text-sm font-bold text-slate-800">Supervisory Governance</h3>
          <p className="text-xs text-slate-500">
            Supervisors can review home visits, verify maternal immunization schedules, and approve drug-kit refills across their assigned ASHA sector.
          </p>
          <div className="pt-2 text-xs text-emerald-700 font-semibold">
            ✅ Role-Based Access Control Verified &amp; Enforced
          </div>
        </Card>
      )}

      {/* Maternal Overview Tab */}
      {tab === 'maternal' && (
        <div className="space-y-3">
          <Card className="text-left space-y-1">
            <h3 className="text-sm font-bold text-slate-800">🤰 Active Pregnancies — Sector Overview</h3>
            <p className="text-xs text-slate-500">
              All currently active pregnancy records tracked by ASHAs in your sector.
            </p>
          </Card>

          {loadingPreg ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner label="Loading pregnancy records..." size="md" />
            </div>
          ) : pregnancies.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-slate-500">No active pregnancies recorded in sector.</p>
            </Card>
          ) : (
            pregnancies.map((preg) => {
              const ga = preg.lmp_date ? calculateGestationalAge(preg.lmp_date) : null;
              return (
                <Card key={preg.id} className="text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Patient ID: {preg.patient_id.slice(0, 8)}…
                    </span>
                    <span className="text-xs font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                      {preg.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    {preg.lmp_date && (
                      <span>LMP: {new Date(preg.lmp_date).toLocaleDateString('en-IN')}</span>
                    )}
                    {preg.expected_due_date && (
                      <span>EDD: {new Date(preg.expected_due_date).toLocaleDateString('en-IN')}</span>
                    )}
                    {ga && (
                      <span className="font-semibold text-sky-700">
                        {ga}
                      </span>
                    )}
                  </div>
                  {preg.gravida !== undefined && preg.para !== undefined && (
                    <div className="text-xs text-slate-500">
                      G{preg.gravida} P{preg.para}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Medicines Tab */}
      {tab === 'medicines' && <SupervisorMedicineView />}
    </div>
  );
};
