import type { CollectionListItem } from '@/lib/utils/collection';
import { create } from 'zustand';

type ModalType = 'auth' | 'auth-gate' | 'create-collection';

interface CreateCollectionModalProps {
  onCreated?: (collection: CollectionListItem) => void;
  analysisIdToAdd?: string | null;
}

type ModalData =
  | { type: 'auth'; props?: Record<string, unknown> }
  | { type: 'auth-gate'; props?: Record<string, unknown> }
  | { type: 'create-collection'; props?: CreateCollectionModalProps };

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
