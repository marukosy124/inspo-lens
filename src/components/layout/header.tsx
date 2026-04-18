'use client';

import SignInButton from '@/components/auth/sign-in-button';
import SignUpButton from '@/components/auth/sign-up-button';
import { CurrentUserAvatar } from '@/components/user/current-user-avatar';
import { useAuth } from '@/lib/context/auth-context';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 border-b border-stone-200/40 bg-white/60 backdrop-blur-md"
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex h-16 w-full items-center justify-between px-6 select-none md:px-8">
        <Link
          href="/"
          className="group flex items-center space-x-3"
          tabIndex={-1}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold tracking-tight text-transparent md:text-2xl">
            InspoLens
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          {user && !user?.is_official ? (
            <CurrentUserAvatar user={user} />
          ) : (
            <>
              <SignInButton />
              <SignUpButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
