'use client';

import AnalysisCard from '@/app/_components/analysis-card';
import ImageUploader from '@/app/_components/image-uploader';
import { useUsageLimit } from '@/hooks/use-usage-limit';
import { ImageInfo, ImageAnalysis } from '@/lib/types';
import { AlertCircle, LayoutGrid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useIsTabletOrSmaller from '@/hooks/use-is-tablet-or-smaller';
import Header from '@/components/header';
import { exampleImage } from '@/lib/constants';

export default function Home() {
  const { remaining, isLimitReached, incrementUsage } = useUsageLimit();

  const [images, setImages] = useState<ImageInfo[]>([]);
  const [layout, setLayout] = useState<'list' | 'stacked'>('list');
  const [showExample, setShowExample] = useState<boolean>(true);

  const isTabletOrSmaller = useIsTabletOrSmaller();

  // Whenever the screen is tablet or smaller, always force layout to 'list'
  useEffect(() => {
    if (isTabletOrSmaller) setLayout('list');
  }, [isTabletOrSmaller]);

  // Hide example if images are added
  useEffect(() => {
    if (images.length > 0 && showExample) setShowExample(false);
  }, [images, showExample]);

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
    setShowExample(false);
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

  const handleRemoveAllImages = () => {
    setImages([]);
    setShowExample(true);
  };

  const containerMaxWidth = isTabletOrSmaller ? 'max-w-5xl' : 'max-w-7xl';

  return (
    <>
      <Header />
      <div
        className={`flex-1 container mx-auto px-5 md:px-10 py-12 ${containerMaxWidth}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-8 mb-10">
          {/* Left Side: Name, punchline, quota */}
          <div className="flex flex-col justify-center space-y-4 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-3">
              Unlock your visual story.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
              Extract visual elements from your images, and discover similar
              inspiration on Pinterest.
            </p>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-4">
              {remaining} images remaining today
            </div>
          </div>

          {/* Right Side: Uploader or limit warning; wider */}
          {/* TODO: make the alert on top of the disabled and blurred uploader instead */}
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
        {(images.length > 0 || showExample) && (
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
              {!showExample && (
                <Button
                  variant="destructive-outline"
                  onClick={handleRemoveAllImages}
                  size="sm"
                >
                  Clear All
                </Button>
              )}
            </div>
            {/* Images Grid */}
            {(images.length > 0 || showExample) && (
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
                  {/* Render actual images (if any) */}
                  {images.map((image) => (
                    <AnalysisCard
                      key={image.id}
                      image={image}
                      onRemove={() => handleRemoveImage(image.id)}
                      layout={layout}
                    />
                  ))}
                  {/* Example card if no uploaded images */}
                  {images.length === 0 && showExample && (
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
                        <div className="bg-primary text-white px-3 py-1 rounded-b-lg text-xs font-semibold mb-[-8px] shadow-lg">
                          Example
                        </div>
                      </div>
                      <AnalysisCard
                        image={exampleImage}
                        layout={layout}
                        showRemove={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !showExample && remaining > 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Upload your image to get started!</p>
          </div>
        )}
      </div>
    </>
  );
}
