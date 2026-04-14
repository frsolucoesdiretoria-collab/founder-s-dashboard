import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { formatDate } from '../ui.js'

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
          <button class="text-primary hover:text-primary-container transition-colors" title="Enviar ao Cliente">
            <span class="material-symbols-outlined">send</span>
          </button>
        </td>
      </tr>`
  }).join('')

  const enviados = reports.filter((r) => r.enviado_em).length
  const pendentes = reports.length - enviados
  updateMetrics(reports.length, enviados, pendentes)
  updateTableCount(reports.length)
}

function updateMetrics(total, enviados, pendentes = 0) {
  // KPI cards — select by position (index 0 = total, 1 = enviados, 2 = pendentes)
  const kpiValues = document.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-3 .text-2xl.font-bold')
  if (kpiValues[0]) kpiValues[0].textContent = String(total).padStart(2, '0')
  if (kpiValues[1]) kpiValues[1].textContent = String(enviados).padStart(2, '0')
  if (kpiValues[2]) kpiValues[2].textContent = String(pendentes).padStart(2, '0')
}

function updateTableCount(count) {
  const footer = document.querySelector('.px-8.py-4 p')
  if (footer) footer.textContent = `Mostrando ${count} relatórios`
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

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*, employees(nome), clients(nome, nome_curto)')
      .eq('organization_id', ORG_ID)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error
    renderRows(data || [], tbody)
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
