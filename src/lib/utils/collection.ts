import { getAnalysisImageUrl } from '@/lib/utils/analysis';
import { SupabaseClient } from '@supabase/supabase-js';

export type CollectionListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  public: boolean;
  updated_at: string;
  itemCount: number;
  previewUrls: string[];
  hasAnalysis?: boolean;
};

/** PostgREST may return `analyses` as one row or an array for the same FK embed. */
function pickNestedAnalysis(
  analyses:
    | { image_bucket: string; image_path: string }
    | { image_bucket: string; image_path: string }[]
    | null
): { image_bucket: string; image_path: string } | null {
  if (analyses == null) return null;
  if (Array.isArray(analyses)) return analyses[0] ?? null;
  return analyses;
}

type CollectionAnalysesJoin = {
  created_at: string | null;
  analyses:
    | { image_bucket: string; image_path: string }
    | { image_bucket: string; image_path: string }[]
    | null;
} | null;

export function slugifyCollectionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKD') // handle accents
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .slice(0, 80); // reasonable max length
}

export async function generateUniqueSlug(
  supabase: SupabaseClient,
  userId: string,
  baseName: string,
  excludeCollectionId?: string // for PATCH: ignore current collection
): Promise<string> {
  const baseSlug = slugifyCollectionName(baseName);
  const SLUG_RETRY_LIMIT = 10;

  for (let i = 0; i < SLUG_RETRY_LIMIT; i++) {
    const slug = i === 0 ? baseSlug : `${baseSlug}-${i}`;

    // Check if this slug already exists for this user
    const query = supabase
      .from('collections')
      .select('id')
      .eq('creator_id', userId)
      .eq('slug', slug);

    // In PATCH, exclude the current collection being updated
    if (excludeCollectionId) {
      query.neq('id', excludeCollectionId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Slug check error:', error);
      throw error;
    }

    if (!data) {
      // Slug is available
      return slug;
    }
  }

  // If all retries failed
  throw new Error('Could not generate a unique slug after multiple attempts');
}

export function buildCollectionListItem(
  row: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    public: boolean | null;
    updated_at: string | null;
    collection_analyses:
      | (CollectionAnalysesJoin & { analysis_id?: string })[]
      | null;
  },
  analysisId?: string
): CollectionListItem {
  const links = [...(row.collection_analyses ?? [])].filter(
    (x): x is NonNullable<typeof x> => x != null
  );
  const sorted = links.sort((a, b) => {
    const ta = new Date(a.created_at ?? 0).getTime();
    const tb = new Date(b.created_at ?? 0).getTime();
    return tb - ta;
  });
  const previewUrls = sorted
    .slice(0, 3)
    .map((l) => pickNestedAnalysis(l.analyses))
    .filter(Boolean)
    .map((a) => getAnalysisImageUrl(a!.image_bucket, a!.image_path));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    public: row.public ?? false,
    updated_at: row.updated_at ?? new Date().toISOString(),
    itemCount: links.length,
    previewUrls,
    hasAnalysis: analysisId
      ? links.some((link) => link.analysis_id === analysisId)
      : undefined,
  };
}
