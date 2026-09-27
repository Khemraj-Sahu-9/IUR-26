import React from 'react';
import { Household } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Home, Users, ChevronRight, MapPin } from 'lucide-react';

interface HouseholdCardProps {
  household: Household;
  patientCount?: number;
  onClick: () => void;
}

export const HouseholdCard: React.FC<HouseholdCardProps> = ({
  household,
  patientCount = 0,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all active:scale-[0.99] text-left p-4 space-y-2.5 border-slate-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {household.head_of_family}
            </h3>
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Code: {household.household_code}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800">
            <Users className="w-3.5 h-3.5" />
            <span>{patientCount} {patientCount === 1 ? 'member' : 'members'}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">
          {household.address}, {household.village}{household.ward ? ` (${household.ward})` : ''}
        </span>
      </div>
    </Card>
  );
};
