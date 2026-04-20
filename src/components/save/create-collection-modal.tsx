'use client';

import { useState, useEffect } from 'react';
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

interface CreateCollectionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (collection: CollectionListItem) => void;
  analysisIdToAdd?: string | null; // auto-add this analysis to the new collection
}

export function CreateCollectionModal({
  open: controlledOpen,
  onOpenChange,
  onCreated,
  analysisIdToAdd,
}: CreateCollectionModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [pending, setPending] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setIsPublic(true);
    }
  }, [open]);

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
      if (!res.ok) throw new Error(data.error || 'Failed to create collection');

      const collection = data.collection as CollectionListItem;

      if (analysisIdToAdd) {
        await fetch(`/api/collections/${collection.id}/analyses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisId: analysisIdToAdd }),
        });
      }

      toast.success('Collection created successfully!');

      onCreated?.(collection);
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message || 'Something went wrong');
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create collection</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* form fields same as before */}
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
              onClick={() => setOpen(false)}
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
