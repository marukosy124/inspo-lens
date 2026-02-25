'use client';

import { useState, useMemo, useCallback } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Analysis, ImageInfo } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { AnalysisDetailsView } from '@/components/analysis/analysis-details-view';
import { toast } from 'sonner';
import AuthTeaserBanner from '@/components/home/auth-teaser-banner';
import ScrollReveal from '@/components/animation/scroll-reveal';
import { motion } from 'motion/react';
import AnalysisGrid from '@/components/analysis/analysis-grid';
import { useAuth } from '@/lib/context/auth-context';
import { SHOW_TEASTER_LIMIT } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface AnalysisPageProps {
  analysis: Analysis;
  relatedAnalyses?: ImageInfo[];
}

export default function AnalysisPage({
  analysis,
  relatedAnalyses = [],
}: AnalysisPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [copied, setCopied] = useState<string | null>(null);
  const [savedCurrent, setSavedCurrent] = useState<boolean>(
    !!analysis.is_saved
  );

  const initialRelatedSavedMap = useMemo(() => {
    const initial: Record<string, boolean> = {};
    relatedAnalyses.forEach((img) => {
      const id = img.analysisId ?? img.id;
      if (id) initial[id] = img.isSaved ?? false;
    });
    return initial;
  }, [relatedAnalyses]); // only run once on mount

  const [relatedSavedMap, setRelatedSavedMap] = useState<
    Record<string, boolean>
  >(initialRelatedSavedMap);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch (error) {
      toast.error(`Failed to copy: ${error}`);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(analysis.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${analysis.search_term || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast.error(`Failed to download: ${error}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: analysis.search_term || 'Analysis',
          url: window.location.href,
        });
      } catch (error) {
        toast.error(`Failed to share: ${error}`);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied('share');
      setTimeout(() => setCopied(null), 1800);
    }
  };

  const handleOpenExternal = () => {
    if (analysis.image_url) {
      window.open(analysis.image_url, '_blank');
    }
  };

  const handleRelatedSavedChange = useCallback(
    (analysisId: string, newSaved: boolean) => {
      setRelatedSavedMap((prev) => ({
        ...prev,
        [analysisId]: newSaved,
      }));
    },
    []
  );

  const displayedRelatedAnalyses = useMemo(() => {
    return relatedAnalyses.map((img) => {
      const id = img.analysisId ?? img.id;
      if (!id) return img;

      const trackedSaved = relatedSavedMap[id];
      if (trackedSaved !== undefined) {
        return { ...img, isSaved: trackedSaved };
      }
      return img;
    });
  }, [relatedAnalyses, relatedSavedMap]);

  return (
    <div className="relative mb-10">
      <div className="flex items-start gap-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background/70 border-border/60 hover:bg-background/80 mt-[6px] rounded-lg border shadow-sm backdrop-blur-sm"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <AnalysisDetailsView
            analysis={analysis}
            saved={savedCurrent}
            onSavedChange={setSavedCurrent}
            copied={copied}
            onCopy={handleCopy}
            onShare={handleShare}
            onOpenExternal={handleOpenExternal}
            onDownload={handleDownload}
          />

          {/* Related */}
          {relatedAnalyses.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative space-y-4 pb-10"
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-md p-1.5">
                  <Sparkles
                    className="text-primary h-3.5 w-3.5"
                    strokeWidth={2}
                  />
                </div>
                <h2 className="text-foreground text-lg font-bold tracking-tight">
                  Explore More
                </h2>
              </div>

              <AnalysisGrid
                analyses={displayedRelatedAnalyses}
                onSavedChange={handleRelatedSavedChange}
              />

              {!user?.id &&
                displayedRelatedAnalyses.length > SHOW_TEASTER_LIMIT && (
                  <ScrollReveal
                    className="pointer-events-none absolute right-0 -bottom-1 left-0 z-30 flex w-full justify-center"
                    style={{ transform: 'translateY(30%)' }}
                    amount={0.1}
                    delay={0.1}
                  >
                    <AuthTeaserBanner />
                  </ScrollReveal>
                )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
