'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const analysisSchema = z.object({
  analysisId: z.string().min(1, 'Analysis ID is required'),
});

export async function saveAnalysis(analysisId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = analysisSchema.parse({ analysisId });

  const { error } = await supabase.from('saved_analyses').insert({
    user_id: user.id,
    analysis_id: validated.analysisId,
  });

  if (error) {
    console.error('Save analysis error:', error);
    throw new Error(error.message || 'Failed to save analysis');
  }

  revalidatePath('/'); // Optional: revalidate relevant pages
  return { success: true };
}

export async function unsaveAnalysis(analysisId: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validated = analysisSchema.parse({ analysisId });

  const { error } = await supabase
    .from('saved_analyses')
    .delete()
    .eq('user_id', user.id)
    .eq('analysis_id', validated.analysisId);

  if (error) {
    console.error('Unsave analysis error:', error);
    throw new Error(error.message || 'Failed to unsave analysis');
  }

  revalidatePath('/');
  return { success: true };
}
