import React, { useEffect, useState } from 'react';
import { MedicineOrder, MedicineStock } from '@/types/database';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/hooks/useAuth';


import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ShieldCheck, CheckCircle2, XCircle, Layers, AlertTriangle } from 'lucide-react';

type SupervisorSubView = 'orders' | 'stock';

const statusVariant: Record<string, 'amber' | 'emerald' | 'red' | 'slate' | 'blue'> = {
  pending: 'amber',
  approved: 'emerald',
  rejected: 'red',
  fulfilled: 'blue',
  cancelled: 'slate',
};

export const SupervisorMedicineView: React.FC = () => {
  const { user } = useAuth();
  const [subView, setSubView] = useState<SupervisorSubView>('orders');
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [stock, setStock] = useState<MedicineStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [approvedQty, setApprovedQty] = useState<number>(0);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMode, setActionMode] = useState<'approve' | 'reject' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [ords, stk] = await Promise.all([
        dataService.getMedicineOrders(),
        dataService.getMedicineStock(),
      ]);
      setOrders(ords);
      setStock(stk);
    } catch (err) {
      console.error('Supervisor load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lowStockCount = stock.filter((s) => s.quantity <= s.minimum_quantity).length;

  const openApprove = (order: MedicineOrder) => {
    setActionOrderId(order.id);
    setApprovedQty(order.requested_quantity);
    setActionMode('approve');
    setError(null);
  };

  const openReject = (order: MedicineOrder) => {
    setActionOrderId(order.id);
    setRejectReason('');
    setActionMode('reject');
    setError(null);
  };

  const cancelAction = () => {
    setActionOrderId(null);
    setActionMode(null);
    setError(null);
  };

  const handleApprove = async () => {
    if (!actionOrderId || !user) return;
    setSaving(true);
    setError(null);
    try {
      await dataService.updateMedicineOrder(actionOrderId, {
        status: 'approved',
        approved_quantity: approvedQty,
        reviewed_by: user.id,
      });
      setSuccessMsg('Request approved successfully!');
      cancelAction();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleReject = async () => {
    if (!actionOrderId || !user) return;
    setSaving(true);
    setError(null);
    try {
      await dataService.updateMedicineOrder(actionOrderId, {
        status: 'rejected',
        rejection_reason: rejectReason || 'Insufficient stock',
        reviewed_by: user.id,
      });
      setSuccessMsg('Request rejected.');
      cancelAction();
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <Card className="bg-gradient-to-br from-sky-700 to-sky-900 text-white border-0 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-200" />
          <div>
            <p className="text-sky-200 text-xs font-semibold uppercase tracking-wider">Medicine Management</p>
            <h2 className="text-lg font-bold">Refill Approval Queue</h2>
          </div>
        </div>
      </Card>

      {/* Tab Nav */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubView('orders')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold transition-colors ${subView === 'orders' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Requests ({pendingOrders.length} pending)
        </button>
        <button
          onClick={() => setSubView('stock')}
          className={`flex-1 min-h-[40px] rounded-xl text-sm font-bold transition-colors ${subView === 'stock' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Stock {lowStockCount > 0 && `⚠ ${lowStockCount}`}
        </button>
      </div>

      {successMsg && <Alert variant="success" title="Done">{successMsg}</Alert>}
      {error && <Alert variant="danger" title="Error">{error}</Alert>}

      {loading ? (
        <LoadingSpinner label="Loading data..." size="sm" />
      ) : subView === 'orders' ? (
        /* ── ORDERS TAB ── */
        <Card className="text-left space-y-3">
          <h3 className="text-sm font-bold text-slate-900">All Medicine Requests</h3>
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No medicine requests found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div key={order.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {order.medicine?.name || 'Medicine'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {order.requested_quantity} {order.medicine?.unit}
                        {order.approved_quantity ? ` → Approved: ${order.approved_quantity}` : ''}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                        {order.asha_id && ` • ASHA: ...${order.asha_id.slice(-6)}`}
                      </p>
                    </div>
                    <Badge variant={statusVariant[order.status] || 'slate'} size="sm">
                      {order.status}
                    </Badge>
                  </div>

                  {order.status === 'rejected' && order.rejection_reason && (
                    <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 p-2 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      {order.rejection_reason}
                    </div>
                  )}

                  {/* Approve/Reject Actions */}
                  {order.status === 'pending' && actionOrderId !== order.id && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 min-h-[40px]"
                        onClick={() => openApprove(order)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-h-[40px] border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => openReject(order)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Inline Approve Form */}
                  {actionMode === 'approve' && actionOrderId === order.id && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-bold text-emerald-800">Approve Request</p>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Approved Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={approvedQty}
                          onChange={(e) => setApprovedQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full mt-1 min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" className="flex-1" onClick={handleApprove} disabled={saving}>
                          {saving ? 'Saving...' : 'Confirm Approve'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelAction} disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Inline Reject Form */}
                  {actionMode === 'reject' && actionOrderId === order.id && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-bold text-red-800">Reject Request</p>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Reason (optional)</label>
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Insufficient PHC stock, re-request next week"
                          className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-red-400 min-h-[60px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-400 text-red-700 hover:bg-red-100"
                          onClick={handleReject}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Confirm Reject'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelAction} disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        /* ── STOCK TAB ── */
        <Card className="text-left space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">PHC Stock Overview</h3>
          </div>
          {stock.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No stock data available.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stock.map((item) => {
                const isLow = item.quantity <= item.minimum_quantity;
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.medicine?.name || 'Item'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Min: {item.minimum_quantity} • {item.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={isLow ? 'red' : 'emerald'} size="sm">
                        {item.quantity} available
                      </Badge>
                      {isLow && (
                        <p className="text-[10px] text-red-600 font-semibold mt-0.5 flex items-center gap-0.5 justify-end">
                          <AlertTriangle className="w-3 h-3" /> Reorder
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
