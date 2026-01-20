import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../services/database.js';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';
import { AuditLoggerService, getClientIp } from '../services/audit-logger.js';
import type { LoginRequest, LoginResponse, JWTPayload } from '../types/index.js';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Check if user is active
    if (user.status === 'inativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d' // Token expires in 7 days
    });

    // Prepare response (exclude passwordHash)
    const response: LoginResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        modules: user.modules,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    };

    // Log successful login
    await AuditLoggerService.logLogin(user.id, user.name, getClientIp(req));

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if user is still active
    if (user.status === 'inativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Return user data (exclude passwordHash)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      modules: user.modules,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
