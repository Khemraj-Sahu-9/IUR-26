import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Patient, Household } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchBar } from '@/components/common/SearchBar';
import { PatientCard } from '@/components/patients/PatientCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { Users, Plus } from 'lucide-react';

interface PatientsListViewProps {
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: () => void;
}

export const PatientsListView: React.FC<PatientsListViewProps> = ({
  onSelectPatient,
  onAddPatient,
}) => {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ptData, hhData] = await Promise.all([
        dataService.getPatients(),
        dataService.getHouseholds(),
      ]);
      setPatients(ptData);
      setHouseholds(hhData);
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

  // Fast field search with debounced state
  const filteredPatients = useMemo(() => {
    let result = patients;

    if (genderFilter !== 'all') {
      result = result.filter((p) => p.gender === genderFilter);
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
  }, [patients, searchQuery, genderFilter, householdCodeMap]);

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
            onClick={() => setGenderFilter('all')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all ${
              genderFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.all} ({patients.length})
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter('female')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all ${
              genderFilter === 'female'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
          >
            {t.genderFemale} (ANC/Mothers)
          </button>
          <button
            type="button"
            onClick={() => setGenderFilter('male')}
            className={`min-h-[36px] px-3 py-1 rounded-full font-semibold border transition-all ${
              genderFilter === 'male'
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
        searchQuery || genderFilter !== 'all' ? (
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
