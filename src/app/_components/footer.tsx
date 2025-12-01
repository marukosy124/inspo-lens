import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left: Built by */}
          <p className="text-sm">
            Built by{' '}
            <a
              href="https://www.soniayeung.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold"
            >
              Sonia Yeung
            </a>
          </p>

          {/* Center: Legal Links */}
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
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
