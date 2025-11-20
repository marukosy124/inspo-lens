import ColorExtractor from '@/components/image-analysis/color-extractor';
import { Loader2, X, Copy } from 'lucide-react';
import { ImageInfo } from '@/lib/types';
import { useState } from 'react';
import KeywordExtractor from '@/components/image-analysis/keyword-extractor';
import Image from 'next/image';

interface ImageAnalysisCardProps {
  image: ImageInfo;
  onRemove: () => void;
}

const ImageAnalysisCard = ({ image, onRemove }: ImageAnalysisCardProps) => {
  const { imageUrl, proxyUrl, analysis, isAnalyzing } = image;
  const [copied, setCopied] = useState<string | null>(null);

  const openPinterestSearch = (query: string) => {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Helper to handle copy and flash ✅ for a sec
  const handleCopy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    }
  };

  // Handle missing imageUrl: show not available message
  if (!imageUrl) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col justify-center items-center aspect-square p-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-red-500 font-semibold text-lg">
            Image Not Available
          </span>
          <span className="text-gray-500 text-sm">
            Something went wrong. The image could not be loaded.
          </span>
        </div>
        <button
          onClick={onRemove}
          className="mt-6 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-gray-200 hover:bg-red-500 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!analysis && !isAnalyzing) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square group">
          <Image
            src={imageUrl || proxyUrl || '/placeholder.svg'}
            alt="Uploaded"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400';
            }}
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <button
            // onClick={analyze}
            className="w-full px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg transition-all duration-300"
          >
            Analyze Image
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="relative aspect-square">
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt="Analyzing"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-sm font-medium">Analyzing...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative aspect-square">
        <Image
          src={imageUrl || '/placeholder.svg'}
          alt="Analyzed"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {analysis?.description && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-700">
                Description
              </span>
              <button
                onClick={() => handleCopy('desc', analysis.description)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                title="Copy description"
                type="button"
              >
                {copied === 'desc' ? (
                  <span className="text-green-500 text-xs">&#10003;</span>
                ) : (
                  <Copy className="w-3 h-3 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.description}
            </p>
          </div>
        )}

        <ColorExtractor
          imageUrl={imageUrl}
          copiedKey={copied}
          onPinterestSearch={openPinterestSearch}
          onCopy={handleCopy}
        />

        {analysis?.keywords && analysis.keywords.length > 0 && (
          <KeywordExtractor
            copiedKey={copied}
            keywords={analysis.keywords}
            onPinterestSearch={openPinterestSearch}
            onCopy={handleCopy}
          />
        )}
      </div>
    </div>
  );
};

export default ImageAnalysisCard;
