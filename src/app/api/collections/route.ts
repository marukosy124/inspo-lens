import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  buildCollectionListItem,
  generateUniqueSlug,
} from '@/lib/utils/collection';
import type { ErrorResponse } from '@/lib/types';
import { NextResponse } from 'next/server';
import z from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().max(2000).optional().nullable(),
  public: z.boolean().optional(),
});

export async function GET(
  request: Request
): Promise<
  NextResponse<
    | { collections: ReturnType<typeof buildCollectionListItem>[] }
    | ErrorResponse
  >
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const url = new URL(request.url);
  const analysisId = url.searchParams.get('analysisId') ?? undefined;

  const { data, error } = await supabase
    .from('collections')
    .select(
      `
      id,
      name,
      slug,
      description,
      public,
      updated_at,
      collection_analyses (
        analysis_id,
        created_at,
        analyses ( image_bucket, image_path )
      )
    `
    )
    .eq('creator_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('List collections error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load collections' },
      { status: 500 }
    );
  }

  const collections = (data ?? []).map((row) =>
    buildCollectionListItem(
      row as Parameters<typeof buildCollectionListItem>[0],
      analysisId
    )
  );

  return NextResponse.json({ collections });
}

export async function POST(
  request: Request
): Promise<
  NextResponse<
    { collection: ReturnType<typeof buildCollectionListItem> } | ErrorResponse
  >
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().formErrors.join(', ') },
      { status: 400 }
    );
  }

  const { name, description, public: isPublic } = parsed.data;

  try {
    const slug = await generateUniqueSlug(supabase, user.id, name);

    const { data: inserted, error } = await supabase
      .from('collections')
      .insert({
        name: name.trim(),
        slug,
        description: description ?? null,
        creator_id: user.id,
        public: isPublic ?? false,
      })
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
        inserted as Parameters<typeof buildCollectionListItem>[0]
      ),
    });
  } catch (err) {
    console.error('Create collection error:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Failed to create collection' },
      { status: 500 }
    );
  }
}
