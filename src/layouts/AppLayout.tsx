import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/common/Badge';
import { LogOut, Wifi, WifiOff, Globe, HeartPulse } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const { profile, role, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const roleBadgeMap = {
    asha: { label: lang === 'hi' ? 'आशा कार्यकर्ता' : 'ASHA Worker', variant: 'emerald' as const },
    supervisor: { label: lang === 'hi' ? 'सुपरवाइजर' : 'Supervisor', variant: 'blue' as const },
    manager: { label: lang === 'hi' ? 'पीएचसी प्रबंधक' : 'PHC Manager', variant: 'amber' as const },
  };

  const currentRoleInfo = role ? roleBadgeMap[role] : { label: 'User', variant: 'slate' as const };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Top Banner / Sync Status Bar */}
      <div
        className={`w-full py-1 px-4 text-xs font-semibold flex items-center justify-between transition-colors ${
          isOnline ? 'bg-emerald-700 text-emerald-100' : 'bg-amber-600 text-amber-50'
        }`}
      >
        <div className="flex items-center gap-1.5 max-w-xl mx-auto w-full">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang === 'hi' ? '🟢 ऑनलाइन — डेटा सिंक है' : '🟢 Online — Cloud Synced'}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-200" />
              <span>{lang === 'hi' ? '⚡ ऑफलाइन मोड — स्थानीय सहेजें' : '⚡ Offline Mode — Local Persistence'}</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLang(l => (l === 'hi' ? 'en' : 'hi'))}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 text-white font-medium"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3" />
              <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                ASHA Saathi <span className="text-emerald-700 text-sm font-semibold">| आशा साथी</span>
              </h1>
              {title && <p className="text-xs text-slate-500 font-medium">{title}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{profile?.full_name}</p>
              <Badge variant={currentRoleInfo.variant} size="sm">
                {currentRoleInfo.label}
              </Badge>
            </div>
            <button
              onClick={() => signOut()}
              aria-label="Logout"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={lang === 'hi' ? 'लॉगआउट' : 'Logout'}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen Content (Mobile-First Viewport) */}
      <main className="w-full max-w-xl flex-1 px-4 py-4 space-y-4">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 mt-auto">
        National Health Mission (NHM) • ASHA Saathi MVP
      </footer>
    </div>
  );
};
