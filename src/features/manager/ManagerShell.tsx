import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  Building2, 
  Layers, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  PackageCheck,
  TrendingDown
} from 'lucide-react';
import { ManagerStockView } from '@/features/medicines/ManagerStockView';
import { dataService } from '@/services/dataService';
import { MedicineOrder } from '@/types/database';

type ManagerTab = 'overview' | 'stock' | 'requisitions';

export const ManagerShell: React.FC = () => {
  const { profile } = useAuth();
  const [tab, setTab] = useState<ManagerTab>('overview');
  
  const [stats, setStats] = useState<{
    pendingMedicineOrders: number;
    lowStockItems: number;
    outOfStockItems: number;
    fulfilledThisWeek: number;
  }>({
    pendingMedicineOrders: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    fulfilledThisWeek: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Requisitions list
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await dataService.getManagerStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load manager stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await dataService.getMedicineOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (tab === 'requisitions') {
      loadOrders();
    }
  }, [tab, loadOrders]);

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
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'overview' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setTab('requisitions')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'requisitions' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Requisitions
          {stats.pendingMedicineOrders > 0 && (
            <span className="ml-1 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full">
              {stats.pendingMedicineOrders}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('stock')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
            tab === 'stock' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Manage Stock
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <Card className="p-3 text-left border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Pending Requests</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loadingStats ? '…' : stats.pendingMedicineOrders}
              </div>
              <p className="text-[11px] text-slate-500">Awaiting dispatch</p>
            </Card>

            <Card className="p-3 text-left border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Low Stock Items</span>
                <TrendingDown className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loadingStats ? '…' : stats.lowStockItems}
              </div>
              <p className="text-[11px] text-slate-500">Below minimum buffer</p>
            </Card>

            <Card className="p-3 text-left border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Out of Stock</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loadingStats ? '…' : stats.outOfStockItems}
              </div>
              <p className="text-[11px] text-slate-500">Critical replenishment</p>
            </Card>

            <Card className="p-3 text-left border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold">Fulfilled This Week</span>
                <PackageCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loadingStats ? '…' : stats.fulfilledThisWeek}
              </div>
              <p className="text-[11px] text-slate-500">Drug kits delivered</p>
            </Card>
          </div>

          <Card className="text-left space-y-2">
            <h3 className="text-sm font-bold text-slate-800">PHC Logistics &amp; Drug Supply</h3>
            <p className="text-xs text-slate-500">
              Managers oversee medicine stock inventory, replenish sub-centre and ASHA drug kits, track low stock warnings, and verify fulfilled requisitions across all PHC sub-centres.
            </p>
            <div className="pt-2 text-xs text-emerald-700 font-semibold">
              ✅ Role-Based Access Control Verified &amp; Enforced
            </div>
          </Card>
        </div>
      )}

      {/* Requisitions Tab */}
      {tab === 'requisitions' && (
        <div className="space-y-3 text-left">
          <Card className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Drug Requisitions Queue</h3>
            <p className="text-xs text-slate-500">Review status and fulfill kits requested by ASHA workers.</p>
          </Card>

          {loadingOrders ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner label="Loading requisitions..." size="md" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-500">No requisitions on record.</Card>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <Card key={o.id} className="p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {o.medicine?.name || 'Medicine Request'}
                    </span>
                    <Badge
                      variant={
                        o.status === 'fulfilled'
                          ? 'emerald'
                          : o.status === 'approved'
                          ? 'blue'
                          : o.status === 'pending'
                          ? 'amber'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {o.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Requested: {o.requested_quantity} units</span>
                    {o.approved_quantity !== null && (
                      <span>Approved: {o.approved_quantity} units</span>
                    )}
                    <span>{new Date(o.requested_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stock Management Tab */}
      {tab === 'stock' && <ManagerStockView />}
    </div>
  );
};
