import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-sm"
      style={{ WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="container mx-5 flex items-center h-15 select-none">
        <Link
          href="/"
          className="flex items-center space-x-3 group"
          tabIndex={-1}
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="text-xl md:text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight group-hover:underline">
            InspoLens
          </span>
        </Link>
      </div>
    </header>
  );
}
