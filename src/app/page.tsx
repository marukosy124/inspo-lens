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
import { extractColors } from '@/lib/color-extractor';

//  TODO: ADD SAVE BTN
// TODO: USE SUPBASE AUTH INSYTEAD

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
  const analyzeImage = async (
    imageId: string,
    imageUrl: string,
    proxyUrl: string
  ) => {
    const colors = (await extractColors(proxyUrl, 8)).slice(0, 5); // only get the top 5 colors

    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                isAnalyzing: true,
              }
            : img
        )
      );

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          colors,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to analyze image');
      }

      const result: ImageAnalysis = await res.json();
      // TODO: SAVE RESULT TO DB

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
    imagesWithIds.forEach(({ id, imageUrl, proxyUrl }) => {
      if (imageUrl && proxyUrl) analyzeImage(id, imageUrl, proxyUrl);
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
      <div
        className={`container mx-auto flex-1 px-5 py-12 md:px-10 ${containerMaxWidth}`}
      >
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.4fr]">
          {/* Left Side: Name, punchline, quota */}
          <div className="flex flex-col justify-center space-y-4 md:pr-10">
            <h1 className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text pb-3 text-4xl font-bold text-transparent md:text-5xl">
              One Image, Many Ideas.
            </h1>
            <p className="max-w-xl text-lg text-gray-600">
              Turn visuals into keywords, colors, and directions you can
              explore.
            </p>
            <div className="mt-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              {remaining} images remaining today
            </div>
          </div>

          {/* Right Side: Uploader or limit warning; wider */}
          {/* TODO: make the alert on top of the disabled and blurred uploader instead */}
          <div className="flex h-full items-center">
            <div className="w-full">
              {isLimitReached ? (
                //  Rate Limit Warning
                <div className="mx-auto flex w-full max-w-2xl items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Daily Limit Reached
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      You&apos;ve analyzed 10 images today. Come back tomorrow
                      for more!
                    </p>
                  </div>
                </div>
              ) : (
                // Image Uploader
                <div className="mx-auto w-full max-w-3xl">
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
              className={`flex items-center justify-end gap-x-2 md:justify-between ${!isTabletOrSmaller && layout === 'list' ? 'mx-auto max-w-7xl' : 'max-w-7xl'} mb-4`}
            >
              {!isTabletOrSmaller && (
                <div className="flex rounded-md border border-stone-300 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => setLayout('list')}
                    className={`flex cursor-pointer items-center gap-1 rounded-sm p-1 text-sm font-medium transition-colors ${layout === 'list' ? 'text-primary bg-blue-100' : 'text-stone-400 hover:bg-stone-50'}`}
                    title="List View (Horizontal Card)"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLayout('stacked')}
                    className={`flex cursor-pointer items-center gap-1 rounded-sm p-1 text-sm font-medium transition-colors ${layout === 'stacked' ? 'text-primary bg-blue-100' : 'text-stone-400 hover:bg-stone-50'}`}
                    title="Stacked View (Vertical Card / Grid)"
                    disabled={isTabletOrSmaller}
                  >
                    <LayoutGrid className="h-4 w-4" />
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
                  className={` ${
                    layout === 'stacked'
                      ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                      : 'mx-auto grid max-w-7xl grid-cols-1 gap-8'
                  } `}
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
                      <div className="absolute top-0 right-0 left-0 z-10 flex justify-center">
                        <div className="bg-primary mb-[-8px] rounded-b-lg px-3 py-1 text-xs font-semibold text-white shadow-lg">
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
          <div className="py-12 text-center text-gray-500">
            <p>Upload your image to get started!</p>
          </div>
        )}
      </div>
    </>
  );
}
