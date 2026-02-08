'use client';

import { AuthModal } from '@/components/auth/auth-modal';
import { useModalStore } from '@/stores/use-modal-store';

export function ModalProvider() {
  const { modal, close } = useModalStore();

  return (
    <>
      <AuthModal
        open={modal?.type === 'auth'}
        {...(modal?.props || {})}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    </>
  );
}
