'use client';

import { cn } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, ReactNode, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  PasswordInput,
  PasswordInputRef,
} from '@/components/auth/password-input';
import { toast } from 'sonner';

export type AuthMode = 'sign-in' | 'sign-up' | 'forgot-password';

export interface AuthModalProps extends React.ComponentPropsWithoutRef<'div'> {
  trigger?: ReactNode;
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
  trigger,
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
          emailRedirectTo: `${window.location.origin}/protected`, // TODO
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

  const defaultTrigger =
    initialMode === 'sign-in' ? (
      <Button
        variant="ghost"
        className="font-medium text-blue-600 transition-colors hover:bg-blue-50/50 hover:text-purple-600"
      >
        Sign In
      </Button>
    ) : (
      <Button className="group relative overflow-hidden font-medium text-white shadow-md transition-shadow hover:shadow-lg">
        <span className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500" />
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-blue-600 to-purple-600 transition-transform duration-300 ease-out group-hover:translate-x-0" />
        <span className="relative z-10">Sign Up</span>
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      )}
      {/* Set full height flex column for proper sticky behavior */}
      <DialogContent
        className={cn('max-w-sm overflow-hidden py-8', className)}
        {...dialogContentProps}
      >
        <div className="relative h-full min-h-[420px]">
          {/* Slide container */}
          <div className="relative h-full overflow-hidden">
            <div
              className={cn(
                'flex h-full transition-transform duration-300 ease-in-out',
                mode === 'sign-up' && '-translate-x-[33.333%]',
                mode === 'forgot-password' && '-translate-x-[66.666%]'
              )}
              style={{ width: '300%' }}
            >
              {/* Sign In Form */}
              <div className="flex h-full w-1/3 shrink-0 flex-col px-1">
                <DialogHeader {...dialogHeaderProps}>
                  <DialogTitle className="text-2xl">Sign In</DialogTitle>
                  <DialogDescription>
                    Enter your email below to sign in to your account
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSignIn}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden px-1"
                >
                  <div className="mt-6 flex min-h-0 grow flex-col justify-start gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <PasswordInput
                      ref={passwordRef}
                      id="signin-password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      label="Password"
                      extraHeaderContent={
                        <button
                          type="button"
                          onClick={() => switchMode('forgot-password')}
                          className="inline-block cursor-pointer text-sm underline-offset-4 transition-colors hover:text-blue-600 hover:underline"
                        >
                          Forgot your password?
                        </button>
                      }
                    />
                    {error && mode === 'sign-in' && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                  </div>
                  {/* Sticky bottom actions */}
                  <div className="mt-auto flex flex-col gap-2 pt-6 pb-1">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('sign-up')}
                        className="cursor-pointer underline underline-offset-4 transition-colors hover:text-blue-600"
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
                  <DialogTitle className="text-2xl">Sign up</DialogTitle>
                  <DialogDescription>Create a new account</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSignUp}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden px-1"
                >
                  <div className="mt-6 flex min-h-0 grow flex-col justify-start gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <PasswordInput
                      ref={passwordRef}
                      id="signup-password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      label="Password"
                    />
                    <PasswordInput
                      ref={confirmPasswordRef}
                      id="signup-confirm-password"
                      name="signup-confirm-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                      label="Confirm Password"
                    />
                    {error && mode === 'sign-up' && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                  </div>
                  {/* Sticky bottom actions */}
                  <div className="mt-auto flex flex-col gap-2 pt-6 pb-1">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating an account...' : 'Sign up'}
                    </Button>
                    <div className="text-center text-sm">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('sign-in')}
                        className="cursor-pointer underline underline-offset-4 transition-colors hover:text-blue-600"
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
                  <DialogTitle className="text-2xl">
                    {success ? 'Check Your Email' : 'Reset Your Password'}
                  </DialogTitle>
                  <DialogDescription>
                    {success
                      ? 'Password reset instructions sent'
                      : "Type in your email and we'll send you a link to reset your password"}
                  </DialogDescription>
                </DialogHeader>
                {success ? (
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="mt-6 flex min-h-0 grow flex-col justify-start gap-6">
                      <p className="text-muted-foreground text-sm">
                        If you registered using your email and password, you
                        will receive a password reset email.
                      </p>
                    </div>
                    {/* Sticky bottom actions */}
                    <div className="mt-auto flex flex-col gap-2 pt-6 pb-1">
                      <div className="text-center text-sm">
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('sign-in')}
                          className="cursor-pointer underline underline-offset-4 transition-colors hover:text-blue-600"
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
                    <div className="mt-6 flex min-h-0 grow flex-col justify-start gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      {error && mode === 'forgot-password' && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}
                    </div>
                    {/* Sticky bottom actions */}
                    <div className="mt-auto flex flex-col gap-2 pt-6 pb-1">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send reset email'}
                      </Button>
                      <div className="text-center text-sm">
                        Remember your password?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('sign-in')}
                          className="cursor-pointer underline underline-offset-4 transition-colors hover:text-blue-600"
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
