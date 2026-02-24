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
import { SHOW_TEASTER_LIMIT } from '@/lib/constants';
import { Sparkles } from 'lucide-react';

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

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  const isTabletOrSmaller = useIsTabletOrSmaller();

  useEffect(() => {
    setAnalyses(initialAnalyses);
  }, [initialAnalyses]);

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
