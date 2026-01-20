import { Button } from '@/components/ui/button';
import {
  SignedOut,
  SignInButton,
  SignUpButton,
  SignedIn,
  UserButton,
} from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-sm "
      style={{ WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="container px-5 flex items-center h-15 select-none justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 group"
          tabIndex={-1}
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="text-xl md:text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight ">
            InspoLens
          </span>
        </Link>

        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-purple-600 hover:bg-blue-50/50 font-medium transition-colors"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="relative overflow-hidden text-white font-medium shadow-md hover:shadow-lg transition-shadow group">
                <span className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500" />
                <span className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Sign Up</span>
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
