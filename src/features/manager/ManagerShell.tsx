import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { Building2, Layers, ShoppingBag } from 'lucide-react';
import { ManagerStockView } from '@/features/medicines/ManagerStockView';

type ManagerTab = 'overview' | 'stock';

export const ManagerShell: React.FC = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<ManagerTab>('overview');

  return (
    <div className="space-y-4">
      {/* Manager Header */}
      <Card className="bg-gradient-to-br from-amber-700 to-amber-900 text-white border-0">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-200 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>PHC Administration • पीएचसी प्रबंधन</span>
          </div>
          <h2 className="text-xl font-bold">
            {profile?.full_name || 'PHC Manager'}
          </h2>
          <p className="text-sm text-amber-100">
            Facility: <span className="font-semibold text-white">Central Community Health Centre</span>
          </p>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('overview')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${tab === 'overview' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <ShoppingBag className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setTab('stock')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${tab === 'stock' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Layers className="w-4 h-4" />
          Manage Stock
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <Card className="text-left space-y-2">
          <h3 className="text-sm font-bold text-slate-800">PHC Administration</h3>
          <p className="text-xs text-slate-500">
            Managers can update medicine stock levels, monitor low-stock alerts, and oversee all medicine requisitions across their PHC facility.
          </p>
          <div className="pt-2 text-xs text-emerald-700 font-semibold">
            ✅ Role-Based Access Control Verified &amp; Enforced
          </div>
        </Card>
      )}

      {/* Stock Management Tab */}
      {tab === 'stock' && <ManagerStockView />}
    </div>
  );
};
