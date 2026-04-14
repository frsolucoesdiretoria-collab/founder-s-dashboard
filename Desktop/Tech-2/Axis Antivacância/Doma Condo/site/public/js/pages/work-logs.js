import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, showError, formatDate, statusBadge, categoryBadge } from '../ui.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ─── Render ──────────────────────────────────────────────────────────────────

function renderRows(logs, tbody) {
  if (!logs || logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-4 opacity-40">inbox</span>
            <p class="text-sm font-medium">Nenhuma atividade encontrada.</p>
          </div>
        </td>
      </tr>`
    return
  }

  tbody.innerHTML = logs.map((log) => {
    const date = log.data_execucao
      ? new Date(log.data_execucao + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      : '—'
    const employeeName = log.employees?.nome || '—'
    const clientName = log.clients?.nome || log.clients?.nome_curto || '—'
    const catNome = log.categories?.nome || '—'
    const catCor = log.categories?.cor || '#E5E7EB'
    const abbr = initials(employeeName)

    return `
      <tr class="hover:bg-surface-bright transition-colors group">
        <td class="px-6 py-4 text-sm font-medium">${date}</td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold">${abbr}</div>
            <span class="text-sm">${employeeName}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-sm font-bold">${clientName}</td>
        <td class="px-6 py-4">${categoryBadge(catNome, catCor)}</td>
        <td class="px-6 py-4 text-sm text-on-surface-variant">${log.descricao || '—'}</td>
        <td class="px-6 py-4 text-sm font-mono text-right">${formatDuration(log.duracao_minutos)}</td>
        <td class="px-6 py-4 text-right">${statusBadge(log.status)}</td>
      </tr>`
  }).join('')
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

async function fetchLogs(filters = {}) {
  let query = supabase
    .from('work_logs')
    .select('*, employees(nome), clients(nome, nome_curto), categories(nome, cor)')
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .order('data_execucao', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (filters.dateStart) query = query.gte('data_execucao', filters.dateStart)
  if (filters.dateEnd)   query = query.lte('data_execucao', filters.dateEnd)

  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  const user = await requireAuth()
  if (!user) return

  const tbody = document.querySelector('table tbody')
  if (!tbody) return

  // Show loading state while fetching
  tbody.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td>
    </tr>`

  try {
    const logs = await fetchLogs()
    renderRows(logs, tbody)
    updateCountLabel(logs.length)
  } catch (err) {
    console.error('[work-logs] fetch error', err)
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="flex flex-col items-center justify-center py-16 text-error">
            <span class="material-symbols-outlined text-5xl mb-4">error</span>
            <p class="text-sm font-medium">Erro ao carregar atividades. Tente novamente.</p>
          </div>
        </td>
      </tr>`
  }

  // Wire up filter selects (month + client + employee + category)
  wireFilters(tbody)

  // Wire up "Nova Atividade" button
  const btnAdd = document.querySelector('[data-icon="add_circle"]')?.closest('button')
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openNewActivityModal(tbody))
  }
}

function updateCountLabel(count) {
  const label = document.querySelector('.px-6.py-6 p.text-xs')
  if (label) label.textContent = `Exibindo ${count} registros`
}

// ─── Filter wiring ───────────────────────────────────────────────────────────

function wireFilters(tbody) {
  // Populate client filter
  populateClientSelect(tbody)
  populateEmployeeSelect(tbody)
  populateCategorySelect()

  // Date range filter (if date inputs exist)
  const dateInputs = document.querySelectorAll('input[type="date"]')
  if (dateInputs.length >= 2) {
    dateInputs[0].addEventListener('change', () => applyFilters(tbody))
    dateInputs[1].addEventListener('change', () => applyFilters(tbody))
  }

  // All selects
  document.querySelectorAll('select').forEach((sel) => {
    sel.addEventListener('change', () => applyFilters(tbody))
  })
}

async function populateClientSelect(tbody) {
  const { data } = await supabase
    .from('clients')
    .select('id, nome, nome_curto')
    .eq('organization_id', ORG_ID)
    .order('nome')

  if (!data) return

  // Find the client select (second select in the filters shelf)
  const selects = document.querySelectorAll('select')
  const clientSel = selects[1]
  if (!clientSel) return

  const current = clientSel.value
  // Keep first "Todos" option and add dynamic options
  while (clientSel.options.length > 1) clientSel.remove(1)
  data.forEach((c) => {
    const opt = new Option(c.nome_curto || c.nome, c.id)
    clientSel.add(opt)
  })
  clientSel.value = current
}

async function populateEmployeeSelect(tbody) {
  const { data } = await supabase
    .from('employees')
    .select('id, nome')
    .eq('organization_id', ORG_ID)
    .order('nome')

  if (!data) return

  const selects = document.querySelectorAll('select')
  const empSel = selects[2]
  if (!empSel) return

  while (empSel.options.length > 1) empSel.remove(1)
  data.forEach((e) => {
    const opt = new Option(e.nome, e.id)
    empSel.add(opt)
  })
}

async function populateCategorySelect() {
  const { data } = await supabase
    .from('categories')
    .select('id, nome')
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .order('ordem', { ascending: true, nullsFirst: false })
    .order('nome')

  if (!data) return

  const selects = document.querySelectorAll('select')
  const catSel = selects[3]
  if (!catSel) return

  while (catSel.options.length > 1) catSel.remove(1)
  data.forEach((c) => {
    const opt = new Option(c.nome, c.id)
    catSel.add(opt)
  })
}

async function applyFilters(tbody) {
  const selects = document.querySelectorAll('select')
  const dateInputs = document.querySelectorAll('input[type="date"]')

  const filters = {}
  if (dateInputs[0]?.value) filters.dateStart = dateInputs[0].value
  if (dateInputs[1]?.value) filters.dateEnd   = dateInputs[1].value

  tbody.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td>
    </tr>`

  try {
    let query = supabase
      .from('work_logs')
      .select('*, employees(nome), clients(nome, nome_curto), categories(nome, cor)')
      .eq('organization_id', ORG_ID)
      .is('deleted_at', null)
      .order('data_execucao', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)

    if (filters.dateStart) query = query.gte('data_execucao', filters.dateStart)
    if (filters.dateEnd)   query = query.lte('data_execucao', filters.dateEnd)

    // Client filter (select index 1)
    const clientVal = selects[1]?.value
    if (clientVal && clientVal !== selects[1]?.options[0]?.value) {
      query = query.eq('client_id', clientVal)
    }

    // Employee filter (select index 2)
    const empVal = selects[2]?.value
    if (empVal && empVal !== selects[2]?.options[0]?.value) {
      query = query.eq('employee_id', empVal)
    }

    const { data, error } = await query
    if (error) throw error
    renderRows(data, tbody)
    updateCountLabel(data.length)
  } catch (err) {
    console.error('[work-logs] filter error', err)
  }
}

// ─── Modal Nova Atividade ────────────────────────────────────────────────────

async function openNewActivityModal(tbody) {
  const existing = document.getElementById('modal-new-activity')
  if (existing) existing.remove()

  const [clientsRes, categoriesRes, employeesRes] = await Promise.all([
    supabase.from('clients').select('id, nome, nome_curto').eq('organization_id', ORG_ID).is('deleted_at', null).order('nome'),
    supabase.from('categories').select('id, nome').eq('organization_id', ORG_ID).is('deleted_at', null).order('nome'),
    supabase.from('employees').select('id, nome').eq('organization_id', ORG_ID).is('deleted_at', null).order('nome'),
  ])

  const clients    = clientsRes.data    || []
  const categories = categoriesRes.data || []
  const employees  = employeesRes.data  || []
  const today = new Date().toISOString().split('T')[0]

  const opts = (items, label = 'nome', val = 'id', short = null) =>
    items.map(i => `<option value="${i[val]}">${short && i[short] ? i[short] : i[label]}</option>`).join('')

  const modal = document.createElement('div')
  modal.id = 'modal-new-activity'
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40'
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-semibold text-primary mb-6">Nova Atividade</h2>
      <form id="form-new-activity" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Data</label>
            <input id="act-data" type="date" value="${today}" required
              class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Turno</label>
            <select id="act-turno" class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Cliente *</label>
          <select id="act-client" required class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Selecione o cliente...</option>
            ${opts(clients, 'nome', 'id', 'nome_curto')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Categoria *</label>
          <select id="act-category" required class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Selecione a categoria...</option>
            ${opts(categories)}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Responsável</label>
          <select id="act-employee" class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Selecione a funcionária...</option>
            ${opts(employees)}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Duração (minutos)</label>
            <input id="act-duracao" type="number" min="1" placeholder="Ex: 60"
              class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</label>
            <select id="act-status" class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="Concluido">Concluído</option>
              <option value="Parcial">Parcial</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Descrição</label>
          <textarea id="act-descricao" rows="3" placeholder="Descreva a atividade realizada..."
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"></textarea>
        </div>
        <div id="act-error" class="text-error text-xs hidden"></div>
        <div class="flex gap-3 pt-2">
          <button type="button" id="btn-act-cancel"
            class="flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors">
            Cancelar
          </button>
          <button type="submit"
            class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
            Salvar Atividade
          </button>
        </div>
      </form>
    </div>`

  document.body.appendChild(modal)
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })
  modal.querySelector('#btn-act-cancel').addEventListener('click', () => modal.remove())

  modal.querySelector('#form-new-activity').addEventListener('submit', async (e) => {
    e.preventDefault()
    const errorEl = modal.querySelector('#act-error')
    errorEl.classList.add('hidden')

    const clientId   = modal.querySelector('#act-client').value
    const categoryId = modal.querySelector('#act-category').value
    const employeeId = modal.querySelector('#act-employee').value || null
    const dataExec   = modal.querySelector('#act-data').value
    const turno      = modal.querySelector('#act-turno').value
    const duracao    = parseInt(modal.querySelector('#act-duracao').value, 10) || null
    const status     = modal.querySelector('#act-status').value
    const descricao  = modal.querySelector('#act-descricao').value.trim()

    if (!clientId || !categoryId || !dataExec) {
      errorEl.textContent = 'Preencha os campos obrigatórios: data, cliente e categoria.'
      errorEl.classList.remove('hidden')
      return
    }

    const submitBtn = modal.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = 'Salvando...'

    const { error } = await supabase.from('work_logs').insert({
      organization_id: ORG_ID,
      client_id:       clientId,
      category_id:     categoryId,
      employee_id:     employeeId,
      data_execucao:   dataExec,
      turno,
      duracao_minutos: duracao,
      status,
      descricao:       descricao || null,
      origem:          'Manual',
    })

    if (error) {
      errorEl.textContent = 'Erro ao salvar: ' + error.message
      errorEl.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Salvar Atividade'
      return
    }

    modal.remove()
    try {
      const logs = await fetchLogs()
      renderRows(logs, tbody)
      updateCountLabel(logs.length)
    } catch (_) {}
  })
}

init()
