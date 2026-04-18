import { createSupabaseServerClient } from '@/lib/supabase/server';
import { analysisToImageInfo } from '@/lib/utils/analysis';
import { ImageInfo } from '@/lib/types';
import { redirect } from 'next/navigation';
import MyAnalysesPage from '@/components/analysis/my-analyses-page';

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: analysesData, error } = await supabase.rpc(
    'get_analyses_with_save_status',
    {
      p_user_id: user.id, // for is_saved
      p_creator_id: user.id, // only current user's analyses
      p_limit: 20,
      p_offset: 0,
    }
  );

  if (error) {
    console.error('Error fetching my analyses:', error);
  }

  const myAnalyses: ImageInfo[] = (analysesData ?? []).map(analysisToImageInfo);

  return <MyAnalysesPage myAnalyses={myAnalyses} />;
}
