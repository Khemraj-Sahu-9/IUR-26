import React, { useEffect, useState, useCallback } from 'react';
import { Task } from '@/types/database';
import { dataService } from '@/services/dataService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Stethoscope,
  Syringe,
  Pill,
  Baby,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';

type FilterTab = 'today' | 'upcoming' | 'overdue' | 'completed';

interface TasksListViewProps {
  onBack: () => void;
}

const TASK_TYPE_LABELS: Record<string, string> = {
  anc_visit: 'ANC Visit',
  pnc_visit: 'PNC Visit',
  immunization: 'Immunization',
  follow_up: 'Follow-up',
  referral_followup: 'Referral Follow-up',
  medicine_refill: 'Medicine Refill',
  general_checkup: 'General Checkup',
  overdue_alert: 'Overdue Alert',
};

function taskTypeIcon(type: string) {
  switch (type) {
    case 'anc_visit':
    case 'pnc_visit':
      return <Baby className="w-3.5 h-3.5" />;
    case 'immunization':
      return <Syringe className="w-3.5 h-3.5" />;
    case 'medicine_refill':
      return <Pill className="w-3.5 h-3.5" />;
    case 'referral_followup':
      return <ArrowUpRight className="w-3.5 h-3.5" />;
    default:
      return <Stethoscope className="w-3.5 h-3.5" />;
  }
}

function priorityBorderClass(priority: string) {
  return priority === 'priority' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-400';
}

function statusBadgeVariant(status: string): 'amber' | 'emerald' | 'red' | 'slate' | 'blue' {
  switch (status) {
    case 'pending': return 'amber';
    case 'in_progress': return 'blue';
    case 'completed': return 'emerald';
    case 'overdue': return 'red';
    default: return 'slate';
  }
}

export const TasksListView: React.FC<TasksListViewProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('today');
  const [completing, setCompleting] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await dataService.getTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = tasks.filter((t) => {
    switch (activeTab) {
      case 'today':
        return t.due_date === todayStr && t.status !== 'completed' && t.status !== 'dismissed';
      case 'upcoming':
        return t.due_date > todayStr && t.status === 'pending';
      case 'overdue':
        return t.due_date < todayStr && (t.status === 'pending' || t.status === 'in_progress');
      case 'completed':
        return t.status === 'completed';
      default:
        return true;
    }
  });

  const overdueCount = tasks.filter(
    (t) => t.due_date < todayStr && (t.status === 'pending' || t.status === 'in_progress')
  ).length;
  const todayCount = tasks.filter(
    (t) => t.due_date === todayStr && t.status !== 'completed' && t.status !== 'dismissed'
  ).length;

  const handleComplete = async (taskId: string) => {
    setCompleting(taskId);
    await dataService.completeTask(taskId);
    setCompleting(null);
    await loadTasks();
  };

  const handleDismiss = async (taskId: string) => {
    setDismissing(taskId);
    await dataService.dismissTask(taskId);
    setDismissing(null);
    await loadTasks();
  };

  const TABS: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'today', label: 'Today', count: todayCount },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue', count: overdueCount },
    { id: 'completed', label: 'Done' },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Tasks & Follow-ups"
        subtitle="कार्य एवं फॉलो-अप"
        onBack={onBack}
      />

      {/* Tab filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === tab.id
                ? tab.id === 'overdue'
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
            {(tab.count ?? 0) > 0 && (
              <span
                className={`text-[10px] font-bold min-w-[18px] h-4.5 px-1 rounded-full flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-red-100 text-red-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading tasks..." size="md" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'today'
              ? 'No tasks for today'
              : activeTab === 'overdue'
              ? 'No overdue tasks'
              : activeTab === 'completed'
              ? 'No completed tasks yet'
              : 'No upcoming tasks'
          }
          description={
            activeTab === 'today'
              ? 'All caught up! Check upcoming tasks.'
              : activeTab === 'overdue'
              ? 'Great — nothing is overdue.'
              : 'Tasks will appear here when assigned.'
          }
          icon={activeTab === 'overdue' ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <Calendar className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isOverdue = task.due_date < todayStr && task.status !== 'completed';
            return (
              <Card
                key={task.id}
                className={`text-left p-3.5 space-y-2 ${priorityBorderClass(task.priority)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`${isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>
                        {taskTypeIcon(task.task_type)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {TASK_TYPE_LABELS[task.task_type] || task.task_type}
                      </span>
                      {task.priority === 'priority' && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 rounded-full">
                          PRIORITY
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                  <Badge variant={statusBadgeVariant(task.status)} size="sm">
                    {task.status}
                  </Badge>
                </div>

                {/* Patient & Due date row */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {task.patient && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 truncate">
                      <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {task.patient.full_name}
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1 ml-auto flex-shrink-0 ${
                      isOverdue ? 'text-red-600 font-bold' : ''
                    }`}
                  >
                    {isOverdue ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {isOverdue ? 'Overdue: ' : 'Due: '}
                    {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                {/* Actions */}
                {task.status !== 'completed' && task.status !== 'dismissed' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="flex-1 min-h-[36px]"
                      disabled={completing === task.id}
                      onClick={() => handleComplete(task.id)}
                    >
                      {completing === task.id ? 'Saving…' : '✓ Complete'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="min-h-[36px] px-3"
                      disabled={dismissing === task.id}
                      onClick={() => handleDismiss(task.id)}
                    >
                      {dismissing === task.id ? '…' : 'Dismiss'}
                    </Button>
                  </div>
                )}
                {task.status === 'completed' && task.completed_at && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed {new Date(task.completed_at).toLocaleDateString('en-IN')}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
