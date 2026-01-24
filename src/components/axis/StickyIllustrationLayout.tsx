// Sticky Illustration Wrapper — Desktop sticky, mobile stack

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StickyIllustrationLayoutProps {
  illustration: React.ReactNode;
  content: React.ReactNode;
  illustrationSide?: 'left' | 'right';
  className?: string;
}

export const StickyIllustrationLayout: React.FC<StickyIllustrationLayoutProps> = ({
  illustration,
  content,
  illustrationSide = 'left',
  className,
}) => {
  const isLeft = illustrationSide === 'left';

  return (
    <div className={cn('grid lg:grid-cols-2 gap-12 items-start', className)}>
      {/* Illustration - Sticky on desktop */}
      <motion.div
        className={cn(
          'lg:sticky lg:top-24 lg:self-start',
          'flex items-center justify-center',
          isLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2'
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          {illustration}
        </div>
      </motion.div>

      {/* Content - Scrolls naturally */}
      <div className={cn(
        'space-y-8',
        isLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1'
      )}>
        {content}
      </div>
    </div>
  );
};
