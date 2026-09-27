/**
 * useConnectivity.ts
 * 
 * React hook exposing live online/offline state.
 * Subscribes to connectivityService and re-renders on change.
 */

import { useState, useEffect } from 'react';
import { connectivityService } from '@/services/connectivityService';

export function useConnectivity(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(connectivityService.isOnline());

  useEffect(() => {
    const handler = (online: boolean) => setIsOnline(online);
    connectivityService.addListener(handler);
    // Trigger an initial probe so state is fresh
    connectivityService.probe().then(setIsOnline);
    return () => connectivityService.removeListener(handler);
  }, []);

  return isOnline;
}
