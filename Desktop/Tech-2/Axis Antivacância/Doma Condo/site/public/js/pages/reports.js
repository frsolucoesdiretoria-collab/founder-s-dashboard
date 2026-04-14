import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { formatDate } from '../ui.js'

// ─── State ───────────────────────────────────────────────────────────────────

let currentReports = []
let filterState = 'todos' // 'todos' | 'enviados' | 'pendentes'
let currentPage = 1
const PAGE_SIZE = 10

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPeriod(inicio, fim) {
  if (!inicio && !fim) return '—'
  const fmt = (d) => {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }
  if (inicio && fim) {
    const iSame = fmt(inicio) === fmt(fim)
    return iSame ? fmt(inicio) : `${fmt(inicio)} – ${fmt(fim)}`
  }
  return fmt(inicio) || fmt(fim)
}

function tipoLabel(tipo) {
  const map = {
    diario: 'Diário',
    semanal: 'Semanal',
    mensal: 'Mensal',
    personalizado: 'Personalizado',
  }
  return map[tipo] || tipo || '—'
}

function statusBadge(report) {
  if (report.enviado_em) {
    return `<span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-wider">ENVIADO</span>`
  }
  return `<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">PENDENTE</span>`
}

function showToast(message, type = 'success') {
  const existing = document.getElementById('reports-toast')
  if (existing) existing.remove()
  const colorMap = {
    success: 'bg-tertiary-container text-on-tertiary-container',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-secondary-container text-on-secondary-container',
  }
  const iconMap = { success: 'check_circle', error: 'error', info: 'info' }
  const toast = document.createElement('div')
  toast.id = 'reports-toast'
  toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-sm font-semibold ${colorMap[type] || colorMap.success}`
  toast.innerHTML = `<span class="material-symbols-outlined text-base">${iconMap[type] || 'check_circle'}</span>${message}`
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s'
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 300)
  }, 3500)
}

function exportCSV(reports) {
  const headers = ['Período', 'Cliente', 'Destinatário', 'Status', 'Enviado em']
  const rows = reports.map((r) => [
    formatPeriod(r.periodo_inicio, r.periodo_fim),
    r.clients?.nome || r.clients?.nome_curto || '—',
    r.destinatario || r.enviado_para || '—',
    r.enviado_em ? 'Enviado' : 'Pendente',
    r.enviado_em ? formatDate(r.enviado_em) : '—',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'relatorios-doma-condo.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function getFilteredReports() {
  if (filterState === 'enviados') return currentReports.filter((r) => r.enviado_em)
  if (filterState === 'pendentes') return currentReports.filter((r) => !r.enviado_em)
  return currentReports
}

function cycleFilter() {
  const cycle = { todos: 'enviados', enviados: 'pendentes', pendentes: 'todos' }
  filterState = cycle[filterState]
  currentPage = 1
  refreshTable()
  updateFilterButton()
}

function updateFilterButton() {
  const btn = document.getElementById('btn-filter')
  if (!btn) return
  const labelMap = {
    todos: '<span class="material-symbols-outlined text-base">filter_list</span>',
    enviados: '<span class="material-symbols-outlined text-base">filter_list</span> Enviados',
    pendentes: '<span class="material-symbols-outlined text-base">filter_list</span> Pendentes',
  }
  btn.innerHTML = labelMap[filterState]
  btn.classList.toggle('bg-primary', filterState !== 'todos')
  btn.classList.toggle('text-white', filterState !== 'todos')
  btn.classList.toggle('bg-surface-container-highest', filterState === 'todos')
  btn.classList.toggle('text-on-surface', filterState === 'todos')
}

// ─── Render ──────────────────────────────────────────────────────────────────

function renderRows(reports, tbody) {
  if (!reports || reports.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-4 opacity-40">assessment</span>
            <p class="text-sm font-medium">Nenhum relatório encontrado.</p>
          </div>
        </td>
      </tr>`
    updateMetrics(0, 0)
    return
  }

  tbody.innerHTML = reports.map((r) => {
    const periodo = formatPeriod(r.periodo_inicio, r.periodo_fim)
    const clienteNome = r.clients?.nome || r.clients?.nome_curto || '—'
    const tipo = tipoLabel(r.tipo)
    const destinatario = r.destinatario || r.enviado_para || '—'
    const pdfBtn = r.pdf_url
      ? `<a href="${r.pdf_url}" target="_blank" rel="noopener"
            class="text-primary hover:text-primary-container transition-colors" title="Visualizar PDF">
            <span class="material-symbols-outlined">visibility</span>
          </a>`
      : `<span class="text-zinc-300 cursor-not-allowed" title="PDF não disponível">
            <span class="material-symbols-outlined">visibility</span>
          </span>`

    return `
      <tr class="group hover:bg-surface-container-low/30 transition-colors">
        <td class="px-8 py-5">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-on-surface">${periodo}</span>
            <span class="text-xs text-zinc-400">${tipo}</span>
          </div>
        </td>
        <td class="px-8 py-5">
          <div class="flex flex-col">
            <span class="font-bold text-on-surface">${clienteNome}</span>
          </div>
        </td>
        <td class="px-8 py-5 text-sm font-medium text-on-surface">${destinatario}</td>
        <td class="px-8 py-5">${statusBadge(r)}</td>
        <td class="px-8 py-5 text-xs text-zinc-400">${r.enviado_em ? formatDate(r.enviado_em) : '—'}</td>
        <td class="px-8 py-5 text-right space-x-4">
          ${pdfBtn}
          <button class="text-primary hover:text-primary-container transition-colors" title="Enviar ao Cliente" data-action="send">
            <span class="material-symbols-outlined">send</span>
          </button>
        </td>
      </tr>`
  }).join('')
}

function refreshTable() {
  const tbody = document.querySelector('table tbody')
  if (!tbody) return

  const filtered = getFilteredReports()
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (currentPage > totalPages) currentPage = totalPages

  const start = (currentPage - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  renderRows(pageData, tbody)
  updateMetrics(currentReports.length,
    currentReports.filter((r) => r.enviado_em).length,
    currentReports.filter((r) => !r.enviado_em).length)
  updateTableCount(total, start + 1, Math.min(start + PAGE_SIZE, total))
  updatePagination(currentPage, totalPages)
}

function updateMetrics(total, enviados, pendentes = 0) {
  const kpiValues = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 .text-2xl.font-bold')
  if (kpiValues[0]) kpiValues[0].textContent = String(total).padStart(2, '0')
  if (kpiValues[1]) kpiValues[1].textContent = String(enviados).padStart(2, '0')
  if (kpiValues[2]) kpiValues[2].textContent = String(pendentes).padStart(2, '0')
}

function updateTableCount(total, from, to) {
  const footer = document.querySelector('.px-8.py-4 p')
  if (!footer) return
  if (total === 0) {
    footer.textContent = 'Nenhum relatório encontrado'
  } else {
    footer.textContent = `Mostrando ${from}–${to} de ${total} relatórios`
  }
}

function updatePagination(page, totalPages) {
  const btnAnterior = document.getElementById('btn-pag-anterior')
  const btnProximo = document.getElementById('btn-pag-proximo')
  const pageIndicators = document.querySelectorAll('[data-page-btn]')

  if (btnAnterior) {
    btnAnterior.disabled = page <= 1
    btnAnterior.classList.toggle('opacity-40', page <= 1)
    btnAnterior.classList.toggle('cursor-not-allowed', page <= 1)
  }
  if (btnProximo) {
    btnProximo.disabled = page >= totalPages
    btnProximo.classList.toggle('opacity-40', page >= totalPages)
    btnProximo.classList.toggle('cursor-not-allowed', page >= totalPages)
  }
  pageIndicators.forEach((btn) => {
    const p = parseInt(btn.dataset.pageBtn)
    btn.classList.toggle('bg-primary-container', p === page)
    btn.classList.toggle('text-on-primary-container', p === page)
    btn.classList.toggle('border-outline-variant', p !== page)
  })
}

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  const user = await requireAuth()
  if (!user) return

  const tbody = document.querySelector('table tbody')
  if (!tbody) return

  // Loading state
  tbody.innerHTML = `
    <tr>
      <td colspan="6">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td>
    </tr>`

  // Wire: Exportar Tudo
  const btnExport = document.getElementById('btn-export')
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (currentReports.length === 0) {
        showToast('Nenhum relatório disponível para exportar.', 'info')
        return
      }
      exportCSV(currentReports)
      showToast('Exportação concluída com sucesso!', 'success')
    })
  }

  // Wire: Filtrar
  const btnFilter = document.getElementById('btn-filter')
  if (btnFilter) {
    btnFilter.addEventListener('click', cycleFilter)
  }

  // Wire: Ver Agenda Completa
  const btnVerAgenda = document.getElementById('btn-ver-agenda')
  if (btnVerAgenda) {
    btnVerAgenda.addEventListener('click', () => {
      window.location.href = 'work-logs.html'
    })
  }

  // Wire: Paginação — Anterior / Próximo
  const btnAnterior = document.getElementById('btn-pag-anterior')
  const btnProximo = document.getElementById('btn-pag-proximo')
  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; refreshTable() }
    })
  }
  if (btnProximo) {
    btnProximo.addEventListener('click', () => {
      const filtered = getFilteredReports()
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
      if (currentPage < totalPages) { currentPage++; refreshTable() }
    })
  }

  // Wire: Page number buttons
  document.querySelectorAll('[data-page-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.pageBtn)
      if (!isNaN(p)) { currentPage = p; refreshTable() }
    })
  })

  // Wire: Send buttons via delegation
  tbody.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="send"]')) {
      showToast('Envio de email em desenvolvimento. Em breve disponível.', 'info')
    }
  })

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*, employees(nome), clients(nome, nome_curto)')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error
    currentReports = data || []
    refreshTable()
  } catch (err) {
    console.error('[reports] fetch error', err)
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="flex flex-col items-center justify-center py-16 text-error">
            <span class="material-symbols-outlined text-5xl mb-4">error</span>
            <p class="text-sm font-medium">Erro ao carregar relatórios. Tente novamente.</p>
          </div>
        </td>
      </tr>`
  }
}

init()
