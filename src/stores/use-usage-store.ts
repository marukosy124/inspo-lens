import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UsageState {
  count: number;
  date: string;
  limit: number;
}

interface UsageActions {
  incrementUsage: () => void;
  resetUsage: () => void;
  checkAndResetIfNewDay: () => void;
}

type UsageStore = UsageState & UsageActions;

const getToday = () => new Date().toDateString();

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      // State
      count: 0,
      date: getToday(),
      limit: 10,

      // Actions
      incrementUsage: () => {
        const state = get();
        if (state.date !== getToday()) {
          set({ count: 1, date: getToday() });
        } else {
          set({ count: state.count + 1 });
        }
      },

      resetUsage: () => set({ count: 0, date: getToday() }),

      checkAndResetIfNewDay: () => {
        if (get().date !== getToday()) {
          set({ count: 0, date: getToday() });
        }
      },
    }),
    {
      name: 'inspo-usage-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors (optional but recommended for performance)
export const selectCount = (state: UsageStore) => state.count;
export const selectRemaining = (state: UsageStore) =>
  Math.max(0, state.limit - state.count);
export const selectIsLimitReached = (state: UsageStore) =>
  state.count >= state.limit;
export const selectPercentage = (state: UsageStore) =>
  Math.min(100, (state.count / state.limit) * 100);
