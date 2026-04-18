'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';
import { useModalStore } from '@/stores';

export interface AuthGateModalProps
  extends React.ComponentPropsWithoutRef<'div'> {
  open?: boolean;
  imageUrl?: string;
  title?: string;
  dialogContentProps?: React.ComponentProps<typeof DialogContent>;
  dialogHeaderProps?: React.ComponentProps<typeof DialogHeader>;
  onOpenChange?: (open: boolean) => void;
}

export function AuthGateModal({
  open = false,
  imageUrl,
  title = 'Save this idea',
  dialogContentProps,
  dialogHeaderProps,
  onOpenChange,
  className,
}: AuthGateModalProps) {
  const { open: openAuthModal } = useModalStore();

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const handleSignUp = () => {
    handleClose();
    openAuthModal('auth', { initialMode: 'sign-up' });
  };

  const handleSignIn = () => {
    handleClose();
    openAuthModal('auth', { initialMode: 'sign-in' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('max-w-md overflow-hidden px-8 py-10', className)}
        {...dialogContentProps}
      >
        <div className="relative flex flex-col items-center text-center">
          {/* Preview Image */}
          {imageUrl && (
            <div className="relative mb-6 h-24 w-24 overflow-hidden rounded-2xl shadow-lg ring-2 ring-stone-200/60">
              <Image src={imageUrl} alt={title} fill className="object-cover" />
            </div>
          )}

          <DialogHeader className="mb-10 space-y-3" {...dialogHeaderProps}>
            <DialogTitle className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl leading-tight font-bold text-transparent">
              Join InspoLens to save this analysis!
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-sm text-center text-base text-stone-600">
              Create a free account to save analyses and explore without limits.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-3">
            {/* Sign Up Button */}
            <Button
              onClick={handleSignUp}
              className="h-11 w-full rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-base font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/30"
            >
              Continue with email
            </Button>

            {/* Already a member */}
            <div className="pt-3 text-center text-sm text-stone-600">
              Already a member?{' '}
              <button
                onClick={handleSignIn}
                className="cursor-pointer font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
