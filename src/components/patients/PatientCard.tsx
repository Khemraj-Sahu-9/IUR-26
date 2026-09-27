import React from 'react';
import { Patient } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { User, Phone, ChevronRight } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
  householdCode?: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  householdCode,
}) => {
  const calculateAge = (dob: string | null): string => {
    if (!dob) return '';
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age}y` : '<1y';
  };

  const age = calculateAge(patient.date_of_birth);

  const genderBadgeMap = {
    female: { label: 'Female • महिला', variant: 'blue' as const },
    male: { label: 'Male • पुरुष', variant: 'slate' as const },
    other: { label: 'Other', variant: 'slate' as const },
  };

  const statusBadgeMap = {
    active: { label: 'Active', variant: 'emerald' as const },
    migrated: { label: 'Migrated', variant: 'amber' as const },
    deceased: { label: 'Deceased', variant: 'red' as const },
  };

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
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {patient.full_name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {patient.patient_code}
              </span>
              {age && (
                <span className="text-xs font-bold text-slate-600">
                  {age}
                </span>
              )}
              {patient.relationship_to_head && (
                <span className="text-xs text-slate-500">
                  ({patient.relationship_to_head})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={statusBadgeMap[patient.status].variant} size="sm">
            {statusBadgeMap[patient.status].label}
          </Badge>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Badge variant={genderBadgeMap[patient.gender].variant} size="sm">
            {genderBadgeMap[patient.gender].label}
          </Badge>
          {householdCode && (
            <span className="text-slate-600 font-medium">
              HH: {householdCode}
            </span>
          )}
        </div>
        {patient.phone && (
          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.phone}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
