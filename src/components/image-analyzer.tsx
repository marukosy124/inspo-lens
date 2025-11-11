'use client';

import { useEffect, useState } from 'react';

interface ImageAnalyzerProps {
  imageUrl: string;
}

const ImageAnalyzer = ({ imageUrl }: ImageAnalyzerProps) => {
  const [description, setDescription] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function analyzeImage() {
      setIsLoading(true);
      fetch('/api/image-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to analyze image');
          return res.json();
        })
        .then((data) => {
          setDescription(data.description);
          setKeywords(data.keywords);
        })
        .catch((error) => console.error('Error analyze image:', error))
        .finally(() => setIsLoading(false));
    }
    analyzeImage();
  }, [imageUrl]);

  return (
    <div>
      {isLoading && 'loading...'}
      {description}

      <div className="mt-5">{keywords.join(', ')}</div>
    </div>
  );
};

export default ImageAnalyzer;
