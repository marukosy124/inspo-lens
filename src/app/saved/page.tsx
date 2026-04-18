import SavedPage from '@/components/save/saved-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { analysisToImageInfo } from '@/lib/utils/analysis';
import { buildCollectionListItem } from '@/lib/utils/collection';
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

  const { data: collectionRows } = await supabase
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
        created_at,
        analyses ( image_bucket, image_path )
      )
    `
    )
    .eq('creator_id', user.id)
    .order('updated_at', { ascending: false });

  const initialCollections = (collectionRows ?? []).map((row) =>
    buildCollectionListItem(
      row as Parameters<typeof buildCollectionListItem>[0]
    )
  );

  return (
    <SavedPage
      savedAnalyses={savedAnalyses}
      initialCollections={initialCollections}
    />
  );
}
