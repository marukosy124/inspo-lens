'use client';

import { Check, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

import { CollectionListItem } from '@/lib/utils/collection';
import { cn } from '@/lib/utils/common';

import { getCollections } from '@/queries/collection';
import { supabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/auth-context';
import { saveAnalysis } from '@/actions/analysis';
import { useCollectionStore, useModalStore } from '@/stores';

const COLLECTIONS_QUERY_KEY = (analysisId: string) => [
  'collections-for-analysis',
  analysisId,
];

interface SaveToCollectionPopoverProps {
  analysisId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onAutoSaved?: () => void;
}

export function SaveToCollectionPopover({
  analysisId,
  open,
  onOpenChange,
  children,
  onAutoSaved,
}: SaveToCollectionPopoverProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { open: openCollectionModal } = useModalStore();
  const { addCollection } = useCollectionStore();

  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch collections
  const { data: collections = [], isLoading: loading } = useQuery({
    queryKey: COLLECTIONS_QUERY_KEY(analysisId),
    queryFn: ({ queryKey }) => {
      const [, id] = queryKey;
      return getCollections(user?.id as string, id as string);
    },
    enabled: open && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const filteredCollections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((c) => c.name.toLowerCase().includes(q));
  }, [collections, query]);

  // Toggle: Add or Remove from Collection
  const toggleMutation = useMutation({
    mutationFn: async (collection: CollectionListItem) => {
      const isRemoving = collection.hasAnalysis;

      if (isRemoving) {
        // remove from collection
        const { error } = await supabaseClient
          .from('collection_analyses')
          .delete()
          .match({
            collection_id: collection.id,
            analysis_id: analysisId,
          });

        if (error) throw error;
      } else {
        // Only save if not already saved
        if (!collection.hasAnalysis) {
          // Note: hasAnalysis here means "already in this collection"
          try {
            await saveAnalysis(analysisId); // Safe to call even if already saved (idempotent)
          } catch (err) {
            console.warn(
              'Save failed during add to collection, but continuing...',
              err
            );
          }
        }

        // Add to collection
        const { error } = await supabaseClient
          .from('collection_analyses')
          .insert({
            collection_id: collection.id,
            analysis_id: analysisId,
          });

        if (error) throw error;
      }

      return { isRemoving, collection };
    },
    onMutate: (collection) => {
      setUpdatingId(collection.id);
    },
    onSuccess: ({ isRemoving, collection }) => {
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEY(analysisId),
      });

      // Update bookmark icon in parent if we just added to collection
      if (!isRemoving) {
        onAutoSaved?.();
      }

      toast.success(
        isRemoving
          ? `Removed from ${collection.name}`
          : `Added to ${collection.name}`
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update collection'
      );
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const toggleCollection = (collection: CollectionListItem) => {
    if (updatingId) return;
    toggleMutation.mutate(collection);
  };

  const handleCreate = () => {
    openCollectionModal('create-collection', {
      analysisIdToAdd: analysisId,
      onCreated: (newCollection: CollectionListItem) => {
        queryClient.invalidateQueries({
          queryKey: COLLECTIONS_QUERY_KEY(analysisId),
        });
        addCollection(newCollection);
      },
    });
  };

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange} modal={false}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-[320px] p-0"
          avoidCollisions={true}
          collisionPadding={16}
        >
          <div
            className="w-full"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <div className="border-border border-b px-3 py-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search collections"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Collections List */}
            <div className="max-h-80 overflow-y-auto p-1">
              {loading && (
                <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                  Loading...
                </p>
              )}

              {!loading && filteredCollections.length === 0 && (
                <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                  No collections found
                </p>
              )}

              {!loading &&
                filteredCollections.map((collection) => {
                  const busy = updatingId === collection.id;
                  const selected = !!collection.hasAnalysis;
                  const thumb = collection.previewUrls?.[0];

                  return (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => !busy && toggleCollection(collection)}
                      disabled={busy}
                      className={cn(
                        'hover:bg-accent active:bg-accent/70 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all',
                        busy && 'cursor-not-allowed opacity-60'
                      )}
                    >
                      <span className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </span>

                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {collection.name}
                      </span>

                      <div
                        aria-hidden="true"
                        className={cn(
                          'border-border flex size-5 shrink-0 items-center justify-center rounded border transition-all',
                          selected &&
                            'bg-primary border-primary text-primary-foreground'
                        )}
                      >
                        {selected && <Check className="size-3" />}
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="border-border border-t p-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreate();
                }}
              >
                + Create new collection
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
