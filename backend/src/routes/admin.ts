import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../services/database.js';
import { authMiddleware, adminMiddleware, auditMiddleware, setAuditContext, setAuditAction } from '../middleware/index.js';
import { AuditLoggerService, getClientIp } from '../services/audit-logger.js';
import type { CreateUserDTO, UpdateUserDTO } from '../types/index.js';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'funcionario']),
  modules: z.array(z.string()).default([])
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  role: z.enum(['admin', 'funcionario']).optional(),
  modules: z.array(z.string()).optional(),
  status: z.enum(['ativo', 'inativo']).optional()
});

// Service Order validation schemas
const createServiceOrderSchema = z.object({
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  clientName: z.string().min(2, 'Nome do cliente deve ter pelo menos 2 caracteres'),
  clientLogo: z.string().optional(),
  teamLeader: z.string().min(2, 'Líder da equipe é obrigatório'),
  teamMembers: z.array(z.string()).default([]),
  equipmentType: z.string().min(1, 'Tipo de equipamento é obrigatório'),
  selectedTemplate: z.enum(['nx_energy', 'sercamp']).default('nx_energy'),
  serviceType: z.string().min(1, 'Tipo de serviço é obrigatório'),
  location: z.string().min(1, 'Localização é obrigatória'),
  periodStart: z.string().transform((val) => new Date(val)),
  periodEnd: z.string().transform((val) => new Date(val))
});

const updateServiceOrderSchema = z.object({
  osNumber: z.string().min(1, 'Número da OS é obrigatório').optional(),
  clientName: z.string().min(2, 'Nome do cliente deve ter pelo menos 2 caracteres').optional(),
  clientLogo: z.string().optional().nullable(),
  teamLeader: z.string().min(2, 'Líder da equipe é obrigatório').optional(),
  teamMembers: z.array(z.string()).optional(),
  equipmentType: z.string().min(1, 'Tipo de equipamento é obrigatório').optional(),
  selectedTemplate: z.enum(['nx_energy', 'sercamp']).optional(),
  serviceType: z.string().min(1, 'Tipo de serviço é obrigatório').optional(),
  location: z.string().min(1, 'Localização é obrigatória').optional(),
  periodStart: z.string().transform((val) => new Date(val)).optional(),
  periodEnd: z.string().transform((val) => new Date(val)).optional(),
  status: z.enum(['ativa', 'concluida', 'cancelada']).optional()
});

// Colaborador validation schemas
const createColaboradorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  documento: z.string().min(1, 'Documento é obrigatório'),
  funcao: z.string().min(1, 'Função é obrigatória'),
  email: z.string().email('Email inválido').optional().nullable(),
  telefone: z.string().optional().nullable()
});

const updateColaboradorSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  documento: z.string().min(1, 'Documento é obrigatório').optional(),
  funcao: z.string().min(1, 'Função é obrigatória').optional(),
  email: z.string().email('Email inválido').optional().nullable(),
  telefone: z.string().optional().nullable(),
  osCount: z.number().int().min(0).optional()
});

// Template validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum(['equipment', 'merge']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
  fileData: z.string().min(1, 'Dados do arquivo são obrigatórios'),
  fileSize: z.number().int().min(1, 'Tamanho do arquivo é obrigatório')
});

const updateTemplateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  type: z.enum(['equipment', 'merge']).optional(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório').optional(),
  fileData: z.string().min(1, 'Dados do arquivo são obrigatórios').optional(),
  fileSize: z.number().int().min(1, 'Tamanho do arquivo é obrigatório').optional()
});

/**
 * GET /api/admin/users
 * List all users (excluding soft-deleted)
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { includeDeleted } = req.query;
    
    const where: Record<string, unknown> = {};
    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        modules: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get a single user by ID
 */
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        modules: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


/**
 * POST /api/admin/users
 * Create a new user
 */
router.post('/users', auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        modules: data.modules,
        status: 'ativo'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        modules: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Set audit context
    setAuditContext(req, { resourceId: user.id, resourceName: user.name });

    res.status(201).json(user);
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

    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update an existing user
 */
router.put('/users/:id', auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // If email is being changed, check if it's already in use
    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (emailInUse) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.modules) updateData.modules = data.modules;
    if (data.status) updateData.status = data.status;
    
    // Hash new password if provided
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        modules: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Set audit context
    setAuditContext(req, { resourceId: user.id, resourceName: user.name });

    res.json(user);
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

    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Soft delete a user (move to trash)
 */
router.delete('/users/:id', auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Prevent deleting the current user
    if (req.user && req.user.userId === id) {
      return res.status(400).json({ error: 'Não é possível excluir o próprio usuário' });
    }

    // Set audit context before deletion
    setAuditContext(req, { resourceId: existingUser.id, resourceName: existingUser.name });

    if (permanent === 'true') {
      // Permanent delete
      await prisma.user.delete({
        where: { id }
      });
      res.json({ success: true, message: 'Usuário excluído permanentemente' });
    } else {
      // Soft delete (move to trash)
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'inativo' }
      });
      res.json({ success: true, message: 'Usuário movido para a lixeira' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/clear-test-data
 * Clear test data from the system (for development purposes)
 */
router.post('/clear-test-data', async (req: Request, res: Response) => {
  try {
    // Delete all non-admin users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: 'funcionario'
      }
    });

    // Delete all reports
    const deletedReports = await prisma.report.deleteMany({});

    // Delete all service orders
    const deletedOrders = await prisma.serviceOrder.deleteMany({});

    // Delete all pesquisas
    const deletedPesquisas = await prisma.pesquisaSatisfacao.deleteMany({});

    // Delete all colaboradores
    const deletedColaboradores = await prisma.colaborador.deleteMany({});

    res.json({
      success: true,
      message: 'Dados de teste limpos com sucesso',
      deleted: {
        users: deletedUsers.count,
        reports: deletedReports.count,
        serviceOrders: deletedOrders.count,
        pesquisas: deletedPesquisas.count,
        colaboradores: deletedColaboradores.count
      }
    });
  } catch (error) {
    console.error('Clear test data error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// SERVICE ORDER ROUTES
// ============================================

/**
 * GET /api/admin/service-orders
 * List all service orders with optional filters (excluding soft-deleted)
 */
router.get('/service-orders', async (req: Request, res: Response) => {
  try {
    const { status, equipmentType, search, includeDeleted } = req.query;

    const where: Record<string, unknown> = {};
    
    // Exclude soft-deleted by default
    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (equipmentType && typeof equipmentType === 'string') {
      where.equipmentType = equipmentType;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { osNumber: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { teamLeader: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const serviceOrders = await prisma.serviceOrder.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            reports: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(serviceOrders);
  } catch (error) {
    console.error('List service orders error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/service-orders/:id
 * Get a single service order by ID
 */
router.get('/service-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reports: {
          select: {
            id: true,
            type: true,
            fileName: true,
            createdAt: true
          }
        }
      }
    });

    if (!serviceOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json(serviceOrder);
  } catch (error) {
    console.error('Get service order error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/service-orders
 * Create a new service order
 */
router.post('/service-orders', auditMiddleware('service_order'), async (req: Request, res: Response) => {
  try {
    const data = createServiceOrderSchema.parse(req.body);

    // Check if OS number already exists
    const existingOS = await prisma.serviceOrder.findUnique({
      where: { osNumber: data.osNumber }
    });

    if (existingOS) {
      return res.status(400).json({ error: 'Número de OS já cadastrado' });
    }

    // Create service order
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        ...data,
        createdById: req.user!.userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Set audit context
    setAuditContext(req, { resourceId: serviceOrder.id, resourceName: serviceOrder.osNumber });

    res.status(201).json(serviceOrder);
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

    console.error('Create service order error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/service-orders/:id
 * Update an existing service order
 */
router.put('/service-orders/:id', auditMiddleware('service_order'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateServiceOrderSchema.parse(req.body);

    // Check if service order exists
    const existingOS = await prisma.serviceOrder.findUnique({
      where: { id }
    });

    if (!existingOS) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    // If OS number is being changed, check if it's already in use
    if (data.osNumber && data.osNumber !== existingOS.osNumber) {
      const osNumberInUse = await prisma.serviceOrder.findUnique({
        where: { osNumber: data.osNumber }
      });

      if (osNumberInUse) {
        return res.status(400).json({ error: 'Número de OS já cadastrado' });
      }
    }

    // Update service order
    const serviceOrder = await prisma.serviceOrder.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Set audit context
    setAuditContext(req, { resourceId: serviceOrder.id, resourceName: serviceOrder.osNumber });

    res.json(serviceOrder);
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

    console.error('Update service order error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/service-orders/:id
 * Soft delete a service order (move to trash)
 */
router.delete('/service-orders/:id', auditMiddleware('service_order'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    // Check if service order exists
    const existingOS = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reports: true
          }
        }
      }
    });

    if (!existingOS) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    // Set audit context before deletion
    setAuditContext(req, { resourceId: existingOS.id, resourceName: existingOS.osNumber });

    if (permanent === 'true') {
      // Check if there are associated reports for permanent delete
      if (existingOS._count.reports > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir permanentemente uma OS com relatórios associados. Exclua os relatórios primeiro.' 
        });
      }
      // Permanent delete
      await prisma.serviceOrder.delete({
        where: { id }
      });
      res.json({ success: true, message: 'Ordem de serviço excluída permanentemente' });
    } else {
      // Soft delete (move to trash)
      await prisma.serviceOrder.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      res.json({ success: true, message: 'Ordem de serviço movida para a lixeira' });
    }
  } catch (error) {
    console.error('Delete service order error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// COLABORADORES ROUTES
// ============================================

/**
 * GET /api/admin/colaboradores
 * List all colaboradores with optional search (excluding soft-deleted)
 */
router.get('/colaboradores', async (req: Request, res: Response) => {
  try {
    const { search, includeDeleted } = req.query;

    const where: Record<string, unknown> = {};
    
    // Exclude soft-deleted by default
    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { funcao: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const colaboradores = await prisma.colaborador.findMany({
      where,
      orderBy: { nome: 'asc' }
    });

    res.json(colaboradores);
  } catch (error) {
    console.error('List colaboradores error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/colaboradores/:id
 * Get a single colaborador by ID
 */
router.get('/colaboradores/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const colaborador = await prisma.colaborador.findUnique({
      where: { id }
    });

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json(colaborador);
  } catch (error) {
    console.error('Get colaborador error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/colaboradores
 * Create a new colaborador
 */
router.post('/colaboradores', async (req: Request, res: Response) => {
  try {
    const data = createColaboradorSchema.parse(req.body);

    // Check if documento already exists
    const existingColaborador = await prisma.colaborador.findUnique({
      where: { documento: data.documento }
    });

    if (existingColaborador) {
      return res.status(400).json({ error: 'Documento já cadastrado' });
    }

    // Create colaborador
    const colaborador = await prisma.colaborador.create({
      data: {
        ...data,
        osCount: 0
      }
    });

    res.status(201).json(colaborador);
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

    console.error('Create colaborador error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/colaboradores/:id
 * Update an existing colaborador
 */
router.put('/colaboradores/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateColaboradorSchema.parse(req.body);

    // Check if colaborador exists
    const existingColaborador = await prisma.colaborador.findUnique({
      where: { id }
    });

    if (!existingColaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // If documento is being changed, check if it's already in use
    if (data.documento && data.documento !== existingColaborador.documento) {
      const documentoInUse = await prisma.colaborador.findUnique({
        where: { documento: data.documento }
      });

      if (documentoInUse) {
        return res.status(400).json({ error: 'Documento já cadastrado' });
      }
    }

    // Update colaborador
    const colaborador = await prisma.colaborador.update({
      where: { id },
      data
    });

    res.json(colaborador);
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

    console.error('Update colaborador error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/colaboradores/:id
 * Soft delete a colaborador (move to trash)
 */
router.delete('/colaboradores/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    // Check if colaborador exists
    const existingColaborador = await prisma.colaborador.findUnique({
      where: { id }
    });

    if (!existingColaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    if (permanent === 'true') {
      // Permanent delete
      await prisma.colaborador.delete({
        where: { id }
      });
      res.json({ success: true, message: 'Colaborador excluído permanentemente' });
    } else {
      // Soft delete (move to trash)
      await prisma.colaborador.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      res.json({ success: true, message: 'Colaborador movido para a lixeira' });
    }
  } catch (error) {
    console.error('Delete colaborador error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// TEMPLATES ROUTES
// ============================================

/**
 * GET /api/admin/templates
 * List all templates with optional filters (excluding soft-deleted)
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { type, category, search, includeDeleted } = req.query;

    const where: Record<string, unknown> = {};
    
    // Exclude soft-deleted by default
    if (includeDeleted !== 'true') {
      where.deletedAt = null;
    }

    if (type && typeof type === 'string') {
      where.type = type;
    }

    if (category && typeof category === 'string') {
      where.category = category;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/templates/:id
 * Get a single template by ID (includes file data)
 */
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/templates/:id/download
 * Download a template file
 */
router.get('/templates/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(template.fileData, 'base64');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${template.fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/templates
 * Create a new template
 */
router.post('/templates', auditMiddleware('template'), async (req: Request, res: Response) => {
  try {
    const data = createTemplateSchema.parse(req.body);

    // Create template
    const template = await prisma.template.create({
      data,
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Set audit context
    setAuditContext(req, { resourceId: template.id, resourceName: template.name });

    res.status(201).json(template);
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

    console.error('Create template error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/templates/:id
 * Update an existing template
 */
router.put('/templates/:id', auditMiddleware('template'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateTemplateSchema.parse(req.body);

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    // Update template
    const template = await prisma.template.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        fileName: true,
        fileSize: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Set audit context
    setAuditContext(req, { resourceId: template.id, resourceName: template.name });

    res.json(template);
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

    console.error('Update template error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/templates/:id
 * Soft delete a template (move to trash)
 */
router.delete('/templates/:id', auditMiddleware('template'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }

    // Set audit context before deletion
    setAuditContext(req, { resourceId: existingTemplate.id, resourceName: existingTemplate.name });

    if (permanent === 'true') {
      // Permanent delete
      await prisma.template.delete({
        where: { id }
      });
      res.json({ success: true, message: 'Template excluído permanentemente' });
    } else {
      // Soft delete (move to trash)
      await prisma.template.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      res.json({ success: true, message: 'Template movido para a lixeira' });
    }
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// MERGE ROUTES
// ============================================

// Merge validation schema
const mergeConfigSchema = z.object({
  templateId: z.string().min(1, 'Template é obrigatório'),
  reportIds: z.array(z.string()).min(1, 'Selecione pelo menos um relatório'),
  fields: z.object({
    data: z.string().optional(),
    cliente: z.string().optional(),
    tituloServico: z.string().optional(),
    liderEquipe: z.string().optional(),
    logoCliente: z.string().optional(),
    periodo: z.string().optional(),
    numeroOSSercamp: z.string().optional(),
    localizacao: z.string().optional(),
    representanteCliente: z.string().optional(),
    setorCliente: z.string().optional(),
    acompanhantes: z.array(z.string()).optional(),
    colaboradores: z.array(z.string()).optional(),
    dataIda: z.string().optional(),
    dataVolta: z.string().optional(),
    datasAtividades: z.string().optional(),
    equipamentosUtilizados: z.array(z.object({
      nome: z.string(),
      modelo: z.string(),
      numeroSerie: z.string(),
      certificadoCalibracao: z.string()
    })).optional(),
    itensInspecionados: z.array(z.object({
      equipamento: z.string(),
      fabricante: z.string(),
      local: z.string(),
      numeroSerie: z.string(),
      status: z.enum(['conforme', 'corretiva', 'alerta'])
    })).optional()
  })
});

/**
 * POST /api/admin/merge
 * Merge multiple reports into a single document
 * Requirements: 10.3, 10.4, 10.5
 */
router.post('/merge', auditMiddleware('merge'), async (req: Request, res: Response) => {
  try {
    const data = mergeConfigSchema.parse(req.body);

    // Load merge template
    const template = await prisma.template.findUnique({
      where: { id: data.templateId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template de mesclagem não encontrado' });
    }

    if (template.type !== 'merge') {
      return res.status(400).json({ error: 'O template selecionado não é do tipo mesclagem' });
    }

    // Load selected reports
    const reports = await prisma.report.findMany({
      where: {
        id: { in: data.reportIds }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (reports.length === 0) {
      return res.status(404).json({ error: 'Nenhum relatório encontrado' });
    }

    // Separate photographic reports (to be added at the end)
    const photographicReports = reports.filter(r => r.type === 'fotografico');
    const technicalReports = reports.filter(r => r.type !== 'fotografico');

    // Import docx-merger dynamically
    const { generateMergedDocument } = await import('../services/merge-service.js');

    // Generate merged document
    const mergedBuffer = await generateMergedDocument({
      templateBase64: template.fileData,
      fields: data.fields,
      technicalReports,
      photographicReports
    });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `relatorio_mesclado_${timestamp}.docx`;

    // Save merged report to database
    const mergedReport = await prisma.report.create({
      data: {
        type: 'mesclado',
        osNumber: data.fields.numeroOSSercamp || 'N/A',
        clientName: data.fields.cliente || 'N/A',
        fileName,
        fileData: mergedBuffer.toString('base64'),
        fileSize: mergedBuffer.length,
        template: 'merge',
        generatedById: req.user!.userId
      }
    });

    // Set audit context
    setAuditContext(req, { 
      resourceId: mergedReport.id, 
      resourceName: fileName,
      action: 'generate'
    });

    // Return file URL for download
    res.status(201).json({
      id: mergedReport.id,
      fileName,
      fileUrl: `/api/reports/${mergedReport.id}/download`
    });
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

    console.error('Merge error:', error);
    res.status(500).json({ error: 'Erro ao gerar documento mesclado' });
  }
});

// ============================================
// AUDIT LOG ROUTES
// ============================================

/**
 * GET /api/admin/audit-logs
 * List audit logs with optional filters
 * Requirements: 11.2
 */
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId, action, resourceType, limit, offset } = req.query;

    const filters: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      action?: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'download' | 'generate';
      resourceType?: 'user' | 'report' | 'template' | 'service_order' | 'merge';
      limit?: number;
      offset?: number;
    } = {};

    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }

    if (userId && typeof userId === 'string') {
      filters.userId = userId;
    }

    if (action && typeof action === 'string') {
      filters.action = action as typeof filters.action;
    }

    if (resourceType && typeof resourceType === 'string') {
      filters.resourceType = resourceType as typeof filters.resourceType;
    }

    if (limit && typeof limit === 'string') {
      filters.limit = parseInt(limit, 10);
    }

    if (offset && typeof offset === 'string') {
      filters.offset = parseInt(offset, 10);
    }

    const { logs, total } = await AuditLoggerService.getAuditLogs(filters);

    res.json({
      logs,
      total,
      limit: filters.limit || 100,
      offset: filters.offset || 0
    });
  } catch (error) {
    console.error('List audit logs error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/audit-logs/:id
 * Get a single audit log by ID
 * Requirements: 11.2
 */
router.get('/audit-logs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const auditLog = await AuditLoggerService.getAuditLogById(id);

    if (!auditLog) {
      return res.status(404).json({ error: 'Log de auditoria não encontrado' });
    }

    res.json(auditLog);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// TRASH (LIXEIRA) ROUTES
// ============================================

import { TrashService } from '../services/trash-service.js';
import { BackupService } from '../services/backup-service.js';

/**
 * GET /api/admin/trash
 * List all items in trash
 */
router.get('/trash', async (req: Request, res: Response) => {
  try {
    const items = await TrashService.getTrashItems();
    res.json(items);
  } catch (error) {
    console.error('List trash error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/trash/restore
 * Restore an item from trash
 */
router.post('/trash/restore', async (req: Request, res: Response) => {
  try {
    const { id, type } = req.body;

    if (!id || !type) {
      return res.status(400).json({ error: 'ID e tipo são obrigatórios' });
    }

    let success = false;
    switch (type) {
      case 'user':
        success = await TrashService.restoreUser(id);
        break;
      case 'service_order':
        success = await TrashService.restoreServiceOrder(id);
        break;
      case 'report':
        success = await TrashService.restoreReport(id);
        break;
      case 'template':
        success = await TrashService.restoreTemplate(id);
        break;
      case 'colaborador':
        success = await TrashService.restoreColaborador(id);
        break;
      default:
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    if (!success) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ success: true, message: 'Item restaurado com sucesso' });
  } catch (error) {
    console.error('Restore from trash error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/trash/:type/:id
 * Permanently delete an item from trash
 */
router.delete('/trash/:type/:id', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;

    let success = false;
    switch (type) {
      case 'user':
        success = await TrashService.permanentDeleteUser(id);
        break;
      case 'service_order':
        success = await TrashService.permanentDeleteServiceOrder(id);
        break;
      case 'report':
        success = await TrashService.permanentDeleteReport(id);
        break;
      case 'template':
        success = await TrashService.permanentDeleteTemplate(id);
        break;
      case 'colaborador':
        success = await TrashService.permanentDeleteColaborador(id);
        break;
      default:
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    if (!success) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ success: true, message: 'Item excluído permanentemente' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/trash
 * Empty trash (permanently delete all items)
 */
router.delete('/trash', async (req: Request, res: Response) => {
  try {
    const result = await TrashService.emptyTrash();
    res.json({ success: true, message: 'Lixeira esvaziada com sucesso', ...result });
  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// BACKUP ROUTES
// ============================================

/**
 * GET /api/admin/backups
 * List all backups
 */
router.get('/backups', async (req: Request, res: Response) => {
  try {
    const backups = await BackupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/backups
 * Create a new backup
 */
router.post('/backups', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do backup é obrigatório' });
    }

    const backup = await BackupService.createBackup(name, description || null, req.user!.userId);
    res.status(201).json(backup);
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/backups/:id
 * Get backup details
 */
router.get('/backups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const backup = await BackupService.getBackup(id);

    if (!backup) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    res.json(backup);
  } catch (error) {
    console.error('Get backup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/backups/:id/download
 * Download backup as JSON file
 */
router.get('/backups/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await BackupService.downloadBackup(id);

    if (!result) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.data);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/backups/:id
 * Delete a backup
 */
router.delete('/backups/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await BackupService.deleteBackup(id);

    if (!success) {
      return res.status(404).json({ error: 'Backup não encontrado' });
    }

    res.json({ success: true, message: 'Backup excluído com sucesso' });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
