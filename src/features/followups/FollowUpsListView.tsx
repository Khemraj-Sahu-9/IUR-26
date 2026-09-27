import React, { useEffect, useState } from 'react';
import { FollowUp } from '@/types/database';
import { dataService } from '@/services/dataService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Clock, CheckCircle2, Calendar, CheckSquare, AlertTriangle } from 'lucide-react';

interface FollowUpsListViewProps {
  onBack?: () => void;
}

type TabFilter = 'today' | 'upcoming' | 'overdue' | 'completed';

export const FollowUpsListView: React.FC<FollowUpsListViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('today');
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dataService.getFollowUps();
      setFollowups(data);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      setCompletingId(id);
      await dataService.updateFollowUp(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      await loadData();
    } catch (err) {
      console.error('Failed to complete follow up:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const todayList = followups.filter((f) => f.due_date === todayStr && f.status !== 'completed');
  const upcomingList = followups.filter((f) => f.due_date > todayStr && f.status === 'pending');
  const overdueList = followups.filter((f) => f.due_date < todayStr && f.status === 'pending');
  const completedList = followups.filter((f) => f.status === 'completed');

  const filteredList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'upcoming'
      ? upcomingList
      : activeTab === 'overdue'
      ? overdueList
      : completedList;

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="Field Tasks & Reminders • दैनिक कार्य"
        subtitle="Scheduled home checkups, ANC visits & follow-up care"
        onBack={onBack}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'today'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Today ({todayList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Upcoming ({upcomingList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'overdue'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span>Overdue ({overdueList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Completed ({completedList.length})</span>
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <Card className="p-6 text-center border-slate-200">
          <LoadingSpinner label="Loading scheduled follow-up tasks..." size="sm" />
        </Card>
      ) : filteredList.length === 0 ? (
        <Card className="p-8 border-slate-200">
          <EmptyState
            title={`No ${activeTab} follow-ups`}
            description={
              activeTab === 'today'
                ? 'No home checkups scheduled for today. Great job keeping up!'
                : activeTab === 'overdue'
                ? 'No overdue visits. Field schedule is up to date!'
                : activeTab === 'upcoming'
                ? 'No future follow-ups recorded yet.'
                : 'No completed follow-ups recorded in this period.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredList.map((item) => (
            <Card key={item.id} className="p-3.5 border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.due_date < todayStr
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.due_date < todayStr ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        Due: {item.due_date}
                      </span>
                      {item.status === 'completed' ? (
                        <Badge variant="emerald" size="sm">
                          Completed
                        </Badge>
                      ) : item.due_date < todayStr ? (
                        <Badge variant="red" size="sm">
                          Overdue
                        </Badge>
                      ) : (
                        <Badge variant="amber" size="sm">
                          Pending
                        </Badge>
                      )}
                    </div>

                    {item.notes ? (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg mt-1">
                        {item.notes}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Routine field follow-up</p>
                    )}

                    {item.completed_at && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed on {item.completed_at.split('T')[0]}
                      </p>
                    )}
                  </div>
                </div>

                {item.status === 'pending' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="shrink-0 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 min-h-[40px]"
                    disabled={completingId === item.id}
                    onClick={() => handleComplete(item.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completingId === item.id ? '...' : 'Mark Done'}</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
