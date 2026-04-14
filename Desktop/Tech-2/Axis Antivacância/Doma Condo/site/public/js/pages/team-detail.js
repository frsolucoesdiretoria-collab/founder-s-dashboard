import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, statusBadge } from '../ui.js'

// Pagination state
const PAGE_SIZE = 15
let currentPage = 1
let totalLogs = 0
let currentEmployeeId = null

// Tasks state
let tasksLoaded = false

async function init() {
  await requireAuth()

  const params = new URLSearchParams(window.location.search)
  const employeeId = params.get('id')

  if (!employeeId) {
    window.location.href = 'team.html'
    return
  }

  currentEmployeeId = employeeId

  await Promise.all([
    loadEmployee(employeeId),
    loadWorkLogs(employeeId, 1),
    loadSessions(employeeId),
  ])

  initTabs(employeeId)
  initPagination(employeeId)
  initEditProfile(employeeId)
}

// ─── Edit Profile ──────────────────────────────────────────────────────────────

function initEditProfile(employeeId) {
  const btn = document.getElementById('btn-edit-profile')
  if (!btn) return

  btn.addEventListener('click', () => openEditModal(employeeId))
}

function openEditModal(employeeId) {
  // Get current values from the DOM
  const currentNome = document.getElementById('emp-nome')?.textContent?.trim() || ''
  const currentCargo = document.getElementById('emp-cargo')?.textContent?.trim() || ''

  // Build modal
  const overlay = document.createElement('div')
  overlay.id = 'edit-profile-overlay'
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'

  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-on-surface tracking-tight">Editar Perfil</h2>
        <button id="edit-modal-close" class="text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5" for="edit-nome">Nome <span class="text-error">*</span></label>
          <input
            id="edit-nome"
            type="text"
            value="${escapeHtml(currentNome)}"
            placeholder="Nome completo"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <p id="edit-nome-error" class="text-xs text-error mt-1 hidden">Nome é obrigatório.</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5" for="edit-cargo">Cargo</label>
          <input
            id="edit-cargo"
            type="text"
            value="${escapeHtml(currentCargo)}"
            placeholder="Ex: Analista, Coordenador..."
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-8">
        <button id="edit-modal-cancel" class="px-5 py-2.5 rounded-lg text-sm font-semibold text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors">
          Cancelar
        </button>
        <button id="edit-modal-save" class="px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2">
          <span class="material-symbols-outlined text-base">save</span>
          Salvar
        </button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  // Close handlers
  const closeModal = () => overlay.remove()
  document.getElementById('edit-modal-close').addEventListener('click', closeModal)
  document.getElementById('edit-modal-cancel').addEventListener('click', closeModal)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal() })

  // Save handler
  document.getElementById('edit-modal-save').addEventListener('click', async () => {
    const nomeInput = document.getElementById('edit-nome')
    const cargoInput = document.getElementById('edit-cargo')
    const nomeError = document.getElementById('edit-nome-error')
    const saveBtn = document.getElementById('edit-modal-save')

    const nome = nomeInput.value.trim()
    const cargo = cargoInput.value.trim()

    // Validate
    if (!nome) {
      nomeError.classList.remove('hidden')
      nomeInput.focus()
      return
    }
    nomeError.classList.add('hidden')

    // Disable button + loading state
    saveBtn.disabled = true
    saveBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Salvando...'

    const { error } = await supabase
      .from('employees')
      .update({ nome, cargo })
      .eq('id', employeeId)

    if (error) {
      saveBtn.disabled = false
      saveBtn.innerHTML = '<span class="material-symbols-outlined text-base">save</span> Salvar'
      showToast('Erro ao salvar. Tente novamente.', 'error')
      return
    }

    // Update DOM
    const nomeEl = document.getElementById('emp-nome')
    const cargoEl = document.getElementById('emp-cargo')
    const subtitleEl = document.getElementById('emp-subtitle')
    const avatarEl = document.getElementById('emp-avatar')

    if (nomeEl) nomeEl.textContent = nome
    if (cargoEl) cargoEl.textContent = cargo || 'Colaboradora'
    if (subtitleEl) subtitleEl.textContent = `${cargo || 'Colaboradora'} • Doma Condo`
    if (avatarEl) {
      const initials = nome
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      avatarEl.textContent = initials
    }
    document.title = `${nome} — Doma Condo`

    closeModal()
    showToast('Perfil atualizado com sucesso!', 'success')
  })
}

// ─── Tab Switching ─────────────────────────────────────────────────────────────

function initTabs(employeeId) {
  const tabBtns = document.querySelectorAll('[data-tab]')
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab, employeeId))
  })
}

function switchTab(tab, employeeId) {
  // Update button styles
  document.querySelectorAll('[data-tab]').forEach(btn => {
    const isActive = btn.dataset.tab === tab
    btn.className = isActive
      ? 'pb-4 text-sm font-bold tracking-tight text-primary border-b-2 border-primary'
      : 'pb-4 text-sm font-medium tracking-tight text-on-surface-variant hover:text-on-surface transition-colors'
  })

  // Show/hide content sections
  const sections = ['atividades', 'tarefas', 'mensagens']
  sections.forEach(s => {
    const el = document.getElementById(`tab-content-${s}`)
    if (el) el.classList.toggle('hidden', s !== tab)
  })

  // Load tasks if switching to tarefas for the first time
  if (tab === 'tarefas' && !tasksLoaded) {
    tasksLoaded = true
    loadEmployeeTasks(employeeId)
  }
}

// ─── Load Tasks ────────────────────────────────────────────────────────────────

async function loadEmployeeTasks(employeeId) {
  const wrapper = document.getElementById('tasks-tbody-wrapper')
  if (!wrapper) return

  // Show loading
  wrapper.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
  `

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*, clients(nome_curto)')
    .eq('employee_id', employeeId)
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .neq('status', 'concluida')
    .order('data_estimada', { ascending: true })

  if (error) {
    wrapper.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-error">
        <span class="material-symbols-outlined text-3xl mb-2">error</span>
        <p class="text-sm font-medium">Erro ao carregar tarefas.</p>
      </div>
    `
    return
  }

  if (!tasks || tasks.length === 0) {
    wrapper.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl mb-4 opacity-40">task_alt</span>
        <p class="text-sm font-medium">Nenhuma tarefa pendente.</p>
      </div>
    `
    return
  }

  wrapper.innerHTML = `
    <table class="w-full text-left">
      <thead>
        <tr class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-surface-container/30">
          <th class="px-8 py-5 pb-4 font-bold">Data Estimada</th>
          <th class="px-8 py-5 pb-4 font-bold">Cliente</th>
          <th class="px-8 py-5 pb-4 font-bold">Descrição</th>
          <th class="px-8 py-5 pb-4 font-bold">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-surface-container/20">
        ${tasks.map(t => buildTaskRow(t)).join('')}
      </tbody>
    </table>
  `
}

function buildTaskRow(task) {
  const clientNome = task.clients?.nome_curto || '—'
  const dataFormatada = formatDate(task.data_estimada)
  const statusLabel = formatTaskStatus(task.status)

  return `
    <tr class="group hover:bg-surface-container-low/30 transition-colors">
      <td class="px-8 py-5 text-sm font-medium text-on-surface">${dataFormatada}</td>
      <td class="px-8 py-5 text-sm font-medium text-on-surface">${escapeHtml(clientNome)}</td>
      <td class="px-8 py-5 text-sm font-medium text-on-surface">${escapeHtml(task.descricao || '—')}</td>
      <td class="px-8 py-5">${statusLabel}</td>
    </tr>
  `
}

function formatTaskStatus(status) {
  if (!status) return '<span class="text-on-surface-variant text-xs">—</span>'
  const map = {
    'pendente':    { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Pendente' },
    'em_andamento':{ bg: 'bg-primary-container',   text: 'text-on-primary-container',   label: 'Em Andamento' },
    'em andamento':{ bg: 'bg-primary-container',   text: 'text-on-primary-container',   label: 'Em Andamento' },
    'concluida':   { bg: 'bg-tertiary-container',  text: 'text-on-tertiary-container',  label: 'Concluída' },
  }
  const key = status.toLowerCase()
  const s = map[key] || { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: escapeHtml(status) }
  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${s.bg} ${s.text}">${s.label}</span>`
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function initPagination(employeeId) {
  const prevBtn = document.getElementById('btn-page-prev')
  const nextBtn = document.getElementById('btn-page-next')

  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      if (currentPage <= 1) return
      currentPage--
      await loadWorkLogs(employeeId, currentPage)
      updatePageButtons()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (currentPage * PAGE_SIZE >= totalLogs) return
      currentPage++
      await loadWorkLogs(employeeId, currentPage)
      updatePageButtons()
    })
  }
}

function updatePageButtons() {
  const prevBtn = document.getElementById('btn-page-prev')
  const nextBtn = document.getElementById('btn-page-next')
  const num1 = document.getElementById('btn-page-num-1')
  const num2 = document.getElementById('btn-page-num-2')

  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage * PAGE_SIZE >= totalLogs

  if (prevBtn) prevBtn.disabled = isFirstPage
  if (nextBtn) nextBtn.disabled = isLastPage

  if (prevBtn) prevBtn.classList.toggle('opacity-40', isFirstPage)
  if (nextBtn) nextBtn.classList.toggle('opacity-40', isLastPage)

  // Update visible page numbers (simple: show current and next)
  if (num1) num1.textContent = currentPage
  if (num2) num2.textContent = currentPage + 1

  // Active styling
  if (num1) {
    num1.className = 'w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-sm'
  }
  if (num2) {
    const hasNextPage = (currentPage + 1) * PAGE_SIZE <= totalLogs + PAGE_SIZE
    num2.classList.toggle('hidden', !hasNextPage)
  }
}

// ─── Load Employee ─────────────────────────────────────────────────────────────

async function loadEmployee(employeeId) {
  const { data: emp, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single()

  if (error || !emp) {
    window.location.href = 'team.html'
    return
  }

  renderEmployeeHeader(emp)
}

function renderEmployeeHeader(emp) {
  const initials = (emp.nome || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isAtiva = emp.ativa !== false

  // Avatar
  const avatarEl = document.getElementById('emp-avatar')
  if (avatarEl) avatarEl.textContent = initials

  // Online indicator
  const indicatorEl = document.getElementById('emp-status-indicator')
  if (indicatorEl) {
    indicatorEl.className = `w-3 h-3 rounded-full ${isAtiva ? 'bg-tertiary' : 'bg-secondary'}`
  }

  // Nome
  const nomeEl = document.getElementById('emp-nome')
  if (nomeEl) nomeEl.textContent = emp.nome || '—'

  // Cargo badge
  const cargoEl = document.getElementById('emp-cargo')
  if (cargoEl) cargoEl.textContent = emp.cargo || 'Colaboradora'

  // Status badge
  const statusEl = document.getElementById('emp-status-badge')
  if (statusEl) {
    if (isAtiva) {
      statusEl.textContent = 'ATIVO'
      statusEl.className = 'px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-wider'
    } else {
      statusEl.textContent = 'INATIVO'
      statusEl.className = 'px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider'
    }
  }

  // Subtitle (cargo + empresa)
  const subtitleEl = document.getElementById('emp-subtitle')
  if (subtitleEl) subtitleEl.textContent = `${emp.cargo || 'Colaboradora'} • Doma Condo`

  // Page title breadcrumb
  document.title = `${emp.nome} — Doma Condo`
}

// ─── Load Work Logs (with pagination) ─────────────────────────────────────────

async function loadWorkLogs(employeeId, page = 1) {
  const tbody = document.getElementById('worklogs-tbody')
  if (!tbody) return

  showLoading(tbody)

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: logs, error, count } = await supabase
    .from('work_logs')
    .select('*, clients(nome_curto), categories(nome, cor)', { count: 'exact' })
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('data_execucao', { ascending: false })
    .range(from, to)

  if (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-8 py-12 text-center text-error text-sm">
          <span class="material-symbols-outlined text-3xl block mb-2">error</span>
          Erro ao carregar atividades.
        </td>
      </tr>
    `
    return
  }

  // Store total for pagination
  totalLogs = count || 0

  // Only compute KPIs on first page load
  if (page === 1) {
    await computeKPIs(employeeId)
  }

  // Count text
  const countEl = document.getElementById('worklogs-count')
  if (countEl) {
    const showing = from + (logs?.length || 0)
    countEl.textContent = `Mostrando ${showing} de ${totalLogs} atividades`
  }

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-8 py-16 text-center">
          <div class="flex flex-col items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-4 opacity-40">analytics</span>
            <p class="text-sm font-medium">Nenhuma atividade registrada ainda.</p>
          </div>
        </td>
      </tr>
    `
    updatePageButtons()
    return
  }

  tbody.innerHTML = logs.map(log => buildLogRow(log)).join('')
  updatePageButtons()
}

// Compute KPIs with a separate aggregated query (all logs, not just the page)
async function computeKPIs(employeeId) {
  const { data: allLogs, error } = await supabase
    .from('work_logs')
    .select('status, data_execucao')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)

  if (error || !allLogs) return

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyLogs = allLogs.filter(l => new Date(l.data_execucao) >= startOfMonth)
  const kpiVolume = document.getElementById('kpi-volume')
  if (kpiVolume) kpiVolume.textContent = monthlyLogs.length

  const concluded = allLogs.filter(l => l.status === 'Concluido').length
  const total = allLogs.length
  const perfEl = document.getElementById('kpi-performance')
  if (perfEl) {
    const pct = total > 0 ? Math.round((concluded / total) * 100) : 0
    perfEl.textContent = `${pct}%`
    const bar = document.getElementById('kpi-performance-bar')
    if (bar) bar.style.width = `${pct}%`
  }

  const pendentes = allLogs.filter(l => l.status === 'Pendente').length
  const pendEl = document.getElementById('kpi-pendentes')
  if (pendEl) pendEl.textContent = pendentes
}

function buildLogRow(log) {
  const clientNome = log.clients?.nome_curto || '—'
  const catNome = log.categories?.nome || null
  const catCor = log.categories?.cor || null

  const duracao = formatDuration(log.duracao_minutos)
  const dataFormatada = formatDate(log.data_execucao)

  const catHtml = catNome
    ? categoryBadge(catNome, catCor)
    : '<span class="text-on-surface-variant text-xs">—</span>'

  return `
    <tr class="group hover:bg-surface-container-low/30 transition-colors">
      <td class="px-8 py-5 text-sm font-medium text-on-surface">${dataFormatada}</td>
      <td class="px-8 py-5 text-sm font-medium text-on-surface">${escapeHtml(clientNome)}</td>
      <td class="px-8 py-5 text-sm font-medium text-on-surface">${escapeHtml(log.descricao || '—')}</td>
      <td class="px-8 py-5">${catHtml}</td>
      <td class="px-8 py-5 text-sm font-medium text-on-surface text-right">${duracao}</td>
    </tr>
  `
}

// ─── Load Sessions ─────────────────────────────────────────────────────────────

async function loadSessions(employeeId) {
  const sessionsContainer = document.getElementById('sessions-list')
  if (!sessionsContainer) return

  showLoading(sessionsContainer)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const dateStr = oneWeekAgo.toISOString().split('T')[0]

  const { data: sessions, error } = await supabase
    .from('agent_sessions')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('data_sessao', dateStr)
    .order('data_sessao', { ascending: false })

  if (error) {
    sessionsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8 text-error">
        <span class="material-symbols-outlined text-3xl mb-2">error</span>
        <p class="text-xs font-medium">Erro ao carregar sessões.</p>
      </div>
    `
    return
  }

  if (!sessions || sessions.length === 0) {
    sessionsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl mb-2 opacity-40">schedule</span>
        <p class="text-xs font-medium">Nenhuma sessão na última semana.</p>
      </div>
    `
    return
  }

  sessionsContainer.innerHTML = sessions.map(s => buildSessionRow(s)).join('')
}

function buildSessionRow(session) {
  const statusMap = {
    'ativa': { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', label: 'Ativa' },
    'encerrada': { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: 'Encerrada' },
    'pausada': { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Pausada' },
  }
  const s = statusMap[session.status?.toLowerCase()] || statusMap['encerrada']
  const turno = session.turno ? escapeHtml(session.turno) : '—'
  const data = formatDate(session.data_sessao)

  return `
    <div class="flex items-center justify-between py-3 border-b border-surface-container/20 last:border-0">
      <div>
        <p class="text-sm font-semibold text-on-surface">${data}</p>
        <p class="text-xs text-on-surface-variant">${turno}</p>
      </div>
      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${s.bg} ${s.text}">${s.label}</span>
    </div>
  `
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const existing = document.getElementById('toast-notification')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'toast-notification'
  const colorClass = type === 'error'
    ? 'bg-error text-white'
    : 'bg-tertiary text-white'

  toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 transition-all ${colorClass}`
  toast.innerHTML = `
    <span class="material-symbols-outlined text-base">${type === 'error' ? 'error' : 'check_circle'}</span>
    ${escapeHtml(message)}
  `
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3500)
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

function categoryBadge(nome, cor) {
  if (!nome) return ''
  const safeCor = cor || '#E5E7EB'
  const hex = safeCor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const textColor = luminance > 0.5 ? '#1A1A1A' : '#FFFFFF'
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style="background-color: ${safeCor}; color: ${textColor};">${escapeHtml(nome)}</span>`
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
