import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - InspoLens',
  description: 'Privacy Policy for using InspoLens',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-6">
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

      <article className="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: December 1, 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            What This Tool Does
          </h2>
          <p className="leading-relaxed text-gray-700">
            InspoLens is a simple tool that helps you find visual inspiration.
            You upload an image, and it extracts visual elements (colors,
            keywords, descriptions) to help you discover inspirations more
            effectively.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            What Happens to Your Images
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>1. Processing:</strong> Your images are sent to
              OpenAI&apos;s API for analysis. OpenAI processes the image to
              extract visual information. See{' '}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI&apos;s Privacy Policy
              </a>{' '}
              for how they handle data.
            </p>
            <p>
              <strong>2. Storage:</strong> Images are temporarily stored on my
              Vercel server and automatically deleted after 7 days. No backups
              are kept.
            </p>
            <p>
              <strong>3. No Training:</strong> Your images are not used to train
              any models.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            Third-Party Services
          </h2>
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li>
              <strong>OpenAI:</strong> For image analysis (
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>Vercel:</strong> Hosting provider (
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>
              )
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            That&apos;s It
          </h2>
          <p className="leading-relaxed text-gray-700">
            No accounts, no tracking, no complicated data practices.
          </p>
        </section>
      </article>
    </div>
  );
}
