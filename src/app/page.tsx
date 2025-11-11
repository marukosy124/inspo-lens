import ColorExtractor from '@/components/color-extractor';
import ImageAnalyzer from '@/components/image-analyzer';
import Image from 'next/image';

export default function Home() {
  const source =
    'https://cdn.pixabay.com/photo/2025/11/05/20/57/monastery-9939590_1280.jpg';
  const imageProxyUrl = `/api/image-proxy?url=${encodeURIComponent(source)}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center  py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex items-center gap-2">
          <Image
            src={imageProxyUrl}
            alt="image"
            width={0}
            height={0}
            sizes="500px"
            className="w-full h-auto"
            priority
          />
          <ColorExtractor imageUrl={imageProxyUrl} />
        </div>
        <ImageAnalyzer imageUrl={source} />
      </main>
    </div>
  );
}
