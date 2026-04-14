import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, formatDate } from '../ui.js'

async function init() {
  await requireAuth()
  await loadClients()
}

async function loadClients() {
  const tbody = document.getElementById('clients-tbody')
  const kpiTotal = document.getElementById('kpi-total-clients')

  if (!tbody) return

  showLoading(tbody)

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', ORG_ID)
    .is('deleted_at', null)
    .eq('ativo', true)
    .order('nome')

  if (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-8 py-12 text-center text-error text-sm">
          <span class="material-symbols-outlined text-3xl block mb-2">error</span>
          Erro ao carregar clientes. Tente recarregar a página.
        </td>
      </tr>
    `
    return
  }

  if (kpiTotal) {
    kpiTotal.textContent = clients.length
  }

  updatePaginationCount(clients.length)

  if (!clients || clients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-8 py-16 text-center">
          <div class="flex flex-col items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-4 opacity-40">business_center</span>
            <p class="text-sm font-medium">Nenhum cliente cadastrado ainda.</p>
            <p class="text-xs mt-1 opacity-60">Clique em "Novo Cliente" para começar.</p>
          </div>
        </td>
      </tr>
    `
    return
  }

  tbody.innerHTML = clients.map(client => buildRow(client)).join('')
}

function buildRow(client) {
  const initials = (client.nome_curto || client.nome || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusBadge = client.ativo
    ? `<span class="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Ativo</span>`
    : `<span class="bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Inativo</span>`

  const contato = client.contato_nome
    ? `<p class="text-xs text-zinc-400">${client.contato_nome}</p>`
    : `<p class="text-xs text-zinc-400">${client.contato_email || '—'}</p>`

  return `
    <tr class="group hover:bg-surface-container-low/30 transition-colors cursor-pointer" onclick="window.location.href='client-detail.html?id=${client.id}'">
      <td class="px-8 py-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary font-bold text-sm">
            ${initials}
          </div>
          <div>
            <p class="text-sm font-medium text-on-surface">${escapeHtml(client.nome)}</p>
            ${contato}
          </div>
        </div>
      </td>
      <td class="py-5 px-6 text-sm text-on-surface-variant">
        ${client.contato_telefone ? escapeHtml(client.contato_telefone) : '—'}
      </td>
      <td class="py-5 px-6 text-center">
        ${statusBadge}
      </td>
      <td class="px-8 py-5 text-right">
        <a href="client-detail.html?id=${client.id}" class="text-primary hover:text-primary-container transition-colors" onclick="event.stopPropagation()">
          <span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
        </a>
      </td>
    </tr>
  `
}

function updatePaginationCount(total) {
  const countEl = document.getElementById('clients-count')
  if (countEl) {
    countEl.textContent = `Exibindo ${total} cliente${total !== 1 ? 's' : ''}`
  }
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
