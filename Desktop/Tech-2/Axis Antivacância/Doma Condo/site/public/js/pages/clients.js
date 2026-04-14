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

// ─── Novo Cliente ─────────────────────────────────────────────────────────────

function wireNewClientButton() {
  const btns = document.querySelectorAll('button')
  for (const btn of btns) {
    if (btn.textContent.includes('Novo Cliente')) {
      btn.addEventListener('click', openNewClientModal)
      break
    }
  }
}

function openNewClientModal() {
  const existing = document.getElementById('modal-new-client')
  if (existing) existing.remove()

  const modal = document.createElement('div')
  modal.id = 'modal-new-client'
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40'
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
      <h2 class="text-xl font-semibold text-primary mb-6">Novo Cliente</h2>
      <form id="form-new-client" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nome completo *</label>
          <input id="client-nome" type="text" required placeholder="Ex: Condomínio Oceano Azul"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nome curto</label>
          <input id="client-nome-curto" type="text" placeholder="Ex: Oceano Azul"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Contato — Nome</label>
          <input id="client-contato-nome" type="text" placeholder="Nome do síndico ou responsável"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Contato — Email</label>
          <input id="client-contato-email" type="email" placeholder="email@condominio.com.br"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Contato — Telefone</label>
          <input id="client-contato-telefone" type="tel" placeholder="(11) 99999-9999"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div id="client-error" class="text-error text-xs hidden"></div>
        <div class="flex gap-3 pt-2">
          <button type="button" id="btn-client-cancel"
            class="flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors">
            Cancelar
          </button>
          <button type="submit"
            class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
            Cadastrar Cliente
          </button>
        </div>
      </form>
    </div>`

  document.body.appendChild(modal)
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })
  modal.querySelector('#btn-client-cancel').addEventListener('click', () => modal.remove())

  modal.querySelector('#form-new-client').addEventListener('submit', async (e) => {
    e.preventDefault()
    const errorEl = modal.querySelector('#client-error')
    errorEl.classList.add('hidden')

    const nome         = modal.querySelector('#client-nome').value.trim()
    const nomeCurto    = modal.querySelector('#client-nome-curto').value.trim()
    const contatoNome  = modal.querySelector('#client-contato-nome').value.trim()
    const contatoEmail = modal.querySelector('#client-contato-email').value.trim()
    const contatoTel   = modal.querySelector('#client-contato-telefone').value.trim()

    if (!nome) {
      errorEl.textContent = 'O nome do cliente é obrigatório.'
      errorEl.classList.remove('hidden')
      return
    }

    const submitBtn = modal.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = 'Salvando...'

    const { error } = await supabase.from('clients').insert({
      organization_id:  ORG_ID,
      nome,
      nome_curto:       nomeCurto || null,
      contato_nome:     contatoNome || null,
      contato_email:    contatoEmail || null,
      contato_telefone: contatoTel || null,
      ativo:            true,
    })

    if (error) {
      errorEl.textContent = 'Erro ao cadastrar: ' + error.message
      errorEl.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Cadastrar Cliente'
      return
    }

    modal.remove()
    await loadClients()
  })
}

init()
wireNewClientButton()
