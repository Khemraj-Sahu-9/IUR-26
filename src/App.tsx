import React from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginView } from '@/features/auth/LoginView';
import { AppLayout } from '@/layouts/AppLayout';
import { AshaShell } from '@/features/asha/AshaShell';
import { SupervisorShell } from '@/features/supervisor/SupervisorShell';
import { ManagerShell } from '@/features/manager/ManagerShell';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';

const MainRouter: React.FC = () => {
  const { user, profile, role, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner label="Authenticating with Supabase..." size="lg" />
      </div>
    );
  }

  // Unauthenticated -> Show Login View
  if (!user) {
    return <LoginView />;
  }

  // Authenticated: Route strictly based on verified database profile role
  switch (role) {
    case 'asha':
      return (
        <AppLayout title="Field Worker Portal">
          <AshaShell />
        </AppLayout>
      );
    case 'supervisor':
      return (
        <AppLayout title="Sector Supervision Portal">
          <SupervisorShell />
        </AppLayout>
      );
    case 'manager':
      return (
        <AppLayout title="PHC Administration Portal">
          <ManagerShell />
        </AppLayout>
      );
    default:
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="warning" title="Profile Role Pending">
              Logged in as {user.email}, but no assigned role was found for profile ID {profile?.id || user.id}.
            </Alert>
            <Button variant="outline" onClick={() => signOut()} className="w-full">
              Sign Out & Try Again
            </Button>
          </div>
        </div>
      );
  }
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
};

export default App;
