/**
 * AshaReportView.tsx — Phase 8
 * Personal work report for ASHA workers.
 * Shows only data belonging to the logged-in ASHA (enforced by RLS).
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  DateRangePreset,
  DateRange,
  getDateRange,
  getAshaVisitReport,
  getAshaFollowUpReport,
  getAshaReferralReport,
  getAshaMedicineOrderReport,
  getAshaTaskReport,
  getSyncReport,
  AshaVisitReport,
  AshaFollowUpReport,
  AshaReferralReport,
  AshaMedicineOrderReport,
  AshaTaskReport,
  SyncReport,
} from '@/services/reportService';
import {
  exportVisitReport,
  exportFollowUpReport,
  exportReferralReport,
  exportMedicineOrderReport,
} from '@/utils/csvExport';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert } from '@/components/common/Alert';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportStatCard } from '@/components/reports/ReportStatCard';
import { VisitSparkline } from '@/components/reports/VisitSparkline';
import { StatusBarChart } from '@/components/reports/StatusBarChart';
import {
  BarChart2,
  Download,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  Pill,
  CheckSquare,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface AshaReportViewProps {
  onBack: () => void;
}

export const AshaReportView: React.FC<AshaReportViewProps> = ({ onBack }) => {
  const [preset, setPreset]       = useState<DateRangePreset>('last7');
  const [range, setRange]         = useState<DateRange>(getDateRange('last7'));

  const [visitReport, setVisitReport]     = useState<AshaVisitReport | null>(null);
  const [followReport, setFollowReport]   = useState<AshaFollowUpReport | null>(null);
  const [referralReport, setReferralReport] = useState<AshaReferralReport | null>(null);
  const [medicineReport, setMedicineReport] = useState<AshaMedicineOrderReport | null>(null);
  const [taskReport, setTaskReport]       = useState<AshaTaskReport | null>(null);
  const [syncReport, setSyncReport]       = useState<SyncReport | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const loadReports = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const [v, f, ref, m, t, s] = await Promise.all([
        getAshaVisitReport(r),
        getAshaFollowUpReport(r),
        getAshaReferralReport(r),
        getAshaMedicineOrderReport(r),
        getAshaTaskReport(r),
        getSyncReport(),
      ]);
      setVisitReport(v);
      setFollowReport(f);
      setReferralReport(ref);
      setMedicineReport(m);
      setTaskReport(t);
      setSyncReport(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports. Please try again.');
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

  const rangeDateLabel = `${range.from}_to_${range.to}`;

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="My Work Report"
        subtitle="मेरी कार्य रिपोर्ट"
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Reports</span>
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

      {error && (
        <Alert variant="danger">
          <strong>Report Error:</strong> {error}
        </Alert>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading reports..." size="md" />
        </div>
      ) : (
        <>
          {/* ── 1. VISITS ─────────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Home Visits — घर भ्रमण</h3>
              </div>
              <button
                type="button"
                onClick={() => exportVisitReport(visitReport?.byDay ?? [], rangeDateLabel)}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export visits CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Visits" value={visitReport?.total ?? 0} subLabel={`${range.from} – ${range.to}`} colorClass="text-emerald-700" icon={<CalendarCheck className="w-4 h-4" />} />
              {Object.entries(visitReport?.byType ?? {}).slice(0, 3).map(([type, count]) => (
                <ReportStatCard key={type} label={type.replace(/_/g, ' ')} value={count} colorClass="text-slate-800" />
              ))}
            </div>

            <div className="pt-1">
              <p className="text-xs font-bold text-slate-600 mb-2">Visits per Day (दिनवार भ्रमण)</p>
              <VisitSparkline data={visitReport?.byDay ?? []} label="Visits per day" />
            </div>
          </Card>

          {/* ── 2. FOLLOW-UPS ─────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-800">Follow-ups — फॉलो-अप</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportFollowUpReport([
                    { status: 'completed', count: followReport?.completed ?? 0 },
                    { status: 'pending',   count: followReport?.pending ?? 0 },
                    { status: 'overdue',   count: followReport?.overdue ?? 0 },
                    { status: 'missed',    count: followReport?.missed ?? 0 },
                    { status: 'cancelled', count: followReport?.cancelled ?? 0 },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export follow-ups CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Due"   value={followReport?.total ?? 0}     colorClass="text-slate-800" />
              <ReportStatCard label="Completed"   value={followReport?.completed ?? 0} colorClass="text-emerald-700" />
              <ReportStatCard label="Overdue"     value={followReport?.overdue ?? 0}   colorClass="text-red-600" subLabel="Pending & past due date" />
              <ReportStatCard label="Pending"     value={followReport?.pending ?? 0}   colorClass="text-amber-600" />
            </div>

            <StatusBarChart
              title="Follow-up status breakdown"
              total={followReport?.total ?? 0}
              items={[
                { label: 'completed', count: followReport?.completed ?? 0, colorClass: 'bg-emerald-500' },
                { label: 'pending',   count: followReport?.pending ?? 0,   colorClass: 'bg-amber-400' },
                { label: 'overdue',   count: followReport?.overdue ?? 0,   colorClass: 'bg-red-500' },
                { label: 'missed',    count: followReport?.missed ?? 0,    colorClass: 'bg-slate-400' },
              ]}
            />
          </Card>

          {/* ── 3. REFERRALS ──────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800">Referrals — रेफरल</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportReferralReport([
                    { status: 'referred',   count: referralReport?.referred ?? 0 },
                    { status: 'visited',    count: referralReport?.visited ?? 0 },
                    { status: 'admitted',   count: referralReport?.admitted ?? 0 },
                    { status: 'discharged', count: referralReport?.discharged ?? 0 },
                    { status: 'cancelled',  count: referralReport?.cancelled ?? 0 },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export referrals CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Referrals" value={referralReport?.total ?? 0}    colorClass="text-slate-800" />
              <ReportStatCard label="Pending / Referred" value={referralReport?.referred ?? 0} colorClass="text-amber-600" />
              <ReportStatCard label="Visited PHC"     value={referralReport?.visited ?? 0}  colorClass="text-emerald-600" />
              <ReportStatCard label="Admitted"        value={referralReport?.admitted ?? 0} colorClass="text-sky-600" />
            </div>

            <StatusBarChart
              title="Referral status breakdown"
              total={referralReport?.total ?? 0}
              items={[
                { label: 'referred',   count: referralReport?.referred ?? 0,   colorClass: 'bg-amber-400' },
                { label: 'visited',    count: referralReport?.visited ?? 0,    colorClass: 'bg-emerald-500' },
                { label: 'admitted',   count: referralReport?.admitted ?? 0,   colorClass: 'bg-sky-500' },
                { label: 'discharged', count: referralReport?.discharged ?? 0, colorClass: 'bg-slate-400' },
                { label: 'cancelled',  count: referralReport?.cancelled ?? 0,  colorClass: 'bg-red-400' },
              ]}
            />
          </Card>

          {/* ── 4. MEDICINE REQUESTS ──────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-800">Medicine Requests — दवा अनुरोध</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportMedicineOrderReport([])
                }
                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                aria-label="Export medicine orders CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Requests" value={medicineReport?.total ?? 0}     colorClass="text-slate-800" />
              <ReportStatCard label="Fulfilled"      value={medicineReport?.fulfilled ?? 0} colorClass="text-emerald-700" />
              <ReportStatCard label="Pending"        value={medicineReport?.pending ?? 0}   colorClass="text-amber-600" />
              <ReportStatCard label="Rejected"       value={medicineReport?.rejected ?? 0}  colorClass="text-red-600" />
            </div>
          </Card>

          {/* ── 5. TASKS ──────────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-800">Tasks — कार्य</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Tasks" value={taskReport?.total ?? 0}     colorClass="text-slate-800" />
              <ReportStatCard label="Completed"   value={taskReport?.completed ?? 0} colorClass="text-emerald-700" />
              <ReportStatCard label="Overdue"     value={taskReport?.overdue ?? 0}   colorClass="text-red-600" />
              <ReportStatCard label="Pending"     value={taskReport?.pending ?? 0}   colorClass="text-amber-600" />
            </div>
          </Card>

          {/* ── 6. SYNC STATUS ────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Sync Status — डेटा सिंक</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {syncReport?.isOnline
                ? <Wifi className="w-4 h-4 text-emerald-600" />
                : <WifiOff className="w-4 h-4 text-red-500" />
              }
              <span className={`text-sm font-bold ${syncReport?.isOnline ? 'text-emerald-700' : 'text-red-600'}`}>
                {syncReport?.isOnline ? 'Online — Connected' : 'Offline — Working locally'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Pending Sync Ops"  value={syncReport?.pendingOps ?? 0}  colorClass={syncReport?.pendingOps ? 'text-amber-600' : 'text-slate-800'} />
              <ReportStatCard label="Failed Sync Ops"   value={syncReport?.failedOps ?? 0}   colorClass={syncReport?.failedOps ? 'text-red-600' : 'text-slate-800'} />
            </div>
            {syncReport?.lastSyncedAt && (
              <p className="text-[11px] text-slate-400">
                Last synced: {new Date(syncReport.lastSyncedAt).toLocaleString('en-IN')}
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
