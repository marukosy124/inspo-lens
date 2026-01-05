import { ExtractedColor } from '@/lib/color-extractor';

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
