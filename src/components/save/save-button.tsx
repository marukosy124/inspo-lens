'use client';

import { Bookmark, Loader2, PlusIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { useAuth } from '@/lib/context/auth-context';
import { useModalStore } from '@/stores';
import { cn } from '@/lib/utils/common';

import { SaveToCollectionPopover } from '@/components/save/save-to-collection-popover';
import { supabaseClient } from '@/lib/supabase/client';
import { saveAnalysis, unsaveAnalysis } from '@/actions/analysis';

export interface SaveButtonProps {
  analysisId: string;
  saved: boolean;
  variant?: 'icon' | 'card';
  isHovered?: boolean;
  className?: string;
  stopPropagation?: boolean;
  onSavedChange: (saved: boolean) => void;
  onCollectionPickerOpenChange?: (open: boolean) => void;
}

export function SaveButton({
  analysisId,
  saved: controlledSaved,
  onSavedChange,
  variant = 'icon',
  isHovered = false,
  className,
  stopPropagation = false,
  onCollectionPickerOpenChange,
}: SaveButtonProps) {
  const { user } = useAuth();
  const { open: openModal } = useModalStore();
  const queryClient = useQueryClient();

  const [optimisticSaved, setOptimisticSaved] = useState(controlledSaved);
  const [isPending, setIsPending] = useState(false);
  const [collectionPickerOpen, setCollectionPickerOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isPending) {
      setOptimisticSaved(controlledSaved);
    }
  }, [controlledSaved, isPending]);

  const handleCollectionPickerOpenChange = (open: boolean) => {
    setCollectionPickerOpen(open);
    onCollectionPickerOpenChange?.(open);
  };

  // Save / Unsave Mutation
  const saveMutation = useMutation({
    mutationFn: async (shouldSave: boolean) => {
      if (shouldSave) {
        return await saveAnalysis(analysisId);
      } else {
        return await unsaveAnalysis(analysisId);
      }
    },
    onSuccess: (_, shouldSave) => {
      onSavedChange(shouldSave);

      if (shouldSave) {
        // Open collection picker when saving
        handleCollectionPickerOpenChange(true);
      } else {
        // When unsaving → remove from all collections
        removeFromCollectionsMutation.mutate(analysisId);
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save/unsave analysis'
      );
    },
  });

  // Remove from ALL collections Mutation
  const removeFromCollectionsMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      const { error } = await supabaseClient
        .from('collection_analyses')
        .delete()
        .eq('analysis_id', analysisId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['collections-for-analysis', analysisId],
      });
    },
    onError: (err) => {
      console.warn('Failed to remove analysis from collections:', err);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (!user?.id) {
      openModal('auth-gate');
      return;
    }
    if (isPending || saveMutation.isPending) return;

    toggleSave();
  };

  const toggleSave = async () => {
    const nextSaved = !optimisticSaved;

    setOptimisticSaved(nextSaved);
    setIsPending(true);

    try {
      await saveMutation.mutateAsync(nextSaved);
      toast.success(nextSaved ? 'Saved!' : 'Unsaved from all collections');
    } catch (error) {
      console.error('Save/ unsave collection error:', error);
      setOptimisticSaved(optimisticSaved); // revert on error
    } finally {
      setIsPending(false);
    }
  };

  const ariaLabel = optimisticSaved
    ? 'Remove from saved'
    : 'Save to collection';

  const icon =
    isPending || saveMutation.isPending ? (
      <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
    ) : (
      <Bookmark
        className={`h-5 w-5 transition-all ${optimisticSaved ? 'fill-primary stroke-primary' : 'stroke-muted-foreground'}`}
        fill={optimisticSaved ? 'currentColor' : 'none'}
      />
    );

  const buttonClass = cn(
    'group relative flex h-9 items-center overflow-hidden rounded-lg border border-border/60 bg-background/80 shadow-md backdrop-blur-sm transition-all hover:bg-background/95 disabled:opacity-50',
    variant === 'card' && 'absolute top-3 right-3 z-10',
    className
  );

  const shouldBeVisible =
    isHovered || isPending || saveMutation.isPending || collectionPickerOpen;

  const saveButton = (
    <motion.button
      ref={buttonRef}
      type="button"
      className={buttonClass}
      initial={variant === 'card' ? { opacity: 0, scale: 0.8 } : undefined}
      animate={
        variant === 'card'
          ? { opacity: shouldBeVisible ? 1 : 0, scale: 1 }
          : undefined
      }
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isPending || saveMutation.isPending}
      aria-label={ariaLabel}
    >
      <div className="flex h-full w-9 items-center justify-center">{icon}</div>

      <div
        className="border-border/60 flex h-full w-8 items-center justify-center border-l"
        onClick={(e) => {
          e.stopPropagation();
          if (!user?.id) {
            openModal('auth-gate');
            return;
          }
          handleCollectionPickerOpenChange(true);
        }}
      >
        <PlusIcon className="h-4 w-4" />
      </div>
    </motion.button>
  );

  return (
    <SaveToCollectionPopover
      analysisId={analysisId}
      open={collectionPickerOpen}
      onOpenChange={handleCollectionPickerOpenChange}
      onAutoSaved={() => {
        onSavedChange(true);
        setOptimisticSaved(true);
      }}
    >
      {saveButton}
    </SaveToCollectionPopover>
  );
}
