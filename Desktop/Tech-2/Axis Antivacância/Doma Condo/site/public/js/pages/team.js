import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, formatDate } from '../ui.js'

async function init() {
  await requireAuth()
  await loadTeam()
}

async function loadTeam() {
  const grid = document.getElementById('team-grid')
  if (!grid) return

  showLoading(grid)

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .order('nome')

  if (error) {
    grid.innerHTML = `
      <div class="col-span-3 flex flex-col items-center justify-center py-16 text-error">
        <span class="material-symbols-outlined text-5xl mb-4">error</span>
        <p class="text-sm font-medium">Erro ao carregar equipe. Tente recarregar a página.</p>
      </div>
    `
    return
  }

  if (!employees || employees.length === 0) {
    grid.innerHTML = `
      <div class="col-span-3 flex flex-col items-center justify-center py-16 text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl mb-4 opacity-40">group</span>
        <p class="text-sm font-medium">Nenhuma funcionária cadastrada ainda.</p>
      </div>
    `
    return
  }

  grid.innerHTML = employees.map(emp => buildCard(emp)).join('')
}

function buildCard(emp) {
  const initials = (emp.nome || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isAtiva = emp.ativa !== false
  const statusBadge = isAtiva
    ? `<span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-wider">ATIVO</span>`
    : `<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">INATIVO</span>`

  const cargo = escapeHtml(emp.cargo || 'Colaboradora')

  return `
    <div class="group bg-surface-container-lowest rounded-xl p-8 transition-all duration-300 hover:ring-2 hover:ring-primary-container shadow-[0px_12px_32px_rgba(25,28,30,0.04)] flex flex-col relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
      <div class="flex justify-between items-start mb-6 relative">
        <div class="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xl ring-4 ring-surface">
          ${initials}
        </div>
        ${statusBadge}
      </div>
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-on-surface mb-1">${escapeHtml(emp.nome)}</h3>
        <p class="text-on-surface-variant text-sm font-medium">${cargo}</p>
      </div>
      <div class="space-y-3 mb-8">
        ${emp.email ? `
        <div class="flex items-center gap-2 bg-surface-container-low/50 p-3 rounded-lg">
          <span class="material-symbols-outlined text-primary text-lg" data-icon="mail">mail</span>
          <span class="text-xs font-medium text-on-surface-variant truncate">${escapeHtml(emp.email)}</span>
        </div>` : ''}
        ${emp.telefone_whatsapp ? `
        <div class="flex items-center gap-2 bg-surface-container-low/50 p-3 rounded-lg">
          <span class="material-symbols-outlined text-primary text-lg" data-icon="phone">phone</span>
          <span class="text-xs font-medium text-on-surface-variant">${escapeHtml(emp.telefone_whatsapp)}</span>
        </div>` : ''}
      </div>
      <a href="team-detail.html?id=${emp.id}" class="mt-auto block w-full py-3 rounded-lg border border-outline-variant/30 text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors text-center">
        Ver Detalhes
      </a>
    </div>
  `
}

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

init()
