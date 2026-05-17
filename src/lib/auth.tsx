import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import { buildAuthProfileMetadata } from './authProfile';
import { buildAuthRedirectUrl } from './authRedirect';

type AuthMode = 'authenticated' | 'guest' | 'unauthenticated';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  mode: AuthMode;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  updateProfileName: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const GUEST_KEY = 'pp:guest';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem(GUEST_KEY) === '1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const mode: AuthMode = user ? 'authenticated' : isGuest ? 'guest' : 'unauthenticated';

  async function signUp(email: string, password: string, displayName?: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured for this deployment.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: displayName ? buildAuthProfileMetadata(displayName) : undefined },
    });
    if (error) throw error;
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured for this deployment.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function updateProfileName(displayName: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured for this deployment.');
    const { data, error } = await supabase.auth.updateUser({
      data: buildAuthProfileMetadata(displayName),
    });
    if (error) throw error;
    if (data.user) {
      setSession((current) => current ? { ...current, user: data.user } : current);
    }
  }

  async function signOut() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }

  async function resetPassword(email: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured for this deployment.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAuthRedirectUrl(window.location.origin, import.meta.env.BASE_URL),
    });
    if (error) throw error;
  }

  function continueAsGuest() {
    localStorage.setItem(GUEST_KEY, '1');
    setIsGuest(true);
  }

  return (
    <AuthContext.Provider
      value={{ user, session, mode, loading, signUp, signIn, updateProfileName, signOut, resetPassword, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
