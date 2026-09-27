/**
 * ReportStatCard.tsx — Phase 8
 * A compact stat card used across all reports.
 */
import React from 'react';
import { Card } from '@/components/common/Card';

interface ReportStatCardProps {
  label: string;
  value: number | string;
  subLabel?: string;
  colorClass?: string; // Tailwind text-* class for value
  icon?: React.ReactNode;
  loading?: boolean;
}

export const ReportStatCard: React.FC<ReportStatCardProps> = ({
  label,
  value,
  subLabel,
  colorClass = 'text-slate-900',
  icon,
  loading = false,
}) => (
  <Card className="p-3 text-left border-slate-200">
    <div className="flex items-start justify-between mb-1">
      <span className="text-xs font-semibold text-slate-500 leading-tight pr-1">{label}</span>
      {icon && <span className="flex-shrink-0 text-slate-400">{icon}</span>}
    </div>
    <div className={`text-2xl font-bold leading-none ${colorClass}`}>
      {loading ? <span className="text-slate-300">…</span> : value}
    </div>
    {subLabel && <p className="text-[11px] text-slate-400 mt-1">{subLabel}</p>}
  </Card>
);
