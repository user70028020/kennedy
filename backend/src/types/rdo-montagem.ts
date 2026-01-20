// RDO de Montagem - Relatório Diário de Obra
// Tipos baseados no projeto Next.js FOD

export interface RDOParticipante {
  nome: string;
  empresa: string;
  visto: string; // base64 da assinatura
}

export interface RDOHorasTrabalho {
  horarioNormalInicio: string;
  horarioNormalTermino: string;
  liberacaoHorasExtras: "sim" | "nao" | "";
  liberacaoHorasExtrasObs?: string;
  horasExtrasInicio: string;
  horasExtrasTermino: string;
  autorizadoPor: string;
  horasDeslocamentoInicio: string;
  horasDeslocamentoTermino: string;
  horasDeslocamentoTotal: string;
  horasTrabalhadasClienteInicio?: string;
  horasTrabalhadasClienteTermino?: string;
  horasTrabalhadasCliente: string;
  horarioAlmocoInicio: string;
  horarioAlmocoTermino: string;
  horarioAlmoco: string;
  horasJantarInicio: string;
  horasJantarTermino: string;
  horasJantar: string;
  horasDeslocamentoRetornoInicio: string;
  horasDeslocamentoRetornoTermino: string;
  horasDeslocamentoRetorno: string;
  horasDisposicaoInicio: string;
  horasDisposicaoTermino: string;
  horasDisposicao: string;
  horasTotaisTrabalhadas: string;
}

export interface RDOHorasDisponibilizadas {
  integracaoInicio: string;
  integracaoTermino: string;
  integracaoTotal: string;
  faltaRecursosInicio: string;
  faltaRecursosTermino: string;
  faltaRecursosTotal: string;
  condicoesClimaticasInicio: string;
  condicoesClimaticasTermino: string;
  condicoesClimaticasTotal: string;
  retomadaAtividadesInicio: string;
  retomadaAtividadesTermino: string;
  retomadaAtividadesTotal: string;
  outrosDescricao: string;
  outrosInicio: string;
  outrosTermino: string;
  outrosTotal: string;
  total: string;
}

export interface RDOAtividade {
  item: string;
  descricao: string;
}

export interface RDOPhoto {
  id: string;
  data: string; // base64
  name: string;
}

export interface RDOInvoiceItem {
  id: string;
  imageData: string; // base64
  date: string;
  description: string;
  value: number;
  imageName: string;
}

export interface RDOMontagemData {
  // Identificação
  numeroOS: string;
  data: string;
  projeto: string;
  cliente: string;
  cidade: string;
  nomeSubestacao: string;

  // Equipamento
  naturezaServico: string;
  caracteristicasEquipamento: string;
  numeroSerie: string;

  // Equipe
  participantes: RDOParticipante[];

  // Representantes
  representanteSercamp: string;
  representanteSercampAssinatura: string; // base64
  representanteCliente: string;
  representanteClienteAssinatura: string; // base64
  certificacaoHorasAssinatura?: string; // base64 - NOVO

  // Atividades
  atividadesExecutadas: RDOAtividade[];

  // Horas
  horasTrabalho: RDOHorasTrabalho;
  horasDisponibilizadas: RDOHorasDisponibilizadas;

  // Fotos
  photos: RDOPhoto[];

  // Notas Fiscais (opcional)
  invoiceItems?: RDOInvoiceItem[];

  // Observações
  observacoes?: string;

  // Template
  template: "sercamp" | "nx-energy";

  // Campos legados (compatibilidade)
  local?: string;
  dadosEquipamento?: string;
  servico?: string;
  horarioInicio?: string;
  horarioTermino?: string;
  responsavelSercamp?: string;
  responsavelCliente?: string;
  vistoConfirmed?: boolean;
  signatures?: Array<{ name: string; signature: string }>;
}
