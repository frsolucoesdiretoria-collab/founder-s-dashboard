// AXIS Tempo Real — Configuration
// Centralized config for CTAs, links, and fallbacks

export const axisTempoRealConfig = {
  // Contact links
  whatsapp: {
    number: '5511999999999',
    message: 'Quero saber mais sobre o Axis Tempo Real',
    get link() {
      return `https://wa.me/${this.number}?text=${encodeURIComponent(this.message)}`;
    },
  },
  
  calendly: {
    url: 'https://calendly.com/axis-tempo-real/diagnostico', // Placeholder
    fallback: '#contato',
  },
  
  email: {
    address: 'contato@axis.com.br', // Placeholder
    subject: 'Interesse em Axis Tempo Real',
    get link() {
      return `mailto:${this.address}?subject=${encodeURIComponent(this.subject)}`;
    },
  },

  // CTA texts
  cta: {
    primary: 'Quero enxergar meu desperdício',
    secondary: 'Ver como funciona',
    sticky: 'Começar diagnóstico',
    footer: 'Começar diagnóstico agora',
  },

  // Social proof (optional)
  socialProof: {
    enabled: false,
    stats: [
      { value: '30+', label: 'Empresas' },
      { value: '1000+', label: 'Horas economizadas' },
      { value: '85%', label: 'Redução de desperdício' },
    ],
  },

  // Feature flags
  features: {
    scrollProgress: true,
    stickyCTA: true,
    stickyIllustrations: true,
    prefersReducedMotion: true,
  },
} as const;

export type AxisTempoRealConfig = typeof axisTempoRealConfig;
