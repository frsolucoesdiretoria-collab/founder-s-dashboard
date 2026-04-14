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

init()
