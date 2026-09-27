import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5 text-left">
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-base transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-400 bg-red-50/30'
              : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500 bg-white'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
