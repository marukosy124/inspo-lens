import { CustomTooltip } from '@/components/custom-tooltip';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user/user-avatar';
import { Color, CompleteUser, ImageInfo } from '@/lib/types';
import { BookmarkIcon, Check, Copy, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useState, MouseEvent } from 'react';

interface AnalysisCardProps {
  user: CompleteUser | null;
  image: ImageInfo;
  layout: 'list' | 'stacked';
  showRemove?: boolean;
  isSaved?: boolean;
  onRemove?: () => void;
  onSave?: () => void;
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
        className="cursor-pointer text-stone-400 transition-colors hover:text-stone-600"
        title={label}
      >
        {buttonKey === copiedKey ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </CustomTooltip>
  );
};

interface ColorExtractorProps {
  colors: Color[];
  copied: string | null;
  onCopy: (key: string, value: string) => void;
}

const ColorPalette = ({ colors, copied, onCopy }: ColorExtractorProps) => {
  const allColorsString = colors
    .map((color) => `${color.hex} ${color.name}`)
    .join(', ');

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
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
      <div className="flex flex-wrap gap-3">
        {colors.map((color, idx) => {
          const colorLabel = `${color.hex} ${color.name}`;
          return (
            <div key={idx} className="group/color relative">
              <button
                onClick={() => onCopy(`color-${color.hex}`, colorLabel)}
                className="block h-10 w-10 cursor-pointer rounded-full shadow-sm ring-1 ring-black/5 transition-transform hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={`Click to copy ${colorLabel}`}
              />
              <span className="absolute -top-2 -right-2 rounded-full border border-stone-200 bg-white p-1 text-stone-400 opacity-0 shadow-sm transition-opacity group-hover/color:opacity-100">
                {copied === `color-${color.hex}` ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </span>
              <span className="pointer-events-none absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 rounded bg-stone-800 px-2 py-1 text-center text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/color:opacity-100">
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
  layout,
  showRemove = true,
  isSaved,
  onRemove,
  onSave,
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

  const { imageUrl, analysis, isAnalyzing, error } = image;
  const [copied, setCopied] = useState<string | null>(null);

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
      <div className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-semibold text-red-500">
            Image Not Available
          </span>
          <span className="text-sm text-gray-500">
            Something went wrong. The image could not be loaded.
          </span>
        </div>
        <button
          onClick={onRemove}
          className="mt-6 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm transition hover:bg-red-500 hover:text-white"
        >
          <X className="h-4 w-4" />
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
      className={`overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm ${containerClasses} group flex flex-col transition-all duration-300 hover:shadow-md`}
    >
      {/* Image Container */}
      <div
        className={`${imageContainerClasses} relative shrink-0 cursor-pointer overflow-hidden bg-stone-100`}
        onClick={handleImageContainerClick}
        tabIndex={0}
        role="button"
        title="Open image in new tab"
        style={{ minHeight: '8rem' }} // for fill layout fallback (optional, keeps box filled)
      >
        <Image
          src={imageUrl}
          alt={analysis?.searchTerm ?? 'Analyzed'}
          fill
          sizes="100vw"
          className={`h-full w-full object-cover transition-opacity duration-700 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          style={{ pointerEvents: 'none' }}
          // fallback width/height for image loader, can be overridden by fill
          priority
        />
        {/* Move Remove button to top left */}
        {showRemove && (
          <Button
            size="icon-sm"
            onClick={onRemove}
            className="absolute top-3 left-3 z-20 cursor-pointer rounded-full bg-stone-100 p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Remove image"
            tabIndex={0}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <span className="text-xs font-medium text-stone-600">
                Analyzing image...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Now scrollable */}
      <div
        className={`${contentPadding} relative flex flex-1 flex-col justify-between gap-6 overflow-x-hidden overflow-y-auto`}
      >
        {error ? (
          <div className="py-4 text-center text-sm text-red-500">{error}</div>
        ) : isAnalyzing ? (
          <div className="w-full animate-pulse space-y-4">
            <div className="mb-3 h-3 w-2/3 rounded bg-stone-100"></div>
            <div className="h-3 w-1/3 rounded bg-stone-100"></div>
            <div className="mt-6 flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-stone-100"
                ></div>
              ))}
            </div>
            <div className="mt-3 h-3 w-1/2 rounded bg-stone-100"></div>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                {image.creator && <UserAvatar user={image.creator} />}
                {onSave != null && (
                  <Button variant="outline" onClick={onSave}>
                    <BookmarkIcon className={isSaved ? 'fill-current' : ''} />
                    Save
                  </Button>
                )}
              </div>
              {/* 1. Search Term as Title */}
              {analysis?.searchTerm && (
                <div className="flex items-baseline gap-2">
                  <p className="flex-1 text-left text-lg font-bold wrap-break-word text-stone-900 transition-colors md:text-xl">
                    {analysis.searchTerm}
                  </p>
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
                />
              )}

              {/* 3. Keywords */}
              {analysis?.keywords && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
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
                      <div key={idx} className="group/keyword relative">
                        <button
                          onClick={() => handleCopy(`keyword-${idx}`, keyword)}
                          className="max-w-full cursor-pointer rounded-lg border border-stone-100 bg-stone-50 px-3 py-1.5 text-sm wrap-break-word text-stone-600 transition-colors hover:bg-stone-100"
                        >
                          {keyword}
                        </button>
                        <span className="absolute -top-2 -right-2 cursor-pointer rounded-full border border-stone-200 bg-white p-1 text-stone-400 opacity-0 shadow-sm transition-opacity group-hover/keyword:opacity-100">
                          {copied === `keyword-${idx}` ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Description */}
              {analysis?.description && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
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
                  <p className="text-sm leading-snug wrap-break-word text-stone-700 italic">
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
