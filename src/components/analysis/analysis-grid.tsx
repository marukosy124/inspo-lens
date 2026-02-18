import { AnalysisGridCard } from '@/components/analysis/analysis-grid-card';
import { ImageInfo } from '@/lib/types';

interface AnalysisGridProps {
  analyses: ImageInfo[];
  newlyAddedIds?: Set<string>;
  onSavedChange?: (analysisId: string, saved: boolean) => void;
}

export default function AnalysisGrid({
  analyses,
  newlyAddedIds,
  onSavedChange,
}: AnalysisGridProps) {
  return (
    <div className="grid w-full grid-cols-2 items-start gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {analyses.map((image) => (
        <div key={image.id}>
          <AnalysisGridCard
            image={image}
            showSave
            isNew={newlyAddedIds?.has(image.analysisId ?? image.id)}
            onSavedChange={onSavedChange}
          />
        </div>
      ))}
    </div>
  );
}
