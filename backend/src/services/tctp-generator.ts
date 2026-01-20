import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TCTPPhoto {
  id: string;
  data: string;
  name: string;
  description?: string;
}

export interface TCTPData {
  tipo: 'TC' | 'TP' | null;
  cliente: string;
  data: string;
  localEquipamento: string;
  elaboradoPor: string;
  fabricante: string;
  tipo_equipamento: string;
  numeroSerieR: string;
  numeroSerieS: string;
  numeroSerieT: string;
  relacao: string;
  anoFabricacao?: string;
  tensaoNominal?: string;
  potenciaNominal?: string;
  fatorServico?: string;
  classePrecisao1?: string;
  classePrecisao2?: string;
  classePrecisao3?: string;
  classePrecisao4?: string;
  classePrecisao5?: string;
  status?: 'conforme' | 'alerta' | 'corretiva' | '';
  verif01: 'S' | 'N' | 'I';
  verif02: 'S' | 'N' | 'I';
  verif03: 'S' | 'N' | 'I';
  verif04: 'S' | 'N' | 'I';
  verif05: 'S' | 'N' | 'I';
  verif06: 'S' | 'N' | 'I';
  tensaoAplicadaEm: 'primario' | 'secundario';
  enrolAplicado: string[];
  tensaoAplicada: string[];
  enrolMedido: string[];
  tensaoMedidaR: string[];
  tensaoMedidaS: string[];
  tensaoMedidaT: string[];
  instrumentoUtilizado?: string;
  ensaiosDurante?: string; // "1 minuto"
  temperaturaAmbiente?: string;
  umidadeRelativa?: string;
  // Resistência de Isolamento - Conexões e valores
  enrolMedidoIsolamento?: string[]; // Enrolamento medido na seção de isolamento
  conexoesIsolamento: string[]; // ["AT x Massa", "AT x Sec", "Sec x Massa", "Sec x Massa"]
  tensaoAplicadaIsolamento: string[]; // ["Vcc", "Vcc", "Vcc", "Vcc"]
  resistIsoR: string[]; // Valores em MΩ
  resistIsoS: string[]; // Valores em MΩ
  resistIsoT: string[]; // Valores em MΩ
  // Resistência Ôhmica
  enrolMedidoOhm: string[]; // ["R", "S", "T"]
  resistOhmR?: string; // Valor em Ω (célula 3)
  resistOhmS?: string; // Valor em Ω (célula 3)
  resistOhmT?: string; // Valor em Ω (célula 3)
  resistOhmExtraR?: string[]; // Valores extras para células 4, 5, 6
  resistOhmExtraS?: string[]; // Valores extras para células 4, 5, 6
  resistOhmExtraT?: string[]; // Valores extras para células 4, 5, 6
  // Polaridades
  enrolMedidoPol: string[];
  polaridadeR: boolean[];
  polaridadeS: boolean[];
  polaridadeT: boolean[];
  observacoes?: string;
  photos?: TCTPPhoto[];
}

function escapeXml(text: string): string {
  if (!text) return '';
  return String(text)
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

// Normalize text for comparison (remove accents, special chars, extra spaces)
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove special chars except spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
}

function fillResistenciaIsolamentoTable(docContent: string, resistR: string[], resistS: string[], resistT: string[]): string {
  // Find "Conexões:" first - the Resist. Medida rows come AFTER Conexões
  const conexoesPos = docContent.indexOf('Conexões:');
  if (conexoesPos === -1) {
    console.log('Conexões not found for Resistência Isolamento');
    return docContent;
  }
  
  // Find "Resist" label AFTER Conexões (this is the "Resist. Medida" label row)
  const resistMedidaPos = docContent.indexOf('Resist', conexoesPos);
  if (resistMedidaPos === -1) {
    console.log('Resist label not found after Conexões');
    return docContent;
  }
  
  // Find the table row that contains "Resist" label
  // This row has: Cell 0 = "Resist. Medida", Cell 1 = R, Cell 2-5 = empty cells for values
  const resistRowStart = docContent.lastIndexOf('<w:tr', resistMedidaPos);
  const resistRowEnd = docContent.indexOf('</w:tr>', resistMedidaPos);
  
  if (resistRowStart === -1 || resistRowEnd === -1) {
    console.log('Resist label row not found');
    return docContent;
  }
  
  // Fill R row (the same row as "Resist. Medida")
  let rowContent = docContent.substring(resistRowStart, resistRowEnd + 7);
  const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  if (!cells || cells.length < 6) {
    console.log('Not enough cells in Resist row');
    return docContent;
  }
  
  // Cell 0 = "Resist. Medida", Cell 1 = R, Cells 2-5 = values
  // Fill cells 2, 3, 4, 5 with resistR values
  for (let i = 0; i < resistR.length && i + 2 < cells.length; i++) {
    if (resistR[i]) {
      cells[i + 2] = fillCellWithValue(cells[i + 2], resistR[i]);
    }
  }
  
  // Rebuild row
  let cellIdx = 0;
  rowContent = rowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
  docContent = docContent.substring(0, resistRowStart) + rowContent + docContent.substring(resistRowEnd + 7);
  console.log(`✓ Filled Resistência Isolamento R (${resistR.filter(v => v).length} values)`);
  
  // Now find S row (next row after Resist row)
  // This row has: Cell 0 = empty (merged), Cell 1 = S, Cells 2-5 = empty cells for values
  const sRowStart = docContent.indexOf('<w:tr', resistRowStart + rowContent.length);
  if (sRowStart !== -1 && sRowStart < resistMedidaPos + 10000) {
    const sRowEnd = docContent.indexOf('</w:tr>', sRowStart);
    if (sRowEnd !== -1) {
      let sRowContent = docContent.substring(sRowStart, sRowEnd + 7);
      const sCells = sRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      if (sCells && sCells.length >= 6) {
        // Cell 0 = empty, Cell 1 = S, Cells 2-5 = values
        for (let i = 0; i < resistS.length && i + 2 < sCells.length; i++) {
          if (resistS[i]) {
            sCells[i + 2] = fillCellWithValue(sCells[i + 2], resistS[i]);
          }
        }
        
        cellIdx = 0;
        sRowContent = sRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => sCells[cellIdx++] || '');
        docContent = docContent.substring(0, sRowStart) + sRowContent + docContent.substring(sRowEnd + 7);
        console.log(`✓ Filled Resistência Isolamento S (${resistS.filter(v => v).length} values)`);
        
        // Now find T row (next row after S row)
        const tRowStart = docContent.indexOf('<w:tr', sRowStart + sRowContent.length);
        if (tRowStart !== -1 && tRowStart < resistMedidaPos + 15000) {
          const tRowEnd = docContent.indexOf('</w:tr>', tRowStart);
          if (tRowEnd !== -1) {
            let tRowContent = docContent.substring(tRowStart, tRowEnd + 7);
            const tCells = tRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
            
            if (tCells && tCells.length >= 6) {
              // Cell 0 = empty, Cell 1 = T, Cells 2-5 = values
              for (let i = 0; i < resistT.length && i + 2 < tCells.length; i++) {
                if (resistT[i]) {
                  tCells[i + 2] = fillCellWithValue(tCells[i + 2], resistT[i]);
                }
              }
              
              cellIdx = 0;
              tRowContent = tRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => tCells[cellIdx++] || '');
              docContent = docContent.substring(0, tRowStart) + tRowContent + docContent.substring(tRowEnd + 7);
              console.log(`✓ Filled Resistência Isolamento T (${resistT.filter(v => v).length} values)`);
            }
          }
        }
      }
    }
  }
  
  console.log('✅ Filled Resistência Isolamento table (R/S/T)');
  return docContent;
}

function fillCellWithValue(cellContent: string, value: string): string {
  const pMatch = cellContent.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/);
  if (!pMatch) return cellContent;
  
  const pContent = pMatch[0];
  const pStart = cellContent.indexOf(pContent);
  const pTagEnd = pContent.indexOf('>');
  const pTag = pContent.substring(0, pTagEnd + 1);
  
  const newP = `${pTag}<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r></w:p>`;
  return cellContent.substring(0, pStart) + newP + cellContent.substring(pStart + pContent.length);
}

function fillResistenciaOhmicaTable(
  docContent: string, 
  resistR: string, 
  resistS: string, 
  resistT: string,
  extraR?: string[],
  extraS?: string[],
  extraT?: string[]
): string {
  // Find "Ohmica" section first
  const ohmicaPos = docContent.indexOf('Ohmica');
  if (ohmicaPos === -1) {
    console.log('Seção Ôhmica não encontrada');
    return docContent;
  }
  
  // Find "Resist" after Ohmica (the label for the R/S/T rows)
  const resistPos = docContent.indexOf('Resist', ohmicaPos);
  if (resistPos === -1) {
    console.log('Label "Resist" não encontrado após Ohmica');
    return docContent;
  }
  
  // Find R row - search for <w:t>R</w:t> after Resist label
  let searchStart = resistPos;
  const rLabelPos = docContent.indexOf('<w:t>R</w:t>', searchStart);
  if (rLabelPos === -1 || rLabelPos > resistPos + 2000) {
    console.log('Label R não encontrado');
    return docContent;
  }
  
  // Fill R value
  if (resistR) {
    const rRowStart = docContent.lastIndexOf('<w:tr', rLabelPos);
    const rRowEnd = docContent.indexOf('</w:tr>', rLabelPos);
    
    if (rRowStart !== -1 && rRowEnd !== -1) {
      let rRowContent = docContent.substring(rRowStart, rRowEnd + 7);
      const rCells = rRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      // Structure: [Resist. Medida cell] [R cell] [Ω cell] [value cell] [extra cells...]
      if (rCells && rCells.length >= 4) {
        rCells[3] = fillCellWithValue(rCells[3], resistR);
        
        // Fill extra cells if provided
        if (extraR && extraR.length > 0) {
          for (let i = 0; i < extraR.length && i + 4 < rCells.length; i++) {
            if (extraR[i]) {
              rCells[i + 4] = fillCellWithValue(rCells[i + 4], extraR[i]);
            }
          }
        }
        
        let cellIdx = 0;
        rRowContent = rRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => rCells[cellIdx++] || '');
        docContent = docContent.substring(0, rRowStart) + rRowContent + docContent.substring(rRowEnd + 7);
        console.log(`✓ Filled Ôhmica R: ${resistR}${extraR ? ` + ${extraR.length} extras` : ''}`);
      }
    }
  }
  
  // Find S row - search for <w:t>S</w:t> after R row
  searchStart = rLabelPos + 100;
  const sLabelPos = docContent.indexOf('<w:t>S</w:t>', searchStart);
  if (sLabelPos !== -1 && sLabelPos < resistPos + 10000 && resistS) {
    const sRowStart = docContent.lastIndexOf('<w:tr', sLabelPos);
    const sRowEnd = docContent.indexOf('</w:tr>', sLabelPos);
    
    if (sRowStart !== -1 && sRowEnd !== -1) {
      let sRowContent = docContent.substring(sRowStart, sRowEnd + 7);
      const sCells = sRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      if (sCells && sCells.length >= 4) {
        sCells[3] = fillCellWithValue(sCells[3], resistS);
        
        // Fill extra cells if provided
        if (extraS && extraS.length > 0) {
          for (let i = 0; i < extraS.length && i + 4 < sCells.length; i++) {
            if (extraS[i]) {
              sCells[i + 4] = fillCellWithValue(sCells[i + 4], extraS[i]);
            }
          }
        }
        
        let cellIdx = 0;
        sRowContent = sRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => sCells[cellIdx++] || '');
        docContent = docContent.substring(0, sRowStart) + sRowContent + docContent.substring(sRowEnd + 7);
        console.log(`✓ Filled Ôhmica S: ${resistS}${extraS ? ` + ${extraS.length} extras` : ''}`);
      }
    }
  }
  
  // Find T row - search for <w:t>T</w:t> after S row
  searchStart = sLabelPos !== -1 ? sLabelPos + 100 : rLabelPos + 200;
  const tLabelPos = docContent.indexOf('<w:t>T</w:t>', searchStart);
  if (tLabelPos !== -1 && tLabelPos < resistPos + 15000 && resistT) {
    const tRowStart = docContent.lastIndexOf('<w:tr', tLabelPos);
    const tRowEnd = docContent.indexOf('</w:tr>', tLabelPos);
    
    if (tRowStart !== -1 && tRowEnd !== -1) {
      let tRowContent = docContent.substring(tRowStart, tRowEnd + 7);
      const tCells = tRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      if (tCells && tCells.length >= 4) {
        tCells[3] = fillCellWithValue(tCells[3], resistT);
        
        // Fill extra cells if provided
        if (extraT && extraT.length > 0) {
          for (let i = 0; i < extraT.length && i + 4 < tCells.length; i++) {
            if (extraT[i]) {
              tCells[i + 4] = fillCellWithValue(tCells[i + 4], extraT[i]);
            }
          }
        }
        
        let cellIdx = 0;
        tRowContent = tRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => tCells[cellIdx++] || '');
        docContent = docContent.substring(0, tRowStart) + tRowContent + docContent.substring(tRowEnd + 7);
        console.log(`✓ Filled Ôhmica T: ${resistT}${extraT ? ` + ${extraT.length} extras` : ''}`);
      }
    }
  }
  
  console.log('✅ Filled Resistência Ôhmica table (R/S/T)');
  return docContent;
}

function fillVerificacao(docContent: string, itemNum: string, value: 'S' | 'N' | 'I'): string {
  // Find the row with the item number
  // Structure: Each row has 2 items (01+04, 02+05, 03+06)
  // Row 1: [01] [desc] [checkbox] [04] [desc] [checkbox]
  // Row 2: [02] [desc] [checkbox] [05] [desc] [checkbox]
  // Row 3: [03] [desc] [checkbox] [06] [desc] [checkbox]
  
  console.log(`\n=== fillVerificacao: item ${itemNum}, value ${value} ===`);
  
  // First, find the Verificações section
  const verificacoesPos = docContent.indexOf('Verifica');
  if (verificacoesPos === -1) {
    console.log('❌ Verificações section not found');
    return docContent;
  }
  
  // Search for the item number AFTER the Verificações section
  // Limit search to 20000 chars after Verificações
  const searchEnd = verificacoesPos + 20000;
  let foundPos = -1;
  let searchPos = verificacoesPos;
  
  while (searchPos < searchEnd) {
    const pos = docContent.indexOf(`>${itemNum}<`, searchPos);
    if (pos === -1 || pos >= searchEnd) break;
    
    // Found a candidate - verify it's in a table row
    const rowStart = docContent.lastIndexOf('<w:tr', pos);
    if (rowStart !== -1 && rowStart >= verificacoesPos) {
      foundPos = pos;
      console.log(`Found item ${itemNum} at position ${pos}`);
      break;
    }
    searchPos = pos + 1;
  }
  
  if (foundPos === -1) {
    console.log(`❌ Item ${itemNum} not found in Verificações section`);
    return docContent;
  }

  // Find the row containing this number
  const rowStart = docContent.lastIndexOf('<w:tr', foundPos);
  const rowEnd = docContent.indexOf('</w:tr>', foundPos);
  
  if (rowStart === -1 || rowEnd === -1) {
    console.log(`❌ Row not found for item ${itemNum}`);
    return docContent;
  }

  let rowContent = docContent.substring(rowStart, rowEnd + 7);
  
  // Find all cells in the row
  const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (!cells || cells.length < 6) {
    console.log(`❌ Not enough cells in row for item ${itemNum} (found ${cells?.length || 0})`);
    return docContent;
  }

  // Determine which column this item is in
  // Items 01, 02, 03 are in the first column (cells 0-2)
  // Items 04, 05, 06 are in the second column (cells 3-5)
  const isFirstColumn = ['01', '02', '03'].includes(itemNum);
  const targetCellIndex = isFirstColumn ? 2 : 5; // Checkbox cell
  
  console.log(`Item ${itemNum} is in ${isFirstColumn ? 'first' : 'second'} column, target cell: ${targetCellIndex}`);
  
  const markSymbol = '✓';
  
  // Mark the checkbox cell
  let targetCell = cells[targetCellIndex];
  
  // Find paragraph and add mark
  const pMatch = targetCell.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/);
  if (pMatch) {
    const pContent = pMatch[0];
    const pStart = targetCell.indexOf(pContent);
    const pTagEnd = pContent.indexOf('>');
    const pTag = pContent.substring(0, pTagEnd + 1);
    
    const newP = `${pTag}<w:r><w:rPr><w:rFonts w:ascii="Arial MT" w:hAnsi="Arial MT"/><w:b/><w:sz w:val="16"/></w:rPr><w:t>${markSymbol}</w:t></w:r></w:p>`;
    targetCell = targetCell.substring(0, pStart) + newP + targetCell.substring(pStart + pContent.length);
    cells[targetCellIndex] = targetCell;
    console.log(`✓ Marked cell ${targetCellIndex} with ${markSymbol}`);
  } else {
    console.log(`❌ No paragraph found in cell ${targetCellIndex}`);
  }

  // Rebuild row
  let cellIdx = 0;
  rowContent = rowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');

  docContent = docContent.substring(0, rowStart) + rowContent + docContent.substring(rowEnd + 7);
  console.log(`✅ Filled verificação ${itemNum}: ${value}`);
  
  return docContent;
}

function fillClassesPrecisao345(docContent: string, classe3: string, classe4: string, classe5: string): string {
  // Find "Classe de precisão" section
  const classePrecisaoPos = docContent.indexOf('Classe de precis');
  if (classePrecisaoPos === -1) {
    console.log('Seção Classe de precisão não encontrada');
    return docContent;
  }

  // Find the table containing classes de precisão
  const tableStart = docContent.lastIndexOf('<w:tbl>', classePrecisaoPos);
  const tableEnd = docContent.indexOf('</w:tbl>', classePrecisaoPos);
  
  if (tableStart === -1 || tableEnd === -1) {
    console.log('Tabela Classe de precisão não encontrada');
    return docContent;
  }

  let tableContent = docContent.substring(tableStart, tableEnd + 8);
  
  // Find all cells that contain only ":" (empty classe cells)
  // These are cells with pattern: <w:t>:</w:t> with no other text
  const emptyCells: { start: number; end: number; cellStart: number; cellEnd: number }[] = [];
  
  const cellPattern = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
  let cellMatch;
  
  while ((cellMatch = cellPattern.exec(tableContent)) !== null) {
    const cellContent = cellMatch[1];
    const cellStart = cellMatch.index;
    const cellEnd = cellStart + cellMatch[0].length;
    
    // Check if cell contains only ":" as text
    const textMatches = cellContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches) {
      const allText = textMatches.map(m => {
        const textMatch = m.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
        return textMatch ? textMatch[1].trim() : '';
      }).join('').trim();
      
      if (allText === ':') {
        emptyCells.push({
          start: cellStart,
          end: cellEnd,
          cellStart: tableStart + cellStart,
          cellEnd: tableStart + cellEnd
        });
      }
    }
  }
  
  console.log(`Found ${emptyCells.length} empty classe cells with ":"`);
  
  // Fill the first 3 empty cells with classes 3, 4, 5
  const values = [classe3, classe4, classe5].filter(v => v);
  
  if (emptyCells.length === 0) {
    console.log('No empty classe cells found');
    return docContent;
  }
  
  // Fill from the end to avoid position shifts
  for (let i = Math.min(values.length, emptyCells.length) - 1; i >= 0; i--) {
    if (values[i]) {
      const cell = emptyCells[i];
      const cellContent = docContent.substring(cell.cellStart, cell.cellEnd);
      
      // Find the paragraph with ":"
      const pMatch = cellContent.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/);
      if (pMatch) {
        const pContent = pMatch[0];
        const pStart = cellContent.indexOf(pContent);
        const pTagEnd = pContent.indexOf('>');
        const pTag = pContent.substring(0, pTagEnd + 1);
        
        // Replace with new value, keeping the ":"
        const newP = `${pTag}<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(values[i])}</w:t></w:r></w:p>`;
        const newCellContent = cellContent.substring(0, pStart) + newP + cellContent.substring(pStart + pContent.length);
        
        docContent = docContent.substring(0, cell.cellStart) + newCellContent + docContent.substring(cell.cellEnd);
        console.log(`✓ Filled classe ${i + 3}: ${values[i]}`);
      }
    }
  }
  
  return docContent;
}

export async function generateTCTPReport(
  data: TCTPData,
  template: 'nx' | 'sercamp'
): Promise<Buffer> {
  const templatesDir = path.join(__dirname, '../../templates');
  const templateFile = template === 'nx' ? 'tc_tp_nx.docx' : 'tc_tp_sercamp.docx';
  const templatePath = path.join(templatesDir, templateFile);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  console.log('=== TC/TP Report Generation ===');
  console.log('Template:', template);
  console.log('Tipo:', data.tipo);
  console.log('📊 STATUS RECEBIDO:', data.status || '(vazio)');

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
    // 1. Marcar checkbox TC ou TP
    if (data.tipo === 'TC') {
      docContent = markCheckboxBeforeText(docContent, 'TC');
    } else if (data.tipo === 'TP') {
      docContent = markCheckboxBeforeText(docContent, 'TP');
    }

    // 2. Preencher campos do header
    console.log('=== Preenchendo campos do header ===');
    const headerFields: [string, string][] = [
      ['Cliente:', data.cliente],
      ['Data:', formatDate(data.data)],
      ['Local do Equipamento:', data.localEquipamento],
      ['Elaborado por:', data.elaboradoPor],
    ];

    for (const [label, value] of headerFields) {
      if (value) {
        console.log(`Tentando preencher: ${label} = ${value}`);
        docContent = fillFieldByLabel(docContent, label, value);
      }
    }

    // 3. Preencher características
    console.log('=== Preenchendo características ===');
    const caracteristicas: [string, string][] = [
      ['Fabricante:', data.fabricante],
      ['Tipo:', data.tipo_equipamento],
      ['Número de série - Fase R:', data.numeroSerieR],
      ['Número de série - Fase S:', data.numeroSerieS],
      ['Número de série - Fase T:', data.numeroSerieT],
      ['Relação:', data.relacao],
      ['Ano de fabricação:', data.anoFabricacao || ''],
      ['Tensão nominal:', data.tensaoNominal || ''],
      ['Potência nominal:', data.potenciaNominal || ''],
      ['Fator de serviço:', data.fatorServico || ''],
    ];

    for (const [label, value] of caracteristicas) {
      if (value) {
        console.log(`Tentando preencher: ${label} = ${value}`);
        docContent = fillFieldByLabel(docContent, label, value);
      }
    }

    // 4. Classes de precisão (5 campos)
    console.log('=== Preenchendo classes de precisão ===');
    const classePrecisaoLabels = ['Classe de precisão do enrol.:', 'Classe de precis'];
    if (data.classePrecisao1) {
      for (const lbl of classePrecisaoLabels) {
        const result = fillFieldByLabel(docContent, lbl, data.classePrecisao1, 1);
        if (result !== docContent) {
          docContent = result;
          break;
        }
      }
    }
    if (data.classePrecisao2) {
      for (const lbl of classePrecisaoLabels) {
        const result = fillFieldByLabel(docContent, lbl, data.classePrecisao2, 2);
        if (result !== docContent) {
          docContent = result;
          break;
        }
      }
    }
    
    // Classes 3, 4, 5 - buscar por células vazias com apenas ":"
    if (data.classePrecisao3 || data.classePrecisao4 || data.classePrecisao5) {
      docContent = fillClassesPrecisao345(docContent, data.classePrecisao3 || '', data.classePrecisao4 || '', data.classePrecisao5 || '');
    }

    // 4.5. Verificações / Serviços (S/N/I checkboxes)
    console.log('=== Preenchendo verificações ===');
    const verificacoes = [
      { num: '01', value: data.verif01, label: 'Fixações e alinhamentos' },
      { num: '02', value: data.verif02, label: 'Integridade dos isoladores' },
      { num: '03', value: data.verif03, label: 'Aterramentos' },
      { num: '04', value: data.verif04, label: 'Limpeza dos isoladores' },
      { num: '05', value: data.verif05, label: 'Reapertos das conexões' },
      { num: '06', value: data.verif06, label: 'Outro' }
    ];
    
    for (const verif of verificacoes) {
      // Só preencher se for 'S' ou 'N', não preencher 'I' (Inexistente)
      if (verif.value && verif.value !== 'I') {
        docContent = fillVerificacao(docContent, verif.num, verif.value);
      }
    }

    // 5. Tensão Aplicada em (Primário/Secundário)
    if (data.tensaoAplicadaEm === 'primario') {
      docContent = markUnicodeCheckboxBeforeText(docContent, 'Primário');
    } else if (data.tensaoAplicadaEm === 'secundario') {
      docContent = markUnicodeCheckboxBeforeText(docContent, 'Secundário');
    }

    // 6. Ensaios de Relação - Arrays
    docContent = fillArrayInTable(docContent, 'Enrolamento aplicado:', data.enrolAplicado);
    // Tensão Aplicada - precisa pular a primeira ocorrência ("Tensão Aplicada em")
    const relacaoPos = docContent.indexOf('Ensaios de Rela');
    if (relacaoPos !== -1) {
      // Procurar "Tensão Aplicada" que NÃO seja seguido de " em"
      let searchPos = relacaoPos;
      let tensaoPos = -1;
      while (true) {
        const pos = docContent.indexOf('Tensão Aplicada', searchPos);
        if (pos === -1) break;
        // Verificar se não é "Tensão Aplicada em"
        if (!docContent.substring(pos, pos + 20).includes('em')) {
          tensaoPos = pos;
          break;
        }
        searchPos = pos + 15;
      }
      if (tensaoPos !== -1) {
        const trStart = docContent.lastIndexOf('<w:tr', tensaoPos);
        const trEnd = docContent.indexOf('</w:tr>', tensaoPos);
        if (trStart !== -1 && trEnd !== -1) {
          let rowContent = docContent.substring(trStart, trEnd + 7);
          const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
          if (cells && cells.length >= 2) {
            for (let i = 0; i < data.tensaoAplicada.length && i + 1 < cells.length; i++) {
              if (data.tensaoAplicada[i]) {
                let cell = cells[i + 1];
                const insertPos = cell.lastIndexOf('</w:p>');
                if (insertPos !== -1) {
                  const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(data.tensaoAplicada[i])}</w:t></w:r>`;
                  cell = cell.substring(0, insertPos) + formattedRun + cell.substring(insertPos);
                  cells[i + 1] = cell;
                }
              }
            }
            let cellIdx = 0;
            rowContent = rowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
            docContent = docContent.substring(0, trStart) + rowContent + docContent.substring(trEnd + 7);
            console.log(`Filled array: "Tensão Aplicada" (${data.tensaoAplicada.filter(v => v).length} values)`);
          }
        }
      }
    }
    docContent = fillArrayInTable(docContent, 'Enrolamento medido:', data.enrolMedido, 'Ensaios de Relação');

    // 7. Tensão Medida (R/S/T)
    docContent = fillTensaoMedidaTable(docContent, data.tensaoMedidaR, data.tensaoMedidaS, data.tensaoMedidaT);

    // 8. Resistência de Isolamento
    console.log('=== Preenchendo Resistência de Isolamento ===');
    if (data.instrumentoUtilizado) docContent = fillFieldByLabel(docContent, 'Instrumento Utilizado:', data.instrumentoUtilizado);
    if (data.ensaiosDurante) docContent = fillFieldByLabel(docContent, 'Ensaios Durante:', data.ensaiosDurante);
    if (data.temperaturaAmbiente) docContent = fillFieldByLabel(docContent, 'Temperatura Ambiente:', data.temperaturaAmbiente);
    if (data.umidadeRelativa) docContent = fillFieldByLabel(docContent, 'Umidade Relativa do Ar:', data.umidadeRelativa);

    // Preencher tabela de Resistência de Isolamento
    // Primeiro preencher "Enrolamento medido" que vem ANTES de "Conexões"
    if (data.enrolMedidoIsolamento && data.enrolMedidoIsolamento.length > 0) {
      // Encontrar "Conexões:" e procurar "Enrolamento medido:" ANTES dela
      const conexoesPos = docContent.indexOf('Conexões:');
      if (conexoesPos !== -1) {
        // Procurar "Enrolamento medido:" antes de "Conexões:"
        const searchStart = Math.max(0, conexoesPos - 5000);
        const enrolPos = docContent.lastIndexOf('Enrolamento medido:', conexoesPos);
        
        if (enrolPos !== -1 && enrolPos > searchStart) {
          const trStart = docContent.lastIndexOf('<w:tr', enrolPos);
          const trEnd = docContent.indexOf('</w:tr>', enrolPos);
          
          if (trStart !== -1 && trEnd !== -1) {
            let rowContent = docContent.substring(trStart, trEnd + 7);
            const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
            
            if (cells && cells.length >= 2) {
              // Preencher células 1, 2, 3 com R, S, T
              for (let i = 0; i < data.enrolMedidoIsolamento.length && i + 1 < cells.length; i++) {
                if (data.enrolMedidoIsolamento[i]) {
                  let cell = cells[i + 1];
                  const insertPos = cell.lastIndexOf('</w:p>');
                  if (insertPos !== -1) {
                    const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(data.enrolMedidoIsolamento[i])}</w:t></w:r>`;
                    cell = cell.substring(0, insertPos) + formattedRun + cell.substring(insertPos);
                    cells[i + 1] = cell;
                  }
                }
              }
              
              // Rebuild row
              let cellIdx = 0;
              rowContent = rowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
              docContent = docContent.substring(0, trStart) + rowContent + docContent.substring(trEnd + 7);
              console.log(`Filled array: "Enrolamento medido (Isolamento):" (${data.enrolMedidoIsolamento.filter(v => v).length} values)`);
            }
          }
        }
      }
    }
    
    docContent = fillArrayInTable(docContent, 'Conexões:', data.conexoesIsolamento);
    docContent = fillArrayInTable(docContent, 'Tensão Aplicada', data.tensaoAplicadaIsolamento);
    docContent = fillResistenciaIsolamentoTable(docContent, data.resistIsoR, data.resistIsoS, data.resistIsoT);

    // 9. Resistência Ôhmica
    console.log('=== Preenchendo Resistência Ôhmica ===');
    docContent = fillArrayInTable(docContent, 'Enrolamento medido:', data.enrolMedidoOhm, 'Ohmica');
    docContent = fillResistenciaOhmicaTable(
      docContent, 
      data.resistOhmR || '', 
      data.resistOhmS || '', 
      data.resistOhmT || '',
      data.resistOhmExtraR,
      data.resistOhmExtraS,
      data.resistOhmExtraT
    );

    // 10. Polaridades
    console.log('=== Preenchendo Polaridades ===');
    docContent = fillArrayInTable(docContent, 'Enrolamento medido:', data.enrolMedidoPol, 'Polaridades');
    docContent = fillPolaridadeCheckboxes(docContent, 'R', data.polaridadeR);
    docContent = fillPolaridadeCheckboxes(docContent, 'S', data.polaridadeS);
    docContent = fillPolaridadeCheckboxes(docContent, 'T', data.polaridadeT);

    // 11. Status (cor verde/amarelo/vermelho)
    if (data.status) {
      docContent = processStatusColor(docContent, data.status);
    }

    // 12. Fotos (se houver)
    if (data.photos && data.photos.length > 0) {
      const result = await processPhotos(zip, docContent, data.photos);
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

  let outputBuffer: Buffer;
  try {
    outputBuffer = zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  } catch (e) {
    console.error('Failed to generate ZIP:', e);
    return originalContent;
  }

  console.log('Generated size:', outputBuffer.length, 'bytes');
  return outputBuffer;
}

function markCheckboxBeforeText(docContent: string, text: string): string {
  const textPattern = new RegExp(`<w:t[^>]*>\\s*${escapeRegex(text)}\\s*</w:t>`);
  const match = docContent.match(textPattern);
  
  if (!match || match.index === undefined) {
    console.log(`Text "${text}" not found`);
    return docContent;
  }

  const searchStart = Math.max(0, match.index - 2000);
  const beforeText = docContent.substring(searchStart, match.index);
  
  const checkboxPattern = /<w:fldChar w:fldCharType="begin">[\s\S]*?<w:ffData>[\s\S]*?<w:default w:val="0"\/>/g;
  const checkboxMatches = [...beforeText.matchAll(checkboxPattern)];
  
  if (checkboxMatches.length === 0) {
    console.log(`No FORMCHECKBOX found before "${text}"`);
    return docContent;
  }

  const lastCheckbox = checkboxMatches[checkboxMatches.length - 1];
  if (lastCheckbox.index === undefined) return docContent;

  const absolutePos = searchStart + lastCheckbox.index;
  const checkboxBlock = lastCheckbox[0];
  const updatedBlock = checkboxBlock.replace('<w:default w:val="0"/>', '<w:default w:val="1"/>');
  
  const before = docContent.substring(0, absolutePos);
  const after = docContent.substring(absolutePos + checkboxBlock.length);
  
  console.log(`Marked FORMCHECKBOX for "${text}"`);
  return before + updatedBlock + after;
}

function markUnicodeCheckboxBeforeText(docContent: string, text: string): string {
  const textPattern = new RegExp(`<w:t[^>]*>\\s*${escapeRegex(text)}\\s*</w:t>`);
  const match = docContent.match(textPattern);
  
  if (!match || match.index === undefined) {
    console.log(`Text "${text}" not found for Unicode checkbox`);
    return docContent;
  }

  const searchStart = Math.max(0, match.index - 500);
  const beforeText = docContent.substring(searchStart, match.index);
  const checkboxPos = beforeText.lastIndexOf('☐');
  
  if (checkboxPos === -1) {
    console.log(`No Unicode checkbox (☐) found before "${text}"`);
    return docContent;
  }

  const absolutePos = searchStart + checkboxPos;
  const result = docContent.substring(0, absolutePos) + '☒' + docContent.substring(absolutePos + 1);
  
  console.log(`Marked Unicode checkbox for "${text}"`);
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fillFieldByLabel(docContent: string, label: string, value: string, occurrence: number = 1): string {
  // Try multiple label variations (handle encoding issues)
  const labelVariations = [
    label,
    label.replace(/ã/g, '├ú').replace(/ç/g, '├º').replace(/ê/g, '├¬').replace(/ô/g, '├┤').replace(/á/g, '├í').replace(/é/g, '├®').replace(/í/g, '├¡').replace(/ó/g, '├│').replace(/ú/g, '├║'),
    label.replace(/ã/g, 'a').replace(/ç/g, 'c').replace(/ê/g, 'e').replace(/ô/g, 'o').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
  ];

  let labelPos = -1;
  let foundLabel = label;
  
  for (const variant of labelVariations) {
    let searchPos = 0;
    let foundCount = 0;
    
    while (searchPos < docContent.length) {
      const pos = docContent.indexOf(variant, searchPos);
      if (pos === -1) break;
      
      foundCount++;
      if (foundCount === occurrence) {
        labelPos = pos;
        foundLabel = variant;
        break;
      }
      searchPos = pos + variant.length;
    }
    
    if (labelPos !== -1) break;
  }
  
  if (labelPos === -1) {
    console.log(`Label "${label}" (occurrence ${occurrence}) not found`);
    return docContent;
  }

  // Find the cell containing the label
  const labelCellStart = docContent.lastIndexOf('<w:tc', labelPos);
  const labelCellEnd = docContent.indexOf('</w:tc>', labelPos);
  
  if (labelCellStart === -1 || labelCellEnd === -1) {
    console.log(`No cell found for "${label}"`);
    return docContent;
  }

  const labelCell = docContent.substring(labelCellStart, labelCellEnd + 7);
  
  // Check if this cell already has content after the label (same-cell pattern)
  // Pattern: "Label:" followed by empty space or just the label
  const labelInCell = labelCell.substring(labelCell.indexOf(foundLabel));
  const hasValueInSameCell = labelInCell.includes('</w:t>') && 
                             labelInCell.indexOf('</w:t>') < 50; // Label is close to end of text
  
  if (hasValueInSameCell) {
    // Value goes in the SAME cell, after the label
    const cellContent = labelCell;
    
    // Find the paragraph containing the label
    const pMatches = cellContent.matchAll(/<w:p[^>]*>[\s\S]*?<\/w:p>/g);
    let targetP = null;
    let targetPStart = -1;
    
    for (const match of pMatches) {
      if (match[0].includes(foundLabel)) {
        targetP = match[0];
        targetPStart = match.index!;
        break;
      }
    }
    
    if (!targetP) {
      console.log(`No paragraph with label "${label}" found`);
      return docContent;
    }
    
    // Insert value after the label in the same paragraph
    const pTagEnd = targetP.indexOf('>');
    const pTag = targetP.substring(0, pTagEnd + 1);
    const pEndTag = '</w:p>';
    
    // Keep existing content but add value
    const newParagraph = `${pTag}<w:r><w:rPr><w:rFonts w:ascii="Arial MT" w:hAnsi="Arial MT"/><w:sz w:val="14"/><w:szCs w:val="14"/></w:rPr><w:t>${escapeXml(foundLabel)}</w:t></w:r><w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve"> ${escapeXml(value)}</w:t></w:r>${pEndTag}`;
    
    const newCellContent = cellContent.substring(0, targetPStart) + newParagraph + cellContent.substring(targetPStart + targetP.length);
    const absoluteCellStart = labelCellStart;
    
    docContent = docContent.substring(0, absoluteCellStart) + newCellContent + docContent.substring(labelCellEnd + 7);
    console.log(`✓ Filled (same cell): "${label}" = "${value}"`);
    return docContent;
  }

  // Value goes in NEXT cell (original pattern)
  const rowStart = docContent.lastIndexOf('<w:tr', labelPos);
  const rowEnd = docContent.indexOf('</w:tr>', labelPos);
  
  if (rowStart === -1 || rowEnd === -1) {
    console.log(`No row found for "${label}"`);
    return docContent;
  }

  const rowContent = docContent.substring(rowStart, rowEnd + 7);
  const cellMatches = rowContent.matchAll(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  const cells = Array.from(cellMatches);
  
  if (cells.length === 0) {
    console.log(`No cells in row for "${label}"`);
    return docContent;
  }

  let labelCellIndex = -1;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i][0].includes(foundLabel)) {
      labelCellIndex = i;
      break;
    }
  }

  if (labelCellIndex === -1) {
    console.log(`Label "${label}" not in any cell`);
    return docContent;
  }

  const valueCellIndex = labelCellIndex + 1;
  if (valueCellIndex >= cells.length) {
    console.log(`No next cell after "${label}" (last cell)`);
    return docContent;
  }

  const valueCell = cells[valueCellIndex];
  let cellContent = valueCell[0];
  const cellStartPos = rowStart + valueCell.index!;

  const pMatch = cellContent.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/);
  if (!pMatch) {
    console.log(`No paragraph in value cell for "${label}"`);
    return docContent;
  }

  const pContent = pMatch[0];
  const pStart = cellContent.indexOf(pContent);
  const pTagEnd = pContent.indexOf('>');
  const pTag = pContent.substring(0, pTagEnd + 1);
  
  const newParagraph = `${pTag}<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r></w:p>`;
  const newCellContent = cellContent.substring(0, pStart) + newParagraph + cellContent.substring(pStart + pContent.length);
  
  docContent = docContent.substring(0, cellStartPos) + newCellContent + docContent.substring(cellStartPos + cellContent.length);
  console.log(`✓ Filled: "${label}" = "${value}"`);
  return docContent;
}

function fillArrayInTable(docContent: string, rowLabel: string, values: string[], context?: string): string {
  let searchStart = 0;
  if (context) {
    const contextPos = docContent.indexOf(context);
    if (contextPos !== -1) {
      searchStart = contextPos;
    }
  }

  const labelPos = docContent.indexOf(rowLabel, searchStart);
  if (labelPos === -1) return docContent;

  const trStart = docContent.lastIndexOf('<w:tr', labelPos);
  if (trStart === -1) return docContent;

  const trEnd = docContent.indexOf('</w:tr>', labelPos);
  if (trEnd === -1) return docContent;

  let rowContent = docContent.substring(trStart, trEnd + 7);
  const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);

  if (!cells || cells.length < 2) return docContent;

  // Fill cells starting from the second one (index 1)
  for (let i = 0; i < values.length && i + 1 < cells.length; i++) {
    if (!values[i]) continue;

    let cell = cells[i + 1];
    const insertPos = cell.lastIndexOf('</w:p>');
    if (insertPos !== -1) {
      const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(values[i])}</w:t></w:r>`;
      cell = cell.substring(0, insertPos) + formattedRun + cell.substring(insertPos);
      cells[i + 1] = cell;
    }
  }

  // Rebuild row
  let cellIdx = 0;
  rowContent = rowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');

  docContent = docContent.substring(0, trStart) + rowContent + docContent.substring(trEnd + 7);
  console.log(`Filled array: "${rowLabel}" (${values.filter(v => v).length} values)`);

  return docContent;
}

function fillTensaoMedidaTable(docContent: string, tensaoR: string[], tensaoS: string[], tensaoT: string[]): string {
  // Find "Tensão Medida" or just "Medida" section
  let tensaoMedidaPos = docContent.indexOf('Tens');
  if (tensaoMedidaPos === -1) {
    tensaoMedidaPos = docContent.indexOf('Medida');
  }
  if (tensaoMedidaPos === -1) {
    console.log('Seção Tensão Medida não encontrada');
    return docContent;
  }

  // Find the table containing "Tensão Medida"
  const tableStart = docContent.lastIndexOf('<w:tbl>', tensaoMedidaPos);
  const tableEnd = docContent.indexOf('</w:tbl>', tensaoMedidaPos);
  
  if (tableStart === -1 || tableEnd === -1) {
    console.log('Tabela Tensão Medida não encontrada');
    return docContent;
  }

  // Work within this table only
  let tableContent = docContent.substring(tableStart, tableEnd + 8);
  let offset = tableStart;

  // Find R row within table
  const rPos = tableContent.indexOf('>R<');
  if (rPos === -1) {
    console.log('R não encontrado em Tensão Medida');
    return docContent;
  }

  // Fill R row
  const rRowStart = tableContent.lastIndexOf('<w:tr', rPos);
  const rRowEnd = tableContent.indexOf('</w:tr>', rPos);
  if (rRowStart !== -1 && rRowEnd !== -1) {
    let rRowContent = tableContent.substring(rRowStart, rRowEnd + 7);
    const rCells = rRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
    
    if (rCells && rCells.length > 1) {
      for (let i = 0; i < tensaoR.length && i + 1 < rCells.length; i++) {
        if (tensaoR[i]) {
          rCells[i + 1] = fillCellWithValue(rCells[i + 1], tensaoR[i]);
        }
      }
      
      let cellIdx = 0;
      rRowContent = rRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => rCells[cellIdx++] || '');
      tableContent = tableContent.substring(0, rRowStart) + rRowContent + tableContent.substring(rRowEnd + 7);
      console.log(`Filled Tensão Medida R (${tensaoR.filter(v => v).length} values)`);
    }
  }

  // Find S row within table (after R)
  const sPos = tableContent.indexOf('>S<', rRowEnd);
  if (sPos !== -1) {
    const sRowStart = tableContent.lastIndexOf('<w:tr', sPos);
    const sRowEnd = tableContent.indexOf('</w:tr>', sPos);
    if (sRowStart !== -1 && sRowEnd !== -1) {
      let sRowContent = tableContent.substring(sRowStart, sRowEnd + 7);
      const sCells = sRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      if (sCells && sCells.length > 1) {
        for (let i = 0; i < tensaoS.length && i + 1 < sCells.length; i++) {
          if (tensaoS[i]) {
            sCells[i + 1] = fillCellWithValue(sCells[i + 1], tensaoS[i]);
          }
        }
        
        let cellIdx = 0;
        sRowContent = sRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => sCells[cellIdx++] || '');
        tableContent = tableContent.substring(0, sRowStart) + sRowContent + tableContent.substring(sRowEnd + 7);
        console.log(`Filled Tensão Medida S (${tensaoS.filter(v => v).length} values)`);
      }
    }
  }

  // Find T row within table (after S)
  const tPos = tableContent.indexOf('>T<', sPos !== -1 ? sPos : rRowEnd);
  if (tPos !== -1) {
    const tRowStart = tableContent.lastIndexOf('<w:tr', tPos);
    const tRowEnd = tableContent.indexOf('</w:tr>', tPos);
    if (tRowStart !== -1 && tRowEnd !== -1) {
      let tRowContent = tableContent.substring(tRowStart, tRowEnd + 7);
      const tCells = tRowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      
      if (tCells && tCells.length > 1) {
        for (let i = 0; i < tensaoT.length && i + 1 < tCells.length; i++) {
          if (tensaoT[i]) {
            tCells[i + 1] = fillCellWithValue(tCells[i + 1], tensaoT[i]);
          }
        }
        
        let cellIdx = 0;
        tRowContent = tRowContent.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => tCells[cellIdx++] || '');
        tableContent = tableContent.substring(0, tRowStart) + tRowContent + tableContent.substring(tRowEnd + 7);
        console.log(`Filled Tensão Medida T (${tensaoT.filter(v => v).length} values)`);
      }
    }
  } else {
    console.log('T não encontrado em Tensão Medida');
  }

  // Replace the table in the document
  docContent = docContent.substring(0, offset) + tableContent + docContent.substring(tableEnd + 8);
  return docContent;
}

function fillPolaridadeCheckboxes(docContent: string, fase: string, values: boolean[]): string {
  // Find "Ensaios de Polaridades" section first
  const polaridadePos = docContent.indexOf('Ensaios de Polaridades');
  if (polaridadePos === -1) {
    console.log('Seção Polaridades não encontrada');
    return docContent;
  }

  // Find the row with the fase label (R, S, or T) after Polaridades section
  const fasePattern = new RegExp(`>${fase}<`);
  const faseMatch = docContent.substring(polaridadePos).search(fasePattern);
  if (faseMatch === -1) {
    console.log(`Fase ${fase} não encontrada em Polaridades`);
    return docContent;
  }

  const absoluteFasePos = polaridadePos + faseMatch;
  const trStart = docContent.lastIndexOf('<w:tr', absoluteFasePos);
  if (trStart === -1) return docContent;

  const trEnd = docContent.indexOf('</w:tr>', absoluteFasePos);
  if (trEnd === -1) return docContent;

  let rowContent = docContent.substring(trStart, trEnd + 7);

  // Look for both Unicode checkboxes (☐) and form checkboxes
  const checkboxes: { pos: number; type: 'unicode' | 'form' }[] = [];
  
  // Find Unicode checkboxes
  let searchPos = 0;
  while (true) {
    const cbPos = rowContent.indexOf('☐', searchPos);
    if (cbPos === -1) break;
    checkboxes.push({ pos: cbPos, type: 'unicode' });
    searchPos = cbPos + 1;
  }

  // Find form checkboxes (w:default w:val="0")
  searchPos = 0;
  const formCheckboxPattern = /<w:default w:val="0"\/>/g;
  let match;
  while ((match = formCheckboxPattern.exec(rowContent)) !== null) {
    checkboxes.push({ pos: match.index, type: 'form' });
  }

  // Sort by position
  checkboxes.sort((a, b) => a.pos - b.pos);

  // Mark checkboxes based on values
  let offset = 0;
  for (let i = 0; i < values.length && i < checkboxes.length; i++) {
    if (values[i]) {
      const cb = checkboxes[i];
      const adjustedPos = cb.pos + offset;
      
      if (cb.type === 'unicode') {
        // Replace ☐ with ☒
        rowContent = rowContent.substring(0, adjustedPos) + '☒' + rowContent.substring(adjustedPos + 1);
      } else if (cb.type === 'form') {
        // Replace w:val="0" with w:val="1"
        const oldStr = '<w:default w:val="0"/>';
        const newStr = '<w:default w:val="1"/>';
        const before = rowContent.substring(0, adjustedPos);
        const after = rowContent.substring(adjustedPos);
        const replaced = after.replace(oldStr, newStr);
        rowContent = before + replaced;
        offset += newStr.length - oldStr.length;
      }
    }
  }

  docContent = docContent.substring(0, trStart) + rowContent + docContent.substring(trEnd + 7);
  console.log(`Filled polaridade checkboxes: Fase ${fase} (${values.filter(v => v).length} marcados)`);

  return docContent;
}

// ============================================
// FOTOS - REGISTRO FOTOGRÁFICO
// ============================================

async function processPhotos(
  zip: PizZip,
  docContent: string,
  photos: TCTPPhoto[]
): Promise<{ zip: PizZip; docContent: string }> {
  if (!photos || photos.length === 0) {
    return { zip, docContent };
  }

  console.log(`📸 Processando ${photos.length} fotos...`);

  // Encontrar a última página (antes de </w:body>)
  const bodyEndPos = docContent.lastIndexOf('</w:body>');
  if (bodyEndPos === -1) {
    console.error('❌ Could not find </w:body>');
    return { zip, docContent };
  }

  // Criar uma nova página com quebra de página
  let photosPageXml = '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>';
  
  // Título da seção de fotos
  photosPageXml += `
    <w:p>
      <w:pPr>
        <w:spacing w:before="240" w:after="240"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="32"/>
          <w:szCs w:val="32"/>
        </w:rPr>
        <w:t>REGISTRO FOTOGRÁFICO</w:t>
      </w:r>
    </w:p>
  `;

  // Processar cada foto
  let relationshipId = 1000; // ID inicial para relacionamentos
  const relsToAdd: Array<{ id: string; target: string }> = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const photoId = `photo${i + 1}`;
    const rId = `rId${relationshipId++}`;

    try {
      // Extrair dados base64 da imagem
      const base64Data = photo.data.split(',')[1] || photo.data;
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Determinar extensão da imagem
      let ext = 'png';
      if (photo.data.includes('image/jpeg') || photo.data.includes('image/jpg')) {
        ext = 'jpeg';
      } else if (photo.data.includes('image/png')) {
        ext = 'png';
      }

      // Adicionar imagem ao ZIP
      const imagePath = `word/media/${photoId}.${ext}`;
      zip.file(imagePath, imageBuffer);

      // Adicionar relacionamento
      relsToAdd.push({ id: rId, target: `media/${photoId}.${ext}` });

      // Calcular dimensões (máximo 6 polegadas de largura = 5760000 EMUs)
      const maxWidth = 5760000; // 6 inches in EMUs
      const maxHeight = 4320000; // 4.5 inches in EMUs

      // Adicionar imagem ao documento
      photosPageXml += `
        <w:p>
          <w:pPr>
            <w:spacing w:before="120" w:after="120"/>
            <w:jc w:val="center"/>
          </w:pPr>
          <w:r>
            <w:drawing>
              <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="${maxWidth}" cy="${maxHeight}"/>
                <wp:effectExtent l="0" t="0" r="0" b="0"/>
                <wp:docPr id="${i + 1}" name="${photoId}"/>
                <wp:cNvGraphicFramePr>
                  <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                </wp:cNvGraphicFramePr>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                  <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:nvPicPr>
                        <pic:cNvPr id="${i + 1}" name="${photoId}"/>
                        <pic:cNvPicPr/>
                      </pic:nvPicPr>
                      <pic:blipFill>
                        <a:blip r:embed="${rId}"/>
                        <a:stretch>
                          <a:fillRect/>
                        </a:stretch>
                      </pic:blipFill>
                      <pic:spPr>
                        <a:xfrm>
                          <a:off x="0" y="0"/>
                          <a:ext cx="${maxWidth}" cy="${maxHeight}"/>
                        </a:xfrm>
                        <a:prstGeom prst="rect">
                          <a:avLst/>
                        </a:prstGeom>
                      </pic:spPr>
                    </pic:pic>
                  </a:graphicData>
                </a:graphic>
              </wp:inline>
            </w:drawing>
          </w:r>
        </w:p>
      `;

      // Adicionar descrição se existir
      if (photo.description) {
        photosPageXml += `
          <w:p>
            <w:pPr>
              <w:spacing w:after="240"/>
              <w:jc w:val="center"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:i/>
                <w:sz w:val="20"/>
                <w:szCs w:val="20"/>
              </w:rPr>
              <w:t>${escapeXml(photo.description)}</w:t>
            </w:r>
          </w:p>
        `;
      }

      console.log(`✅ Foto ${i + 1} adicionada: ${photo.name}`);
    } catch (error) {
      console.error(`❌ Erro ao processar foto ${i + 1}:`, error);
    }
  }

  // Inserir fotos antes de </w:body>
  docContent = docContent.substring(0, bodyEndPos) + photosPageXml + docContent.substring(bodyEndPos);

  // Atualizar document.xml.rels
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (relsFile) {
    let relsContent = relsFile.asText();
    
    // Adicionar novos relacionamentos antes de </Relationships>
    const relsEndPos = relsContent.lastIndexOf('</Relationships>');
    if (relsEndPos !== -1) {
      let newRels = '';
      for (const rel of relsToAdd) {
        newRels += `<Relationship Id="${rel.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${rel.target}"/>`;
      }
      relsContent = relsContent.substring(0, relsEndPos) + newRels + relsContent.substring(relsEndPos);
      zip.file('word/_rels/document.xml.rels', relsContent);
    }
  }

  // Atualizar [Content_Types].xml para incluir tipos de imagem
  const contentTypesFile = zip.file('[Content_Types].xml');
  if (contentTypesFile) {
    let contentTypes = contentTypesFile.asText();
    
    // Adicionar tipos de imagem se não existirem
    if (!contentTypes.includes('Extension="png"')) {
      const typesEndPos = contentTypes.lastIndexOf('</Types>');
      if (typesEndPos !== -1) {
        const pngType = '<Default Extension="png" ContentType="image/png"/>';
        const jpegType = '<Default Extension="jpeg" ContentType="image/jpeg"/>';
        const jpgType = '<Default Extension="jpg" ContentType="image/jpeg"/>';
        contentTypes = contentTypes.substring(0, typesEndPos) + pngType + jpegType + jpgType + contentTypes.substring(typesEndPos);
        zip.file('[Content_Types].xml', contentTypes);
      }
    }
  }

  console.log(`✅ ${photos.length} fotos processadas com sucesso!`);
  return { zip, docContent };
}

// ============================================
// STATUS - COR DO INDICADOR
// ============================================

function processStatusColor(docContent: string, status: string): string {
  console.log(`\n🎨 === processStatusColor CHAMADO ===`);
  console.log(`📊 Status recebido: "${status}"`);
  
  if (!status) {
    console.log('⚠️ Status vazio, pulando processamento');
    return docContent;
  }
  
  // Mapa de cores
  const colorMap: Record<string, string> = {
    'conforme': '00B050',      // Verde
    'verde': '00B050',
    'green': '00B050',
    'alerta': 'FFC000',        // Amarelo
    'amarelo': 'FFC000',
    'yellow': 'FFC000',
    'corretiva': 'FF0000',     // Vermelho
    'vermelho': 'FF0000',
    'red': 'FF0000',
  };
  
  const newColor = colorMap[status.toLowerCase()];
  if (!newColor) {
    console.log(`❌ Status "${status}" não reconhecido, usando verde`);
    return docContent;
  }
  
  console.log(`✅ Cor mapeada: ${newColor}`);
  
  // Encontrar a célula STATUS
  const statusIdx = docContent.indexOf('STATUS');
  if (statusIdx === -1) {
    console.log('❌ Célula STATUS não encontrada no documento');
    return docContent;
  }
  
  console.log(`✅ Célula STATUS encontrada na posição ${statusIdx}`);
  
  // Encontrar a linha que contém STATUS
  const lineStart = docContent.lastIndexOf('<w:tr', statusIdx);
  const lineEnd = docContent.indexOf('</w:tr>', statusIdx);
  
  if (lineStart === -1 || lineEnd === -1) {
    console.log('❌ Linha STATUS não encontrada');
    return docContent;
  }
  
  console.log(`✅ Linha STATUS: ${lineStart} até ${lineEnd}`);
  
  let line = docContent.substring(lineStart, lineEnd + 7);
  
  // Encontrar todas as células da linha
  const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (!cells || cells.length < 3) {
    console.log(`❌ Células não encontradas (precisa de pelo menos 3, encontrou ${cells?.length || 0})`);
    return docContent;
  }
  
  console.log(`✅ Encontradas ${cells.length} células na linha STATUS`);
  
  // A célula STATUS é a segunda (índice 1)
  // O quadradinho colorido é a TERCEIRA célula (índice 2) - ao lado direito
  let colorCell = cells[2];
  
  // Verificar se é uma célula vazia (o quadradinho)
  const hasText = colorCell.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
  if (hasText && hasText[1].trim()) {
    console.log(`⚠️ Terceira célula não está vazia, contém: "${hasText[1].trim()}"`);
    return docContent;
  }
  
  console.log('✅ Terceira célula está vazia (quadradinho de status)');
  
  // Aplicar cor no quadradinho (célula 2)
  // Remover qualquer w:shd existente e adicionar novo com a cor
  colorCell = colorCell.replace(
    /<w:shd\s+[^>]*\/>/g,
    `<w:shd w:val="clear" w:fill="${newColor}"/>`
  );
  
  // Se não tem w:shd, adicionar em w:tcPr
  if (!colorCell.includes('<w:shd')) {
    console.log('⚠️ Célula não tem w:shd, adicionando...');
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
    } else if (!colorCell.includes('<w:tcPr')) {
      colorCell = colorCell.replace(
        /<w:tc>/g,
        `<w:tc><w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/></w:tcPr>`
      );
    }
  }
  
  // Reconstruir linha
  cells[2] = colorCell;
  let newLine = line;
  let cellIdx = 0;
  newLine = newLine.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
  
  // Reconstruir documento
  docContent = docContent.substring(0, lineStart) + newLine + docContent.substring(lineEnd + 7);
  
  const statusNames: Record<string, string> = {
    '00B050': '🟢 VERDE',
    'FFC000': '🟡 AMARELO',
    'FF0000': '🔴 VERMELHO'
  };
  
  console.log(`✅ TC/TP Status aplicado: ${statusNames[newColor] || newColor}`);
  console.log(`🎨 === processStatusColor CONCLUÍDO ===\n`);
  
  return docContent;
}
