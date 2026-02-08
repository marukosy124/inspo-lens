import { env } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ErrorResponse } from '@/lib/types';
import { NextResponse } from 'next/server';
import z from 'zod';

const createAnalysisSchema = z.object({
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  searchTerm: z.string().min(1),
  colors: z.array(z.object({ hex: z.string(), name: z.string() })).min(1),
  public: z.boolean().optional().default(true), // TODO: enable private on UI
  imagePath: z.string().min(1),
  imageBucket: z.string().min(1),
});

export interface CreateAnalysisResponse {
  id: string;
  creatorId: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<CreateAnalysisResponse | ErrorResponse>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const creatorId = user?.id ?? env.OFFICIAL_USER_ID;

  const body = await request.json();
  const validated = createAnalysisSchema.parse(body);

  const { data: id, error } = await supabase.rpc(
    'create_analysis_with_relations',
    {
      p_creator_id: creatorId,
      p_search_term: validated.searchTerm,
      p_description: validated.description,
      p_public: validated.public ?? true, // by default true
      p_image_path: validated.imagePath,
      p_image_bucket: validated.imageBucket,
      p_colors: validated.colors || [],
      p_keywords: validated.keywords || [],
    }
  );

  if (error) {
    console.error('Ceate analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create analysis' },
      { status: error.code === 'PGRST116' ? 404 : 500 } // 404 if function not found
    );
  }

  return NextResponse.json({ id, creatorId });
}
