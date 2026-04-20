'use client';

import { useEffect, useState } from 'react';
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
import { TrashIcon } from 'lucide-react';

export interface EditCollectionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collection?: CollectionListItem | null;
  onUpdated?: (collection: CollectionListItem) => void;
  onDeleted?: (id: string) => void;
}

export function EditCollectionModal({
  open: controlledOpen,
  onOpenChange,
  collection,
  onUpdated,
  onDeleted,
}: EditCollectionModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [pending, setPending] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Reset form when collection changes or dialog opens
  useEffect(() => {
    if (collection && open) {
      setName(collection.name);
      setDescription(collection.description ?? '');
      setIsPublic(collection.public);
    }
  }, [collection, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setIsPublic(false);
    }
  }, [open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection || !name.trim()) return;

    setPending(true);
    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          public: isPublic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      toast.success('Collection updated');
      onUpdated?.(data.collection);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!collection) return;
    if (
      !confirm(
        `Delete “${collection.name}”? Saved analyses stay in your library; only this grouping is removed.`
      )
    ) {
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      toast.success('Collection deleted');
      onDeleted?.(collection.id);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-coll-name">Name</Label>
              <Input
                id="edit-coll-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-coll-desc">Description</Label>
              <Input
                id="edit-coll-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleDelete}
              disabled={pending}
            >
              <TrashIcon />
              Delete
            </Button>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
