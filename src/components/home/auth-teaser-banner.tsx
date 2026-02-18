'use client';

import SignInButton from '@/components/auth/sign-in-button';
import SignUpButton from '@/components/auth/sign-up-button';
import { motion } from 'motion/react';

export default function AuthTeaserBanner() {
  return (
    <motion.div
      className="pointer-events-none absolute right-0 -bottom-1 left-0 z-30 flex w-full justify-center"
      style={{
        transform: 'translateY(20%)', // your original overlap
      }}
      variants={{
        hidden: {
          opacity: 0,
          y: 80, // starts 80px below
          scale: 0.96, // slightly smaller for subtle pop
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1], // nice overshoot/spring feel
          },
        },
      }}
      initial="hidden"
      animate="visible" // control visibility via parent mount/unmount
      exit={{ opacity: 0, y: 40, transition: { duration: 0.4 } }} // optional smooth hide
    >
      <div className="pointer-events-auto relative w-full max-w-2xl px-5 md:px-10 lg:px-12">
        {/* Glass morphism background with subtle gradient */}
        <div className="absolute inset-0 rounded-3xl border border-white/60 bg-linear-to-t from-white/90 via-white/80 to-white/40 shadow-2xl shadow-stone-900/5 backdrop-blur-xl" />

        {/* Ambient glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-indigo-500/5 via-transparent to-purple-500/5" />

        {/* Content */}
        <div className="relative z-10 px-6 py-10 text-center md:px-8">
          <div className="space-y-1.5">
            <h3 className="bg-linear-to-br from-stone-900 via-stone-800 to-stone-700 bg-clip-text text-xl leading-tight font-bold text-transparent md:text-2xl">
              Discover more inspiration
            </h3>

            <p className="mx-auto max-w-xl text-sm leading-relaxed font-light text-stone-600/90 md:text-base">
              Create a free account to save analyses and explore without limits.
            </p>

            <div className="mx-auto flex max-w-sm flex-col justify-center gap-2.5 pt-1.5 sm:flex-row">
              <SignUpButton className="w-full sm:w-auto" />
              <SignInButton className="w-full sm:w-auto" />
            </div>

            <p className="pt-0.5 text-xs font-light text-stone-500/80">
              Takes less than a minute to get started
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
