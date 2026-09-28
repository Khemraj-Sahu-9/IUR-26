import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { Badge } from '@/components/common/Badge';
import { SyncStatusBar } from '@/components/common/SyncStatusBar';
import { LogOut, HeartPulse } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title }) => {
  const { profile, role, signOut } = useAuth();
  const { t } = useLanguage();

  const roleBadgeMap = {
    asha: { label: t.ashaWorker, variant: 'emerald' as const },
    supervisor: { label: t.supervisor, variant: 'blue' as const },
    manager: { label: t.phcManager, variant: 'amber' as const },
  };

  const currentRoleInfo = role ? roleBadgeMap[role] : { label: 'User', variant: 'slate' as const };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* SyncStatusBar — connectivity & sync state */}
      <div className="w-full max-w-xl">
        <SyncStatusBar />
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
            <LanguageSelector />
            <button
              onClick={() => signOut()}
              aria-label="Logout"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t.logout}
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
