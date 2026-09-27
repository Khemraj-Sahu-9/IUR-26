/**
 * ManagerReportView.tsx — Phase 8
 * PHC-level operational and inventory report for Managers.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  DateRangePreset,
  DateRange,
  getDateRange,
  getStockLevelReport,
  getManagerMedicineRequestReport,
  getManagerFieldActivityReport,
  StockLevelItem,
  ManagerMedicineRequestReport,
  ManagerFieldActivityReport,
} from '@/services/reportService';
import {
  exportStockReport,
  exportMedicineOrderReport,
  exportSupervisorSummaryReport,
} from '@/utils/csvExport';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert } from '@/components/common/Alert';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportStatCard } from '@/components/reports/ReportStatCard';
import { StatusBarChart } from '@/components/reports/StatusBarChart';
import {
  BarChart2,
  Download,
  Package,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Users,
  CalendarCheck,
  ArrowUpRight,
} from 'lucide-react';

interface ManagerReportViewProps {
  onBack: () => void;
}

export const ManagerReportView: React.FC<ManagerReportViewProps> = ({ onBack }) => {
  const [preset, setPreset] = useState<DateRangePreset>('last30');
  const [range, setRange]   = useState<DateRange>(getDateRange('last30'));

  const [stockData, setStockData]       = useState<StockLevelItem[]>([]);
  const [orderReport, setOrderReport]   = useState<ManagerMedicineRequestReport | null>(null);
  const [fieldReport, setFieldReport]   = useState<ManagerFieldActivityReport | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const loadReports = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const [stock, orders, field] = await Promise.all([
        getStockLevelReport(),
        getManagerMedicineRequestReport(r),
        getManagerFieldActivityReport(r),
      ]);
      setStockData(stock);
      setOrderReport(orders);
      setFieldReport(field);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manager reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports(range);
  }, [range, loadReports]);

  const handleFilterChange = (newPreset: DateRangePreset, newRange: DateRange) => {
    setPreset(newPreset);
    setRange(newRange);
  };

  const outOfStock = stockData.filter(s => s.stock_status === 'out_of_stock');
  const lowStock   = stockData.filter(s => s.stock_status === 'low_stock');
  const adequate   = stockData.filter(s => s.stock_status === 'adequate');

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="PHC Operations Report"
        subtitle="पीएचसी परिचालन रिपोर्ट"
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Reports</span>
          </div>
        }
      />

      {/* Date Filters */}
      <Card className="p-3 space-y-2">
        <p className="text-xs font-bold text-slate-700">Date Range — तिथि सीमा</p>
        <ReportFilters
          preset={preset}
          customRange={range}
          onPresetChange={handleFilterChange}
        />
      </Card>

      {error && <Alert variant="danger"><strong>Report Error:</strong> {error}</Alert>}

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading PHC reports..." size="md" />
        </div>
      ) : (
        <>
          {/* ── 1. INVENTORY OVERVIEW ─────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-800">Inventory Status — इन्वेंटरी</h3>
              </div>
              <button
                type="button"
                onClick={() => exportStockReport(stockData)}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export stock CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ReportStatCard
                label="Out of Stock"
                value={outOfStock.length}
                colorClass={outOfStock.length > 0 ? 'text-red-600' : 'text-slate-800'}
                icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              />
              <ReportStatCard
                label="Low Stock"
                value={lowStock.length}
                colorClass={lowStock.length > 0 ? 'text-amber-600' : 'text-slate-800'}
                icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
              />
              <ReportStatCard
                label="Adequate"
                value={adequate.length}
                colorClass="text-emerald-700"
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              />
            </div>

            {/* Out of stock list */}
            {outOfStock.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide">⚠ Out of Stock</p>
                <div className="space-y-1">
                  {outOfStock.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-red-50 rounded-lg border border-red-100 text-xs">
                      <span className="font-semibold text-slate-800">{item.medicine_name}</span>
                      <Badge variant="red" size="sm">0 {item.unit}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low stock list */}
            {lowStock.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Low Stock</p>
                <div className="space-y-1">
                  {lowStock.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-100 text-xs">
                      <span className="font-semibold text-slate-800">{item.medicine_name}</span>
                      <span className="text-amber-700 font-bold">{item.quantity} / {item.minimum_quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full stock table */}
            <details className="text-xs">
              <summary className="cursor-pointer text-slate-500 font-semibold hover:text-slate-700 focus:outline-none">
                View all stock items ({stockData.length})
              </summary>
              <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 max-h-56">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-bold text-slate-700">Medicine</th>
                      <th className="px-3 py-2 font-bold text-slate-700">Unit</th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">Qty</th>
                      <th className="px-3 py-2 font-bold text-slate-700 text-right">Min</th>
                      <th className="px-3 py-2 font-bold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-1.5 font-semibold text-slate-800">{item.medicine_name}</td>
                        <td className="px-3 py-1.5 text-slate-500">{item.unit}</td>
                        <td className="px-3 py-1.5 text-right font-bold text-slate-900">{item.quantity}</td>
                        <td className="px-3 py-1.5 text-right text-slate-500">{item.minimum_quantity}</td>
                        <td className="px-3 py-1.5">
                          <Badge
                            variant={item.stock_status === 'out_of_stock' ? 'red' : item.stock_status === 'low_stock' ? 'amber' : 'emerald'}
                            size="sm"
                          >
                            {item.stock_status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Card>

          {/* ── 2. MEDICINE REQUEST REPORT ────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-800">Medicine Requests — दवा अनुरोध</h3>
              </div>
              <button
                type="button"
                onClick={() => exportMedicineOrderReport(orderReport?.rows ?? [])}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export medicine requests CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total (period)" value={orderReport?.total ?? 0}     colorClass="text-slate-800" />
              <ReportStatCard label="Pending"        value={orderReport?.pending ?? 0}   colorClass="text-amber-600" />
              <ReportStatCard label="Fulfilled"      value={orderReport?.fulfilled ?? 0} colorClass="text-emerald-700" />
              <ReportStatCard label="Rejected"       value={orderReport?.rejected ?? 0}  colorClass="text-red-600" />
            </div>

            <StatusBarChart
              title="Medicine request status"
              total={orderReport?.total ?? 0}
              items={[
                { label: 'fulfilled', count: orderReport?.fulfilled ?? 0, colorClass: 'bg-emerald-500' },
                { label: 'pending',   count: orderReport?.pending ?? 0,   colorClass: 'bg-amber-400' },
                { label: 'approved',  count: orderReport?.approved ?? 0,  colorClass: 'bg-sky-400' },
                { label: 'rejected',  count: orderReport?.rejected ?? 0,  colorClass: 'bg-red-400' },
                { label: 'cancelled', count: orderReport?.cancelled ?? 0, colorClass: 'bg-slate-300' },
              ]}
            />

            {/* Request rows table */}
            {(orderReport?.rows?.length ?? 0) > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-500 font-semibold hover:text-slate-700 focus:outline-none">
                  View all requests ({orderReport?.rows.length})
                </summary>
                <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 max-h-56">
                  <table className="w-full text-xs text-left min-w-[480px]">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-bold text-slate-700">Medicine</th>
                        <th className="px-3 py-2 font-bold text-slate-700 text-right">Req Qty</th>
                        <th className="px-3 py-2 font-bold text-slate-700 text-right">Approved</th>
                        <th className="px-3 py-2 font-bold text-slate-700">Status</th>
                        <th className="px-3 py-2 font-bold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderReport?.rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-1.5 font-semibold text-slate-800">{row.medicine_name}</td>
                          <td className="px-3 py-1.5 text-right text-slate-700">{row.requested_quantity}</td>
                          <td className="px-3 py-1.5 text-right text-slate-700">{row.approved_quantity ?? '—'}</td>
                          <td className="px-3 py-1.5">
                            <Badge
                              variant={row.status === 'fulfilled' ? 'emerald' : row.status === 'rejected' ? 'red' : row.status === 'pending' ? 'amber' : 'slate'}
                              size="sm"
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-1.5 text-slate-500">
                            {new Date(row.requested_at).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </Card>

          {/* ── 3. FIELD ACTIVITY ─────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-800">Field Activity (aggregate) — क्षेत्र गतिविधि</h3>
              </div>
              <button
                type="button"
                onClick={() => exportSupervisorSummaryReport({
                  'Period From': range.from,
                  'Period To':   range.to,
                  'Total Households':    fieldReport?.totalHouseholds ?? 0,
                  'Active Patients':     fieldReport?.totalActivePatients ?? 0,
                  'Visits (period)':     fieldReport?.totalVisits ?? 0,
                  'Follow-ups (period)': fieldReport?.totalFollowUps ?? 0,
                  'Referrals (period)':  fieldReport?.totalReferrals ?? 0,
                  'Active Pregnancies':  fieldReport?.activePregnancies ?? 0,
                })}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export field activity CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Households" value={fieldReport?.totalHouseholds ?? 0}      icon={<Users className="w-4 h-4" />} colorClass="text-slate-800" />
              <ReportStatCard label="Active Patients"  value={fieldReport?.totalActivePatients ?? 0}  colorClass="text-slate-800" />
              <ReportStatCard label="Visits (period)"  value={fieldReport?.totalVisits ?? 0}          icon={<CalendarCheck className="w-4 h-4" />} colorClass="text-emerald-700" />
              <ReportStatCard label="Follow-ups Due"   value={fieldReport?.totalFollowUps ?? 0}       colorClass="text-amber-600" />
              <ReportStatCard label="Referrals"        value={fieldReport?.totalReferrals ?? 0}       icon={<ArrowUpRight className="w-4 h-4" />} colorClass="text-purple-600" />
              <ReportStatCard label="Active Pregnancies" value={fieldReport?.activePregnancies ?? 0}  colorClass="text-pink-600" />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
