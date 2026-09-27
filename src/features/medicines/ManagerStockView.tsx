import React, { useEffect, useState } from 'react';
import { MedicineStock } from '@/types/database';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Layers, AlertTriangle, Edit2, Check, X } from 'lucide-react';

export const ManagerStockView: React.FC = () => {
  const [stock, setStock] = useState<MedicineStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editMinQty, setEditMinQty] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await dataService.getMedicineStock();
      setStock(data);
    } catch (err) {
      console.error('Failed to load stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (item: MedicineStock) => {
    setEditingId(item.id);
    setEditQty(item.quantity);
    setEditMinQty(item.minimum_quantity);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = async (stockId: string) => {
    setSaving(true);
    setError(null);
    try {
      await dataService.updateStockQuantity(stockId, editQty, editMinQty);
      setSuccessMsg('Stock updated!');
      setEditingId(null);
      await load();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const lowCount = stock.filter((s) => s.quantity <= s.minimum_quantity).length;

  return (
    <div className="space-y-4 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Items</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stock.length}</div>
          <p className="text-[11px] text-slate-500">Tracked formulary</p>
        </Card>
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{lowCount}</div>
          <p className="text-[11px] text-slate-500">Below threshold</p>
        </Card>
      </div>

      {successMsg && <Alert variant="success" title="Updated">{successMsg}</Alert>}
      {error && <Alert variant="danger" title="Error">{error}</Alert>}

      {/* Inventory table */}
      <Card className="text-left space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-amber-700" />
          <h3 className="text-sm font-bold text-slate-900">Central Stock Inventory</h3>
          <Badge variant="amber" size="sm">Manager Edit</Badge>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading stock..." size="sm" />
        ) : stock.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No stock records found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stock.map((item) => {
              const isLow = item.quantity <= item.minimum_quantity;
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} className="py-3 space-y-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.medicine?.name || 'Item'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.medicine?.unit} • {item.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isLow ? 'red' : 'emerald'} size="sm">
                        {item.quantity}
                      </Badge>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition-colors"
                          title="Edit stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
                      <p className="text-xs font-bold text-amber-800">Edit Stock Levels</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Current Qty</label>
                          <input
                            type="number"
                            min={0}
                            value={editQty}
                            onChange={(e) => setEditQty(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full mt-1 min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700">Min Threshold</label>
                          <input
                            type="number"
                            min={0}
                            value={editMinQty}
                            onChange={(e) => setEditMinQty(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full mt-1 min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-400"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => saveEdit(item.id)}
                          disabled={saving}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                          <X className="w-3.5 h-3.5 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
