'use client';

import { motion } from 'motion/react';
import { SearchX, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnalysisNotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-stone-50 to-stone-100/50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 shadow-lg">
              <SearchX className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
        >
          Analysis Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-md mx-auto mb-8 max-w-md text-stone-600"
        >
          This analysis doesn&apos;t exist or may have been removed.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Button
            onClick={() => router.back()}
            size="lg"
            variant="outline"
            className="border-stone-200 backdrop-blur-sm transition-all duration-300 hover:border-stone-300 hover:bg-stone-50/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={2.5} />
            Go Back
          </Button>

          <Link href="/">
            <Button
              size="lg"
              className="bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              <Home className="mr-2 h-4 w-4" strokeWidth={2.5} />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Decorative suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 border-t border-stone-200 pt-8"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
            <h3 className="text-sm font-semibold text-stone-900">
              Looking for inspiration?
            </h3>
          </div>
          <p className="mb-4 text-sm text-stone-600">
            Upload an image or browse our analyses to discover color palettes
            and creative ideas
          </p>
          <Link href="/">
            <Button
              variant="ghost"
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              Explore Now →
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
