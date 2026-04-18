'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CollectionListItem } from '@/lib/utils/collection';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (collection: CollectionListItem) => void;
  /** When set, the new collection will include this analysis after creation. */
  analysisIdToAdd?: string | null;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreated,
  analysisIdToAdd,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [pending, setPending] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          public: isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create collection');
      }
      const collection = data.collection as CollectionListItem;

      if (analysisIdToAdd) {
        const addRes = await fetch(
          `/api/collections/${collection.id}/analyses`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysisId: analysisIdToAdd }),
          }
        );
        if (!addRes.ok) {
          const err = await addRes.json();
          throw new Error(
            err.error || 'Created collection but failed to add item'
          );
        }
      }

      toast.success('Collection created');
      onCreated?.(collection);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="coll-name">Name</Label>
              <Input
                id="coll-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Color studies"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coll-desc">Description (optional)</Label>
              <Input
                id="coll-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this collection for?"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="border-input size-4 rounded border"
              />
              Public (visible to others)
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
