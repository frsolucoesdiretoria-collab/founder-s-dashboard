// Premium Navigation Bar — Minimal & Elegant

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  onCTAClick?: () => void;
  ctaText?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  onCTAClick,
  ctaText = 'Começar agora',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  );

  const borderOpacity = useTransform(
    scrollY,
    [0, 50],
    [0, 0.1]
  );

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    return unsubscribe;
  }, [scrollY]);

  return (
    <>
      <motion.nav
        style={{
          backgroundColor,
          borderBottomColor: useTransform(
            borderOpacity,
            (opacity) => `rgba(0, 0, 0, ${opacity})`
          ),
        }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-300',
          'border-b backdrop-blur-xl',
          isScrolled && 'shadow-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-900" />
                <span className="font-medium text-slate-900 tracking-tight text-lg">
                  AXIS Tempo Real
                </span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Button
                onClick={onCTAClick}
                size="sm"
                className={cn(
                  'h-10 px-5 text-sm font-medium',
                  'bg-slate-900 hover:bg-slate-800',
                  'rounded-full shadow-sm hover:shadow-md',
                  'transition-all duration-300',
                  'group'
                )}
              >
                {ctaText}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Spacer to prevent content jump */}
      <div className="h-16 md:h-20" />
    </>
  );
};
