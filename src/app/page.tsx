'use client';

import AnalysisCard from '@/components/image-analysis/analysis-card';
import ImageUploader from '@/components/common/image-uploader';
import { useUsageLimit } from '@/hooks/use-usage-limit';
import { ImageInfo, ImageAnalysis } from '@/lib/types';
import { AlertCircle, LayoutGrid, List, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { remaining, isLimitReached, incrementUsage } = useUsageLimit();

  const [images, setImages] = useState<ImageInfo[]>([]);
  const [layout, setLayout] = useState<'list' | 'stacked'>('list');

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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            InspoLens
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload images to extract colors and discover similar inspiration on
            Pinterest
          </p>
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {remaining} images remaining today
          </div>
        </div>

        {isLimitReached ? (
          //  Rate Limit Warning
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                Daily Limit Reached
              </h3>
              <p className="text-sm text-red-700 mt-1">
                You&apos;ve analyzed 10 images today. Come back tomorrow for
                more!
              </p>
            </div>
          </div>
        ) : (
          // Image Uploader
          <div className="max-w-2xl mx-auto mb-12">
            <ImageUploader
              onImagesAdded={handleImagesAdded}
              remainingImageCount={remaining}
            />
          </div>
        )}

        {/* Layout Switcher */}
        {images.length > 0 && (
          <div
            className={`flex items-center gap-x-2 justify-end ${layout === 'list' ? 'max-w-5xl mx-auto' : 'max-w-7xl'} mb-4`}
          >
            <Button
              variant="destructive-outline"
              onClick={handleRemoveAllImages}
              className="py-5"
            >
              Clear All
            </Button>
            <div className="flex border border-stone-300 rounded-xl p-1 bg-white shadow-sm">
              <button
                onClick={() => setLayout('list')}
                className={`cursor-pointer p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium ${layout === 'list' ? 'bg-blue-100 text-primary' : 'text-stone-400 hover:bg-stone-50'}`}
                title="List View (Horizontal Card)"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLayout('stacked')}
                className={`cursor-pointer p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium ${layout === 'stacked' ? 'bg-blue-100 text-primary' : 'text-stone-400 hover:bg-stone-50'}`}
                title="Stacked View (Vertical Card / Grid)"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="space-y-6">
            <div
              className={`
          ${
            layout === 'stacked'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' // Stacked (Grid) view, spread out
              : 'grid grid-cols-1 gap-8 max-w-5xl mx-auto' // List view (Single column, constrained)
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
