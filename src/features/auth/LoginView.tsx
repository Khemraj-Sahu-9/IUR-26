import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/database';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { HeartPulse, UserCheck, ShieldCheck, Building2, KeyRound } from 'lucide-react';
import { loginSchema } from '@/utils/validation';

export const LoginView: React.FC = () => {
  const { signIn, signInAsDemo, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await signIn(email, password);
    } catch {
      // Handled via context authError
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setDemoLoadingRole(role);
    try {
      await signInAsDemo(role);
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-600 text-white items-center justify-center shadow-md">
            <HeartPulse className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ASHA Saathi <span className="text-emerald-700">| आशा साथी</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Offline-First Field Companion for Community Health Workers
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              ⚡ Works Offline &amp; Auto-Syncs
            </span>
          </div>
        </div>

        {/* Quick Demo Personas (Essential for Hackathon Judges & Fast Testing) */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <div className="text-left space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <KeyRound className="w-4 h-4" />
              <span>Quick Demo Personas (1-Tap Login)</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={demoLoadingRole === 'asha'}
                disabled={loading}
                onClick={() => handleDemoLogin('asha')}
                className="w-full justify-start text-left bg-white border-emerald-300 hover:bg-emerald-100/50 text-emerald-950 font-semibold text-sm"
              >
                <UserCheck className="w-5 h-5 mr-3 text-emerald-700 shrink-0" />
                <div>
                  <div>ASHA Worker: Sunita Devi</div>
                  <div className="text-xs text-slate-500 font-normal">Ward 4 Field Worker</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={demoLoadingRole === 'supervisor'}
                disabled={loading}
                onClick={() => handleDemoLogin('supervisor')}
                className="w-full justify-start text-left bg-white border-sky-300 hover:bg-sky-100/50 text-sky-950 font-semibold text-sm"
              >
                <ShieldCheck className="w-5 h-5 mr-3 text-sky-700 shrink-0" />
                <div>
                  <div>Supervisor: Dr. Anita Roy</div>
                  <div className="text-xs text-slate-500 font-normal">Sector Supervisor</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={demoLoadingRole === 'manager'}
                disabled={loading}
                onClick={() => handleDemoLogin('manager')}
                className="w-full justify-start text-left bg-white border-amber-300 hover:bg-amber-100/50 text-amber-950 font-semibold text-sm"
              >
                <Building2 className="w-5 h-5 mr-3 text-amber-700 shrink-0" />
                <div>
                  <div>PHC Manager: Rajesh Sharma</div>
                  <div className="text-xs text-slate-500 font-normal">Central PHC Admin</div>
                </div>
              </Button>
            </div>
          </div>
        </Card>

        {/* Standard Email / Password Form */}
        <Card>
          <form onSubmit={handleManualLogin} className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 text-left">
              Standard Login
            </h2>

            {authError && (
              <Alert variant="danger" title="Authentication Error">
                {authError}
              </Alert>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="worker@phc.in"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={loading && demoLoadingRole === null}
            >
              Sign In to ASHA Saathi
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Protected by Supabase Row Level Security (RLS) & PostgreSQL
        </p>
      </div>
    </div>
  );
};
