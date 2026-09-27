/**
 * ReportFilters.tsx — Phase 8
 * Reusable date-range filter bar for all report pages.
 */
import React, { useState } from 'react';
import { DateRangePreset, DateRange, getDateRange } from '@/services/reportService';
import { Calendar } from 'lucide-react';

export interface ReportFiltersProps {
  preset: DateRangePreset;
  customRange?: DateRange;
  onPresetChange: (preset: DateRangePreset, range: DateRange) => void;
}

const PRESETS: { key: DateRangePreset; en: string }[] = [
  { key: 'today',     en: 'Today' },
  { key: 'last7',     en: 'Last 7 Days' },
  { key: 'last30',    en: 'Last 30 Days' },
  { key: 'thisMonth', en: 'This Month' },
  { key: 'custom',    en: 'Custom' },
];

export const ReportFilters: React.FC<ReportFiltersProps> = ({ preset, customRange, onPresetChange }) => {
  const [showCustom, setShowCustom] = useState(preset === 'custom');
  const [fromDate, setFromDate] = useState(customRange?.from ?? new Date().toISOString().split('T')[0]);
  const [toDate, setToDate]     = useState(customRange?.to   ?? new Date().toISOString().split('T')[0]);

  const handlePreset = (key: DateRangePreset) => {
    if (key === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onPresetChange(key, getDateRange(key));
    }
  };

  const applyCustom = () => {
    if (fromDate && toDate && fromDate <= toDate) {
      onPresetChange('custom', { from: fromDate, to: toDate });
    }
  };

  return (
    <div className="space-y-2">
      {/* Preset buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {PRESETS.map(({ key, en }) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePreset(key)}
            className={`flex-shrink-0 min-h-[36px] px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              preset === key
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {en}
          </button>
        ))}
      </div>

      {/* Custom date range picker */}
      {showCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <label className="text-xs text-slate-600 font-semibold sr-only">From</label>
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={e => setFromDate(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold">to</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={e => setToDate(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={applyCustom}
            disabled={!fromDate || !toDate || fromDate > toDate}
            className="min-h-[32px] px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Applied range label */}
      {preset !== 'custom' && (
        <p className="text-[11px] text-slate-400 px-1">
          {getDateRange(preset).from} → {getDateRange(preset).to}
        </p>
      )}
      {preset === 'custom' && customRange && (
        <p className="text-[11px] text-slate-400 px-1">
          {customRange.from} → {customRange.to}
        </p>
      )}
    </div>
  );
};
