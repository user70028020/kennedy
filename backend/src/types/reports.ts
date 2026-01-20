import { z } from 'zod';

// Photo schema
export const PhotoSchema = z.object({
  id: z.string(),
  data: z.string(), // base64 encoded image
  name: z.string(),
  description: z.string().optional()
});

export type Photo = z.infer<typeof PhotoSchema>;

// Fotografico Report Request Schema
export const FotograficoReportSchema = z.object({
  template: z.enum(['nx_energy', 'sercamp']),
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  location: z.string().optional(),
  equipmentType: z.string().optional(),
  serialNumber: z.string().optional(),
  responsible: z.string().optional(),
  reportDate: z.string(), // ISO date string
  observations: z.string().optional(),
  photos: z.array(PhotoSchema).min(1, 'Pelo menos uma foto é obrigatória')
});

export type FotograficoReportRequest = z.infer<typeof FotograficoReportSchema>;

// Equipment types enum (SPDA has its own dedicated page)
export const EquipmentTypeEnum = z.enum([
  'transformador',
  'transformador_instrumento',
  'disjuntor',
  'para_raio',
  'rele_protecao',
  'chave_seccionadora',
  'chave_religadora',
  'painel_religador',
  'retificador_bateria',
  'banco_capacitores',
  'cabos'
]);

export type EquipmentType = z.infer<typeof EquipmentTypeEnum>;

// Status enum for equipment condition
export const StatusEnum = z.enum(['conforme', 'alerta', 'corretiva']);
export type StatusType = z.infer<typeof StatusEnum>;

// Tecnico Report Request Schema
export const TecnicoReportSchema = z.object({
  template: z.enum(['nx_energy', 'sercamp']),
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  location: z.string().optional(),
  reportDate: z.string(), // ISO date string
  responsible: z.string().optional(),
  observations: z.string().optional(),
  equipmentType: EquipmentTypeEnum,
  status: StatusEnum,
  formData: z.record(z.any()).optional(), // Dynamic form data based on equipment type
  photos: z.array(PhotoSchema).optional()
});

export type TecnicoReportRequest = z.infer<typeof TecnicoReportSchema>;

// Response types
export interface ReportGenerationResponse {
  id: string;
  fileName: string;
  message: string;
}

// SPDA Measurement Point schema
export const SPDAMeasurementPointSchema = z.object({
  number: z.number(),
  value: z.string(),
  photo: PhotoSchema.nullable().optional()
});

export type SPDAMeasurementPoint = z.infer<typeof SPDAMeasurementPointSchema>;

// SPDA Report Request Schema
export const SPDAReportSchema = z.object({
  template: z.enum(['nx_energy', 'sercamp']),
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  location: z.string().optional(),
  reportDate: z.string(), // ISO date string
  responsible: z.string().optional(),
  spdaClass: z.string().min(1, 'Classe do SPDA é obrigatória'),
  protectionMethods: z.array(z.string()).optional(),
  measurementEquipment: z.string().optional(),
  measurementPoints: z.array(SPDAMeasurementPointSchema).optional(),
  sketchData: z.string().nullable().optional(), // base64 PNG
  status: z.enum(['APROVADO', 'REPROVADO', 'PENDENTE']),
  conclusion: z.string().optional(),
  observations: z.string().optional(),
  photos: z.array(PhotoSchema).optional()
});

export type SPDAReportRequest = z.infer<typeof SPDAReportSchema>;


// RDO Representative schema
export const RDORepresentativeSchema = z.object({
  nome: z.string(),
  cargo: z.string().optional(),
  empresa: z.string().optional(),
  assinatura: z.string().optional() // base64 PNG
});

export type RDORepresentative = z.infer<typeof RDORepresentativeSchema>;

// RDO Team Member schema
export const RDOTeamMemberSchema = z.object({
  nome: z.string(),
  funcao: z.string().optional(),
  empresa: z.string().optional()
});

export type RDOTeamMember = z.infer<typeof RDOTeamMemberSchema>;

// RDO Work Schedule schema
export const RDOWorkScheduleSchema = z.object({
  inicio: z.string(),
  intervaloInicio: z.string(),
  intervaloFim: z.string(),
  fim: z.string(),
  horasExtras: z.string().optional()
});

export type RDOWorkSchedule = z.infer<typeof RDOWorkScheduleSchema>;

// RDO Report Request Schema
export const RDOReportSchema = z.object({
  template: z.enum(['nx_energy', 'sercamp']),
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  reportDate: z.string(), // ISO date string
  projeto: z.string().optional(),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  location: z.string().optional(),
  descricaoServico: z.string().min(1, 'Descrição do serviço é obrigatória'),
  representatives: z.array(RDORepresentativeSchema).optional(),
  teamMembers: z.array(RDOTeamMemberSchema).optional(),
  workSchedule: RDOWorkScheduleSchema.optional(),
  horasTrabalhadas: z.string().optional(),
  atividades: z.string().optional(),
  photos: z.array(PhotoSchema).optional(),
  observations: z.string().optional(),
  assinaturaResponsavel: z.string().optional(), // base64 PNG
  assinaturaCliente: z.string().optional() // base64 PNG
});

export type RDOReportRequest = z.infer<typeof RDOReportSchema>;

// Gastos (Expense) Report schemas

// Expense item schema
export const ExpenseItemSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string(),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  data: z.string(),
  comprovante: PhotoSchema.nullable().optional()
});

export type ExpenseItem = z.infer<typeof ExpenseItemSchema>;

// Gastos Report Request Schema
export const GastosReportSchema = z.object({
  template: z.enum(['nx_energy', 'sercamp']),
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  location: z.string().optional(),
  reportDate: z.string(), // ISO date string
  responsible: z.string().optional(),
  periodoInicio: z.string().optional(),
  periodoFim: z.string().optional(),
  expenses: z.array(ExpenseItemSchema).min(1, 'Pelo menos um gasto é obrigatório'),
  totalGastos: z.number(),
  observations: z.string().optional()
});

export type GastosReportRequest = z.infer<typeof GastosReportSchema>;


// Pesquisa de Satisfação (Satisfaction Survey) Schema
// Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
export const PesquisaSatisfacaoSchema = z.object({
  osNumber: z.string().min(1, 'Número da OS é obrigatório'),
  // Client data (Requirement 14.1)
  razaoSocial: z.string().min(1, 'Razão Social é obrigatória'),
  responsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  // Ratings 1-5 (Requirement 14.2)
  atendimento: z.number().min(1).max(5),
  apresentacao: z.number().min(1).max(5),
  prazo: z.number().min(1).max(5),
  competencia: z.number().min(1).max(5),
  confiabilidade: z.number().min(1).max(5),
  // Recommendation (Requirement 14.3)
  recomendaria: z.boolean(),
  // Suggestions/Complaints (Requirement 14.4)
  sugestoes: z.string().nullable().optional()
});

export type PesquisaSatisfacaoRequest = z.infer<typeof PesquisaSatisfacaoSchema>;
