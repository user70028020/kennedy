import { Request, Response, NextFunction } from 'express';
import { AuditLoggerService, getClientIp } from '../services/audit-logger.js';
import type { AuditAction, ResourceType } from '../types/index.js';

/**
 * Audit Middleware - Automatically logs actions based on route and method
 * Requirements: 11.1
 */

// Extend Express Request to include audit context
declare global {
  namespace Express {
    interface Request {
      auditContext?: {
        resourceType: ResourceType;
        resourceId?: string;
        resourceName?: string;
        action?: AuditAction;
        skipAudit?: boolean;
      };
    }
  }
}

/**
 * Map HTTP methods to audit actions
 */
function getActionFromMethod(method: string): AuditAction {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    case 'GET':
      return 'download'; // For download routes
    default:
      return 'create';
  }
}

/**
 * Determine resource type from route path
 */
function getResourceTypeFromPath(path: string): ResourceType | null {
  if (path.includes('/users')) return 'user';
  if (path.includes('/reports') || path.includes('/fotografico') || path.includes('/spda') || 
      path.includes('/rdo') || path.includes('/tecnico') || path.includes('/gastos')) return 'report';
  if (path.includes('/templates')) return 'template';
  if (path.includes('/service-orders')) return 'service_order';
  if (path.includes('/merge')) return 'merge';
  return null;
}

/**
 * Create audit middleware for specific resource type
 */
export function auditMiddleware(resourceType: ResourceType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to capture response and log after success
    res.json = function(body: unknown) {
      // Only log on successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && !req.auditContext?.skipAudit) {
        const action = req.auditContext?.action || getActionFromMethod(req.method);
        const resourceId = req.auditContext?.resourceId || 
                          (body as Record<string, unknown>)?.id as string || 
                          req.params.id;
        const resourceName = req.auditContext?.resourceName || 
                            (body as Record<string, unknown>)?.name as string ||
                            (body as Record<string, unknown>)?.fileName as string ||
                            (body as Record<string, unknown>)?.osNumber as string ||
                            (body as Record<string, unknown>)?.email as string ||
                            resourceId || 'N/A';

        // Log asynchronously - don't block response
        setImmediate(async () => {
          try {
            await AuditLoggerService.logAction({
              userId: req.user!.userId,
              userName: req.user!.email,
              action,
              resourceType,
              resourceId,
              details: getActionDetails(action, resourceType, resourceName),
              ipAddress: getClientIp(req)
            });
          } catch (error) {
            console.error('Audit logging failed:', error);
          }
        });
      }
      
      return originalJson(body);
    };

    next();
  };
}

/**
 * Generate human-readable action details
 */
function getActionDetails(action: AuditAction, resourceType: ResourceType, resourceName: string): string {
  const resourceNames: Record<ResourceType, string> = {
    user: 'usuário',
    report: 'relatório',
    template: 'template',
    service_order: 'ordem de serviço',
    merge: 'documento mesclado'
  };

  const actionVerbs: Record<AuditAction, string> = {
    login: 'realizou login',
    logout: 'realizou logout',
    create: 'criou',
    update: 'atualizou',
    delete: 'excluiu',
    download: 'baixou',
    generate: 'gerou'
  };

  const typeName = resourceNames[resourceType] || resourceType;
  const verb = actionVerbs[action] || action;

  if (action === 'login' || action === 'logout') {
    return `Usuário ${verb}`;
  }

  return `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${typeName}: ${resourceName}`;
}

/**
 * Helper to set audit context in request
 */
export function setAuditContext(
  req: Request,
  context: {
    resourceType?: ResourceType;
    resourceId?: string;
    resourceName?: string;
    action?: AuditAction;
    skipAudit?: boolean;
  }
) {
  req.auditContext = {
    ...req.auditContext,
    ...context
  } as Request['auditContext'];
}

/**
 * Middleware to skip audit logging for specific routes
 */
export function skipAudit(req: Request, res: Response, next: NextFunction) {
  setAuditContext(req, { skipAudit: true });
  next();
}

/**
 * Middleware to set action type explicitly
 */
export function setAuditAction(action: AuditAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    setAuditContext(req, { action });
    next();
  };
}

export default auditMiddleware;
