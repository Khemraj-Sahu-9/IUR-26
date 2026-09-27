import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  className = '',
}) => {
  const styles = {
    danger: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[variant];

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${current.container} ${className}`}
      role="alert"
    >
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
};
