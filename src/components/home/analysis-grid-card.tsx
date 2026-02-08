'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { ImageInfo } from '@/lib/types';

interface AnalysisGridCardProps {
  image: ImageInfo;
  showSave?: boolean;
  isNew?: boolean;
  onSave?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

// TODO: DIRECR TO COMPLETE ANALYSIS PAGE (OR CARD)

export function AnalysisGridCard({
  image,
  showSave = true,
  isNew = false,
  onSave,
  onClick,
}: AnalysisGridCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = image.imageUrl ?? '';
  const isSaved = image.isSaved ?? false;
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
      onClick={onClick}
    >
      <div className="bg-card relative overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="bg-muted relative aspect-3/4 w-full overflow-hidden">
          {/* Loading/analyzing state */}
          {isAnalyzing ? (
            <>
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover blur-sm brightness-95 filter"
                style={{ opacity: 1, transition: 'opacity 0.3s' }}
                // no onLoad needed for blurred analyzing preview
              />
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-stone-100/70">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                <span className="text-sm font-medium text-stone-700">
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
                className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              {showSave && onSave && (
                <motion.button
                  className="bg-background/80 hover:bg-background/95 absolute top-3 right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-colors"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave(e);
                  }}
                  aria-label={isSaved ? 'Unsave' : 'Save'}
                >
                  <Bookmark
                    className={`h-5 w-5 transition-colors ${
                      isSaved
                        ? 'fill-primary stroke-primary'
                        : 'stroke-muted-foreground'
                    }`}
                  />
                </motion.button>
              )}

              {/* Bottom hover content */}
              <motion.div
                className="absolute right-0 bottom-0 left-0 p-4"
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
