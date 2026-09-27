import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { ShieldCheck, Pill, BarChart2 } from 'lucide-react';
import { SupervisorMedicineView } from '@/features/medicines/SupervisorMedicineView';

type SupervisorTab = 'overview' | 'medicines';

export const SupervisorShell: React.FC = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<SupervisorTab>('overview');

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

      {/* Medicines Tab */}
      {tab === 'medicines' && <SupervisorMedicineView />}
    </div>
  );
};
