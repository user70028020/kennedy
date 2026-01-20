import PizZip from 'pizzip';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FotograficoPhoto {
  id: string;
  data: string;
  name: string;
  description?: string;
}

export interface FotograficoData {
  osNumber: string;
  reportDate: string;
  clientName: string;
  location?: string;
  equipmentType?: string;
  serialNumber?: string;
  responsible?: string;
  observations?: string;
  photos: FotograficoPhoto[];
}

// Equipment type labels for display
const EQUIPMENT_LABELS: Record<string, string> = {
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
  'spda': 'SPDA'
};

export function getFotograficoTemplatePath(template: 'nx_energy' | 'sercamp'): string {
  const templatesDir = path.join(__dirname, '../../templates');
  const templateFile = template === 'nx_energy' ? 'relatorionx.docx' : 'relatoriosercamp.docx';
  return path.join(templatesDir, templateFile);
}

export async function generateFotograficoReport(
  template: 'nx_energy' | 'sercamp',
  data: FotograficoData
): Promise<Buffer> {
  const templatePath = getFotograficoTemplatePath(template);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template não encontrado: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath);
  const zip = new PizZip(content);

  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid DOCX: document.xml not found');
  }

  let docContent = docXmlFile.asText();

  const formattedDate = data.reportDate 
    ? new Date(data.reportDate).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  // Get equipment label
  const equipmentLabel = data.equipmentType 
    ? (EQUIPMENT_LABELS[data.equipmentType] || data.equipmentType)
    : '';

  console.log('=== Fotografico Report Generation ===');
  console.log('Template:', template);
  console.log('OS:', data.osNumber);
  console.log('Client:', data.clientName);
  console.log('Equipment:', equipmentLabel);
  console.log('Photos count:', data.photos.length);

  // Add photos to zip and get relationship IDs
  const photoRids = addPhotosToZip(zip, data.photos);
  console.log('Photo RIDs:', photoRids);

  // Inject text data into the document
  docContent = injectTextData(docContent, {
    'ORDEM DE SERVIÇO:': data.osNumber || '',
    'DATA:': formattedDate,
    'CLIENTE:': data.clientName || '',
    'LOCAL:': data.location || '',
    'EQUIPAMENTO:': equipmentLabel,
    'Nº SÉRIE:': data.serialNumber || '',
    'RESPONSÁVEL:': data.responsible || '',
  });

  // Inject observations
  docContent = injectObservations(docContent, data.observations || '');

  // Replace the photo table with actual photos
  docContent = replacePhotoTable(docContent, data.photos, photoRids);

  zip.file('word/document.xml', docContent);
  ensureContentTypes(zip);

  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function addPhotosToZip(zip: PizZip, photos: FotograficoPhoto[]): string[] {
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (!relsFile) throw new Error('Invalid DOCX: document.xml.rels not found');
  
  let relsContent = relsFile.asText();
  const rids: string[] = [];
  
  // Find highest existing rId
  const ridMatches = relsContent.match(/Id="rId(\d+)"/g) || [];
  let maxRid = 0;
  ridMatches.forEach(match => {
    const num = parseInt(match.match(/\d+/)?.[0] || '0');
    if (num > maxRid) maxRid = num;
  });
  
  let nextRid = maxRid + 1;
  
  photos.forEach((photo, index) => {
    let extension = 'png';
    if (photo.data.includes('data:image/jpeg') || photo.data.includes('data:image/jpg')) {
      extension = 'jpeg';
    }
    
    const imageFileName = `foto_${index + 1}.${extension}`;
    const rid = `rId${nextRid}`;
    rids.push(rid);
    
    const base64Data = photo.data.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    zip.file(`word/media/${imageFileName}`, imageBuffer);
    
    const relEntry = `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imageFileName}"/>`;
    relsContent = relsContent.replace('</Relationships>', `${relEntry}</Relationships>`);
    
    nextRid++;
  });
  
  zip.file('word/_rels/document.xml.rels', relsContent);
  return rids;
}


/**
 * Inject text data into the document by finding label cells and filling the adjacent value cells
 * The template structure has labels like "ORDEM DE SERVIÇO:" in one cell and empty <w:p> in the next cell
 * Pattern: <w:t>LABEL:</w:t></w:r></w:p></w:tc><w:tc><w:tcPr>...</w:tcPr><w:p .../></w:tc>
 */
function injectTextData(docContent: string, fieldMap: Record<string, string>): string {
  let result = docContent;
  
  for (const [label, value] of Object.entries(fieldMap)) {
    // Escape special XML characters in the value
    const escapedValue = escapeXml(value || '');
    
    // Escape special regex characters in the label
    const labelEscaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Pattern: find label, then the next cell's tcPr, then the empty paragraph
    // The empty paragraph is self-closing: <w:p w14:paraId="..." ... />
    const regex = new RegExp(
      `(<w:t>${labelEscaped}</w:t></w:r></w:p></w:tc><w:tc><w:tcPr>` +
      `[^<]*(?:<(?!\/w:tcPr>)[^<]*)*` +  // Match anything inside tcPr
      `</w:tcPr>)` +
      `(<w:p[^>]*(?:\/>|><\/w:p>))`,  // Match self-closing or empty paragraph
      's'
    );
    
    result = result.replace(regex, (match, prefix, emptyP) => {
      // Extract the paragraph attributes if present
      const paraIdMatch = emptyP.match(/w14:paraId="([^"]+)"/);
      const textIdMatch = emptyP.match(/w14:textId="([^"]+)"/);
      const rsidRMatch = emptyP.match(/w:rsidR="([^"]+)"/);
      const rsidDefaultMatch = emptyP.match(/w:rsidRDefault="([^"]+)"/);
      
      let attrs = '';
      if (paraIdMatch) attrs += ` w14:paraId="${paraIdMatch[1]}"`;
      if (textIdMatch) attrs += ` w14:textId="${textIdMatch[1]}"`;
      if (rsidRMatch) attrs += ` w:rsidR="${rsidRMatch[1]}"`;
      if (rsidDefaultMatch) attrs += ` w:rsidRDefault="${rsidDefaultMatch[1]}"`;
      
      // Create a new paragraph with the value
      const newParagraph = `<w:p${attrs}><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapedValue}</w:t></w:r></w:p>`;
      
      console.log(`Injected "${label}" -> "${value}"`);
      return prefix + newParagraph;
    });
  }
  
  return result;
}

/**
 * Inject observations text into the observations section
 * The OBSERVAÇÕES table has a header row with "OBSERVAÇÕES" and a content row with empty paragraph
 */
function injectObservations(docContent: string, observations: string): string {
  const escapedObs = escapeXml(observations || '');
  
  // Find the OBSERVAÇÕES section - it's a table with header "OBSERVAÇÕES" followed by a row with empty content
  // Pattern: </w:tr> after OBSERVAÇÕES, then <w:tr>...<w:tc>...<w:tcPr>...</w:tcPr><w:p .../>
  const regex = /(<w:t>OBSERVAÇÕES<\/w:t>.*?<\/w:tr>\s*<w:tr[^>]*>.*?<w:tc>\s*<w:tcPr>[^<]*(?:<(?!\/w:tcPr>)[^<]*)*<\/w:tcPr>)(<w:p[^>]*(?:\/>|><\/w:p>))/s;
  
  return docContent.replace(regex, (match, prefix, emptyP) => {
    // Extract the paragraph attributes if present
    const paraIdMatch = emptyP.match(/w14:paraId="([^"]+)"/);
    const textIdMatch = emptyP.match(/w14:textId="([^"]+)"/);
    const rsidRMatch = emptyP.match(/w:rsidR="([^"]+)"/);
    const rsidDefaultMatch = emptyP.match(/w:rsidRDefault="([^"]+)"/);
    
    let attrs = '';
    if (paraIdMatch) attrs += ` w14:paraId="${paraIdMatch[1]}"`;
    if (textIdMatch) attrs += ` w14:textId="${textIdMatch[1]}"`;
    if (rsidRMatch) attrs += ` w:rsidR="${rsidRMatch[1]}"`;
    if (rsidDefaultMatch) attrs += ` w:rsidRDefault="${rsidDefaultMatch[1]}"`;
    
    const newParagraph = `<w:p${attrs}><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>${escapedObs}</w:t></w:r></w:p>`;
    
    console.log('Injected observations');
    return prefix + newParagraph;
  });
}

/**
 * Replace the photo table placeholder with actual photo rows
 * The template has a table after "REGISTRO FOTOGRÁFICO" with 2 columns (gridCol 5548 each)
 * and trHeight 2500, tcW 2500 pct
 */
function replacePhotoTable(docContent: string, photos: FotograficoPhoto[], rids: string[]): string {
  if (photos.length === 0 || rids.length === 0) return docContent;
  
  // Find the photo table - it comes after "REGISTRO FOTOGRÁFICO" header
  // It has 2 gridCol elements and trHeight 2500
  const photoTableRegex = /(<w:tbl><w:tblPr>.*?<\/w:tblPr><w:tblGrid><w:gridCol w:w="5548"\/><w:gridCol w:w="5548"\/><\/w:tblGrid>)<w:tr[^>]*>.*?<w:trHeight w:val="2500"\/>.*?<\/w:tbl>/s;
  
  return docContent.replace(photoTableRegex, (match, tblStart) => {
    console.log('Found photo table, replacing with', photos.length, 'photos');
    
    // Build new table with photo rows
    let newTable = tblStart;
    
    // Add photos in pairs (2 per row)
    for (let i = 0; i < photos.length; i += 2) {
      const photo1 = photos[i];
      const rid1 = rids[i];
      const photo2 = photos[i + 1];
      const rid2 = rids[i + 1];
      
      newTable += createPhotoRow(photo1, rid1, photo2, rid2);
    }
    
    newTable += '</w:tbl>';
    return newTable;
  });
}

/**
 * Create a table row with 1 or 2 photos
 */
function createPhotoRow(photo1: FotograficoPhoto, rid1: string, photo2?: FotograficoPhoto, rid2?: string): string {
  const cellStyle = `<w:tcPr><w:tcW w:w="2500" w:type="pct"/><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tcBorders><w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>`;
  
  let row = '<w:tr><w:trPr><w:trHeight w:val="3500"/></w:trPr>';
  
  // First cell with photo
  row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${createImageDrawing(rid1)}</w:p>`;
  // Add description if present
  if (photo1.description) {
    row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(photo1.description)}</w:t></w:r></w:p>`;
  }
  row += '</w:tc>';
  
  // Second cell (with photo or empty)
  if (photo2 && rid2) {
    row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${createImageDrawing(rid2)}</w:p>`;
    if (photo2.description) {
      row += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>${escapeXml(photo2.description)}</w:t></w:r></w:p>`;
    }
    row += '</w:tc>';
  } else {
    // Empty cell
    row += `<w:tc>${cellStyle}<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p></w:tc>`;
  }
  
  row += '</w:tr>';
  return row;
}

/**
 * Create the drawing XML for an inline image
 */
function createImageDrawing(rid: string): string {
  // Image size: ~7cm x 5cm (2500000 x 1800000 EMUs)
  const cx = 2700000; // width in EMUs
  const cy = 2000000; // height in EMUs
  
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${Math.floor(Math.random() * 100000)}" name="Foto"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
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
 * Ensure content types include image types
 */
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
