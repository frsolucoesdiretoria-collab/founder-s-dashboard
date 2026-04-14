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
  wireEditButton(client, clientId)
  wireNewCondoButton()
}

// ── Botão Editar Cliente ──────────────────────────────────────────────────────

function wireEditButton(client, clientId) {
  const btn = document.getElementById('btn-edit-client')
  if (!btn) return

  btn.addEventListener('click', () => openEditModal(client, clientId))
}

function openEditModal(client, clientId) {
  // Remove modal anterior se existir
  const existing = document.getElementById('edit-client-modal')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.id = 'edit-client-modal'
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'

  overlay.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg">
      <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-container/30">
        <h2 class="text-base font-bold text-on-surface">Editar Cliente</h2>
        <button id="edit-modal-close" class="text-zinc-400 hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form id="edit-client-form" class="px-6 py-5 space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Nome completo <span class="text-error">*</span></label>
          <input
            id="edit-nome"
            type="text"
            value="${escapeAttr(client.nome)}"
            required
            class="w-full border border-outline-variant rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Nome curto</label>
          <input
            id="edit-nome-curto"
            type="text"
            value="${escapeAttr(client.nome_curto)}"
            class="w-full border border-outline-variant rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div class="pt-1">
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Contato</p>
          <div class="space-y-3">
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Nome do responsável</label>
              <input
                id="edit-contato-nome"
                type="text"
                value="${escapeAttr(client.contato_nome)}"
                class="w-full border border-outline-variant rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">E-mail</label>
              <input
                id="edit-contato-email"
                type="email"
                value="${escapeAttr(client.contato_email)}"
                class="w-full border border-outline-variant rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Telefone</label>
              <input
                id="edit-contato-telefone"
                type="text"
                value="${escapeAttr(client.contato_telefone)}"
                class="w-full border border-outline-variant rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>
        </div>
        <div id="edit-modal-error" class="hidden text-xs text-error font-semibold"></div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" id="edit-modal-cancel" class="px-5 py-2.5 text-sm font-semibold text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors">
            Cancelar
          </button>
          <button type="submit" id="edit-modal-save" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
            <span class="material-symbols-outlined text-base">save</span>
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(overlay)

  // Fechar ao clicar no overlay (fora do card)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })
  document.getElementById('edit-modal-close').addEventListener('click', () => overlay.remove())
  document.getElementById('edit-modal-cancel').addEventListener('click', () => overlay.remove())

  // Submit do form
  document.getElementById('edit-client-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    await saveClientEdit(clientId, overlay)
  })
}

async function saveClientEdit(clientId, overlay) {
  const saveBtn = document.getElementById('edit-modal-save')
  const errorEl = document.getElementById('edit-modal-error')

  const nome = document.getElementById('edit-nome').value.trim()
  const nomeCurto = document.getElementById('edit-nome-curto').value.trim()
  const contatoNome = document.getElementById('edit-contato-nome').value.trim()
  const contatoEmail = document.getElementById('edit-contato-email').value.trim()
  const contatoTelefone = document.getElementById('edit-contato-telefone').value.trim()

  if (!nome) {
    errorEl.textContent = 'O nome completo é obrigatório.'
    errorEl.classList.remove('hidden')
    return
  }
  errorEl.classList.add('hidden')

  // Estado de loading no botão
  saveBtn.disabled = true
  saveBtn.innerHTML = `<span class="material-symbols-outlined text-base animate-spin">progress_activity</span> Salvando...`

  const { data: updated, error } = await supabase
    .from('clients')
    .update({
      nome,
      nome_curto: nomeCurto || null,
      contato_nome: contatoNome || null,
      contato_email: contatoEmail || null,
      contato_telefone: contatoTelefone || null,
    })
    .eq('id', clientId)
    .select()
    .single()

  if (error) {
    saveBtn.disabled = false
    saveBtn.innerHTML = `<span class="material-symbols-outlined text-base">save</span> Salvar alterações`
    errorEl.textContent = 'Erro ao salvar. Tente novamente.'
    errorEl.classList.remove('hidden')
    return
  }

  overlay.remove()
  renderClientHeader(updated)
  renderClientContact(updated)
  showToast('Cliente atualizado com sucesso!', 'success')
}

// ── Botão Novo Condomínio ─────────────────────────────────────────────────────

function wireNewCondoButton() {
  const btn = document.getElementById('btn-new-condo')
  if (!btn) return

  btn.addEventListener('click', () => {
    showToast('Funcionalidade em desenvolvimento. Em breve disponível.', 'info')
  })
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const existing = document.getElementById('client-detail-toast')
  if (existing) existing.remove()

  const colorMap = {
    success: 'bg-tertiary-container text-on-tertiary-container',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-tertiary-container text-on-tertiary-container',
  }
  const iconMap = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }

  const toast = document.createElement('div')
  toast.id = 'client-detail-toast'
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeAttr(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
