'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

import { ImageInfo } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { SaveButton } from '@/components/save-button';

interface AnalysisGridCardProps {
  image: ImageInfo;
  showSave?: boolean;
  isNew?: boolean;
  onSavedChange?: (analysisId: string, saved: boolean) => void;
}

export function AnalysisGridCard({
  image,
  showSave = true,
  isNew = false,
  onSavedChange,
}: AnalysisGridCardProps) {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = image.imageUrl ?? '';
  const analysisId = image.analysisId ?? image.id;
  const isAnalyzing = image.isAnalyzing ?? false;
  const title = image.analysis?.searchTerm ?? 'Untitled';
  const colors = image.analysis?.colors ?? [];

  return (
    <motion.div
      className="group masonry-item cursor-pointer break-inside-avoid"
      initial={
        isNew ? { opacity: 0, scale: 0.92, y: 16 } : { opacity: 0, y: 20 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: isNew ? 0.5 : 0.4,
        ease: isNew ? [0.22, 0.61, 0.36, 1] : 'easeOut',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/analysis/${image.analysisId}`)}
    >
      <div className="bg-card scrollbar-hide relative overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 will-change-transform hover:shadow-xl">
        <div className="bg-muted relative aspect-3/4 w-full overflow-hidden will-change-transform">
          {/* Loading / analyzing state */}
          {isAnalyzing ? (
            <>
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover blur-sm brightness-95 filter"
                style={{ opacity: 1, transition: 'opacity 0.3s' }}
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-stone-100/70 dark:bg-stone-900/70">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Analyzing...
                </span>
              </div>
            </>
          ) : (
            <>
              {!imageLoaded && (
                <div className="bg-muted absolute inset-0 animate-pulse" />
              )}

              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-all duration-500 ease-out group-hover:scale-[1.04]"
                onLoad={() => setImageLoaded(true)}
                style={{ opacity: imageLoaded ? 1 : 0 }}
              />

              {/* Hover gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              />

              {/* Save button – appears on hover */}
              {showSave && analysisId && (
                <SaveButton
                  analysisId={analysisId}
                  saved={!!image.isSaved}
                  onSavedChange={(newSaved) =>
                    onSavedChange?.(analysisId, newSaved)
                  }
                  variant="card"
                  isHovered={isHovered}
                  stopPropagation
                />
              )}

              {/* Bottom hover content */}
              <motion.div
                className="absolute inset-x-0 bottom-0 p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  y: isHovered ? 0 : 12,
                }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="line-clamp-2 text-sm font-medium text-white drop-shadow-md">
                  {title}
                </h3>
                {colors.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {colors.slice(0, 6).map((colorObj, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded-full border border-white/30 shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: colorObj.hex }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
