import HomePage from '@/components/home/home-page';
import { Analysis, ImageInfo } from '@/lib/types';
import { analysisToImageInfo } from '@/lib/utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialAnalyses: ImageInfo[] = [];

  if (user) {
    // Authenticated: use personalized function with is_saved
    const { data } = await supabase.rpc('get_analyses_with_save_status', {
      p_user_id: user.id,
      p_limit: 20,
      p_offset: 0,
    });

    const rows = (data ?? []) as Analysis[];
    initialAnalyses = rows.map(analysisToImageInfo);
  } else {
    // Guest / not authenticated: use public-only function
    const { data } = await supabase.rpc('get_public_analyses', {
      p_limit: 20,
      p_offset: 0,
    });

    const rows = (data ?? []) as Analysis[];
    initialAnalyses = rows.map(analysisToImageInfo);
  }

  return <HomePage initialAnalyses={initialAnalyses} />;
}
