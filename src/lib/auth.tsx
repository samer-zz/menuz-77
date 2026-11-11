import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, Role } from './types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: Role | '';
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(u: User | null) {
    if (!u) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    setProfile((data as Profile) ?? null);
  }

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
    await loadProfile(data.session?.user ?? null);
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user ?? null);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const role = (profile?.role ?? '') as Role | '';
  return (
    <Ctx.Provider value={{ user, profile, role, loading, signIn, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth خارج AuthProvider');
  return v;
}
