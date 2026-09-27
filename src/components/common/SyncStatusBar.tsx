/**
 * SyncStatusBar.tsx
 *
 * Global sync status indicator — renders as a fixed pill at the top of the
 * app (below the AppLayout header) showing:
 *
 *   🟢  Synced       — online, nothing pending
 *   🔴  Offline      — no internet, saved locally
 *   🟡  Pending (N)  — N changes waiting to sync
 *   🔵  Syncing…     — upload in progress
 *   ❌  Sync Failed  — last attempt failed, retry button
 */

import React from 'react';
import { Wifi, WifiOff, CloudUpload, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSyncState } from '@/hooks/useSyncState';
import { useConnectivity } from '@/hooks/useConnectivity';

export const SyncStatusBar: React.FC = () => {
  const isOnline = useConnectivity();
  const { status, pendingCount, failedCount, retryFailed, syncNow } = useSyncState();

  // Determine what to show
  if (!isOnline) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2 text-red-700">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-semibold">
            Offline — changes saved on this device
          </span>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs text-red-600 font-bold whitespace-nowrap">
            {pendingCount} pending
          </span>
        )}
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200">
        <CloudUpload className="w-4 h-4 text-blue-600 animate-pulse flex-shrink-0" />
        <span className="text-xs font-semibold text-blue-700">
          Syncing {pendingCount > 0 ? `${pendingCount} changes…` : '…'}
        </span>
      </div>
    );
  }

  if (failedCount > 0) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-semibold">
            {failedCount} change{failedCount > 1 ? 's' : ''} could not sync
          </span>
        </div>
        <button
          onClick={retryFailed}
          className="flex items-center gap-1 text-xs text-amber-700 font-bold hover:underline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-yellow-50 border-b border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-700">
          <CloudUpload className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-semibold">
            {pendingCount} change{pendingCount > 1 ? 's' : ''} waiting to sync
          </span>
        </div>
        <button
          onClick={syncNow}
          className="flex items-center gap-1 text-xs text-yellow-700 font-bold hover:underline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Now
        </button>
      </div>
    );
  }

  if (status === 'synced') {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border-b border-emerald-100">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="text-xs text-emerald-700 font-medium">All changes synced</span>
      </div>
    );
  }

  // Online, idle — show compact online badge
  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border-b border-slate-100">
      <Wifi className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
      <span className="text-xs text-slate-500 font-medium">Online</span>
    </div>
  );
};
