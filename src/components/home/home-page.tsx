'use client';

import { useUsageLimit } from '@/hooks/use-usage-limit';
import { ImageInfo, ImageAnalysis } from '@/lib/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import useIsTabletOrSmaller from '@/hooks/use-is-tablet-or-smaller';
import { extractColors } from '@/lib/color-extractor';
import { useAuth } from '@/lib/context/auth-context';
import { toast } from 'sonner';
import Hero from '@/components/home/hero';
import AuthTeaserBanner from '@/components/home/auth-teaser-banner';
import ScrollReveal from '@/components/animation/scroll-reveal';
import AnalysisGrid from '@/components/analysis/analysis-grid';
import { ITEMS_PER_PAGE, SHOW_TEASTER_LIMIT } from '@/lib/constants';
import { Sparkles, Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { analysisToImageInfo } from '@/lib/utils/analysis';
import { Analysis } from '@/lib/types';
import { supabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  initialAnalyses?: ImageInfo[];
}

export default function HomePage({ initialAnalyses = [] }: HomePageProps) {
  const { remaining, isLimitReached, incrementUsage } = useUsageLimit();
  const { user } = useAuth();
  const isAuthenticated = !!user?.id;

  const [analyses, setAnalyses] = useState<ImageInfo[]>(initialAnalyses);
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [domLoaded, setDomLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialAnalyses.length >= ITEMS_PER_PAGE
  );
  const [offset, setOffset] = useState(ITEMS_PER_PAGE);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const isTabletOrSmaller = useIsTabletOrSmaller();

  useEffect(() => {
    setAnalyses(initialAnalyses);
    setOffset(ITEMS_PER_PAGE);
    setHasMore(initialAnalyses.length >= ITEMS_PER_PAGE);
  }, [initialAnalyses]);

  // Load more analyses when scrolling
  const loadMoreAnalyses = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      let data;

      if (user?.id) {
        const result = await supabaseClient.rpc(
          'get_analyses_with_save_status',
          {
            p_user_id: user.id,
            p_limit: ITEMS_PER_PAGE,
            p_offset: offset,
          }
        );
        data = result.data;
      } else {
        const result = await supabaseClient.rpc('get_public_analyses', {
          p_limit: ITEMS_PER_PAGE,
          p_offset: offset,
        });
        data = result.data;
      }

      const rows = (data ?? []) as Analysis[];
      const newAnalyses = rows.map(analysisToImageInfo);

      if (newAnalyses.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      setAnalyses((prev) => [...prev, ...newAnalyses]);
      setOffset((prev) => prev + ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading more analyses:', error);
      toast.error('Failed to load more analyses');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, offset, user?.id]);

  // Trigger load more when scroll trigger is in view
  useEffect(() => {
    if (inView && !isLoadingMore && hasMore) {
      loadMoreAnalyses();
    }
  }, [inView, isLoadingMore, hasMore, loadMoreAnalyses]);

  const handleSavedChange = useCallback(
    (analysisId: string, saved: boolean) => {
      setAnalyses((prev) =>
        prev.map((a) =>
          (a.analysisId ?? a.id) === analysisId ? { ...a, isSaved: saved } : a
        )
      );
    },
    []
  );

  const analyzeImage = useCallback(
    async (
      placeholderId: string,
      imageUrl: string,
      bucket?: string,
      path?: string
    ) => {
      if (!imageUrl) throw new Error('Missing remote URL');

      const colors = (await extractColors(imageUrl, 8)).slice(0, 5);

      try {
        let res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, colors }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Failed to analyze image');
        }

        const analysis: ImageAnalysis = await res.json();

        res = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...analysis,
            public: true,
            imagePath: path,
            imageBucket: bucket,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Failed to save analysis');
        }

        const { id: analysisId } = (await res.json()) as { id: string };
        const newItem: ImageInfo = {
          id: analysisId,
          analysisId,
          imageUrl,
          bucket,
          path,
          analysis,
          isAnalyzing: false,
          isSaved: false,
        };

        setAnalyses((prev) => [
          newItem,
          ...prev.filter((a) => a.id !== placeholderId),
        ]);
        setNewlyAddedIds((prev) => new Set(prev).add(analysisId));
        setTimeout(() => {
          setNewlyAddedIds((prev) => {
            const next = new Set(prev);
            next.delete(analysisId);
            return next;
          });
        }, 800);

        toast.success('Analysis complete! Click the card to view details');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Analysis failed');
        setAnalyses((prev) => prev.filter((a) => a.id !== placeholderId));
      }
    },
    []
  );

  const handleImagesAdded = useCallback(
    async (newImages: ImageInfo[]) => {
      if (!isAuthenticated && remaining === 0) {
        toast.error('Daily limit reached! Come back tomorrow.');
        return;
      }

      const toAdd = isAuthenticated ? newImages : newImages.slice(0, remaining);
      if (!isAuthenticated && toAdd.length < newImages.length) {
        toast.warning(`Added ${toAdd.length} (${remaining} remaining today)`);
      }

      incrementUsage();

      for (const img of toAdd) {
        const placeholderId = `pending-${Math.random().toString(36).slice(2, 11)}`;
        const placeholder: ImageInfo = {
          id: placeholderId,
          imageUrl: img.imageUrl,
          bucket: img.bucket,
          path: img.path,
          analysis: null,
          isAnalyzing: true,
        };
        setAnalyses((prev) => [placeholder, ...prev]);
        analyzeImage(placeholderId, img.imageUrl ?? '', img.bucket, img.path);
      }
    },
    [isAuthenticated, remaining, incrementUsage, analyzeImage]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerMaxWidth = isTabletOrSmaller ? 'max-w-5xl' : 'max-w-7xl';

  return (
    <div className={`py-6 ${containerMaxWidth} mb-10`}>
      {/* Hero */}
      <Hero
        remaining={remaining}
        isLimitReached={isLimitReached}
        onImagesAdded={handleImagesAdded}
      />

      {/* Explore section */}
      {domLoaded && (
        <section className="relative mt-8 w-full space-y-4" ref={sectionRef}>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-md p-1.5">
              <Sparkles className="text-primary h-3.5 w-3.5" strokeWidth={2} />
            </div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Explore
            </h2>
          </div>

          {/* Grid */}
          <AnalysisGrid
            analyses={analyses}
            newlyAddedIds={newlyAddedIds}
            onSavedChange={handleSavedChange}
          />

          {/* Empty state */}
          {analyses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 py-16 text-center">
              <p className="text-stone-500">
                Upload an image to see your first analysis here.
              </p>
            </div>
          )}

          {/* Loading more indicator */}
          {hasMore && analyses.length > 0 && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-stone-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom banner: shows users they've reached the end of the list (only displayed if initialAnalyses >= ITEMS_PER_PAGE) */}
          {!hasMore &&
            analyses.length > 0 &&
            initialAnalyses.length >= ITEMS_PER_PAGE && (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="flex w-full items-center gap-4">
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-200 to-transparent" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium tracking-wider text-stone-400 uppercase">
                      You`&apos;ve reached the end
                    </span>
                    <Button size="xs" variant="link" onClick={scrollToTop}>
                      Upload images to explore more inspiration ↑
                    </Button>
                  </div>
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-200 to-transparent" />
                </div>
              </div>
            )}
        </section>
      )}

      {!isAuthenticated && analyses.length > SHOW_TEASTER_LIMIT && (
        <ScrollReveal
          className="pointer-events-none absolute right-0 -bottom-1 left-0 z-30 flex w-full justify-center"
          style={{ transform: 'translateY(20%)' }}
          amount={0.1}
          delay={0.1}
        >
          <AuthTeaserBanner />
        </ScrollReveal>
      )}
    </div>
  );
}
