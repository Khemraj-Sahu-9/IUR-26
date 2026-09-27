import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { Household, Patient } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { PatientCard } from '@/components/patients/PatientCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { MapPin, Users, Plus, Home } from 'lucide-react';

interface HouseholdDetailsViewProps {
  household: Household;
  onBack: () => void;
  onAddPatient: (household: Household) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const HouseholdDetailsView: React.FC<HouseholdDetailsViewProps> = ({
  household,
  onBack,
  onAddPatient,
  onSelectPatient,
}) => {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getPatientsByHousehold(household.id);
      setPatients(data);
    } catch (err: unknown) {
      console.error('Failed to load household patients:', err);
      setError(err instanceof Error ? err.message : 'Error loading family members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [household.id]);

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title={household.head_of_family}
        subtitle={`Code: ${household.household_code}`}
        onBack={onBack}
        backLabel={t.back}
      />

      {/* Household Profile Card */}
      <Card className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white border-0 space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              <span>{t.householdDetails}</span>
            </span>
            <h2 className="text-xl font-bold">{household.head_of_family}</h2>
            <div className="flex items-center gap-1 text-sm text-emerald-100">
              <MapPin className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>
                {household.address}, {household.village}{household.ward ? ` (${household.ward})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-600/60 flex items-center justify-between text-xs text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold text-white">{patients.length}</span>
            <span>{t.registeredMembers}</span>
          </div>
          <span className="bg-emerald-600/50 px-2 py-0.5 rounded text-[11px]">
            {household.household_code}
          </span>
        </div>
      </Card>

      {/* Family Members / Patient Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.registeredMembers} ({patients.length})
            </h3>
            <p className="text-xs text-slate-500">Maternal, child, and general members</p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onAddPatient(household)}
            className="gap-1 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addPatient}</span>
          </Button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner label="Loading family members..." size="sm" />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load members"
            message={error}
            onRetry={loadPatients}
            retryLabel={t.retry}
          />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title={t.noPatientsInHousehold}
            description={t.addFirstPatientPrompt}
            actionLabel={t.addPatientToHousehold}
            onAction={() => onAddPatient(household)}
          />
        ) : (
          <div className="space-y-2.5">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                householdCode={household.household_code}
                onClick={() => onSelectPatient(patient)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
