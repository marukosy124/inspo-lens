import HomePage from '@/components/home/home-page';
import { Analysis } from '@/lib/types';
import { analysisToImageInfo } from '@/lib/utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.rpc('get_analyses_with_save_status', {
    p_user_id: user?.id ?? undefined,
    p_limit: 20,
    p_offset: 0,
  });

  const rows = (data ?? []) as Analysis[];
  const initialAnalyses = rows.map(analysisToImageInfo);

  return <HomePage initialAnalyses={initialAnalyses} />;
}
