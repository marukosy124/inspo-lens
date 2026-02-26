import { env } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorResponse } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import z from 'zod';

const createAnalysisSchema = z.object({
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  searchTerm: z.string().min(1),
  colors: z
    .array(
      z.object({
        hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        name: z.string().optional().nullable(),
      })
    )
    .min(1),
  public: z.boolean().optional().default(true), // TODO: enable private on UI
  imagePath: z.string().min(1),
  imageBucket: z.string().min(1),
});

export interface CreateAnalysisResponse {
  id: string;
  creatorId: string | null;
}

export async function POST(
  request: Request
): Promise<NextResponse<CreateAnalysisResponse | ErrorResponse>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  let rpcFunction: string;
  let payload: Record<string, unknown>;

  const body = await request.json();
  const validated = createAnalysisSchema.parse(body);

  if (isAuthenticated) {
    rpcFunction = 'create_user_analysis';

    payload = {
      p_search_term: validated.searchTerm,
      p_description: validated.description ?? '',
      p_public: validated.public,
      p_image_path: validated.imagePath ?? null,
      p_image_bucket: validated.imageBucket ?? null,
      p_colors: validated.colors,
      p_keywords: validated.keywords,
    };
  } else {
    // requires service role
    const supabaseAdmin = createClient(
      env.SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!
    );

    rpcFunction = 'create_guest_analysis';

    payload = {
      p_search_term: validated.searchTerm,
      p_description: validated.description ?? '',
      p_public: validated.public,
      p_image_path: validated.imagePath ?? null,
      p_image_bucket: validated.imageBucket ?? null,
      p_colors: validated.colors,
      p_keywords: validated.keywords,
    };

    const { data: id, error } = await supabaseAdmin.rpc(rpcFunction, payload);

    if (error) {
      console.error('Guest create analysis error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create guest analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id,
      creatorId: null,
    });
  }

  const { data: id, error } = await supabase.rpc(rpcFunction, payload);

  if (error) {
    console.error('Create analysis error:', error);
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create analysis' },
      { status }
    );
  }

  return NextResponse.json({
    id,
    creatorId: user?.id ?? null,
  });
}
