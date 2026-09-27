/**
 * VisitSparkline.tsx — Phase 8
 * A simple inline bar chart for "visits by day" data.
 * Provides an accessible <table> equivalent alongside the visual bars.
 */
import React from 'react';

interface VisitSparklineProps {
  data: { date: string; count: number }[];
  label?: string;
}

export const VisitSparkline: React.FC<VisitSparklineProps> = ({ data, label = 'Visits over time' }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  const displayData = data.slice(-30);

  return (
    <div className="space-y-3">
      {/* Visual bar chart */}
      <div className="flex items-end gap-0.5 h-16" aria-hidden="true">
        {displayData.map(({ date, count }) => {
          const pct = Math.round((count / max) * 100);
          return (
            <div
              key={date}
              title={`${date}: ${count} visit${count !== 1 ? 's' : ''}`}
              className="flex-1 bg-emerald-500 rounded-t min-w-[4px] transition-all"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
          );
        })}
      </div>

      {/* Accessible table equivalent */}
      <details className="text-xs">
        <summary className="cursor-pointer text-slate-500 font-semibold hover:text-slate-700 focus:outline-none">
          View data table — {label}
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 max-h-48">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-700">Date</th>
                <th className="px-3 py-2 font-bold text-slate-700">Visits Recorded</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-3 py-2 text-slate-400 italic text-center">
                    No visit records found in this date range.
                  </td>
                </tr>
              ) : (
                displayData.map(({ date, count }) => (
                  <tr key={date} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-1.5 text-slate-700">{date}</td>
                    <td className="px-3 py-1.5 text-slate-800 font-semibold">{count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};
