'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { CompleteUser } from '@/lib/types';
import { officialUser } from '@/lib/constants';
import { Session } from '@supabase/supabase-js';

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
  );

  useEffect(() => {
    // get session
    const init = async () => {
      setIsLoading(true);

      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      await handleSession(session);
    };

    // get profile if session exists
    const handleSession = async (session: Session | null) => {
      if (!session?.user) {
        setUser(officialUser);
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('username, avatar_url, avatar_color')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({ ...session.user, ...profile, is_official: false });
      }

      setIsLoading(false);
    };

    // proactively retrieve session on init instead of relying on auth state change events being emitted
    init();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
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
