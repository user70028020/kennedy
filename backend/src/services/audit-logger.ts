import prisma from './database.js';
import type { AuditAction, ResourceType } from '../types/index.js';

/**
 * AuditLoggerService - Service for recording audit logs
 * Requirements: 11.1, 11.3
 * 
 * Captures: userId, action, resourceType, resourceId, details, IP, timestamp
 */

export interface AuditLogEntry {
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details: string;
  ipAddress?: string;
}

/**
 * Log an action to the audit log
 * @param entry - The audit log entry to record
 * @returns The created audit log record
 */
export async function logAction(entry: AuditLogEntry) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        userName: entry.userName,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId || null,
        details: entry.details,
        ipAddress: entry.ipAddress || null
      }
    });

    return auditLog;
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error('Failed to create audit log:', error);
    return null;
  }
}

/**
 * Log a login action
 */
export async function logLogin(userId: string, userName: string, ipAddress?: string) {
  return logAction({
    userId,
    userName,
    action: 'login',
    resourceType: 'user',
    resourceId: userId,
    details: `Usuário ${userName} realizou login`,
    ipAddress
  });
}

/**
 * Log a logout action
 */
export async function logLogout(userId: string, userName: string, ipAddress?: string) {
  return logAction({
    userId,
    userName,
    action: 'logout',
    resourceType: 'user',
    resourceId: userId,
    details: `Usuário ${userName} realizou logout`,
    ipAddress
  });
}

/**
 * Log a create action
 */
export async function logCreate(
  userId: string,
  userName: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  ipAddress?: string
) {
  return logAction({
    userId,
    userName,
    action: 'create',
    resourceType,
    resourceId,
    details: `Criou ${getResourceTypeName(resourceType)}: ${resourceName}`,
    ipAddress
  });
}

/**
 * Log an update action
 */
export async function logUpdate(
  userId: string,
  userName: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  changes?: string,
  ipAddress?: string
) {
  const details = changes 
    ? `Atualizou ${getResourceTypeName(resourceType)}: ${resourceName}. Alterações: ${changes}`
    : `Atualizou ${getResourceTypeName(resourceType)}: ${resourceName}`;
  
  return logAction({
    userId,
    userName,
    action: 'update',
    resourceType,
    resourceId,
    details,
    ipAddress
  });
}

/**
 * Log a delete action
 */
export async function logDelete(
  userId: string,
  userName: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  ipAddress?: string
) {
  return logAction({
    userId,
    userName,
    action: 'delete',
    resourceType,
    resourceId,
    details: `Excluiu ${getResourceTypeName(resourceType)}: ${resourceName}`,
    ipAddress
  });
}

/**
 * Log a download action
 */
export async function logDownload(
  userId: string,
  userName: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  ipAddress?: string
) {
  return logAction({
    userId,
    userName,
    action: 'download',
    resourceType,
    resourceId,
    details: `Baixou ${getResourceTypeName(resourceType)}: ${resourceName}`,
    ipAddress
  });
}

/**
 * Log a generate action (for reports)
 */
export async function logGenerate(
  userId: string,
  userName: string,
  resourceType: ResourceType,
  resourceId: string,
  resourceName: string,
  ipAddress?: string
) {
  return logAction({
    userId,
    userName,
    action: 'generate',
    resourceType,
    resourceId,
    details: `Gerou ${getResourceTypeName(resourceType)}: ${resourceName}`,
    ipAddress
  });
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.startDate || filters?.endDate) {
    where.timestamp = {};
    if (filters.startDate) {
      (where.timestamp as Record<string, Date>).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.timestamp as Record<string, Date>).lte = filters.endDate;
    }
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.resourceType) {
    where.resourceType = filters.resourceType;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total };
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLogById(id: string) {
  return prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });
}

/**
 * Helper function to get human-readable resource type name
 */
function getResourceTypeName(resourceType: ResourceType): string {
  const names: Record<ResourceType, string> = {
    user: 'usuário',
    report: 'relatório',
    template: 'template',
    service_order: 'ordem de serviço',
    merge: 'documento mesclado'
  };
  return names[resourceType] || resourceType;
}

/**
 * Helper function to extract IP address from request
 */
export function getClientIp(req: { 
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  ip?: string;
}): string | undefined {
  // Check for forwarded IP (when behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ip?.trim();
  }
  
  // Check for real IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  
  // Fall back to socket remote address or express ip
  return req.ip || req.socket?.remoteAddress;
}

// Export all functions as a service object for convenience
export const AuditLoggerService = {
  logAction,
  logLogin,
  logLogout,
  logCreate,
  logUpdate,
  logDelete,
  logDownload,
  logGenerate,
  getAuditLogs,
  getAuditLogById,
  getClientIp
};

export default AuditLoggerService;
