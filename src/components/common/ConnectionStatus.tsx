import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ConnectionStatusProps {
  isOnline?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline = navigator.onLine,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
        isOnline
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          : 'bg-amber-100 text-amber-900 border border-amber-300'
      } ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{t.onlineSynced}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{t.offlineLocal}</span>
        </>
      )}
    </div>
  );
};
