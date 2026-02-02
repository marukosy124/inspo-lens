'use client';

import { AuthModal, AuthMode } from '@/components/auth/auth-modal';
import SignInButton from '@/components/auth/sign-in-button';
import SignUpButton from '@/components/auth/sign-up-button';
import { CurrentUserAvatar } from '@/components/current-user-avatar';
import { useAuth } from '@/lib/context/auth-context';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<Partial<AuthMode>>('sign-in');

  const openModal = (mode: 'sign-in' | 'sign-up') => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-sm"
      style={{ WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="flex h-15 w-full items-center justify-between px-5 select-none">
        <Link
          href="/"
          className="group flex items-center space-x-3"
          tabIndex={-1}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent md:text-2xl">
            InspoLens
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <CurrentUserAvatar user={user} />
          ) : (
            <>
              <SignInButton onClick={() => openModal('sign-in')} />
              <SignUpButton onClick={() => openModal('sign-up')} />
              <AuthModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                mode={modalMode}
                onModeChange={setModalMode}
                initialMode={modalMode}
                trigger={null}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
