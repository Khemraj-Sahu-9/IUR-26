import React, { useEffect, useState } from 'react';
import { Patient, Pregnancy } from '@/types/database';
import { dataService } from '@/services/dataService';
import { useLanguage } from '@/hooks/useLanguage';
import { calculateEDDFromLMP, calculateGestationalAge } from '@/utils/maternalChildUtils';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Heart, Calendar, Clock, CheckCircle2, Plus, History, AlertCircle } from 'lucide-react';

interface MaternalSectionProps {
  patient: Patient;
  onRecordMaternalVisit: () => void;
  onScheduleFollowup: () => void;
}

export const MaternalSection: React.FC<MaternalSectionProps> = ({
  patient,
  onRecordMaternalVisit,
  onScheduleFollowup,
}) => {
  const { t } = useLanguage();
  const [activePregnancy, setActivePregnancy] = useState<Pregnancy | null>(null);
  const [pregnancyHistory, setPregnancyHistory] = useState<Pregnancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const [lmpDate, setLmpDate] = useState('');
  const [gravida, setGravida] = useState(1);
  const [para, setPara] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const calculatedEDD = lmpDate ? calculateEDDFromLMP(lmpDate) : null;
  const gestationalAge = activePregnancy?.lmp_date ? calculateGestationalAge(activePregnancy.lmp_date) : null;

  const loadData = async () => {
    try {
      setLoading(true);
      const allRecords = await dataService.getPregnanciesByPatient(patient.id);
      const active = allRecords.find((p) => p.status === 'active') || null;
      const history = allRecords.filter((p) => p.status !== 'active');
      setActivePregnancy(active);
      setPregnancyHistory(history);
    } catch (err: unknown) {
      console.error('Failed to load pregnancy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patient.id]);

  const handleStartPregnancy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await dataService.createPregnancy({
        patient_id: patient.id,
        lmp_date: lmpDate || null,
        expected_due_date: calculatedEDD,
        gravida: Number(gravida),
        para: Number(para),
        notes: notes.trim() || null,
      });

      setSuccess('Pregnancy registered successfully!');
      setIsStartingNew(false);
      setLmpDate('');
      setNotes('');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register pregnancy');
    } finally {
      setSaving(false);
    }
  };

  const handleCompletePregnancy = async () => {
    if (!activePregnancy) return;
    setSaving(true);
    try {
      await dataService.updatePregnancy(activePregnancy.id, {
        status: 'completed',
        notes: activePregnancy.notes ? `${activePregnancy.notes} (Completed/Delivered)` : 'Completed/Delivered',
      });
      setSuccess('Pregnancy marked completed and archived into history.');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete pregnancy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 border-slate-200">
        <LoadingSpinner label="Checking maternal records..." size="sm" />
      </Card>
    );
  }

  return (
    <Card className="p-4 border-slate-200 space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.maternalSection}</h3>
            <p className="text-[11px] text-slate-500">Maternal &amp; Pregnancy Care</p>
          </div>
        </div>

        {activePregnancy ? (
          <Badge variant="emerald" size="sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.activePregnancy}</span>
          </Badge>
        ) : (
          <Badge variant="slate" size="sm">
            Not Pregnant
          </Badge>
        )}
      </div>

      {success && <Alert variant="success" title="Success">{success}</Alert>}
      {error && <Alert variant="danger" title="Error">{error}</Alert>}

      {/* Case 1: Active Pregnancy is being tracked */}
      {activePregnancy && !isStartingNew && (
        <div className="space-y-3">
          <div className="bg-pink-50/70 border border-pink-200 rounded-xl p-3.5 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">LMP Date</span>
                <span className="font-bold text-slate-900 text-sm">
                  {activePregnancy.lmp_date || 'Not recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Expected Due Date (EDD)</span>
                <span className="font-bold text-pink-700 text-sm">
                  {activePregnancy.expected_due_date || 'Not calculated'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-pink-200/60 grid grid-cols-3 gap-1 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block font-medium">Gestational Age</span>
                <span className="font-bold text-slate-800">{gestationalAge || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gravida / Para</span>
                <span className="font-bold text-slate-800">
                  G{activePregnancy.gravida || 1} P{activePregnancy.para || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Registered</span>
                <span className="font-bold text-slate-800">{activePregnancy.registration_date}</span>
              </div>
            </div>

            {activePregnancy.notes && (
              <p className="text-xs text-slate-600 bg-white/70 p-2 rounded border border-pink-100 italic">
                "{activePregnancy.notes}"
              </p>
            )}
          </div>

          {/* Quick Actions for Maternal Tracking */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRecordMaternalVisit}
              className="gap-1 border-pink-300 text-pink-900 hover:bg-pink-50 font-bold min-h-[40px]"
            >
              <Calendar className="w-3.5 h-3.5 text-pink-600" />
              <span>{t.recordMaternalVisit}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onScheduleFollowup}
              className="gap-1 border-amber-300 text-amber-900 hover:bg-amber-50 font-bold min-h-[40px]"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.scheduleFollowup}</span>
            </Button>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleCompletePregnancy}
              disabled={saving}
              className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 underline text-center py-1 cursor-pointer"
            >
              {t.completePregnancy} (Delivery / Close)
            </button>
          </div>
        </div>
      )}

      {/* Case 2: No Active Pregnancy */}
      {!activePregnancy && !isStartingNew && (
        <div className="space-y-3 py-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center space-y-1.5">
            <AlertCircle className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">{t.noActivePregnancy}</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              {t.startPregnancyPrompt}
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsStartingNew(true)}
            className="w-full gap-1.5 bg-pink-700 hover:bg-pink-800 text-white font-bold min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.startPregnancy}</span>
          </Button>
        </div>
      )}

      {/* Case 3: Registration Form */}
      {isStartingNew && (
        <form onSubmit={handleStartPregnancy} className="space-y-3 pt-1">
          <div className="p-3 bg-pink-50/50 border border-pink-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-pink-900 uppercase tracking-wider">
              {t.startPregnancy}
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.lmpDate} *
              </label>
              <input
                type="date"
                required
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
                className="w-full min-h-[42px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {calculatedEDD && (
              <div className="p-2 bg-white rounded-lg border border-pink-200 text-xs text-pink-900">
                <span className="font-semibold text-slate-600 block">
                  Calculated EDD (Estimated Due Date):
                </span>
                <span className="font-extrabold text-sm text-pink-700">{calculatedEDD}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Based on 40 weeks standard gestational calculation (Naegele's rule)
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gravida</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={gravida}
                  onChange={(e) => setGravida(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Para (Births)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={para}
                  onChange={(e) => setPara(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full min-h-[40px] px-3 py-1 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notes / High-Risk Alerts</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nutritional status, previous complications, blood group..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-pink-500 min-h-[60px]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={saving || !lmpDate}
              className="flex-1 bg-pink-700 hover:bg-pink-800 text-white font-bold"
            >
              {saving ? 'Saving...' : 'Save Pregnancy'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsStartingNew(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Pregnancy History Section (Preserved) */}
      {pregnancyHistory.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {t.pregnancyHistory} ({pregnancyHistory.length}) {showHistory ? '▲' : '▼'}
            </span>
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2">
              {pregnancyHistory.map((hist) => (
                <div key={hist.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">
                      Reg: {hist.registration_date}
                    </span>
                    <Badge variant="slate" size="sm">
                      {hist.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    LMP: {hist.lmp_date || 'N/A'} • EDD: {hist.expected_due_date || 'N/A'}
                  </p>
                  {hist.notes && <p className="text-slate-600 italic">"{hist.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
