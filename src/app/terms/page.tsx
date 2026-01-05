import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - InspoLens',
  description: 'Terms and conditions for using InspoLens',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-5 pt-12 max-w-3xl flex flex-col min-h-screen">
        <Link href="/" className="mb-6 inline-block">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:bg-blue-50 hover:text-gray-500"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-gray-900">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: November 30, 2025
            </p>
          </header>

          <section className="space-y-5 text-gray-700 leading-relaxed">
            <p>By using InspoLens, you agree to these simple terms.</p>

            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Permitted Use</h2>
              <p className="text-sm">
                You may use this tool for personal or professional purposes.
                Upload images, view results, and share them if you wish.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Prohibited Actions</h2>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>
                  Uploading illegal, harmful, or copyrighted content without
                  permission
                </li>
                <li>
                  Attempting to overload, scrape, or reverse-engineer the
                  service
                </li>
                <li>
                  Abusing rate limits or disrupting availability for others
                </li>
                <li>Using the service in any unlawful or disrespectful way</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-lg">No Warranty</h2>
              <p className="text-sm">
                This is a free tool provided as-is. I aim to keep it running,
                but offer no guarantees of uptime or accuracy.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Changes to Terms</h2>
              <p className="text-sm">
                These terms may be updated. Continued use means you accept the
                current version.
              </p>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
