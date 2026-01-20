import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SmartTemplateInjector - Injeta dados em templates DOCX sem placeholders
 * 
 * Este serviço manipula diretamente o XML do documento Word para
 * encontrar campos específicos e inserir valores após eles.
 */

export interface InjectionData {
  os?: string;
  data?: string;
  cliente?: string;
  local?: string;
  elaboradoPor?: string;
  cidadeUf?: string;
  equipamento?: string;
  fabricante?: string;
  numeroSerie?: string;
  observacoes?: string;
  [key: string]: string | undefined;
}

// Mapeamento de campos para cada tipo de template
const FIELD_MAPPINGS: Record<string, Record<string, string[]>> = {
  // SPDA template
  'spda': {
    'os': ['ORDEM DE SERVIÇO'],
    'cliente': ['CLIENTE'],
    'data': ['DATA'],
  },
  
  // Transformador template
  'transformador': {
    'os': ['OS:'],
    'data': ['DATA'],
    'cliente': ['CLIENTE'],
    'cidadeUf': ['CIDADE/UF'],
    'local': ['LOCAL DE INSTALAÇÃO'],
    'fabricante': ['FABRICANTE'],
    'numeroSerie': ['NÚMERO DE SERIE', 'NUMERO DE SERIE'],
  },
  
  // Chave Seccionadora
  'chave_seccionadora': {
    'os': ['OS:'],
    'data': ['DATA'],
    'cliente': ['CLIENTE'],
    'cidadeUf': ['CIDADE/UF'],
    'local': ['LOCAL DE INSTALAÇÃO'],
    'fabricante': ['Fabricante:'],
    'numeroSerie': ['Número de série:'],
  },
  
  // Chave Religadora
  'chave_religadora': {
    'os': ['OS:'],
    'data': ['DATA'],
    'cliente': ['CLIENTE'],
    'cidadeUf': ['CIDADE/UF'],
    'local': ['LOCAL DE INSTALAÇÃO'],
    'fabricante': ['FABRICANTE'],
    'numeroSerie': ['NÚMERO DE SÉRIE OU ID'],
  },
  
  // Disjuntor
  'disjuntor': {
    'local': ['Local de instalação'],
    'fabricante': ['Fabricante'],
    'numeroSerie': ['Número de serie'],
  },
  
  // Para-raio
  'para_raio': {
    'cliente': ['Cliente:'],
    'data': ['Data:'],
    'local': ['Local do Equipamento:'],
    'elaboradoPor': ['Elaborado por:'],
    'fabricante': ['Fabricante:'],
  },
  
  // Transformador Instrumento
  'transformador_instrumento': {
    'cliente': ['Cliente:'],
    'data': ['Data:'],
    'local': ['Local do Equipamento:'],
    'elaboradoPor': ['Elaborado por:'],
    'fabricante': ['Fabricante:'],
  },
  
  // Relé de Proteção
  'rele_protecao': {
    'cliente': ['CLIENTE:'],
    'data': ['DATA:'],
    'local': ['LOCAL:'],
    'fabricante': ['Fabricante:'],
  },
  
  // Retificador Bateria
  'retificador_bateria': {
    'cliente': ['Cliente:'],
    'data': ['Data:'],
    'local': ['Local do Equipamento:'],
    'elaboradoPor': ['Elaborado por:'],
    'fabricante': ['Fabricante:'],
  },
  
  // Banco Capacitores
  'banco_capacitores': {
    'cliente': ['Cliente:'],
    'data': ['Data:'],
    'local': ['Local:'],
  },
  
  // Cabos
  'cabos': {
    'cliente': ['Cliente:'],
    'data': ['Data:'],
    'local': ['Localização:'],
    'elaboradoPor': ['Elaborado por:'],
    'fabricante': ['Fabricante:'],
  },
  
  // Painel Religador
  'painel_religador': {
    'os': ['OS:'],
    'data': ['DATA'],
    'cliente': ['CLIENTE'],
    'cidadeUf': ['CIDADE/UF'],
    'local': ['LOCAL DE INSTALAÇÃO'],
    'fabricante': ['FABRICANTE'],
    'numeroSerie': ['NÚMERO DE SÉRIE OU ID'],
  },
};

/**
 * Injeta dados em um template DOCX
 * Encontra campos específicos no XML e adiciona valores após eles
 */
export function injectDataIntoTemplate(
  templatePath: string,
  equipmentType: string,
  data: InjectionData
): Buffer {
  const absolutePath = path.resolve(templatePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Template not found: ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'binary');
  const zip = new PizZip(content);
  
  // Get document.xml
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid DOCX: no document.xml found');
  }
  
  let xmlContent = docXmlFile.asText();
  
  // Get field mappings for this equipment type
  const fieldMappings = FIELD_MAPPINGS[equipmentType] || FIELD_MAPPINGS['spda'];
  
  // Process each data field
  for (const [dataKey, value] of Object.entries(data)) {
    if (!value) continue;
    
    const fieldLabels = fieldMappings[dataKey];
    if (!fieldLabels) continue;
    
    for (const label of fieldLabels) {
      // Try to find and inject after the label
      xmlContent = injectAfterLabel(xmlContent, label, value);
    }
  }
  
  // Update the document.xml in the zip
  zip.file('word/document.xml', xmlContent);
  
  // Generate the new DOCX
  return zip.generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  }) as Buffer;
}

/**
 * Encontra um label no XML e injeta um valor após ele
 * Lida com a estrutura complexa do XML do Word onde texto pode estar dividido em múltiplos elementos
 */
function injectAfterLabel(xml: string, label: string, value: string): string {
  // Escape special XML characters in the value
  const escapedValue = escapeXml(value);
  
  // Strategy 1: Find the label as plain text within <w:t> tags and add value in the same cell
  // Word XML structure: <w:t>Label:</w:t> ... next cell ... <w:t></w:t>
  
  // Look for the label followed by an empty cell in the same row
  // This is common in table-based forms
  
  // Simple approach: find </w:t> after the label and insert value before it
  // if the cell appears empty
  
  const labelRegex = new RegExp(
    `(<w:t[^>]*>)(${escapeRegex(label)})(</w:t>)`,
    'gi'
  );
  
  // Check if label exists
  if (!labelRegex.test(xml)) {
    // Try without the colon
    const labelWithoutColon = label.replace(/:$/, '');
    const altRegex = new RegExp(
      `(<w:t[^>]*>)(${escapeRegex(labelWithoutColon)})(</w:t>)`,
      'gi'
    );
    
    if (!altRegex.test(xml)) {
      return xml; // Label not found
    }
  }
  
  // Reset regex
  labelRegex.lastIndex = 0;
  
  // Find the label and look for the next empty or fillable cell
  let result = xml;
  let match;
  
  while ((match = labelRegex.exec(xml)) !== null) {
    const labelEnd = match.index + match[0].length;
    
    // Look for the next <w:t></w:t> or <w:t xml:space="preserve"></w:t> within reasonable distance
    // This would be the empty cell where we want to inject the value
    const searchArea = xml.substring(labelEnd, labelEnd + 2000);
    
    // Find empty text elements that might be in the next cell
    const emptyTextRegex = /<w:t(?:\s+[^>]*)?>(\s*)<\/w:t>/;
    const emptyMatch = emptyTextRegex.exec(searchArea);
    
    if (emptyMatch && emptyMatch[1].trim() === '') {
      // Found an empty cell - inject the value
      const insertPos = labelEnd + emptyMatch.index;
      const originalTag = emptyMatch[0];
      const newTag = `<w:t>${escapedValue}</w:t>`;
      
      result = result.substring(0, insertPos) + 
               newTag + 
               result.substring(insertPos + originalTag.length);
      
      // Only replace first occurrence
      break;
    }
  }
  
  return result;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default {
  injectDataIntoTemplate,
  FIELD_MAPPINGS,
};
