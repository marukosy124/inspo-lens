'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Share2, Check, ExternalLink, Download, Copy } from 'lucide-react';
import { ColorPalette } from '@/components/analysis/color-palette';
import { CopyButton } from '@/components/copy-button';
import { SaveButton } from '@/components/save-button';
import { Button } from '@/components/ui/button';
import { Analysis } from '@/lib/types';
import Image from 'next/image';
import { UserAvatar } from '@/components/user/user-avatar';

interface AnalysisDetailsViewProps {
  analysis: Analysis;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
  copied: string | null;
  onCopy: (id: string, text: string) => void;
  onShare: () => void;
  onOpenExternal: () => void;
  onDownload: () => void;
  className?: string;
}

export function AnalysisDetailsView({
  analysis,
  saved,
  onSavedChange,
  copied,
  onCopy,
  onShare,
  onOpenExternal,
  onDownload,
  className = '',
}: AnalysisDetailsViewProps) {
  const [showFull, setShowFull] = useState(false);

  const description = analysis.description || '';
  const isLong = description.length > 300;
  const displayDesc =
    isLong && !showFull ? description.slice(0, 280) + '...' : description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`mb-10 rounded-lg border border-stone-200/30 bg-white/70 p-6 shadow-sm backdrop-blur-md ${className}`}
    >
      {/* Top bar – Back | Share + Bookmark */}
      <div className="mb-5 flex items-center justify-between gap-2 md:mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="bg-background/80 border-border/60 hover:bg-background rounded-lg border shadow-sm backdrop-blur-sm hover:shadow"
          onClick={onShare}
        >
          {copied === 'share' ? (
            <Check className="h-5 w-5 text-emerald-500" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </Button>

        {analysis.id && (
          <SaveButton
            analysisId={analysis.id}
            saved={saved}
            onSavedChange={onSavedChange}
            variant="icon"
          />
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:flex lg:items-stretch">
        {/* Image section */}
        <div className="lg:w-2/5 lg:shrink-0">
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="group relative overflow-hidden rounded-2xl bg-gray-50/80">
              <div className="relative aspect-3/4 w-full md:aspect-auto md:h-[70vh] lg:aspect-square lg:h-auto">
                {analysis.image_url && (
                  <Image
                    src={analysis.image_url}
                    alt={analysis.search_term || 'Analysis'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    className="object-cover"
                    priority
                  />
                )}
              </div>

              {/* Bottom-left actions */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={onOpenExternal}
                  className="text-foreground h-9 w-9 rounded-lg bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="secondary"
                  onClick={onDownload}
                  className="text-foreground h-9 w-9 rounded-lg bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {analysis.creator && (
              <UserAvatar user={analysis.creator} size="small" />
            )}
          </div>
        </div>

        {/* Details section */}
        <div className="space-y-5 lg:w-3/5">
          {/* Title */}
          {analysis.search_term && (
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl leading-tight font-bold tracking-tight text-zinc-800 md:text-2xl dark:text-zinc-200">
                {analysis.search_term}
              </h1>
              <CopyButton
                id="searchTerm"
                copied={copied}
                onCopy={() => onCopy('searchTerm', analysis.search_term)}
              />
            </div>
          )}

          <div className="border-border/50 border-t" />

          {/* Colors */}
          {analysis.colors && analysis.colors.length > 0 && (
            <>
              <ColorPalette
                colors={analysis.colors}
                copied={copied}
                onCopy={onCopy}
              />
              <div className="border-border/50 border-t" />
            </>
          )}

          {/* Keywords */}
          {analysis.keywords && analysis.keywords.length > 0 && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-sm font-semibold tracking-tight uppercase opacity-60">
                    Keywords
                  </h3>
                  <CopyButton
                    id="allKeywords"
                    copied={copied}
                    onCopy={() =>
                      onCopy(
                        'allKeywords',
                        analysis.keywords.map(({ name }) => name).join(', ')
                      )
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((kw) => {
                    const id = `kw-${kw.id}`;
                    return (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onCopy(id, kw.name)}
                        className="group/kw border-border text-foreground/80 hover:bg-accent hover:border-border relative rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
                      >
                        {kw.name}
                        <span className="bg-card ring-border absolute -top-2 -right-1 rounded-lg p-1 opacity-0 ring-1 transition-opacity group-hover/kw:opacity-100">
                          {copied === id ? (
                            <Check className="h-2.5 w-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="text-muted-foreground h-2.5 w-2.5" />
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="border-border/50 border-t" />
            </>
          )}

          {/* Description – this is what usually defines the "before expanded" height */}
          {analysis.description && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-sm font-semibold tracking-tight uppercase opacity-60">
                  Description
                </h3>
                <CopyButton
                  id="description"
                  copied={copied}
                  onCopy={() => onCopy('description', displayDesc)}
                />
              </div>
              <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed lg:line-clamp-4">
                {displayDesc}
              </p>
              {isLong && (
                <button
                  onClick={() => setShowFull(!showFull)}
                  className="text-muted-foreground text-xs font-medium transition-colors hover:underline"
                >
                  {showFull ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
