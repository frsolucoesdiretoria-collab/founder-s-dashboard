/**
 * AXIS ANTIVACÂNCIA - Main JavaScript
 * Funções de tracking, webhook e utilidades
 */

// ============================================
// CONFIGURAÇÃO - ALTERAR AQUI
// ============================================

const CONFIG = {
  // Webhook URL para receber leads (n8n, Make, Zapier, etc)
  // ⚠️ CONFIGURAR COM URL REAL
  webhookUrl: window.location.origin + '/api/axis-v3/lead',
  
  // URL para notificação de novo lead (Telegram/WhatsApp)
  // ⚠️ CONFIGURAR COM URL REAL  
  notifyUrl: window.location.origin + '/api/axis-v3/notify',
  
  // Google Analytics Measurement ID
  gaId: 'G-XXXXXXXXXX',
  
  // Google Ads Conversion ID
  gadsId: 'AW-XXXXXXXXX',
  
  // Checkouts Mercado Pago
  checkouts: {
    avista: 'https://mpago.la/2mox6KZ',              // R$1.997 à vista
    entrada: 'https://mpago.la/29M9mhq',             // R$1.000 entrada (entrada + R$1.500 + 12x R$99)
    completo: 'https://mpago.la/164FDaK'             // R$4.000 (antigo)
  }
};

// ============================================
// FUNÇÕES DE ARMAZENAMENTO LOCAL
// ============================================

/**
 * Salva lead no localStorage como backup
 */
function saveLeadLocal(data) {
  try {
    localStorage.setItem('axis_lead', JSON.stringify(data));
    
    // Também salva em array de todos os leads (para debug)
    const allLeads = JSON.parse(localStorage.getItem('axis_all_leads') || '[]');
    allLeads.push({ ...data, savedAt: new Date().toISOString() });
    localStorage.setItem('axis_all_leads', JSON.stringify(allLeads));
    
    console.log('[Axis] Lead salvo localmente:', data);
    return true;
  } catch (e) {
    console.error('[Axis] Erro ao salvar lead:', e);
    return false;
  }
}

/**
 * Recupera último lead do localStorage
 */
function getLeadLocal() {
  try {
    return JSON.parse(localStorage.getItem('axis_lead') || '{}');
  } catch (e) {
    return {};
  }
}

// ============================================
// FUNÇÕES DE WEBHOOK
// ============================================

/**
 * Envia dados do lead para webhook
 */
async function sendToWebhook(data) {
  if (!CONFIG.webhookUrl || CONFIG.webhookUrl.includes('SEU_WEBHOOK')) {
    console.warn('[Axis] Webhook não configurado. Dados salvos apenas localmente.');
    return false;
  }
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        source: 'landing-page',
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href
      })
    });
    
    if (response.ok) {
      console.log('[Axis] Lead enviado para webhook com sucesso');
      return true;
    } else {
      console.error('[Axis] Erro no webhook:', response.status);
      return false;
    }
  } catch (e) {
    console.error('[Axis] Erro ao enviar para webhook:', e);
    return false;
  }
}

/**
 * Envia notificação de novo lead (para você receber no Telegram/WhatsApp)
 */
async function notifyNewLead(data) {
  if (!CONFIG.notifyUrl || CONFIG.notifyUrl.includes('SEU_WEBHOOK')) {
    return false;
  }
  
  try {
    const message = `🚨 NOVO LEAD AXIS!\n\n` +
      `👤 ${data.nome}\n` +
      `📱 ${data.whatsapp}\n` +
      `🏥 ${data.clinica || 'Não informada'}\n` +
      `📧 ${data.email}\n` +
      `💰 Tipo: ${data.tipo}\n` +
      `📄 Página: ${data.page}\n\n` +
      `⏰ ${new Date().toLocaleString('pt-BR')}\n\n` +
      `👉 Chame agora: https://wa.me/55${data.whatsapp.replace(/\D/g, '')}`;
    
    await fetch(CONFIG.notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lead: data })
    });
    
    return true;
  } catch (e) {
    console.error('[Axis] Erro ao notificar:', e);
    return false;
  }
}

// ============================================
// FUNÇÕES DE TRACKING
// ============================================

/**
 * Dispara evento para Google Analytics 4
 */
function trackGA4Event(eventName, params = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, params);
    console.log('[Axis] GA4 Event:', eventName, params);
  }
}

/**
 * Dispara conversão para Google Ads
 */
function trackGAdsConversion(conversionLabel, value = 0) {
  if (typeof gtag !== 'undefined' && CONFIG.gadsId) {
    gtag('event', 'conversion', {
      'send_to': `${CONFIG.gadsId}/${conversionLabel}`,
      'value': value,
      'currency': 'BRL'
    });
    console.log('[Axis] GAds Conversion:', conversionLabel, value);
  }
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata telefone para padrão brasileiro
 */
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Valida telefone brasileiro
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Valida email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// MÁSCARAS DE INPUT
// ============================================

/**
 * Aplica máscara de telefone em tempo real
 */
function applyPhoneMask(input) {
  input.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
      value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    e.target.value = value;
  });
}

// Aplica máscara em todos os campos de WhatsApp ao carregar
document.addEventListener('DOMContentLoaded', function() {
  const phoneInputs = document.querySelectorAll('input[name="whatsapp"], input[type="tel"]');
  phoneInputs.forEach(applyPhoneMask);
});

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Gera ID único para lead
 */
function generateLeadId() {
  return 'AXIS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Obtém parâmetros da URL (UTMs, etc)
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    gclid: params.get('gclid') || '',
    fbclid: params.get('fbclid') || ''
  };
}

/**
 * Salva UTMs no localStorage para persistir entre páginas
 */
function saveUtmParams() {
  const params = getUrlParams();
  if (Object.values(params).some(v => v)) {
    localStorage.setItem('axis_utm', JSON.stringify(params));
  }
}

/**
 * Recupera UTMs salvos
 */
function getSavedUtmParams() {
  try {
    return JSON.parse(localStorage.getItem('axis_utm') || '{}');
  } catch (e) {
    return {};
  }
}

// Salva UTMs ao carregar página
saveUtmParams();

// ============================================
// SCROLL TRACKING
// ============================================

let maxScroll = 0;
let scrollMilestones = [25, 50, 75, 90, 100];

window.addEventListener('scroll', function() {
  const scrollPercent = Math.round(
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  );
  
  if (scrollPercent > maxScroll) {
    maxScroll = scrollPercent;
    
    scrollMilestones.forEach(milestone => {
      if (scrollPercent >= milestone && !window['scrolled_' + milestone]) {
        window['scrolled_' + milestone] = true;
        trackGA4Event('scroll_depth', { percent: milestone });
      }
    });
  }
});

// ============================================
// TEMPO NA PÁGINA
// ============================================

let pageLoadTime = Date.now();

window.addEventListener('beforeunload', function() {
  const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
  trackGA4Event('time_on_page', { seconds: timeOnPage });
});

// ============================================
// EXPORT PARA USO GLOBAL
// ============================================

window.AxisTracker = {
  saveLeadLocal,
  getLeadLocal,
  sendToWebhook,
  notifyNewLead,
  trackGA4Event,
  trackGAdsConversion,
  formatPhone,
  isValidPhone,
  isValidEmail,
  generateLeadId,
  getUrlParams,
  getSavedUtmParams,
  CONFIG
};

console.log('[Axis] Tracker carregado. Config:', CONFIG);
