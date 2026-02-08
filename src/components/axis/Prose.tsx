// Premium Prose Component — Markdown renderer with Apple-like styling

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProseProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const proseSize = {
  sm: 'prose-sm',
  md: 'prose-base',
  lg: 'prose-lg',
};

export const Prose: React.FC<ProseProps> = ({ 
  children, 
  className,
  size = 'md' 
}) => {
  return (
    <div
      className={cn(
        'prose prose-slate max-w-none',
        proseSize[size],
        // Headings
        'prose-headings:font-medium prose-headings:tracking-tight',
        'prose-h1:text-5xl md:prose-h1:text-6xl prose-h1:leading-[1.05] prose-h1:mb-8',
        'prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:leading-tight prose-h2:mb-6 prose-h2:mt-16',
        'prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:leading-snug prose-h3:mb-4 prose-h3:mt-12',
        // Paragraphs
        'prose-p:text-lg md:prose-p:text-xl prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-6',
        'prose-p:tracking-[-0.01em]',
        // Lists
        'prose-ul:my-8 prose-ul:space-y-3',
        'prose-li:text-lg md:prose-li:text-xl prose-li:leading-relaxed prose-li:text-slate-600',
        'prose-li:pl-2 prose-li:marker:text-slate-400',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-slate-900',
        'prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8',
        'prose-blockquote:bg-gradient-to-r prose-blockquote:from-slate-50/50 prose-blockquote:to-transparent',
        'prose-blockquote:rounded-r-lg',
        'prose-blockquote:text-slate-900 prose-blockquote:font-medium',
        'prose-blockquote:shadow-[4px_0_16px_-4px_rgba(0,0,0,0.05)]',
        // Strong/Bold
        'prose-strong:text-slate-900 prose-strong:font-semibold',
        // Links
        'prose-a:text-slate-900 prose-a:no-underline prose-a:font-medium',
        'prose-a:hover:text-slate-600 prose-a:transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
};

// Markdown component helpers

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  level = 2, 
  className 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const levelStyles = {
    1: 'text-5xl md:text-6xl leading-[1.05] mb-8',
    2: 'text-4xl md:text-5xl leading-tight mb-6 mt-16',
    3: 'text-2xl md:text-3xl leading-snug mb-4 mt-12',
  };

  return (
    <Tag
      className={cn(
        'font-medium tracking-tight text-slate-900',
        levelStyles[level],
        className
      )}
    >
      {children}
    </Tag>
  );
};

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

export const Paragraph: React.FC<ParagraphProps> = ({ 
  children, 
  className 
}) => {
  return (
    <p
      className={cn(
        'text-lg md:text-xl leading-relaxed text-slate-600 mb-6 tracking-[-0.01em]',
        className
      )}
    >
      {children}
    </p>
  );
};

interface ListProps {
  children: React.ReactNode;
  className?: string;
}

export const List: React.FC<ListProps> = ({ children, className }) => {
  return (
    <ul className={cn('my-8 space-y-3 list-none', className)}>
      {children}
    </ul>
  );
};

interface ListItemProps {
  children: React.ReactNode;
  animated?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({ 
  children, 
  animated = true 
}) => {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
      <span className="text-lg md:text-xl leading-relaxed text-slate-600">
        {children}
      </span>
    </div>
  );

  if (animated) {
    return (
      <motion.li
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {content}
      </motion.li>
    );
  }

  return <li>{content}</li>;
};

interface BlockquoteProps {
  children: React.ReactNode;
  className?: string;
}

export const Blockquote: React.FC<BlockquoteProps> = ({ 
  children, 
  className 
}) => {
  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        'relative border-l-4 border-slate-900 pl-6 py-4 my-8',
        'bg-gradient-to-r from-slate-50/50 to-transparent rounded-r-lg',
        'shadow-[4px_0_16px_-4px_rgba(0,0,0,0.05)]',
        'text-slate-900 font-medium text-xl md:text-2xl leading-relaxed',
        className
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-900 via-slate-700 to-slate-900 blur-sm" />
      {children}
    </motion.blockquote>
  );
};

interface CheckItemProps {
  children: React.ReactNode;
}

export const CheckItem: React.FC<CheckItemProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-4 p-4 rounded-lg bg-slate-50/50 border border-slate-100"
    >
      <div className="mt-0.5 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <span className="text-lg md:text-xl leading-relaxed text-slate-900 font-medium">
        {children}
      </span>
    </motion.div>
  );
};
