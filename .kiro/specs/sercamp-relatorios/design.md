# Design Document: Sistema de Relatórios SERCAMP

## Overview

O Sistema de Relatórios SERCAMP é uma aplicação web fullstack para automação de relatórios técnicos de manutenção elétrica industrial. A arquitetura segue o padrão cliente-servidor com:

- **Frontend**: SvelteKit 2 + Svelte 5 (runes) + TailwindCSS 4
- **Backend**: Express.js rodando em Bun runtime
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Geração de Documentos**: docxtemplater + PizZip para manipulação de DOCX

O sistema possui dois perfis de usuário (Admin e Funcionário) com controle granular de acesso por módulos.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (SvelteKit)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Login     │  │ Funcionário │  │         Admin           │  │
│  │   Page      │  │   Pages     │  │         Pages           │  │
│  │             │  │ - Fotográf. │  │ - Gerenciar Usuários    │  │
│  │             │  │ - SPDA      │  │ - Banco de Dados        │  │
│  │             │  │ - RDO       │  │   - OS                  │  │
│  │             │  │ - Técnico   │  │   - Colaboradores       │  │
│  │             │  │ - Gastos    │  │   - Templates           │  │
│  │             │  │ - Pesquisa  │  │   - Mesclagem           │  │
│  └─────────────┘  └─────────────┘  │   - Auditoria           │  │
│                                     └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express + Bun)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Auth Routes  │  │Report Routes │  │   Admin Routes       │   │
│  │ - login      │  │ - fotográf.  │  │ - users              │   │
│  │ - me         │  │ - spda       │  │ - service-orders     │   │
│  │ - logout     │  │ - rdo        │  │ - templates          │   │
│  │              │  │ - técnico    │  │ - merge              │   │
│  │              │  │ - gastos     │  │ - audit              │   │
│  │              │  │ - pesquisa   │  │ - colaboradores      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │ DocxGen    │  │ Database   │  │ AuditLogger        │  │   │
│  │  │ Service    │  │ Service    │  │ Service            │  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                          │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ users  │ │ orders │ │ reports  │ │templates │ │audit_logs│  │
│  └────────┘ └────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### Layout Components
```typescript
// src/lib/components/layout/Header.svelte
interface HeaderProps {
  user: User;
  onLogout: () => void;
  onFinalizeOS: () => void;
}

// src/lib/components/layout/TabNavigation.svelte
interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

#### Report Form Components
```typescript
// src/lib/components/reports/PhotoCapture.svelte
interface PhotoCaptureProps {
  photos: Photo[];
  maxPhotos?: number;
  onPhotosChange: (photos: Photo[]) => void;
}

// src/lib/components/reports/DynamicForm.svelte
interface DynamicFormProps {
  fields: FormField[];
  values: Record<string, any>;
  onValuesChange: (values: Record<string, any>) => void;
}

// src/lib/components/reports/SignatureCapture.svelte
interface SignatureCaptureProps {
  label: string;
  onCapture: (signatureData: string) => void;
}

// src/lib/components/reports/EquipmentSelector.svelte
interface EquipmentSelectorProps {
  selectedType: EquipmentType | null;
  onSelect: (type: EquipmentType) => void;
}
```

#### Admin Components
```typescript
// src/lib/components/admin/UserForm.svelte
interface UserFormProps {
  user?: User;
  onSubmit: (userData: CreateUserDTO) => void;
}

// src/lib/components/admin/ModuleAccessCheckboxes.svelte
interface ModuleAccessProps {
  selectedModules: string[];
  onChange: (modules: string[]) => void;
}

// src/lib/components/admin/ReportMerger.svelte
interface ReportMergerProps {
  availableReports: Report[];
  mergeTemplates: MergeTemplate[];
  onMerge: (config: MergeConfig) => void;
}
```

### Backend API Interfaces

```typescript
// Auth Routes
POST /api/auth/login
  Request: { email: string, password: string }
  Response: { user: User, token: string }

GET /api/auth/me
  Headers: Authorization: Bearer <token>
  Response: User

// Report Routes
POST /api/reports/fotografico
  Request: FotograficoReportData
  Response: { id: string, fileUrl: string }

POST /api/reports/spda
  Request: SPDAReportData
  Response: { id: string, fileUrl: string }

POST /api/reports/rdo
  Request: RDOReportData
  Response: { id: string, fileUrl: string }

POST /api/reports/tecnico
  Request: TecnicoReportData
  Response: { id: string, fileUrl: string }

POST /api/reports/gastos
  Request: GastosReportData
  Response: { id: string, fileUrl: string }

POST /api/reports/pesquisa
  Request: PesquisaSatisfacaoData
  Response: { id: string }

GET /api/reports
  Query: { osNumber?: string, type?: string }
  Response: Report[]

// Admin Routes
GET /api/admin/users
  Response: User[]

POST /api/admin/users
  Request: CreateUserDTO
  Response: User

PUT /api/admin/users/:id
  Request: UpdateUserDTO
  Response: User

DELETE /api/admin/users/:id
  Response: { success: boolean }

GET /api/admin/service-orders
  Response: ServiceOrder[]

POST /api/admin/service-orders
  Request: CreateServiceOrderDTO
  Response: ServiceOrder

GET /api/admin/templates
  Response: Template[]

POST /api/admin/templates
  Request: FormData (file + metadata)
  Response: Template

POST /api/admin/merge
  Request: MergeConfig
  Response: { fileUrl: string }

GET /api/admin/audit-logs
  Query: { startDate?: string, endDate?: string, userId?: string }
  Response: AuditLog[]
```

## Data Models

```typescript
// User
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'funcionario';
  modules: string[]; // ['fotografico', 'spda', 'rdo', 'tecnico', 'gastos', 'banco_dados', 'gerenciar_usuarios']
  status: 'ativo' | 'inativo';
  createdAt: Date;
  updatedAt: Date;
}

// ServiceOrder
interface ServiceOrder {
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

// Report
interface Report {
  id: string;
  type: 'fotografico' | 'spda' | 'rdo' | 'tecnico' | 'gastos';
  osNumber: string;
  clientName: string;
  fileName: string;
  fileData: string; // base64 do DOCX
  fileSize: number;
  template: 'nx-energy' | 'sercamp';
  generatedBy: string;
  createdAt: Date;
}

// Template
interface Template {
  id: string;
  name: string;
  type: 'equipment' | 'merge';
  category: string; // 'transformador', 'disjuntor', etc.
  fileName: string;
  fileData: string; // base64 do DOCX
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

// AuditLog
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'download' | 'generate';
  resourceType: 'user' | 'report' | 'template' | 'service_order' | 'merge';
  resourceId?: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

// PesquisaSatisfacao
interface PesquisaSatisfacao {
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
    atendimento: number; // 1-5
    apresentacao: number;
    prazo: number;
    competencia: number;
    confiabilidade: number;
  };
  recomendaria: boolean;
  sugestoes?: string;
  createdAt: Date;
}

// Colaborador (para estatísticas)
interface Colaborador {
  id: string;
  nome: string;
  documento: string;
  funcao: string;
  email?: string;
  telefone?: string;
  osCount: number;
  createdAt: Date;
}

// Photo
interface Photo {
  id: string;
  data: string; // base64
  name: string;
  description?: string;
}

// MergeConfig
interface MergeConfig {
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

// EquipamentoUtilizado
interface EquipamentoUtilizado {
  nome: string;
  modelo: string;
  numeroSerie: string;
  certificadoCalibracao: string;
}

// ItemInspecionado
interface ItemInspecionado {
  equipamento: string;
  fabricante: string;
  local: string;
  numeroSerie: string;
  status: 'conforme' | 'corretiva' | 'alerta';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Authentication Validity
*For any* valid user credentials (email and password matching a user in the database), authenticating SHALL return a valid JWT token and user data; *for any* invalid credentials, authentication SHALL return an error.
**Validates: Requirements 1.1, 1.2**

### Property 2: Role-Based Module Access Control
*For any* authenticated user, the visible modules SHALL be exactly the intersection of their assigned modules and their role permissions (Admin sees all assigned modules including admin-only ones; Funcionario sees only report modules from their assigned list).
**Validates: Requirements 1.3, 1.4, 16.2, 16.3**

### Property 3: Report Generation Round-Trip
*For any* valid report data (Fotográfico, SPDA, RDO, Técnico, or Gastos), generating a DOCX and then extracting the data from the generated document SHALL produce values equivalent to the original input data.
**Validates: Requirements 2.3, 3.2, 4.2, 5.2, 6.2**

### Property 4: Photo Storage and Inclusion
*For any* set of photos with names and descriptions added to a report, the generated document SHALL contain all photos with their corresponding names/descriptions preserved.
**Validates: Requirements 2.4, 3.1, 3.3, 4.1**

### Property 5: Audit Logging Completeness
*For any* user action (create, update, delete, generate, download), the audit log SHALL contain an entry with the correct userId, action type, resourceType, resourceId, timestamp, and details.
**Validates: Requirements 7.2, 7.3, 11.1, 11.2, 11.3**

### Property 6: Report Persistence Round-Trip
*For any* generated report saved to the database, retrieving it by ID SHALL return the exact same DOCX file data and metadata.
**Validates: Requirements 12.1, 12.2, 12.3**

### Property 7: Template Data Injection
*For any* template with placeholders ({{CAMPO}}) and a data object, processing the template SHALL replace all placeholders with corresponding values while preserving document formatting, and tables SHALL have rows matching the length of data arrays.
**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 10.3**

### Property 8: Merge Document Structure
*For any* merge operation with N selected reports, the generated document SHALL contain: (1) the merge template pages with injected header data, (2) N report pages in selection order, (3) photographic report pages at the end.
**Validates: Requirements 10.4, 10.5**

### Property 9: User Deactivation Blocks Login
*For any* user that has been deactivated, attempting to authenticate with their valid credentials SHALL fail with an appropriate error.
**Validates: Requirements 8.3**

### Property 10: Service Order Filtering
*For any* filter criteria (status, equipment type, search term), the returned service orders SHALL be exactly those matching all specified criteria.
**Validates: Requirements 7.4**

### Property 11: Expense Total Calculation
*For any* expense report with N receipts, the calculated total SHALL equal the sum of all receipt amounts.
**Validates: Requirements 6.2**

### Property 12: Survey Data Persistence
*For any* submitted satisfaction survey, all fields (client data, ratings 1-5, recommendation boolean, suggestions) SHALL be stored and linked to the correct service order.
**Validates: Requirements 14.2, 14.3, 14.4, 14.5**

## Error Handling

### Authentication Errors
- Invalid credentials: Return 401 with message "Credenciais inválidas"
- Inactive user: Return 401 with message "Usuário inativo"
- Expired token: Return 401 with message "Sessão expirada"
- Missing token: Return 401 with message "Token não fornecido"

### Authorization Errors
- Insufficient permissions: Return 403 with message "Acesso negado"
- Module not allowed: Return 403 with message "Módulo não autorizado"

### Validation Errors
- Missing required fields: Return 400 with field-specific messages
- Invalid file type: Return 400 with message "Tipo de arquivo inválido"
- File too large: Return 400 with message "Arquivo muito grande"

### Server Errors
- Database error: Return 500 with message "Erro interno do servidor"
- Template processing error: Return 500 with message "Erro ao processar template"
- File generation error: Return 500 with message "Erro ao gerar documento"

## Development Notes

### Using Context7 MCP for Updated Documentation

**IMPORTANTE:** Durante o desenvolvimento, sempre use o MCP Context7 para consultar documentação atualizada das stacks:

```bash
# Exemplos de uso do Context7:
- Prisma: Verificar novos métodos, mudanças de API, breaking changes
- SvelteKit: Consultar runes do Svelte 5, novos patterns
- TailwindCSS 4: Ver novas classes, configuração atualizada
- Express 5.2.1: Verificar breaking changes do Express 4 → 5, novos middlewares, async/await support
- Bun: Consultar APIs específicas do runtime
- Vite 7.3.1: Verificar configurações de HMR, WebSocket, breaking changes
```

**Por que usar Context7:**
- ✅ Documentação sempre atualizada (ex: Prisma 7 mudou completamente a configuração)
- ✅ Evita usar APIs deprecadas ou removidas
- ✅ Descobre novos métodos e features
- ✅ Verifica breaking changes entre versões

**Quando consultar:**
- Antes de implementar features com bibliotecas externas
- Quando encontrar erros de API não encontrada
- Para verificar best practices atualizadas
- Ao atualizar versões de dependências
- **Ao encontrar problemas de WebSocket/HMR no Vite 7.3.1**

### Versões das Stacks

**Frontend:**
- SvelteKit: 2.x
- Svelte: 5.x (com runes)
- Vite: **7.3.1** (verificar Context7 para problemas de WebSocket/HMR)
- TailwindCSS: 4.x

**Backend:**
- Bun: runtime
- Express: **5.2.1** (verificar Context7 para breaking changes do Express 4 → 5)
- Prisma: **7.2.0** (configuração via prisma.config.ts)
- PostgreSQL: 15+

**Nota sobre Express 5.2.1:**
Express 5 tem mudanças importantes em relação ao Express 4:
- Suporte nativo a async/await em middlewares e handlers
- Melhor tratamento de erros assíncronos (não precisa mais de `next()` em async)
- Algumas APIs deprecadas foram removidas
- Mudanças no comportamento de `res.send()` e `res.json()`
- `app.del()` foi removido, use `app.delete()`

Se encontrar problemas, consulte o Context7 para:
- Breaking changes do Express 4 → 5
- Novos patterns de error handling com async/await
- Mudanças em middlewares
- Compatibilidade com TypeScript

**Nota sobre Vite 7.3.1:**
Se encontrar problemas com WebSocket ou HMR, consulte o Context7 para:
- Configurações específicas da versão 7.3.1
- Breaking changes do Vite 6 → 7
- Problemas conhecidos com WebSocket
- Configurações de `server.hmr` e `server.ws`

## Testing Strategy

### Unit Tests
Unit tests will focus on:
- Individual service functions (data transformation, validation)
- Utility functions (date formatting, file handling)
- Component rendering (form fields, buttons)
- Edge cases (empty inputs, boundary values)

### Property-Based Tests
Property-based tests will use **fast-check** library for TypeScript with minimum 100 iterations per property.

Each property test will be tagged with:
```typescript
// Feature: sercamp-relatorios, Property N: [Property Title]
// Validates: Requirements X.Y
```

**Test Configuration:**
- Framework: Vitest
- PBT Library: fast-check
- Minimum iterations: 100
- Generators: Custom generators for User, Report, ServiceOrder, Photo, etc.

### Integration Tests
- API endpoint tests with supertest
- Database operations with test database
- File generation with actual templates

### Test File Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── auth.test.ts
│   │   ├── docx-generator.test.ts
│   │   └── audit.test.ts
│   └── utils/
│       └── validation.test.ts
├── property/
│   ├── auth.property.test.ts
│   ├── reports.property.test.ts
│   ├── templates.property.test.ts
│   └── merge.property.test.ts
└── integration/
    ├── api/
    │   ├── auth.api.test.ts
    │   ├── reports.api.test.ts
    │   └── admin.api.test.ts
    └── e2e/
        └── workflows.test.ts
```
