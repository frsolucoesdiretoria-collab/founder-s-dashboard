// Tracking Helper - Resiliente e desacoplado
// Centraliza todos os eventos de analytics via GTM (dataLayer)
// Falha silenciosamente se dataLayer não existir

/**
 * Dispara um evento de tracking via GTM dataLayer
 * 
 * @param name - Nome do evento (formato snake_case)
 * @param params - Parâmetros adicionais do evento
 * 
 * @example
 * trackEvent('lp_click_entry', { page: 'antivacancia-v1' });
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  // Verificar se dataLayer está disponível
  if (typeof window === 'undefined' || !window.dataLayer) {
    // Ambiente SSR ou dataLayer não carregado - falhar silenciosamente
    return;
  }

  try {
    window.dataLayer.push({
      event: name,
      ...params
    });
    
    // Log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', name, params);
    }
  } catch (error) {
    // Falhar silenciosamente em produção
    if (import.meta.env.DEV) {
      console.warn('⚠️ Failed to track event:', name, error);
    }
  }
}

/**
 * Dispara evento e aguarda delay antes de executar ação
 * Útil para garantir que o evento seja registrado antes de navegação
 * 
 * @param eventName - Nome do evento
 * @param eventParams - Parâmetros do evento
 * @param action - Função a ser executada após o delay
 * @param delay - Delay em ms (padrão: 150ms)
 */
export function trackThenExecute(
  eventName: string,
  eventParams: Record<string, unknown> | undefined,
  action: () => void,
  delay = 150
): void {
  trackEvent(eventName, eventParams);
  
  // Aguardar pequeno delay para garantir registro do evento
  setTimeout(() => {
    action();
  }, delay);
}

// Declaração de tipos global para dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
