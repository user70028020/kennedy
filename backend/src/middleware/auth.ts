import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'sercamp-secret-key-change-in-production';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Sessão expirada' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
}

export function moduleMiddleware(requiredModule: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Admin has access to all modules
    if (req.user.role === 'admin') {
      return next();
    }

    // For funcionario, check module access from database
    try {
      const { default: prisma } = await import('../services/database.js');
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { modules: true, status: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (user.status === 'inativo') {
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      // Check if user has access to the required module
      if (!user.modules.includes(requiredModule)) {
        return res.status(403).json({ error: 'Módulo não autorizado' });
      }

      next();
    } catch (error) {
      console.error('Module middleware error:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}

export { JWT_SECRET };
