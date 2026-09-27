/**
 * OfflineBanner.tsx
 *
 * Full-width informational banner shown at the top of list views
 * when the device is offline. Does NOT block the user.
 *
 * Usage:
 *   <OfflineBanner />
 */

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useConnectivity } from '@/hooks/useConnectivity';

export const OfflineBanner: React.FC = () => {
  const isOnline = useConnectivity();

  if (isOnline) return null;

  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
      <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-red-700">You're offline</p>
        <p className="text-xs text-red-600 mt-0.5 leading-snug">
          Your changes will be stored on this device and synced automatically when internet returns.
        </p>
      </div>
    </div>
  );
};
