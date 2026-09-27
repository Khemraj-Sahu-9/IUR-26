import React from 'react';
import { Home, Users, CheckSquare, User, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export type AshaTab = 'home' | 'households' | 'patients' | 'tasks' | 'profile';

interface BottomNavProps {
  activeTab: AshaTab;
  onTabChange: (tab: AshaTab) => void;
  pendingTasksCount?: number;
}

interface NavItem {
  id: AshaTab;
  labelKey: 'navHome' | 'navHouseholds' | 'navPatients' | 'navTasks' | 'navProfile';
  icon: LucideIcon;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount = 0,
}) => {
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { id: 'home', labelKey: 'navHome', icon: Home },
    { id: 'households', labelKey: 'navHouseholds', icon: Home },
    { id: 'patients', labelKey: 'navPatients', icon: Users },
    { id: 'tasks', labelKey: 'navTasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'profile', labelKey: 'navProfile', icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg safe-bottom"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = t[item.labelKey];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-colors relative ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'text-emerald-800' : 'text-slate-600'}`}>
                {label}
              </span>
              {isActive && (
                <span className="w-4 h-1 bg-emerald-600 rounded-full mt-0.5 absolute -bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
