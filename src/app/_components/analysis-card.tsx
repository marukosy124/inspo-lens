import CustomTooltip from '@/components/custom-tooltip';
import { Button } from '@/components/ui/button';
import { Color, ImageInfo } from '@/lib/types';
import { Check, Copy, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useState, MouseEvent } from 'react';

interface AnalysisCardProps {
  image: ImageInfo;
  layout: 'list' | 'stacked';
  showRemove?: boolean;
  onRemove?: () => void;
}

interface CopyAllButtonProps {
  label: string;
  buttonKey: string;
  copiedKey: string | null;
  onCopy: () => void;
}

const CopyAllButton = ({
  label,
  buttonKey,
  copiedKey,
  onCopy,
}: CopyAllButtonProps) => {
  return (
    <CustomTooltip label={label}>
      <button
        onClick={onCopy}
        className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
        title={label}
      >
        {buttonKey === copiedKey ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </CustomTooltip>
  );
};

interface ColorExtractorProps {
  colors: Color[];
  copied: string | null;
  onCopy: (key: string, value: string) => void;
  onPinterstSearch: (hex: string) => void;
}

const ColorPalette = ({
  colors,
  copied,
  onCopy,
  onPinterstSearch,
}: ColorExtractorProps) => {
  const allColorsString = colors
    .map((color) => `${color.hex} ${color.name}`)
    .join(', ');

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-stone-400">Colors</div>
        {colors.length > 0 && (
          <CopyAllButton
            buttonKey="allColors"
            label="Copy all colors"
            copiedKey={copied}
            onCopy={() => onCopy('allColors', allColorsString)}
          />
        )}
      </div>
      <div className="flex gap-3 flex-wrap">
        {colors.map((color, idx) => {
          const colorLabel = `${color.hex} ${color.name}`;
          return (
            <div key={idx} className="relative group/color">
              <button
                onClick={() => onPinterstSearch(colorLabel)}
                className="w-10 h-10 rounded-full shadow-sm ring-1 ring-black/5 hover:scale-110 transition-transform block cursor-pointer"
                style={{ backgroundColor: color.hex }}
                title={`Search Pinterest for ${colorLabel}`}
              />
              <button
                onClick={() => onCopy(`color-${color.hex}`, colorLabel)}
                className="cursor-pointer absolute -top-2 -right-2 p-1 bg-white rounded-full border border-stone-200 text-stone-400 hover:text-stone-600 opacity-0 group-hover/color:opacity-100 transition-opacity shadow-sm"
                title="Copy hex code"
              >
                {copied === `color-${color.hex}` ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <span className="text-center absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                {color.hex}
                <br />
                {color.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnalysisCard = ({
  image,
  onRemove,
  layout,
  showRemove = true,
}: AnalysisCardProps) => {
  // Determine the main card layout classes
  const containerClasses =
    layout === 'list' ? 'flex flex-col md:flex-row' : 'flex flex-col';

  // Image container sizing
  const imageContainerClasses =
    layout === 'list'
      ? 'relative h-64 md:h-auto md:w-96'
      : 'relative h-48 w-full';

  // Content padding
  const contentPadding = layout === 'list' ? 'p-6 md:p-8' : 'p-4';

  const { imageUrl, proxyUrl, analysis, isAnalyzing, error } = image;
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
      console.error(err);
      return false;
    }
  };

  const handleCopy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    }
  };

  // -- Missing image fallback --
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

  const handleImageContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    // If the click target is or is inside the Remove (X) button, don't open image
    // Find the closest ancestor button that is the X button using its aria-label
    const target = e.target as HTMLElement;
    const removeButton = target.closest('button[aria-label="Remove image"]');
    if (removeButton) return;
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  // Provide a width/height for next/image to fix the bug, but keep the UI sizing.
  // We'll use fill and set sizes to 100% so it matches the responsive container.
  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden ${containerClasses} group hover:shadow-md transition-all duration-300 flex flex-col`}
    >
      {/* Image Container */}
      <div
        className={`${imageContainerClasses} bg-stone-100 overflow-hidden shrink-0 relative cursor-pointer`}
        onClick={handleImageContainerClick}
        tabIndex={0}
        role="button"
        title="Open image in new tab"
        style={{ minHeight: '8rem' }} // for fill layout fallback (optional, keeps box filled)
      >
        <Image
          src={proxyUrl ?? imageUrl}
          alt={analysis?.searchTerm ? analysis.searchTerm : 'Analyzed'}
          fill
          sizes="100vw"
          className={`w-full h-full object-cover transition-opacity duration-700 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          style={{ pointerEvents: 'none' }}
          // fallback width/height for image loader, can be overridden by fill
          priority
        />
        {/* Move Remove button to top left */}
        {showRemove && (
          <Button
            size="icon-sm"
            onClick={onRemove}
            className="absolute top-3 left-3 p-2 bg-stone-100 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-full transition-colors z-20 cursor-pointer"
            aria-label="Remove image"
            tabIndex={0}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 z-10">
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs font-medium text-stone-600">
                Analyzing image...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Now scrollable */}
      <div
        className={`${contentPadding} flex-1 flex flex-col justify-between gap-6 relative overflow-y-auto overflow-x-hidden`}
      >
        {error ? (
          <div className="text-red-500 text-sm text-center py-4">{error}</div>
        ) : isAnalyzing ? (
          <div className="space-y-4 animate-pulse w-full">
            <div className="h-3 bg-stone-100 rounded w-2/3 mb-3"></div>
            <div className="h-3 bg-stone-100 rounded w-1/3"></div>
            <div className="flex gap-2 mt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-stone-100"
                ></div>
              ))}
            </div>
            <div className="h-3 bg-stone-100 rounded w-1/2 mt-3"></div>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {/* 1. Search Term as Title */}
              {analysis?.searchTerm && (
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => openPinterestSearch(analysis.searchTerm)}
                    className="text-lg md:text-xl text-stone-900 font-bold flex-1 wrap-break-word text-left hover:underline transition-colors cursor-pointer"
                    title={`Search Pinterest for "${analysis.searchTerm}"`}
                  >
                    {analysis.searchTerm}
                  </button>
                  <CopyAllButton
                    buttonKey="searchTerm"
                    label="Copy search term"
                    copiedKey={copied}
                    onCopy={() => handleCopy('searchTerm', analysis.searchTerm)}
                  />
                </div>
              )}

              {/* 2. Colors */}
              {imageUrl && analysis?.colors && (
                <ColorPalette
                  colors={analysis.colors}
                  copied={copied}
                  onCopy={handleCopy}
                  onPinterstSearch={openPinterestSearch}
                />
              )}

              {/* 3. Keywords */}
              {analysis?.keywords && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-stone-400">
                      Keywords
                    </div>
                    <CopyAllButton
                      buttonKey="allKeywords"
                      label="Copy all keywords"
                      copiedKey={copied}
                      onCopy={() =>
                        handleCopy('allKeywords', analysis.keywords.join(', '))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, idx) => (
                      <div key={idx} className="relative group/keyword">
                        <button
                          onClick={() => openPinterestSearch(keyword)}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-100 text-stone-600 text-sm rounded-lg transition-colors wrap-break-word max-w-full cursor-pointer"
                        >
                          {keyword}
                        </button>
                        <button
                          onClick={() => handleCopy(`keyword-${idx}`, keyword)}
                          className="absolute -top-2 -right-2 p-1 bg-white rounded-full border border-stone-200 text-stone-400 hover:text-stone-600 opacity-0 group-hover/keyword:opacity-100 transition-opacity shadow-sm cursor-pointer"
                          title="Copy keyword"
                        >
                          {copied === `keyword-${idx}` ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Description */}
              {analysis?.description && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-stone-400">
                      Description
                    </div>
                    <CopyAllButton
                      buttonKey="description"
                      label="Copy description"
                      copiedKey={copied}
                      onCopy={() =>
                        handleCopy('description', analysis.description)
                      }
                    />
                  </div>
                  <p className="leading-snug text-stone-700 wrap-break-word text-sm italic">
                    {analysis.description}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisCard;
