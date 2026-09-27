/**
 * SupervisorReportView.tsx — Phase 8
 * Sector-level operational report for Supervisors.
 * Shows aggregate counts across all ASHAs in the sector (enforced by RLS).
 * Does NOT rank individual workers. Does NOT create performance scores.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  DateRangePreset,
  DateRange,
  getDateRange,
  getSupervisorSummaryReport,
  getVisitsByType,
  SupervisorSummaryReport,
  VisitsByType,
} from '@/services/reportService';
import { exportSupervisorSummaryReport } from '@/utils/csvExport';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert } from '@/components/common/Alert';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportStatCard } from '@/components/reports/ReportStatCard';
import { StatusBarChart } from '@/components/reports/StatusBarChart';
import {
  Download,
  Users,
  Home,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  Pill,
  Baby,
} from 'lucide-react';

interface SupervisorReportViewProps {
  onBack: () => void;
}

export const SupervisorReportView: React.FC<SupervisorReportViewProps> = ({ onBack }) => {
  const [preset, setPreset] = useState<DateRangePreset>('last30');
  const [range, setRange]   = useState<DateRange>(getDateRange('last30'));

  const [summary, setSummary]     = useState<SupervisorSummaryReport | null>(null);
  const [byType, setByType]       = useState<VisitsByType[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const loadReports = useCallback(async (r: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const [s, vt] = await Promise.all([
        getSupervisorSummaryReport(r),
        getVisitsByType(r),
      ]);
      setSummary(s);
      setByType(vt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supervisor reports.');
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

  const handleExport = () => {
    if (!summary) return;
    exportSupervisorSummaryReport({
      'Report Period From': range.from,
      'Report Period To':   range.to,
      'Total Households':        summary.totalHouseholds,
      'Active Patients':         summary.totalActivePatients,
      'Visits (period)':         summary.totalVisits,
      'Follow-ups Due (period)': summary.totalFollowUps,
      'Completed Follow-ups':    summary.completedFollowUps,
      'Overdue Follow-ups':      summary.overdueFollowUps,
      'Total Referrals':         summary.totalReferrals,
      'Pending Referrals':       summary.pendingReferrals,
      'Medicine Orders':         summary.totalMedicineOrders,
      'Pending Orders':          summary.pendingMedicineOrders,
      'Active Pregnancies':      summary.activePregnancies,
    });
  };

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="Sector Report"
        subtitle="क्षेत्र परिचालन रिपोर्ट"
        onBack={onBack}
        rightAction={
          <button
            type="button"
            onClick={handleExport}
            disabled={!summary}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline disabled:opacity-40"
            aria-label="Export sector summary CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
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

      {/* Privacy notice */}
      <div className="px-1">
        <p className="text-[11px] text-slate-400 italic">
          This report shows aggregate counts. Individual patient details are not displayed at this level.
        </p>
      </div>

      {error && <Alert variant="danger"><strong>Report Error:</strong> {error}</Alert>}

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading sector report..." size="md" />
        </div>
      ) : (
        <>
          {/* ── 1. FIELD COVERAGE ─────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-800">Field Coverage — क्षेत्र कवरेज</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Registered Households"  value={summary?.totalHouseholds ?? 0}      icon={<Home className="w-4 h-4" />} colorClass="text-slate-800" />
              <ReportStatCard label="Active Patients"        value={summary?.totalActivePatients ?? 0}   icon={<Users className="w-4 h-4" />} colorClass="text-slate-800" />
              <ReportStatCard label="Active Pregnancies"     value={summary?.activePregnancies ?? 0}     icon={<Baby className="w-4 h-4" />} colorClass="text-pink-600" />
              <ReportStatCard label="Visits (period)"        value={summary?.totalVisits ?? 0}           icon={<CalendarCheck className="w-4 h-4" />} colorClass="text-emerald-700" />
            </div>
          </Card>

          {/* ── 2. VISITS BY TYPE ─────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Visits by Type — भ्रमण प्रकार</h3>
            </div>
            <StatusBarChart
              title="Visits by type"
              total={byType.reduce((s, v) => s + v.count, 0)}
              items={byType.map(v => ({
                label: v.visit_type.replace(/_/g, ' '),
                count: v.count,
                colorClass: 'bg-emerald-500',
              }))}
            />
          </Card>

          {/* ── 3. FOLLOW-UPS ─────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800">Follow-ups — फॉलो-अप (sector)</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Due (period)"  value={summary?.totalFollowUps ?? 0}    colorClass="text-slate-800" />
              <ReportStatCard label="Completed"           value={summary?.completedFollowUps ?? 0} colorClass="text-emerald-700" />
              <ReportStatCard label="Overdue"             value={summary?.overdueFollowUps ?? 0}   colorClass="text-red-600" subLabel="Pending past due date" />
            </div>
          </Card>

          {/* ── 4. REFERRALS ──────────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">Referrals — रेफरल (sector)</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Referrals"   value={summary?.totalReferrals ?? 0}   colorClass="text-slate-800" />
              <ReportStatCard label="Pending (Referred)" value={summary?.pendingReferrals ?? 0} colorClass="text-amber-600" />
            </div>
          </Card>

          {/* ── 5. MEDICINE ORDERS ────────────────────────────── */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-800">Medicine Requests (sector)</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <ReportStatCard label="Total Orders"  value={summary?.totalMedicineOrders ?? 0}   colorClass="text-slate-800" />
              <ReportStatCard label="Pending"       value={summary?.pendingMedicineOrders ?? 0} colorClass="text-amber-600" />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
