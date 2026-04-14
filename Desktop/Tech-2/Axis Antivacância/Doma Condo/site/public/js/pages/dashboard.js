import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth, logout } from '../auth.js'
import { showEmpty, showError, statusBadge, categoryBadge } from '../ui.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function relativeTime(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora mesmo'
  if (minutes < 60) return `Há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ontem'
  return `Há ${days} dias`
}

function dotColor(status) {
  const map = {
    'Concluido': 'bg-tertiary',
    'Parcial': 'bg-secondary',
    'Pendente': 'bg-error',
  }
  return map[status] || 'bg-outline'
}

// ─── KPIs ────────────────────────────────────────────────────────────────────

async function loadKpis() {
  const today = todayISO()

  const [
    { count: totalClientes },
    { data: workLogsHoje },
    { count: sessoesAtivas },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', ORG_ID)
      .eq('ativo', true)
      .is('deleted_at', null),

    supabase
      .from('work_logs')
      .select('duracao_minutos')
      .eq('organization_id', ORG_ID)
      .eq('data_execucao', today)
      .is('deleted_at', null),

    supabase
      .from('agent_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')
      .eq('data_sessao', today),
  ])

  // Atividades hoje
  const totalAtividades = workLogsHoje?.length ?? 0
  document.getElementById('kpi-atividades-hoje').textContent = totalAtividades

  // Sessões ativas
  document.getElementById('kpi-sessoes-ativas').textContent = sessoesAtivas ?? 0

  // Clientes ativos
  document.getElementById('kpi-clientes-ativos').textContent = totalClientes ?? 0

  // Horas hoje
  const totalMinutos = workLogsHoje?.reduce((acc, log) => acc + (log.duracao_minutos || 0), 0) ?? 0
  const horas = (totalMinutos / 60).toFixed(1).replace('.', ',')
  document.getElementById('kpi-horas-hoje').textContent = `${horas}h`
}

// ─── Work Logs Recentes ──────────────────────────────────────────────────────

async function loadRecentWorkLogs() {
  const container = document.getElementById('recent-worklogs')
  const today = todayISO()

  const { data: logs, error } = await supabase
    .from('work_logs')
    .select(`
      id,
      descricao,
      status,
      created_at,
      duracao_minutos,
      employees ( nome ),
      clients ( nome_curto ),
      categories ( nome, cor )
    `)
    .eq('organization_id', ORG_ID)
    .eq('data_execucao', today)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    showError(container, 'Erro ao carregar atividades recentes.')
    return
  }

  if (!logs || logs.length === 0) {
    showEmpty(container, 'Nenhuma atividade registrada hoje.')
    return
  }

  container.innerHTML = logs.map((log, index) => {
    const isLast = index === logs.length - 1
    const dot = dotColor(log.status)
    const cliente = log.clients?.nome_curto || '—'
    const funcionaria = log.employees?.nome || '—'
    const descricao = log.descricao || 'Atividade registrada'
    const tempo = relativeTime(log.created_at)
    const categoria = log.categories
      ? categoryBadge(log.categories.nome, log.categories.cor)
      : ''

    return `
      <div class="flex gap-4">
        <div class="relative flex-shrink-0">
          <div class="w-2 h-2 rounded-full ${dot} mt-2"></div>
          ${!isLast ? '<div class="absolute top-4 left-[3px] w-[2px] h-full bg-outline-variant/20"></div>' : ''}
        </div>
        <div class="min-w-0 flex-1 pb-4">
          <div class="flex items-start justify-between gap-2 mb-1">
            <p class="text-sm font-bold text-on-surface truncate">${descricao}</p>
            ${statusBadge(log.status)}
          </div>
          <p class="text-xs text-on-surface-variant mb-1">${cliente} · ${funcionaria}</p>
          <div class="flex items-center gap-2 flex-wrap">
            ${categoria}
            <span class="text-[10px] text-primary font-medium">${tempo}</span>
            ${log.duracao_minutos ? `<span class="text-[10px] text-on-surface-variant">${log.duracao_minutos} min</span>` : ''}
          </div>
        </div>
      </div>
    `
  }).join('')
}

// ─── Usuário no header ───────────────────────────────────────────────────────

function populateUserHeader(user) {
  const nameEl = document.querySelector('.text-right p.text-sm.font-semibold')
  const roleEl = document.querySelector('.text-right p.text-\\[10px\\]')
  const avatarEl = document.querySelector('.h-10.w-10.rounded-full.bg-\\[\\#FAC826\\]')

  if (!user) return

  const meta = user.app_metadata || {}
  const displayName = user.email?.split('@')[0] || 'Admin'
  const initials = displayName.slice(0, 2).toUpperCase()

  if (nameEl) nameEl.textContent = displayName
  if (avatarEl) avatarEl.textContent = initials
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  // Autenticação obrigatória
  const user = await requireAuth()
  if (!user) return

  // Botão de logout
  const btnLogout = document.getElementById('btn-logout')
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault()
      logout()
    })
  }

  // Preencher dados do usuário no header
  populateUserHeader(user)

  // Carregar KPIs e atividades em paralelo
  await Promise.all([
    loadKpis(),
    loadRecentWorkLogs(),
  ])
}

init()
