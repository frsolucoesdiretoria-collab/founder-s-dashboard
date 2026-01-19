// Vende Mais Obras - Authentication Middleware
// JWT-based authentication with bcrypt password hashing

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'vende-mais-obras-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 dias

export interface JWTPayload {
  usuarioId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(usuarioId: string, email: string): string {
  return jwt.sign(
    { usuarioId, email },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header (Bearer token)
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware to authenticate JWT tokens
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
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

  // Adicionar dados do usuário ao request
  (req as any).usuarioId = payload.usuarioId;
  (req as any).email = payload.email;
  next();
}

/**
 * Middleware to require authenticated user
 */
export function requireUsuario(req: Request, res: Response, next: NextFunction): void {
  if (!(req as any).usuarioId) {
    res.status(401).json({ error: 'Autenticação necessária' });
    return;
  }
  next();
}

/**
 * Middleware to check if resource belongs to user
 * Must be used after authenticateJWT
 */
export function checkUsuarioOwnership(req: Request, res: Response, next: NextFunction): void {
  const usuarioId = (req as any).usuarioId;
  const resourceUsuarioId = req.params.usuarioId || req.body.usuarioId || (req.query.usuarioId as string);

  if (!usuarioId) {
    res.status(401).json({ error: 'Autenticação necessária' });
    return;
  }

  if (resourceUsuarioId && resourceUsuarioId !== usuarioId) {
    res.status(403).json({ error: 'Acesso negado: recurso não pertence ao usuário' });
    return;
  }

  next();
}

/**
 * Express middleware wrapper for authenticateJWT
 */
export const authenticateJWTMiddleware = authenticateJWT;

/**
 * Express middleware wrapper for requireUsuario
 */
export const requireUsuarioMiddleware = requireUsuario;

