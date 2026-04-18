'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollectionListItem } from '@/lib/utils/collection';
import { cn } from '@/lib/utils/common';

interface CollectionCardProps {
  collection: CollectionListItem;
  onEdit: (c: CollectionListItem) => void;
}

function Mosaic({ urls }: { urls: string[] }) {
  const [a, b, c] = [urls[0], urls[1], urls[2]];
  const placeholder = (
    <div className="bg-muted h-full min-h-[48px] w-full" aria-hidden />
  );

  return (
    <div
      className={cn(
        'bg-muted/40 grid aspect-[4/3] w-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-2 overflow-hidden rounded-2xl'
      )}
    >
      <div className="relative row-span-2 min-h-0">
        {a ? (
          <Image
            src={a}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          placeholder
        )}
      </div>
      <div className="relative min-h-0">
        {b ? (
          <Image
            src={b}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 16vw"
          />
        ) : (
          placeholder
        )}
      </div>
      <div className="relative min-h-0">
        {c ? (
          <Image
            src={c}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 16vw"
          />
        ) : (
          placeholder
        )}
      </div>
    </div>
  );
}

export function CollectionCard({ collection, onEdit }: CollectionCardProps) {
  const updated = formatDistanceToNow(new Date(collection.updated_at), {
    addSuffix: true,
  });

  return (
    <div className="group relative">
      <div className="relative">
        <Mosaic urls={collection.previewUrls} />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className={cn(
            'absolute top-2 right-2 h-9 w-9 shadow-md transition-opacity',
            'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(collection);
          }}
          aria-label="Edit collection"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-lg font-semibold tracking-tight">
          {collection.name}
        </h3>
        <p className="text-muted-foreground text-sm">
          {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}{' '}
          · {updated}
        </p>
      </div>
    </div>
  );
}
