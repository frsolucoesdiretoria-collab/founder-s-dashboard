/**
 * Substitui o conteúdo de um elemento por um spinner de carregamento.
 * @param {HTMLElement} element
 */
export function showLoading(element) {
  element.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
  `
}

/**
 * Exibe mensagem de estado vazio dentro de um elemento.
 * @param {HTMLElement} element
 * @param {string} message
 */
export function showEmpty(element, message = 'Nenhum item encontrado.') {
  element.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
      <span class="material-symbols-outlined text-5xl mb-4 opacity-40">inbox</span>
      <p class="text-sm font-medium">${message}</p>
    </div>
  `
}

/**
 * Exibe mensagem de erro dentro de um elemento.
 * @param {HTMLElement} element
 * @param {string} message
 */
export function showError(element, message = 'Ocorreu um erro. Tente novamente.') {
  element.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 text-error">
      <span class="material-symbols-outlined text-5xl mb-4">error</span>
      <p class="text-sm font-medium">${message}</p>
    </div>
  `
}

/**
 * Formata uma string de data para pt-BR (ex: "14 abr 2026").
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace('.', '')
}

/**
 * Formata uma string de data e hora para pt-BR (ex: "14 abr 2026, 09:30").
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace('.', '')
}

/**
 * Retorna HTML de badge colorido para status de work_log.
 * @param {'Concluido'|'Parcial'|'Pendente'|string} status
 * @returns {string}
 */
export function statusBadge(status) {
  const map = {
    'Concluido': { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', label: 'Concluído' },
    'Parcial':   { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Parcial' },
    'Pendente':  { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', label: 'Pendente' },
  }
  const style = map[status] || { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: status || '—' }
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}">${style.label}</span>`
}

/**
 * Retorna HTML de badge de categoria com a cor hex fornecida.
 * @param {string} nome
 * @param {string} cor  Cor em hex (ex: "#FAC826")
 * @returns {string}
 */
export function categoryBadge(nome, cor) {
  if (!nome) return ''
  const safeCor = cor || '#E5E7EB'
  // Calcular se o texto deve ser escuro ou claro com base na luminância da cor de fundo
  const hex = safeCor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const textColor = luminance > 0.5 ? '#1A1A1A' : '#FFFFFF'
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style="background-color: ${safeCor}; color: ${textColor};">${nome}</span>`
}
