// Sticky CTA — Aparece após 30% de scroll

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface StickyCTAProps {
  text: string;
  onClick: () => void;
  threshold?: number; // Percentage of scroll to show (default 30%)
  className?: string;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({
  text,
  onClick,
  threshold = 0.3,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setIsVisible(latest > threshold);
    });
    return unsubscribe;
  }, [scrollYProgress, threshold]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30 
          }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 ${className}`}
        >
          <Button
            size="lg"
            onClick={onClick}
            className="h-14 px-8 text-base bg-slate-900 hover:bg-slate-800 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group backdrop-blur-sm"
          >
            {text}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
