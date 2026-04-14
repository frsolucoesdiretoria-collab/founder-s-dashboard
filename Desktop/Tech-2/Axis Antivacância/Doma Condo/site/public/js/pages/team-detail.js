import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, statusBadge } from '../ui.js'

async function init() {
  await requireAuth()

  const params = new URLSearchParams(window.location.search)
  const employeeId = params.get('id')

  if (!employeeId) {
    window.location.href = 'team.html'
    return
  }

  await Promise.all([
    loadEmployee(employeeId),
    loadWorkLogs(employeeId),
    loadSessions(employeeId),
  ])
}

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

async function loadWorkLogs(employeeId) {
  const tbody = document.getElementById('worklogs-tbody')
  if (!tbody) return

  showLoading(tbody)

  const { data: logs, error } = await supabase
    .from('work_logs')
    .select('*, clients(nome_curto), categories(nome, cor)')
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('data_execucao', { ascending: false })
    .limit(30)

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

  // KPI: volume mensal (logs do mês atual)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyLogs = (logs || []).filter(l => new Date(l.data_execucao) >= startOfMonth)
  const kpiVolume = document.getElementById('kpi-volume')
  if (kpiVolume) kpiVolume.textContent = monthlyLogs.length

  // KPI: concluídos vs total
  const concluded = (logs || []).filter(l => l.status === 'Concluido').length
  const total = (logs || []).length
  const perfEl = document.getElementById('kpi-performance')
  if (perfEl) {
    const pct = total > 0 ? Math.round((concluded / total) * 100) : 0
    perfEl.textContent = `${pct}%`
    const bar = document.getElementById('kpi-performance-bar')
    if (bar) bar.style.width = `${pct}%`
  }

  // KPI: pendentes
  const pendentes = (logs || []).filter(l => l.status === 'Pendente').length
  const pendEl = document.getElementById('kpi-pendentes')
  if (pendEl) pendEl.textContent = pendentes

  // Count text
  const countEl = document.getElementById('worklogs-count')
  if (countEl) countEl.textContent = `Mostrando ${Math.min(logs?.length || 0, 30)} de ${logs?.length || 0} atividades`

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
    return
  }

  tbody.innerHTML = logs.map(log => buildLogRow(log)).join('')
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
