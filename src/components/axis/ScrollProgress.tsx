// Scroll Progress Indicator — Discreto e premium

import React from 'react';
import { motion, useScroll, useSpring, MotionValue } from 'framer-motion';

interface ScrollProgressProps {
  position?: 'top' | 'left';
  className?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ 
  position = 'top',
  className 
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (position === 'left') {
    return (
      <motion.div
        className={`fixed left-0 top-0 bottom-0 w-1 bg-slate-200 z-50 ${className}`}
        style={{ originY: 0 }}
      >
        <motion.div
          className="w-full bg-slate-900 origin-top"
          style={{ scaleY: scrollYProgress }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50 ${className}`}
      style={{ originX: 0 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 origin-left"
        style={{ scaleX }}
      />
    </motion.div>
  );
};
