import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * TemplateGeneratorService - Service for generating reports from DOCX templates
 * 
 * Uses the real NX Energy templates with proper formatting, logos, and structure.
 */

// Map equipment types to their template files
export const EQUIPMENT_TEMPLATES: Record<string, string> = {
  'transformador': 'transformador.docx',
  'transformador_instrumento': 'transformador_instrumento.docx',
  'disjuntor': 'disjuntor.docx',
  'para_raio': 'para_raio.docx',
  'rele_protecao': 'rele_protecao.docx',
  'chave_seccionadora': 'chave_seccionadora.docx',
  'chave_religadora': 'chave_religadora.docx',
  'painel_religador': 'painel_religador.docx',
  'retificador_bateria': 'retificador_bateria.docx',
  'banco_capacitores': 'banco_capacitores.docx',
  'cabos': 'cabos.docx',
  'spda': 'spda.docx',
};

// Equipment categories for UI grouping
export const EQUIPMENT_CATEGORIES = {
  'Transformadores': ['transformador', 'transformador_instrumento'],
  'Proteção e Controle': ['disjuntor', 'rele_protecao', 'para_raio'],
  'Chaves e Religadores': ['chave_seccionadora', 'chave_religadora', 'painel_religador'],
  'Sistemas Auxiliares': ['retificador_bateria', 'banco_capacitores'],
  'Outros': ['cabos', 'spda'],
};

// Equipment display names
export const EQUIPMENT_NAMES: Record<string, string> = {
  'transformador': 'Transformador',
  'transformador_instrumento': 'Transformador para Instrumentos',
  'disjuntor': 'Disjuntor',
  'para_raio': 'Para-raios',
  'rele_protecao': 'Relé de Proteção',
  'chave_seccionadora': 'Chave Seccionadora',
  'chave_religadora': 'Chave Religadora',
  'painel_religador': 'Painel Religador',
  'retificador_bateria': 'Retificador de Bateria',
  'banco_capacitores': 'Banco de Capacitores',
  'cabos': 'Cabos',
  'spda': 'SPDA',
};

export interface TemplateData {
  [key: string]: string | number | boolean | Date | undefined | any[];
}


export interface Photo {
  id: string;
  data: string;
  name: string;
  description?: string;
}

/**
 * Get the templates directory path
 */
export function getTemplatesDir(): string {
  return path.join(__dirname, '../../templates');
}

/**
 * Get the equipment templates directory path
 */
export function getEquipmentTemplatesDir(): string {
  return path.join(getTemplatesDir(), 'equipamentos');
}

/**
 * Get template path for a specific equipment type
 */
export function getEquipmentTemplatePath(equipmentType: string): string {
  const templateFile = EQUIPMENT_TEMPLATES[equipmentType];
  if (!templateFile) {
    throw new Error(`Unknown equipment type: ${equipmentType}`);
  }
  return path.join(getEquipmentTemplatesDir(), templateFile);
}

/**
 * Check if a template exists for the given equipment type
 */
export function templateExists(equipmentType: string): boolean {
  try {
    const templatePath = getEquipmentTemplatePath(equipmentType);
    return fs.existsSync(templatePath);
  } catch {
    return false;
  }
}

/**
 * Load a template file and return a Docxtemplater instance
 */
export function loadTemplate(templatePath: string): Docxtemplater {
  const absolutePath = path.resolve(templatePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template not found: ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'binary');
  const zip = new PizZip(content);
  
  return new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });
}


/**
 * Load a template by equipment type
 */
export function loadEquipmentTemplate(equipmentType: string): Docxtemplater {
  const templatePath = getEquipmentTemplatePath(equipmentType);
  return loadTemplate(templatePath);
}

/**
 * Generate a document from a template with data
 */
export function generateFromTemplate(
  templatePath: string,
  data: TemplateData
): Buffer {
  const absolutePath = path.resolve(templatePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template not found: ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'binary');
  const zip = new PizZip(content);
  
  // Process data
  const processedData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      processedData[key] = value.toLocaleDateString('pt-BR');
    } else if (value === undefined || value === null) {
      processedData[key] = '';
    } else {
      processedData[key] = value;
    }
  }
  
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });
  
  doc.setData(processedData);
  doc.render();
  
  return doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
}

/**
 * Generate a document from an equipment template
 */
export function generateFromEquipmentTemplate(
  equipmentType: string,
  data: TemplateData
): Buffer {
  const templatePath = getEquipmentTemplatePath(equipmentType);
  return generateFromTemplate(templatePath, data);
}

/**
 * Copy a template file preserving all formatting (for reports that don't need data injection)
 */
export function copyTemplate(templatePath: string): Buffer {
  const absolutePath = path.resolve(templatePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template not found: ${absolutePath}`);
  }
  
  return fs.readFileSync(absolutePath);
}


/**
 * Get list of all available equipment types
 */
export function getAvailableEquipmentTypes(): string[] {
  return Object.keys(EQUIPMENT_TEMPLATES);
}

/**
 * Get equipment types grouped by category
 */
export function getEquipmentByCategory(): Record<string, { id: string; name: string }[]> {
  const result: Record<string, { id: string; name: string }[]> = {};
  
  for (const [category, types] of Object.entries(EQUIPMENT_CATEGORIES)) {
    result[category] = types.map(type => ({
      id: type,
      name: EQUIPMENT_NAMES[type] || type,
    }));
  }
  
  return result;
}

/**
 * List all available templates in the equipamentos directory
 */
export function listAvailableTemplates(): { type: string; name: string; exists: boolean }[] {
  return Object.entries(EQUIPMENT_TEMPLATES).map(([type, file]) => ({
    type,
    name: EQUIPMENT_NAMES[type] || type,
    exists: templateExists(type),
  }));
}

export default {
  EQUIPMENT_TEMPLATES,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_NAMES,
  getTemplatesDir,
  getEquipmentTemplatesDir,
  getEquipmentTemplatePath,
  templateExists,
  loadTemplate,
  loadEquipmentTemplate,
  generateFromTemplate,
  generateFromEquipmentTemplate,
  copyTemplate,
  getAvailableEquipmentTypes,
  getEquipmentByCategory,
  listAvailableTemplates,
};
