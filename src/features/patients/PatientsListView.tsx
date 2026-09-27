import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Patient, Household, Pregnancy, FollowUp } from '@/types/database';
import { isChildPatient } from '@/utils/maternalChildUtils';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { PatientCard } from '@/components/patients/PatientCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { Users, Plus } from 'lucide-react';

interface PatientsListViewProps {
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: () => void;
}

type CategoryFilter = 'all' | 'pregnant' | 'children' | 'overdue' | 'female' | 'male';

export const PatientsListView: React.FC<PatientsListViewProps> = ({
  onSelectPatient,
  onAddPatient,
}) => {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ptData, hhData, pregData, fuData] = await Promise.all([
        dataService.getPatients(),
        dataService.getHouseholds(),
        dataService.getAllActivePregnancies(),
        dataService.getFollowUps(),
      ]);
      setPatients(ptData);
      setHouseholds(hhData);
      setPregnancies(pregData);
      setFollowups(fuData);
    } catch (err: unknown) {
      console.error('Failed to load patients:', err);
      setError(err instanceof Error ? err.message : 'Database error loading patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const householdCodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    households.forEach((h) => {
      map[h.id] = h.household_code;
    });
    return map;
  }, [households]);

  const pregnantPatientIds = useMemo(() => {
    return new Set(pregnancies.filter((p) => p.status === 'active').map((p) => p.patient_id));
  }, [pregnancies]);

  const todayStr = new Date().toISOString().split('T')[0];
  const overduePatientIds = useMemo(() => {
    return new Set(
      followups
        .filter((f) => f.status === 'pending' && f.due_date < todayStr)
        .map((f) => f.patient_id)
    );
  }, [followups, todayStr]);

  const activeFollowupPatientIds = useMemo(() => {
    return new Set(
      followups
        .filter((f) => f.status === 'pending')
        .map((f) => f.patient_id)
    );
  }, [followups]);

  // Fast field search and Phase 5 filter categories
  const filteredPatients = useMemo(() => {
    let result = patients;

    if (categoryFilter === 'pregnant') {
      result = result.filter((p) => pregnantPatientIds.has(p.id));
    } else if (categoryFilter === 'children') {
      result = result.filter((p) => isChildPatient(p.date_of_birth));
    } else if (categoryFilter === 'overdue') {
      result = result.filter((p) => overduePatientIds.has(p.id));
    } else if (categoryFilter === 'female') {
      result = result.filter((p) => p.gender === 'female');
    } else if (categoryFilter === 'male') {
      result = result.filter((p) => p.gender === 'male');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.patient_code.toLowerCase().includes(q) ||
          (p.phone && p.phone.includes(q)) ||
          (householdCodeMap[p.household_id] && householdCodeMap[p.household_id].toLowerCase().includes(q)) ||
          (p.relationship_to_head && p.relationship_to_head.toLowerCase().includes(q))
      );
    }

    return result;
  }, [patients, searchQuery, categoryFilter, householdCodeMap, pregnantPatientIds, overduePatientIds]);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.patientsTitle}
        subtitle={`${patients.length} individuals in assigned ward`}
        rightAction={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddPatient}
            className="gap-1 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addPatient}</span>
          </Button>
        }
      />

      <OfflineBanner />

      <div className="space-y-2.5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.searchPatientsPlaceholder}
        />

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.all} ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('pregnant')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'pregnant'
                ? 'bg-pink-600 text-white border-pink-600 shadow-2xs'
                : 'bg-white text-pink-600 border-pink-200 hover:bg-pink-50'
            }`}
          >
            🤰 {t.filterPregnant ?? 'Pregnant'} ({pregnantPatientIds.size})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('children')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'children'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            👶 {t.filterChildren ?? 'Children'}
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('overdue')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'overdue'
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
            }`}
          >
            ⏰ {t.filterOverdue ?? 'Overdue'} ({overduePatientIds.size})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('female')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'female'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
          >
            {t.genderFemale}
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('male')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'male'
                ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.genderMale}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading assigned patients..." size="md" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load patients"
          message={error}
          onRetry={loadData}
          retryLabel={t.retry}
        />
      ) : filteredPatients.length === 0 ? (
        searchQuery || categoryFilter !== 'all' ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title={t.noPatientsFound}
            description={`No patients match your search. Try adjusting filters or add a new patient.`}
            actionLabel={t.addPatient}
            onAction={onAddPatient}
          />
        ) : (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title={t.noPatientsYet}
            description="No patients registered yet. Register patients under households."
            actionLabel={t.addPatient}
            onAction={onAddPatient}
          />
        )
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              householdCode={householdCodeMap[patient.household_id]}
              onClick={() => onSelectPatient(patient)}
              isPregnant={pregnantPatientIds.has(patient.id)}
              hasActiveFollowup={activeFollowupPatientIds.has(patient.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
