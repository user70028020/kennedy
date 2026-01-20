import prisma from './database.js';

export type TrashItemType = 'user' | 'service_order' | 'report' | 'template' | 'colaborador';

export interface TrashItem {
  id: string;
  type: TrashItemType;
  name: string;
  deletedAt: Date;
  details?: Record<string, any>;
}

export class TrashService {
  /**
   * Soft delete a user
   */
  static async softDeleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'inativo' }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Soft delete a service order
   */
  static async softDeleteServiceOrder(id: string): Promise<boolean> {
    try {
      await prisma.serviceOrder.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Soft delete a report
   */
  static async softDeleteReport(id: string): Promise<boolean> {
    try {
      await prisma.report.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Soft delete a template
   */
  static async softDeleteTemplate(id: string): Promise<boolean> {
    try {
      await prisma.template.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Soft delete a colaborador
   */
  static async softDeleteColaborador(id: string): Promise<boolean> {
    try {
      await prisma.colaborador.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restore a user from trash
   */
  static async restoreUser(id: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: null, status: 'ativo' }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restore a service order from trash
   */
  static async restoreServiceOrder(id: string): Promise<boolean> {
    try {
      await prisma.serviceOrder.update({
        where: { id },
        data: { deletedAt: null }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restore a report from trash
   */
  static async restoreReport(id: string): Promise<boolean> {
    try {
      await prisma.report.update({
        where: { id },
        data: { deletedAt: null }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restore a template from trash
   */
  static async restoreTemplate(id: string): Promise<boolean> {
    try {
      await prisma.template.update({
        where: { id },
        data: { deletedAt: null }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Restore a colaborador from trash
   */
  static async restoreColaborador(id: string): Promise<boolean> {
    try {
      await prisma.colaborador.update({
        where: { id },
        data: { deletedAt: null }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Permanently delete a user
   */
  static async permanentDeleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Permanently delete a service order
   */
  static async permanentDeleteServiceOrder(id: string): Promise<boolean> {
    try {
      await prisma.serviceOrder.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Permanently delete a report
   */
  static async permanentDeleteReport(id: string): Promise<boolean> {
    try {
      await prisma.report.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Permanently delete a template
   */
  static async permanentDeleteTemplate(id: string): Promise<boolean> {
    try {
      await prisma.template.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Permanently delete a colaborador
   */
  static async permanentDeleteColaborador(id: string): Promise<boolean> {
    try {
      await prisma.colaborador.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all items in trash
   */
  static async getTrashItems(): Promise<TrashItem[]> {
    const [users, serviceOrders, reports, templates, colaboradores] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, email: true, role: true, deletedAt: true }
      }),
      prisma.serviceOrder.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, osNumber: true, clientName: true, deletedAt: true }
      }),
      prisma.report.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, fileName: true, type: true, clientName: true, deletedAt: true }
      }),
      prisma.template.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, category: true, deletedAt: true }
      }),
      prisma.colaborador.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, nome: true, funcao: true, deletedAt: true }
      })
    ]);

    const items: TrashItem[] = [
      ...users.map(u => ({
        id: u.id,
        type: 'user' as TrashItemType,
        name: u.name,
        deletedAt: u.deletedAt!,
        details: { email: u.email, role: u.role }
      })),
      ...serviceOrders.map(so => ({
        id: so.id,
        type: 'service_order' as TrashItemType,
        name: so.osNumber,
        deletedAt: so.deletedAt!,
        details: { clientName: so.clientName }
      })),
      ...reports.map(r => ({
        id: r.id,
        type: 'report' as TrashItemType,
        name: r.fileName,
        deletedAt: r.deletedAt!,
        details: { type: r.type, clientName: r.clientName }
      })),
      ...templates.map(t => ({
        id: t.id,
        type: 'template' as TrashItemType,
        name: t.name,
        deletedAt: t.deletedAt!,
        details: { category: t.category }
      })),
      ...colaboradores.map(c => ({
        id: c.id,
        type: 'colaborador' as TrashItemType,
        name: c.nome,
        deletedAt: c.deletedAt!,
        details: { funcao: c.funcao }
      }))
    ];

    // Sort by deletedAt descending
    return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
  }

  /**
   * Empty trash (permanently delete all items)
   */
  static async emptyTrash(): Promise<{ deleted: Record<string, number> }> {
    const [users, serviceOrders, reports, templates, colaboradores] = await Promise.all([
      prisma.user.deleteMany({ where: { deletedAt: { not: null } } }),
      prisma.serviceOrder.deleteMany({ where: { deletedAt: { not: null } } }),
      prisma.report.deleteMany({ where: { deletedAt: { not: null } } }),
      prisma.template.deleteMany({ where: { deletedAt: { not: null } } }),
      prisma.colaborador.deleteMany({ where: { deletedAt: { not: null } } })
    ]);

    return {
      deleted: {
        users: users.count,
        serviceOrders: serviceOrders.count,
        reports: reports.count,
        templates: templates.count,
        colaboradores: colaboradores.count
      }
    };
  }
}
