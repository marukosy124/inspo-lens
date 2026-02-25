import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - InspoLens',
  description: 'Terms and conditions for using InspoLens',
};

export default function TermsPage() {
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

      <article className="space-y-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-1 text-sm text-gray-600">
            Last updated: February 24, 2026
          </p>
        </div>

        <section className="space-y-5 leading-relaxed text-gray-700">
          <p>
            By creating an account or using InspoLens, you agree to these terms.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Accounts</h2>
            <p className="text-sm">
              You are responsible for maintaining the confidentiality of your
              account and for all activity that occurs under your account.
              Please use accurate information when registering.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Permitted Use</h2>
            <p className="text-sm">
              You may use InspoLens for personal or professional purposes. You
              may upload images, generate analyses, and save results within your
              account.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">User Content</h2>
            <p className="text-sm">
              You retain ownership of the images you upload. You are responsible
              for ensuring you have the right to upload and use any content
              submitted to the service.
            </p>
            <p className="text-sm">
              By uploading content, you grant InspoLens permission to process
              and store it for the purpose of providing the service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Prohibited Actions</h2>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>
                Uploading illegal, harmful, or copyrighted content without
                proper permission
              </li>
              <li>
                Attempting to overload, scrape, reverse-engineer, or disrupt the
                service
              </li>
              <li>
                Abusing rate limits or attempting unauthorized access to
                accounts or data
              </li>
              <li>Using the service in any unlawful or abusive manner</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Third-Party Services</h2>
            <p className="text-sm">
              InspoLens relies on third-party providers including OpenAI,
              Supabase, and Vercel to operate. Your use of the service is also
              subject to the applicable terms and policies of those providers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">No Warranty</h2>
            <p className="text-sm">
              InspoLens is provided on an “as-is” and “as-available” basis.
              While we aim to keep the service reliable, we do not guarantee
              uptime, availability, or the accuracy of analysis results.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Limitation of Liability</h2>
            <p className="text-sm">
              To the maximum extent permitted by law, InspoLens shall not be
              liable for any indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Account Termination</h2>
            <p className="text-sm">
              You may request deletion of your account and associated data by
              contacting{' '}
              <a
                href="mailto:inspolensco@gmail.com"
                className="text-blue-600 hover:underline"
              >
                inspolensco@gmail.com
              </a>
              . We reserve the right to suspend or terminate accounts that
              violate these terms.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Changes to Terms</h2>
            <p className="text-sm">
              These terms may be updated from time to time. Continued use of the
              service after updates means you accept the revised terms.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
