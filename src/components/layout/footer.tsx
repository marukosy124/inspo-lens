import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-400">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left: Built by */}
          <p className="text-sm">
            Built by{' '}
            <a
              href="https://www.soniayeung.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white"
            >
              Sonia Yeung
            </a>
          </p>

          {/* Center: Legal Links */}
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>

          {/* Right: Support */}
          {/* <a
            href="https://forms.gle/your-google-form-link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-white transition-colors"
          >
            Support / Feedback
          </a> */}
        </div>
      </div>
    </footer>
  );
}
