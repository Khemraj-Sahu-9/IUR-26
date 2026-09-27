import React, { useState } from 'react';
import { Patient } from '@/types/database';
import { dataService } from '@/services/dataService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useLanguage } from '@/hooks/useLanguage';
import { User } from 'lucide-react';

interface AddVisitViewProps {
  patient: Patient;
  ashaId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddVisitView: React.FC<AddVisitViewProps> = ({
  patient,
  ashaId,
  onBack,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [visitType, setVisitType] = useState<string>('routine_anc');
  const [notes, setNotes] = useState<string>('');
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>('');
  const [followUpNote, setFollowUpNote] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await dataService.createVisit({
        patient_id: patient.id,
        asha_id: ashaId,
        visit_date: visitDate,
        visit_type: visitType,
        notes: notes.trim() || undefined,
        follow_up_required: followUpRequired,
        next_follow_up_date: followUpRequired && nextFollowUpDate ? nextFollowUpDate : undefined,
        follow_up_note: followUpRequired && followUpNote ? followUpNote.trim() : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: unknown) {
      console.error('Failed to record visit:', err);
      setError(err instanceof Error ? err.message : 'Failed to record visit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="Record Home Visit • गृह भ्रमण दर्ज करें"
        subtitle={`Recording visit for ${patient.full_name}`}
        onBack={onBack}
        backLabel={t.back}
      />

      {/* Patient Info Summary */}
      <Card className="p-3 bg-slate-50 border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
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
          Home visit recorded successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-4 space-y-4 border-slate-200">
          {/* Visit Date */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Visit Date • भ्रमण तिथि *
            </label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Visit Type • भ्रमण प्रकार *
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="routine_anc">Routine ANC (प्रसव पूर्व जांच)</option>
              <option value="pnc">PNC (प्रसव पश्चात जांच)</option>
              <option value="immunization">Immunization (टीकाकरण)</option>
              <option value="general_checkup">General Checkup (सामान्य जांच)</option>
              <option value="communicable_disease">Communicable Disease (संचारी रोग)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Clinical Notes / Findings • टिप्पणी
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record vitals, symptoms, advice given, medication..."
              className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Follow-up Required Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 min-h-[48px] cursor-pointer">
              <input
                type="checkbox"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-800">
                Follow-up required? (फॉलो-अप आवश्यक है?)
              </span>
            </label>
          </div>

          {/* Conditional Follow-up Fields */}
          {followUpRequired && (
            <div className="space-y-3 pl-8 border-l-2 border-emerald-400 bg-emerald-50/50 p-3 rounded-r-xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Next Follow-up Date • अगली तारीख *
                </label>
                <input
                  type="date"
                  required={followUpRequired}
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Follow-up Instructions • निर्देश
                </label>
                <textarea
                  rows={2}
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Reason for next visit (e.g., check BP, iron tablets review)..."
                  className="w-full min-h-[60px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full min-h-[48px]"
            disabled={saving || success}
          >
            {saving ? 'Saving Visit...' : 'Save Visit • भ्रमण सहेजें'}
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
