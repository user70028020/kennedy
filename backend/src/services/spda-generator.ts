// SPDA Generator - Production Ready
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, VerticalAlign, ShadingType } from "docx";
import type { SPDAData, SPDAPoint } from "../types/spda.js";

const DEFAULT_FONT = "Calibri";
const HEADER_GRAY = "D0D0D0";

function getTableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
  };
}

function getStatusColor(status: string): string {
  const statusUpper = (status || "").toUpperCase();
  if (statusUpper === "APROVADO") return "00AF50";
  if (statusUpper === "REVISÃO" || statusUpper === "REVISAO") return "FFFF00";
  if (statusUpper === "REPROVADO") return "FF0000";
  return "FFFFFF";
}

function createCell(text: string, options?: any): TableCell {
  const opts = options || {};
  return new TableCell({
    width: opts.width || { size: 100, type: WidthType.AUTO },
    columnSpan: opts.colSpan,
    verticalAlign: opts.verticalAlign || VerticalAlign.CENTER,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    children: [
      new Paragraph({
        alignment: opts.alignment || AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text,
            font: DEFAULT_FONT,
            size: opts.fontSize || 16,
            bold: opts.bold || false,
            color: opts.color || "000000",
          }),
        ],
      }),
    ],
  });
}

export async function generateSPDAReport(data: SPDAData): Promise<Buffer> {
  console.log("📝 Gerando relatório SPDA...");
  
  const children: any[] = [];

  // 1. CABEÇALHO
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: getTableBorders(),
      rows: [
        new TableRow({
          children: [
            createCell("LOGO", { width: { size: 20, type: WidthType.PERCENTAGE }, alignment: AlignmentType.CENTER }),
            createCell("RELATÓRIO CAMPO SPDA", {
              width: { size: 80, type: WidthType.PERCENTAGE },
              bold: true,
              fontSize: 32,
              alignment: AlignmentType.CENTER,
              shading: HEADER_GRAY,
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

  // 2. SISTEMA SPDA + STATUS
  const statusColor = getStatusColor(data.status);
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: getTableBorders(),
      rows: [
        new TableRow({
          children: [
            createCell("SISTEMA SPDA", {
              width: { size: 80, type: WidthType.PERCENTAGE },
              bold: true,
              fontSize: 18,
              alignment: AlignmentType.CENTER,
              shading: HEADER_GRAY,
            }),
            createCell("STATUS", {
              width: { size: 15, type: WidthType.PERCENTAGE },
              bold: true,
              fontSize: 18,
              alignment: AlignmentType.CENTER,
              shading: HEADER_GRAY,
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: "" })],
              shading: { color: statusColor, type: ShadingType.SOLID, fill: statusColor },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "ORDEM DE SERVIÇO: ", bold: true, size: 16, font: DEFAULT_FONT }),
                    new TextRun({ text: data.ordem_servico, size: 16, font: DEFAULT_FONT }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "CLIENTE: ", bold: true, size: 16, font: DEFAULT_FONT }),
                    new TextRun({ text: data.cliente, size: 16, font: DEFAULT_FONT }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "DATA: ", bold: true, size: 16, font: DEFAULT_FONT }),
                    new TextRun({ text: data.data, size: 16, font: DEFAULT_FONT }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

  // 3. EQUIPE TÉCNICA
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: getTableBorders(),
      rows: [
        new TableRow({
          children: [
            createCell("EQUIPE TÉCNICA", {
              colSpan: 2,
              bold: true,
              fontSize: 18,
              alignment: AlignmentType.CENTER,
              shading: HEADER_GRAY,
            }),
          ],
        }),
        new TableRow({
          children: [
            createCell("Técnicos:", { width: { size: 20, type: WidthType.PERCENTAGE }, bold: true }),
            createCell(data.equipe_tecnica, { width: { size: 80, type: WidthType.PERCENTAGE } }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

  // 4. MEDIÇÕES DOS PONTOS
  const measurementRows: TableRow[] = [
    new TableRow({
      children: [
        createCell("MEDIÇÕES DOS PONTOS DE ATERRAMENTO", {
          colSpan: 6,
          bold: true,
          fontSize: 18,
          alignment: AlignmentType.CENTER,
          shading: HEADER_GRAY,
        }),
      ],
    }),
    new TableRow({
      children: [
        createCell("Nº", { width: { size: 8, type: WidthType.PERCENTAGE }, bold: true, alignment: AlignmentType.CENTER, shading: HEADER_GRAY }),
        createCell("Foto", { width: { size: 17, type: WidthType.PERCENTAGE }, bold: true, alignment: AlignmentType.CENTER, shading: HEADER_GRAY }),
        createCell("Valor (Ω)", { width: { size: 25, type: WidthType.PERCENTAGE }, bold: true, alignment: AlignmentType.CENTER, shading: HEADER_GRAY }),
        createCell("Nº", { width: { size: 8, type: WidthType.PERCENTAGE }, bold: true, alignment: AlignmentType.CENTER, shading: HEADER_GRAY }),
        createCell("Foto", { width: { size: 17, type: WidthType.PERCENTAGE }, bold: true, alignment: AlignmentType.CENTER, shading: HEADER_GRAY }),
        createCell("Valor (Ω)", { width: { size: 25, type: WidthType.PERCENTAGE }, bold: true, alignment: AlignmentType.CENTER, shading: HEADER_GRAY }),
      ],
    }),
  ];

  // Preencher 10 linhas (pontos 1-10 | pontos 11-20)
  for (let i = 0; i < 10; i++) {
    const leftPoint = data.pontos[i];
    const rightPoint = data.pontos[i + 10];

    measurementRows.push(
      new TableRow({
        children: [
          createCell(String(i + 1).padStart(2, "0"), { alignment: AlignmentType.CENTER }),
          createCell(leftPoint ? `Foto ${String(i + 1).padStart(2, "0")}` : "", { alignment: AlignmentType.CENTER }),
          createCell(leftPoint?.valor || "", { alignment: AlignmentType.CENTER }),
          createCell(String(i + 11).padStart(2, "0"), { alignment: AlignmentType.CENTER }),
          createCell(rightPoint ? `Foto ${String(i + 11).padStart(2, "0")}` : "", { alignment: AlignmentType.CENTER }),
          createCell(rightPoint?.valor || "", { alignment: AlignmentType.CENTER }),
        ],
      })
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: getTableBorders(),
      rows: measurementRows,
    })
  );

  children.push(new Paragraph({ text: "", spacing: { after: 100 } }));

  // 5. CONCLUSÃO
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: getTableBorders(),
      rows: [
        new TableRow({
          children: [
            createCell("CONCLUSÃO / OBSERVAÇÕES / RECOMENDAÇÕES", {
              bold: true,
              fontSize: 18,
              alignment: AlignmentType.CENTER,
              shading: HEADER_GRAY,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: data.conclusao_observacoes, size: 16, font: DEFAULT_FONT })],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Criar documento
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 400, bottom: 600, left: 500, right: 500 },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return Buffer.from(await blob.arrayBuffer());
}
