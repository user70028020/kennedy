// RDO Generator - Complete implementation for rdonx.docx template
import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { RDOMontagemData } from '../types/rdo-montagem.js';
import { processPhotos } from './rdo-generator-photos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getRDOTemplatePath(template: 'nx-energy' | 'sercamp'): string {
  const templatesDir = path.join(__dirname, '../../templates');
  const templateFile = template === 'nx-energy' ? 'rdonx.docx' : 'rdosercamp.docx';
  return path.join(templatesDir, templateFile);
}

/**
 * Load Sérgio Lima signature from static folder
 */
async function loadSergioLimaSignature(): Promise<string | null> {
  try {
    const signaturePath = path.join(__dirname, '../../static/assinatura-sergio-lima-new.png');
    
    if (fs.existsSync(signaturePath)) {
      const buffer = fs.readFileSync(signaturePath);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    }
    
    console.log('⚠️ Sérgio Lima signature not found at:', signaturePath);
    return null;
  } catch (error) {
    console.error('❌ Error loading Sérgio Lima signature:', error);
    return null;
  }
}

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * Create image drawing XML for signature (smaller size)
 */
function createSignatureDrawing(rId: string, signatureId: string): string {
  // Signature size: ~4cm x 2cm (1500000 x 750000 EMUs)
  const cx = 1500000; // width in EMUs
  const cy = 750000;  // height in EMUs
  
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${Math.floor(Math.random() * 100000)}" name="${signatureId}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${signatureId}"/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

function fillCellAfterLabel(docContent: string, label: string, value: string): string {
  if (!value) return docContent;
  
  const labelPos = docContent.indexOf(label);
  if (labelPos === -1) {
    console.log(`⚠️ Label not found: "${label}"`);
    return docContent;
  }
  
  const cellEndPos = docContent.indexOf('</w:tc>', labelPos);
  if (cellEndPos === -1) return docContent;
  
  const nextCellStart = docContent.indexOf('<w:tc', cellEndPos);
  if (nextCellStart === -1) return docContent;
  
  const nextCellEnd = docContent.indexOf('</w:tc>', nextCellStart);
  if (nextCellEnd === -1) return docContent;
  
  let cellContent = docContent.substring(nextCellStart, nextCellEnd + 7);
  
  // Procurar parágrafo vazio - pode ser self-closing ou com apenas <w:pPr> mas sem <w:r>
  // Padrão 1: <w:p .../> (self-closing)
  let emptyPMatch = cellContent.match(/<w:p\s+[^>]*\/>/);
  
  // Padrão 2: <w:p ...><w:pPr>...</w:pPr></w:p> (sem <w:r>)
  if (!emptyPMatch) {
    emptyPMatch = cellContent.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
  }
  
  if (emptyPMatch) {
    // Usar Poppins font, size 16 (8pt) conforme template rdonx.docx
    const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r></w:p>`;
    cellContent = cellContent.replace(emptyPMatch[0], newP);
    docContent = docContent.substring(0, nextCellStart) + cellContent + docContent.substring(nextCellEnd + 7);
    console.log(`✅ "${label}" = "${value.substring(0, 40)}${value.length > 40 ? '...' : ''}"`);
  } else {
    console.log(`⚠️ No empty paragraph found in cell after "${label}"`);
  }
  
  return docContent;
}

function fillSpecificCell(docContent: string, label: string, cellIndex: number, value: string): string {
  // Fill a specific cell in a row by index (0 = label, 1 = first value cell, etc.)
  if (!value) return docContent;
  
  const labelPos = docContent.indexOf(label);
  if (labelPos === -1) {
    console.log(`⚠️ Label not found: "${label}"`);
    return docContent;
  }
  
  // Find the row containing this label
  const rowStart = docContent.lastIndexOf('<w:tr', labelPos);
  const rowEnd = docContent.indexOf('</w:tr>', labelPos);
  
  if (rowStart === -1 || rowEnd === -1) {
    console.log(`⚠️ Row not found for "${label}"`);
    return docContent;
  }
  
  const rowContent = docContent.substring(rowStart, rowEnd + 7);
  
  // Extract all cells in this row
  const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  if (!cells || cells.length <= cellIndex) {
    console.log(`⚠️ Cell ${cellIndex} not found in row for "${label}" (found ${cells?.length || 0} cells)`);
    return docContent;
  }
  
  let cell = cells[cellIndex];
  
  // Check if cell already has content (like "Total:" label)
  const hasExistingText = /<w:t[^>]*>.*?<\/w:t>/.test(cell);
  
  if (hasExistingText) {
    // Cell has existing text - append value after the last </w:t>
    const lastTextEnd = cell.lastIndexOf('</w:t>');
    if (lastTextEnd !== -1) {
      // Find the </w:r> after this </w:t>
      const runEnd = cell.indexOf('</w:r>', lastTextEnd);
      if (runEnd !== -1) {
        // Insert new run with value after the existing run
        const newRun = `<w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:b/><w:bCs/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t xml:space="preserve"> ${escapeXml(value)}</w:t></w:r>`;
        cell = cell.substring(0, runEnd + 6) + newRun + cell.substring(runEnd + 6);
        cells[cellIndex] = cell;
        
        // Reconstruct the row
        const rowStartTag = rowContent.substring(0, rowContent.indexOf('<w:tc'));
        const rowEndTag = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
        const newRow = rowStartTag + cells.join('') + rowEndTag;
        
        docContent = docContent.substring(0, rowStart) + newRow + docContent.substring(rowEnd + 7);
        
        console.log(`✅ Cell ${cellIndex} in "${label}": appended "${value}" to existing text`);
        return docContent;
      }
    }
  }
  
  // Find empty paragraph
  let emptyP = cell.match(/<w:p\s+[^>]*\/>/);
  if (!emptyP) {
    emptyP = cell.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
  }
  
  if (emptyP) {
    const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r></w:p>`;
    cells[cellIndex] = cell.replace(emptyP[0], newP);
    
    // Reconstruct the row
    const rowStartTag = rowContent.substring(0, rowContent.indexOf('<w:tc'));
    const rowEndTag = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
    const newRow = rowStartTag + cells.join('') + rowEndTag;
    
    docContent = docContent.substring(0, rowStart) + newRow + docContent.substring(rowEnd + 7);
    
    console.log(`✅ Cell ${cellIndex} in "${label}": ${value}`);
  } else {
    console.log(`⚠️ No empty paragraph in cell ${cellIndex} for "${label}"`);
  }
  
  return docContent;
}

function fillHoursRow(docContent: string, label: string, inicio: string, termino: string, total: string): string {
  // Fill a complete hours row with Início, Término, and Total columns
  const labelPos = docContent.indexOf(label);
  if (labelPos === -1) {
    console.log(`⚠️ Hours row label not found: "${label}"`);
    return docContent;
  }
  
  // Find the row containing this label
  const rowStart = docContent.lastIndexOf('<w:tr', labelPos);
  const rowEnd = docContent.indexOf('</w:tr>', labelPos);
  
  if (rowStart === -1 || rowEnd === -1) {
    console.log(`⚠️ Row not found for "${label}"`);
    return docContent;
  }
  
  const rowContent = docContent.substring(rowStart, rowEnd + 7);
  
  // Extract all cells in this row
  const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  if (!cells || cells.length < 4) {
    console.log(`⚠️ Not enough cells in row for "${label}" (found ${cells?.length || 0}, need 4)`);
    return docContent;
  }
  
  // Cell 0: Label (keep as is)
  // Cell 1: Início
  // Cell 2: Término
  // Cell 3: Total
  
  const values = [inicio, termino, total];
  
  for (let i = 0; i < 3; i++) {
    const value = values[i];
    if (!value) continue;
    
    let cell = cells[i + 1]; // Skip cell 0 (label)
    
    // Find empty paragraph
    let emptyP = cell.match(/<w:p\s+[^>]*\/>/);
    if (!emptyP) {
      emptyP = cell.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
    }
    
    if (emptyP) {
      const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r></w:p>`;
      cells[i + 1] = cell.replace(emptyP[0], newP);
    }
  }
  
  // Reconstruct the row
  const rowStartTag = rowContent.substring(0, rowContent.indexOf('<w:tc'));
  const rowEndTag = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
  const newRow = rowStartTag + cells.join('') + rowEndTag;
  
  docContent = docContent.substring(0, rowStart) + newRow + docContent.substring(rowEnd + 7);
  
  console.log(`✅ Hours row "${label}": ${inicio} - ${termino} = ${total}`);
  
  return docContent;
}

function markCheckbox(docContent: string, checkboxText: string, shouldMark: boolean): string {
  if (!shouldMark) return docContent;
  
  // Procurar pelo texto do checkbox (ex: "☐ Sim" ou "☐ Não")
  const checkboxPos = docContent.indexOf(checkboxText);
  
  if (checkboxPos !== -1) {
    // Encontrar o checkbox vazio (☐) antes do texto
    const beforeText = docContent.substring(Math.max(0, checkboxPos - 100), checkboxPos);
    const lastCheckboxPos = beforeText.lastIndexOf('☐');
    
    if (lastCheckboxPos !== -1) {
      const absolutePos = checkboxPos - 100 + lastCheckboxPos;
      docContent = docContent.substring(0, absolutePos) + '☒' + docContent.substring(absolutePos + 1);
      console.log(`✅ Checkbox marcado: "${checkboxText}"`);
    }
  }
  
  return docContent;
}

function processTeamTable(docContent: string, members: any[]): string {
  if (!members || members.length === 0) return docContent;
  
  console.log(`📋 Processing ${members.length} team members...`);
  
  // Procurar tabela de equipe
  const tableMarker = 'Equipe de trabalho';
  const tableStart = docContent.indexOf(tableMarker);
  if (tableStart === -1) {
    console.log('⚠️ Team table not found');
    return docContent;
  }
  
  // Encontrar a tabela (procurar para trás a partir do marker)
  let tblStart = -1;
  for (let i = tableStart; i >= 0; i--) {
    if (docContent.substring(i, i + 7) === '<w:tbl>') {
      tblStart = i;
      break;
    }
  }
  
  if (tblStart === -1) {
    console.log('⚠️ Table start not found');
    return docContent;
  }
  
  // Encontrar fim da tabela
  const tblEnd = docContent.indexOf('</w:tbl>', tblStart);
  if (tblEnd === -1) {
    console.log('⚠️ Table end not found');
    return docContent;
  }
  
  const tableContent = docContent.substring(tblStart, tblEnd + 8);
  
  // Encontrar todas as linhas
  const rowMatches = tableContent.match(/<w:tr[^>]*>[\s\S]*?<\/w:tr>/g);
  if (!rowMatches || rowMatches.length < 2) {
    console.log('⚠️ Not enough rows in table');
    return docContent;
  }
  
  console.log(`Found ${rowMatches.length} rows in table`);
  
  // Primeira linha é o header, segunda linha é o template
  const headerRow = rowMatches[0];
  const templateRow = rowMatches[1];
  
  // Criar novas linhas para cada membro
  let newRows = headerRow; // Manter header
  
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    if (!member || !member.nome) continue;
    
    let row = templateRow;
    const cells = row.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
    
    if (cells && cells.length >= 2) {
      // Célula 0: Nome
      let nameCell = cells[0];
      let emptyP = nameCell.match(/<w:p\s+[^>]*\/>/);
      if (!emptyP) {
        emptyP = nameCell.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
      }
      if (emptyP) {
        const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(member.nome)}</w:t></w:r></w:p>`;
        cells[0] = nameCell.replace(emptyP[0], newP);
      }
      
      // Célula 1: Empresa
      if (member.empresa) {
        let empresaCell = cells[1];
        emptyP = empresaCell.match(/<w:p\s+[^>]*\/>/);
        if (!emptyP) {
          emptyP = empresaCell.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
        }
        if (emptyP) {
          const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(member.empresa)}</w:t></w:r></w:p>`;
          cells[1] = empresaCell.replace(emptyP[0], newP);
        }
      }
      
      // Célula 2: Assinatura (vazio por padrão)
      
      // Reconstruir linha
      const rowStart = row.substring(0, row.indexOf('<w:tc'));
      const rowEnd = row.substring(row.lastIndexOf('</w:tc>') + 7);
      row = rowStart + cells.join('') + rowEnd;
    }
    
    newRows += row;
  }
  
  // Adicionar linhas vazias restantes se necessário (manter estrutura da tabela)
  for (let i = members.length + 1; i < rowMatches.length; i++) {
    newRows += rowMatches[i];
  }
  
  // Substituir tabela inteira
  const newTable = '<w:tbl>' + newRows.substring(newRows.indexOf('<w:tr>')) + '</w:tbl>';
  docContent = docContent.substring(0, tblStart) + newTable + docContent.substring(tblEnd + 8);
  
  console.log(`✅ Added ${members.length} team members to table`);
  
  return docContent;
}

export async function generateRDOReportFromTemplate(data: RDOMontagemData): Promise<Buffer> {
  const templatePath = getRDOTemplatePath(data.template || 'nx-energy');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  console.log('=== RDO Generation (Complete) ===');
  console.log('Template:', data.template);
  console.log('OS:', data.numeroOS);

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
    console.error('No document.xml');
    return originalContent;
  }
  
  let docContent = docXmlFile.asText();

  try {
    console.log('\n📝 Filling basic fields...');
    
    // CAMPOS BÁSICOS (sem : no final)
    docContent = fillCellAfterLabel(docContent, 'Número:', data.numeroOS);
    docContent = fillCellAfterLabel(docContent, 'Data:', data.data);
    docContent = fillCellAfterLabel(docContent, 'Projeto:', data.projeto);
    docContent = fillCellAfterLabel(docContent, 'Cliente:', data.cliente);
    docContent = fillCellAfterLabel(docContent, 'Cidade:', data.cidade);
    docContent = fillCellAfterLabel(docContent, 'Nome da subestação:', data.nomeSubestacao);
    docContent = fillCellAfterLabel(docContent, 'Natureza do serviço:', data.naturezaServico);
    docContent = fillCellAfterLabel(docContent, 'Características do equipamento:', data.caracteristicasEquipamento);
    docContent = fillCellAfterLabel(docContent, 'Número Serie:', data.numeroSerie);
    
    console.log('\n👥 Processing team...');
    
    // EQUIPE DE TRABALHO - PREENCHER com os dados
    if (data.participantes && data.participantes.length > 0) {
      docContent = processTeamTable(docContent, data.participantes);
    } else {
      console.log('⚠️ No team members provided');
    }
    
    console.log('\n⏰ Filling work hours...');
    
    // RESUMO DA JORNADA DE TRABALHO
    if (data.horasTrabalho) {
      const ht = data.horasTrabalho;
      
      // Horário normal - Início e Término
      docContent = fillCellAfterLabel(docContent, 'Início:', ht.horarioNormalInicio || '00:00');
      docContent = fillCellAfterLabel(docContent, 'Término:', ht.horarioNormalTermino || '00:00');
      
      // Liberação de horas extras - marcar checkbox
      // O template tem: ☐ Sim  ☐ Não
      const liberacaoPos = docContent.indexOf('Liberação de horas extras:');
      if (liberacaoPos !== -1) {
        const afterLiberacao = docContent.substring(liberacaoPos, liberacaoPos + 1000);
        
        if (ht.liberacaoHorasExtras === 'sim') {
          // Marcar primeiro checkbox (Sim)
          const firstCheckbox = afterLiberacao.indexOf('☐');
          if (firstCheckbox !== -1) {
            const absolutePos = liberacaoPos + firstCheckbox;
            docContent = docContent.substring(0, absolutePos) + '☒' + docContent.substring(absolutePos + 1);
            console.log(`✅ Checkbox "Sim" marcado`);
          }
        } else {
          // Marcar segundo checkbox (Não)
          const firstCheckbox = afterLiberacao.indexOf('☐');
          if (firstCheckbox !== -1) {
            const afterFirst = afterLiberacao.substring(firstCheckbox + 1);
            const secondCheckbox = afterFirst.indexOf('☐');
            if (secondCheckbox !== -1) {
              const absolutePos = liberacaoPos + firstCheckbox + 1 + secondCheckbox;
              docContent = docContent.substring(0, absolutePos) + '☒' + docContent.substring(absolutePos + 1);
              console.log(`✅ Checkbox "Não" marcado`);
            }
          }
        }
        
        // OBS (se houver) - preencher célula após "OBS:"
        if (ht.liberacaoHorasExtrasObs) {
          docContent = fillCellAfterLabel(docContent, 'OBS:', ht.liberacaoHorasExtrasObs);
        }
        
        // Campo grande (célula 5) - preencher com observações sobre equipamento
        const liberacaoText = ht.liberacaoHorasExtrasObs || 'Equipamento em boas condições. Recomenda-se próxima manutenção em 6 meses.';
        docContent = fillSpecificCell(docContent, 'Liberação de horas extras:', 5, liberacaoText);
        
        // Início (horas extras) - procurar o próximo "Início:" após liberação
        const afterLiberacaoSection = docContent.substring(liberacaoPos + 500);
        const inicioExtrasPos = afterLiberacaoSection.indexOf('Início:');
        if (inicioExtrasPos !== -1 && inicioExtrasPos < 500) {
          const absolutePos = liberacaoPos + 500 + inicioExtrasPos;
          const beforeInicio = docContent.substring(0, absolutePos);
          const afterInicio = docContent.substring(absolutePos);
          
          // Encontrar a próxima célula após este "Início:"
          const cellEnd = afterInicio.indexOf('</w:tc>');
          const nextCellStart = afterInicio.indexOf('<w:tc', cellEnd);
          const nextCellEnd = afterInicio.indexOf('</w:tc>', nextCellStart);
          
          if (nextCellStart !== -1 && nextCellEnd !== -1) {
            let cellContent = afterInicio.substring(nextCellStart, nextCellEnd + 7);
            let emptyP = cellContent.match(/<w:p\s+[^>]*\/>/);
            if (!emptyP) emptyP = cellContent.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
            
            if (emptyP) {
              const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(ht.horasExtrasInicio || '00:00')}</w:t></w:r></w:p>`;
              cellContent = cellContent.replace(emptyP[0], newP);
              docContent = beforeInicio + afterInicio.substring(0, nextCellStart) + cellContent + afterInicio.substring(nextCellEnd + 7);
              console.log(`✅ Horas extras início: ${ht.horasExtrasInicio || '00:00'}`);
            }
          }
        }
        
        // Autorizado por
        if (ht.autorizadoPor) {
          docContent = fillCellAfterLabel(docContent, 'Autorizado por:', ht.autorizadoPor);
        }
      }
      
      // Horas de deslocamento (ida) - preencher todas as 3 colunas
      docContent = fillHoursRow(
        docContent,
        'Horas de deslocamento:',
        ht.horasDeslocamentoInicio || '00:00',
        ht.horasDeslocamentoTermino || '00:00',
        ht.horasDeslocamentoTotal || '0:00'
      );
      
      // Horas trabalhadas no cliente - preencher TODAS as 3 colunas
      docContent = fillHoursRow(
        docContent,
        'Horas trabalhadas no cliente:',
        ht.horasTrabalhadasClienteInicio || '00:00',
        ht.horasTrabalhadasClienteTermino || '00:00',
        ht.horasTrabalhadasCliente || '0:00'
      );
      
      // Horário de almoço - preencher TODAS as 3 colunas
      docContent = fillHoursRow(
        docContent,
        'Horário de almoço:',
        ht.horarioAlmocoInicio || '00:00',
        ht.horarioAlmocoTermino || '00:00',
        ht.horarioAlmoco || '0:00'
      );
      
      // Horas de jantar - preencher TODAS as 3 colunas
      docContent = fillHoursRow(
        docContent,
        'Horas de jantar:',
        ht.horasJantarInicio || '00:00',
        ht.horasJantarTermino || '00:00',
        ht.horasJantar || '0:00'
      );
      
      // Horas de deslocamento (retorno) - preencher TODAS as 3 colunas
      // Precisa encontrar a SEGUNDA ocorrência de "Horas de deslocamento:"
      const firstDeslocPos = docContent.indexOf('Horas de deslocamento:');
      const secondDeslocPos = docContent.indexOf('Horas de deslocamento:', firstDeslocPos + 100);
      if (secondDeslocPos !== -1) {
        const tempDoc = docContent.substring(0, secondDeslocPos) + '___DESLOC_RET___' + docContent.substring(secondDeslocPos);
        const tempResult = fillHoursRow(
          tempDoc,
          '___DESLOC_RET___Horas de deslocamento:',
          ht.horasDeslocamentoRetornoInicio || '00:00',
          ht.horasDeslocamentoRetornoTermino || '00:00',
          ht.horasDeslocamentoRetorno || '0:00'
        );
        docContent = tempResult.replace(/___DESLOC_RET___/g, '');
      }
      
      // Horas a disposição - preencher TODAS as 3 colunas
      docContent = fillHoursRow(
        docContent,
        'Horas a disposição:',
        ht.horasDisposicaoInicio || '00:00',
        ht.horasDisposicaoTermino || '00:00',
        ht.horasDisposicao || '0:00'
      );
      
      // TOTAL GERAL - preencher TODAS as 3 colunas
      docContent = fillHoursRow(
        docContent,
        'Horas Totais a Trabalhadas:',
        '', // Início vazio
        '', // Término vazio
        ht.horasTotaisTrabalhadas || '0:00'
      );
    }

    console.log('\n⏳ Filling available hours...');
    
    // INFORMAÇÃO DE HORAS DISPONIBILIZADAS
    if (data.horasDisponibilizadas) {
      const hd = data.horasDisponibilizadas;
      
      // Integração - preencher todas as 3 colunas
      if (hd.integracaoTotal && hd.integracaoTotal !== '0:00') {
        docContent = fillHoursRow(
          docContent,
          'Integração, Liberação de documentação, permissão de trabalho:',
          hd.integracaoInicio || '00:00',
          hd.integracaoTermino || '00:00',
          hd.integracaoTotal
        );
      }
      
      // Falta de recursos - PREENCHER com 00:00
      docContent = fillHoursRow(
        docContent,
        'Falta de recursos para execução das atividades',
        hd.faltaRecursosInicio || '00:00',
        hd.faltaRecursosTermino || '00:00',
        hd.faltaRecursosTotal || '0:00'
      );
      
      // Condições climáticas - PREENCHER com 00:00
      docContent = fillHoursRow(
        docContent,
        'Condições climáticas inapropriadas:',
        hd.condicoesClimaticasInicio || '00:00',
        hd.condicoesClimaticasTermino || '00:00',
        hd.condicoesClimaticasTotal || '0:00'
      );
      
      // Retomada de atividades - PREENCHER com 00:00
      docContent = fillHoursRow(
        docContent,
        'Retomada de atividades',
        hd.retomadaAtividadesInicio || '00:00',
        hd.retomadaAtividadesTermino || '00:00',
        hd.retomadaAtividadesTotal || '0:00'
      );
      
      // Outros - PREENCHER com 00:00
      docContent = fillHoursRow(
        docContent,
        'Outros (especifique)',
        hd.outrosInicio || '00:00',
        hd.outrosTermino || '00:00',
        hd.outrosTotal || '0:00'
      );
      
      // Total geral das horas disponibilizadas - preencher célula amarela
      // A célula amarela é a última linha da tabela, coluna "Total:"
      if (hd.total && hd.total !== '0:00') {
        // Procurar a seção de horas disponibilizadas
        const horasDispSectionPos = docContent.indexOf('INFORMAÇÃO DE HORAS DISPONIBILIZADAS:');
        if (horasDispSectionPos !== -1) {
          // Procurar a linha "Total:" que vem DEPOIS de "Outros (especifique)"
          const outrosPos = docContent.indexOf('Outros (especifique)', horasDispSectionPos);
          if (outrosPos !== -1) {
            // Procurar "Total:" DEPOIS de "Outros"
            const totalLabelPos = docContent.indexOf('Total:', outrosPos);
            if (totalLabelPos !== -1) {
              // Encontrar a linha que contém este Total
              const rowStart = docContent.lastIndexOf('<w:tr', totalLabelPos);
              const rowEnd = docContent.indexOf('</w:tr>', totalLabelPos);
              
              if (rowStart !== -1 && rowEnd !== -1) {
                const rowContent = docContent.substring(rowStart, rowEnd + 7);
                const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
                
                console.log(`📊 Found Total row with ${cells?.length || 0} cells`);
                
                if (cells && cells.length >= 4) {
                  // A estrutura é: [Label "Total:", Início (vazio), Término (vazio), Total (amarelo)]
                  // Vamos preencher a célula 3 (índice 3) que é o Total amarelo
                  let totalCell = cells[3];
                  
                  // Procurar parágrafo vazio nesta célula
                  let emptyP = totalCell.match(/<w:p\s+[^>]*\/>/);
                  if (!emptyP) {
                    emptyP = totalCell.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
                  }
                  
                  if (emptyP) {
                    const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:b/><w:bCs/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(hd.total)}</w:t></w:r></w:p>`;
                    totalCell = totalCell.replace(emptyP[0], newP);
                    cells[3] = totalCell;
                    
                    // Reconstruir a linha
                    const rowStartTag = rowContent.substring(0, rowContent.indexOf('<w:tc'));
                    const rowEndTag = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
                    const newRow = rowStartTag + cells.join('') + rowEndTag;
                    
                    docContent = docContent.substring(0, rowStart) + newRow + docContent.substring(rowEnd + 7);
                    console.log(`✅ Total horas disponibilizadas (célula amarela): ${hd.total}`);
                  } else {
                    console.log(`⚠️ No empty paragraph in Total cell`);
                  }
                } else {
                  console.log(`⚠️ Not enough cells in Total row`);
                }
              }
            } else {
              console.log(`⚠️ Total: label not found after Outros`);
            }
          } else {
            console.log(`⚠️ Outros (especifique) not found`);
          }
        }
      }
    }
    
    console.log('\n📋 Filling activities...');
    
    // ATIVIDADES EXECUTADAS (na seção de descrição)
    if (data.atividadesExecutadas && data.atividadesExecutadas.length > 0) {
      const atividadesText = data.atividadesExecutadas.map((a, i) => `${i + 1}. ${a.descricao}`).join('\n');
      
      // Procurar a seção de descrição
      const descLabel = 'Descrição: 1) Atividades Realizadas, 2) Progresso (cronograma),';
      const descPos = docContent.indexOf(descLabel);
      
      if (descPos !== -1) {
        // Encontrar o fim da linha atual
        const rowEnd = docContent.indexOf('</w:tr>', descPos);
        
        // Encontrar a PRÓXIMA linha (onde estão as atividades)
        const nextRowStart = docContent.indexOf('<w:tr', rowEnd);
        if (nextRowStart !== -1) {
          const nextRowEnd = docContent.indexOf('</w:tr>', nextRowStart);
          const rowContent = docContent.substring(nextRowStart, nextRowEnd + 7);
          
          // Encontrar a segunda célula desta linha (primeira é o número "1")
          const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
          
          if (cells && cells.length >= 2) {
            let targetCell = cells[1]; // Segunda célula
            
            // Procurar parágrafo vazio - self-closing ou sem <w:r>
            let emptyP = targetCell.match(/<w:p\s+[^>]*\/>/);
            if (!emptyP) {
              emptyP = targetCell.match(/<w:p\s+[^>]*>(?:(?!<w:r>).)*?<\/w:p>/s);
            }
            
            if (emptyP) {
              const newP = `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000"><w:pPr><w:spacing w:line="160" w:lineRule="exact"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Poppins" w:eastAsia="Poppins" w:hAnsi="Poppins" w:cs="Poppins"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t xml:space="preserve">${escapeXml(atividadesText)}</w:t></w:r></w:p>`;
              targetCell = targetCell.replace(emptyP[0], newP);
              cells[1] = targetCell;
              
              // Reconstruir a linha
              const rowStart = rowContent.substring(0, rowContent.indexOf('<w:tc'));
              const rowEndPart = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
              const newRow = rowStart + cells.join('') + rowEndPart;
              
              docContent = docContent.substring(0, nextRowStart) + newRow + docContent.substring(nextRowEnd + 7);
              console.log(`✅ Added ${data.atividadesExecutadas.length} activities`);
            } else {
              console.log(`⚠️ No empty paragraph found in activities cell`);
            }
          } else {
            console.log(`⚠️ Not enough cells in activities row`);
          }
        }
      }
    }
    
    console.log('\n✍️ Processing signatures...');
    
    // REPRESENTANTE CLIENTE - preencher nome
    if (data.representanteCliente) {
      docContent = fillCellAfterLabel(docContent, 'Representante CLIENTE:', data.representanteCliente);
      console.log(`✅ Client representative: ${data.representanteCliente}`);
    }
    
    // VISTOS DA EQUIPE - Adicionar imagens ao ZIP primeiro
    const vistoRids: string[] = [];
    if (data.participantes && data.participantes.length > 0) {
      console.log(`\n👥 Adding ${data.participantes.length} team member visto images...`);
      
      for (let i = 0; i < data.participantes.length; i++) {
        const member = data.participantes[i];
        
        if (member.visto) {
          try {
            const base64Data = member.visto.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const vistoId = `visto_${i + 1}`;
            const rId = `rIdVisto${i + 1}`;
            
            zip.file(`word/media/${vistoId}.png`, imageBuffer);
            vistoRids.push(rId);
            
            // Add relationship
            const relsFile = zip.file('word/_rels/document.xml.rels');
            if (relsFile) {
              let relsContent = relsFile.asText();
              const newRel = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${vistoId}.png"/>`;
              const insertPos = relsContent.lastIndexOf('</Relationships>');
              relsContent = relsContent.substring(0, insertPos) + newRel + relsContent.substring(insertPos);
              zip.file('word/_rels/document.xml.rels', relsContent);
            }
            
            console.log(`✅ Added visto image ${i + 1} for ${member.nome}`);
          } catch (error) {
            console.error(`❌ Error adding visto ${i + 1}:`, error);
          }
        } else {
          vistoRids.push(''); // Empty for members without visto
        }
      }
    }
    
    // ASSINATURA RESPONSÁVEL - na célula com linha tracejada (lado esquerdo)
    // Usar certificacaoHorasAssinatura (assinatura desenhada pelo responsável)
    if (data.certificacaoHorasAssinatura) {
      try {
        console.log('🖊️ Processing RESPONSÁVEL signature...');
        
        const base64Data = data.certificacaoHorasAssinatura.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        zip.file('word/media/assinatura_responsavel.png', imageBuffer);
        
        // Add relationship
        const relsFile = zip.file('word/_rels/document.xml.rels');
        if (relsFile) {
          let relsContent = relsFile.asText();
          const newRel = `<Relationship Id="rIdSigResp" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/assinatura_responsavel.png"/>`;
          const insertPos = relsContent.lastIndexOf('</Relationships>');
          relsContent = relsContent.substring(0, insertPos) + newRel + relsContent.substring(insertPos);
          zip.file('word/_rels/document.xml.rels', relsContent);
        }
        
        // Estratégia diferente: procurar diretamente pela linha tracejada que vem ANTES de "CLIENTE"
        // e que está na mesma linha (row) que "CLIENTE"
        const clienteMarker = 'CLIENTE';
        let clientePos = docContent.indexOf(clienteMarker);
        
        // Pode haver múltiplas ocorrências de "CLIENTE", procurar a que está na seção de assinaturas
        // (depois de "Nós NX Energy")
        const nxPos = docContent.indexOf('Nós NX Energy');
        if (nxPos !== -1) {
          // Procurar "CLIENTE" DEPOIS de "Nós NX Energy"
          clientePos = docContent.indexOf(clienteMarker, nxPos);
        }
        
        if (clientePos !== -1) {
          console.log('🔍 Found CLIENTE marker at position', clientePos);
          
          // Encontrar a linha (row) que contém "CLIENTE"
          const rowStart = docContent.lastIndexOf('<w:tr', clientePos);
          const rowEnd = docContent.indexOf('</w:tr>', clientePos);
          
          if (rowStart !== -1 && rowEnd !== -1) {
            console.log('📋 Found row with CLIENTE');
            
            const rowContent = docContent.substring(rowStart, rowEnd + 7);
            
            // Extrair todas as células desta linha
            const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
            
            if (!cells || cells.length < 2) {
              console.log('⚠️ Not enough cells in CLIENTE row');
            } else {
              console.log(`📦 Found ${cells.length} cells in CLIENTE row`);
              
              // A primeira célula deve ter a linha tracejada do responsável
              let firstCell = cells[0];
              
              // Procurar por linha tracejada (hífens ou underscores)
              const dashMatch = firstCell.match(/(-{10,}|_{10,})/);
              
              if (dashMatch && dashMatch.index !== undefined) {
                console.log('✅ Found dashed line in first cell at position', dashMatch.index);
                
                const dashPos = dashMatch.index;
                let endPos = dashPos;
                while (endPos < firstCell.length && (firstCell[endPos] === '-' || firstCell[endPos] === '_')) {
                  endPos++;
                }
                
                const sigDrawing = createSignatureDrawing('rIdSigResp', 'Assinatura Responsável');
                
                // Substituir linha tracejada pela imagem
                firstCell = firstCell.substring(0, dashPos) + sigDrawing + firstCell.substring(endPos);
                cells[0] = firstCell;
                
                // Reconstruir a linha
                const rowStartTag = rowContent.substring(0, rowContent.indexOf('<w:tc'));
                const rowEndTag = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
                const newRow = rowStartTag + cells.join('') + rowEndTag;
                
                // Substituir no documento
                docContent = docContent.substring(0, rowStart) + newRow + docContent.substring(rowEnd + 7);
                
                console.log('✅ Inserted RESPONSÁVEL signature in left cell (before CLIENTE)');
              } else {
                console.log('⚠️ No dashed line found in first cell');
                console.log('First cell preview:', firstCell.substring(0, 300));
              }
            }
          } else {
            console.log('⚠️ Could not find row boundaries for CLIENTE');
          }
        } else {
          console.log('⚠️ Could not find CLIENTE marker');
        }
      } catch (error) {
        console.error('❌ Error adding responsável signature:', error);
      }
    } else {
      console.log('⚠️ No certificacaoHorasAssinatura provided');
    }
    
    // ASSINATURA CLIENTE - na linha tracejada com "CLIENTE"
    if (data.representanteClienteAssinatura) {
      try {
        const base64Data = data.representanteClienteAssinatura.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        zip.file('word/media/assinatura_cliente.png', imageBuffer);
        
        // Add relationship
        const relsFile = zip.file('word/_rels/document.xml.rels');
        if (relsFile) {
          let relsContent = relsFile.asText();
          const newRel = `<Relationship Id="rIdSigCli" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/assinatura_cliente.png"/>`;
          const insertPos = relsContent.lastIndexOf('</Relationships>');
          relsContent = relsContent.substring(0, insertPos) + newRel + relsContent.substring(insertPos);
          zip.file('word/_rels/document.xml.rels', relsContent);
        }
        
        // Procurar "CLIENTE" e substituir a linha tracejada antes dele
        const clientePos = docContent.indexOf('CLIENTE', docContent.indexOf('Nós NX Energy'));
        if (clientePos !== -1) {
          const beforeCliente = docContent.substring(0, clientePos);
          const lastUnderscore = beforeCliente.lastIndexOf('_');
          
          if (lastUnderscore !== -1) {
            // Encontrar o início da sequência de underscores
            let startPos = lastUnderscore;
            while (startPos > 0 && docContent[startPos - 1] === '_') {
              startPos--;
            }
            
            const sigDrawing = createSignatureDrawing('rIdSigCli', 'Assinatura Cliente');
            
            // Substituir os underscores
            const underscoreLength = lastUnderscore - startPos + 1;
            docContent = docContent.substring(0, startPos) + 
                        sigDrawing +
                        docContent.substring(lastUnderscore + 1);
            
            console.log('✅ Inserted CLIENTE signature');
          }
        }
      } catch (error) {
        console.error('❌ Error adding cliente signature:', error);
      }
    }
    
    console.log('\n📝 Filling observations...');
    
    // OBSERVAÇÕES
    if (data.observacoes) {
      // Procurar campo de observações (pode estar em diferentes lugares)
      const obsLabels = ['3)Ocorrências', 'Observações', 'OBS'];
      for (const label of obsLabels) {
        docContent = fillCellAfterLabel(docContent, label, data.observacoes);
      }
    }
    
    console.log('\n📸 Processing photos...');
    
    // FOTOS
    if (data.photos && data.photos.length > 0) {
      const result = await processPhotos(zip, docContent, data.photos);
      zip = result.zip;
      docContent = result.docContent;
    }
    
    // Validação final
    if (!docContent.includes('</w:document>')) {
      console.error('❌ XML corrupted');
      return originalContent;
    }
    
    console.log('\n✅ All fields processed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    return originalContent;
  }

  zip.file('word/document.xml', docContent);

  let outputBuffer: Buffer;
  try {
    outputBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  } catch (e) {
    console.error('❌ Failed to generate:', e);
    return originalContent;
  }

  try {
    new PizZip(outputBuffer);
  } catch (e) {
    console.error('❌ Validation failed:', e);
    return originalContent;
  }

  console.log('\n🎉 RDO Generated!');
  console.log('📊 Size:', outputBuffer.length, 'bytes');
  return outputBuffer;
}

