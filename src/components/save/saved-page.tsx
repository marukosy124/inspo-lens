'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Bookmark,
  BookmarkIcon,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { ImageInfo } from '@/lib/types';
import AuthTeaserBanner from '@/components/home/auth-teaser-banner';
import { Button } from '@/components/ui/button';
import AnalysisGrid from '@/components/analysis/analysis-grid';
import { motion } from 'motion/react';
import type { CollectionListItem } from '@/lib/utils/collection';
import { CollectionCard } from '@/components/save/collection-card';
import { CreateCollectionDialog } from '@/components/save/create-collection-dialog';
import { EditCollectionDialog } from '@/components/save/edit-collection-dialog';
import { cn } from '@/lib/utils/common';

type TabId = 'saved' | 'collections';

interface SavedPageProps {
  savedAnalyses: ImageInfo[];
  initialCollections: CollectionListItem[];
}

export default function SavedPage({
  savedAnalyses: initialSavedAnalyses,
  initialCollections,
}: SavedPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [savedAnalyses, setSavedAnalyses] =
    useState<ImageInfo[]>(initialSavedAnalyses);
  const [tab, setTab] = useState<TabId>('saved');
  const [collections, setCollections] =
    useState<CollectionListItem[]>(initialCollections);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CollectionListItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setSavedAnalyses(initialSavedAnalyses);
  }, [initialSavedAnalyses]);

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  const handleSavedChange = (analysisId: string, newSaved: boolean) => {
    setSavedAnalyses((prev) => {
      if (!newSaved) {
        return prev.filter(
          (item) => (item.analysisId ?? item.id) !== analysisId
        );
      }

      return prev.map((item) =>
        (item.analysisId ?? item.id) === analysisId
          ? { ...item, isSaved: true }
          : item
      );
    });
    // Toasts are shown by SaveButton; only update local list here.
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="bg-primary/10 mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full">
            <Bookmark className="text-primary h-10 w-10" strokeWidth={1.8} />
          </div>

          <h1 className="mb-5 text-3xl font-bold tracking-tight md:text-4xl">
            Build your personal inspiration library
          </h1>

          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            Sign in or create a free account to start saving analyses you love.
            Collect beautiful images, color palettes, and creative ideas — all
            in your private space.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.push('/sign-in?redirect=/saved')}
            >
              Sign in to see your saved items
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/sign-up')}
            >
              Create free account
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-sm">
            It’s quick, free, and unlocks saving + access from any device.
          </p>

          <div className="mt-16">
            <AuthTeaserBanner />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2">
              <BookmarkIcon className="text-primary h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Library
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="bg-muted/60 inline-flex rounded-lg p-1"
              role="tablist"
              aria-label="Library sections"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'saved'}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  tab === 'saved'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setTab('saved')}
              >
                Saved
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'collections'}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  tab === 'collections'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setTab('collections')}
              >
                <LayoutGrid className="size-4" />
                Collections
              </button>
            </div>
          </div>
        </div>

        {tab === 'saved' && (
          <>
            <div className="text-muted-foreground flex justify-end text-sm">
              {savedAnalyses.length} items
            </div>

            {savedAnalyses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-6 py-16 text-center"
              >
                <div className="bg-primary/10 mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
                  <Bookmark
                    className="text-primary h-8 w-8"
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="mb-4 text-2xl font-semibold">
                  No saved analyses yet
                </h2>

                <p className="text-muted-foreground mx-auto mb-8 max-w-md text-base">
                  Save insights to build your visual reference library.
                </p>

                <Button size="lg" onClick={() => router.push('/')}>
                  Explore Now <ArrowRight />
                </Button>
              </motion.div>
            ) : (
              <AnalysisGrid
                analyses={savedAnalyses}
                onSavedChange={handleSavedChange}
              />
            )}
          </>
        )}

        {tab === 'collections' && (
          <>
            <div className="flex items-center justify-end">
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                Create collection
              </Button>
            </div>

            {collections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-16 text-center"
              >
                <div className="bg-primary/10 mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
                  <LayoutGrid
                    className="text-primary h-8 w-8"
                    strokeWidth={1.8}
                  />
                </div>
                <h2 className="mb-4 text-2xl font-semibold">
                  No collections yet
                </h2>
                <p className="text-muted-foreground mx-auto mb-8 max-w-md text-base">
                  Group saved analyses into boards. Create one to get started.
                </p>
                <Button size="lg" onClick={() => setCreateOpen(true)}>
                  <Plus className="size-4" />
                  Create collection
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {collections.map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    onEdit={(col) => {
                      setEditTarget(col);
                      setEditOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      <CreateCollectionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(c) => {
          setCollections((prev) => [c, ...prev.filter((x) => x.id !== c.id)]);
        }}
      />

      <EditCollectionDialog
        collection={editTarget}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTarget(null);
        }}
        onUpdated={(c) => {
          setCollections((prev) => prev.map((x) => (x.id === c.id ? c : x)));
        }}
        onDeleted={(id) => {
          setCollections((prev) => prev.filter((x) => x.id !== id));
        }}
      />
    </div>
  );
}
