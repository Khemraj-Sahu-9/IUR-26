import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { UserRole } from '@/types/database';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { HeartPulse, UserCheck, ShieldCheck, Building2, KeyRound, Eye, EyeOff, HelpCircle, X } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signIn, signInAsDemo, loading, error: authError } = useAuth();
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fieldErrors: { email?: string; password?: string } = {};

    // Validate email
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      fieldErrors.email = t['auth.login.requiredEmail'] || t.requiredEmail || 'Please enter a valid email address';
    }

    // Validate password
    if (!password || password.length < 6) {
      fieldErrors.password = t['auth.login.requiredPassword'] || t.requiredPassword || 'Password must be at least 6 characters';
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      await signIn(trimmedEmail, password);
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

  // Localized auth error string
  const localizedAuthError = authError
    ? (lang === 'hi' ? t['auth.login.invalidCredentials'] || t.invalidCredentials : authError)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center px-4 py-4 sm:py-8">
      {/* Top Bar with Language Selector */}
      <header className="w-full max-w-md flex justify-between items-center mb-2 z-20">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ASHA Saathi</span>
        </div>
        <LanguageSelector />
      </header>

      <div className="w-full max-w-md space-y-5 my-auto">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-600 text-white items-center justify-center shadow-md">
            <HeartPulse className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ASHA Saathi <span className="text-emerald-700">| {lang === 'hi' ? 'आशा साथी' : 'आशा साथी'}</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            {t['auth.login.subtitle'] || t.loginSubtitle}
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {t.worksOfflineBadge}
            </span>
          </div>
        </div>

        {/* Quick Demo Personas (1-Tap Login) */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <div className="text-left space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <KeyRound className="w-4 h-4" />
              <span>{t.quickDemoPersonas}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={demoLoadingRole === 'asha'}
                disabled={loading}
                onClick={() => handleDemoLogin('asha')}
                className="w-full justify-start text-left bg-white border-emerald-300 hover:bg-emerald-100/50 text-emerald-950 font-semibold text-sm min-h-[48px]"
              >
                <UserCheck className="w-5 h-5 mr-3 text-emerald-700 shrink-0" />
                <div>
                  <div>{t.ashaWorkerPersona}</div>
                  <div className="text-xs text-slate-500 font-normal">{t.ward4Worker}</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={demoLoadingRole === 'supervisor'}
                disabled={loading}
                onClick={() => handleDemoLogin('supervisor')}
                className="w-full justify-start text-left bg-white border-sky-300 hover:bg-sky-100/50 text-sky-950 font-semibold text-sm min-h-[48px]"
              >
                <ShieldCheck className="w-5 h-5 mr-3 text-sky-700 shrink-0" />
                <div>
                  <div>{t.supervisorPersona}</div>
                  <div className="text-xs text-slate-500 font-normal">{t.sectorSupervisorSub}</div>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={demoLoadingRole === 'manager'}
                disabled={loading}
                onClick={() => handleDemoLogin('manager')}
                className="w-full justify-start text-left bg-white border-amber-300 hover:bg-amber-100/50 text-amber-950 font-semibold text-sm min-h-[48px]"
              >
                <Building2 className="w-5 h-5 mr-3 text-amber-700 shrink-0" />
                <div>
                  <div>{t.managerPersona}</div>
                  <div className="text-xs text-slate-500 font-normal">{t.centralPhcAdmin}</div>
                </div>
              </Button>
            </div>
          </div>
        </Card>

        {/* Standard Email / Password Form */}
        <Card>
          <form onSubmit={handleManualLogin} className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 text-left">
              {t.standardLogin}
            </h2>

            {localizedAuthError && (
              <Alert variant="danger" title={t.authErrorTitle}>
                {localizedAuthError}
              </Alert>
            )}

            {/* Email Field */}
            <div className="w-full space-y-1.5 text-left">
              <label htmlFor="email-input" className="block text-sm font-semibold text-slate-800">
                {t['auth.login.email'] || t.emailLabel}
              </label>
              <input
                id="email-input"
                type="email"
                placeholder={t['auth.login.emailPlaceholder'] || t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border text-base transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-400 bg-red-50/30'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500 bg-white'
                }`}
              />
              {errors.email && <p className="text-sm font-medium text-red-600">{errors.email}</p>}
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="w-full space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password-input" className="block text-sm font-semibold text-slate-800">
                  {t['auth.login.password'] || t.passwordLabel}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 py-0.5"
                >
                  {t['auth.login.forgotPassword'] || t.forgotPassword}
                </button>
              </div>

              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t['auth.login.passwordPlaceholder'] || t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  className={`w-full min-h-[48px] pl-3.5 pr-12 py-2.5 rounded-xl border text-base transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-400 bg-red-50/30'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500 bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? (lang === 'hi' ? 'छिपाएं' : 'Hide') : (lang === 'hi' ? 'दिखाएं' : 'Show')}
                  title={showPassword ? (t['auth.login.hidePassword'] || t.hidePassword) : (t['auth.login.showPassword'] || t.showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm font-medium text-red-600">{errors.password}</p>}
            </div>

            {/* Forgot Password Assistance Card */}
            {showForgotPassword && (
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                    <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{t['auth.login.forgotPassword'] || t.forgotPassword}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    aria-label={t.close}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-sky-900 leading-relaxed">
                  {t.forgotPasswordHelp}
                </p>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 px-2 py-1 rounded bg-white border border-sky-200"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full min-h-[48px]"
              isLoading={loading && demoLoadingRole === null}
            >
              {loading && demoLoadingRole === null
                ? (t['auth.login.signingIn'] || t.signingIn)
                : (t['auth.login.signIn'] || t.signInButton)}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          {t.loginFooter}
        </p>
      </div>

      <div className="w-full text-center py-2 text-[11px] text-slate-400">
        © 2026 MoHFW / National Health Mission
      </div>
    </div>
  );
};

