import { supabase } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, formatDate, statusBadge, categoryBadge } from '../ui.js'

async function init() {
  await requireAuth()

  const params = new URLSearchParams(window.location.search)
  const clientId = params.get('id')

  if (!clientId) {
    window.location.href = 'clients.html'
    return
  }

  await Promise.all([
    loadClient(clientId),
    loadWorkLogs(clientId),
    loadTasks(clientId),
  ])
}

async function loadClient(clientId) {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    window.location.href = 'clients.html'
    return
  }

  renderClientHeader(client)
  renderClientContact(client)
}

function renderClientHeader(client) {
  const nameEl = document.getElementById('client-name')
  const shortNameEl = document.getElementById('client-short-name')
  const statusEl = document.getElementById('client-status')
  const notesEl = document.getElementById('client-notes')

  if (nameEl) nameEl.textContent = client.nome || '—'
  if (shortNameEl) shortNameEl.textContent = client.nome_curto || client.nome || '—'

  if (statusEl) {
    if (client.ativo) {
      statusEl.className = 'px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-widest uppercase rounded-full'
      statusEl.textContent = 'ATIVO'
    } else {
      statusEl.className = 'px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest uppercase rounded-full'
      statusEl.textContent = 'INATIVO'
    }
  }

  if (notesEl) {
    notesEl.textContent = client.observacoes || '—'
  }
}

function renderClientContact(client) {
  const contactNameEl = document.getElementById('contact-name')
  const contactEmailEl = document.getElementById('contact-email')
  const contactPhoneEl = document.getElementById('contact-phone')

  if (contactNameEl) contactNameEl.textContent = client.contato_nome || '—'
  if (contactEmailEl) {
    if (client.contato_email) {
      contactEmailEl.innerHTML = `<a href="mailto:${escapeHtml(client.contato_email)}" class="text-primary hover:underline">${escapeHtml(client.contato_email)}</a>`
    } else {
      contactEmailEl.textContent = '—'
    }
  }
  if (contactPhoneEl) contactPhoneEl.textContent = client.contato_telefone || '—'
}

async function loadWorkLogs(clientId) {
  const container = document.getElementById('work-logs-container')
  if (!container) return

  showLoading(container)

  const { data: logs, error } = await supabase
    .from('work_logs')
    .select('*, employees(nome), categories(nome, cor)')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('data_execucao', { ascending: false })
    .limit(30)

  if (error) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-error">
        <span class="material-symbols-outlined text-4xl mb-2">error</span>
        <p class="text-sm">Erro ao carregar atividades.</p>
      </div>
    `
    return
  }

  if (!logs || logs.length === 0) {
    showEmpty(container, 'Nenhuma atividade registrada para este cliente.')
    return
  }

  container.innerHTML = `
    <table class="w-full text-left">
      <thead>
        <tr class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-surface-container/30">
          <th class="px-6 pb-4 pt-4 font-bold">Data</th>
          <th class="px-6 pb-4 pt-4 font-bold">Descrição</th>
          <th class="px-6 pb-4 pt-4 font-bold">Categoria</th>
          <th class="px-6 pb-4 pt-4 font-bold">Responsável</th>
          <th class="px-6 pb-4 pt-4 font-bold">Duração</th>
          <th class="px-6 pb-4 pt-4 font-bold text-center">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-surface-container/20">
        ${logs.map(log => buildWorkLogRow(log)).join('')}
      </tbody>
    </table>
  `
}

function buildWorkLogRow(log) {
  const duracao = log.duracao_minutos
    ? `${Math.floor(log.duracao_minutos / 60)}h${String(log.duracao_minutos % 60).padStart(2, '0')}min`
    : '—'

  const catNome = log.categories?.nome || null
  const catCor = log.categories?.cor || null
  const empNome = log.employees?.nome || '—'

  return `
    <tr class="hover:bg-surface-container-low/30 transition-colors">
      <td class="px-6 py-4 text-sm text-on-surface whitespace-nowrap">${formatDate(log.data_execucao)}</td>
      <td class="px-6 py-4 text-sm text-on-surface max-w-xs">
        <span class="line-clamp-2">${escapeHtml(log.descricao || '—')}</span>
      </td>
      <td class="px-6 py-4">${catNome ? categoryBadge(catNome, catCor) : '—'}</td>
      <td class="px-6 py-4 text-sm text-on-surface-variant">${escapeHtml(empNome)}</td>
      <td class="px-6 py-4 text-sm text-on-surface-variant">${duracao}</td>
      <td class="px-6 py-4 text-center">${statusBadge(log.status)}</td>
    </tr>
  `
}

async function loadTasks(clientId) {
  const container = document.getElementById('tasks-container')
  if (!container) return

  showLoading(container)

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*, employees(nome)')
    .eq('client_id', clientId)
    .neq('status', 'concluida')
    .is('deleted_at', null)
    .order('data_estimada')

  if (error) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-error">
        <span class="material-symbols-outlined text-4xl mb-2">error</span>
        <p class="text-sm">Erro ao carregar tarefas.</p>
      </div>
    `
    return
  }

  if (!tasks || tasks.length === 0) {
    showEmpty(container, 'Nenhuma tarefa pendente para este cliente.')
    return
  }

  container.innerHTML = tasks.map(task => buildTaskItem(task)).join('')
}

function buildTaskItem(task) {
  const isOverdue = task.data_estimada && new Date(task.data_estimada) < new Date()
  const dateClass = isOverdue ? 'text-error' : 'text-on-surface-variant'

  const statusMap = {
    'pendente': { label: 'Pendente', bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
    'em_andamento': { label: 'Em andamento', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
    'aguardando': { label: 'Aguardando', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  }
  const st = statusMap[task.status] || { label: task.status || '—', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' }

  return `
    <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-surface-container-low transition-colors">
      <div class="mt-0.5 w-5 h-5 rounded border-2 border-outline-variant flex-shrink-0"></div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-on-surface">${escapeHtml(task.descricao || '—')}</p>
        <div class="flex items-center gap-3 mt-1 flex-wrap">
          ${task.data_estimada ? `<span class="text-xs ${dateClass} flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_today</span>${formatDate(task.data_estimada)}</span>` : ''}
          ${task.employees?.nome ? `<span class="text-xs text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span>${escapeHtml(task.employees.nome)}</span>` : ''}
        </div>
      </div>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text} flex-shrink-0">${st.label}</span>
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
