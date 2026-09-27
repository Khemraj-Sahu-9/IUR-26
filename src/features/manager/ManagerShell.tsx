import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dataService } from '@/services/dataService';
import { MedicineStock } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Building2, Package, Layers, AlertTriangle } from 'lucide-react';

export const ManagerShell: React.FC = () => {
  const { profile } = useAuth();
  const [stock, setStock] = useState<MedicineStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        setLoading(true);
        const stockData = await dataService.getMedicineStock();
        setStock(stockData);
      } catch (err) {
        console.error('Failed to load manager stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadManagerData();
  }, []);

  const lowStockCount = stock.filter(s => s.quantity <= s.minimum_quantity).length;

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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tracked Drugs</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stock.length}</div>
          <p className="text-[11px] text-slate-500">Essential formulary items</p>
        </Card>

        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
          <p className="text-[11px] text-slate-500">Below threshold</p>
        </Card>
      </div>

      {/* PHC Stock Inventory Table / List */}
      <Card className="text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-slate-900">
              PHC Central Stock Inventory
            </h3>
          </div>
          <Badge variant="amber" size="sm">Central Depot</Badge>
        </div>

        {loading ? (
          <LoadingSpinner label="Querying central inventory..." size="sm" />
        ) : stock.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="font-medium">No stock records populated yet.</p>
            <p className="text-xs text-slate-400">Essential kit drugs will appear here after seeding.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stock.map(item => {
              const isLow = item.quantity <= item.minimum_quantity;
              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {item.medicine?.name || 'Formulary Item'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Min Threshold: {item.minimum_quantity} • Loc: {item.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isLow ? 'red' : 'emerald'} size="sm">
                      {item.quantity} available
                    </Badge>
                    {isLow && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">Reorder Needed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
