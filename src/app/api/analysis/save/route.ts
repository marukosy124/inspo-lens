import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';
import { ErrorResponse } from '@/lib/types';
import { NextResponse } from 'next/server';
import z from 'zod';

const saveAnalysisSchema = z.object({
  analysisId: z.string().min(1),
});

export interface SaveAnalysisResponse {
  id: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<SaveAnalysisResponse | ErrorResponse>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const validated = saveAnalysisSchema.parse(body);

  const { data, error } = await supabase
    .from('saved_analyses')
    .insert([{ user_id: user.id, analysis_id: validated.analysisId }])
    .select()
    .single<Database['public']['Tables']['saved_analyses']['Row']>();

  if (error) {
    console.error('Save analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save analysis' },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}

interface UnsaveAnalysisResponse {
  status: number;
  message: string;
}

export async function DELETE(
  request: Request
): Promise<NextResponse<UnsaveAnalysisResponse | ErrorResponse>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const validated = saveAnalysisSchema.parse(body);

  const { error } = await supabase
    .from('saved_analyses')
    .delete()
    .eq('analysis_id', validated.analysisId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Unsave analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unsave analysis' },
      { status: error.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json({
    status: 204,
    message: 'Unsaved successfully',
  });
}
