import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-400">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left: Copyright */}
          <p className="text-center text-sm md:text-left">
            © {new Date().getFullYear()} InspoLens. All rights reserved.
          </p>

          {/* Center: Legal Links */}
          <div className="flex gap-6 text-sm">
            <a
              href="mailto:inspolensco@gmail.com"
              className="text-sm transition-colors hover:text-white"
            >
              Contact
            </a>
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
        </div>
      </div>
    </footer>
  );
}
