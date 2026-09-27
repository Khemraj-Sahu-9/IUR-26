import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Patient, Household } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { 
  User, 
  Calendar, 
  Phone, 
  Home, 
  Clock, 
  AlertCircle, 
  FileText, 
  Baby, 
  Heart, 
  Pill, 
  ArrowUpRight,
  Edit3
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
  onSelectHousehold?: (household: Household) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient: initialPatient,
  onBack,
  onEdit,
  onSelectHousehold,
}) => {
  const { t } = useLanguage();
  const [patient] = useState<Patient>(initialPatient);
  const [household, setHousehold] = useState<Household | null>(null);

  useEffect(() => {
    dataService.getHouseholdById(patient.household_id).then((hh) => {
      setHousehold(hh);
    });
  }, [patient.household_id]);

  const calculateAge = (dob: string | null): string => {
    if (!dob) return 'Age unknown';
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} years` : 'Infant (<1 year)';
  };

  const statusBadgeMap = {
    active: { label: t.statusActive, variant: 'emerald' as const },
    migrated: { label: t.statusMigrated, variant: 'amber' as const },
    deceased: { label: t.statusDeceased, variant: 'red' as const },
  };

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title={patient.full_name}
        subtitle={`${patient.patient_code} • ${calculateAge(patient.date_of_birth)}`}
        onBack={onBack}
        backLabel={t.back}
        rightAction={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1 font-bold bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t.editPatient}</span>
          </Button>
        }
      />

      {/* Patient Header Card */}
      <Card className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white border-0 space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{patient.full_name}</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {patient.gender === 'female' ? t.genderFemale : patient.gender === 'male' ? t.genderMale : t.genderOther}
                {patient.relationship_to_head ? ` • ${patient.relationship_to_head}` : ''}
              </p>
            </div>
          </div>
          <Badge variant={statusBadgeMap[patient.status].variant} size="sm">
            {statusBadgeMap[patient.status].label}
          </Badge>
        </div>

        {/* Quick Details Chips */}
        <div className="pt-2 border-t border-blue-600/60 grid grid-cols-2 gap-2 text-xs text-blue-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-300 shrink-0" />
            <span>{patient.date_of_birth || 'DOB not recorded'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-blue-300 shrink-0" />
            <span>{patient.phone || 'No phone'}</span>
          </div>
        </div>
      </Card>

      {/* Household Membership Card */}
      {household && (
        <Card className="p-3.5 border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Household</p>
              <h4 className="text-sm font-bold text-slate-800">{household.head_of_family}</h4>
              <p className="text-xs text-slate-500">{household.address}, {household.village}</p>
            </div>
          </div>
          {onSelectHousehold && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectHousehold(household)}
              className="text-xs font-semibold"
            >
              View Family
            </Button>
          )}
        </Card>
      )}

      {/* Clinical Workflow Placeholders (Explicitly designed for Future Phases) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 px-1">
          Clinical Tracking (Future Workflows)
        </h3>

        {/* Visits Placeholder */}
        <Card className="p-3.5 border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{t.visitsSection}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Phase 3
            </span>
          </div>
          <p className="text-xs text-slate-500">{t.visitsPlaceholder}</p>
        </Card>

        {/* Follow-ups Placeholder */}
        <Card className="p-3.5 border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t.followupsSection}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Phase 3
            </span>
          </div>
          <p className="text-xs text-slate-500">{t.followupsPlaceholder}</p>
        </Card>

        {/* Maternal / Pregnancy Placeholder (If Female) */}
        {patient.gender === 'female' && (
          <Card className="p-3.5 border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Heart className="w-4 h-4 text-pink-600" />
                <span>{t.maternalSection}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Phase 3
              </span>
            </div>
            <p className="text-xs text-slate-500">{t.maternalPlaceholder}</p>
          </Card>
        )}

        {/* Child Immunization Placeholder */}
        <Card className="p-3.5 border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Baby className="w-4 h-4 text-sky-600" />
              <span>{t.childSection}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Phase 3
            </span>
          </div>
          <p className="text-xs text-slate-500">{t.childPlaceholder}</p>
        </Card>

        {/* Referrals Placeholder */}
        <Card className="p-3.5 border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
              <span>{t.referralsSection}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Phase 4
            </span>
          </div>
          <p className="text-xs text-slate-500">{t.referralsPlaceholder}</p>
        </Card>

        {/* Medicine Kit Placeholder */}
        <Card className="p-3.5 border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>{t.medicineSection}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Phase 4
            </span>
          </div>
          <p className="text-xs text-slate-500">{t.medicinePlaceholder}</p>
        </Card>
      </div>
    </div>
  );
};
