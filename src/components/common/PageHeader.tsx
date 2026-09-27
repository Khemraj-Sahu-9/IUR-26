import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  rightAction,
}) => {
  return (
    <div className="flex items-start justify-between gap-3 text-left py-1">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            className="min-h-[44px] min-w-[44px] -ml-2 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
};
