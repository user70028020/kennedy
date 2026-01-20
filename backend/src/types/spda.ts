// SPDA - Sistema de Proteção contra Descargas Atmosféricas
// Tipos baseados no projeto Next.JS FOD e template DOCX

export interface SPDAPoint {
  id: string;
  number: string; // Número do ponto (1-20)
  valor: string; // Valor em Ω
  foto: string; // base64 da foto
  nFoto?: string; // Número da foto (opcional)
}

export interface SPDAData {
  // ========== IDENTIFICAÇÃO ==========
  ordem_servico: string;
  cliente: string;
  data: string;
  status: "APROVADO" | "REVISÃO" | "REPROVADO";

  // ========== EQUIPE ==========
  equipe_tecnica: string; // "Nome1 | Nome2 | Nome3"

  // ========== TIPO DE SPDA (checkboxes múltiplos) ==========
  tipo_spda: string[]; // ["Método de Franklin", "Método Gaiola de Faraday ou Malha", "Método da esfera rolante", "SPDA Estrutural", "SPDA Não Estrutural"]

  // ========== EQUIPAMENTOS DE MEDIÇÃO (checkboxes) ==========
  equipamento_medicao: string[]; // ["Termômetro Digital", "Alicate Termômetro"]

  // ========== CABOS ==========
  revestida_cabos?: string; // "Revestida com cabos de:" (ex: "Cobre nu")
  secao_cabos?: string; // Seção em mm² (ex: "35")

  // ========== INSPEÇÕES GERAIS (OK/NC/NA para cada) ==========
  projeto_spda: "OK" | "NC" | "NA";
  integridade_condutores: "OK" | "NC" | "NA";
  subsistema_captacao: "OK" | "NC" | "NA";
  subsistema_condutores: "OK" | "NC" | "NA";
  caixa_inspecao: "OK" | "NC" | "NA";
  subsistema_conexoes: "OK" | "NC" | "NA";
  isoladores: "OK" | "NC" | "NA";
  condicao_equipotencializacoes: "OK" | "NC" | "NA";
  eletroduto_pcv: "OK" | "NC" | "NA";
  subsistema_aterramento: "OK" | "NC" | "NA";
  
  // ========== PONTO DE RUPTURA ==========
  ponto_ruptura: "SIM" | "NÃO";

  // ========== PONTOS DE MEDIÇÃO (até 20 pontos) ==========
  pontos: SPDAPoint[];

  // ========== CROQUI / LOCAL ==========
  croqui?: string; // base64 do desenho

  // ========== CONCLUSÃO / OBSERVAÇÕES / RECOMENDAÇÕES ==========
  conclusao_observacoes: string;

  // ========== TEMPLATE ==========
  template?: "sercamp" | "nx-energy";
}

// Função auxiliar para validar pontos SPDA
export function validateSPDAPoints(points: SPDAPoint[]): {
  isValid: boolean;
  incompletePoints: string[];
} {
  const incompletePoints: string[] = [];

  points.forEach((point) => {
    const hasValue = point.valor && point.valor.trim() !== "";
    const hasPhoto = point.foto && point.foto.startsWith("data:image");

    if (!hasValue || !hasPhoto) {
      incompletePoints.push(point.number);
    }
  });

  return {
    isValid: incompletePoints.length === 0,
    incompletePoints,
  };
}
