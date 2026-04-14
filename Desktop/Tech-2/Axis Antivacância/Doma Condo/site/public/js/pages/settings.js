import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, formatDate } from '../ui.js'

async function init() {
  await requireAuth()
  await Promise.all([
    loadOrganization(),
    loadTeamMembers(),
  ])
  bindSaveButton()
  initTabs()
  initNotificationToggles()
  bindManagePlanButton()
}

async function loadOrganization() {
  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', ORG_ID)
    .single()

  if (error || !org) {
    showToast('Erro ao carregar dados da organização.', 'error')
    return
  }

  fillOrgForm(org)
}

function fillOrgForm(org) {
  const fields = {
    'field-nome': org.nome,
    'field-cnpj': org.cnpj,
    'field-email': org.email_contato,
    'field-telefone': org.telefone,
  }

  for (const [id, value] of Object.entries(fields)) {
    const el = document.getElementById(id)
    if (el && value !== null && value !== undefined) {
      el.value = value
    }
  }
}

function bindSaveButton() {
  const btn = document.getElementById('btn-save-org')
  if (!btn) return

  btn.addEventListener('click', async () => {
    const nome = document.getElementById('field-nome')?.value?.trim()
    const emailContato = document.getElementById('field-email')?.value?.trim()
    const telefone = document.getElementById('field-telefone')?.value?.trim()

    if (!nome) {
      showToast('O nome da empresa é obrigatório.', 'error')
      return
    }

    btn.disabled = true
    btn.innerHTML = `<span class="animate-spin material-symbols-outlined text-sm">progress_activity</span> Salvando...`

    const { error } = await supabase
      .from('organizations')
      .update({ nome, email_contato: emailContato, telefone })
      .eq('id', ORG_ID)

    btn.disabled = false
    btn.innerHTML = `<span>Salvar Alterações</span><span class="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>`

    if (error) {
      showToast('Erro ao salvar alterações. Tente novamente.', 'error')
    } else {
      showToast('Alterações salvas com sucesso!', 'success')
    }
  })
}

async function loadTeamMembers() {
  const container = document.getElementById('team-members-list')
  if (!container) return

  showLoading(container)

  const { data: employees, error } = await supabase
    .from('employees')
    .select('id, nome, cargo, ativa')
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .eq('ativa', true)
    .order('nome')

  if (error) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8 text-error">
        <span class="material-symbols-outlined text-3xl mb-2">error</span>
        <p class="text-xs font-medium">Erro ao carregar equipe.</p>
      </div>
    `
    return
  }

  if (!employees || employees.length === 0) {
    showEmpty(container, 'Nenhuma funcionária ativa.')
    return
  }

  container.innerHTML = employees.map(emp => buildMemberRow(emp)).join('')
}

function buildMemberRow(emp) {
  const initials = (emp.nome || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return `
    <div class="flex items-center justify-between py-3 border-b border-surface-container/20 last:border-0">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">
          ${initials}
        </div>
        <div>
          <p class="text-sm font-semibold text-on-surface">${escapeHtml(emp.nome)}</p>
          <p class="text-xs text-on-surface-variant">${escapeHtml(emp.cargo || 'Colaboradora')}</p>
        </div>
      </div>
      <a href="team-detail.html?id=${emp.id}" class="text-primary hover:text-primary-container transition-colors">
        <span class="material-symbols-outlined text-base" data-icon="chevron_right">chevron_right</span>
      </a>
    </div>
  `
}

function showToast(message, type = 'success') {
  const existing = document.getElementById('settings-toast')
  if (existing) existing.remove()

  const colorMap = {
    success: 'bg-tertiary-container text-on-tertiary-container',
    error: 'bg-error-container text-on-error-container',
  }
  const iconMap = { success: 'check_circle', error: 'error' }

  const toast = document.createElement('div')
  toast.id = 'settings-toast'
  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-semibold ${colorMap[type] || colorMap.success} transition-all`
  toast.innerHTML = `
    <span class="material-symbols-outlined text-base">${iconMap[type] || 'check_circle'}</span>
    ${escapeHtml(message)}
  `
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 3500)
}

function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function initTabs() {
  const tabBtns = document.querySelectorAll('[data-tab]')
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab
      // Update button styles
      tabBtns.forEach(b => {
        b.className = b === btn
          ? 'px-8 py-4 text-sm font-semibold text-primary border-b-2 border-primary'
          : 'px-8 py-4 text-sm font-medium text-zinc-500 hover:text-on-surface transition-colors'
      })
      // Show/hide panels
      document.querySelectorAll('[id^="tab-panel-"]').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== `tab-panel-${tab}`)
      })
    })
  })
}

function initNotificationToggles() {
  const toggles = [
    { id: 'toggle-email', key: 'notif_email' },
    { id: 'toggle-push',  key: 'notif_push' },
    { id: 'toggle-daily', key: 'notif_daily' },
  ]

  toggles.forEach(({ id, key }) => {
    const el = document.getElementById(id)
    if (!el) return

    const stored = localStorage.getItem(key)
    if (stored !== null) {
      el.checked = stored === 'true'
    }

    el.addEventListener('change', () => {
      localStorage.setItem(key, String(el.checked))
    })
  })
}

function bindManagePlanButton() {
  const btn = document.getElementById('btn-manage-plan')
  if (!btn) return
  btn.addEventListener('click', () => {
    showToast('Gerenciamento de assinatura em desenvolvimento. Em breve disponível.', 'success')
  })
}

init()
