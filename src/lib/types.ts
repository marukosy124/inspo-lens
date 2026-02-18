import { ExtractedColor } from '@/lib/color-extractor';
import { User } from '@supabase/supabase-js';

/** Used by both API/UI and DB-sourced analyses; ExtractedColor fields optional when from DB */
export type Color = { name: string; hex: string; id?: string } & Partial<
  Omit<ExtractedColor, 'hex'>
>;

export interface ImageAnalysis {
  description: string;
  keywords: string[];
  searchTerm: string;
  colors: Color[];
}

export interface AnalysisCreator {
  id: string;
  username: string | null;
  // display_name: string | null;
  avatar_url: string | null;
  avatar_color: string;
}

export interface ImageInfo {
  id: string;
  imageUrl: string | null;
  proxyUrl?: string | null;
  bucket?: string;
  path?: string;
  analysis?: ImageAnalysis | null;
  isAnalyzing?: boolean;
  error?: string | null;
  analysisId?: string;
  isSaved?: boolean | null;
  creator?: AnalysisCreator | null;
}

export interface UserProfile {
  username?: string | null;
  avatar_url?: string | null;
  avatar_color?: string;
}

export type CompleteUser = UserProfile &
  User & {
    is_official?: boolean;
  };

export interface ErrorResponse {
  error: string;
}
export interface Analysis {
  id: string;
  creator: AnalysisCreator | null;
  search_term: string;
  description: string;
  public: boolean;
  image_path: string;
  image_bucket: string;
  created_at: string;
  updated_at: string;
  colors: Array<{ id: string; hex: string; name: string }>;
  keywords: Array<{ id: string; name: string }>;
  is_saved: boolean | null;
  image_url: string;
}
