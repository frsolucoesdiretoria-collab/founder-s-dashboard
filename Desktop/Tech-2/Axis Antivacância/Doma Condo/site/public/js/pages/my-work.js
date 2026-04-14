import { supabase, ORG_ID } from '../supabase-client.js'
import { requireAuth } from '../auth.js'
import { getMyProfileId } from '../auth.js'
import { showLoading, showEmpty, showError, formatDate, categoryBadge } from '../ui.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

function totalMinutes(logs) {
  return logs.reduce((acc, l) => acc + (l.duracao_minutos || 0), 0)
}

function sevenDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

function groupByDay(logs) {
  const groups = {}
  logs.forEach((log) => {
    const day = log.data_execucao || 'sem-data'
    if (!groups[day]) groups[day] = []
    groups[day].push(log)
  })
  // Retorna array de [dia, logs[]] ordenado desc
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

function formatDayLabel(dateStr) {
  if (!dateStr || dateStr === 'sem-data') return 'Sem data'
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Hoje'
  if (dateStr === yesterday) return 'Ontem'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

// ─── Render: lista de atividades agrupada por dia ────────────────────────────

function renderActivities(logs) {
  const listSection = document.querySelector('.space-y-6.pb-12')
  if (!listSection) return

  // Preserva o cabeçalho da seção (h3 + botão)
  const header = listSection.querySelector('.flex.items-center.justify-between')

  if (!logs || logs.length === 0) {
    const emptyDiv = document.createElement('div')
    showEmpty(emptyDiv, 'Nenhuma atividade nos últimos 7 dias.')
    // Remove o card antigo de atividades se existir
    const oldCard = listSection.querySelector('.bg-surface-container-lowest.rounded-xl')
    if (oldCard) oldCard.remove()
    listSection.appendChild(emptyDiv)
    return
  }

  const grouped = groupByDay(logs)

  const allGroupsHtml = grouped.map(([day, dayLogs]) => {
    const dayLabel = formatDayLabel(day)
    const dayMins  = totalMinutes(dayLogs)

    const rowsHtml = dayLogs.map((log) => {
      const catNome = log.categories?.nome || '—'
      const catCor  = log.categories?.cor  || '#E5E7EB'
      const clientName = log.clients?.nome_curto || log.clients?.nome || '—'
      const duration = formatDuration(log.duracao_minutos)

      return `
        <div class="group px-6 py-5 flex items-center gap-6 hover:bg-surface-container-low transition-colors border-t border-surface-container/30 first:border-0">
          <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant flex-shrink-0">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <div class="flex-1 grid grid-cols-4 gap-4 items-center">
            <div class="flex flex-col">
              ${categoryBadge(catNome, catCor)}
              <span class="text-on-surface font-semibold text-sm mt-1">${log.descricao || catNome}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Condomínio</span>
              <span class="text-on-surface font-medium text-sm">${clientName}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duração</span>
              <span class="text-on-surface font-medium text-sm">${duration}</span>
            </div>
            <div class="flex justify-end">
              <span class="text-xs text-zinc-400">${log.turno || ''}</span>
            </div>
          </div>
        </div>`
    }).join('')

    return `
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2 px-1">
          <span class="text-xs font-bold text-zinc-500 uppercase tracking-widest capitalize">${dayLabel}</span>
          <span class="text-xs text-zinc-400">${formatDuration(dayMins)} • ${dayLogs.length} atividade${dayLogs.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)] overflow-hidden">
          ${rowsHtml}
        </div>
      </div>`
  }).join('')

  // Remove card antigo de atividades
  const oldCard = listSection.querySelector('.bg-surface-container-lowest.rounded-xl')
  if (oldCard) oldCard.remove()

  // Injeta grupos
  const fragment = document.createElement('div')
  fragment.innerHTML = allGroupsHtml
  listSection.appendChild(fragment)
}

// ─── Render: KPIs ─────────────────────────────────────────────────────────────

function renderKpis(logs) {
  const cards = document.querySelectorAll('section.grid.grid-cols-1.md\\:grid-cols-4 > div')
  if (!cards || cards.length === 0) return

  const today = new Date().toISOString().split('T')[0]
  const todayLogs  = logs.filter((l) => l.data_execucao === today)
  const totalMins  = totalMinutes(logs)

  // Card 1: Produtividade (hoje)
  const card1Val = cards[0]?.querySelector('p.text-2xl')
  if (card1Val) {
    card1Val.innerHTML = `${todayLogs.length} <span class="text-sm font-medium text-on-surface-variant">atividades hoje</span>`
  }

  // Card 2: Semanal
  const card2Val = cards[1]?.querySelector('p.text-2xl')
  if (card2Val) {
    card2Val.innerHTML = `${formatDuration(totalMins)} <span class="text-sm font-medium text-on-surface-variant">esta semana</span>`
  }

  // Card destaque: total de registros
  const card3Desc = cards[2]?.querySelector('p.text-sm')
  if (card3Desc) {
    card3Desc.textContent = `${logs.length} atividades registradas nos últimos 7 dias.`
  }
}

// ─── Render: nome no header ───────────────────────────────────────────────────

async function renderUserName(employeeId) {
  if (!employeeId) return
  const { data } = await supabase
    .from('employees')
    .select('nome')
    .eq('id', employeeId)
    .single()

  if (!data) return

  const nameEl = document.querySelector('header p.text-sm.font-semibold')
  if (nameEl) nameEl.textContent = data.nome

  // Atualiza avatar com iniciais
  const avatarEl = document.querySelector('.h-10.w-10.rounded-full.bg-\\[\\#FAC826\\]')
  if (avatarEl) {
    const initials = data.nome
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
    avatarEl.textContent = initials
  }
}

// ─── Formulário de Novo Registro ─────────────────────────────────────────────

async function initForm(employeeId) {
  const [clientsRes, categoriesRes] = await Promise.all([
    supabase.from('clients').select('id, nome, nome_curto').eq('organization_id', ORG_ID).is('deleted_at', null).order('nome'),
    supabase.from('categories').select('id, nome').eq('organization_id', ORG_ID).is('deleted_at', null).order('nome'),
  ])

  const clientSel = document.getElementById('log-client')
  const catSel    = document.getElementById('log-category')

  if (clientSel && clientsRes.data) {
    clientsRes.data.forEach((c) => {
      const opt = new Option(c.nome_curto || c.nome, c.id)
      clientSel.add(opt)
    })
  }
  if (catSel && categoriesRes.data) {
    categoriesRes.data.forEach((c) => {
      const opt = new Option(c.nome, c.id)
      catSel.add(opt)
    })
  }

  const form = document.getElementById('form-new-log')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const errorEl = document.getElementById('log-error')
    if (errorEl) errorEl.classList.add('hidden')

    const clientId   = document.getElementById('log-client')?.value
    const categoryId = document.getElementById('log-category')?.value
    const duracao    = parseInt(document.getElementById('log-duracao')?.value, 10) || null
    const status     = document.getElementById('log-status')?.value || 'Concluido'
    const descricao  = document.getElementById('log-descricao')?.value?.trim()

    if (!clientId || !categoryId) {
      if (errorEl) {
        errorEl.textContent = 'Selecione o cliente e a categoria.'
        errorEl.classList.remove('hidden')
      }
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]')
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm">hourglass_empty</span> Salvando...`
    }

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.from('work_logs').insert({
      organization_id: ORG_ID,
      employee_id:     employeeId || null,
      client_id:       clientId,
      category_id:     categoryId,
      data_execucao:   today,
      turno:           new Date().getHours() < 13 ? 'manha' : 'tarde',
      duracao_minutos: duracao,
      status,
      descricao:       descricao || null,
      origem:          'Manual',
    })

    if (submitBtn) {
      submitBtn.disabled = false
      submitBtn.innerHTML = `<span class="material-symbols-outlined" data-icon="save">save</span> + Registrar Atividade`
    }

    if (error) {
      if (errorEl) {
        errorEl.textContent = 'Erro ao salvar: ' + error.message
        errorEl.classList.remove('hidden')
      }
      return
    }

    form.reset()

    try {
      const since = sevenDaysAgo()
      let query = supabase
        .from('work_logs')
        .select('*, clients(nome_curto, nome), categories(nome, cor)')
        .eq('organization_id', ORG_ID)
        .is('deleted_at', null)
        .gte('data_execucao', since)
        .order('data_execucao', { ascending: false })
      if (employeeId) query = query.eq('employee_id', employeeId)
      const { data: logs } = await query
      renderKpis(logs || [])
      renderActivities(logs || [])
    } catch (_) {}
  })
}

async function init() {
  const user = await requireAuth()
  if (!user) return

  const employeeId = getMyProfileId(user)

  const listSection = document.querySelector('.space-y-6.pb-12')
  const oldCard = listSection?.querySelector('.bg-surface-container-lowest.rounded-xl')
  if (oldCard) showLoading(oldCard)

  try {
    const since = sevenDaysAgo()

    let query = supabase
      .from('work_logs')
      .select('*, clients(nome_curto, nome), categories(nome, cor)')
      .eq('organization_id', ORG_ID)
      .is('deleted_at', null)
      .gte('data_execucao', since)
      .order('data_execucao', { ascending: false })
      .order('created_at', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const [logsResult] = await Promise.all([
      query,
      employeeId ? renderUserName(employeeId) : Promise.resolve(),
    ])

    if (logsResult.error) throw logsResult.error

    const logs = logsResult.data || []

    renderKpis(logs)
    renderActivities(logs)

  } catch (err) {
    console.error('[my-work] init error', err)
    if (listSection) {
      const errDiv = document.createElement('div')
      showError(errDiv, 'Erro ao carregar atividades. Tente novamente.')
      listSection.appendChild(errDiv)
    }
  }

  initForm(employeeId)
}
