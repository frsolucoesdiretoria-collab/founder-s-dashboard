// AXIS TEMPO REAL — Design System Tokens (V1.2)
// Premium design tokens inspired by Apple/Linear/Stripe

export const designTokens = {
  // Spacing (8px grid)
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem',   // 64px
    '3xl': '6rem',   // 96px
    '4xl': '8rem',   // 128px
    '5xl': '12rem',  // 192px
  },

  // Border radius
  radius: {
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    full: '9999px',
  },

  // Shadows (subtle, premium)
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.02)',
    sm: '0 2px 4px 0 rgb(0 0 0 / 0.03)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.08)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.02)',
  },

  // Typography scale
  typography: {
    display: {
      fontSize: 'clamp(3rem, 8vw, 6rem)',      // 48-96px
      lineHeight: '1',
      letterSpacing: '-0.03em',
      fontWeight: '500',
    },
    h1: {
      fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',  // 40-72px
      lineHeight: '1.05',
      letterSpacing: '-0.025em',
      fontWeight: '500',
    },
    h2: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',    // 32-56px
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      fontWeight: '500',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', // 24-36px
      lineHeight: '1.2',
      letterSpacing: '-0.015em',
      fontWeight: '500',
    },
    body: {
      lg: {
        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', // 18-24px
        lineHeight: '1.6',
        letterSpacing: '-0.01em',
      },
      md: {
        fontSize: 'clamp(1rem, 2vw, 1.25rem)',      // 16-20px
        lineHeight: '1.65',
        letterSpacing: '-0.008em',
      },
      sm: {
        fontSize: '0.875rem',                       // 14px
        lineHeight: '1.5',
        letterSpacing: '0',
      },
    },
  },

  // Colors (semantic)
  colors: {
    background: {
      primary: 'hsl(0, 0%, 100%)',
      secondary: 'hsl(210, 40%, 98%)',
      tertiary: 'hsl(210, 40%, 96%)',
    },
    text: {
      primary: 'hsl(222, 47%, 11%)',
      secondary: 'hsl(215, 16%, 46%)',
      tertiary: 'hsl(215, 20%, 65%)',
    },
    border: {
      subtle: 'hsl(210, 40%, 94%)',
      default: 'hsl(212, 26%, 83%)',
    },
    accent: {
      primary: 'hsl(222, 47%, 11%)',
      glow: 'hsl(200, 98%, 39%)',
    },
  },

  // Blur values
  blur: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
  },

  // Animation durations
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '800ms',
  },

  // Easing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export type DesignTokens = typeof designTokens;
