import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { auditLogger } from '@/services/auditLogger';
import { Household, Patient } from '@/types/database';
import { patientSchema } from '@/utils/validation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/common/Alert';
import { Home } from 'lucide-react';

interface AddPatientViewProps {
  initialHousehold?: Household | null;
  onBack: () => void;
  onSuccess: (patient: Patient) => void;
}

export const AddPatientView: React.FC<AddPatientViewProps> = ({
  initialHousehold,
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(
    initialHousehold?.id || ''
  );

  const [patientCode, setPatientCode] = useState(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `PT-2026-${randomSuffix}`;
  });
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [phone, setPhone] = useState('');
  const [relationshipToHead, setRelationshipToHead] = useState('Self');
  const [status] = useState<'active' | 'migrated' | 'deceased'>('active');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // If not supplied an initial household, load list of households for select
    if (!initialHousehold) {
      dataService.getHouseholds().then((list) => {
        setHouseholds(list);
        if (list.length > 0 && !selectedHouseholdId) {
          setSelectedHouseholdId(list[0].id);
        }
      });
    }
  }, [initialHousehold, selectedHouseholdId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (!user) {
      setServerError('User session expired. Please re-login.');
      return;
    }

    if (!selectedHouseholdId) {
      setErrors((prev) => ({ ...prev, householdId: 'Please select a household for this patient.' }));
      return;
    }

    const validationResult = patientSchema.safeParse({
      householdId: selectedHouseholdId,
      patientCode,
      fullName,
      dateOfBirth: dateOfBirth || null,
      gender,
      phone: phone || null,
      relationshipToHead: relationshipToHead || null,
      status,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const newPatient = await dataService.createPatient({
        household_id: selectedHouseholdId,
        patient_code: patientCode,
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        gender,
        phone: phone || null,
        relationshipToHead: relationshipToHead || null,
        status,
        assigned_asha_id: user.id,
      });

      await auditLogger.log({
        action: 'PATIENT_CREATED',
        tableName: 'patients',
        recordId: newPatient.id,
        metadata: {
          code: newPatient.patient_code,
          name: newPatient.full_name,
          gender: newPatient.gender,
          household_id: newPatient.household_id,
        },
      });

      onSuccess(newPatient);
    } catch (err: unknown) {
      console.error('Failed to create patient:', err);
      const msg = err instanceof Error ? err.message : 'Database error saving patient.';
      if (msg.includes('unique constraint') || msg.includes('patient_code')) {
        setErrors((prev) => ({
          ...prev,
          patientCode: 'This patient code is already registered. Please choose another.',
        }));
      } else {
        setServerError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.addPatient}
        subtitle="Register new family member"
        onBack={onBack}
        backLabel={t.back}
      />

      {serverError && (
        <Alert variant="danger" title={t.errorTitle}>
          {serverError}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Household Context */}
          {initialHousehold ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 text-xs">
              <Home className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold">Household: </span>
                <span>{initialHousehold.head_of_family} ({initialHousehold.household_code})</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label htmlFor="household-select" className="block text-sm font-semibold text-slate-800">
                {t.selectHousehold} *
              </label>
              <select
                id="household-select"
                value={selectedHouseholdId}
                onChange={(e) => setSelectedHouseholdId(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {households.length === 0 && <option value="">No households available</option>}
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.head_of_family} — {h.household_code} ({h.village})
                  </option>
                ))}
              </select>
              {errors.householdId && (
                <p className="text-sm font-medium text-red-600">{errors.householdId}</p>
              )}
            </div>
          )}

          <Input
            label={`${t.patientCode} *`}
            value={patientCode}
            error={errors.patientCode}
            onChange={(e) => setPatientCode(e.target.value)}
            placeholder="e.g. PT-2026-101"
            helperText="Unique patient identifier used in health records"
            disabled={isSubmitting}
            required
          />

          <Input
            label={`${t.fullName} *`}
            value={fullName}
            error={errors.fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sunita Bai / Pooja Sharma"
            disabled={isSubmitting}
            required
          />

          {/* Gender Segmented Control */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              {t.gender} *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['female', 'male', 'other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`min-h-[48px] py-2 px-3 rounded-xl border font-semibold text-sm transition-all text-center ${
                    gender === g
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {g === 'female' ? t.genderFemale : g === 'male' ? t.genderMale : t.genderOther}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t.dateOfBirth}
              type="date"
              value={dateOfBirth}
              error={errors.dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              helperText="Used to track immunization and ANC windows"
              disabled={isSubmitting}
            />

            <Input
              label={t.phone}
              type="tel"
              inputMode="tel"
              value={phone}
              error={errors.phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              disabled={isSubmitting}
            />
          </div>

          {/* Relationship to Head Selector */}
          <div className="space-y-1.5">
            <label htmlFor="relation-select" className="block text-sm font-semibold text-slate-800">
              {t.relationshipToHead}
            </label>
            <select
              id="relation-select"
              value={relationshipToHead}
              onChange={(e) => setRelationshipToHead(e.target.value)}
              disabled={isSubmitting}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Self">Self / Head of Family (स्वयं / मुखिया)</option>
              <option value="Wife">Wife / Mother (पत्नी / माता)</option>
              <option value="Husband">Husband / Father (पति / पिता)</option>
              <option value="Son">Son (पुत्र / बेटा)</option>
              <option value="Daughter">Daughter (पुत्री / बेटी)</option>
              <option value="Daughter-in-law">Daughter-in-law (बहू - ANC Focus)</option>
              <option value="Infant">Infant / Newborn (नवजात शिशु)</option>
              <option value="Mother">Mother / Elder (माता / बुजुर्ग)</option>
              <option value="Father">Father / Elder (पिता / बुजुर्ग)</option>
              <option value="Other">Other Relation (अन्य)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="flex-1"
            >
              {t.savePatient}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
