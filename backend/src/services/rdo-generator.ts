// RDO Generator - Programmatic DOCX generation (based on working Next.js implementation)
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, VerticalAlign, ImageRun, ShadingType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { RDOMontagemData } from '../types/rdo-montagem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_FONT = 'Poppins';
const HEADER_GRAY = 'D0D0D0';
const CELL_MARGIN = 25;
const LINE_SPACING_EXACT = 160;
const DEFAULT_FONT_SIZE = 16;
const TITLE_FONT_SIZE = 18;

function getTableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
  };
}

function createCell(
  text: string,
  options?: {
    width?: any;
    bold?: boolean;
    alignment?: any;
    shading?: string;
    fontSize?: number;
    verticalAlign?: any;
    colSpan?: number;
    color?: any;
  }
): TableCell {
  const opts = options || {};
  return new TableCell({
    width: opts.width || { size: 100, type: WidthType.AUTO },
    columnSpan: opts.colSpan,
    verticalAlign: opts.verticalAlign || VerticalAlign.CENTER,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: {
      top: CELL_MARGIN,
      bottom: CELL_MARGIN,
      left: CELL_MARGIN,
      right: CELL_MARGIN,
    },
    children: [
      new Paragraph({
        alignment: opts.alignment || AlignmentType.LEFT,
        spacing: { line: LINE_SPACING_EXACT, lineRule: 'exact' as any },
        children: [
          new TextRun({
            text: text,
            font: DEFAULT_FONT,
            size: opts.fontSize || DEFAULT_FONT_SIZE,
            bold: opts.bold || false,
            color: opts.color,
          }),
        ],
      }),
    ],
  });
}

function base64ToUint8Array(base64String: string): Uint8Array | null {
  if (!base64String) return null;
  try {
    const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
    const binaryString = Buffer.from(base64Data, 'base64').toString('binary');
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.error('Error converting base64:', err);
    return null;
  }
}

async function loadLogo(template: string): Promise<Uint8Array | null> {
  try {
    const logoPath = template === 'nx-energy' 
      ? path.join(__dirname, '../../static/nx-energy-logo.png')
      : path.join(__dirname, '../../static/sercamp-logo.png');
    
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
    return null;
  } catch (e) {
    console.error('Error loading logo:', e);
    return null;
  }
}

async function loadSergioLimaSignature(): Promise<Uint8Array | null> {
  try {
    const signaturePath = path.join(__dirname, '../../static/assinatura-sergio-lima-new.png');
    
    if (fs.existsSync(signaturePath)) {
      return fs.readFileSync(signaturePath);
    }
    console.warn('Assinatura Sérgio Lima não encontrada:', signaturePath);
    return null;
  } catch (e) {
    console.error('Error loading Sérgio Lima signature:', e);
    return null;
  }
}

async function createHeaderSection(data: RDOMontagemData): Promise<Table> {
  const isNxEnergy = data.template === 'nx-energy';
  const logoImage = await loadLogo(data.template);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: getTableBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            rowSpan: 3,
            verticalAlign: VerticalAlign.CENTER,
            borders: getTableBorders(),
            children: logoImage
              ? [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: logoImage,
                        transformation: isNxEnergy ? { width: 130, height: 40 } : { width: 120, height: 50 },
                      }),
                    ],
                  }),
                ]
              : [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: isNxEnergy ? 'NX ENERGY' : 'SERCAMP',
                        bold: true,
                        size: 28,
                        font: DEFAULT_FONT,
                      }),
                    ],
                  }),
                ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            rowSpan: 3,
            verticalAlign: VerticalAlign.CENTER,
            shading: { color: HEADER_GRAY, type: ShadingType.SOLID, fill: HEADER_GRAY },
            borders: getTableBorders(),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'DIÁRIO DE OBRA', bold: true, size: 36, font: DEFAULT_FONT })],
              }),
            ],
          }),
          createCell('Número:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.numeroOS || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Data:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.data || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Projeto:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.projeto || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
    ],
  });
}

function createClientInfoSection(data: RDOMontagemData): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: getTableBorders(),
    rows: [
      new TableRow({
        children: [
          createCell('Cliente:', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.cliente || '', {
            width: { size: 35, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Cidade:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.cidade || '', {
            width: { size: 20, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Nome da subestação:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: 14,
          }),
          createCell(data.nomeSubestacao || '', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            fontSize: 14,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Natureza do serviço:', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.naturezaServico || '', {
            width: { size: 85, type: WidthType.PERCENTAGE as any },
            colSpan: 5,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Características do equipamento:', {
            width: { size: 30, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.caracteristicasEquipamento || '', {
            width: { size: 70, type: WidthType.PERCENTAGE as any },
            colSpan: 4,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Número Serie:', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.numeroSerie || '', {
            width: { size: 85, type: WidthType.PERCENTAGE as any },
            colSpan: 5,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
    ],
  });
}

function createEquipeSection(data: RDOMontagemData): Table {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        createCell('Equipe de trabalho', {
          width: { size: 40, type: WidthType.PERCENTAGE as any },
          bold: true,
          shading: HEADER_GRAY,
          alignment: AlignmentType.CENTER as any,
          fontSize: DEFAULT_FONT_SIZE,
        }),
        createCell('Empresa', {
          width: { size: 30, type: WidthType.PERCENTAGE as any },
          bold: true,
          shading: HEADER_GRAY,
          alignment: AlignmentType.CENTER as any,
          fontSize: DEFAULT_FONT_SIZE,
        }),
        createCell('Assinatura', {
          width: { size: 30, type: WidthType.PERCENTAGE as any },
          bold: true,
          shading: HEADER_GRAY,
          alignment: AlignmentType.CENTER as any,
          fontSize: DEFAULT_FONT_SIZE,
        }),
      ],
    }),
  ];

  const participantes = data.participantes && data.participantes.length > 0 ? data.participantes : [];
  const minRows = Math.max(4, participantes.length);

  for (let i = 0; i < minRows; i++) {
    const p = participantes[i];
    const vistoBytes = p?.visto && p.visto !== 'data:,' ? base64ToUint8Array(p.visto) : null;

    rows.push(
      new TableRow({
        children: [
          createCell(p?.nome || '', {
            width: { size: 40, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(p?.empresa || '', {
            width: { size: 30, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          vistoBytes
            ? new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: getTableBorders(),
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({ data: vistoBytes, transformation: { width: 60, height: 20 } }),
                    ],
                  }),
                ],
              })
            : createCell('', { width: { size: 30, type: WidthType.PERCENTAGE as any }, fontSize: DEFAULT_FONT_SIZE }),
        ],
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: getTableBorders(),
    rows: rows,
  });
}

function createJornadaTrabalhoSection(data: RDOMontagemData): Table {
  const horas = data.horasTrabalho || {
    horarioNormalInicio: '',
    horarioNormalTermino: '',
    liberacaoHorasExtras: '',
    horasExtrasInicio: '',
    horasExtrasTermino: '',
    autorizadoPor: '',
    horasDeslocamentoInicio: '',
    horasDeslocamentoTermino: '',
    horasDeslocamentoTotal: '',
    horasTrabalhadasCliente: '',
    horarioAlmocoInicio: '',
    horarioAlmocoTermino: '',
    horarioAlmoco: '',
    horasJantarInicio: '',
    horasJantarTermino: '',
    horasJantar: '',
    horasDeslocamentoRetornoInicio: '',
    horasDeslocamentoRetornoTermino: '',
    horasDeslocamentoRetorno: '',
    horasDisposicaoInicio: '',
    horasDisposicaoTermino: '',
    horasDisposicao: '',
    horasTotaisTrabalhadas: '',
  };

  const checkboxSim =
    horas.liberacaoHorasExtras === 'sim'
      ? '☑ Sim  ☐ Não'
      : horas.liberacaoHorasExtras === 'nao'
        ? '☐ Sim  ☑ Não'
        : '☐ Sim  ☐ Não';

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: getTableBorders(),
    rows: [
      new TableRow({
        children: [
          createCell('RESUMO DA JORNADA DE TRABALHO', {
            bold: true,
            shading: HEADER_GRAY,
            alignment: AlignmentType.CENTER as any,
            colSpan: 6,
            fontSize: TITLE_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Horario normal de trabalho:', {
            width: { size: 35, type: WidthType.PERCENTAGE as any },
            bold: true,
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Início:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horarioNormalInicio || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Término:', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horarioNormalTermino || '', {
            width: { size: 20, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Liberação de horas extras:', {
            width: { size: 25, type: WidthType.PERCENTAGE as any },
            bold: true,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(checkboxSim, {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Início:', {
            width: { size: 5, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horasExtrasInicio || '', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Término:', {
            width: { size: 5, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horasExtrasTermino || '', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Autorizado por:', {
            width: { size: 20, type: WidthType.PERCENTAGE as any },
            bold: true,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.autorizadoPor || '', {
            width: { size: 80, type: WidthType.PERCENTAGE as any },
            colSpan: 5,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('', { width: { size: 40, type: WidthType.PERCENTAGE as any }, colSpan: 2 }),
          createCell('Início:', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Término:', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Total:', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            alignment: AlignmentType.CENTER as any,
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Horas trabalhadas no cliente:', {
            width: { size: 40, type: WidthType.PERCENTAGE as any },
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horasTrabalhadasCliente, {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Horário de almoço:', {
            width: { size: 40, type: WidthType.PERCENTAGE as any },
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horarioAlmocoInicio || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horarioAlmocoTermino || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(horas.horarioAlmoco || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Horas Totais Trabalhadas:', {
            width: { size: 40, type: WidthType.PERCENTAGE as any },
            bold: true,
            color: 'FF0000',
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('', { width: { size: 15, type: WidthType.PERCENTAGE as any }, fontSize: DEFAULT_FONT_SIZE }),
          createCell('', { width: { size: 15, type: WidthType.PERCENTAGE as any }, fontSize: DEFAULT_FONT_SIZE }),
          createCell(horas.horasTotaisTrabalhadas || '', {
            width: { size: 15, type: WidthType.PERCENTAGE as any },
            bold: true,
            color: 'FF0000',
            alignment: AlignmentType.CENTER as any,
            colSpan: 2,
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      }),
    ],
  });
}

function createAtividadesSection(data: RDOMontagemData): Table {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        createCell('RELAÇÃO DE ATIVIDADES EXECUTADAS', {
          bold: true,
          shading: HEADER_GRAY,
          alignment: AlignmentType.CENTER as any,
          colSpan: 2,
          fontSize: TITLE_FONT_SIZE,
        }),
      ],
    }),
    new TableRow({
      children: [
        createCell('Item', {
          width: { size: 10, type: WidthType.PERCENTAGE as any },
          bold: true,
          shading: HEADER_GRAY,
          alignment: AlignmentType.CENTER as any,
          fontSize: DEFAULT_FONT_SIZE,
        }),
        createCell('Descrição', {
          width: { size: 90, type: WidthType.PERCENTAGE as any },
          bold: true,
          shading: HEADER_GRAY,
          alignment: AlignmentType.CENTER as any,
          fontSize: DEFAULT_FONT_SIZE,
        }),
      ],
    }),
  ];

  const atividades = data.atividadesExecutadas || [];
  const minRows = Math.max(5, atividades.length);

  for (let i = 0; i < minRows; i++) {
    const atividade = atividades[i];
    rows.push(
      new TableRow({
        children: [
          createCell(atividade?.item || String(i + 1), {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(atividade?.descricao || '', {
            width: { size: 90, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
        ],
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: getTableBorders(),
    rows: rows,
  });
}

function createRepresentantesSection(data: RDOMontagemData): Table {
  const sercampSigBytes = data.representanteSercampAssinatura
    ? base64ToUint8Array(data.representanteSercampAssinatura)
    : null;
  const clienteSigBytes = data.representanteClienteAssinatura
    ? base64ToUint8Array(data.representanteClienteAssinatura)
    : null;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: getTableBorders(),
    rows: [
      new TableRow({
        children: [
          createCell('Representante SERCAMP:', {
            width: { size: 25, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.representanteSercamp || '', {
            width: { size: 35, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Assinatura', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          sercampSigBytes
            ? new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: getTableBorders(),
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: sercampSigBytes,
                        transformation: { width: 80, height: 25 },
                      }),
                    ],
                  }),
                ],
              })
            : createCell('', { width: { size: 30, type: WidthType.PERCENTAGE as any }, fontSize: DEFAULT_FONT_SIZE }),
        ],
      }),
      new TableRow({
        children: [
          createCell('Representante CLIENTE:', {
            width: { size: 25, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell(data.representanteCliente || '', {
            width: { size: 35, type: WidthType.PERCENTAGE as any },
            fontSize: DEFAULT_FONT_SIZE,
          }),
          createCell('Assinatura', {
            width: { size: 10, type: WidthType.PERCENTAGE as any },
            bold: true,
            shading: HEADER_GRAY,
            alignment: AlignmentType.CENTER as any,
            fontSize: DEFAULT_FONT_SIZE,
          }),
          clienteSigBytes
            ? new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
                borders: getTableBorders(),
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: clienteSigBytes,
                        transformation: { width: 80, height: 25 },
                      }),
                    ],
                  }),
                ],
              })
            : createCell('', { width: { size: 30, type: WidthType.PERCENTAGE as any }, fontSize: DEFAULT_FONT_SIZE }),
        ],
      }),
    ],
  });
}

export async function generateRDOReportFromTemplate(data: RDOMontagemData): Promise<Buffer> {
  console.log('=== RDO Report Generation (Programmatic DOCX) ===');
  console.log('Template:', data.template);
  console.log('OS:', data.numeroOS);
  console.log('Team members:', data.participantes?.length || 0);
  console.log('Activities:', data.atividadesExecutadas?.length || 0);

  // Carregar assinatura fixa do Sérgio Lima
  const sergioLimaSignature = await loadSergioLimaSignature();
  
  // Se não tiver assinatura do representante SERCAMP, usar a do Sérgio Lima
  if (!data.representanteSercampAssinatura && sergioLimaSignature) {
    // Converter Uint8Array para base64
    const base64Signature = `data:image/png;base64,${Buffer.from(sergioLimaSignature).toString('base64')}`;
    data.representanteSercampAssinatura = base64Signature;
    console.log('✅ Assinatura Sérgio Lima carregada automaticamente');
  }
  
  // Se não tiver nome do representante SERCAMP, usar "Sérgio Lima"
  if (!data.representanteSercamp) {
    data.representanteSercamp = 'Sérgio Lima';
  }

  const sections: any[] = [];

  // Header
  sections.push(await createHeaderSection(data));
  sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));

  // Client Info
  sections.push(createClientInfoSection(data));
  sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));

  // Team
  sections.push(createEquipeSection(data));
  sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));

  // Work Schedule
  sections.push(createJornadaTrabalhoSection(data));
  sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));

  // Activities
  sections.push(createAtividadesSection(data));
  sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));

  // Representatives
  sections.push(createRepresentantesSection(data));

  // Certificação de Horas
  if (data.certificacaoHorasAssinatura) {
    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    
    const certSigBytes = base64ToUint8Array(data.certificacaoHorasAssinatura);
    
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: getTableBorders(),
        rows: [
          new TableRow({
            children: [
              createCell('CERTIFICAÇÃO DE HORAS', {
                bold: true,
                shading: HEADER_GRAY,
                alignment: AlignmentType.CENTER as any,
                fontSize: TITLE_FONT_SIZE,
              }),
            ],
          }),
          new TableRow({
            children: [
              certSigBytes
                ? new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER,
                    borders: getTableBorders(),
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new ImageRun({
                            data: certSigBytes,
                            transformation: { width: 120, height: 40 },
                          }),
                        ],
                      }),
                    ],
                  })
                : createCell('', { fontSize: DEFAULT_FONT_SIZE }),
            ],
          }),
        ],
      })
    );
  }

  // Observations
  if (data.observacoes) {
    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: getTableBorders(),
        rows: [
          new TableRow({
            children: [
              createCell('OBSERVAÇÕES', {
                bold: true,
                shading: HEADER_GRAY,
                alignment: AlignmentType.CENTER as any,
                fontSize: TITLE_FONT_SIZE,
              }),
            ],
          }),
          new TableRow({
            children: [
              createCell(data.observacoes, {
                fontSize: DEFAULT_FONT_SIZE,
              }),
            ],
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  console.log('✅ RDO Generated size:', buffer.length, 'bytes');
  return buffer;
}
