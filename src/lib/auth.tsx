/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, supabaseConfigError } from './supabase';
import type { User, Organization } from './types';

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  user: User | null;
  org: Organization | null;
  loading: boolean;
  needsOrg: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  supabaseUser: null,
  user: null,
  org: null,
  loading: true,
  needsOrg: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (userError) { console.error('Error fetching user:', userError); return; }
      if (userData) {
        setUser(userData);
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', userData.org_id)
          .maybeSingle();
        setOrg(orgData || null);
      } else {
        setUser(null);
        setOrg(null);
      }
    } catch (err) {
      console.error('loadUserData failed:', err);
      setUser(null);
      setOrg(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.user) {
      await loadUserData(s.user.id);
    }
  }, [loadUserData]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.error(supabaseConfigError);
      setLoading(false);
      return;
    }
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(s);
        setSupabaseUser(s?.user ?? null);
        if (s?.user) await loadUserData(s.user.id);
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
      }
      (async () => {
        if (s?.user) {
          await loadUserData(s.user.id);
        } else {
          setUser(null);
          setOrg(null);
        }
        if (mounted) setLoading(false);
      })();
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loadUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrg(null);
    setSession(null);
    setSupabaseUser(null);
  }, []);

  const needsOrg = !!session?.user && !user && !loading;

  const value = useMemo(() => ({
    session, supabaseUser, user, org, loading, needsOrg, refreshProfile, signOut,
  }), [session, supabaseUser, user, org, loading, needsOrg, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
