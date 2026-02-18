import AnalysisPage from '@/components/analysis/analysis-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Analysis } from '@/lib/types';
import { analysisToImageInfo, getAnalysisImageUrl } from '@/lib/utils';

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

  const { data: analysisById } = await supabase.rpc(
    'get_analysis_by_id_with_save_status',
    {
      p_user_id: user?.id ?? undefined,
      p_analysis_id: id,
    }
  );

  const { data: analyses } = await supabase.rpc(
    'get_analyses_with_save_status',
    {
      p_user_id: user?.id ?? undefined,
      p_limit: 20,
      p_offset: 0,
    }
  );

  // filter out current analysis
  const rows = (analyses ?? []).filter(
    (item: Analysis) => item.id === id
  ) as Analysis[];
  const relatedAnalyses = rows.map(analysisToImageInfo);
  const analysisWithImageUrl = {
    ...analysisById,
    image_url: getAnalysisImageUrl(
      analysisById.image_bucket,
      analysisById.image_path
    ),
  };

  return (
    <AnalysisPage
      analysis={analysisWithImageUrl}
      relatedAnalyses={relatedAnalyses}
    />
  );
}
