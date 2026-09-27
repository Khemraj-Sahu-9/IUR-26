import React, { useEffect, useState } from 'react';
import { Visit } from '@/types/database';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FileText, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface VisitHistorySectionProps {
  patientId: string;
}

export const VisitHistorySection: React.FC<VisitHistorySectionProps> = ({ patientId }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    dataService.getVisitsByPatient(patientId)
      .then((data) => {
        if (mounted) setVisits(data);
      })
      .catch((err) => console.error('Failed to load patient visits:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [patientId]);

  const visitTypeLabels: Record<string, string> = {
    routine_anc: 'Routine ANC',
    pnc: 'PNC Care',
    immunization: 'Immunization',
    general_checkup: 'General Checkup',
    communicable_disease: 'Communicable Disease',
  };

  if (loading) {
    return (
      <Card className="p-4 border-slate-200">
        <LoadingSpinner label="Loading visit records..." size="sm" />
      </Card>
    );
  }

  if (visits.length === 0) {
    return (
      <Card className="p-4 border-slate-200 text-center text-slate-500 text-sm">
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-700">No home visits recorded yet</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Use the "Record Visit" button above to log a clinical visit, vitals, and next steps.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {visits.map((visit) => {
        const isExpanded = expandedId === visit.id;
        return (
          <Card
            key={visit.id}
            className="p-3.5 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            onClick={() => setExpandedId(isExpanded ? null : visit.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {visitTypeLabels[visit.visit_type] || visit.visit_type}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {visit.visit_date}
                    </span>
                    {visit.follow_up_required && (
                      <Badge variant="amber" size="sm">
                        Follow-up Scheduled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                {visit.notes && (
                  <div>
                    <span className="font-semibold text-slate-600 block mb-0.5">Notes:</span>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded-lg whitespace-pre-wrap">
                      {visit.notes}
                    </p>
                  </div>
                )}

                {visit.next_follow_up_date && (
                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50 p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Next Due: <strong>{visit.next_follow_up_date}</strong></span>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
