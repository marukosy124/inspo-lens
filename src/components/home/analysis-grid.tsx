import { AnalysisGridCard } from '@/components/home/analysis-grid-card';
import { CompleteUser, ImageInfo } from '@/lib/types';

interface AnalysisGridProps {
  analyses: ImageInfo[];
  newlyAddedIds: Set<string>;
  user: CompleteUser | null;
  onSave: (analysisId: string, isSaved?: boolean | null) => void;
}

export default function AnalysisGrid({
  analyses,
  newlyAddedIds,
  user,
  onSave,
}: AnalysisGridProps) {
  return (
    <div className="grid w-full grid-cols-2 items-start gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {analyses.map((image) => (
        <div key={image.id}>
          <AnalysisGridCard
            image={image}
            showSave={!!user?.id}
            isNew={newlyAddedIds.has(image.analysisId ?? image.id)}
            onSave={() => onSave(image.analysisId ?? image.id, image.isSaved)}
          />
        </div>
      ))}
    </div>
  );
}
