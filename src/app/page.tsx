'use client';

import AnalysisCard from '@/app/_components/analysis-card';
import ImageUploader from '@/app/_components/image-uploader';
import { useUsageLimit } from '@/hooks/use-usage-limit';
import { ImageInfo, ImageAnalysis } from '@/lib/types';
import { AlertCircle, LayoutGrid, List, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useIsTabletOrSmaller from '@/hooks/use-is-tablet-or-smaller';

export default function Home() {
  const { remaining, isLimitReached, incrementUsage } = useUsageLimit();

  const [images, setImages] = useState<ImageInfo[]>([]);
  const [layout, setLayout] = useState<'list' | 'stacked'>('list');

  const isTabletOrSmaller = useIsTabletOrSmaller();

  // Whenever the screen is tablet or smaller, always force layout to 'list'
  useEffect(() => {
    if (isTabletOrSmaller) setLayout('list');
  }, [isTabletOrSmaller]);

  // Analyzes one image, updates its analysis & isAnalyzing in images state by id
  const analyzeImage = async (imageId: string, imageUrl: string) => {
    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, isAnalyzing: true } : img
        )
      );

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to analyze image');
      }

      const result: ImageAnalysis = await res.json();

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, analysis: result, isAnalyzing: false }
            : img
        )
      );
    } catch (err) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                analysis: null,
                isAnalyzing: false,
                error: err instanceof Error ? err.message : String(err),
              }
            : img
        )
      );
    }
  };

  const handleImagesAdded = async (newImages: ImageInfo[]) => {
    if (remaining === 0) {
      alert(
        'Daily limit reached! You can analyze 10 images per day. Come back tomorrow.'
      );
      return;
    }

    // Limit to remaining slots
    const imagesToAdd = newImages.slice(0, remaining);
    if (imagesToAdd.length < newImages.length) {
      alert(
        `Added ${imagesToAdd.length} images (${remaining} images remaining today)`
      );
    }

    // Add with generated id, isAnalyzing true
    const imagesWithIds = imagesToAdd.map((img) => ({
      ...img,
      id: Math.random().toString(36).substring(7),
      isAnalyzing: true,
      analysis: null,
    }));

    // Add new images to the top (prepend)
    setImages((prev) => [...imagesWithIds, ...prev]);
    incrementUsage();

    // For each added image, start analyzing in parallel (do not await all)
    imagesWithIds.forEach(({ id, imageUrl }) => {
      if (imageUrl) analyzeImage(id, imageUrl);
    });

    // For reference: could add incrementUsage logic here, etc.
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // New: Remove all images
  const handleRemoveAllImages = () => {
    setImages([]);
  };

  // Decide max width: always max-w-xl if tablet or smaller, max-w-7xl otherwise
  const containerMaxWidth = isTabletOrSmaller ? 'max-w-5xl' : 'max-w-7xl';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 px-5">
      <div className={`container mx-auto px-4 py-12 ${containerMaxWidth}`}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-8 mb-10">
          {/* Left Side: Name, punchline, quota */}
          <div className="flex flex-col justify-center space-y-4 md:pr-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              InspoLens
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Upload images to extract visual elements and discover similar
              inspiration on Pinterest
            </p>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-4">
              {remaining} images remaining today
            </div>
          </div>

          {/* Right Side: Uploader or limit warning; wider */}
          <div className="flex items-center h-full">
            <div className="w-full">
              {isLimitReached ? (
                //  Rate Limit Warning
                <div className="w-full max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Daily Limit Reached
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      You&apos;ve analyzed 10 images today. Come back tomorrow
                      for more!
                    </p>
                  </div>
                </div>
              ) : (
                // Image Uploader
                <div className="w-full max-w-3xl mx-auto">
                  <ImageUploader
                    onImagesAdded={handleImagesAdded}
                    remainingImageCount={remaining}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout Switcher */}
        {images.length > 0 && (
          <div>
            {/* Layout Switcher is hidden on tablet or smaller */}
            <div
              className={`flex items-center gap-x-2 justify-end md:justify-between ${!isTabletOrSmaller && layout === 'list' ? 'max-w-7xl mx-auto' : 'max-w-7xl'} mb-4`}
            >
              {!isTabletOrSmaller && (
                <div className="flex border border-stone-300 rounded-md p-1 bg-white shadow-sm">
                  <button
                    onClick={() => setLayout('list')}
                    className={`cursor-pointer p-1 rounded-sm transition-colors flex items-center gap-1 text-sm font-medium ${layout === 'list' ? 'bg-blue-100 text-primary' : 'text-stone-400 hover:bg-stone-50'}`}
                    title="List View (Horizontal Card)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayout('stacked')}
                    className={`cursor-pointer p-1 rounded-sm transition-colors flex items-center gap-1 text-sm font-medium ${layout === 'stacked' ? 'bg-blue-100 text-primary' : 'text-stone-400 hover:bg-stone-50'}`}
                    title="Stacked View (Vertical Card / Grid)"
                    disabled={isTabletOrSmaller}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              )}
              <Button
                variant="destructive-outline"
                onClick={handleRemoveAllImages}
                size="sm"
              >
                Clear All
              </Button>
            </div>
            {/* Images Grid */}
            {images.length > 0 && (
              <div className="space-y-6">
                <div
                  className={`
          ${
            layout === 'stacked'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'grid grid-cols-1 gap-8 max-w-7xl mx-auto'
          }
        `}
                >
                  {images.map((image) => (
                    <AnalysisCard
                      key={image.id}
                      image={image}
                      onRemove={() => handleRemoveImage(image.id)}
                      layout={layout}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && remaining > 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Upload your first image to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
