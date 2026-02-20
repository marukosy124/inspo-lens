import AuthTeaserBanner from '@/components/home/auth-teaser-banner';
import SavedPage from '@/components/saved/saved-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { analysisToImageInfo } from '@/lib/utils';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data } = await supabase.rpc('get_user_saved_analyses', {
    p_user_id: user.id,
    p_limit: 20,
    p_offset: 0,
  });

  const savedAnalyses = data.map(analysisToImageInfo);

  return <SavedPage savedAnalyses={savedAnalyses} />;
}
