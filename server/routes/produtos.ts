// FR Tech OS - Produtos Route

import { Router } from 'express';
import { getProdutos, getProdutosByStatus } from '../lib/notionDataLayer';

export const produtosRouter = Router();

/**
 * GET /api/produtos
 * Get all products
 * Query params: status (optional filter)
 */
produtosRouter.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    if (status) {
      const produtos = await getProdutosByStatus(status as string);
      return res.json(produtos);
    }
    
    const produtos = await getProdutos();
    res.json(produtos);
  } catch (error: any) {
    console.error('Error fetching produtos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch produtos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

