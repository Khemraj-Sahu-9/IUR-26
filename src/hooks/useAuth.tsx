import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Profile, UserRole } from '@/types/database';
import { authService } from '@/services/authService';
import { auditLogger } from '@/services/auditLogger';
import { DEMO_CREDENTIALS } from '@/constants/demo';
import { refreshLocalCache, profileRepo } from '@/services/offlineDataService';
import { clearLocalDatabase } from '@/services/offlineDatabase';
import { syncManager } from '@/services/syncManager';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsDemo: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
      if (p) {
        // Cache profile locally for offline access
        await profileRepo.save({
          id: p.id,
          user_id: userId,
          full_name: p.full_name || '',
          role: p.role,
          sync_status: 'synced',
          local_created_at: new Date().toISOString(),
          local_updated_at: new Date().toISOString(),
        });
        // Refresh field data cache and trigger any pending sync
        if (p.role === 'asha') {
          refreshLocalCache(userId).then(() => syncManager.sync());
        }
      }
      return p;
    } catch (err: unknown) {
      console.error('Failed to load profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        if (event === 'SIGNED_OUT') {
          await clearLocalDatabase();
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await authService.signInWithEmail(email, password);
      if (data.user) {
        const prof = await fetchProfile(data.user.id);
        await auditLogger.log({
          action: 'USER_LOGIN',
          tableName: 'profiles',
          recordId: data.user.id,
          metadata: { email, role: prof?.role },
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = async (targetRole: UserRole) => {
    setError(null);
    setLoading(true);
    const creds = DEMO_CREDENTIALS[targetRole];
    try {
      // Demo users are pre-seeded in Supabase with confirmed emails.
      // Simply sign in directly — no registration fallback needed.
      await authService.signInWithEmail(creds.email, creds.pass);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in. Check demo user setup.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (user) {
      await auditLogger.log({
        action: 'USER_LOGOUT',
        tableName: 'profiles',
        recordId: user.id,
      });
    }
    // Clear all locally cached data — security: another user must not see previous user's records
    await clearLocalDatabase();
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        error,
        signIn,
        signInAsDemo,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
