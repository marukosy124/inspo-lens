import ImageUploader from '@/components/image-uploader';
import { ImageInfo } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

interface HeroProps {
  remaining: number;
  isLimitReached: boolean;
  onImagesAdded: (newImages: ImageInfo[]) => void;
}

export default function Hero({
  remaining,
  isLimitReached,
  onImagesAdded,
}: HeroProps) {
  return (
    <div className="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col items-center justify-center space-y-5 md:items-start md:pr-12">
        <h1 className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-4xl leading-tight font-bold text-transparent md:text-5xl lg:text-6xl">
          One Image, Endless Ideas.
        </h1>

        <p className="max-w-xl text-center text-lg leading-relaxed font-light text-stone-600/90 md:text-left md:text-xl">
          Transform any visual into keywords, color palettes, and creative
          direction — instantly.
        </p>

        {remaining !== Infinity && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center gap-2 rounded-full border border-stone-200/60 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-500" />
                <span className="text-sm font-medium text-stone-700">
                  {remaining}
                </span>
              </div>
              <span className="text-sm text-stone-500">
                analyses left today
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-full items-center">
        <div className="w-full">
          {isLimitReached ? (
            <div className="mx-auto flex w-full max-w-2xl items-start gap-4 rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50 to-orange-50/30 p-6 shadow-lg shadow-red-500/5 backdrop-blur-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" strokeWidth={2} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-red-900">
                  Daily limit reached
                </h3>
                <p className="text-sm leading-relaxed text-red-700/80">
                  You&apos;ve analyzed 10 images today. Your limit resets
                  tomorrow—come back for more inspiration!
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl">
              <ImageUploader
                onImagesAdded={onImagesAdded}
                remainingImageCount={remaining}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
