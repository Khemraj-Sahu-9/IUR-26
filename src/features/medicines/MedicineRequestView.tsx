import React, { useEffect, useState } from 'react';
import { Medicine, MedicineOrder, MedicineStock } from '@/types/database';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pill, ShoppingBag, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface MedicineRequestViewProps {
  onBack: () => void;
}

type SubView = 'list' | 'new_request';

const statusVariant: Record<string, 'amber' | 'emerald' | 'red' | 'slate' | 'blue'> = {
  pending: 'amber',
  approved: 'emerald',
  rejected: 'red',
  fulfilled: 'blue',
  cancelled: 'slate',
};

export const MedicineRequestView: React.FC<MedicineRequestViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [subView, setSubView] = useState<SubView>('list');

  // List state
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New request form state
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stock, setStock] = useState<MedicineStock[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await dataService.getMedicineOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [meds, stk] = await Promise.all([
        dataService.getMedicines(),
        dataService.getMedicineStock(),
      ]);
      setMedicines(meds);
      setStock(stk);
      if (meds.length > 0) setSelectedMedicineId(meds[0].id);
    } catch (err) {
      console.error('Failed to load medicine catalog:', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenNewRequest = async () => {
    setError(null);
    setSuccess(false);
    setQuantity(1);
    await loadFormData();
    setSubView('new_request');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMedicineId || quantity < 1) return;
    setError(null);
    setSaving(true);
    try {
      await dataService.createMedicineOrder({
        asha_id: user.id,
        medicine_id: selectedMedicineId,
        requested_quantity: quantity,
      });
      setSuccess(true);
      await loadOrders();
      setTimeout(() => {
        setSubView('list');
        setSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const getStockForMedicine = (medicineId: string) =>
    stock.find((s) => s.medicine_id === medicineId);

  // ── New Request Form ──────────────────────────────────────────
  if (subView === 'new_request') {
    const selectedStock = selectedMedicineId ? getStockForMedicine(selectedMedicineId) : undefined;
    const isLow = selectedStock && selectedStock.quantity <= selectedStock.minimum_quantity;

    return (
      <div className="space-y-4 text-left">
        <PageHeader
          title="New Drug Kit Request • दवा अनुरोध"
          subtitle="Submit a refill request to your supervisor"
          onBack={() => setSubView('list')}
          backLabel="Back"
        />

        {error && <Alert variant="danger" title="Submission Error">{error}</Alert>}
        {success && <Alert variant="success" title="Request Submitted">Your medicine request has been sent to the supervisor!</Alert>}

        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <Card className="p-4 space-y-4 border-slate-200">
            {/* Medicine Select */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Select Medicine • दवा चुनें *
              </label>
              <select
                value={selectedMedicineId}
                onChange={(e) => setSelectedMedicineId(e.target.value)}
                className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Stock Info */}
            {selectedStock && (
              <div className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${isLow ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                {isLow ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span className={`font-semibold ${isLow ? 'text-red-700' : 'text-emerald-700'}`}>
                  PHC Stock: {selectedStock.quantity} {medicines.find(m => m.id === selectedMedicineId)?.unit}
                  {isLow ? ' — LOW STOCK' : ''}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Quantity Requested • मात्रा *
              </label>
              <input
                type="number"
                min={1}
                max={999}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </Card>

          <div className="space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[48px]"
              disabled={saving || success || !selectedMedicineId}
            >
              {saving ? 'Submitting...' : 'Submit Request • अनुरोध भेजें'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full min-h-[48px]"
              onClick={() => setSubView('list')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ── Requests List ─────────────────────────────────────────────
  const myOrders = orders.filter((o) => o.asha_id === user?.id);
  const pendingCount = myOrders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="My Drug Kit • मेरी दवा किट"
        subtitle="Request medicine refills from the PHC"
        onBack={onBack}
        backLabel="Dashboard"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">My Requests</span>
            <ShoppingBag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{myOrders.length}</div>
          <p className="text-[11px] text-slate-500">Total submitted</p>
        </Card>
        <Card className="p-3 text-left">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <p className="text-[11px] text-slate-500">Awaiting supervisor</p>
        </Card>
      </div>

      {/* New Request Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full min-h-[48px]"
        onClick={handleOpenNewRequest}
      >
        <Pill className="w-4 h-4 mr-2" />
        New Medicine Request • नई दवा अनुरोध
      </Button>

      {/* Orders List */}
      <Card className="text-left space-y-3">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-purple-700" />
          <h3 className="text-sm font-bold text-slate-900">Request History</h3>
        </div>

        {loadingOrders ? (
          <LoadingSpinner label="Loading requests..." size="sm" />
        ) : myOrders.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-sm">
            <p className="font-medium">No requests yet.</p>
            <p className="text-xs text-slate-400 mt-1">Tap the button above to request a medicine refill.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myOrders.map((order) => (
              <div key={order.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {order.medicine?.name || 'Medicine'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Requested: {order.requested_quantity} {order.medicine?.unit}
                      {order.approved_quantity ? ` • Approved: ${order.approved_quantity}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <Badge variant={statusVariant[order.status] || 'slate'} size="sm">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                {order.status === 'rejected' && order.rejection_reason && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-700 bg-red-50 p-2 rounded-lg">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Reason: {order.rejection_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
