import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { getMyRole, getMyProfileId } from '../auth.js'
import { showLoading, showEmpty, showError, formatDate } from '../ui.js'

// ─── Determina client_id ─────────────────────────────────────────────────────

function resolveClientId(user) {
  const role = getMyRole(user)
  if (role === 'client') {
    return getMyProfileId(user)
  }
  const params = new URLSearchParams(window.location.search)
  return params.get('client_id') || null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPeriod(inicio, fim) {
  if (!inicio && !fim) return '—'
  const fmt = (d) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '?'
  if (!fim) return fmt(inicio)
  return `${fmt(inicio)} – ${fmt(fim)}`
}

function tipoLabel(tipo) {
  const map = {
    semanal:  'Semanal',
    mensal:   'Mensal',
    trimestral: 'Trimestral',
    anual:    'Anual',
  }
  return map[tipo] || tipo || '—'
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderReports(reports) {
  const tbody = document.querySelector('table tbody')
  if (!tbody) return

  if (!reports || reports.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-4 opacity-40">description</span>
            <p class="text-sm font-medium">Nenhum relatório disponível ainda.</p>
          </div>
        </td>
      </tr>`
    return
  }

  tbody.innerHTML = reports.map((report) => {
    const period   = formatPeriod(report.periodo_inicio, report.periodo_fim)
    const tipo     = tipoLabel(report.tipo)
    const hasPdf   = !!report.pdf_url

    const statusHtml = report.enviado_em
      ? `<span class="inline-flex items-center px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold">
           <span class="w-1 h-1 rounded-full bg-tertiary mr-2"></span>ENVIADO
         </span>`
      : `<span class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
           <span class="w-1 h-1 rounded-full bg-zinc-400 mr-2"></span>PENDENTE
         </span>`

    const downloadHtml = hasPdf
      ? `<a href="${report.pdf_url}" target="_blank" rel="noopener"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all text-xs font-bold shadow-sm">
           <span class="material-symbols-outlined text-lg">download</span>
           Download PDF
         </a>`
      : `<span class="text-xs text-zinc-400 italic">Sem PDF</span>`

    return `
      <tr class="hover:bg-surface-container-low/30 transition-colors group">
        <td class="px-8 py-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <span class="material-symbols-outlined">event</span>
            </div>
            <div>
              <span class="font-semibold text-on-surface block">${period}</span>
              <span class="text-xs text-zinc-400">${tipo}</span>
            </div>
          </div>
        </td>
        <td class="px-8 py-6 text-on-surface-variant text-sm">${tipo}</td>
        <td class="px-8 py-6 text-center">${statusHtml}</td>
        <td class="px-8 py-6 text-right">${downloadHtml}</td>
      </tr>`
  }).join('')

  // Atualiza contador no footer da tabela
  const footerP = document.querySelector('.px-8.py-6.bg-surface-container-low\\/20 p')
  if (footerP) footerP.textContent = `Exibindo ${reports.length} relatório${reports.length !== 1 ? 's' : ''}.`
}

function renderInsightCard(reports) {
  // Atualiza o card "Última Atividade" com o total de relatórios
  const bigNumber = document.querySelector('.col-span-8 .text-3xl')
  if (bigNumber) {
    bigNumber.innerHTML = `${reports.length} relatório${reports.length !== 1 ? 's' : ''} <span class="text-tertiary text-sm font-medium bg-tertiary-container/30 px-2 py-1 rounded-full ml-2">disponíveis</span>`
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const user = await requireAuth()
  if (!user) return

  const clientId = resolveClientId(user)

  const tbody = document.querySelector('table tbody')
  if (tbody) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td></tr>`
  }

  try {
    let query = supabase
      .from('reports')
      .select('*')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query
    if (error) throw error

    const reports = data || []
    renderReports(reports)
    renderInsightCard(reports)

  } catch (err) {
    console.error('[portal-reports] init error', err)
    if (tbody) {
      tbody.innerHTML = `
        <tr><td colspan="4">
          <div class="flex flex-col items-center justify-center py-16 text-error">
            <span class="material-symbols-outlined text-5xl mb-4">error</span>
            <p class="text-sm font-medium">Erro ao carregar relatórios. Tente novamente.</p>
          </div>
        </td></tr>`
    }
  }
}

init()
