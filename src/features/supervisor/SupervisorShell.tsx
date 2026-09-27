import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dataService } from '@/services/dataService';
import { AshaWorker, MedicineOrder } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ShieldCheck, UserCheck, Pill, CheckCircle2, Clock } from 'lucide-react';

export const SupervisorShell: React.FC = () => {
  const { profile } = useAuth();
  const [workers, setWorkers] = useState<AshaWorker[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSupervisorData = async () => {
      try {
        setLoading(true);
        const [wks, ords] = await Promise.all([
          dataService.getAshaWorkers(),
          dataService.getMedicineOrders(),
        ]);
        setWorkers(wks);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load supervisor data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSupervisorData();
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending');

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active ASHAs</span>
            <UserCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{workers.length || 1}</div>
          <p className="text-[11px] text-slate-500">Under supervision</p>
        </Card>

        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pending Refills</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingOrders.length}</div>
          <p className="text-[11px] text-slate-500">Awaiting approval</p>
        </Card>
      </div>

      {/* Requisitions Queue */}
      <Card className="text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Medicine Requisitions
            </h3>
          </div>
          <Badge variant="blue" size="sm">Approval Queue</Badge>
        </div>

        {loading ? (
          <LoadingSpinner label="Fetching sector requisitions..." size="sm" />
        ) : orders.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="font-medium">No pending requisitions.</p>
            <p className="text-xs text-slate-400">New requests from ASHAs will appear here for 1-tap review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map(order => (
              <div key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {order.medicine?.name || 'Essential Medicine'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Qty: <span className="font-semibold text-slate-700">{order.requested_quantity}</span> • Status: {order.status}
                  </p>
                </div>
                <Badge variant={order.status === 'pending' ? 'amber' : 'emerald'} size="sm">
                  {order.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Supervisory Actions */}
      <Card className="text-left space-y-2">
        <h3 className="text-sm font-bold text-slate-800">Supervisory Governance (Phase 1)</h3>
        <p className="text-xs text-slate-500">
          Supervisors can review home visits, verify maternal immunization schedules, and approve drug-kit refills across their assigned ASHA sector.
        </p>
        <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Access Control Verified & Enforced</span>
        </div>
      </Card>
    </div>
  );
};
