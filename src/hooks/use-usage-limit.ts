import { useEffect } from 'react';
import {
  useUsageStore,
  selectCount,
  selectRemaining,
  selectIsLimitReached,
} from '@/stores/use-usage-store';

export function useUsageLimit() {
  const count = useUsageStore(selectCount);
  const remaining = useUsageStore(selectRemaining);
  const isLimitReached = useUsageStore(selectIsLimitReached);
  const incrementUsage = useUsageStore((state) => state.incrementUsage);
  const checkAndResetIfNewDay = useUsageStore(
    (state) => state.checkAndResetIfNewDay
  );

  // Check for new day on mount and periodically
  useEffect(() => {
    checkAndResetIfNewDay();
    const interval = setInterval(checkAndResetIfNewDay, 60000); // Every minute
    return () => clearInterval(interval);
  }, [checkAndResetIfNewDay]);

  return {
    count,
    remaining,
    isLimitReached,
    incrementUsage,
  };
}
