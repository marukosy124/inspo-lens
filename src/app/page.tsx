'use client';

import ColorExtractor from '@/components/color-extractor';
import ImageAnalyzer from '@/components/image-analyzer';
import ImageUploader from '@/components/image-uploader';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<{
    proxy: string;
    original: string;
  } | null>(null);

  const handleOnImageSelect = (newImageUrl: string) => {
    const imageProxyUrl = `/api/image-proxy?url=${encodeURIComponent(newImageUrl)}`;
    setImageUrl({ proxy: imageProxyUrl, original: newImageUrl });
  };
  console.log({ imageUrl });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center  py-32 px-16 bg-white dark:bg-black sm:items-start">
        <ImageUploader onImageSelect={handleOnImageSelect} />
        <div className="flex items-center gap-2">
          {imageUrl && (
            <Image
              src={imageUrl.proxy}
              alt="image"
              width={0}
              height={0}
              sizes="500px"
              className="w-full h-auto"
              priority
            />
          )}
          {imageUrl && <ColorExtractor imageUrl={imageUrl.proxy} />}
        </div>
        {imageUrl && <ImageAnalyzer imageUrl={imageUrl.original} />}
      </main>
    </div>
  );
}
