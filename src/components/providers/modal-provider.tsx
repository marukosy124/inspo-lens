'use client';

import { AuthGateModal } from '@/components/auth/auth-gate-modal';
import { AuthModal } from '@/components/auth/auth-modal';
import { CreateCollectionModal } from '@/components/save/create-collection-modal';
import { EditCollectionModal } from '@/components/save/edit-collection-modal';
import { useCollectionStore } from '@/stores';
import { useModalStore } from '@/stores/use-modal-store';

export function ModalProvider() {
  const { modal, close } = useModalStore();
  const { addCollection, updateCollection, removeCollection } =
    useCollectionStore();

  const isCreateCollection = modal?.type === 'create-collection';
  const isEditCollection = modal?.type === 'edit-collection';

  const createCollectionProps = isCreateCollection ? modal.props : undefined;
  const editCollectionProps = isEditCollection ? modal.props : undefined;

  return (
    <>
      <AuthModal
        open={modal?.type === 'auth'}
        {...(modal?.props || {})}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
      <AuthGateModal
        open={modal?.type === 'auth-gate'}
        {...(modal?.props || {})}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
      <CreateCollectionModal
        open={modal?.type === 'create-collection'}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onCreated={createCollectionProps?.onCreated || addCollection}
        analysisIdToAdd={createCollectionProps?.analysisIdToAdd}
      />
      <EditCollectionModal
        open={isEditCollection}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        collection={editCollectionProps?.collection ?? null}
        onUpdated={editCollectionProps?.onUpdated ?? updateCollection}
        onDeleted={editCollectionProps?.onDeleted ?? removeCollection}
      />
    </>
  );
}
