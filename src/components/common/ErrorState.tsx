import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the database.',
  onRetry,
  retryLabel = 'Retry',
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-2xl border border-red-200 bg-red-50/50 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-bold text-red-900">{title}</h4>
        <p className="text-sm text-red-700 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-300 text-red-800 hover:bg-red-100 mt-1"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
