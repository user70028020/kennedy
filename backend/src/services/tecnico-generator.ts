import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TecnicoPhoto {
  id: string;
  data: string;
  name: string;
  description?: string;
}

export interface TecnicoData {
  osNumber: string;
  reportDate: string;
  clientName: string;
  location?: string;
  responsible?: string;
  observations?: string;
  status: 'conforme' | 'alerta' | 'corretiva' | '';
  photos?: TecnicoPhoto[];
  formData: Record<string, any>;
}

const TEMPLATE_FILES: Record<string, { nx: string; sercamp: string }> = {
  'transformador': { nx: 'transformador_nx.docx', sercamp: 'transformador_sercamp.docx' },
  'transformador_instrumento': { nx: 'tc_tp_nx.docx', sercamp: 'tc_tp_sercamp.docx' },
  'disjuntor': { nx: 'disjuntor_nx.docx', sercamp: 'disjuntor_sercamp.docx' },
  'rele_protecao': { nx: 'rele_nx.docx', sercamp: 'rele_sercamp.docx' },
  'chave_seccionadora': { nx: 'chave_seccionadora_nx.docx', sercamp: 'chave_seccionadora_sercamp.docx' },
  'chave_religadora': { nx: 'religador_nx.docx', sercamp: 'religador_sercamp.docx' },
  'painel_religador': { nx: 'religador_nx.docx', sercamp: 'religador_sercamp.docx' },
  'retificador_bateria': { nx: 'retificador_nx.docx', sercamp: 'retificador_sercamp.docx' },
  'banco_capacitores': { nx: 'banco_capacitores_nx.docx', sercamp: 'banco_capacitores_sercamp.docx' },
  'para_raio': { nx: 'para_raio_nx.docx', sercamp: 'para_raio_sercamp.docx' },
  'cabos': { nx: 'cabos_nx.docx', sercamp: 'cabos_sercamp.docx' },
};

export function getTecnicoTemplatePath(
  equipmentType: string,
  template: 'nx_energy' | 'sercamp'
): string {
  const templatesDir = path.join(__dirname, '../../templates');
  const files = TEMPLATE_FILES[equipmentType];
  
  if (!files) {
    throw new Error(`Template não encontrado para equipamento: ${equipmentType}`);
  }
  
  const templateFile = template === 'nx_energy' ? files.nx : files.sercamp;
  return path.join(templatesDir, templateFile);
}

export async function generateTecnicoReport(
  equipmentType: string,
  template: 'nx_energy' | 'sercamp',
  data: TecnicoData
): Promise<Buffer> {
  const templatePath = getTecnicoTemplatePath(equipmentType, template);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  console.log('=== Tecnico Report Generation ===');
  console.log('Equipment:', equipmentType);

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
    // ========== PÁGINA 1 ==========
    // 1. Campos de texto principais
    docContent = fillTableCells(docContent, data);
    
    // 2. Checkboxes de opções
    docContent = processCheckboxes(docContent, equipmentType, data.formData);
    
    // 3. Campo de parênteses (Tampa de Inspeção SIM/NÃO)
    docContent = processParenthesesFields(docContent, data.formData);
    
    // 4. Inspeções gerais (OK/NC/NA)
    docContent = processInspections(docContent, data.formData);
    
    // 5. TTR - Relação de Transformação
    docContent = processTTR(docContent, data.formData);
    
    // 6. Resistência Ôhmica
    docContent = processResistenciaOhmica(docContent, data.formData);
    
    // 7. Resistência de Isolamento
    docContent = processResistenciaIsolamento(docContent, data.formData);
    
    // 8. Observações
    docContent = processObservacoes(docContent, data);
    
    // 9. Status (cor verde/amarelo/vermelho)
    docContent = processStatusColor(docContent, data.status);
    
    // ========== FOTOS ==========
    // 10. Inserir fotos na última página
    if (data.photos && data.photos.length > 0) {
      const result = await processPhotos(zip, docContent, data.photos);
      zip = result.zip;
      docContent = result.docContent;
    }
    
    // ========== PÁGINAS 2-4: DESABILITADAS ==========
    // Apenas página 1 é processada por enquanto
    // 
    // // ========== PÁGINA 2 ==========
    // // 9. Análise Físico-Química
    // docContent = processFisicoQuimica(docContent, data.formData);
    // 
    // // ========== PÁGINA 3 ==========
    // // 10. Cromatografia (CR)
    // docContent = processCromatografia(docContent, data.formData);
    // 
    // // 11. Análise PCB
    // docContent = processPCB(docContent, data.formData);
    // 
    // // ========== PÁGINA 4 ==========
    // // 12. Análise Furfuraldeído (2FALL)
    // docContent = processFurfuraldeido(docContent, data.formData);
    // 
    // // ========== STATUS DAS SEÇÕES ==========
    // // 13. Cores de status (verde/amarelo/vermelho)
    // docContent = processStatusColors(docContent, data.formData);
    
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
// PÁGINA 1: DADOS DO EQUIPAMENTO
// ============================================

function fillTableCells(docContent: string, data: TecnicoData): string {
  const formData = data.formData || {};
  
  // Campos que vão na célula ADJACENTE (próxima célula após o label)
  const adjacentFields: [string, string][] = [
    ['OS:', data.osNumber || ''],
    ['DATA', formatDate(data.reportDate) || ''],
    ['Elaborado por:', data.responsible || ''],
    ['CLIENTE', data.clientName || ''],
    ['CIDADE/UF', data.location || ''],
    ['LOCAL DE INSTALAÇÃO', formData.localInstalacao || ''],
    ['POTÊNCIA (KVA)', formData.potencia || ''],
    ['IMPEDÂNCIA (%)', formData.impedancia || ''],
    ['NÚMERO DE SERIE', formData.numeroSerie || ''],
    ['DATA DE FABRICAÇÃO', formData.dataFabricacao || ''],
    ['VOLUME DE ÓLEO (L)', formData.volumeOleo || ''],
    ['TENSÃO SUP. (KV)', formData.tensaoSuperior || ''],
    ['TENSÃO INFERIOR (V)', formData.tensaoInferior || ''],
    ['DISTÂNCIA ENTRE T.V. E TRAFO', formData.distanciaTvTrafo || formData.distanciaTVTrafo || ''],
    ['VEÍCULO QUE ACESSA', formData.veiculoAcessa || formData.veiculoQueAcessa || ''],
    ['T. ÓLEO (ºC)', formData.temperaturaOleo || ''],
    ['TA (ºC)', formData.temperaturaAmbiente || ''],
    ['URA (%)', formData.umidadeRelativa || ''],
  ];
  
  for (const [label, value] of adjacentFields) {
    if (value) {
      docContent = fillCellAfterLabel(docContent, label, value);
    }
  }
  
  // FABRICANTE - célula específica (pular 4 células após NÚMERO DA COLETA)
  if (formData.fabricante) {
    docContent = fillFabricante(docContent, formData.fabricante);
  }
  
  // NÚMERO DA COLETA - célula específica na mesma linha
  if (formData.numeroColeta) {
    docContent = fillNumeroColeta(docContent, formData.numeroColeta);
  }
  
  return docContent;
}

function fillNumeroColeta(docContent: string, value: string): string {
  // NÚMERO DA COLETA: Cell 0 = label, Cell 1 = valor vazio
  const labelPos = docContent.indexOf('NÚMERO DA COLETA');
  if (labelPos === -1) return docContent;
  
  // Encontrar a célula do label
  const cellEndPos = docContent.indexOf('</w:tc>', labelPos);
  if (cellEndPos === -1) return docContent;
  
  // Próxima célula (Cell 1) é onde vai o valor
  const nextCellStart = docContent.indexOf('<w:tc', cellEndPos);
  if (nextCellStart === -1) return docContent;
  
  const nextCellEnd = docContent.indexOf('</w:tc>', nextCellStart);
  if (nextCellEnd === -1) return docContent;
  
  let cellContent = docContent.substring(nextCellStart, nextCellEnd + 7);
  
  // Verificar se a célula tem checkbox - se tiver, é a célula errada
  if (cellContent.includes('☐') || cellContent.includes('FQ')) {
    console.log('NÚMERO DA COLETA: célula de valor não encontrada');
    return docContent;
  }
  
  // Célula vazia - inserir valor com formatação correta (sz=18, bold, center)
  const insertPos = cellContent.lastIndexOf('</w:p>');
  if (insertPos !== -1) {
    const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r>`;
    cellContent = cellContent.substring(0, insertPos) + formattedRun + cellContent.substring(insertPos);
    docContent = docContent.substring(0, nextCellStart) + cellContent + docContent.substring(nextCellEnd + 7);
    console.log(`Filled: "NÚMERO DA COLETA" = "${value}"`);
  }
  
  return docContent;
}

function fillFabricante(docContent: string, value: string): string {
  // FABRICANTE está após as checkboxes de coleta
  const labelPos = docContent.indexOf('FABRICANTE');
  if (labelPos === -1) return docContent;
  
  // Encontrar a célula do label
  const cellEndPos = docContent.indexOf('</w:tc>', labelPos);
  if (cellEndPos === -1) return docContent;
  
  // Próxima célula é onde vai o valor
  const nextCellStart = docContent.indexOf('<w:tc', cellEndPos);
  if (nextCellStart === -1) return docContent;
  
  const nextCellEnd = docContent.indexOf('</w:tc>', nextCellStart);
  if (nextCellEnd === -1) return docContent;
  
  let cellContent = docContent.substring(nextCellStart, nextCellEnd + 7);
  
  // Verificar se a célula está vazia
  const textMatch = cellContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  const hasText = textMatch && textMatch.some(t => {
    const m = t.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
    return m && m[1].trim().length > 0;
  });
  
  if (!hasText) {
    const insertPos = cellContent.lastIndexOf('</w:p>');
    if (insertPos !== -1) {
      const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r>`;
      cellContent = cellContent.substring(0, insertPos) + formattedRun + cellContent.substring(insertPos);
      docContent = docContent.substring(0, nextCellStart) + cellContent + docContent.substring(nextCellEnd + 7);
      console.log(`Filled: "FABRICANTE" = "${value}"`);
    }
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
      // Usar formatação consistente com o template (sz=18, bold, center)
      const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r>`;
      const newCellContent = cellContent.substring(0, insertPos) + formattedRun + cellContent.substring(insertPos);
      
      docContent = docContent.substring(0, nextCellStart) + 
                   newCellContent + 
                   docContent.substring(nextCellEnd + 7);
      
      console.log(`Filled: "${label}" = "${value}"`);
    }
  }
  
  return docContent;
}

function processCheckboxes(docContent: string, equipmentType: string, formData: Record<string, any>): string {
  if (!formData) return docContent;

  console.log('Processing checkboxes...');
  const labelsToMark = getLabelsToMark(equipmentType, formData);
  console.log('Labels to mark:', labelsToMark);

  for (const label of labelsToMark) {
    docContent = markCheckboxBeforeLabel(docContent, label);
  }

  return docContent;
}

function processParenthesesFields(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  if (formData.tampaInspecaoSim) {
    docContent = markParenthesesBeforeLabel(docContent, 'SIM', 'TAMPA DE INSPEÇÃO');
    console.log('Marked parentheses: TAMPA DE INSPEÇÃO = SIM');
  } else if (formData.tampaInspecaoNao) {
    docContent = markParenthesesBeforeLabel(docContent, 'NÃO', 'TAMPA DE INSPEÇÃO');
    console.log('Marked parentheses: TAMPA DE INSPEÇÃO = NÃO');
  }
  
  return docContent;
}

function markParenthesesBeforeLabel(docContent: string, label: string, context: string): string {
  const contextIndex = docContent.indexOf(context);
  if (contextIndex === -1) return docContent;
  
  const afterContext = docContent.substring(contextIndex);
  const labelIndex = afterContext.indexOf(`) ${label}`);
  if (labelIndex === -1) return docContent;
  
  const beforeLabel = afterContext.substring(0, labelIndex);
  const openParenIndex = beforeLabel.lastIndexOf('(');
  if (openParenIndex === -1) return docContent;
  
  const absoluteOpenParen = contextIndex + openParenIndex;
  const closeParenIndex = contextIndex + labelIndex;
  const parenContent = docContent.substring(absoluteOpenParen, closeParenIndex + 1);
  const newContent = parenContent.replace(/\(\s+/, '(X');
  
  docContent = docContent.substring(0, absoluteOpenParen) + 
               newContent + 
               docContent.substring(closeParenIndex + 1);
  
  return docContent;
}

function markCheckboxBeforeLabel(docContent: string, label: string): string {
  const variations = [` ${label}`, `>${label}<`, label];
  
  let labelIndex = -1;
  for (const v of variations) {
    labelIndex = docContent.indexOf(v);
    if (labelIndex !== -1) {
      if (v.startsWith(' ')) labelIndex += 1;
      if (v.startsWith('>')) labelIndex += 1;
      break;
    }
  }
  
  if (labelIndex === -1) {
    console.log(`Label not found: "${label}"`);
    return docContent;
  }

  const searchStart = Math.max(0, labelIndex - 500);
  const beforeLabel = docContent.substring(searchStart, labelIndex);
  const lastCheckboxPos = beforeLabel.lastIndexOf('☐');
  
  if (lastCheckboxPos === -1) {
    console.log(`No checkbox before: "${label}"`);
    return docContent;
  }

  const absolutePos = searchStart + lastCheckboxPos;
  const before = docContent.substring(0, absolutePos);
  const after = docContent.substring(absolutePos + 1);
  
  console.log(`Marked: "${label}"`);
  return before + '☒' + after;
}


// ============================================
// INSPEÇÕES GERAIS (OK/NC/NA)
// ============================================

function processInspections(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  const inspecoes = formData.inspecoes || {};
  
  const inspectionLabels: [string, string, string][] = [
    ['indicadorNivelOleo', 'inspecaoIndicadorNivelOleo', 'INDICADOR DE NÍVEL DE ÓLEO'],
    ['releGasBuchholz', 'inspecaoReleGasBuchholz', 'BUCHHOLZ'],
    ['termometroOleo', 'inspecaoTermometroOleo', 'TERMÔMETRO DE ÓLEO'],
    ['valvulaAlivioPressao', 'inspecaoValvulaAlivio', 'VÁLVULA DE'],
    ['relePressaoSubita', 'inspecaoRelePressaoSubita', 'PRESSÃO SÚBITA'],
    ['tuboExplosao', 'inspecaoTuboExplosao', 'TUBO DE EXPLOSÃO'],
    ['tanqueExpansao', 'inspecaoTanqueExpansao', 'TANQUE DE EXPANSÃO'],
    ['silicaGel', 'inspecaoSilicaGel', 'SÍLICA GEL'],
    ['radiadores', 'inspecaoRadiadores', 'RADIADORES'],
    ['tampaPrincipal', 'inspecaoTampaPrincipal', 'TAMPA PRINCIPAL'],
    ['tampaInspecaoInsp', 'inspecaoTampaInspecao', 'TAMPA DE INSPEÇÃO'],
    ['buchaAtBt', 'inspecaoBuchaATBT', 'BUCHA AT E BT'],
    ['pintura', 'inspecaoPintura', 'PINTURA'],
    ['comutador', 'inspecaoComutador', 'COMUTADOR'],
    ['vedacoes', 'inspecaoVedacoes', 'VEDAÇÕES'],
    ['registros', 'inspecaoRegistros', 'REGISTROS'],
    ['nivelOleo', 'inspecaoNivelOleo', 'NÍVEL DE ÓLEO'],
    ['aterramento', 'inspecaoAterramento', 'ATERRAMENTO'],
  ];
  
  for (const [chaveBackend, chaveForm, label] of inspectionLabels) {
    const value = inspecoes[chaveBackend] || formData[chaveForm];
    if (value) {
      docContent = markInspectionCheckbox(docContent, label, value);
    }
  }
  
  return docContent;
}

function markInspectionCheckbox(docContent: string, itemLabel: string, status: 'ok' | 'nc' | 'na'): string {
  let labelIndex = -1;
  let searchStart = 0;
  
  while (true) {
    const idx = docContent.indexOf(itemLabel, searchStart);
    if (idx === -1) break;
    
    const before = docContent.substring(Math.max(0, idx - 50), idx);
    
    if (itemLabel === 'NÍVEL DE ÓLEO' && before.includes('INDICADOR DE')) {
      searchStart = idx + 1;
      continue;
    }
    
    // Skip if this is in the LAUDO section (page 2+)
    if (itemLabel === 'TAMPA DE INSPEÇÃO') {
      const afterIdx = docContent.substring(idx, idx + 100);
      if (!afterIdx.includes('OK') && !afterIdx.includes('NC')) {
        searchStart = idx + 1;
        continue;
      }
    }
    
    labelIndex = idx;
    break;
  }
  
  if (labelIndex === -1) {
    return docContent;
  }
  
  const afterLabel = docContent.substring(labelIndex, labelIndex + 2500);
  const statusMap: Record<string, string> = { 'ok': 'OK', 'nc': 'NC', 'na': 'NA' };
  const targetStatus = statusMap[status];
  
  const statusTextIndex = afterLabel.indexOf(targetStatus);
  if (statusTextIndex === -1) {
    return docContent;
  }
  
  const beforeStatus = afterLabel.substring(0, statusTextIndex);
  const checkboxPos = beforeStatus.lastIndexOf('☐');
  
  if (checkboxPos === -1) {
    return docContent;
  }
  
  const absolutePos = labelIndex + checkboxPos;
  const before = docContent.substring(0, absolutePos);
  const after = docContent.substring(absolutePos + 1);
  
  console.log(`Inspection "${itemLabel}" = ${status.toUpperCase()}`);
  return before + '☒' + after;
}

// ============================================
// TTR - RELAÇÃO DE TRANSFORMAÇÃO
// ============================================

function processTTR(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  const sectionStart = docContent.indexOf('RELAÇAO DE TRANSFORMAÇÃO');
  if (sectionStart === -1) return docContent;
  
  const sectionEnd = docContent.indexOf('RESISTÊNCIA ÔHMICA', sectionStart);
  if (sectionEnd === -1) return docContent;
  
  let section = docContent.substring(sectionStart, sectionEnd);
  
  // Encontrar todas as linhas
  const rows = section.match(/<w:tr[^>]*>[\s\S]*?<\/w:tr>/g);
  if (!rows || rows.length < 2) return docContent;
  
  // Row 0: RELAÇÃO NOMINAL | V.PRIM.*1,73 / V.SEC. = [valor]
  if (formData.ttrRelacaoNominal) {
    let row0 = rows[0];
    const cells0 = row0.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
    if (cells0 && cells0.length >= 2) {
      // Célula 1 tem "V.PRIM.*1,73 / V.SEC. =" - adicionar valor após "="
      let cell1 = cells0[1];
      const insertPos = cell1.lastIndexOf('</w:p>');
      if (insertPos !== -1) {
        const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t> ${escapeXml(formData.ttrRelacaoNominal)}</w:t></w:r>`;
        cell1 = cell1.substring(0, insertPos) + formattedRun + cell1.substring(insertPos);
        cells0[1] = cell1;
        
        // Reconstruir row
        let cellIdx = 0;
        row0 = row0.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells0[cellIdx++] || '');
        rows[0] = row0;
        console.log(`TTR Relação Nominal = ${formData.ttrRelacaoNominal}`);
      }
    }
  }
  
  // Row 1: LIGAÇÃO - [valor] | H1-H3 | [valor] | H2-H1 | [valor] | H3-H2 | [valor]
  let row1 = rows[1];
  const cells1 = row1.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (cells1 && cells1.length >= 7) {
    // Célula 0: Substituir "Dy N1" pela ligação
    // O texto pode estar fragmentado em múltiplas tags <w:t>
    if (formData.ttrLigacao) {
      let cell0 = cells1[0];
      
      // Substituir "Dy" por valor e remover "N1"
      // Primeiro, substituir >Dy< por >valor<
      if (cell0.includes('>Dy<')) {
        cell0 = cell0.replace(/>Dy</g, `>${escapeXml(formData.ttrLigacao)}<`);
        // Remover o N1 que vem depois
        cell0 = cell0.replace(/>N1</g, '><');
        cell0 = cell0.replace(/> N1</g, '><');
      } else {
        // Tentar substituição direta
        cell0 = cell0.replace(/Dy\s*N1/g, escapeXml(formData.ttrLigacao));
      }
      
      cells1[0] = cell0;
      console.log(`TTR Ligação = ${formData.ttrLigacao}`);
    }
    
    // Células 2, 4, 6: Valores H1-H3, H2-H1, H3-H2
    const ttrValues: [number, string, string][] = [
      [2, 'H1-H3', formData.ttrH1H3_X1X0 || ''],
      [4, 'H2-H1', formData.ttrH2H1_X2X0 || ''],
      [6, 'H3-H2', formData.ttrH3H2_X3X0 || ''],
    ];
    
    for (const [cellIdx, label, value] of ttrValues) {
      if (value && cellIdx < cells1.length) {
        let cell = cells1[cellIdx];
        const insertPos = cell.lastIndexOf('</w:p>');
        if (insertPos !== -1) {
          const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r>`;
          cell = cell.substring(0, insertPos) + formattedRun + cell.substring(insertPos);
          cells1[cellIdx] = cell;
          console.log(`TTR ${label} = ${value}`);
        }
      }
    }
    
    // Reconstruir row
    let cellIdx = 0;
    row1 = row1.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells1[cellIdx++] || '');
    rows[1] = row1;
  }
  
  // Reconstruir seção
  let newSection = section;
  let rowIdx = 0;
  newSection = newSection.replace(/<w:tr[^>]*>[\s\S]*?<\/w:tr>/g, () => rows[rowIdx++] || '');
  
  docContent = docContent.substring(0, sectionStart) + newSection + docContent.substring(sectionEnd);
  
  return docContent;
}

// ============================================
// RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS
// ============================================

function processResistenciaOhmica(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  // Estrutura do template:
  // Row 0: H1-H2 | H2-H3 | H3-H1 | X1-X0 | X2-X0 | X3-X0 (cabeçalhos)
  // Row 1: ☐µΩ|☐mΩ|☐Ω | ☐µΩ|☐mΩ|☐Ω | ... (checkboxes de unidade - MARCAR AQUI)
  // Row 2: [vazio] | [vazio] | ... (valores numéricos - INSERIR AQUI)
  
  const resFields: [string, string, string][] = [
    ['H1-H2', formData.resOhmicaH1H2 || '', formData.resOhmicaH1H2Unidade || 'mΩ'],
    ['H2-H3', formData.resOhmicaH2H3 || '', formData.resOhmicaH2H3Unidade || 'mΩ'],
    ['H3-H1', formData.resOhmicaH3H1 || '', formData.resOhmicaH3H1Unidade || 'mΩ'],
    ['X1-X0', formData.resOhmicaX1X0 || '', formData.resOhmicaX1X0Unidade || 'mΩ'],
    ['X2-X0', formData.resOhmicaX2X0 || '', formData.resOhmicaX2X0Unidade || 'mΩ'],
    ['X3-X0', formData.resOhmicaX3X0 || '', formData.resOhmicaX3X0Unidade || 'mΩ'],
  ];
  
  const sectionStart = docContent.indexOf('RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS');
  if (sectionStart === -1) return docContent;
  
  // Row 0: Cabeçalhos
  const row0Start = docContent.indexOf('<w:tr', sectionStart);
  if (row0Start === -1) return docContent;
  const row0End = docContent.indexOf('</w:tr>', row0Start);
  if (row0End === -1) return docContent;
  
  // Row 1: Checkboxes de unidade
  const row1Start = docContent.indexOf('<w:tr', row0End);
  if (row1Start === -1) return docContent;
  const row1End = docContent.indexOf('</w:tr>', row1Start);
  if (row1End === -1) return docContent;
  
  // Row 2: Valores numéricos
  const row2Start = docContent.indexOf('<w:tr', row1End);
  if (row2Start === -1) return docContent;
  const row2End = docContent.indexOf('</w:tr>', row2Start);
  if (row2End === -1) return docContent;
  
  // Processar Row 1 (checkboxes)
  let checkboxRow = docContent.substring(row1Start, row1End + 7);
  const checkboxCells = checkboxRow.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  // Processar Row 2 (valores)
  let valueRow = docContent.substring(row2Start, row2End + 7);
  const valueCells = valueRow.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  if (!checkboxCells || checkboxCells.length < 6 || !valueCells || valueCells.length < 6) {
    return docContent;
  }
  
  const ohmSign = String.fromCharCode(0x2126); // Ω (OHM SIGN)
  const microSign = String.fromCharCode(0xB5); // µ (MICRO SIGN)
  
  for (let i = 0; i < resFields.length && i < 6; i++) {
    const [label, value, unidade] = resFields[i];
    if (!value) continue;
    
    // === MARCAR CHECKBOX NA ROW 1 ===
    let cbCell = checkboxCells[i];
    
    const unidadeMap: Record<string, string> = {
      'µΩ': microSign + ohmSign,
      'uΩ': microSign + ohmSign,
      'mΩ': 'm' + ohmSign,
      'Ω': ohmSign
    };
    const targetUnidade = unidadeMap[unidade] || ('m' + ohmSign);
    
    // Encontrar a posição da unidade alvo
    let unidadeIdx = -1;
    if (targetUnidade === microSign + ohmSign) {
      unidadeIdx = cbCell.indexOf('>' + microSign + ohmSign);
      if (unidadeIdx !== -1) unidadeIdx += 1;
    } else if (targetUnidade === 'm' + ohmSign) {
      unidadeIdx = cbCell.indexOf('>m' + ohmSign);
      if (unidadeIdx !== -1) unidadeIdx += 1;
    } else if (targetUnidade === ohmSign) {
      // Ω sozinho - buscar padrão que não seja µΩ nem mΩ
      const regex = new RegExp('>[^m' + microSign + ']?' + ohmSign);
      const match = cbCell.match(regex);
      if (match && match.index !== undefined) {
        unidadeIdx = match.index + 1;
      }
    }
    
    if (unidadeIdx !== -1) {
      const beforeUnidade = cbCell.substring(0, unidadeIdx);
      const checkboxPos = beforeUnidade.lastIndexOf('☐');
      if (checkboxPos !== -1) {
        cbCell = cbCell.substring(0, checkboxPos) + '☒' + cbCell.substring(checkboxPos + 1);
        console.log(`Res. Ôhmica "${label}" checkbox ${unidade} marcado`);
      }
    }
    checkboxCells[i] = cbCell;
    
    // === INSERIR VALOR NA ROW 2 ===
    let valCell = valueCells[i];
    const insertPos = valCell.lastIndexOf('</w:p>');
    if (insertPos !== -1) {
      const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(value)}</w:t></w:r>`;
      valCell = valCell.substring(0, insertPos) + formattedRun + valCell.substring(insertPos);
      console.log(`Res. Ôhmica "${label}" valor = ${value}`);
    }
    valueCells[i] = valCell;
  }
  
  // Reconstruir Row 1 (checkboxes)
  let newCheckboxRow = checkboxRow;
  let cbIdx = 0;
  newCheckboxRow = newCheckboxRow.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => checkboxCells[cbIdx++] || '');
  
  // Reconstruir Row 2 (valores)
  let newValueRow = valueRow;
  let valIdx = 0;
  newValueRow = newValueRow.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => valueCells[valIdx++] || '');
  
  // Substituir no documento (de trás pra frente para não bagunçar os índices)
  docContent = docContent.substring(0, row2Start) + newValueRow + docContent.substring(row2End + 7);
  docContent = docContent.substring(0, row1Start) + newCheckboxRow + docContent.substring(row1End + 7);
  
  return docContent;
}

// ============================================
// RESISTÊNCIA DE ISOLAMENTO - MEGÔMETRO
// ============================================

function processResistenciaIsolamento(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  // Valores a inserir
  const val1 = formData.resIsolATBTMassa || '';
  const val2 = formData.resIsolATMassaBT || '';
  const val3 = formData.resIsolBTMassaAT || '';
  
  if (!val1 && !val2 && !val3) return docContent;
  
  const sectionStart = docContent.indexOf('RESISTÊNCIA DE ISOLAMENTO');
  if (sectionStart === -1) return docContent;
  
  const obsStart = docContent.indexOf('OBSERVAÇÕES', sectionStart);
  if (obsStart === -1) return docContent;
  
  // Encontrar Row 1 (linha dos valores, após a linha dos labels)
  const row0Start = docContent.indexOf('<w:tr', sectionStart);
  if (row0Start === -1) return docContent;
  const row0End = docContent.indexOf('</w:tr>', row0Start);
  if (row0End === -1) return docContent;
  
  const row1Start = docContent.indexOf('<w:tr', row0End);
  if (row1Start === -1 || row1Start > obsStart) return docContent;
  const row1End = docContent.indexOf('</w:tr>', row1Start);
  if (row1End === -1) return docContent;
  
  let row1 = docContent.substring(row1Start, row1End + 7);
  
  // Encontrar as 3 células vazias (antes de cada MΩ) e inserir os valores
  // Estrutura: Cell0(vazia) | Cell1(MΩ) | Cell2(vazia) | Cell3(MΩ) | Cell4(vazia) | Cell5(MΩ)
  
  // Encontrar cada célula vazia (que tem </w:p></w:tc> sem texto)
  // e inserir o valor antes de </w:p>
  
  const values = [val1, val2, val3];
  let valueIdx = 0;
  
  // Processar cada célula
  let newRow1 = '';
  let lastEnd = 0;
  const cellRegex = /<w:tc[^>]*>[\s\S]*?<\/w:tc>/g;
  let match;
  
  while ((match = cellRegex.exec(row1)) !== null) {
    const cell = match[0];
    const cellStart = match.index;
    
    // Adicionar conteúdo antes desta célula
    newRow1 += row1.substring(lastEnd, cellStart);
    
    // Verificar se é uma célula de valor (não contém MΩ)
    const hasMOhm = cell.includes('MΩ') || cell.includes('M\u03A9') || cell.includes('M\u2126');
    const isEmpty = !cell.replace(/<[^>]+>/g, '').trim();
    
    if (!hasMOhm && isEmpty && valueIdx < values.length && values[valueIdx]) {
      // Inserir valor nesta célula com formatação correta
      const insertPos = cell.lastIndexOf('</w:p>');
      if (insertPos !== -1) {
        const formattedRun = `<w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:b/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(values[valueIdx])}</w:t></w:r>`;
        const newCell = cell.substring(0, insertPos) + formattedRun + cell.substring(insertPos);
        newRow1 += newCell;
        console.log(`Res. Isolamento valor ${valueIdx + 1} = ${values[valueIdx]} MΩ`);
      } else {
        newRow1 += cell;
      }
      valueIdx++;
    } else if (!hasMOhm && !isEmpty) {
      // Célula já tem conteúdo, pular
      newRow1 += cell;
      valueIdx++;
    } else {
      // Célula MΩ, manter como está
      newRow1 += cell;
    }
    
    lastEnd = cellStart + cell.length;
  }
  
  // Adicionar o resto
  newRow1 += row1.substring(lastEnd);
  
  // Substituir no documento
  docContent = docContent.substring(0, row1Start) + newRow1 + docContent.substring(row1End + 7);
  
  return docContent;
}

// ============================================
// OBSERVAÇÕES
// ============================================

function processObservacoes(docContent: string, data: TecnicoData): string {
  const obs = data.observations || data.formData?.observacoesRecomendacoes || '';
  if (!obs) return docContent;
  
  // Encontrar "OBSERVAÇÕES | RECOMENDAÇÕES"
  const obsIdx = docContent.indexOf('OBSERVAÇÕES | RECOMENDAÇÕES');
  if (obsIdx === -1) return docContent;
  
  // Encontrar a célula que contém o título
  const cellStart = docContent.lastIndexOf('<w:tc', obsIdx);
  const cellEnd = docContent.indexOf('</w:tc>', obsIdx);
  if (cellStart === -1 || cellEnd === -1) return docContent;
  
  let cellContent = docContent.substring(cellStart, cellEnd + 7);
  
  // Inserir o texto de observações após o título, em um novo parágrafo
  const lastPEnd = cellContent.lastIndexOf('</w:p>');
  if (lastPEnd !== -1) {
    // Adicionar novo parágrafo com o texto e formatação correta
    const newParagraph = `<w:p><w:r><w:rPr><w:rFonts w:cstheme="minorHAnsi"/><w:color w:val="000000"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapeXml(obs)}</w:t></w:r></w:p>`;
    cellContent = cellContent.substring(0, lastPEnd + 6) + newParagraph + cellContent.substring(lastPEnd + 6);
    
    docContent = docContent.substring(0, cellStart) + cellContent + docContent.substring(cellEnd + 7);
    console.log('Filled: Observações');
  }
  
  return docContent;
}

// ============================================
// STATUS - COR DO INDICADOR
// ============================================

function processStatusColor(docContent: string, status: string): string {
  if (!status) return docContent;
  
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
    console.log(`Status "${status}" não reconhecido, usando verde`);
    return docContent;
  }
  
  // Encontrar a célula STATUS
  const statusIdx = docContent.indexOf('STATUS');
  if (statusIdx === -1) {
    console.log('Célula STATUS não encontrada');
    return docContent;
  }
  
  // Encontrar a linha que contém STATUS
  const lineStart = docContent.lastIndexOf('<w:tr', statusIdx);
  const lineEnd = docContent.indexOf('</w:tr>', statusIdx);
  
  if (lineStart === -1 || lineEnd === -1) {
    console.log('Linha STATUS não encontrada');
    return docContent;
  }
  
  let line = docContent.substring(lineStart, lineEnd + 7);
  
  // Encontrar todas as células da linha
  const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (!cells || cells.length < 3) {
    console.log('Células não encontradas (precisa de pelo menos 3)');
    return docContent;
  }
  
  // A célula STATUS é a segunda (índice 1)
  // O quadradinho colorido é a TERCEIRA célula (índice 2) - ao lado direito
  let colorCell = cells[2];
  
  // Verificar se é uma célula vazia (o quadradinho)
  const hasText = colorCell.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
  if (hasText && hasText[1].trim()) {
    console.log('Terceira célula não está vazia');
    return docContent;
  }
  
  // Aplicar cor no quadradinho (célula 2)
  // Remover qualquer w:shd existente e adicionar novo com a cor
  colorCell = colorCell.replace(
    /<w:shd\s+[^>]*\/>/g,
    `<w:shd w:val="clear" w:fill="${newColor}"/>`
  );
  
  // Se não tem w:shd, adicionar em w:tcPr
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
  
  console.log(`Status: ${statusNames[newColor] || newColor}`);
  
  return docContent;
}


// ============================================
// PÁGINA 2: ANÁLISE FÍSICO-QUÍMICA
// ============================================

function processFisicoQuimica(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  // Encontrar a seção de Análise Físico-Química
  const fqStart = docContent.indexOf('FÍSICO-');
  if (fqStart === -1) return docContent;
  
  // Campos da FQ - estrutura: Ensaio | Unidade | Método | Histórico (valor) | Valores Limite
  // O valor vai na 4ª coluna (após Método)
  const fqFields: [string, string][] = [
    ['Aparência', formData.fqAparencia || ''],
    ['Cor', formData.fqCor || ''],
    ['Densidade', formData.fqDensidade || ''],
    ['Tensão', formData.fqTensaoInterfacial || ''],
    ['Teor', formData.fqTeorAgua || ''],
    ['Índice', formData.fqIndiceNeutralizacao || ''],
    ['Rigidez', formData.fqRigidezDieletrica || ''],
    ['90ºC', formData.fqFatorPotencia90 || ''],
    ['100ºC', formData.fqFatorPotencia100 || ''],
  ];
  
  for (const [label, value] of fqFields) {
    if (value) {
      docContent = fillFQValueSimple(docContent, label, value, fqStart);
    }
  }
  
  // Diagnóstico FQ
  if (formData.fqDiagnostico) {
    const diagIdx = docContent.indexOf('DIAGNÓSTICO/CONCLUSÃO:', fqStart);
    const crStart = docContent.indexOf('CROMATOGRAFIA', fqStart);
    
    // Garantir que estamos na seção FQ, não na CR
    if (diagIdx !== -1 && (crStart === -1 || diagIdx < crStart)) {
      const afterDiag = docContent.substring(diagIdx);
      const cellEnd = afterDiag.indexOf('</w:tc>');
      const nextCellStart = afterDiag.indexOf('<w:tc', cellEnd);
      if (nextCellStart !== -1) {
        const nextCellEnd = afterDiag.indexOf('</w:tc>', nextCellStart);
        let cellContent = afterDiag.substring(nextCellStart, nextCellEnd + 7);
        
        const insertPos = cellContent.lastIndexOf('</w:p>');
        if (insertPos !== -1) {
          cellContent = cellContent.substring(0, insertPos) + 
                       `<w:r><w:t>${escapeXml(formData.fqDiagnostico)}</w:t></w:r>` + 
                       cellContent.substring(insertPos);
          
          docContent = docContent.substring(0, diagIdx + nextCellStart) + 
                       cellContent + 
                       docContent.substring(diagIdx + nextCellEnd + 7);
          
          console.log('Filled: FQ Diagnóstico');
        }
      }
    }
  }
  
  return docContent;
}

function fillFQValueSimple(docContent: string, label: string, value: string, sectionStart: number): string {
  // Encontrar o label na seção FQ
  let labelIdx = docContent.indexOf(`>${label}<`, sectionStart);
  
  // Se não encontrou com >, tentar busca direta
  if (labelIdx === -1) {
    labelIdx = docContent.indexOf(label, sectionStart);
  }
  
  if (labelIdx === -1) return docContent;
  
  // Limitar busca até a próxima seção (CROMATOGRAFIA)
  const crStart = docContent.indexOf('CROMATOGRAFIA', sectionStart);
  if (crStart !== -1 && labelIdx > crStart) return docContent;
  
  // Encontrar a linha completa
  const lineStart = docContent.lastIndexOf('<w:tr', labelIdx);
  const lineEnd = docContent.indexOf('</w:tr>', labelIdx);
  if (lineStart === -1 || lineEnd === -1) return docContent;
  
  const line = docContent.substring(lineStart, lineEnd + 7);
  
  // Encontrar todas as células
  const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (!cells || cells.length < 4) return docContent;
  
  // A célula de histórico é a 4ª (índice 3) - após Ensaio, Unidade, Método
  // Mas precisamos encontrar a célula vazia ou a que vem após o método
  let histCellIdx = 3;
  
  // Verificar se a célula está vazia
  let histCell = cells[histCellIdx];
  const hasValue = histCell.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
  const isEmpty = !hasValue || !hasValue[1].trim();
  
  if (!isEmpty) {
    // Tentar a próxima célula
    if (cells.length > 4) {
      histCellIdx = 4;
      histCell = cells[histCellIdx];
    } else {
      return docContent;
    }
  }
  
  // Inserir valor
  const insertPos = histCell.lastIndexOf('</w:p>');
  if (insertPos === -1) return docContent;
  
  histCell = histCell.substring(0, insertPos) + 
            `<w:r><w:t>${escapeXml(value)}</w:t></w:r>` + 
            histCell.substring(insertPos);
  cells[histCellIdx] = histCell;
  
  // Reconstruir linha
  let newLine = line;
  let cellIdx = 0;
  newLine = newLine.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
  
  docContent = docContent.substring(0, lineStart) + newLine + docContent.substring(lineEnd + 7);
  console.log(`Filled FQ: "${label}" = ${value}`);
  
  return docContent;
}

// ============================================
// PÁGINA 3: CROMATOGRAFIA (CR)
// ============================================

function processCromatografia(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  const sectionStart = docContent.indexOf('CROMATOGRAFIA (CR)');
  if (sectionStart === -1) return docContent;
  
  // Gases: H2, O2, N2, CO, CH4, CO2, C2H4, C2H6, C2H2
  const gases: [string, string][] = [
    ['Hidrogênio', formData.crH2 || ''],
    ['Oxigênio', formData.crO2 || ''],
    ['Nitrogênio', formData.crN2 || ''],
    ['Monóxido', formData.crCO || ''],
    ['Metano', formData.crCH4 || ''],
    ['Dióxido', formData.crCO2 || ''],
    ['Etileno', formData.crC2H4 || ''],
    ['Etano', formData.crC2H6 || ''],
    ['Acetileno', formData.crC2H2 || ''],
  ];
  
  for (const [label, value] of gases) {
    if (value) {
      docContent = fillCRValue(docContent, label, value, sectionStart);
    }
  }
  
  // Total
  if (formData.crTotal) {
    docContent = fillCRValue(docContent, 'Total', formData.crTotal, sectionStart);
  }
  
  // Total de Gases Combustíveis
  if (formData.crTotalGasesCombustiveis) {
    docContent = fillCRValue(docContent, 'Combustíveis', formData.crTotalGasesCombustiveis, sectionStart);
  }
  
  // Diagnóstico CR
  if (formData.crDiagnostico) {
    const diagIdx = docContent.indexOf('DIAGNÓSTICO/CONCLUSÃO:', sectionStart);
    if (diagIdx !== -1 && diagIdx < docContent.indexOf('PCB', sectionStart)) {
      docContent = fillCellAfterLabelInSection(docContent, 'DIAGNÓSTICO/CONCLUSÃO:', formData.crDiagnostico, diagIdx);
    }
  }
  
  // Próxima Amostragem
  if (formData.crProximaAmostragem) {
    const proxIdx = docContent.indexOf('Próxima', sectionStart);
    if (proxIdx !== -1 && proxIdx < docContent.indexOf('PCB', sectionStart)) {
      docContent = fillCellAfterLabelInSection(docContent, 'Amostragem:', formData.crProximaAmostragem, proxIdx);
    }
  }
  
  return docContent;
}

function fillCRValue(docContent: string, label: string, value: string, sectionStart: number): string {
  // Encontrar o label do gás
  const labelIdx = docContent.indexOf(label, sectionStart);
  if (labelIdx === -1) return docContent;
  
  // Limitar busca até a próxima seção
  const sectionEnd = docContent.indexOf('PCB', labelIdx);
  if (sectionEnd !== -1 && labelIdx > sectionEnd) return docContent;
  
  // Encontrar a linha do gás
  const lineEnd = docContent.indexOf('</w:tr>', labelIdx);
  if (lineEnd === -1) return docContent;
  
  const lineContent = docContent.substring(labelIdx, lineEnd);
  
  // Encontrar a primeira célula vazia após o label
  const cellMatches = lineContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (!cellMatches || cellMatches.length < 2) return docContent;
  
  // A primeira célula é o label, a segunda é onde vai o valor
  const valueCell = cellMatches[1];
  
  // Verificar se está vazia
  const hasContent = valueCell.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
  if (hasContent && hasContent[1].trim()) return docContent;
  
  // Inserir valor
  const insertPos = valueCell.lastIndexOf('</w:p>');
  if (insertPos === -1) return docContent;
  
  const newCell = valueCell.substring(0, insertPos) + 
                 `<w:r><w:t>${escapeXml(value)}</w:t></w:r>` + 
                 valueCell.substring(insertPos);
  
  // Encontrar posição absoluta
  const cellPos = lineContent.indexOf(valueCell);
  const absolutePos = labelIdx + cellPos;
  
  docContent = docContent.substring(0, absolutePos) + 
               newCell + 
               docContent.substring(absolutePos + valueCell.length);
  
  console.log(`Filled CR: "${label}" = ${value}`);
  return docContent;
}

function fillCellAfterLabelInSection(docContent: string, label: string, value: string, startIdx: number): string {
  const labelIdx = docContent.indexOf(label, startIdx);
  if (labelIdx === -1) return docContent;
  
  // Encontrar a próxima célula
  const afterLabel = docContent.substring(labelIdx);
  const cellEnd = afterLabel.indexOf('</w:tc>');
  const nextCellStart = afterLabel.indexOf('<w:tc', cellEnd);
  
  if (nextCellStart === -1) return docContent;
  
  const nextCellEnd = afterLabel.indexOf('</w:tc>', nextCellStart);
  const cellContent = afterLabel.substring(nextCellStart, nextCellEnd + 7);
  
  // Inserir valor
  const insertPos = cellContent.lastIndexOf('</w:p>');
  if (insertPos === -1) return docContent;
  
  const newCell = cellContent.substring(0, insertPos) + 
                 `<w:r><w:t>${escapeXml(value)}</w:t></w:r>` + 
                 cellContent.substring(insertPos);
  
  docContent = docContent.substring(0, labelIdx + nextCellStart) + 
               newCell + 
               docContent.substring(labelIdx + nextCellEnd + 7);
  
  console.log(`Filled: "${label}" = ${value}`);
  return docContent;
}

// ============================================
// PÁGINA 3: ANÁLISE PCB
// ============================================

function processPCB(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  // Encontrar a seção PCB usando "Clorado" como marcador único
  const cloradoIdx = docContent.indexOf('Clorado');
  if (cloradoIdx === -1) return docContent;
  
  // Teor de PCB - linha com "Teor de PCB e Clorado"
  if (formData.pcbTeor) {
    const lineStart = docContent.lastIndexOf('<w:tr', cloradoIdx);
    const lineEnd = docContent.indexOf('</w:tr>', cloradoIdx);
    if (lineStart !== -1 && lineEnd !== -1) {
      let line = docContent.substring(lineStart, lineEnd + 7);
      
      // Estrutura: Label | Unidade | Método | Histórico (vazio) | ... | Limite
      const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
      if (cells && cells.length >= 4) {
        // Célula 3 é o histórico (vazia)
        let histCell = cells[3];
        const insertPos = histCell.lastIndexOf('</w:p>');
        if (insertPos !== -1) {
          histCell = histCell.substring(0, insertPos) + 
                    `<w:r><w:t>${escapeXml(formData.pcbTeor)}</w:t></w:r>` + 
                    histCell.substring(insertPos);
          cells[3] = histCell;
          
          // Reconstruir linha
          let cellIdx = 0;
          line = line.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
          
          docContent = docContent.substring(0, lineStart) + line + docContent.substring(lineEnd + 7);
          console.log(`PCB Teor = ${formData.pcbTeor}`);
        }
      }
    }
  }
  
  // Diagnóstico PCB - encontrar "DIAGNÓSTICO|CONCLUSÃO:" na seção PCB
  if (formData.pcbDiagnostico) {
    const fallStart = docContent.indexOf('FURFURALDEIDO');
    const diagLabel = 'DIAGNÓSTICO|CONCLUSÃO:';
    
    // Encontrar o DIAGNÓSTICO entre PCB e FALL
    let diagIdx = docContent.indexOf(diagLabel, cloradoIdx);
    
    if (diagIdx !== -1 && (fallStart === -1 || diagIdx < fallStart)) {
      const afterDiag = docContent.substring(diagIdx);
      const cellEnd = afterDiag.indexOf('</w:tc>');
      
      if (cellEnd !== -1) {
        let cellContent = afterDiag.substring(0, cellEnd + 7);
        
        // Inserir após o label na mesma célula
        const insertPos = cellContent.lastIndexOf('</w:p>');
        if (insertPos !== -1) {
          cellContent = cellContent.substring(0, insertPos) + 
                       `<w:r><w:t> ${escapeXml(formData.pcbDiagnostico)}</w:t></w:r>` + 
                       cellContent.substring(insertPos);
          
          docContent = docContent.substring(0, diagIdx) + cellContent + docContent.substring(diagIdx + cellEnd + 7);
          console.log(`PCB Diagnóstico = ${formData.pcbDiagnostico}`);
        }
      }
    }
  }
  
  return docContent;
}

// ============================================
// PÁGINA 4: ANÁLISE FURFURALDEÍDO (2FALL)
// ============================================

function processFurfuraldeido(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  const sectionStart = docContent.indexOf('FURFURALDEIDO');
  if (sectionStart === -1) return docContent;
  
  // Compostos - cada um tem uma linha com: Nome | Unidade | Método | Histórico (célula 3) | ... | Referência
  const compostos: [string, string][] = [
    ['5HMF', formData.fall5HMF || ''],
    ['2FOL', formData.fall2FOL || ''],
    ['2FAL', formData.fall2FAL || ''],
    ['2ACF', formData.fall2ACF || ''],
    ['5MEF', formData.fall5MEF || ''],
    ['GP', formData.fallGP || ''],
  ];
  
  for (const [code, value] of compostos) {
    if (!value) continue;
    
    // Encontrar a linha do composto
    const codeIdx = docContent.indexOf(code, sectionStart);
    if (codeIdx === -1) continue;
    
    // Encontrar a linha completa
    const lineStart = docContent.lastIndexOf('<w:tr', codeIdx);
    const lineEnd = docContent.indexOf('</w:tr>', codeIdx);
    if (lineStart === -1 || lineEnd === -1) continue;
    
    let line = docContent.substring(lineStart, lineEnd + 7);
    
    // Encontrar células - estrutura: Label | Unidade | Método | Histórico (3) | ... | Referência
    const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
    if (!cells || cells.length < 4) continue;
    
    // Célula 3 é o histórico
    let histCell = cells[3];
    const insertPos = histCell.lastIndexOf('</w:p>');
    if (insertPos !== -1) {
      histCell = histCell.substring(0, insertPos) + 
                `<w:r><w:t>${escapeXml(value)}</w:t></w:r>` + 
                histCell.substring(insertPos);
      cells[3] = histCell;
      
      // Reconstruir linha
      let cellIdx = 0;
      line = line.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
      
      docContent = docContent.substring(0, lineStart) + line + docContent.substring(lineEnd + 7);
      console.log(`FALL ${code} = ${value}`);
    }
  }
  
  // Diagnóstico FALL - encontrar o último "DIAGNÓSTICO|CONCLUSÃO:"
  if (formData.fallDiagnostico) {
    const diagLabel = 'DIAGNÓSTICO|CONCLUSÃO:';
    const diagIdx = docContent.lastIndexOf(diagLabel);
    
    if (diagIdx !== -1 && diagIdx > sectionStart) {
      const afterDiag = docContent.substring(diagIdx);
      const cellEnd = afterDiag.indexOf('</w:tc>');
      
      if (cellEnd !== -1) {
        let cellContent = afterDiag.substring(0, cellEnd + 7);
        
        const insertPos = cellContent.lastIndexOf('</w:p>');
        if (insertPos !== -1) {
          cellContent = cellContent.substring(0, insertPos) + 
                       `<w:r><w:t> ${escapeXml(formData.fallDiagnostico)}</w:t></w:r>` + 
                       cellContent.substring(insertPos);
          
          docContent = docContent.substring(0, diagIdx) + cellContent + docContent.substring(diagIdx + cellEnd + 7);
          console.log(`FALL Diagnóstico = ${formData.fallDiagnostico}`);
        }
      }
    }
  }
  
  // Próxima Amostragem FALL - está na mesma célula que DIAGNÓSTICO|CONCLUSÃO
  // Formato: "DIAGNÓSTICO|CONCLUSÃO: ... Próxima Amostragem: 12 MESES"
  if (formData.fallProximaAmostragem) {
    // Encontrar "Próxima" na seção FALL
    const proxIdx = docContent.indexOf('Próxima', sectionStart);
    
    if (proxIdx !== -1) {
      // Encontrar "MESES" após "Próxima"
      const mesesIdx = docContent.indexOf('MESES', proxIdx);
      
      if (mesesIdx !== -1) {
        // Encontrar o "12" entre Próxima e MESES
        const between = docContent.substring(proxIdx, mesesIdx);
        const num12Idx = between.lastIndexOf('12');
        
        if (num12Idx !== -1) {
          // Substituir "12 MESES" pelo valor
          const absoluteStart = proxIdx + num12Idx;
          const absoluteEnd = mesesIdx + 'MESES'.length;
          
          docContent = docContent.substring(0, absoluteStart) + 
                      escapeXml(formData.fallProximaAmostragem) + 
                      docContent.substring(absoluteEnd);
          console.log(`FALL Próxima Amostragem = ${formData.fallProximaAmostragem}`);
        }
      }
    }
  }
  
  return docContent;
}


// ============================================
// STATUS DAS SEÇÕES (CORES)
// ============================================

function processStatusColors(docContent: string, formData: Record<string, any>): string {
  if (!formData) return docContent;
  
  // Cores disponíveis
  const colors: Record<string, string> = {
    'verde': '00B050',
    'green': '00B050',
    'amarelo': 'FFC000',
    'yellow': 'FFC000',
    'vermelho': 'FF0000',
    'red': 'FF0000',
  };
  
  // Cores originais do template (verde)
  const originalColors = ['00B050', '00AF50'];
  
  // Seções e seus status
  const statusFields: [string, string, string][] = [
    ['FÍSICO-', 'fqStatus', 'FQ'],
    ['CROMATOGRAFIA', 'crStatus', 'CR'],
    ['PCB', 'pcbStatus', 'PCB'],
    ['FURFURALDEIDO', 'fallStatus', 'FALL'],
  ];
  
  for (const [sectionMarker, fieldName, logName] of statusFields) {
    const statusValue = formData[fieldName];
    if (!statusValue) continue;
    
    const newColor = colors[statusValue.toLowerCase()];
    if (!newColor) continue;
    
    // Encontrar a seção
    const sectionIdx = docContent.indexOf(sectionMarker);
    if (sectionIdx === -1) continue;
    
    // Encontrar a linha com STATUS
    const statusIdx = docContent.indexOf('STATUS', sectionIdx);
    if (statusIdx === -1) continue;
    
    // Limitar busca à linha atual
    const lineStart = docContent.lastIndexOf('<w:tr', statusIdx);
    const lineEnd = docContent.indexOf('</w:tr>', statusIdx);
    if (lineStart === -1 || lineEnd === -1) continue;
    
    let line = docContent.substring(lineStart, lineEnd + 7);
    
    // Substituir as cores originais pela nova cor
    let modified = false;
    for (const origColor of originalColors) {
      if (line.includes(origColor)) {
        line = line.replace(new RegExp(origColor, 'gi'), newColor);
        modified = true;
      }
    }
    
    if (modified) {
      docContent = docContent.substring(0, lineStart) + line + docContent.substring(lineEnd + 7);
      console.log(`Status ${logName} = ${statusValue} (${newColor})`);
    }
  }
  
  return docContent;
}


// ============================================
// LABELS PARA CHECKBOXES
// ============================================

function getLabelsToMark(equipmentType: string, formData: Record<string, any>): string[] {
  const labels: string[] = [];

  if (equipmentType === 'transformador') {
    // TIPO: A seco / A óleo
    if (formData.tipoTransformador === 'a_seco') labels.push('A seco');
    if (formData.tipoTransformador === 'a_oleo') labels.push('A óleo');
    
    // NÚMERO DA COLETA: FQ, CR, PCB, 2 FALL
    if (formData.coletaFQ) labels.push('FQ');
    if (formData.coletaCR) labels.push('CR');
    if (formData.coletaPCB) labels.push('PCB');
    if (formData.coleta2FALL) labels.push('2 FALL');
    
    // REGISTRO: SUPERIOR / INFERIOR
    if (formData.registroSuperior) labels.push('SUPERIOR');
    if (formData.registroInferior) labels.push('INFERIOR');
    
    // TIPO DE FLUIDOS ISOLANTES
    // Labels fragmentados no template - usar parte única que está perto do checkbox
    if (formData.tipoOleoA) labels.push('TIPO A');
    if (formData.tipoOleoB) labels.push('TIPO B');
    if (formData.tipoOleoC) labels.push('TIPO C');
    if (formData.tipoOleoVegetal) labels.push('Óleo Vegetal');
    if (formData.tipoOleoSilicone) labels.push('Óleo Silicone');
    
    // SERVIÇOS EXECUTADOS
    // Labels exatos do template
    if (formData.servicoColetaOleo) labels.push('Coleta de óleo');
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
    if (formData.servicoRetiradaVazamento) labels.push('Retirada de vazamento');
    if (formData.servicoTrocaComponentes) labels.push('Troca de componentes');
    if (formData.servicoInspecoesGerais) labels.push('Inspeções gerais');
    if (formData.servicoEnsaiosEletricos) labels.push('Ensaios elétricos');
    if (formData.servicoRetiradaOficina) labels.push('Retirada do equipamento');
    if (formData.servicoTratamentoTermoVacuo) labels.push('Tratamento termo');
    if (formData.servicoComplementoNivelOleo) labels.push('Complemento de nível');
    if (formData.servicoSubstituicaoOleo) labels.push('Substituição de óleo');
  }

  if (equipmentType === 'disjuntor') {
    if (formData.tipoDisjuntor === 'oleo') labels.push('Óleo');
    if (formData.tipoDisjuntor === 'sf6') labels.push('SF6');
    if (formData.tipoDisjuntor === 'vacuo') labels.push('Vácuo');
    if (formData.tipoAcionamento === 'mola') labels.push('Mola');
    if (formData.tipoAcionamento === 'pneumatico') labels.push('Pneumático');
    if (formData.tipoAcionamento === 'hidraulico') labels.push('Hidráulico');
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
    if (formData.servicoLubrificacao) labels.push('Lubrificação');
    if (formData.servicoEnsaiosEletricos) labels.push('Ensaios elétricos');
  }

  if (equipmentType === 'chave_seccionadora') {
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
    if (formData.servicoLubrificacao) labels.push('Lubrificação');
  }

  if (equipmentType === 'chave_religadora' || equipmentType === 'painel_religador') {
    if (formData.tipoReligador === 'oleo') labels.push('Óleo');
    if (formData.tipoReligador === 'sf6') labels.push('SF6');
    if (formData.tipoReligador === 'vacuo') labels.push('Vácuo');
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
  }

  if (equipmentType === 'transformador_instrumento') {
    if (formData.tipoInstrumento === 'tc') labels.push('TC');
    if (formData.tipoInstrumento === 'tp') labels.push('TP');
    if (formData.tipoIsolamento === 'oleo') labels.push('Óleo');
    if (formData.tipoIsolamento === 'resina') labels.push('Resina');
    if (formData.tipoIsolamento === 'sf6') labels.push('SF6');
  }

  if (equipmentType === 'retificador_bateria') {
    if (formData.tipoBateria === 'chumbo_acido') labels.push('Chumbo');
    if (formData.tipoBateria === 'vrla') labels.push('VRLA');
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
  }

  if (equipmentType === 'banco_capacitores') {
    if (formData.tipoCapacitor === 'fixo') labels.push('Fixo');
    if (formData.tipoCapacitor === 'automatico') labels.push('Automático');
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
  }

  if (equipmentType === 'para_raio') {
    if (formData.tipoParaRaio === 'oxido_zinco') labels.push('Óxido de zinco');
    if (formData.servicoLimpezaGeral) labels.push('Limpeza geral');
  }

  if (equipmentType === 'cabos') {
    if (formData.tipoIsolamento === 'xlpe') labels.push('XLPE');
    if (formData.tipoIsolamento === 'epr') labels.push('EPR');
    if (formData.tipoIsolamento === 'pvc') labels.push('PVC');
  }

  if (equipmentType === 'rele_protecao') {
    if (formData.tipoRele === 'digital') labels.push('Digital');
    if (formData.tipoRele === 'numerico') labels.push('Numérico');
  }

  return labels;
}

// ============================================
// FOTOS - ÚLTIMA PÁGINA
// ============================================

async function processPhotos(
  zip: PizZip,
  docContent: string,
  photos: TecnicoPhoto[]
): Promise<{ zip: PizZip; docContent: string }> {
  if (!photos || photos.length === 0) {
    return { zip, docContent };
  }

  console.log(`Processing ${photos.length} photos...`);

  // Encontrar a última página (antes de </w:body>)
  const bodyEndPos = docContent.lastIndexOf('</w:body>');
  if (bodyEndPos === -1) {
    console.error('Could not find </w:body>');
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

      console.log(`Added photo ${i + 1}: ${photo.name}`);
    } catch (error) {
      console.error(`Error processing photo ${i + 1}:`, error);
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

  return { zip, docContent };
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
