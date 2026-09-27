import React, { useEffect, useState, useCallback } from 'react';
import { Notification } from '@/types/database';
import { dataService } from '@/services/dataService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface NotificationsViewProps {
  onBack: () => void;
  onNavigateAction?: (sourceType: string, sourceId?: string | null) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onBack,
  onNavigateAction,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dataService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setActionInProgress(id);
    await dataService.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setActionInProgress(null);
  };

  const handleMarkAllRead = async () => {
    setActionInProgress('all');
    await dataService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setActionInProgress(null);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Notifications"
        subtitle="सूचनाएं एवं अलर्ट"
        onBack={onBack}
      />

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            Unread: {unreadCount}
          </span>
          {unreadCount > 0 && (
            <Badge variant="red" size="sm">
              {unreadCount} New
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={actionInProgress === 'all'}
            className="flex items-center gap-1.5 min-h-[36px]"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner label="Loading notifications..." size="md" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You are completely caught up with your field alerts and updates."
          icon={<Bell className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`p-3.5 text-left space-y-2 transition-all ${
                item.is_read
                  ? 'bg-white opacity-80 border-slate-200'
                  : 'bg-emerald-50/40 border-l-4 border-l-emerald-600 border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-white shadow-xs border border-slate-100">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h4 className={`text-sm ${item.is_read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item.id)}
                    disabled={actionInProgress === item.id}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex-shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 pl-7">{item.message}</p>

              {item.source_type && onNavigateAction && (
                <div className="pt-1 pl-7">
                  <button
                    type="button"
                    onClick={() => onNavigateAction(item.source_type!, item.source_id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
