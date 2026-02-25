'use client';

import { motion, MotionStyle, Variants } from 'motion/react';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  once?: boolean; // animate only once (default: true)
  amount?: number; // 0–1 → how much of element must be in view (default 0.3)
  delay?: number;
  margin?: string; // e.g. "-100px" = reveal 100px earlier
  style?: MotionStyle;
}

const defaultVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function ScrollReveal({
  children,
  variants = defaultVariants,
  className = '',
  once = true,
  amount = 0.2, // trigger when ~20% of element is visible
  delay = 0,
  margin = '0px',
  style,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin }}
      variants={variants}
      transition={{ delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
