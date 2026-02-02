import Header from '@/components/layout/header';
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
      <main className="container mx-auto flex min-h-screen max-w-3xl flex-col px-5 pt-12">
        <Link href="/" className="mb-6 inline-block">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:bg-blue-50 hover:text-gray-500"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="space-y-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Terms of Service
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Last updated: November 30, 2025
            </p>
          </div>

          <section className="space-y-5 leading-relaxed text-gray-700">
            <p>By using InspoLens, you agree to these simple terms.</p>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Permitted Use</h2>
              <p className="text-sm">
                You may use this tool for personal or professional purposes.
                Upload images, view results, and share them if you wish.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Prohibited Actions</h2>
              <ul className="list-inside list-disc space-y-1 text-sm">
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
              <h2 className="text-lg font-semibold">No Warranty</h2>
              <p className="text-sm">
                This is a free tool provided as-is. I aim to keep it running,
                but offer no guarantees of uptime or accuracy.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Changes to Terms</h2>
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
