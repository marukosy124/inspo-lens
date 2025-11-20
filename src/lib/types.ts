export interface ImageAnalysis {
  description: string;
  keywords: string[];
  searchTerm: string;
}

export interface ImageInfo {
  id: string;
  imageUrl: string | null;
  proxyUrl: string | null;
  analysis?: ImageAnalysis | null;
  isAnalyzing?: boolean;
  error?: string | null;
}
