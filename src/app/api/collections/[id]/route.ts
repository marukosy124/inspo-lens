import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  buildCollectionListItem,
  generateUniqueSlug,
} from '@/lib/utils/collection';
import type { ErrorResponse } from '@/lib/types';
import { NextResponse } from 'next/server';
import z from 'zod';

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  public: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<
    { collection: ReturnType<typeof buildCollectionListItem> } | ErrorResponse
  >
> {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors.join(', ') },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;
  if (parsed.data.public !== undefined) updates.public = parsed.data.public;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  try {
    const finalUpdates = { ...updates };

    // If name is being updated, generate unique slug
    if (parsed.data.name !== undefined) {
      const newSlug = await generateUniqueSlug(
        supabase,
        user.id,
        parsed.data.name,
        id
      );
      finalUpdates.slug = newSlug;
    }

    const { data, error } = await supabase
      .from('collections')
      .update(finalUpdates)
      .eq('id', id)
      .eq('creator_id', user.id)
      .select(
        `
        id, name, slug, description, public, updated_at,
        collection_analyses (
          created_at,
          analyses ( image_bucket, image_path )
        )
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({
      collection: buildCollectionListItem(
        data as Parameters<typeof buildCollectionListItem>[0]
      ),
    });
  } catch (err) {
    console.error('Update collection error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to update collection' },
      { status: (err as Error).message.includes('unique slug') ? 409 : 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ ok: true } | ErrorResponse>> {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id);

  if (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete collection' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
