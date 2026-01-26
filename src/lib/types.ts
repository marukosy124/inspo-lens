import { ExtractedColor } from '@/lib/color-extractor';
import { User } from '@supabase/supabase-js';

export type Color = ExtractedColor & { name: string };

export interface ImageAnalysis {
  description: string;
  keywords: string[];
  searchTerm: string;
  colors: Color[];
}

export interface ImageInfo {
  id: string;
  imageUrl: string | null;
  proxyUrl: string | null;
  analysis?: ImageAnalysis | null;
  isAnalyzing?: boolean;
  error?: string | null;
}

export type CompleteUser = UserProfile & User;
export interface UserProfile {
  username?: string | null;
  avatar_url?: string | null;
  avatar_color?: string;
}
