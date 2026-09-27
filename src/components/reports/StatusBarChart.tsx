/**
 * StatusBarChart.tsx — Phase 8
 * Horizontal bar chart for status breakdowns (follow-ups, referrals, medicine orders).
 * Each bar is labeled and an accessible table is always rendered.
 */
import React from 'react';

interface StatusBarItem {
  label: string;
  count: number;
  colorClass: string; // bg-* tailwind class
}

interface StatusBarChartProps {
  title: string;
  items: StatusBarItem[];
  total: number;
}

export const StatusBarChart: React.FC<StatusBarChartProps> = ({ title, items, total }) => {
  if (total === 0) {
    return (
      <p className="text-xs text-slate-400 italic py-3 text-center">
        No data for this period.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Horizontal bars */}
      <div className="space-y-1.5" aria-hidden="true">
        {items.filter(i => i.count > 0).map(({ label, count, colorClass }) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-20 text-slate-600 font-semibold text-right flex-shrink-0 capitalize">{label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass} transition-all`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="w-8 text-right font-bold text-slate-800 flex-shrink-0">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Accessible table */}
      <details className="text-xs mt-2">
        <summary className="cursor-pointer text-slate-500 font-semibold hover:text-slate-700 focus:outline-none">
          View data table — {title}
        </summary>
        <table className="w-full text-xs mt-2 border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-bold text-slate-700">Status</th>
              <th className="px-3 py-2 text-right font-bold text-slate-700">Count</th>
              <th className="px-3 py-2 text-right font-bold text-slate-700">%</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ label, count }) => (
              <tr key={label} className="border-t border-slate-100">
                <td className="px-3 py-1.5 capitalize text-slate-700">{label}</td>
                <td className="px-3 py-1.5 text-right font-semibold text-slate-800">{count}</td>
                <td className="px-3 py-1.5 text-right text-slate-500">
                  {total > 0 ? Math.round((count / total) * 100) : 0}%
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 bg-slate-50">
              <td className="px-3 py-1.5 font-bold text-slate-700">Total</td>
              <td className="px-3 py-1.5 text-right font-bold text-slate-900">{total}</td>
              <td className="px-3 py-1.5 text-right font-bold text-slate-500">100%</td>
            </tr>
          </tbody>
        </table>
      </details>
    </div>
  );
};
