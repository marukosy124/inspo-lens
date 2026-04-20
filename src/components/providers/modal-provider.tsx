'use client';

import { AuthGateModal } from '@/components/auth/auth-gate-modal';
import { AuthModal } from '@/components/auth/auth-modal';
import { CreateCollectionModal } from '@/components/save/create-collection-modal';
import { useCollectionStore } from '@/stores';
import { useModalStore } from '@/stores/use-modal-store';

export function ModalProvider() {
  const { modal, close } = useModalStore();
  const { addCollection } = useCollectionStore();

  const createCollectionProps =
    modal?.type === 'create-collection' ? modal.props : undefined;

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
    </>
  );
}
