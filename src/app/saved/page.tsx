import SavedPage from '@/components/saved/saved-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { analysisToImageInfo } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { ImageInfo } from '@/lib/types';

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // redirect guests to home
  if (!user) {
    redirect('/');
  }

  const { data: savedData, error } = await supabase.rpc(
    'get_analyses_with_save_status',
    {
      p_user_id: user.id,
      p_only_saved: true,
      p_limit: 20,
      p_offset: 0,
    }
  );

  if (error) {
    console.error('Error fetching saved analyses:', error);
  }

  const savedAnalyses: ImageInfo[] = (savedData ?? []).map(analysisToImageInfo);

  return <SavedPage savedAnalyses={savedAnalyses} />;
}
