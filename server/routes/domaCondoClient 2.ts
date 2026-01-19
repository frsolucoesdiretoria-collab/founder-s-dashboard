// DOMA CONDO Client Routes
import { Router, Request, Response } from 'express';
import { generateToken, verifyToken, extractToken } from '../lib/auth';
import {
  getClientById,
  getClientByLogin,
  validateCredentials,
  getRelatorioByClienteAndMes,
} from '../lib/domaCondoClientData';
import type { DomaCondoClient } from '../../src/types/domaCondoClient';

export const domaCondoClientRouter = Router();

// Interface para request com cliente autenticado
interface AuthenticatedRequest extends Request {
  clienteId?: string;
  cliente?: DomaCondoClient;
}

/**
 * Middleware para autenticar cliente via JWT
 */
function authenticateClient(req: AuthenticatedRequest, res: Response, next: () => void): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  // Buscar cliente pelo ID do token (payload.usuarioId contém o clienteId)
  const cliente = getClientById(payload.usuarioId);
  if (!cliente) {
    res.status(401).json({ error: 'Cliente não encontrado' });
    return;
  }

  req.clienteId = payload.usuarioId;
  req.cliente = cliente;
  next();
}

/**
 * POST /api/doma-condo-clientes/auth/login
 * Login do cliente
 */
domaCondoClientRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    const cliente = validateCredentials(login, password);
    if (!cliente) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = generateToken(cliente.id, cliente.email);

    res.json({
      token,
      cliente: {
        id: cliente.id,
        name: cliente.name,
        email: cliente.email,
        login: cliente.login,
        createdAt: cliente.createdAt,
        active: cliente.active,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

/**
 * GET /api/doma-condo-clientes/auth/me
 * Obter dados do cliente autenticado
 */
domaCondoClientRouter.get('/auth/me', authenticateClient, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.cliente) {
      return res.status(401).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      id: req.cliente.id,
      name: req.cliente.name,
      email: req.cliente.email,
      login: req.cliente.login,
      createdAt: req.cliente.createdAt,
      active: req.cliente.active,
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Erro ao obter dados do cliente' });
  }
});

/**
 * GET /api/doma-condo-clientes/relatorio/:mesReferencia
 * Obter relatório mensal do cliente autenticado
 */
domaCondoClientRouter.get('/relatorio/:mesReferencia', authenticateClient, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mesReferencia } = req.params;
    const clienteId = req.clienteId!;

    if (!mesReferencia || !/^\d{4}-\d{2}$/.test(mesReferencia)) {
      return res.status(400).json({ error: 'Formato de mês inválido. Use YYYY-MM' });
    }

    const relatorio = getRelatorioByClienteAndMes(clienteId, mesReferencia);
    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado para este período' });
    }

    // Garantir que o relatório pertence ao cliente autenticado
    if (relatorio.cliente.id !== clienteId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(relatorio);
  } catch (error: any) {
    console.error('Get relatorio error:', error);
    res.status(500).json({ error: 'Erro ao obter relatório' });
  }
});

/**
 * PUT /api/doma-condo-clientes/relatorio/:mesReferencia
 * Atualizar textos do relatório (apenas admin/Jéssica - por enquanto desabilitado para clientes)
 */
domaCondoClientRouter.put('/relatorio/:mesReferencia', authenticateClient, (req: AuthenticatedRequest, res: Response) => {
  try {
    // Por enquanto, clientes não podem editar relatórios
    // Esta funcionalidade será para admin/Jéssica
    return res.status(403).json({ error: 'Edição de relatórios não permitida para clientes' });
    
    // Código futuro para permitir edição:
    // const { mesReferencia } = req.params;
    // const { textos } = req.body;
    // const clienteId = req.clienteId!;
    // 
    // // Atualizar textos no banco de dados
    // // ...
    // 
    // res.json({ success: true });
  } catch (error: any) {
    console.error('Update relatorio error:', error);
    res.status(500).json({ error: 'Erro ao atualizar relatório' });
  }
});

