import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - InspoLens',
  description: 'Privacy Policy for using InspoLens',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-6">
      <Link href="/" className="inline-block">
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-1 text-sm text-gray-600">
            Last updated: February 24, 2026
          </p>
        </div>

        <section className="space-y-5 leading-relaxed text-gray-700">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">What This Tool Does</h2>
            <p className="text-sm">
              InspoLens allows you to upload images, generate visual analyses
              (colors, keywords, descriptions), and save them to your account
              for future reference.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">What Data We Store</h2>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Your account information</li>
              <li>Uploaded images</li>
              <li>Generated analysis results</li>
              <li>Saved analyses associated with your account</li>
            </ul>
            <p className="text-sm">
              This data is stored securely using Supabase infrastructure.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              How Your Images Are Processed
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong>1. Processing:</strong> Your uploaded images are sent to
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
                for details on how they handle data.
              </p>
              <p>
                <strong>2. Storage:</strong> Uploaded images and analysis
                results are stored securely in Supabase storage and remain
                associated with your account until you delete them.
              </p>
              <p>
                <strong>3. Model Training:</strong> InspoLens does not use your
                uploaded images or analysis data to train any machine learning
                models internally. Images are processed via OpenAI&apos;s API,
                and their data handling practices are governed by OpenAI&apos;s
                Privacy Policy.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Third-Party Services</h2>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>
                <strong>OpenAI:</strong> Image analysis (
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
                <strong>Supabase:</strong> Authentication, database, and storage
                (
                <a
                  href="https://supabase.com/privacy"
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
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Data Control & Contact</h2>
            <p className="text-sm">
              If you wish to delete your data or have any questions about your
              privacy, please contact us at{' '}
              <a
                href="mailto:inspolensco@gmail.com"
                className="text-blue-600 hover:underline"
              >
                inspolensco@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
