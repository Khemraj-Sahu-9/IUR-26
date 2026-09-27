import React, { useEffect, useState } from 'react';
import { FollowUp } from '@/types/database';
import { dataService } from '@/services/dataService';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Clock, CheckCircle2, Calendar } from 'lucide-react';

interface FollowUpsSectionProps {
  patientId: string;
  onRefreshNeeded?: () => void;
}

export const FollowUpsSection: React.FC<FollowUpsSectionProps> = ({ patientId }) => {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const data = await dataService.getFollowUpsByPatient(patientId);
      setFollowups(data);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowups();
  }, [patientId]);

  const handleComplete = async (id: string) => {
    try {
      setCompletingId(id);
      await dataService.updateFollowUp(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      await loadFollowups();
    } catch (err) {
      console.error('Failed to complete follow-up:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusBadge = (fu: FollowUp) => {
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = fu.status === 'pending' && fu.due_date < today;

    if (fu.status === 'completed') {
      return <Badge variant="emerald" size="sm">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="red" size="sm">Overdue</Badge>;
    }
    if (fu.status === 'pending') {
      return <Badge variant="amber" size="sm">Pending</Badge>;
    }
    return <Badge variant="slate" size="sm">{fu.status}</Badge>;
  };

  if (loading) {
    return (
      <Card className="p-4 border-slate-200">
        <LoadingSpinner label="Loading follow-up reminders..." size="sm" />
      </Card>
    );
  }

  if (followups.length === 0) {
    return (
      <Card className="p-4 border-slate-200 text-center text-slate-500 text-sm">
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-700">No scheduled follow-ups</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Follow-ups can be scheduled during home visits or directly from the actions menu above.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {followups.map((fu) => (
        <Card key={fu.id} className="p-3.5 border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due: {fu.due_date}
                  </span>
                  {getStatusBadge(fu)}
                </div>

                {fu.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1">
                    {fu.notes}
                  </p>
                )}

                {fu.completed_at && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed on {fu.completed_at.split('T')[0]}
                  </p>
                )}
              </div>
            </div>

            {fu.status === 'pending' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="shrink-0 text-xs gap-1 font-bold bg-emerald-600 hover:bg-emerald-700"
                disabled={completingId === fu.id}
                onClick={() => handleComplete(fu.id)}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completingId === fu.id ? 'Saving...' : 'Done'}</span>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
