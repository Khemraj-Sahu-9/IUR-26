import React, { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { dataService } from '@/services/dataService';
import { auditLogger } from '@/services/auditLogger';
import { Patient } from '@/types/database';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { Alert } from '@/components/common/Alert';

interface EditPatientViewProps {
  patient: Patient;
  onBack: () => void;
  onSuccess: (updatedPatient: Patient) => void;
}

export const EditPatientView: React.FC<EditPatientViewProps> = ({
  patient,
  onBack,
  onSuccess,
}) => {
  const { t } = useLanguage();

  const [fullName, setFullName] = useState(patient.full_name);
  const [dateOfBirth, setDateOfBirth] = useState(patient.date_of_birth || '');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>(patient.gender);
  const [phone, setPhone] = useState(patient.phone || '');
  const [relationshipToHead, setRelationshipToHead] = useState(
    patient.relationship_to_head || 'Self'
  );
  const [status, setStatus] = useState<'active' | 'migrated' | 'deceased'>(patient.status);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrors({ fullName: 'Full name must be at least 2 characters.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await dataService.updatePatient(patient.id, {
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        gender,
        phone: phone || null,
        relationship_to_head: relationshipToHead || null,
        status,
      });

      await auditLogger.log({
        action: 'PATIENT_UPDATED',
        tableName: 'patients',
        recordId: updated.id,
        metadata: {
          code: updated.patient_code,
          name: updated.full_name,
          status: updated.status,
        },
      });

      onSuccess(updated);
    } catch (err: unknown) {
      console.error('Failed to update patient:', err);
      setServerError(err instanceof Error ? err.message : 'Database error updating patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title={t.editPatient}
        subtitle={`Code: ${patient.patient_code}`}
        onBack={onBack}
        backLabel={t.back}
      />

      {serverError && (
        <Alert variant="danger" title={t.errorTitle}>
          {serverError}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-Only System Controlled Identifiers */}
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs space-y-1">
            <p>
              <strong>Patient Identifier: </strong>
              <span className="font-mono">{patient.patient_code}</span> (System Protected)
            </p>
            <p>
              <strong>Assigned ASHA & Household: </strong>
              Preserved under Row Level Security.
            </p>
          </div>

          <Input
            label={`${t.fullName} *`}
            value={fullName}
            error={errors.fullName}
            onChange={(e) => setFullName(e.target.value)}
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
              disabled={isSubmitting}
            />

            <Input
              label={t.phone}
              type="tel"
              inputMode="tel"
              value={phone}
              error={errors.phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Relationship to Head */}
          <div className="space-y-1.5">
            <label htmlFor="edit-relation-select" className="block text-sm font-semibold text-slate-800">
              {t.relationshipToHead}
            </label>
            <select
              id="edit-relation-select"
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

          {/* Status Selector */}
          <div className="space-y-1.5">
            <label htmlFor="edit-status-select" className="block text-sm font-semibold text-slate-800">
              {t.patientStatus}
            </label>
            <select
              id="edit-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'migrated' | 'deceased')}
              disabled={isSubmitting}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-base bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="active">{t.statusActive}</option>
              <option value="migrated">{t.statusMigrated}</option>
              <option value="deceased">{t.statusDeceased}</option>
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
              {t.save}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
