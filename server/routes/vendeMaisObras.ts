// Vende Mais Obras - Routes

import { Router } from 'express';
import { validateAdminPasscode } from '../lib/guards';
import { 
  authenticateJWT, 
  requireUsuario, 
  hashPassword, 
  verifyPassword, 
  generateToken 
} from '../lib/auth';
import {
  getServicos,
  getServicoById,
  createServico,
  updateServico,
  deleteServico,
  getUsuarioByEmail,
  getUsuarioById,
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  getOrcamentosByUsuario,
  getOrcamentoById,
  createOrcamento,
  updateOrcamento,
  deleteOrcamento,
  getClientesByUsuario,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getLeads,
  getAllLeads,
  createLead,
  updateLeadStatus,
  getVendeMaisObrasMetricas
} from '../lib/notionDataLayer';

export const vendeMaisObrasRouter = Router();

function requireAdmin(req: any, res: any): boolean {
  const passcode = req.headers['x-admin-passcode'] as string | undefined;
  if (!validateAdminPasscode(passcode)) {
    res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
    return false;
  }
  return true;
}

// ==========================================
// HEALTH CHECK
// ==========================================

vendeMaisObrasRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vende Mais Obras' });
});

// ==========================================
// PUBLIC ROUTES (no authentication)
// ==========================================

// Listar serviços (público)
vendeMaisObrasRouter.get('/servicos', async (req, res) => {
  try {
    const categoria = req.query.categoria as string | undefined;
    const ativo = req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined;
    const servicos = await getServicos(categoria, ativo);
    res.json(servicos);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch servicos', message: error.message });
  }
});

// Detalhes de um serviço (público)
vendeMaisObrasRouter.get('/servicos/:id', async (req, res) => {
  try {
    const servico = await getServicoById(req.params.id);
    if (!servico) {
      res.status(404).json({ error: 'Serviço não encontrado' });
      return;
    }
    res.json(servico);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch servico', message: error.message });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Cadastro de novo usuário
vendeMaisObrasRouter.post('/auth/register', async (req, res) => {
  try {
    const { Nome, Email, Telefone, Password } = req.body;

    if (!Nome || !Email || !Password) {
      res.status(400).json({ error: 'Nome, Email e Password são obrigatórios' });
      return;
    }

    // Verificar se email já existe
    const existing = await getUsuarioByEmail(Email);
    if (existing) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }

    // Hash da senha
    const passwordHash = await hashPassword(Password);

    // Criar usuário
    const usuario = await createUsuario({ Nome, Email, Telefone, Status: 'Trial' }, passwordHash);

    // Gerar token
    const token = generateToken(usuario.id, usuario.Email || '');

    // Remover PasswordHash da resposta
    const { PasswordHash, ...usuarioResponse } = usuario;

    res.status(201).json({
      usuario: usuarioResponse,
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to register', message: error.message });
  }
});

// Login
vendeMaisObrasRouter.post('/auth/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      res.status(400).json({ error: 'Email e Password são obrigatórios' });
      return;
    }

    // Buscar usuário
    const usuario = await getUsuarioByEmail(Email);
    if (!usuario || !usuario.PasswordHash) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Verificar senha
    const passwordValid = await verifyPassword(Password, usuario.PasswordHash);
    if (!passwordValid) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Verificar se usuário está ativo
    if (usuario.Status === 'Bloqueado' || usuario.Status === 'Cancelado') {
      res.status(403).json({ error: 'Conta bloqueada ou cancelada' });
      return;
    }

    // Atualizar último acesso
    await updateUsuario(usuario.id, { LastAccessAt: new Date().toISOString() });

    // Gerar token
    const token = generateToken(usuario.id, usuario.Email || '');

    // Remover PasswordHash da resposta
    const { PasswordHash, ...usuarioResponse } = usuario;

    res.json({
      usuario: usuarioResponse,
      token
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to login', message: error.message });
  }
});

// Dados do usuário logado
vendeMaisObrasRouter.get('/auth/me', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const usuario = await getUsuarioById(usuarioId);
    
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Remover PasswordHash da resposta
    const { PasswordHash, ...usuarioResponse } = usuario;
    res.json(usuarioResponse);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch usuario', message: error.message });
  }
});

// Atualizar perfil do usuário
vendeMaisObrasRouter.put('/auth/profile', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const { Nome, Telefone, Password } = req.body;

    const updates: any = {};
    if (Nome !== undefined) updates.Nome = Nome;
    if (Telefone !== undefined) updates.Telefone = Telefone;

    let passwordHash: string | undefined;
    if (Password) {
      passwordHash = await hashPassword(Password);
    }

    const usuario = await updateUsuario(usuarioId, updates, passwordHash);

    // Remover PasswordHash da resposta
    const { PasswordHash, ...usuarioResponse } = usuario;
    res.json(usuarioResponse);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile', message: error.message });
  }
});

// ==========================================
// ORÇAMENTOS (autenticado, isolado por usuário)
// ==========================================

// Listar orçamentos do usuário
vendeMaisObrasRouter.get('/orcamentos', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const orcamentos = await getOrcamentosByUsuario(usuarioId);
    res.json(orcamentos);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orcamentos', message: error.message });
  }
});

// Detalhes de um orçamento
vendeMaisObrasRouter.get('/orcamentos/:id', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const orcamento = await getOrcamentoById(req.params.id, usuarioId);
    
    if (!orcamento) {
      res.status(404).json({ error: 'Orçamento não encontrado' });
      return;
    }
    
    res.json(orcamento);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orcamento', message: error.message });
  }
});

// Criar orçamento
vendeMaisObrasRouter.post('/orcamentos', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const { ClienteId, Numero, Status, Total, Itens, Observacoes, Validade } = req.body;

    if (!ClienteId || !Total || !Itens) {
      res.status(400).json({ error: 'ClienteId, Total e Itens são obrigatórios' });
      return;
    }

    const orcamento = await createOrcamento({
      UsuarioId: usuarioId,
      ClienteId,
      Numero,
      Status: Status || 'Rascunho',
      Total,
      Itens,
      Observacoes,
      Validade
    });

    res.status(201).json(orcamento);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create orcamento', message: error.message });
  }
});

// Atualizar orçamento
vendeMaisObrasRouter.put('/orcamentos/:id', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const orcamento = await updateOrcamento(req.params.id, req.body, usuarioId);
    res.json(orcamento);
  } catch (error: any) {
    if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update orcamento', message: error.message });
  }
});

// Deletar orçamento
vendeMaisObrasRouter.delete('/orcamentos/:id', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    await deleteOrcamento(req.params.id, usuarioId);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to delete orcamento', message: error.message });
  }
});

// ==========================================
// CLIENTES (autenticado, isolado por usuário)
// ==========================================

// Listar clientes do usuário
vendeMaisObrasRouter.get('/clientes', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const clientes = await getClientesByUsuario(usuarioId);
    res.json(clientes);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch clientes', message: error.message });
  }
});

// Detalhes de um cliente
vendeMaisObrasRouter.get('/clientes/:id', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const cliente = await getClienteById(req.params.id, usuarioId);
    
    if (!cliente) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }
    
    res.json(cliente);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch cliente', message: error.message });
  }
});

// Criar cliente
vendeMaisObrasRouter.post('/clientes', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const { Nome, Email, Telefone, Documento, Endereco, Cidade, Estado } = req.body;

    console.log('[POST /clientes] usuarioId do token:', usuarioId);
    console.log('[POST /clientes] Dados recebidos:', { Nome, Email, Telefone, Documento, Endereco, Cidade, Estado });

    if (!Nome) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    if (!usuarioId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const cliente = await createCliente({
      UsuarioId: usuarioId,
      Nome,
      Email,
      Telefone,
      Documento,
      Endereco,
      Cidade,
      Estado
    });

    console.log('[POST /clientes] Cliente criado com sucesso:', cliente.id);
    res.status(201).json(cliente);
  } catch (error: any) {
    console.error('[POST /clientes] Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Failed to create cliente', message: error.message });
  }
});

// Atualizar cliente
vendeMaisObrasRouter.put('/clientes/:id', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    const cliente = await updateCliente(req.params.id, req.body, usuarioId);
    res.json(cliente);
  } catch (error: any) {
    if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update cliente', message: error.message });
  }
});

// Deletar cliente
vendeMaisObrasRouter.delete('/clientes/:id', authenticateJWT, requireUsuario, async (req, res) => {
  try {
    const usuarioId = (req as any).usuarioId;
    await deleteCliente(req.params.id, usuarioId);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('não encontrado') || error.message.includes('não pertence')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to delete cliente', message: error.message });
  }
});

// ==========================================
// ADMIN ROUTES (requerem admin passcode)
// ==========================================

// Listar todos os leads
vendeMaisObrasRouter.get('/admin/leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const status = req.query.status as string | undefined;
    const leads = status ? await getLeads(status) : await getAllLeads();
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

// Criar lead
vendeMaisObrasRouter.post('/admin/leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const lead = await createLead(req.body);
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create lead', message: error.message });
  }
});

// Atualizar status do lead
vendeMaisObrasRouter.put('/admin/leads/:id/status', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status é obrigatório' });
      return;
    }
    const lead = await updateLeadStatus(req.params.id, status);
    res.json(lead);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update lead', message: error.message });
  }
});

// Listar todos os usuários
vendeMaisObrasRouter.get('/admin/usuarios', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const usuarios = await getAllUsuarios();
    // Remover PasswordHash de todos os usuários
    const usuariosResponse = usuarios.map(({ PasswordHash, ...usuario }) => usuario);
    res.json(usuariosResponse);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch usuarios', message: error.message });
  }
});

// Métricas do funil
vendeMaisObrasRouter.get('/admin/metricas', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const metricas = await getVendeMaisObrasMetricas();
    res.json(metricas);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch metricas', message: error.message });
  }
});

// Criar serviço (admin)
vendeMaisObrasRouter.post('/admin/servicos', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const servico = await createServico(req.body);
    res.status(201).json(servico);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create servico', message: error.message });
  }
});

// Atualizar serviço (admin)
vendeMaisObrasRouter.put('/admin/servicos/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const servico = await updateServico(req.params.id, req.body);
    res.json(servico);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update servico', message: error.message });
  }
});

// Deletar serviço (admin)
vendeMaisObrasRouter.delete('/admin/servicos/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await deleteServico(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete servico', message: error.message });
  }
});

// ==========================================
// LEGACY ROUTES (mantidas para compatibilidade)
// ==========================================

vendeMaisObrasRouter.get('/leads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const leads = await getAllLeads();
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

vendeMaisObrasRouter.get('/usuarios', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const usuarios = await getAllUsuarios();
    const usuariosResponse = usuarios.map(({ PasswordHash, ...usuario }) => usuario);
    res.json(usuariosResponse);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch usuarios', message: error.message });
  }
});

vendeMaisObrasRouter.get('/orcamentos', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    // Admin pode ver todos os orçamentos
    // Mas isso não deve ser usado normalmente - usar /admin/usuarios/:id/orcamentos
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orcamentos', message: error.message });
  }
});

vendeMaisObrasRouter.get('/metricas', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const metricas = await getVendeMaisObrasMetricas();
    res.json(metricas);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch metricas', message: error.message });
  }
});

// Setup endpoint (criar databases - será implementado em script separado)
vendeMaisObrasRouter.post('/setup', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    res.json({
      success: true,
      message: 'Setup endpoint - Use o script server/scripts/setupVendeMaisObras.ts para criar as databases',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to setup', message: error.message });
  }
});

// Rota para popular serviços SINAPI (requer admin passcode)
vendeMaisObrasRouter.post('/admin/populate-sinapi', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { populateServices } = await import('../scripts/populateSINAPIServices');
    await populateServices();
    
    res.json({
      success: true,
      message: 'Serviços SINAPI populados com sucesso',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to populate SINAPI', message: error.message });
  }
});
