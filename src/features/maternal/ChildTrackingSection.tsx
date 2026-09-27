import React, { useEffect, useState } from 'react';
import { Patient, Visit, FollowUp } from '@/types/database';
import { dataService } from '@/services/dataService';
import { useLanguage } from '@/hooks/useLanguage';
import { formatChildAge } from '@/utils/maternalChildUtils';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Baby, Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface ChildTrackingSectionProps {
  patient: Patient;
  onRecordChildVisit: () => void;
  onScheduleChildFollowup: () => void;
}

export const ChildTrackingSection: React.FC<ChildTrackingSectionProps> = ({
  patient,
  onRecordChildVisit,
  onScheduleChildFollowup,
}) => {
  const { t } = useLanguage();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const childAge = formatChildAge(patient.date_of_birth);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      dataService.getVisitsByPatient(patient.id),
      dataService.getFollowUpsByPatient(patient.id),
    ])
      .then(([vList, fList]) => {
        if (mounted) {
          setVisits(vList.filter((v) => v.visit_type === 'immunization' || v.visit_type === 'child_growth'));
          setFollowups(fList);
        }
      })
      .catch((err) => console.error('Failed loading child data:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [patient.id]);

  const pendingFollowups = followups.filter((f) => f.status === 'pending');

  if (loading) {
    return (
      <Card className="p-4 border-slate-200">
        <LoadingSpinner label="Loading child tracking..." size="sm" />
      </Card>
    );
  }

  return (
    <Card className="p-4 border-slate-200 space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Baby className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.childTracking}</h3>
            <p className="text-[11px] text-slate-500">Growth &amp; Immunization Tracking</p>
          </div>
        </div>

        <Badge variant="blue" size="sm">
          {childAge}
        </Badge>
      </div>

      {/* Child Summary Stats Card */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-slate-500 block">Date of Birth</span>
            <span className="font-bold text-slate-800 text-sm">
              {patient.date_of_birth || 'Not recorded'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Gender</span>
            <span className="font-bold text-slate-800 text-sm capitalize">
              {patient.gender}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold">Vaccine / Growth Checks:</span>
            <span className="font-bold text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded">
              {visits.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold">Due Reminders:</span>
            <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
              {pendingFollowups.length}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRecordChildVisit}
          className="gap-1 border-sky-300 text-sky-900 hover:bg-sky-50 font-bold min-h-[40px]"
        >
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>{t.recordChildVisit}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onScheduleChildFollowup}
          className="gap-1 border-amber-300 text-amber-900 hover:bg-amber-50 font-bold min-h-[40px]"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.scheduleFollowup}</span>
        </Button>
      </div>

      {/* Recent Child Visits */}
      {visits.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-bold text-slate-700">Recent Growth &amp; Vaccine Checks</h4>
          <div className="space-y-1">
            {visits.slice(0, 3).map((v) => (
              <div key={v.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">{v.visit_date}</span>
                  <span className="text-slate-500 ml-1.5 capitalize">({v.visit_type.replace('_', ' ')})</span>
                  {v.notes && <p className="text-[11px] text-slate-500 truncate">{v.notes}</p>}
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
