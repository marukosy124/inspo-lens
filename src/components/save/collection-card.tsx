'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { SquarePenIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CollectionListItem } from '@/lib/utils/collection';

interface CollectionCardProps {
  collection: CollectionListItem;
  onEdit: (c: CollectionListItem) => void;
}

function Mosaic({ urls }: { urls: string[] }) {
  const [a, b, c] = [urls?.[0], urls?.[1], urls?.[2]];

  const placeholder = (
    <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800" aria-hidden />
  );

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-zinc-100 dark:bg-zinc-900">
      <div className="grid h-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-2 gap-px bg-zinc-200 dark:bg-zinc-800">
        <div className="relative row-span-2 overflow-hidden">
          {a ? (
            <Image
              src={a}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            placeholder
          )}
        </div>
        <div className="relative overflow-hidden">
          {b ? (
            <Image
              src={b}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 25vw, 16vw"
            />
          ) : (
            placeholder
          )}
        </div>
        <div className="relative overflow-hidden">
          {c ? (
            <Image
              src={c}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 25vw, 16vw"
            />
          ) : (
            placeholder
          )}
        </div>
      </div>
    </div>
  );
}

export function CollectionCard({ collection, onEdit }: CollectionCardProps) {
  const updated = formatDistanceToNow(new Date(collection.updated_at), {
    addSuffix: true,
  });

  const itemCount = collection.itemCount ?? 0;

  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 0.61, 0.36, 1],
      }}
    >
      <div className="bg-card overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-[0_10px_35px_-5px_rgb(0,0,0,0.08)]">
        {/* Mosaic Image */}
        <div className="relative">
          <Mosaic urls={collection.previewUrls || []} />

          {/* Edit Button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(collection);
            }}
            aria-label="Edit collection"
          >
            <SquarePenIcon className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Footer - Static (no slide up) */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-title line-clamp-2 text-[15px] font-medium tracking-tight">
                {collection.name}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Updated {updated}
              </p>
            </div>

            <Badge variant="zinc" className="mt-0.5 shrink-0">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
