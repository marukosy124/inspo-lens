'use client';

import { Bookmark, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/context/auth-context';
import { useModalStore } from '@/stores';
import { useState, useEffect } from 'react';

export interface SaveButtonProps {
  analysisId: string;
  saved: boolean;
  variant?: 'icon' | 'card';
  isHovered?: boolean;
  className?: string;
  stopPropagation?: boolean;
  onSavedChange: (saved: boolean) => void;
}

export function SaveButton({
  analysisId,
  saved: controlledSaved,
  onSavedChange,
  variant = 'icon',
  isHovered = false,
  className,
  stopPropagation = false,
}: SaveButtonProps) {
  const { user } = useAuth();
  const { open: openModal } = useModalStore();

  const [optimisticSaved, setOptimisticSaved] = useState(controlledSaved);
  const [isPending, setIsPending] = useState(false);

  // Sync from controlled prop when it changes externally (e.g. page reload, other tab)
  useEffect(() => {
    // Only sync when not in the middle of a request
    if (!isPending) {
      setOptimisticSaved(controlledSaved);
    }
  }, [controlledSaved, isPending]);

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();

    if (!user?.id) {
      openModal('auth-gate');
      return;
    }

    if (isPending) return; // prevent spam clicks

    toggleSave();
  };

  const toggleSave = async () => {
    const previousSaved = optimisticSaved;
    const nextSaved = !previousSaved;

    // Optimistic update
    setOptimisticSaved(nextSaved);
    setIsPending(true);

    try {
      const method = nextSaved ? 'POST' : 'DELETE';
      const res = await fetch('/api/analysis/save', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || `Failed to ${nextSaved ? 'save' : 'unsave'}`
        );
      }

      // Success → keep optimistic state & notify parent
      toast.success(nextSaved ? 'Saved!' : 'Unsaved!');
      onSavedChange(nextSaved);
    } catch (error) {
      // Rollback
      setOptimisticSaved(previousSaved);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${nextSaved ? 'save' : 'unsave'} analysis`
      );
    } finally {
      setIsPending(false);
    }
  };

  const ariaLabel = optimisticSaved
    ? 'Remove from saved'
    : 'Save to collection';

  const icon = isPending ? (
    <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
  ) : (
    <Bookmark
      className={`h-5 w-5 transition-all ${
        optimisticSaved
          ? 'fill-primary stroke-primary'
          : 'stroke-muted-foreground'
      }`}
      fill={optimisticSaved ? 'currentColor' : 'none'}
    />
  );

  // Card variant (overlay on hover)
  if (variant === 'card') {
    return (
      <motion.button
        type="button"
        className="bg-background/80 hover:bg-background/95 absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg shadow-md backdrop-blur-sm transition-colors disabled:opacity-50"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{
          opacity: isHovered || isPending ? 1 : 0,
          scale: isHovered || isPending ? 1 : 0.7,
        }}
        transition={{ duration: 0.2 }}
        onClick={handleClick}
        disabled={isPending}
        aria-label={ariaLabel}
      >
        {icon}
      </motion.button>
    );
  }

  // Default icon variant
  const iconClassName =
    className ??
    'flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm shadow-md hover:bg-background/95 transition-colors border border-border/60 cursor-pointer disabled:opacity-50';

  return (
    <motion.button
      type="button"
      className={iconClassName}
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      disabled={isPending}
      aria-label={ariaLabel}
    >
      {icon}
    </motion.button>
  );
}
