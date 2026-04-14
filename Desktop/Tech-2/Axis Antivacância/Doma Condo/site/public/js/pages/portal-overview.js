import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { getMyRole, getMyProfileId } from '../auth.js'
import { showLoading, showEmpty, showError, formatDate, statusBadge, categoryBadge } from '../ui.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  if (!minutes) return '0h'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

function totalMinutes(logs) {
  return logs.reduce((acc, l) => acc + (l.duracao_minutos || 0), 0)
}

function monthStart() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

// ─── Determina client_id ─────────────────────────────────────────────────────

function resolveClientId(user) {
  const role = getMyRole(user)
  if (role === 'client') {
    return getMyProfileId(user)
  }
  // admin: lê ?client_id= da URL
  const params = new URLSearchParams(window.location.search)
  return params.get('client_id') || null
}

// ─── Render: Atividades Recentes ─────────────────────────────────────────────

function renderActivities(logs) {
  const container = document.querySelector('.space-y-6')
  if (!container) return

  if (!logs || logs.length === 0) {
    showEmpty(container, 'Nenhuma atividade registrada neste mês.')
    return
  }

  container.innerHTML = logs.slice(0, 8).map((log) => {
    const dateStr = log.data_execucao
      ? new Date(log.data_execucao + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      : '—'
    const catNome = log.categories?.nome || 'Atividade'
    const catCor  = log.categories?.cor  || '#FAC826'
    const empName = log.employees?.nome  || '—'
    const statusHtml = statusBadge(log.status || 'Concluido')

    return `
      <div class="flex items-center justify-between group">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-on-surface">${log.descricao || catNome}</p>
            <p class="text-xs text-zinc-400">${dateStr} • ${empName}</p>
          </div>
        </div>
        ${statusHtml}
      </div>`
  }).join('')
}

// ─── Render: KPI de Horas ────────────────────────────────────────────────────

function renderHorasCard(logs) {
  // Seleciona o card "Horas Poupadas" (segundo card da grid de KPIs)
  const cards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-4 > div')
  if (!cards || cards.length < 2) return

  const mins = totalMinutes(logs)
  const horasEl = cards[1].querySelector('p.text-2xl')
  if (horasEl) horasEl.textContent = formatDuration(mins)

  const subEl = cards[1].querySelector('.mt-4')
  if (subEl) subEl.textContent = `${logs.length} atividades no mês`
}

// ─── Render: KPI do cliente ──────────────────────────────────────────────────

function renderClientCard(client) {
  if (!client) return
  const cards = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-4 > div')
  if (!cards || cards.length < 4) return

  // Card 4: nome do cliente
  const lastCard = cards[3]
  const valueEl = lastCard.querySelector('p.text-2xl')
  if (valueEl) valueEl.textContent = client.nome_curto || client.nome || '—'

  // Atualiza header com nome do cliente
  const headerP = document.querySelector('header.mb-10 span')
  if (headerP && client.nome) {
    headerP.textContent = `Portal — ${client.nome}`
  }
}

// ─── Render: Pendências (Tasks) ──────────────────────────────────────────────

function renderTasks(tasks) {
  const tbody = document.querySelector('table tbody')
  if (!tbody) return

  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="flex flex-col items-center justify-center py-12 text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl mb-3 opacity-40">check_circle</span>
            <p class="text-sm font-medium">Nenhuma pendência aberta.</p>
          </div>
        </td>
      </tr>`
    return
  }

  tbody.innerHTML = tasks.map((task) => {
    const prazo = task.data_estimada
      ? new Date(task.data_estimada + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—'

    const isUrgente = task.status === 'urgente' || task.status === 'Urgente'
    const statusClass = isUrgente
      ? 'bg-error-container text-on-error-container'
      : 'bg-secondary-container text-on-secondary-container'
    const statusLabel = isUrgente ? 'Urgente' : 'Pendente'

    return `
      <tr class="group hover:bg-surface-container-low/30 transition-colors">
        <td class="py-5">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary">edit_note</span>
            <span class="text-sm font-medium text-on-surface">${task.descricao || '—'}</span>
          </div>
        </td>
        <td class="py-5 text-sm text-zinc-500">${prazo}</td>
        <td class="py-5">
          <span class="px-3 py-1 ${statusClass} rounded-full text-[10px] font-bold uppercase tracking-wider">${statusLabel}</span>
        </td>
        <td class="py-5 text-right">
          <span class="text-xs text-zinc-400">${task.employees?.nome || ''}</span>
        </td>
      </tr>`
  }).join('')
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  const user = await requireAuth()
  if (!user) return

  const clientId = resolveClientId(user)

  // Loading states
  const activitiesContainer = document.querySelector('.space-y-6')
  const tbody = document.querySelector('table tbody')

  if (activitiesContainer) showLoading(activitiesContainer)
  if (tbody) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td></tr>`
  }

  try {
    // Busca dados em paralelo
    const [logsResult, tasksResult, clientResult] = await Promise.all([
      // Work logs do mês atual
      clientId
        ? supabase
            .from('work_logs')
            .select('*, employees(nome), categories(nome, cor)')
            .eq('client_id', clientId)
            .eq('organization_id', ORG_ID)
            .is('deleted_at', null)
            .gte('data_execucao', monthStart())
            .order('data_execucao', { ascending: false })
        : Promise.resolve({ data: [], error: null }),

      // Tasks abertas
      clientId
        ? supabase
            .from('tasks')
            .select('*, employees(nome)')
            .eq('client_id', clientId)
            .eq('organization_id', ORG_ID)
            .neq('status', 'concluida')
            .is('deleted_at', null)
            .order('data_estimada', { ascending: true })
        : Promise.resolve({ data: [], error: null }),

      // Dados do cliente
      clientId
        ? supabase
            .from('clients')
            .select('id, nome, nome_curto')
            .eq('id', clientId)
            .single()
        : Promise.resolve({ data: null, error: null }),
    ])

    if (logsResult.error) throw logsResult.error
    if (tasksResult.error) throw tasksResult.error

    const logs   = logsResult.data  || []
    const tasks  = tasksResult.data || []
    const client = clientResult.data || null

    renderActivities(logs)
    renderHorasCard(logs)
    renderClientCard(client)
    renderTasks(tasks)

    // Atualiza nome do usuário no header
    if (client) {
      const nameEl = document.querySelector('header p.text-sm.font-semibold')
      if (nameEl) nameEl.textContent = client.nome || nameEl.textContent
      const roleEl = document.querySelector('header p.text-\\[10px\\]')
      if (roleEl) roleEl.textContent = client.nome_curto || ''
    }

  } catch (err) {
    console.error('[portal-overview] init error', err)
    if (activitiesContainer) showError(activitiesContainer, 'Erro ao carregar atividades.')
    if (tbody) {
      tbody.innerHTML = `
        <tr><td colspan="4">
          <div class="flex flex-col items-center justify-center py-12 text-error">
            <span class="material-symbols-outlined text-4xl mb-3">error</span>
            <p class="text-sm font-medium">Erro ao carregar pendências.</p>
          </div>
        </td></tr>`
    }
  }
}

init()
