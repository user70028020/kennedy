export { prisma } from './database';
export {
  DocxGeneratorService,
  generateDocx,
  generateDocxWithTables,
  loadTemplateFromPath,
  loadTemplateFromBase64,
  createDocxTemplater,
  replacePlaceholders,
  populateTable,
  prepareImageData,
  renderDocument,
  generateBuffer,
  saveToFile,
  bufferToBase64,
  getTemplatePlaceholders,
  validateTemplateData,
  type TemplateData,
  type TableRow,
  type ImageData,
  type GeneratedDocument,
  type DocxGeneratorOptions
} from './docx-generator';

export { generateMergedDocument } from './merge-service';

export {
  AuditLoggerService,
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
  getClientIp,
  type AuditLogEntry
} from './audit-logger';

export {
  BackupService,
  type BackupData,
  type BackupInfo
} from './backup-service';

export {
  TrashService,
  type TrashItem,
  type TrashItemType
} from './trash-service';
