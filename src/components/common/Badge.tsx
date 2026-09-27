import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'red' | 'blue' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
}) => {
  const styles = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    blue: 'bg-sky-100 text-sky-800 border-sky-300',
    slate: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};
