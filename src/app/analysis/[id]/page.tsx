import AnalysisPage from '@/components/analysis/analysis-page';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Analysis, ImageInfo } from '@/lib/types';
import { analysisToImageInfo, getAnalysisImageUrl } from '@/lib/utils';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AnalysisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let analysisData: Analysis | null = null;
  let relatedData: Analysis[] = [];

  if (user) {
    // Authenticated: use personalized single lookup + full list
    const { data: single } = await supabase.rpc(
      'get_analysis_by_id_with_save_status',
      {
        p_analysis_id: id,
        p_user_id: user.id,
      }
    );

    analysisData = single;

    // Related: use full authenticated function
    const { data: related } = await supabase.rpc(
      'get_analyses_with_save_status',
      {
        p_user_id: user.id,
        p_limit: ITEMS_PER_PAGE,
        p_offset: 0,
      }
    );
    relatedData = related ?? [];
  } else {
    // Guest: use public single lookup + public list
    const { data: single } = await supabase.rpc('get_public_analysis_by_id', {
      p_analysis_id: id,
    });

    analysisData = single;

    // Related: use public list (no personalization)
    const { data: related } = await supabase.rpc('get_public_analyses', {
      p_limit: ITEMS_PER_PAGE,
      p_offset: 0,
    });
    relatedData = related ?? [];
  }

  // Not found or not accessible → 404
  if (!analysisData) {
    notFound();
  }

  // Add image URL for quick review
  const analysisWithImageUrl: Analysis = {
    ...analysisData,
    image_url: getAnalysisImageUrl(
      analysisData.image_bucket,
      analysisData.image_path
    ),
    is_saved: analysisData.is_saved,
  };

  // Filter out the current analysis from related
  const filteredRelated = relatedData.filter(
    (item: Analysis) => item.id !== id
  );

  const relatedAnalyses: ImageInfo[] = filteredRelated.map(analysisToImageInfo);

  return (
    <AnalysisPage
      analysis={analysisWithImageUrl}
      relatedAnalyses={relatedAnalyses}
    />
  );
}
