/**
 * useSyncState.ts
 *
 * React hook exposing live sync manager state.
 * Components use this to render the SyncStatusBar.
 */

import { useState, useEffect } from 'react';
import { syncManager, SyncManagerState } from '@/services/syncManager';

export function useSyncState(): SyncManagerState & { retryFailed: () => void; syncNow: () => void } {
  const [state, setState] = useState<SyncManagerState>({
    status: 'idle',
    pendingCount: 0,
    failedCount: 0,
    lastSyncedAt: null,
  });

  useEffect(() => {
    syncManager.addListener(setState);
    return () => syncManager.removeListener(setState);
  }, []);

  const retryFailed = () => syncManager.retryFailed();
  const syncNow = () => syncManager.sync();

  return { ...state, retryFailed, syncNow };
}
