'use client';

import { AuthGateModal } from '@/components/auth/auth-gate-modal';
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
      <AuthGateModal
        open={modal?.type === 'auth-gate'}
        {...(modal?.props || {})}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
    </>
  );
}
