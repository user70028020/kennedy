import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { SPDAData, SPDAPoint } from '../types/spda.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getSPDATemplatePath(template: 'nx-energy' | 'sercamp'): string {
  const templatesDir = path.join(__dirname, '../../templates');
  const templateFile = template === 'nx-energy' ? 'spda_nx.docx' : 'spda_sercamp.docx';
  return path.join(templatesDir, templateFile);
}

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

export async function generateSPDAReportFromTemplate(
  template: 'nx-energy' | 'sercamp',
  data: SPDAData
): Promise<Buffer> {
  const templatePath = getSPDATemplatePath(template);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  console.log('=== SPDA Report Generation ===');
  console.log('Template:', template);
  console.log('OS:', data.ordem_servico);
  console.log('Cliente:', data.cliente);
  console.log('Pontos:', data.pontos?.length || 0);
  console.log('Tipo SPDA:', data.tipo_spda);
  console.log('Equipamento:', data.equipamento_medicao);
  console.log('Inspeções:', {
    projeto_spda: data.projeto_spda,
    integridade_condutores: data.integridade_condutores,
    subsistema_captacao: data.subsistema_captacao,
  });

  const originalContent = fs.readFileSync(templatePath);
  
  let zip: PizZip;
  try {
    zip = new PizZip(originalContent);
  } catch (e) {
    console.error('Failed to open ZIP:', e);
    return originalContent;
  }
  
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    console.error('No document.xml found');
    return originalContent;
  }
  
  let docContent = docXmlFile.asText();

  try {
    // 1. Campos de texto principais
    docContent = injectTextData(docContent, data);
    
    // 2. Checkboxes de Tipo SPDA e Equipamento
    docContent = processCheckboxes(docContent, data);
    
    // 3. Inspeções gerais (OK/NC/NA)
    docContent = processInspections(docContent, data);
    
    // 4. Pontos de medição (tabela)
    docContent = processMeasurementPoints(docContent, data);
    
    // 5. Croqui (desenho)
    if (data.croqui) {
      const result = await processCroqui(zip, docContent, data.croqui);
      zip = result.zip;
      docContent = result.docContent;
    }
    
    // 6. Observações/Conclusão
    docContent = processObservacoes(docContent, data);
    
    // 7. Status (cor)
    docContent = processStatusColor(docContent, data.status);
    
    // 8. Fotos dos pontos (última página)
    if (data.pontos && data.pontos.length > 0) {
      const result = await processPhotosPage(zip, docContent, data.pontos);
      zip = result.zip;
      docContent = result.docContent;
    }
    
    // Validar XML
    if (!docContent.includes('</w:document>')) {
      console.error('XML corrupted');
      return originalContent;
    }
  } catch (error) {
    console.error('Error processing document:', error);
    return originalContent;
  }

  zip.file('word/document.xml', docContent);
  ensureContentTypes(zip);

  let outputBuffer: Buffer;
  try {
    outputBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  } catch (e) {
    console.error('Failed to generate ZIP:', e);
    return originalContent;
  }

  try {
    new PizZip(outputBuffer);
  } catch (e) {
    console.error('Output validation failed:', e);
    return originalContent;
  }

  console.log('Generated size:', outputBuffer.length, 'bytes');
  return outputBuffer;
}

// ============================================
// INJECT TEXT DATA (CAMPOS DE TEXTO)
// ============================================

function injectTextData(docContent: string, data: SPDAData): string {
  const formattedDate = formatDate(data.data);
  
  // Campos principais do cabeçalho
  const fieldMap: Record<string, string> = {
    'ORDEM DE SERVIÇO': data.ordem_servico || '',
    'DATA': formattedDate,
    'CLIENTE': data.cliente || '',
  };
  
  // Preencher campos principais
  for (const [label, value] of Object.entries(fieldMap)) {
    if (value) {
      docContent = fillCellAfterLabel(docContent, label, value);
    }
  }
  
  // Campo EQUIPE TÉCNICA (pode ter múltiplos nomes separados por |)
  if (data.equipe_tecnica) {
    docContent = fillMultilineField(docContent, 'EQUIPE TÉCNICA:', data.equipe_tecnica);
  }
  
  // Campo "Revestida com cabos de:" (texto livre)
  if (data.revestida_cabos) {
    docContent = fillCellAfterLabel(docContent, 'Revestida com cabos de:', data.revestida_cabos);
  }
  
  // Campo mm² (seção dos cabos)
  if (data.secao_cabos) {
    docContent = fillCellAfterLabel(docContent, 'mm²', data.secao_cabos);
  }
  
  return docContent;
}

// Função para preencher campos com múltiplas linhas (equipe técnica)
function fillMultilineField(docContent: string, label: string, value: string): string {
  const labelPos = docContent.indexOf(label);
  if (labelPos === -1) return docContent;
  
  // Encontrar a célula que contém o label
  const cellStart = docContent.lastIndexOf('<w:tc', labelPos);
  const cellEnd = docContent.indexOf('</w:tc>', labelPos);
  if (cellStart === -1 || cellEnd === -1) return docContent;
  
  let cellContent = docContent.substring(cellStart, cellEnd + 7);
  
  // Dividir nomes por | e criar parágrafos separados
  const names = value.split('|').map(n => n.trim()).filter(n => n);
  
  // Criar parágrafos para cada nome
  let paragraphs = '';
  for (const name of names) {
    paragraphs += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(name)}</w:t></w:r></w:p>`;
  }
  
  // Inserir após o label
  const lastPEnd = cellContent.lastIndexOf('</w:p>');
  if (lastPEnd !== -1) {
    cellContent = cellContent.substring(0, lastPEnd + 6) + paragraphs + cellContent.substring(lastPEnd + 6);
    docContent = docContent.substring(0, cellStart) + cellContent + docContent.substring(cellEnd + 7);
    console.log(`✅ Filled multiline: "${label}" with ${names.length} names`);
  }
  
  return docContent;
}

function fillCellAfterLabel(docContent: string, label: string, value: string): string {
  const labelPos = docContent.indexOf(label);
  if (labelPos === -1) {
    return docContent;
  }
  
  const cellEndPos = docContent.indexOf('</w:tc>', labelPos);
  if (cellEndPos === -1) return docContent;
  
  const nextCellStart = docContent.indexOf('<w:tc', cellEndPos);
  if (nextCellStart === -1) return docContent;
  
  const nextCellEnd = docContent.indexOf('</w:tc>', nextCellStart);
  if (nextCellEnd === -1) return docContent;
  
  const cellContent = docContent.substring(nextCellStart, nextCellEnd + 7);
  
  const textMatch = cellContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  const hasText = textMatch && textMatch.some(t => {
    const m = t.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
    return m && m[1].trim().length > 0;
  });
  
  if (!hasText) {
    const insertPos = cellContent.lastIndexOf('</w:p>');
    if (insertPos !== -1) {
      const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r>`;
      const newCellContent = cellContent.substring(0, insertPos) + formattedRun + cellContent.substring(insertPos);
      
      docContent = docContent.substring(0, nextCellStart) + 
                   newCellContent + 
                   docContent.substring(nextCellEnd + 7);
      
      console.log(`✅ Filled: "${label}" = "${value}"`);
    }
  }
  
  return docContent;
}

// ============================================
// MARK CHECKBOXES
// ============================================

function markCheckbox(docContent: string, searchText: string): string {
  const index = docContent.indexOf(searchText);
  if (index === -1) {
    console.log(`❌ Text not found: "${searchText}"`);
    return docContent;
  }
  
  console.log(`🔍 Found text "${searchText}" at position ${index}`);
  
  // Search for checkbox BEFORE the text (within 1000 chars - increased for fragmented texts)
  const searchStart = Math.max(0, index - 1000);
  const beforeText = docContent.substring(searchStart, index);
  const checkboxPos = beforeText.lastIndexOf('☐');
  
  if (checkboxPos === -1) {
    console.log(`❌ No checkbox found before: "${searchText}"`);
    return docContent;
  }
  
  const absolutePos = searchStart + checkboxPos;
  const result = docContent.substring(0, absolutePos) + '☒' + docContent.substring(absolutePos + 1);
  
  console.log(`✅ Marked checkbox for: "${searchText}"`);
  return result;
}

function processCheckboxes(docContent: string, data: SPDAData): string {
  console.log('\n=== PROCESSING CHECKBOXES ===');
  
  // TIPO DE SPDA (5 checkboxes) - Based on exact analysis
  if (data.tipo_spda && Array.isArray(data.tipo_spda)) {
    console.log('Tipo SPDA:', data.tipo_spda);
    for (const tipo of data.tipo_spda) {
      const lower = tipo.toLowerCase();
      
      // Checkbox #1 (index 7): Método de Franklin
      if (lower.includes('franklin')) {
        docContent = markCheckbox(docContent, 'Método de Franklin');
      }
      
      // Checkbox #2 (index 11): Gaiola de Faraday ou Malha
      // Text is split: "Método " + hyperlink "G" + "aiola de Faraday ou Malha"
      if (lower.includes('gaiola') || lower.includes('faraday') || lower.includes('malha')) {
        docContent = markCheckbox(docContent, 'aiola de Faraday');
      }
      
      // Checkbox #3 (index 17): Esfera rolante / Eletrogeométrico
      // Text in template: "Método da esfera rolante, Eletrogeométrico ou Esfera fictícia de Franklin"
      if (lower.includes('esfera') || lower.includes('rolante') || lower.includes('eletrogeométrico') || lower.includes('eletrogeometrico')) {
        // Try multiple search patterns since text may be fragmented
        docContent = markCheckbox(docContent, 'da esfera rolante');
      }
      
      // Checkbox #4 (index 25): SPDA Estrutural (natural)
      // Text in template: "SPDA Estrutural (natural)"
      if (lower.includes('estrutural') && !lower.includes('não') && !lower.includes('nao')) {
        // Try searching for "Estrutural (natural)" or just "Estrutural"
        docContent = markCheckbox(docContent, 'Estrutural (natural)');
      }
      
      // Checkbox #5 (index 27): SPDA Não Estrutural (não natural)
      // Text in template: "SPDA Não Estrutural (não natural)"
      if (lower.includes('não estrutural') || lower.includes('nao estrutural')) {
        // Try searching for "Não Estrutural" or "Nao Estrutural"
        docContent = markCheckbox(docContent, 'Não Estrutural (não natural)');
      }
    }
  }
  
  // EQUIPAMENTO DE MEDIÇÃO (2 checkboxes)
  if (data.equipamento_medicao && Array.isArray(data.equipamento_medicao)) {
    console.log('Equipamento:', data.equipamento_medicao);
    for (const equip of data.equipamento_medicao) {
      const lower = equip.toLowerCase();
      
      // Checkbox #6 (index 30): Termômetro Digital
      if (lower.includes('termômetro') || lower.includes('termometro') || lower.includes('terrômetro') || lower.includes('digital')) {
        docContent = markCheckbox(docContent, 'Termômetro Digital');
      }
      
      // Checkbox #7 (index 32): Alicate Termômetro
      if (lower.includes('alicate')) {
        docContent = markCheckbox(docContent, 'Alicate ');
      }
    }
  }
  
  return docContent;
}

// ============================================
// PROCESS INSPECTIONS (OK/NC/NA)
// ============================================

function markInspectionCheckbox(docContent: string, itemLabel: string, status: 'OK' | 'NC' | 'NA'): string {
  let labelIndex = -1;
  let searchStart = 0;
  
  // Find the label (may appear multiple times, we want the right one)
  while (true) {
    const idx = docContent.indexOf(itemLabel, searchStart);
    if (idx === -1) break;
    labelIndex = idx;
    break; // For now, take the first occurrence
  }
  
  if (labelIndex === -1) {
    console.log(`⚠️ Label not found: "${itemLabel}"`);
    return docContent;
  }
  
  // Get section after label (4500 chars to cover all NA cases which are ~3900 chars away)
  const afterLabel = docContent.substring(labelIndex, labelIndex + 4500);
  
  // Map status to uppercase for searching - search for XML pattern
  const statusMap: Record<string, string> = { 
    'OK': '>OK<', 
    'NC': '>NC<', 
    'NA': '>NA<' 
  };
  const targetStatus = statusMap[status];
  
  // Find the status text in XML format
  const statusTextIndex = afterLabel.indexOf(targetStatus);
  if (statusTextIndex === -1) {
    console.log(`⚠️ Status text "${targetStatus}" not found after "${itemLabel}"`);
    return docContent;
  }
  
  // Get text before the status
  const beforeStatus = afterLabel.substring(0, statusTextIndex);
  
  // Find the last checkbox before the status
  const checkboxPos = beforeStatus.lastIndexOf('☐');
  
  if (checkboxPos === -1) {
    console.log(`⚠️ Checkbox not found before "${targetStatus}" for "${itemLabel}"`);
    return docContent;
  }
  
  // Calculate absolute position and replace
  const absolutePos = labelIndex + checkboxPos;
  const before = docContent.substring(0, absolutePos);
  const after = docContent.substring(absolutePos + 1);
  
  console.log(`✅ Inspection "${itemLabel}" = ${status} (unicode)`);
  return before + '☒' + after;
}


function processInspections(docContent: string, data: SPDAData): string {
  console.log('\n=== PROCESSING INSPECTIONS ===');
  
  // Use partial texts that work with fragmented XML
  const inspections: Array<[keyof SPDAData, string]> = [
    ['projeto_spda', 'Projeto SPDA'],
    ['integridade_condutores', 'Integridade física'],
    ['subsistema_captacao', 'aptação'], // Fragmented: "Subsistema de " + "C" + "aptação"
    ['subsistema_condutores', 'Descida: CONDUTORES'], // Full text: "Subsistema de Descida: CONDUTORES"
    ['caixa_inspecao', 'Caixa de inspe'], // Partial match (ç encoding issue)
    ['subsistema_conexoes', 'CONEXÕES'],
    ['isoladores', 'Isoladores'],
    ['condicao_equipotencializacoes', 'Equipotencializações'],
    ['eletroduto_pcv', 'Eletroduto de PCV'],
    ['subsistema_aterramento', 'Aterramento'],
  ];
  
  for (const [key, label] of inspections) {
    const value = data[key];
    if (value && (value === 'OK' || value === 'NC' || value === 'NA')) {
      console.log(`Processing: ${key} = ${value} (searching for "${label}")`);
      docContent = markInspectionCheckbox(docContent, label, value);
    } else {
      console.log(`Skipping: ${key} = ${value} (not OK/NC/NA)`);
    }
  }
  
  // Ponto de ruptura (SIM/NÃO)
  if (data.ponto_ruptura) {
    console.log(`Ponto de ruptura: ${data.ponto_ruptura}`);
    
    // Find the question text first
    const rupturaIdx = docContent.indexOf('Identificado algum ponto de ruptura?');
    if (rupturaIdx === -1) {
      console.log('⚠️ "Identificado algum ponto de ruptura?" not found');
    } else {
      // Search for SIM and NÃO after the question (within 2500 chars - NÃO is ~2362 chars away)
      const afterRuptura = docContent.substring(rupturaIdx, rupturaIdx + 2500);
      
      if (data.ponto_ruptura === 'SIM') {
        // Find "SIM" text after the question
        const simIdx = afterRuptura.indexOf('SIM');
        if (simIdx !== -1) {
          const absoluteSimIdx = rupturaIdx + simIdx;
          // Find checkbox BEFORE "SIM" (within 200 chars)
          const beforeSim = docContent.substring(Math.max(0, absoluteSimIdx - 200), absoluteSimIdx);
          const cbPos = beforeSim.lastIndexOf('☐');
          if (cbPos !== -1) {
            const absCbPos = Math.max(0, absoluteSimIdx - 200) + cbPos;
            docContent = docContent.substring(0, absCbPos) + '☒' + docContent.substring(absCbPos + 1);
            console.log('✅ Marked checkbox for: SIM (ponto de ruptura)');
          } else {
            console.log('⚠️ Checkbox not found before SIM');
          }
        } else {
          console.log('⚠️ "SIM" text not found after question');
        }
      } else if (data.ponto_ruptura === 'NÃO' || data.ponto_ruptura === 'NAO') {
        // Find "NÃO" text after the question (it's ~2362 chars away)
        const naoIdx = afterRuptura.indexOf('NÃO');
        if (naoIdx !== -1) {
          const absoluteNaoIdx = rupturaIdx + naoIdx;
          // Find checkbox BEFORE "NÃO" (within 200 chars)
          const beforeNao = docContent.substring(Math.max(0, absoluteNaoIdx - 200), absoluteNaoIdx);
          const cbPos = beforeNao.lastIndexOf('☐');
          if (cbPos !== -1) {
            const absCbPos = Math.max(0, absoluteNaoIdx - 200) + cbPos;
            docContent = docContent.substring(0, absCbPos) + '☒' + docContent.substring(absCbPos + 1);
            console.log('✅ Marked checkbox for: NÃO (ponto de ruptura)');
          } else {
            console.log('⚠️ Checkbox not found before NÃO');
          }
        } else {
          console.log('⚠️ "NÃO" text not found after question');
        }
      }
    }
  }
  
  return docContent;
}

// ============================================
// MEASUREMENT POINTS TABLE
// ============================================

function processMeasurementPoints(docContent: string, data: SPDAData): string {
  console.log('\n=== PROCESSING MEASUREMENT POINTS ===');
  
  if (!data.pontos || data.pontos.length === 0) {
    console.log('No measurement points to process');
    return docContent;
  }
  
  console.log(`Processing ${data.pontos.length} points`);
  
  // Find ALL occurrences of "Nº Ponto" to locate the correct table
  // The SECOND table is the one we want (standalone table, not merged)
  let headerIdx = -1;
  let searchStart = 0;
  let occurrenceCount = 0;
  
  while (true) {
    const idx = docContent.indexOf('Nº Ponto', searchStart);
    if (idx === -1) break;
    occurrenceCount++;
    
    // We want the SECOND occurrence (the standalone table)
    if (occurrenceCount === 2) {
      headerIdx = idx;
      break;
    }
    
    searchStart = idx + 1;
  }
  
  if (headerIdx === -1) {
    console.log('⚠️ Table header "Nº Ponto" (2nd occurrence) not found');
    return docContent;
  }
  
  console.log(`✓ Found measurement table at position ${headerIdx}`);
  
  // Find the table containing this header
  const tableStart = docContent.lastIndexOf('<w:tbl>', headerIdx);
  if (tableStart === -1) {
    console.log('⚠️ Table start not found');
    return docContent;
  }
  
  const tableEnd = docContent.indexOf('</w:tbl>', headerIdx);
  if (tableEnd === -1) {
    console.log('⚠️ Table end not found');
    return docContent;
  }
  
  let tableContent = docContent.substring(tableStart, tableEnd + 8);
  
  // Process each point
  for (const point of data.pontos) {
    const pointNum = point.number.padStart(2, '0'); // "01", "02", etc.
    const pointInt = parseInt(point.number);
    
    if (!point.nFoto && !point.valor) {
      continue;
    }
    
    console.log(`\nProcessing Point ${pointNum}: nFoto=${point.nFoto || 'N/A'}, valor=${point.valor || 'N/A'}`);
    
    // Find the row with this point number
    // Numbers are split: <w:t>0</w:t> ... <w:t>1</w:t> for "01" (may have other elements between)
    const isLeftColumn = pointInt <= 10;
    const digit1 = pointNum[0];
    const digit2 = pointNum[1];
    
    // Search for rows containing both digits in sequence
    // We'll search for <w:tr> tags and check their content
    let searchPos = 0;
    let foundRow = false;
    
    while (true) {
      const rowStart = tableContent.indexOf('<w:tr', searchPos);
      if (rowStart === -1) break;
      
      const rowEnd = tableContent.indexOf('</w:tr>', rowStart);
      if (rowEnd === -1) break;
      
      const rowText = tableContent.substring(rowStart, rowEnd + 7);
      
      // Skip header row
      if (rowText.includes('Nº Ponto')) {
        searchPos = rowEnd + 1;
        continue;
      }
      
      // Extract all <w:t> texts from the row
      const textMatches = rowText.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (!textMatches) {
        searchPos = rowEnd + 1;
        continue;
      }
      
      const texts = textMatches.map(m => {
        const match = m.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        return match ? match[1] : '';
      });
      
      // Check if this row contains our point number
      // For "01", we need to find '0' followed by '1' (ignoring whitespace)
      let foundNumber = false;
      for (let i = 0; i < texts.length - 1; i++) {
        if (texts[i] === digit1 && texts[i + 1] === digit2) {
          // Check if this is the left or right column
          // Left column: digits appear early in the row
          // Right column: digits appear later (after cell 3)
          
          // Count how many texts appear before this digit
          const textsBeforeDigit = i;
          
          // If point is 01-10 (left column), digits should appear early (< 5 texts before)
          // If point is 11-20 (right column), digits should appear later (>= 5 texts before)
          const isInLeftColumn = textsBeforeDigit < 5;
          
          if ((isLeftColumn && isInLeftColumn) || (!isLeftColumn && !isInLeftColumn)) {
            foundNumber = true;
            break;
          }
        }
      }
      
      if (!foundNumber) {
        searchPos = rowEnd + 1;
        continue;
      }
      
      // Found the correct row! Now extract cells and fill them
      const cells = rowText.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      if (!cells || cells.length < 7) {
        searchPos = rowEnd + 1;
        continue;
      }
      
      // Cell structure:
      // Cell 0: Point number (left)
      // Cell 1: Nº Foto (left)
      // Cell 2: Valor (left)
      // Cell 3: Empty separator
      // Cell 4: Point number (right)
      // Cell 5: Nº Foto (right)
      // Cell 6: Valor (right)
      
      const photoCol = isLeftColumn ? 1 : 5;
      const valueCol = isLeftColumn ? 2 : 6;
      
      let modified = false;
      
      // Fill Nº Foto
      if (point.nFoto) {
        let cell = cells[photoCol];
        // Check if cell has meaningful text (not just \xa0)
        const hasText = /<w:t[^>]*>(?![\s\xa0]*<)[^<\s\xa0]+<\/w:t>/.test(cell);
        
        if (!hasText) {
          const pEnd = cell.lastIndexOf('</w:p>');
          if (pEnd !== -1) {
            const run = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(point.nFoto)}</w:t></w:r>`;
            cell = cell.substring(0, pEnd) + run + cell.substring(pEnd);
            cells[photoCol] = cell;
            modified = true;
            console.log(`  ✓ Filled Nº Foto: ${point.nFoto}`);
          }
        }
      }
      
      // Fill Valor (Ω)
      if (point.valor) {
        let cell = cells[valueCol];
        const hasText = /<w:t[^>]*>(?![\s\xa0]*<)[^<\s\xa0]+<\/w:t>/.test(cell);
        
        if (!hasText) {
          const pEnd = cell.lastIndexOf('</w:p>');
          if (pEnd !== -1) {
            const run = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(point.valor)}</w:t></w:r>`;
            cell = cell.substring(0, pEnd) + run + cell.substring(pEnd);
            cells[valueCol] = cell;
            modified = true;
            console.log(`  ✓ Filled Valor: ${point.valor}`);
          }
        }
      }
      
      if (modified) {
        let newRow = rowText;
        let cellIdx = 0;
        newRow = newRow.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
        tableContent = tableContent.substring(0, rowStart) + newRow + tableContent.substring(rowEnd + 7);
        foundRow = true;
      }
      
      break;
    }
    
    if (!foundRow) {
      console.log(`  ✗ Row not found for point ${pointNum}`);
    }
  }
  
  // Replace table in document
  docContent = docContent.substring(0, tableStart) + tableContent + docContent.substring(tableEnd + 8);
  
  return docContent;
}


// ============================================
// CROQUI (SKETCH IMAGE)
// ============================================

async function processCroqui(
  zip: PizZip,
  docContent: string,
  croquiBase64: string
): Promise<{ zip: PizZip; docContent: string }> {
  console.log('\n=== PROCESSING CROQUI ===');
  
  try {
    // Based on deep analysis: text is "CROQUI" followed by "/ LOCAL" (separated)
    // Search for just "CROQUI"
    const croquiIdx = docContent.indexOf('CROQUI');
    
    if (croquiIdx === -1) {
      console.log('⚠️ CROQUI section not found');
      return { zip, docContent };
    }
    
    console.log(`🔍 Found CROQUI at position ${croquiIdx}`);
    
    // Extract base64 data
    const base64Data = croquiBase64.split(',')[1] || croquiBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Determine image extension
    let ext = 'png';
    if (croquiBase64.includes('image/jpeg') || croquiBase64.includes('image/jpg')) {
      ext = 'jpeg';
    }
    
    // Add image to ZIP
    const imagePath = `word/media/croqui.${ext}`;
    zip.file(imagePath, imageBuffer);
    
    // Get next relationship ID
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (!relsFile) {
      console.log('⚠️ document.xml.rels not found');
      return { zip, docContent };
    }
    
    let relsContent = relsFile.asText();
    const ridMatches = relsContent.match(/Id="rId(\d+)"/g) || [];
    let maxRid = 0;
    ridMatches.forEach(match => {
      const num = parseInt(match.match(/\d+/)?.[0] || '0');
      if (num > maxRid) maxRid = num;
    });
    const rId = `rId${maxRid + 1}`;
    
    // Add relationship
    const relEntry = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/croqui.${ext}"/>`;
    relsContent = relsContent.replace('</Relationships>', `${relEntry}</Relationships>`);
    zip.file('word/_rels/document.xml.rels', relsContent);
    
    // Find the cell containing CROQUI - this is a large cell where we'll insert the image
    const cellStart = docContent.lastIndexOf('<w:tc', croquiIdx);
    const cellEnd = docContent.indexOf('</w:tc>', croquiIdx);
    if (cellStart === -1 || cellEnd === -1) {
      console.log('⚠️ CROQUI cell not found');
      return { zip, docContent };
    }
    
    // Create image drawing XML (same size as fotografico-generator)
    const cx = 2700000; // width in EMUs (~7cm)
    const cy = 2000000; // height in EMUs (~5cm)
    
    const imageXml = `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${Math.floor(Math.random() * 100000)}" name="Croqui"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="Croqui"/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
    
    // Insert image after the label paragraph
    let cellContent = docContent.substring(cellStart, cellEnd + 7);
    const lastPEnd = cellContent.lastIndexOf('</w:p>');
    if (lastPEnd !== -1) {
      cellContent = cellContent.substring(0, lastPEnd + 6) + imageXml + cellContent.substring(lastPEnd + 6);
      docContent = docContent.substring(0, cellStart) + cellContent + docContent.substring(cellEnd + 7);
      console.log('✅ Croqui inserted');
    }
    
  } catch (error) {
    console.error('Error processing croqui:', error);
  }
  
  return { zip, docContent };
}


// ============================================
// OBSERVAÇÕES/CONCLUSÃO/RECOMENDAÇÕES
// ============================================

function processObservacoes(docContent: string, data: SPDAData): string {
  console.log('\n=== PROCESSING OBSERVAÇÕES ===');
  
  // Texto de recomendação padrão (sempre presente no template)
  const recomendacaoPadrao = 'RECOMENDAMOS QUE O VALOR ADMISSÍVEL PARA AS MALHAS DE ATERRAMENTO, DESCIDAS DE PARA-RAIOS E RESISTIVIDADE DE SOLO SEJAM DE NO MÁXIMO 10 Ω.';
  
  // Buscar pela recomendação padrão no template
  const recomendacaoIdx = docContent.indexOf('RECOMENDAMOS QUE O VALOR ADMISSÍVEL');
  if (recomendacaoIdx !== -1) {
    console.log('✅ Recomendação padrão já existe no template');
  }
  
  // Agora processar CONCLUSÃO/OBSERVAÇÕES do usuário
  const obs = data.conclusao_observacoes || '';
  if (!obs) {
    console.log('No user observations to add');
    return docContent;
  }
  
  // Buscar por "CONCLUSÃO" ou "OBSERVAÇÕES" (após a tabela de pontos)
  let obsIdx = docContent.indexOf('CONCLUSÃO');
  if (obsIdx === -1) {
    obsIdx = docContent.indexOf('OBSERVAÇÕES');
  }
  
  if (obsIdx === -1) {
    console.log('⚠️ CONCLUSÃO/OBSERVAÇÕES section not found');
    return docContent;
  }
  
  // Encontrar a célula que contém o label
  const cellStart = docContent.lastIndexOf('<w:tc', obsIdx);
  const cellEnd = docContent.indexOf('</w:tc>', obsIdx);
  if (cellStart === -1 || cellEnd === -1) return docContent;
  
  let cellContent = docContent.substring(cellStart, cellEnd + 7);
  
  // Dividir observações por quebras de linha e criar parágrafos
  const lines = obs.split('\n').filter(line => line.trim());
  
  let paragraphs = '';
  for (const line of lines) {
    paragraphs += `<w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(line)}</w:t></w:r></w:p>`;
  }
  
  // Inserir após o label
  const lastPEnd = cellContent.lastIndexOf('</w:p>');
  if (lastPEnd !== -1) {
    cellContent = cellContent.substring(0, lastPEnd + 6) + paragraphs + cellContent.substring(lastPEnd + 6);
    docContent = docContent.substring(0, cellStart) + cellContent + docContent.substring(cellEnd + 7);
    console.log('✅ Observações filled');
  }
  
  return docContent;
}

// ============================================
// STATUS COLOR
// ============================================

function processStatusColor(docContent: string, status: string): string {
  if (!status) return docContent;
  
  console.log('\n=== PROCESSING STATUS COLOR ===');
  
  const colorMap: Record<string, string> = {
    'APROVADO': '00B050',    // Verde
    'REVISÃO': 'FFC000',     // Amarelo
    'REPROVADO': 'FF0000',   // Vermelho
  };
  
  const newColor = colorMap[status.toUpperCase()];
  if (!newColor) {
    console.log(`⚠️ Status "${status}" not recognized`);
    return docContent;
  }
  
  // Find STATUS cell
  const statusIdx = docContent.indexOf('STATUS');
  if (statusIdx === -1) {
    console.log('⚠️ STATUS cell not found');
    return docContent;
  }
  
  // Find the row containing STATUS
  const lineStart = docContent.lastIndexOf('<w:tr', statusIdx);
  const lineEnd = docContent.indexOf('</w:tr>', statusIdx);
  
  if (lineStart === -1 || lineEnd === -1) {
    console.log('⚠️ STATUS row not found');
    return docContent;
  }
  
  let line = docContent.substring(lineStart, lineEnd + 7);
  const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  if (!cells || cells.length < 3) {
    console.log('⚠️ Not enough cells in STATUS row');
    return docContent;
  }
  
  // The color indicator is typically in the 3rd cell (index 2)
  let colorCell = cells[2];
  
  // Apply color by modifying w:shd element
  colorCell = colorCell.replace(
    /<w:shd\s+[^>]*\/>/g,
    `<w:shd w:val="clear" w:fill="${newColor}"/>`
  );
  
  // If no w:shd exists, add it to w:tcPr
  if (!colorCell.includes('<w:shd')) {
    if (colorCell.includes('<w:tcPr>')) {
      colorCell = colorCell.replace(
        /<w:tcPr>/g,
        `<w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/>`
      );
    } else if (colorCell.includes('<w:tcPr/>')) {
      colorCell = colorCell.replace(
        /<w:tcPr\/>/g,
        `<w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/></w:tcPr>`
      );
    }
  }
  
  cells[2] = colorCell;
  
  // Rebuild row
  let newLine = line;
  let cellIdx = 0;
  newLine = newLine.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
  
  docContent = docContent.substring(0, lineStart) + newLine + docContent.substring(lineEnd + 7);
  
  const statusNames: Record<string, string> = {
    '00B050': '🟢 APROVADO',
    'FFC000': '🟡 REVISÃO',
    'FF0000': '🔴 REPROVADO'
  };
  
  console.log(`✅ Status: ${statusNames[newColor] || newColor}`);
  
  return docContent;
}


// ============================================
// PHOTOS PAGE (LAST PAGE)
// ============================================

async function processPhotosPage(
  zip: PizZip,
  docContent: string,
  points: SPDAPoint[]
): Promise<{ zip: PizZip; docContent: string }> {
  console.log('\n=== PROCESSING PHOTOS PAGE ===');
  
  // Filter points that have photos
  const photosToAdd = points.filter(p => p.foto && p.foto.startsWith('data:image'));
  
  if (photosToAdd.length === 0) {
    console.log('No photos to add');
    return { zip, docContent };
  }
  
  console.log(`Adding ${photosToAdd.length} photos in grid layout...`);
  
  // Get relationships file
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (!relsFile) {
    console.log('⚠️ document.xml.rels not found');
    return { zip, docContent };
  }
  
  let relsContent = relsFile.asText();
  const ridMatches = relsContent.match(/Id="rId(\d+)"/g) || [];
  let maxRid = 0;
  ridMatches.forEach(match => {
    const num = parseInt(match.match(/\d+/)?.[0] || '0');
    if (num > maxRid) maxRid = num;
  });
  
  let nextRid = maxRid + 1;
  const rids: string[] = [];
  
  // Process each photo and add to ZIP
  for (let i = 0; i < photosToAdd.length; i++) {
    const point = photosToAdd[i];
    const photoId = `spda_point_${point.number}`;
    const rId = `rId${nextRid++}`;
    
    try {
      // Extract base64 data
      const base64Data = point.foto.split(',')[1] || point.foto;
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Determine extension
      let ext = 'png';
      if (point.foto.includes('image/jpeg') || point.foto.includes('image/jpg')) {
        ext = 'jpeg';
      }
      
      // Add image to ZIP
      const imagePath = `word/media/${photoId}.${ext}`;
      zip.file(imagePath, imageBuffer);
      
      // Add relationship
      const relEntry = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${photoId}.${ext}"/>`;
      relsContent = relsContent.replace('</Relationships>', `${relEntry}</Relationships>`);
      
      rids.push(rId);
      console.log(`✅ Added photo for point ${point.number}`);
      
    } catch (error) {
      console.error(`Error processing photo for point ${point.number}:`, error);
    }
  }
  
  // Update relationships
  zip.file('word/_rels/document.xml.rels', relsContent);
  
  // Since "REGISTRO FOTOGRÁFICO" doesn't exist in template, create a new page
  // Insert before </w:body>
  const bodyEndPos = docContent.indexOf('</w:body>');
  if (bodyEndPos === -1) {
    console.log('⚠️ </w:body> not found');
    return { zip, docContent };
  }
  
  // Create page break
  const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  
  // Create title
  const title = '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t>REGISTRO FOTOGRÁFICO - PONTOS DE MEDIÇÃO</w:t></w:r></w:p>';
  
  // Create table with 2 columns (same structure as fotografico-generator)
  let photoTable = '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="5548"/><w:gridCol w:w="5548"/></w:tblGrid>';
  
  // Add photos in pairs (2 per row)
  for (let i = 0; i < photosToAdd.length; i += 2) {
    const point1 = photosToAdd[i];
    const rid1 = rids[i];
    const point2 = photosToAdd[i + 1];
    const rid2 = rids[i + 1];
    
    photoTable += createPhotoRow(point1, rid1, point2, rid2);
  }
  
  photoTable += '</w:tbl>';
  
  // Insert page break + title + table before </w:body>
  const newContent = pageBreak + title + photoTable;
  docContent = docContent.substring(0, bodyEndPos) + newContent + docContent.substring(bodyEndPos);
  
  console.log(`✅ Created new photo page with ${photosToAdd.length} photos`);
  
  return { zip, docContent };
}

// Helper function to create a table row with 1 or 2 photos
function createPhotoRow(
  point1: SPDAPoint,
  rid1: string,
  point2?: SPDAPoint,
  rid2?: string
): string {
  const cellStyle = `<w:tcPr><w:tcW w:w="2500" w:type="pct"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tcBorders><w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>`;
  
  let row = '<w:tr><w:trPr><w:trHeight w:val="3500"/></w:trPr>';
  
  // First cell with photo
  row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${createImageDrawing(rid1)}</w:p>`;
  
  // Add point info
  const description1 = `Ponto ${point1.number}${point1.nFoto ? ` - Foto ${point1.nFoto}` : ''}${point1.valor ? ` - ${point1.valor} Ω` : ''}`;
  row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(description1)}</w:t></w:r></w:p>`;
  row += '</w:tc>';
  
  // Second cell (with photo or empty)
  if (point2 && rid2) {
    row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${createImageDrawing(rid2)}</w:p>`;
    const description2 = `Ponto ${point2.number}${point2.nFoto ? ` - Foto ${point2.nFoto}` : ''}${point2.valor ? ` - ${point2.valor} Ω` : ''}`;
    row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(description2)}</w:t></w:r></w:p>`;
    row += '</w:tc>';
  } else {
    // Empty cell
    row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p></w:tc>`;
  }
  
  row += '</w:tr>';
  return row;
}

// Helper function to create image drawing XML
function createImageDrawing(rid: string): string {
  // Image size: ~7cm x 5cm (2700000 x 2000000 EMUs)
  const cx = 2700000; // width in EMUs
  const cy = 2000000; // height in EMUs
  
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${Math.floor(Math.random() * 100000)}" name="Foto"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}


// ============================================
// ENSURE CONTENT TYPES
// ============================================

function ensureContentTypes(zip: PizZip): void {
  const contentTypesFile = zip.file('[Content_Types].xml');
  if (!contentTypesFile) return;
  
  let contentTypes = contentTypesFile.asText();
  
  // Add PNG if not present
  if (!contentTypes.includes('Extension="png"')) {
    contentTypes = contentTypes.replace(
      '</Types>',
      '<Default Extension="png" ContentType="image/png"/></Types>'
    );
  }
  
  // Add JPEG if not present
  if (!contentTypes.includes('Extension="jpeg"')) {
    contentTypes = contentTypes.replace(
      '</Types>',
      '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>'
    );
  }
  
  // Add JPG if not present
  if (!contentTypes.includes('Extension="jpg"')) {
    contentTypes = contentTypes.replace(
      '</Types>',
      '<Default Extension="jpg" ContentType="image/jpeg"/></Types>'
    );
  }
  
  zip.file('[Content_Types].xml', contentTypes);
}
