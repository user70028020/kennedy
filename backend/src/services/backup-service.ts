import prisma from './database.js';

export interface BackupData {
  users: any[];
  serviceOrders: any[];
  reports: any[];
  templates: any[];
  colaboradores: any[];
  pesquisas: any[];
  auditLogs: any[];
  exportedAt: string;
  version: string;
}

export interface BackupInfo {
  id: string;
  name: string;
  description: string | null;
  fileSize: number;
  createdAt: Date;
}

export class BackupService {
  /**
   * Create a full system backup
   */
  static async createBackup(name: string, description: string | null, createdById: string): Promise<BackupInfo> {
    // Fetch all data (excluding soft-deleted items)
    const [users, serviceOrders, reports, templates, colaboradores, pesquisas, auditLogs] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
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
      }),
      prisma.serviceOrder.findMany({
        where: { deletedAt: null }
      }),
      prisma.report.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          type: true,
          osNumber: true,
          clientName: true,
          fileName: true,
          fileSize: true,
          template: true,
          createdAt: true,
          generatedById: true,
          serviceOrderId: true
          // Excluding fileData to reduce backup size - can be included if needed
        }
      }),
      prisma.template.findMany({
        where: { deletedAt: null },
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
      }),
      prisma.colaborador.findMany({
        where: { deletedAt: null }
      }),
      prisma.pesquisaSatisfacao.findMany({}),
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 1000 // Limit audit logs to last 1000 entries
      })
    ]);

    const backupData: BackupData = {
      users,
      serviceOrders,
      reports,
      templates,
      colaboradores,
      pesquisas,
      auditLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const fileSize = Buffer.byteLength(jsonData, 'utf8');

    const backup = await prisma.backup.create({
      data: {
        name,
        description,
        fileData: jsonData,
        fileSize,
        createdById
      }
    });

    return {
      id: backup.id,
      name: backup.name,
      description: backup.description,
      fileSize: backup.fileSize,
      createdAt: backup.createdAt
    };
  }

  /**
   * List all backups
   */
  static async listBackups(): Promise<BackupInfo[]> {
    const backups = await prisma.backup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        fileSize: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return backups;
  }

  /**
   * Get backup by ID
   */
  static async getBackup(id: string): Promise<{ info: BackupInfo; data: BackupData } | null> {
    const backup = await prisma.backup.findUnique({
      where: { id }
    });

    if (!backup) return null;

    return {
      info: {
        id: backup.id,
        name: backup.name,
        description: backup.description,
        fileSize: backup.fileSize,
        createdAt: backup.createdAt
      },
      data: JSON.parse(backup.fileData)
    };
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(id: string): Promise<boolean> {
    try {
      await prisma.backup.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Download backup as JSON file
   */
  static async downloadBackup(id: string): Promise<{ fileName: string; data: string } | null> {
    const backup = await prisma.backup.findUnique({
      where: { id }
    });

    if (!backup) return null;

    const timestamp = backup.createdAt.toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${backup.name.replace(/\s+/g, '_')}_${timestamp}.json`;

    return {
      fileName,
      data: backup.fileData
    };
  }
}
