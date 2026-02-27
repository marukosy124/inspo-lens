'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { CompleteUser, UserProfile } from '@/lib/types';
import { officialUser } from '@/lib/constants';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: CompleteUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: CompleteUser | null; // SSR-provided CompleteUser with profile
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<CompleteUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('username, avatar_url, avatar_color')
        .eq('id', userId)
        .single<UserProfile>();

      if (!error && profile) return profile;
    } catch {}
    return null;
  }, []);

  const handleSessionChange = useCallback(
    async (event: string, sessionUser: User | null) => {
      console.log('[Auth] Event:', event);

      setTimeout(async () => {
        // Use official when there is no session
        if (!sessionUser) {
          console.log('[Auth] No session');
          setUser(officialUser);
          setIsLoading(false);
          return;
        }

        // Use SSR initialUser if hydration matches and initialUser has username
        if (
          event === 'INITIAL_SESSION' &&
          initialUser?.id === sessionUser.id &&
          initialUser?.username
        ) {
          console.log('[Auth] Initial session');
          setUser(initialUser);
          setIsLoading(false);
          return;
        }

        // Otherwise fetch fresh profile
        const profile = await fetchProfile(sessionUser.id);
        console.log('[Auth] Update user');

        setUser(
          profile
            ? { ...sessionUser, ...profile, is_official: false }
            : {
                ...sessionUser,
                username: null,
                avatar_url: null,
                avatar_color: undefined,
                is_official: false,
              }
        );

        setIsLoading(false);
      }, 0);
    },
    [fetchProfile, initialUser]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange');
      handleSessionChange(event, session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  const signOut = useCallback(async () => {
    await supabaseClient.auth.signOut();
    setUser(officialUser);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
