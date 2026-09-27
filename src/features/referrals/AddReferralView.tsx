import React, { useState } from 'react';
import { Patient } from '@/types/database';
import { dataService } from '@/services/dataService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useLanguage } from '@/hooks/useLanguage';
import { User, ArrowUpRight } from 'lucide-react';

interface AddReferralViewProps {
  patient: Patient;
  ashaId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddReferralView: React.FC<AddReferralViewProps> = ({
  patient,
  ashaId,
  onBack,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [referredTo, setReferredTo] = useState<string>('PHC Rampur');
  const [reason, setReason] = useState<string>('');
  const [referralDate, setReferralDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a medical reason for referral');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await dataService.createReferral({
        patient_id: patient.id,
        asha_id: ashaId,
        referred_to: referredTo.trim(),
        reason: reason.trim(),
        referral_date: referralDate,
        status: 'referred',
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: unknown) {
      console.error('Failed to create referral:', err);
      setError(err instanceof Error ? err.message : 'Failed to create referral');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="Refer Patient • मरीज रेफर करें"
        subtitle={`Referral for ${patient.full_name}`}
        onBack={onBack}
        backLabel={t.back}
      />

      {/* Patient Info Summary */}
      <Card className="p-3 bg-slate-50 border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{patient.full_name}</h4>
          <p className="text-xs text-slate-500">
            {patient.patient_code} • {patient.gender}
          </p>
        </div>
      </Card>

      {error && (
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" title="Success">
          Referral created successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-4 space-y-4 border-slate-200">
          {/* Referral Date */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Referral Date • रेफरल तिथि *
            </label>
            <input
              type="date"
              required
              value={referralDate}
              onChange={(e) => setReferralDate(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Referred To Facility */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Referred To Facility • स्वास्थ्य केंद्र / अस्पताल *
            </label>
            <select
              value={referredTo}
              onChange={(e) => setReferredTo(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Sub-Centre Rampur">Sub-Centre Rampur (उप-स्वास्थ्य केंद्र)</option>
              <option value="PHC Rampur">PHC Rampur (प्राथमिक स्वास्थ्य केंद्र)</option>
              <option value="CHC Sadar">CHC Sadar (सामुदायिक स्वास्थ्य केंद्र)</option>
              <option value="District Hospital">District Hospital (जिला चिकित्सालय)</option>
            </select>
          </div>

          {/* Clinical Reason */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Reason for Referral • रेफर करने का कारण *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., High BP during 3rd trimester ANC, severe anemia, persistent fever..."
              className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Additional Notes / Transport Arranged • अन्य जानकारी
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Accompanied by family, 108 ambulance called, prior medication given..."
              className="w-full min-h-[60px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full min-h-[48px] bg-purple-700 hover:bg-purple-800 text-white flex items-center justify-center gap-1.5"
            disabled={saving || success}
          >
            <ArrowUpRight className="w-5 h-5" />
            <span>{saving ? 'Creating Referral...' : 'Create Referral • रेफरल दर्ज करें'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full min-h-[48px]"
            onClick={onBack}
            disabled={saving}
          >
            {t.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
};
