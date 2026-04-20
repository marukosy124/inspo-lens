import { create } from 'zustand';
import type { CollectionListItem } from '@/lib/utils/collection';

interface CollectionState {
  collections: CollectionListItem[];
  setCollections: (collections: CollectionListItem[]) => void;
  addCollection: (collection: CollectionListItem) => void;
  updateCollection: (collection: CollectionListItem) => void;
  removeCollection: (id: string) => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],

  setCollections: (collections) => set({ collections }),

  addCollection: (collection) =>
    set((state) => ({
      collections: [
        collection,
        ...state.collections.filter((c) => c.id !== collection.id),
      ],
    })),

  updateCollection: (updated) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === updated.id ? updated : c
      ),
    })),

  removeCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),
}));
