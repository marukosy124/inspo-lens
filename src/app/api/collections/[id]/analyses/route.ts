import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ErrorResponse } from '@/lib/types';
import { NextResponse } from 'next/server';
import z from 'zod';

const bodySchema = z.object({
  analysisId: z.string().min(1),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ ok: true } | ErrorResponse>> {
  const { id: collectionId } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors.join(', ') },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('collection_analyses').insert({
    collection_id: collectionId,
    analysis_id: parsed.data.analysisId,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'This analysis is already in the collection' },
        { status: 409 }
      );
    }
    console.error('Add to collection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add to collection' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ ok: true } | ErrorResponse>> {
  const { id: collectionId } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors.join(', ') },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('collection_analyses')
    .delete()
    .eq('collection_id', collectionId)
    .eq('analysis_id', parsed.data.analysisId);

  if (error) {
    console.error('Remove from collection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove from collection' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
