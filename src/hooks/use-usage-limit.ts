import { useAuth } from '@/lib/context/auth-context';
import { useUsageStore } from '@/stores';
import {
  selectCount,
  selectRemaining,
  selectIsLimitReached,
} from '@/stores/use-usage-store';
import { useEffect } from 'react';

export function useUsageLimit() {
  const { user } = useAuth();
  const isAuthenticated = !!user?.id;

  const count = useUsageStore(selectCount);
  const remaining = useUsageStore(selectRemaining);
  const isLimitReached = useUsageStore(selectIsLimitReached);
  const incrementUsage = useUsageStore((state) => state.incrementUsage);
  const checkAndResetIfNewDay = useUsageStore(
    (state) => state.checkAndResetIfNewDay
  );

  useEffect(() => {
    checkAndResetIfNewDay();
    const interval = setInterval(checkAndResetIfNewDay, 60000);
    return () => clearInterval(interval);
  }, [checkAndResetIfNewDay]);

  if (isAuthenticated) {
    return {
      count,
      remaining: Infinity,
      isLimitReached: false,
      incrementUsage,
    };
  }

  return {
    count,
    remaining,
    isLimitReached,
    incrementUsage,
  };
}
