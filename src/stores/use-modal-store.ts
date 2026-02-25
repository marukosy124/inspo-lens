import { create } from 'zustand';

type ModalType = 'auth' | 'confirm' | 'alert' | 'auth-gate' | null;

interface ModalStore {
  modal: { type: ModalType; props?: unknown } | null;
  open: (type: ModalType, props?: unknown) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  open: (type, props) => set({ modal: { type, props } }),
  close: () => set({ modal: null }),
}));
