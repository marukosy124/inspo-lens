'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ImagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalysisGrid from '@/components/analysis/analysis-grid';
import { ImageInfo } from '@/lib/types';
import { motion } from 'motion/react';

interface MyAnalysesPageProps {
  myAnalyses: ImageInfo[];
}

export default function MyAnalysesPage({
  myAnalyses: initialAnalyses,
}: MyAnalysesPageProps) {
  const router = useRouter();
  const [myAnalyses, setMyAnalyses] = useState<ImageInfo[]>(initialAnalyses);

  useEffect(() => {
    setMyAnalyses(initialAnalyses);
  }, [initialAnalyses]);

  const handleSavedChange = (analysisId: string, newSaved: boolean) => {
    setMyAnalyses((prev) => {
      if (!newSaved) {
        // If they unsave their own analysis → remove from list
        return prev.filter(
          (item) => (item.analysisId ?? item.id) !== analysisId
        );
      }
      // Rare case: re-save → just update flag
      return prev.map((item) =>
        (item.analysisId ?? item.id) === analysisId
          ? { ...item, isSaved: true }
          : item
      );
    });
  };

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2">
              <ImagesIcon className="text-primary h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My Analyses
            </h1>
          </div>

          <div className="text-muted-foreground text-sm">
            {myAnalyses.length} items
          </div>
        </div>

        {myAnalyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-muted/30 rounded-2xl border border-dashed px-6 py-16 text-center"
          >
            <div className="bg-primary/10 mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
              <ImagesIcon className="text-primary h-8 w-8" strokeWidth={1.8} />
            </div>

            <h2 className="mb-4 text-2xl font-semibold">
              No analyses created yet
            </h2>

            <p className="text-muted-foreground mx-auto mb-8 max-w-md text-base">
              Upload an image to see your first analysis here.
            </p>

            <Button size="lg" onClick={() => router.push('/')}>
              <Sparkles className="mr-2 h-5 w-5" />
              Create your first analysis <ArrowRight />
            </Button>
          </motion.div>
        ) : (
          <AnalysisGrid
            analyses={myAnalyses}
            onSavedChange={handleSavedChange}
          />
        )}
      </motion.div>
    </div>
  );
}
