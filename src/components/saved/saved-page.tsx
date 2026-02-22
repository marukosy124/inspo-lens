'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bookmark, BookmarkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/context/auth-context';
import { ImageInfo } from '@/lib/types';
import AuthTeaserBanner from '@/components/home/auth-teaser-banner';
import { Button } from '@/components/ui/button';
import AnalysisGrid from '@/components/analysis/analysis-grid';
import { motion } from 'motion/react';

interface SavedPageProps {
  savedAnalyses: ImageInfo[];
}

export default function SavedPage({
  savedAnalyses: initialSavedAnalyses,
}: SavedPageProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [savedAnalyses, setSavedAnalyses] =
    useState<ImageInfo[]>(initialSavedAnalyses);

  // Sync prop changes if parent re-renders (rare in this case)
  useEffect(() => {
    setSavedAnalyses(initialSavedAnalyses);
  }, [initialSavedAnalyses]);

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

    toast.success(newSaved ? 'Saved!' : 'Unsaved!');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // Not signed in → encouraging teaser
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

  // Signed in
  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2">
              <BookmarkIcon className="text-primary h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Saved Analyses
            </h1>
          </div>

          <div className="text-muted-foreground text-sm">
            {savedAnalyses.length} saved
          </div>
        </div>

        {savedAnalyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-6 py-16 text-center"
          >
            <div className="bg-primary/10 mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
              <Bookmark className="text-primary h-8 w-8" strokeWidth={1.8} />
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
      </motion.div>
    </div>
  );
}
