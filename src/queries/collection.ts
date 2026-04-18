import { supabaseClient } from '@/lib/supabase/client';
import { CollectionListItem } from '@/lib/utils/collection';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  public: boolean;
  updated_at: string;
  collection_analyses: {
    analysis_id: string;
    created_at: string;
    analyses: {
      image_bucket: string;
      image_path: string;
    }[];
  }[];
}

export const getCollections = async (
  userId: string,
  analysisId: string
): Promise<CollectionListItem[]> => {
  const { data, error } = await supabaseClient
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
          analysis_id,
          created_at,
          analyses ( image_bucket, image_path )
        )
      `
    )
    .eq('creator_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((c: Collection) => ({
    ...c,
    hasAnalysis: !!c.collection_analyses?.some(
      (ca) => ca.analysis_id === analysisId
    ),
    // clean up nested data as we don't need the full relation
    collection_analyses: undefined,
  })) as unknown as CollectionListItem[];
};
