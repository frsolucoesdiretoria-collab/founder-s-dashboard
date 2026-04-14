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

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDataEstimada(dateStr) {
  if (!dateStr) return '—'
  const today = todayISO()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = tomorrow.toISOString().split('T')[0]

  if (dateStr === today) {
    return `<span class="text-xs font-bold text-error">Hoje</span>`
  }
  if (dateStr === tomorrowISO) {
    return `<span class="text-xs font-bold text-on-surface">Amanhã</span>`
  }
  // Exibe data formatada
  const d = new Date(dateStr + 'T00:00:00')
  const formatted = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  const isPast = dateStr < today
  const colorClass = isPast ? 'text-error' : 'text-on-surface'
  return `<span class="text-xs font-bold ${colorClass}">${formatted}</span>`
}

function taskStatusBadge(status) {
  const map = {
    'pendente':     { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Pendente' },
    'em_andamento': { bg: 'bg-surface-container-highest', text: 'text-zinc-500', label: 'Em andamento' },
    'aguardando':   { bg: 'bg-surface-container-highest', text: 'text-zinc-500', label: 'Aguardando' },
    'concluida':    { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', label: 'Concluída' },
  }
  const s = map[status] || { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: status || '—' }
  return `<span class="px-3 py-1 ${s.bg} ${s.text} rounded-full text-[10px] font-bold uppercase tracking-wider">${s.label}</span>`
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
            <p class="text-sm font-bold text-on-surface truncate">${escapeHtml(descricao)}</p>
            ${statusBadge(log.status)}
          </div>
          <p class="text-xs text-on-surface-variant mb-1">${escapeHtml(cliente)} · ${escapeHtml(funcionaria)}</p>
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

// ─── Tasks ───────────────────────────────────────────────────────────────────

// Estado do filtro: null = todos, 'pendente', 'em_andamento', 'aguardando'
const FILTER_CYCLE = [null, 'pendente', 'em_andamento', 'aguardando']
const FILTER_LABELS = {
  null: 'Todos',
  'pendente': 'Pendente',
  'em_andamento': 'Em andamento',
  'aguardando': 'Aguardando',
}
let currentFilterIndex = 0

function buildTaskRow(task) {
  const cliente = task.clients?.nome_curto || '—'
  const responsavel = task.employees?.nome || '—'
  const prazo = formatDataEstimada(task.data_estimada)
  const badge = taskStatusBadge(task.status)
  const taskId = escapeHtml(String(task.id))
  const descricao = escapeHtml(task.descricao || 'Sem descrição')

  return `
    <tr class="hover:bg-surface-container-low/30 transition-colors group" data-task-id="${taskId}">
      <td class="px-8 py-5">
        <p class="text-sm font-medium text-on-surface">${descricao}</p>
      </td>
      <td class="px-8 py-5 text-sm text-on-surface-variant font-medium">${escapeHtml(cliente)}</td>
      <td class="px-8 py-5 text-sm text-on-surface-variant font-medium">${escapeHtml(responsavel)}</td>
      <td class="px-8 py-5">${prazo}</td>
      <td class="px-8 py-5">${badge}</td>
      <td class="px-8 py-5">
        <button
          class="text-primary opacity-0 group-hover:opacity-100 transition-opacity btn-edit-task"
          data-task-id="${taskId}"
          data-task-descricao="${descricao}"
          data-task-status="${escapeHtml(task.status)}"
          title="Editar status"
        >
          <span class="material-symbols-outlined">edit</span>
        </button>
      </td>
    </tr>
  `
}

async function loadTasks(statusFilter) {
  const tbody = document.getElementById('tasks-tbody')
  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="px-8 py-12 text-center">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td>
    </tr>
  `

  let query = supabase
    .from('tasks')
    .select(`
      id,
      descricao,
      status,
      data_estimada,
      clients ( nome_curto ),
      employees ( nome )
    `)
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .neq('status', 'concluida')
    .order('data_estimada', { ascending: true })
    .limit(10)

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: tasks, error } = await query

  if (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-8 py-12">
          <div class="flex flex-col items-center justify-center text-error gap-2">
            <span class="material-symbols-outlined text-4xl">error</span>
            <p class="text-sm font-medium">Erro ao carregar tarefas.</p>
          </div>
        </td>
      </tr>
    `
    return
  }

  if (!tasks || tasks.length === 0) {
    const filterLabel = statusFilter ? FILTER_LABELS[statusFilter] : null
    const msg = filterLabel
      ? `Nenhuma tarefa com status "${filterLabel}".`
      : 'Nenhuma tarefa pendente no momento.'
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-8 py-16">
          <div class="flex flex-col items-center justify-center text-on-surface-variant gap-3">
            <span class="material-symbols-outlined text-5xl opacity-40">task_alt</span>
            <p class="text-sm font-medium">${msg}</p>
          </div>
        </td>
      </tr>
    `
    return
  }

  tbody.innerHTML = tasks.map(buildTaskRow).join('')
}

// ─── Carregar selects do modal Nova Tarefa ───────────────────────────────────

async function loadModalSelects() {
  const [
    { data: clients },
    { data: employees },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('id, nome_curto')
      .eq('organization_id', ORG_ID)
      .eq('ativo', true)
      .is('deleted_at', null)
      .order('nome_curto'),

    supabase
      .from('employees')
      .select('id, nome')
      .eq('organization_id', ORG_ID)
      .eq('ativa', true)
      .is('deleted_at', null)
      .order('nome'),
  ])

  const clientSelect = document.getElementById('task-client')
  if (clients) {
    clients.forEach(c => {
      const opt = document.createElement('option')
      opt.value = c.id
      opt.textContent = c.nome_curto
      clientSelect.appendChild(opt)
    })
  }

  const employeeSelect = document.getElementById('task-employee')
  if (employees) {
    employees.forEach(e => {
      const opt = document.createElement('option')
      opt.value = e.id
      opt.textContent = e.nome
      employeeSelect.appendChild(opt)
    })
  }
}

// ─── Modal Nova Tarefa ────────────────────────────────────────────────────────

function openNewTaskModal() {
  document.getElementById('modal-new-task').classList.remove('hidden')
  document.getElementById('task-descricao').focus()
}

function closeNewTaskModal() {
  document.getElementById('modal-new-task').classList.add('hidden')
  document.getElementById('form-new-task').reset()
}

async function saveNewTask(e) {
  e.preventDefault()
  const btn = document.getElementById('btn-save-new-task')
  btn.disabled = true
  btn.textContent = 'Salvando...'

  const descricao = document.getElementById('task-descricao').value.trim()
  const clientId = document.getElementById('task-client').value || null
  const employeeId = document.getElementById('task-employee').value || null
  const dataEstimada = document.getElementById('task-data').value || null
  const status = document.getElementById('task-status').value

  const { error } = await supabase
    .from('tasks')
    .insert({
      organization_id: ORG_ID,
      descricao,
      client_id: clientId,
      employee_id: employeeId,
      data_estimada: dataEstimada,
      status,
    })

  btn.disabled = false
  btn.textContent = 'Salvar Tarefa'

  if (error) {
    alert('Erro ao salvar tarefa. Tente novamente.')
    return
  }

  closeNewTaskModal()
  const currentFilter = FILTER_CYCLE[currentFilterIndex]
  await loadTasks(currentFilter)
}

// ─── Modal Editar Tarefa ──────────────────────────────────────────────────────

function openEditTaskModal(taskId, descricao, status) {
  document.getElementById('edit-task-id').value = taskId
  document.getElementById('edit-task-descricao').textContent = descricao
  document.getElementById('edit-task-status').value = status
  document.getElementById('modal-edit-task').classList.remove('hidden')
}

function closeEditTaskModal() {
  document.getElementById('modal-edit-task').classList.add('hidden')
}

async function saveEditTask(e) {
  e.preventDefault()
  const btn = document.getElementById('btn-save-edit-task')
  btn.disabled = true
  btn.textContent = 'Salvando...'

  const taskId = document.getElementById('edit-task-id').value
  const status = document.getElementById('edit-task-status').value

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('organization_id', ORG_ID)

  btn.disabled = false
  btn.textContent = 'Salvar'

  if (error) {
    alert('Erro ao atualizar tarefa. Tente novamente.')
    return
  }

  closeEditTaskModal()
  const currentFilter = FILTER_CYCLE[currentFilterIndex]
  await loadTasks(currentFilter)
}

// ─── Delegate click no tbody para editar ─────────────────────────────────────

function wireTbodyDelegate() {
  const tbody = document.getElementById('tasks-tbody')
  tbody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-task')
    if (!editBtn) return
    const taskId = editBtn.dataset.taskId
    const descricao = editBtn.dataset.taskDescricao
    const status = editBtn.dataset.taskStatus
    openEditTaskModal(taskId, descricao, status)
  })
}

// ─── Filtro ───────────────────────────────────────────────────────────────────

function wireFilterButton() {
  const btn = document.getElementById('btn-filter-tasks')
  const label = document.getElementById('tasks-filter-label')

  btn.addEventListener('click', async () => {
    currentFilterIndex = (currentFilterIndex + 1) % FILTER_CYCLE.length
    const filter = FILTER_CYCLE[currentFilterIndex]
    const filterLabel = FILTER_LABELS[filter]

    if (filter === null) {
      btn.textContent = 'Filtrar'
      label.classList.add('hidden')
      label.textContent = ''
    } else {
      btn.textContent = `Filtro: ${filterLabel}`
      label.textContent = filterLabel
      label.classList.remove('hidden')
    }

    await loadTasks(filter)
  })
}

// ─── Usuário no header ───────────────────────────────────────────────────────

function populateUserHeader(user) {
  const nameEl = document.querySelector('.text-right p.text-sm.font-semibold')
  const avatarEl = document.querySelector('.h-10.w-10.rounded-full.bg-\\[\\#FAC826\\]')

  if (!user) return

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

  // Botão "Ver Detalhes" no gráfico semanal
  const btnVerDetalhes = document.getElementById('btn-ver-detalhes')
  if (btnVerDetalhes) {
    btnVerDetalhes.addEventListener('click', () => {
      window.location.href = 'work-logs.html'
    })
  }

  // Preencher dados do usuário no header
  populateUserHeader(user)

  // Wire modal Nova Tarefa
  document.getElementById('btn-new-task').addEventListener('click', openNewTaskModal)
  document.getElementById('modal-new-task-close').addEventListener('click', closeNewTaskModal)
  document.getElementById('btn-cancel-new-task').addEventListener('click', closeNewTaskModal)
  document.getElementById('modal-new-task-backdrop').addEventListener('click', closeNewTaskModal)
  document.getElementById('form-new-task').addEventListener('submit', saveNewTask)

  // Wire modal Editar Tarefa
  document.getElementById('modal-edit-task-close').addEventListener('click', closeEditTaskModal)
  document.getElementById('btn-cancel-edit-task').addEventListener('click', closeEditTaskModal)
  document.getElementById('modal-edit-task-backdrop').addEventListener('click', closeEditTaskModal)
  document.getElementById('form-edit-task').addEventListener('submit', saveEditTask)

  // Delegate click do tbody para edição
  wireTbodyDelegate()

  // Wire filtro
  wireFilterButton()

  // Carregar selects do modal (em background, não bloqueia o resto)
  loadModalSelects()

  // Carregar dados em paralelo
  await Promise.all([
    loadKpis(),
    loadRecentWorkLogs(),
    loadTasks(null),
  ])
}

init()
