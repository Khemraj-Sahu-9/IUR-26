import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { User, Phone, Shield, Globe, LogOut, CheckCircle } from 'lucide-react';

export const AshaProfileView: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const { lang, setLang } = useLanguage();

  return (
    <div className="space-y-4 text-left">
      <PageHeader
        title="ASHA Profile • कार्यकर्ता विवरण"
        subtitle="Operational profile & settings"
      />

      {/* Main Info Card */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl border border-emerald-300 shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{profile?.full_name || 'ASHA Worker'}</h3>
            <p className="text-xs text-slate-500">ID: {user?.id.slice(0, 8)}... (Supabase Auth)</p>
            <div className="mt-1">
              <Badge variant="emerald" size="sm">ASHA Field Worker</Badge>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Phone className="w-3.5 h-3.5" />
              <span>Registered Phone</span>
            </span>
            <span className="font-semibold text-slate-800">{profile?.phone || '9876543210'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Shield className="w-3.5 h-3.5" />
              <span>Assigned Ward</span>
            </span>
            <span className="font-semibold text-slate-800">Ward 4 (Rampur Sector)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Row Level Security (RLS)</span>
            </span>
            <span className="font-semibold text-emerald-700">Enforced by Postgres</span>
          </div>
        </div>
      </Card>

      {/* Language Preference Card */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Application Language</h4>
              <p className="text-xs text-slate-500">Choose between Hindi and English</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant={lang === 'hi' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setLang('hi')}
          >
            हिन्दी (Hindi)
          </Button>
          <Button
            type="button"
            variant={lang === 'en' ? 'primary' : 'outline'}
            size="md"
            onClick={() => setLang('en')}
          >
            English
          </Button>
        </div>
      </Card>

      {/* Sign Out Card */}
      <Card className="p-4 text-center">
        <Button
          type="button"
          variant="danger"
          size="md"
          onClick={() => signOut()}
          className="w-full gap-2 font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out of ASHA Saathi</span>
        </Button>
      </Card>
    </div>
  );
};
