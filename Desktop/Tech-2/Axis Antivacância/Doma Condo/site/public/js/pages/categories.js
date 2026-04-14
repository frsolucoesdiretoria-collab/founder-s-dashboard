import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { showLoading, showEmpty, showError } from '../ui.js'

// ─── Render ──────────────────────────────────────────────────────────────────

function renderRows(categories, tbody) {
  if (!categories || categories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl mb-4 opacity-40">category</span>
            <p class="text-sm font-medium">Nenhuma categoria cadastrada.</p>
          </div>
        </td>
      </tr>`
    return
  }

  tbody.innerHTML = categories.map((cat) => {
    const cor = cat.cor || '#E5E7EB'
    const ativoLabel = cat.ativa !== false ? 'Ativo' : 'Inativo'
    const ativoBadge = cat.ativa !== false
      ? `<span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Ativo</span>`
      : `<span class="px-3 py-1 bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase tracking-wider">Inativo</span>`

    return `
      <tr class="group hover:bg-surface-container-low/30 transition-colors" data-id="${cat.id}">
        <td class="py-5">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span class="material-symbols-outlined">label</span>
            </div>
            <span class="text-sm font-medium text-on-surface">${cat.nome}</span>
          </div>
        </td>
        <td class="py-5 text-center px-8">
          <div class="flex justify-center">
            <div class="w-4 h-4 rounded-full ring-4" style="background-color: ${cor}; ring-color: ${cor}33;"></div>
          </div>
        </td>
        <td class="py-5 text-center px-8">
          <span class="text-sm font-medium py-1 px-3 bg-surface-container-high rounded-full">—</span>
        </td>
        <td class="py-5 px-8">${ativoBadge}</td>
        <td class="py-5 text-right">
          <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant btn-edit" data-id="${cat.id}">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button class="p-2 hover:bg-error-container rounded-lg text-error btn-delete" data-id="${cat.id}">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </td>
      </tr>`
  }).join('')

  updateCountLabel(categories.length)
}

function updateCountLabel(count) {
  const label = document.querySelector('.pt-6.border-t p.text-xs')
  if (label) label.textContent = `Mostrando ${count} de ${count} categorias registradas`

  // Also update KPI card
  const kpiCard = document.querySelector('[data-kpi="total"]')
  if (kpiCard) kpiCard.textContent = String(count).padStart(2, '0')
}

// ─── Modal de Nova Categoria ─────────────────────────────────────────────────

function buildModal() {
  const existing = document.getElementById('modal-new-category')
  if (existing) return existing

  const modal = document.createElement('div')
  modal.id = 'modal-new-category'
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 hidden'
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
      <h2 class="text-xl font-semibold text-primary mb-6">Nova Categoria</h2>
      <form id="form-new-category" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nome</label>
          <input id="cat-nome" type="text" required
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ex: Financeiro" />
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Descrição</label>
          <input id="cat-descricao" type="text"
            class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Descrição opcional" />
        </div>
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Cor</label>
            <input id="cat-cor" type="color" value="#FAC826"
              class="h-10 w-full rounded-lg border border-outline-variant cursor-pointer" />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ordem</label>
            <input id="cat-ordem" type="number" value="0" min="0"
              class="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div id="form-error" class="text-error text-xs hidden"></div>
        <div class="flex gap-3 pt-2">
          <button type="button" id="btn-modal-cancel"
            class="flex-1 py-2.5 rounded-lg border border-outline-variant text-sm font-semibold hover:bg-surface-container-low transition-colors">
            Cancelar
          </button>
          <button type="submit"
            class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
            Salvar
          </button>
        </div>
      </form>
    </div>`

  document.body.appendChild(modal)

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden')
  })
  modal.querySelector('#btn-modal-cancel').addEventListener('click', () => {
    modal.classList.add('hidden')
  })

  return modal
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
      <td colspan="5">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </td>
    </tr>`

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('organization_id', ORG_ID)
      .is('deleted_at', null)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('nome')

    if (error) throw error
    renderRows(data || [], tbody)
    wireActions(tbody)
  } catch (err) {
    console.error('[categories] fetch error', err)
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="flex flex-col items-center justify-center py-16 text-error">
            <span class="material-symbols-outlined text-5xl mb-4">error</span>
            <p class="text-sm font-medium">Erro ao carregar categorias. Tente novamente.</p>
          </div>
        </td>
      </tr>`
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

function wireActions(tbody) {
  // "Nova Categoria" button — find any button with add_circle icon
  const btnAdd = document.querySelector('[data-icon="add_circle"]')?.closest('button')
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openNewModal(tbody))
  }

  // Delegate edit/delete clicks inside tbody
  tbody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.btn-edit')
    const deleteBtn = e.target.closest('.btn-delete')

    if (deleteBtn) {
      const id = deleteBtn.dataset.id
      if (!confirm('Deseja remover esta categoria?')) return
      await softDelete(id, tbody)
    }
  })
}

async function softDelete(id, tbody) {
  const { error } = await supabase
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[categories] delete error', error)
    alert('Erro ao remover categoria.')
    return
  }

  // Remove row from DOM immediately
  const row = tbody.querySelector(`tr[data-id="${id}"]`)
  if (row) row.remove()

  // Update count
  const remaining = tbody.querySelectorAll('tr[data-id]').length
  updateCountLabel(remaining)
}

function openNewModal(tbody) {
  const modal = buildModal()
  modal.classList.remove('hidden')

  const form = modal.querySelector('#form-new-category')
  const errorEl = modal.querySelector('#form-error')

  // Reset form
  form.reset()
  errorEl.classList.add('hidden')
  modal.querySelector('#cat-cor').value = '#FAC826'
  modal.querySelector('#cat-ordem').value = '0'

  // Handle submit
  const onSubmit = async (e) => {
    e.preventDefault()
    const nome = modal.querySelector('#cat-nome').value.trim()
    const descricao = modal.querySelector('#cat-descricao').value.trim()
    const cor = modal.querySelector('#cat-cor').value
    const ordem = parseInt(modal.querySelector('#cat-ordem').value, 10) || 0

    if (!nome) return

    errorEl.classList.add('hidden')

    const { error } = await supabase.from('categories').insert({
      organization_id: ORG_ID,
      nome,
      descricao: descricao || null,
      cor,
      ordem,
      ativa: true,
    })

    if (error) {
      errorEl.textContent = 'Erro ao salvar: ' + error.message
      errorEl.classList.remove('hidden')
      return
    }

    modal.classList.add('hidden')
    form.removeEventListener('submit', onSubmit)

    // Refresh list
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('organization_id', ORG_ID)
      .is('deleted_at', null)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('nome')

    renderRows(data || [], tbody)
    wireActions(tbody)
  }

  form.addEventListener('submit', onSubmit)
}

init()
