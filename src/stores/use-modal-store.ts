import { CreateCollectionModalProps } from '@/components/save/create-collection-modal';
import { EditCollectionModalProps } from '@/components/save/edit-collection-modal';
import { create } from 'zustand';

type ModalType = 'auth' | 'auth-gate' | 'create-collection' | 'edit-collection';

type ModalData =
  | { type: 'auth'; props?: Record<string, unknown> }
  | { type: 'auth-gate'; props?: Record<string, unknown> }
  | { type: 'create-collection'; props?: CreateCollectionModalProps }
  | { type: 'edit-collection'; props?: EditCollectionModalProps };

interface ModalStore {
  modal: ModalData | null;
  open: (type: ModalType, props?: Record<string, unknown>) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  open: (type, props) => set({ modal: { type, props } }),
  close: () => set({ modal: null }),
}));
