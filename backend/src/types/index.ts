// User types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'funcionario';
  modules: string[];
  status: 'ativo' | 'inativo';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'funcionario';
  modules: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'funcionario';
  modules?: string[];
  status?: 'ativo' | 'inativo';
}

// ServiceOrder types
export interface ServiceOrder {
  id: string;
  osNumber: string;
  clientName: string;
  clientLogo?: string;
  teamLeader: string;
  teamMembers: string[];
  equipmentType: string;
  selectedTemplate: 'nx-energy' | 'sercamp';
  serviceType: string;
  location: string;
  periodStart: Date;
  periodEnd: Date;
  status: 'ativa' | 'concluida' | 'cancelada';
  createdAt: Date;
  createdBy: string;
}

export interface CreateServiceOrderDTO {
  osNumber: string;
  clientName: string;
  clientLogo?: string;
  teamLeader: string;
  teamMembers: string[];
  equipmentType: string;
  selectedTemplate: 'nx-energy' | 'sercamp';
  serviceType: string;
  location: string;
  periodStart: Date;
  periodEnd: Date;
}

// Report types
export type ReportType = 'fotografico' | 'spda' | 'rdo' | 'tecnico' | 'gastos' | 'mesclado';

export interface Report {
  id: string;
  type: ReportType;
  osNumber: string;
  clientName: string;
  fileName: string;
  fileData: string;
  fileSize: number;
  template: 'nx-energy' | 'sercamp' | 'merge';
  generatedBy: string;
  createdAt: Date;
}

// Template types
export interface Template {
  id: string;
  name: string;
  type: 'equipment' | 'merge';
  category: string;
  fileName: string;
  fileData: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

// AuditLog types
export type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'download' | 'generate';
export type ResourceType = 'user' | 'report' | 'template' | 'service_order' | 'merge';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

// PesquisaSatisfacao types
export interface PesquisaSatisfacao {
  id: string;
  osNumber: string;
  clientData: {
    razaoSocial: string;
    responsavel: string;
    telefone: string;
    cidade: string;
    uf: string;
    cep: string;
    endereco: string;
  };
  ratings: {
    atendimento: number;
    apresentacao: number;
    prazo: number;
    competencia: number;
    confiabilidade: number;
  };
  recomendaria: boolean;
  sugestoes?: string;
  createdAt: Date;
}

// Colaborador types
export interface Colaborador {
  id: string;
  nome: string;
  documento: string;
  funcao: string;
  email?: string;
  telefone?: string;
  osCount: number;
  createdAt: Date;
}

// Photo types
export interface Photo {
  id: string;
  data: string;
  name: string;
  description?: string;
}

// Merge types
export interface MergeConfig {
  templateId: string;
  reportIds: string[];
  fields: {
    data: string;
    cliente: string;
    tituloServico: string;
    liderEquipe: string;
    logoCliente?: string;
    periodo: string;
    numeroOSSercamp: string;
    localizacao: string;
    representanteCliente: string;
    setorCliente: string;
    acompanhantes: string[];
    colaboradores: string[];
    dataIda: string;
    dataVolta: string;
    datasAtividades: string;
    equipamentosUtilizados: EquipamentoUtilizado[];
    itensInspecionados: ItemInspecionado[];
  };
}

export interface EquipamentoUtilizado {
  nome: string;
  modelo: string;
  numeroSerie: string;
  certificadoCalibracao: string;
}

export interface ItemInspecionado {
  equipamento: string;
  fabricante: string;
  local: string;
  numeroSerie: string;
  status: 'conforme' | 'corretiva' | 'alerta';
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'funcionario';
}
