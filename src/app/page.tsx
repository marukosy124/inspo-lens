import ColorExtractor from '@/components/color-extractor';

export default function Home() {
  const source =
    'https://cdn.pixabay.com/photo/2025/11/05/20/57/monastery-9939590_1280.jpg';

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center  py-32 px-16 bg-white dark:bg-black sm:items-start">
        <ColorExtractor imageUrl={source} />
      </main>
    </div>
  );
}
