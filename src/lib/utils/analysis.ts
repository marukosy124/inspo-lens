import { env } from '@/lib/env';
import type { Analysis, ImageInfo } from '@/lib/types';

export function getAnalysisImageUrl(bucket: string, path: string): string {
  return `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function analysisToImageInfo(row: Analysis): ImageInfo {
  return {
    id: row.id,
    analysisId: row.id,
    imageUrl: getAnalysisImageUrl(row.image_bucket, row.image_path),
    bucket: row.image_bucket,
    path: row.image_path,
    isSaved: row.is_saved,
    creator: row.creator ?? null,
    analysis: {
      searchTerm: row.search_term,
      description: row.description,
      keywords: row.keywords.map((k) => (typeof k === 'string' ? k : k.name)),
      colors: row.colors.map((c) => ({ hex: c.hex, name: c.name, id: c.id })),
    },
  };
}
