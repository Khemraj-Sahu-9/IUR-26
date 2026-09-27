import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Patient, Household, FollowUp, Referral, Pregnancy } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { VisitHistorySection } from '@/features/visits/VisitHistorySection';
import { FollowUpsSection } from '@/features/followups/FollowUpsSection';
import { ReferralsSection } from '@/features/referrals/ReferralsSection';
import { MaternalSection } from '@/features/maternal/MaternalSection';
import { ChildTrackingSection } from '@/features/maternal/ChildTrackingSection';
import { isChildPatient } from '@/utils/maternalChildUtils';
import { 
  User, 
  Calendar, 
  Phone, 
  Home, 
  Clock, 
  FileText, 
  Baby, 
  Heart, 
  ArrowUpRight,
  Edit3,
  Plus
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
  onSelectHousehold?: (household: Household) => void;
  onRecordVisit?: (patient: Patient) => void;
  onReferPatient?: (patient: Patient) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient: initialPatient,
  onBack,
  onEdit,
  onSelectHousehold,
  onRecordVisit,
  onReferPatient,
}) => {
  const { t } = useLanguage();
  const [patient] = useState<Patient>(initialPatient);
  const [household, setHousehold] = useState<Household | null>(null);
  const [activePregnancy, setActivePregnancy] = useState<Pregnancy | null>(null);
  const [pendingFollowups, setPendingFollowups] = useState<FollowUp[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);

  const isChild = isChildPatient(patient.date_of_birth);
  const isFemale = patient.gender === 'female';

  useEffect(() => {
    dataService.getHouseholdById(patient.household_id).then((hh) => {
      setHousehold(hh);
    });

    if (isFemale) {
      dataService.getActivePregnancyByPatient(patient.id).then((preg) => {
        setActivePregnancy(preg);
      });
    }

    dataService.getFollowUpsByPatient(patient.id).then((fu) => {
      setPendingFollowups(fu.filter((f) => f.status === 'pending'));
    });

    dataService.getReferralsByPatient(patient.id).then((refs) => {
      setPendingReferrals(refs.filter((r) => r.status === 'referred'));
    });
  }, [patient.household_id, patient.id, isFemale]);

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

        {/* Phase 5 Badges: Pregnant, Child, Active Follow-up, Referral Pending */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {activePregnancy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500 text-white shadow-2xs">
              <Heart className="w-3 h-3 fill-current" />
              <span>{t.badgePregnant}</span>
            </span>
          )}
          {isChild && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-white shadow-2xs">
              <Baby className="w-3 h-3" />
              <span>{t.badgeChild}</span>
            </span>
          )}
          {pendingFollowups.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
              <Clock className="w-3 h-3" />
              <span>Active Follow-up ({pendingFollowups.length})</span>
            </span>
          )}
          {pendingReferrals.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white shadow-2xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>Referral Pending</span>
            </span>
          )}
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

      {/* Primary Field Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => onRecordVisit?.(patient)}
          className="min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record Visit</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => onReferPatient?.(patient)}
          className="min-h-[48px] bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100 font-bold flex items-center justify-center gap-1.5 rounded-xl"
        >
          <ArrowUpRight className="w-4 h-4 text-purple-700" />
          <span>Refer Patient</span>
        </Button>
      </div>

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

      {/* Phase 5 Structured Maternal & Child Tracking Sections */}
      {isFemale && (
        <MaternalSection
          patient={patient}
          onRecordMaternalVisit={() => onRecordVisit?.(patient)}
          onScheduleFollowup={() => onRecordVisit?.(patient)}
        />
      )}

      {isChild && (
        <ChildTrackingSection
          patient={patient}
          onRecordChildVisit={() => onRecordVisit?.(patient)}
          onScheduleChildFollowup={() => onRecordVisit?.(patient)}
        />
      )}

      {/* Clinical Sections */}
      <div className="space-y-4">
        {/* Section 1: Home Visits History */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{t.visitsSection}</span>
            </div>
            <button
              type="button"
              onClick={() => onRecordVisit?.(patient)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              + Record
            </button>
          </div>
          <VisitHistorySection patientId={patient.id} />
        </div>

        {/* Section 2: Follow-up Reminders */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{t.followupsSection}</span>
            </div>
          </div>
          <FollowUpsSection patientId={patient.id} />
        </div>

        {/* Section 3: Referrals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
              <span>{t.referralsSection}</span>
            </div>
            <button
              type="button"
              onClick={() => onReferPatient?.(patient)}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              + Refer
            </button>
          </div>
          <ReferralsSection patientId={patient.id} />
        </div>
      </div>
    </div>
  );
};

