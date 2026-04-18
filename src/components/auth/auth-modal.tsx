'use client';

import { cn } from '@/lib/utils/common';
import { supabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  PasswordInput,
  PasswordInputRef,
} from '@/components/auth/password-input';
import { toast } from 'sonner';

export type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';
export interface AuthModalProps extends React.ComponentPropsWithoutRef<'div'> {
  initialMode?: AuthMode;
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dialogContentProps?: React.ComponentProps<typeof DialogContent>;
  dialogHeaderProps?: React.ComponentProps<typeof DialogHeader>;
}

export function AuthModal({
  className,
  initialMode = 'sign-in',
  mode: controlledMode,
  onModeChange,
  open: controlledOpen,
  onOpenChange,
  dialogContentProps,
  dialogHeaderProps,
}: AuthModalProps) {
  const [internalMode, setInternalMode] = useState<AuthMode>(initialMode);
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const passwordRef = useRef<PasswordInputRef>(null);
  const confirmPasswordRef = useRef<PasswordInputRef>(null);
  const router = useRouter();

  useEffect(() => {
    setInternalMode(initialMode);
  }, [initialMode]);

  const mode = controlledMode ?? internalMode;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode || isAnimating) return;
    setIsAnimating(true);
    setError(null);
    setSuccess(false);
    // Clear form fields when switching
    setPassword('');
    setConfirmPassword('');
    passwordRef.current?.resetVisibility();
    confirmPasswordRef.current?.resetVisibility();
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }
    setTimeout(() => setIsAnimating(false), 300); // Match animation duration
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setOpen(false);
      router.push('/'); // TODO
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast.success('Signed up successfully!');
      setOpen(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Set full height flex column for proper sticky behavior */}
      <DialogContent
        className={cn('max-w-md overflow-hidden px-8 py-10', className)}
        {...dialogContentProps}
      >
        <div className="relative h-full min-h-[420px]">
          {/* Slide container */}
          <div className="relative h-full overflow-hidden">
            <div
              className={cn(
                'flex h-full transition-transform duration-500 ease-out',
                mode === 'sign-up' && '-translate-x-[33.333%]',
                mode === 'forgot-password' && '-translate-x-[66.666%]'
              )}
              style={{ width: '300%' }}
            >
              {/* Sign In Form */}
              <div className="flex h-full w-1/3 shrink-0 flex-col px-1">
                <DialogHeader {...dialogHeaderProps}>
                  <DialogTitle className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                    Welcome back
                  </DialogTitle>
                  <DialogDescription className="text-stone-600">
                    Sign in to continue your creative journey
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSignIn}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden px-1"
                >
                  <div className="mt-8 flex min-h-0 grow flex-col justify-start gap-5">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="signin-email"
                        className="text-sm font-medium text-stone-700"
                      >
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 border-stone-200 bg-white/80 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <PasswordInput
                      ref={passwordRef}
                      id="signin-password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-stone-200 bg-white/80 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                      label="Password"
                      extraHeaderContent={
                        <button
                          type="button"
                          onClick={() => switchMode('forgot-password')}
                          className="inline-block cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                          Forgot password?
                        </button>
                      }
                    />
                    {error && mode === 'sign-in' && (
                      <div className="border border-red-200/60 bg-red-50 p-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </div>
                  {/* Sticky bottom actions */}
                  <div className="mt-auto flex flex-col gap-3 pt-8 pb-1">
                    <Button
                      type="submit"
                      className="h-11 w-full bg-linear-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center text-sm text-stone-600">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('sign-up')}
                        className="cursor-pointer font-medium text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Sign up
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Sign Up Form */}
              <div className="flex h-full w-1/3 shrink-0 flex-col px-1">
                <DialogHeader {...dialogHeaderProps}>
                  <DialogTitle className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                    Create account
                  </DialogTitle>
                  <DialogDescription className="text-stone-600">
                    Start discovering and saving inspiration
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSignUp}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden px-1"
                >
                  <div className="mt-8 flex min-h-0 grow flex-col justify-start gap-5">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="signup-email"
                        className="text-sm font-medium text-stone-700"
                      >
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 border-stone-200 bg-white/80 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <PasswordInput
                      ref={passwordRef}
                      id="signup-password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-stone-200 bg-white/80 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                      label="Password"
                    />
                    <PasswordInput
                      ref={confirmPasswordRef}
                      id="signup-confirm-password"
                      name="signup-confirm-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 border-stone-200 bg-white/80 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                      label="Confirm Password"
                    />
                    {error && mode === 'sign-up' && (
                      <div className="border border-red-200/60 bg-red-50 p-3">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </div>
                  {/* Sticky bottom actions */}
                  <div className="mt-auto flex flex-col gap-3 pt-8 pb-1">
                    <Button
                      type="submit"
                      className="h-11 w-full bg-linear-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Sign up'}
                    </Button>
                    <div className="text-center text-sm text-stone-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('sign-in')}
                        className="cursor-pointer font-medium text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Forgot Password Form */}
              <div className="flex h-full w-1/3 shrink-0 flex-col px-1">
                <DialogHeader {...dialogHeaderProps}>
                  <DialogTitle className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                    {success ? 'Check your email' : 'Reset password'}
                  </DialogTitle>
                  <DialogDescription className="text-stone-600">
                    {success
                      ? 'Password reset instructions sent'
                      : "Enter your email and we'll send you a reset link"}
                  </DialogDescription>
                </DialogHeader>
                {success ? (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="mt-8 flex min-h-0 grow flex-col justify-start gap-5">
                      <div className="border border-blue-200/60 bg-linear-to-br from-blue-50 to-purple-50 p-4">
                        <p className="text-sm leading-relaxed text-stone-700">
                          If you registered using your email and password, you
                          will receive a password reset email shortly.
                        </p>
                      </div>
                    </div>
                    {/* Sticky bottom actions */}
                    <div className="mt-auto flex flex-col gap-3 pt-8 pb-1">
                      <div className="text-center text-sm text-stone-600">
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('sign-in')}
                          className="cursor-pointer font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleForgotPassword}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden px-1"
                  >
                    <div className="mt-8 flex min-h-0 grow flex-col justify-start gap-5">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="forgot-email"
                          className="text-sm font-medium text-stone-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11 border-stone-200 bg-white/80 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      {error && mode === 'forgot-password' && (
                        <div className="border border-red-200/60 bg-red-50 p-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                    </div>
                    {/* Sticky bottom actions */}
                    <div className="mt-auto flex flex-col gap-3 pt-8 pb-1">
                      <Button
                        type="submit"
                        className="h-11 w-full bg-linear-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send reset link'}
                      </Button>
                      <div className="text-center text-sm text-stone-600">
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('sign-in')}
                          className="cursor-pointer font-medium text-blue-600 transition-colors hover:text-blue-700"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
