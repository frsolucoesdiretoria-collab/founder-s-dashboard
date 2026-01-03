import { useEffect, useRef } from 'react';

/**
 * Hook para sincronizar Goals do CRM automaticamente
 * Sincroniza quando o componente monta e periodicamente
 * @param enabled - Se a sincronização está habilitada
 * @param onSyncComplete - Callback opcional chamado após sincronização bem-sucedida
 */
export function useSyncCRMGoals(enabled: boolean = true, onSyncComplete?: () => void) {
  const onSyncCompleteRef = useRef(onSyncComplete);
  
  // Atualizar ref quando callback muda
  useEffect(() => {
    onSyncCompleteRef.current = onSyncComplete;
  }, [onSyncComplete]);

  useEffect(() => {
    if (!enabled) return;

    // Sincronizar imediatamente ao montar (com pequeno delay para não bloquear render inicial)
    const timeout = setTimeout(() => {
      syncGoals(onSyncCompleteRef.current);
    }, 500);

    // Sincronizar a cada 30 segundos (opcional, para manter atualizado)
    const interval = setInterval(() => {
      syncGoals(onSyncCompleteRef.current);
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [enabled]);
}

async function syncGoals(onSyncComplete?: () => void) {
  try {
    const response = await fetch('/api/crm/sync-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Goals sincronizadas:', data);
      // Chamar callback se fornecido
      if (onSyncComplete) {
        onSyncComplete();
      }
    }
  } catch (error) {
    // Silencioso - não queremos interromper a UI
    console.debug('Sync goals error (non-blocking):', error);
  }
}

