'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { CompleteUser, UserProfile } from '@/lib/types';

type AuthContextType = {
  user: CompleteUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: CompleteUser | null;
}) {
  const [user, setUser] = useState<CompleteUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(
    !initialUser && initialUser !== null
  ); // only loading if we don't have initial data

  useEffect(() => {
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_, session) => {
      let user = session?.user ?? null;
      if (user) {
        // Get the profile (single row)
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('username, avatar_url, avatar_color')
          .eq('id', user.id)
          .single<UserProfile>();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        if (profile && user) {
          user = { ...user, ...profile };
        }
      }
      setUser(user);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
