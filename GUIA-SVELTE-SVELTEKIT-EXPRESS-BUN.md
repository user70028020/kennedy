# Guia de Desenvolvimento: Sistema de Relatórios Técnicos
## Stack: Svelte 5 + SvelteKit (Frontend) + Express/Bun (Backend)

---

## 📋 Visão Geral do Sistema

Sistema de automação de relatórios técnicos para manutenção elétrica industrial, com funcionalidades de:
- Geração de relatórios técnicos por tipo de equipamento
- Mesclagem de múltiplos relatórios em um único documento
- Gerenciamento de ordens de serviço
- Controle de acesso por cargo (Admin vs Funcionário/Operacional)
- Auditoria e segurança

---

## 🏗️ Arquitetura do Sistema

### Frontend (SvelteKit)
```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── stores/           # Svelte stores (estado global)
│   │   ├── services/         # Serviços de API
│   │   ├── utils/            # Utilitários
│   │   └── types/            # TypeScript types
│   ├── routes/
│   │   ├── +layout.svelte    # Layout principal
│   │   ├── +page.svelte      # Página inicial (login)
│   │   ├── admin/            # Rotas admin
│   │   │   ├── +page.svelte
│   │   │   ├── usuarios/
│   │   │   ├── ordens-servico/
│   │   │   ├── templates/
│   │   │   ├── mesclagem/
│   │   │   └── auditoria/
│   │   └── relatorios/       # Rotas funcionário
│   │       ├── fotografico/
│   │       ├── spda/
│   │       ├── rdo-montagem/
│   │       ├── tecnico/
│   │       └── gastos/
│   └── app.html
├── static/
│   ├── images/
│   ├── templates/
│   └── manifest.json
├── svelte.config.js
├── vite.config.ts
└── package.json
```

### Backend (Express + Bun)
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── reports.ts
│   │   ├── templates.ts
│   │   ├── service-orders.ts
│   │   ├── users.ts
│   │   └── merge.ts
│   ├── services/
│   │   ├── database.ts
│   │   ├── docx-generator.ts
│   │   ├── pdf-generator.ts
│   │   ├── email.ts
│   │   └── storage.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── audit.ts
│   ├── types/
│   └── index.ts
├── templates/               # Templates DOCX
├── uploads/                 # Arquivos temporários
└── package.json
```

---

## 📦 Dependências

### Frontend (package.json)
```json
{
  "name": "relatorios-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "svelte": "^5.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  },
  "dependencies": {
    "bits-ui": "^1.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "lucide-svelte": "^0.460.0",
    "date-fns": "^4.1.0",
    "zod": "^3.23.0"
  }
}
```

### Backend (package.json)
```json
{
  "name": "relatorios-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "start": "bun src/index.ts"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "docx": "^9.5.1",
    "docxtemplater": "^3.67.0",
    "pizzip": "^3.2.0",
    "pdf-lib": "^1.17.1",
    "resend": "^4.0.0",
    "multer": "^1.4.5",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/multer": "^1.4.12",
    "typescript": "^5.0.0"
  }
}
```

---

## 🔐 Sistema de Autenticação e Cargos

### Tipos de Usuário
```typescript
// types/user.ts
export type UserRole = 'admin' | 'funcionario';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hash bcrypt
  role: UserRole;
  permissions: string[];
  createdAt: string;
  status: 'ativo' | 'inativo';
}

// Permissões disponíveis
export const PERMISSIONS = {
  PHOTOGRAPHIC: 'photographic',      // Relatório Fotográfico
  SPDA: 'spda',                      // SPDA
  RDO: 'rdo',                        // RDO de Montagem
  TECHNICAL: 'technical',            // Relatório Técnico
  EXPENSES: 'expenses',              // Relatório de Gastos
  ADMIN: 'admin',                    // Gerenciar Usuários
  SERVICE_ORDERS: 'service_orders',  // Gerenciar OS
  TEMPLATES: 'templates',            // Gerenciar Templates
  MERGE: 'merge',                    // Mesclar Relatórios
  AUDIT: 'audit',                    // Auditoria
} as const;
```

### Middleware de Autenticação (Backend)
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};
```

---

## 📄 Tipos de Relatórios

### 1. Relatório Técnico
```typescript
// types/technical-report.ts
export type EquipmentType = 
  | 'transformador'
  | 'transformador-instrumentos'
  | 'disjuntor'
  | 'para-raios'
  | 'rele-protecao'
  | 'chave-seccionadora'
  | 'chave-religadora'
  | 'painel-religador'
  | 'retificador-bateria'
  | 'banco-capacitores'
  | 'cabos';

export type TemplateType = 'nx-energy' | 'sercamp';

export interface TechnicalReportData {
  equipmentType: EquipmentType;
  template: TemplateType;
  serviceOrder: string;
  serviceDate: string;
  clientName: string;
  installationLocation: string;
  serialNumber: string;
  responsiblePerson: string;
  observations: string;
  statusColor: 'green' | 'yellow' | 'red';
  fieldValues: Record<string, any>;
  photos: PhotoWithName[];
}

export interface PhotoWithName {
  id: string;
  data: string; // base64
  name: string;
}
```

### 2. Relatório SPDA
```typescript
// types/spda-report.ts
export interface SPDAPoint {
  number: number;
  value: string;
  photo: string; // base64
  description?: string;
}

export interface SPDAReportData {
  template: TemplateType;
  fieldValues: Record<string, any>;
  points: SPDAPoint[];
  status: 'APROVADO' | 'REPROVADO' | 'PENDENTE';
  croquiData?: string; // base64 do desenho
  observations?: string;
}
```

### 3. RDO de Montagem
```typescript
// types/rdo-montagem.ts
export interface Participante {
  nome: string;
  empresa: string;
  visto: string; // assinatura base64
}

export interface HorasTrabalho {
  horarioNormalInicio: string;
  horarioNormalTermino: string;
  liberacaoHorasExtras: 'sim' | 'nao' | '';
  horasExtrasInicio: string;
  horasExtrasTermino: string;
  // ... outros campos de horas
}

export interface RDOMontagemData {
  numeroOS: string;
  data: string;
  projeto: string;
  participantes: Participante[];
  cliente: string;
  cidade: string;
  nomeSubestacao: string;
  naturezaServico: string;
  caracteristicasEquipamento: string;
  numeroSerie: string;
  atividadesExecutadas: { item: string; descricao: string }[];
  photos: PhotoWithName[];
  horasTrabalho: HorasTrabalho;
  observacoes: string;
  assinaturas: { name: string; signature: string }[];
}
```

### 4. Relatório de Gastos
```typescript
// types/expense-report.ts
export interface ExpenseReceipt {
  id: string;
  fileName: string;
  fileData: string; // base64
  amount: number;
  description: string;
  category: string;
  uploadDate: string;
}

export interface ExpenseReportData {
  osNumber: string;
  clientName: string;
  userName: string;
  prestacaoDate: string;
  totalAmount: number;
  receipts: ExpenseReceipt[];
}
```

---

## 🔄 Sistema de Mesclagem de Relatórios

### Estrutura do Template de Mesclagem
O template DOCX de mesclagem possui campos marcados em amarelo que devem ser substituídos:

```typescript
// types/merge-template.ts
export interface MergeTemplateFields {
  // Página 1-2: Capa e Sumário
  data: string;
  cliente: string;
  tituloServico: string;
  liderEquipe: string;
  logoCliente: string; // base64
  periodo: string;
  numeroOSSercamp: string;
  numeroPaginas: number;
  
  // Página 3: Localização e Dados
  localizacao: string;           // Ex: "Subestação de Entrada Principal (SEP)"
  nomeCliente: string;           // Ex: "Aeroporto Internacional Tom Jobim (Galeão)"
  representanteCliente: string;  // Ex: "Sr. Thiago Amorim"
  setorCliente: string;          // Ex: "setor de engenharia e projeto"
  empresaCliente: string;        // Ex: "consorcio Rio Galeão"
  acompanhantes: string[];       // Ex: ["Anderson", "Ernane"]
  setorAcompanhantes: string;    // Ex: "equipe predial e manutenção"
  
  // Página 4: Data e Equipe
  colaboradores: string[];       // Ex: ["João Victor Araujo", "Juliano Peixoto"]
  dataIda: string;
  dataVolta: string;
  datasAtividades: string;       // Ex: "entre os dias 27 e 29"
  
  // Equipamentos utilizados
  equipamentos: EquipamentoUtilizado[];
  
  // Página 8: Itens Inspecionados
  itensInspecionados: ItemInspecionado[];
  
  // Página 9+: Relatórios Técnicos (anexados)
  relatoriosTecnicos: string[];  // base64 dos DOCX
  
  // Última página: Relatório Fotográfico
  relatorioFotografico: PhotoWithName[];
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
```

### Serviço de Mesclagem (Backend)
```typescript
// services/merge-service.ts
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync } from 'fs';

export class MergeService {
  async mergeReports(
    templatePath: string,
    fields: MergeTemplateFields,
    reports: Buffer[]
  ): Promise<Buffer> {
    // 1. Carregar template base
    const templateContent = readFileSync(templatePath);
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // 2. Substituir campos do template
    doc.render({
      data: fields.data,
      cliente: fields.cliente,
      titulo_servico: fields.tituloServico,
      lider_equipe: fields.liderEquipe,
      periodo: fields.periodo,
      numero_os: fields.numeroOSSercamp,
      // ... outros campos
      
      // Tabela de equipamentos
      equipamentos: fields.equipamentos,
      
      // Tabela de itens inspecionados
      itens: fields.itensInspecionados,
    });
    
    // 3. Gerar documento base
    const baseDoc = doc.getZip().generate({ type: 'nodebuffer' });
    
    // 4. Anexar relatórios técnicos selecionados
    const finalDoc = await this.appendReports(baseDoc, reports);
    
    return finalDoc;
  }
  
  private async appendReports(baseDoc: Buffer, reports: Buffer[]): Promise<Buffer> {
    // Implementar lógica de concatenação de DOCX
    // Usar docx-merger ou similar
  }
}
```

---

## 📊 Ordem de Serviço

```typescript
// types/service-order.ts
export interface ServiceOrder {
  id: string;
  osNumber: string;
  equipmentType: string;
  selectedTemplate: 'nx-energy' | 'sercamp';
  clientName: string;
  teamLeader: string;
  teamMembers: string[];
  serviceType: string;
  executionDate: string;
  periodStart: string;
  periodEnd: string;
  assignedUsers: string[]; // IDs dos usuários com acesso
  status: 'ativa' | 'concluida' | 'cancelada';
  preAccessCompleted: boolean;
  checkoutCompleted: boolean;
  createdAt: string;
  createdBy: string;
}
```

---

## 🖥️ Componentes Svelte 5

### Layout Principal
```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';
  
  let { children } = $props();
</script>

{#if $user}
  <div class="flex h-screen">
    <Sidebar role={$user.role} />
    <div class="flex-1 flex flex-col">
      <Header user={$user} />
      <main class="flex-1 overflow-auto p-6">
        {@render children()}
      </main>
    </div>
  </div>
{:else}
  {@render children()}
{/if}
```

### Componente de Relatório Técnico
```svelte
<!-- src/lib/components/TechnicalReport.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { EquipmentType, TemplateType } from '$lib/types';
  import DynamicFieldCard from './DynamicFieldCard.svelte';
  import PhotoCapture from './PhotoCapture.svelte';
  
  let equipmentType = $state<EquipmentType | null>(null);
  let selectedTemplate = $state<TemplateType | null>(null);
  let fieldValues = $state<Record<string, any>>({});
  let photos = $state<Array<{id: string; data: string; name: string}>>([]);
  let isProcessing = $state(false);
  
  const equipmentOptions: { value: EquipmentType; label: string; group: string }[] = [
    { value: 'transformador', label: 'Transformador de Força', group: 'Transformadores' },
    { value: 'transformador-instrumentos', label: 'Transformador para Instrumentos (TC/TP)', group: 'Transformadores' },
    { value: 'disjuntor', label: 'Disjuntor', group: 'Proteção e Controle' },
    // ... outros
  ];
  
  async function handleGenerate() {
    if (!equipmentType || !selectedTemplate) return;
    
    isProcessing = true;
    try {
      const response = await fetch('/api/reports/technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentType,
          template: selectedTemplate,
          fieldValues,
          photos,
        }),
      });
      
      const blob = await response.blob();
      // Download do arquivo
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio-Tecnico-${fieldValues.os || 'SN'}.docx`;
      a.click();
    } finally {
      isProcessing = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium mb-2">Tipo de Equipamento *</label>
      <select bind:value={equipmentType} class="w-full border rounded-md p-2">
        <option value={null}>Selecione o equipamento</option>
        {#each equipmentOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium mb-2">Template *</label>
      <select bind:value={selectedTemplate} class="w-full border rounded-md p-2">
        <option value={null}>Selecione o template</option>
        <option value="nx-energy">NX Energy</option>
        <option value="sercamp">SERCAMP</option>
      </select>
    </div>
  </div>
  
  {#if equipmentType && selectedTemplate}
    <!-- Campos dinâmicos baseados no template -->
    <DynamicFieldCard 
      {equipmentType} 
      {selectedTemplate}
      bind:values={fieldValues}
    />
    
    <!-- Captura de fotos -->
    <PhotoCapture bind:photos />
  {/if}
  
  <button
    onclick={handleGenerate}
    disabled={isProcessing || !equipmentType || !selectedTemplate}
    class="w-full bg-primary text-white py-3 rounded-md disabled:opacity-50"
  >
    {isProcessing ? 'Gerando...' : 'Gerar Relatório Técnico'}
  </button>
</div>
```

### Store de Autenticação
```typescript
// src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';

function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(null);
  
  return {
    subscribe,
    login: async (email: string, password: string) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Credenciais inválidas');
      
      const { user, token } = await response.json();
      localStorage.setItem('token', token);
      set(user);
      return user;
    },
    logout: () => {
      localStorage.removeItem('token');
      set(null);
    },
    checkAuth: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        localStorage.removeItem('token');
        set(null);
        return null;
      }
      
      const user = await response.json();
      set(user);
      return user;
    },
  };
}

export const user = createAuthStore();

export const isAdmin = derived(user, ($user) => $user?.role === 'admin');
export const permissions = derived(user, ($user) => $user?.permissions || []);
```

---

## 🔧 Rotas da API (Backend)

### Autenticação
```typescript
// routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = await db.users.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  res.json({ user: { ...user, password: undefined }, token });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await db.users.findById(req.user.id);
  res.json({ ...user, password: undefined });
});

export default router;
```

### Relatórios
```typescript
// routes/reports.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateTechnicalReport } from '../services/docx-generator';

const router = Router();

router.post('/technical', authMiddleware, async (req, res) => {
  const { equipmentType, template, fieldValues, photos } = req.body;
  
  try {
    const docxBuffer = await generateTechnicalReport({
      equipmentType,
      template,
      fieldValues,
      photos,
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-tecnico.docx"`);
    res.send(docxBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Listar relatórios disponíveis para mesclagem
router.get('/available', authMiddleware, async (req, res) => {
  const reports = await db.reports.findAll();
  res.json(reports);
});

export default router;
```

### Mesclagem
```typescript
// routes/merge.ts
import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { MergeService } from '../services/merge-service';

const router = Router();

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { templateId, fields, reportIds } = req.body;
  
  try {
    const mergeService = new MergeService();
    
    // Buscar template
    const template = await db.mergeTemplates.findById(templateId);
    
    // Buscar relatórios selecionados
    const reports = await Promise.all(
      reportIds.map((id: string) => db.reports.findById(id))
    );
    
    const mergedDoc = await mergeService.mergeReports(
      template.filePath,
      fields,
      reports.map(r => r.fileBuffer)
    );
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(mergedDoc);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao mesclar relatórios' });
  }
});

export default router;
```

---

## 🎨 Telas do Sistema

### Telas Admin (role: 'admin')
1. **Dashboard Admin** - Visão geral do sistema
2. **Gerenciar Usuários** - CRUD de usuários com permissões
3. **Ordens de Serviço** - CRUD de OS com período de acesso
4. **Templates** - Upload/gerenciamento de templates DOCX
5. **Templates de Mesclagem** - Upload de templates para merge
6. **Mesclar Relatórios** - Interface de seleção e mesclagem
7. **Auditoria e Segurança** - Logs de atividades

### Telas Funcionário (role: 'funcionario')
1. **Relatório Fotográfico** - Captura de fotos com descrições
2. **SPDA** - Pontos de medição com fotos
3. **RDO de Montagem** - Registro diário de obra
4. **Relatório Técnico** - Por tipo de equipamento
5. **Relatório de Gastos** - Comprovantes com OCR

---

## 📝 Fluxo de Mesclagem de Relatórios

```
1. Admin acessa "Mesclar Relatórios"
2. Seleciona template de mesclagem (DOCX base)
3. Preenche campos do cabeçalho:
   - Data, Cliente, Título do Serviço
   - Líder da Equipe, Logo do Cliente
   - Período, Número OS, etc.
4. Sistema lista relatórios disponíveis (gerados pelos funcionários)
5. Admin seleciona quais relatórios incluir
6. Sistema gera documento mesclado:
   - Páginas 1-2: Capa e Sumário (do template)
   - Página 3: Localização e Dados (campos preenchidos)
   - Página 4: Data e Equipe (campos preenchidos)
   - Página 5-7: Equipamentos e Procedimentos
   - Página 8: Tabela de Itens Inspecionados
   - Página 9+: Relatórios técnicos selecionados
   - Última: Relatório fotográfico
7. Download do DOCX final
```

---

## 🚀 Comandos para Iniciar

### Frontend
```bash
cd frontend
bun install
bun run dev
```

### Backend
```bash
cd backend
bun install
bun run dev
```

---

## 📌 Observações Importantes

1. **Templates DOCX**: Use sempre arquivos .docx originais, não PDFs convertidos
2. **Campos do Template**: Marque com `{{campo}}` para substituição automática
3. **Imagens**: Converta para base64 antes de enviar ao backend
4. **Assinaturas**: Use canvas para captura e salve como base64
5. **OCR**: Integre com serviço externo para leitura de notas fiscais
6. **PWA**: Configure manifest.json para instalação mobile


---

## 🗄️ Estrutura do Banco de Dados

### Modelos de Dados

```typescript
// types/database.ts

// Relatório salvo
export interface DatabaseReport {
  id: string;
  type: 'Fotográfico' | 'SPDA' | 'RDO' | 'Técnico' | 'Gastos';
  clientName: string;
  responsiblePerson: string;
  exportDate: string;
  pdfData: string; // base64 do arquivo
  fileName: string;
  generatedBy: string;
  template: 'NX ENERGY' | 'SERCAMP';
  osNumber?: string;
  fileSize: number;
  createdAt: string;
}

// Template de equipamento
export interface DatabaseTemplate {
  id: string;
  name: string;
  type: 'equipment' | 'merge';
  category: string;
  data: string; // JSON com campos do formulário
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version?: string;
}

// Log de auditoria
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'view' | 'download' | 'delete' | 'create' | 'edit' | 'backup' | 'restore';
  resourceType: 'report' | 'template' | 'user' | 'system';
  resourceId: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

// Template de mesclagem
export interface MergeTemplate {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
  createdBy: string;
}

// Assinatura de cliente (reutilizável)
export interface ClientSignature {
  id: string;
  clientId: string;
  clientName: string;
  osNumber: string;
  signatureData: string; // base64
  createdAt: string;
  lastUsedAt: string;
  usageCount: number;
  status: 'ativa' | 'substituida';
  relatedOsNumbers: string[];
}

// Registro de pré-acesso
export interface PreAccessRecord {
  id: string;
  osNumber: string;
  teamLeader: string;
  userId: string;
  userName: string;
  completedAt: string;
  equipment: string[];
  vehiclePhotos: {
    plate: string;
    front: string;
    back: string;
    rightSide: string;
    leftSide: string;
  };
  emailSent?: boolean;
  emailRecipients?: string[];
}

// Registro de checkout
export interface CheckoutRecord {
  id: string;
  osNumber: string;
  userId: string;
  userName: string;
  completedAt: string;
  vehiclePhotos: {
    plate: string;
    front: string;
    back: string;
    rightSide: string;
    leftSide: string;
  };
  observacoes?: string;
}
```

---

## 🎯 Campos Dinâmicos por Tipo de Equipamento

### Transformador de Força
```typescript
const transformadorFields = [
  { id: 'os', label: 'OS', type: 'text', required: true },
  { id: 'data', label: 'DATA', type: 'date', required: true },
  { id: 'cliente', label: 'CLIENTE', type: 'text', required: true },
  { id: 'cidade_uf', label: 'CIDADE/UF', type: 'text', required: true },
  { id: 'fabricante', label: 'Fabricante', type: 'text', required: true },
  { id: 'modelo', label: 'Modelo', type: 'text', required: true },
  { id: 'numero_serie', label: 'Número de Série', type: 'text', required: true },
  { id: 'potencia', label: 'Potência (kVA)', type: 'number', required: true },
  { id: 'tensao_primaria', label: 'Tensão Primária (kV)', type: 'number', required: true },
  { id: 'tensao_secundaria', label: 'Tensão Secundária (kV)', type: 'number', required: true },
  { id: 'tipo_refrigeracao', label: 'Tipo de Refrigeração', type: 'select', 
    options: ['ONAN', 'ONAF', 'OFAF', 'ODAF'], required: true },
  { id: 'ano_fabricacao', label: 'Ano de Fabricação', type: 'number' },
  { id: 'status', label: 'Status', type: 'status-selector', 
    options: ['Conforme', 'Manutenção Corretiva', 'Alerta'], required: true },
];
```

### Disjuntor
```typescript
const disjuntorFields = [
  { id: 'os', label: 'OS', type: 'text', required: true },
  { id: 'data', label: 'DATA', type: 'date', required: true },
  { id: 'cliente', label: 'CLIENTE', type: 'text', required: true },
  { id: 'fabricante', label: 'Fabricante', type: 'text', required: true },
  { id: 'modelo', label: 'Modelo', type: 'text', required: true },
  { id: 'numero_serie', label: 'Número de Série', type: 'text', required: true },
  { id: 'tensao_nominal', label: 'Tensão Nominal (kV)', type: 'number', required: true },
  { id: 'corrente_nominal', label: 'Corrente Nominal (A)', type: 'number', required: true },
  { id: 'tipo_extincao', label: 'Tipo de Extinção', type: 'select',
    options: ['SF6', 'Vácuo', 'Óleo', 'Ar Comprimido'], required: true },
  { id: 'mecanismo_operacao', label: 'Mecanismo de Operação', type: 'select',
    options: ['Mola', 'Hidráulico', 'Pneumático'], required: true },
];
```

### SPDA
```typescript
const spdaFields = [
  { id: 'ordem_servico', label: 'Ordem de Serviço', type: 'text', required: true },
  { id: 'data', label: 'Data', type: 'date', required: true },
  { id: 'cliente', label: 'Cliente', type: 'text', required: true },
  { id: 'local', label: 'Local/Endereço', type: 'text', required: true },
  { id: 'equipe_tecnica', label: 'Equipe Técnica', type: 'text', required: true },
  { id: 'tipo_spda', label: 'Tipo de SPDA', type: 'checkbox-group',
    options: ['Franklin', 'Gaiola de Faraday', 'Esfera Rolante'], required: true },
  { id: 'equipamento_medicao', label: 'Equipamento de Medição', type: 'checkbox-group',
    options: ['Termômetro Digital', 'Alicate Termômetro'], required: true },
  { id: 'status', label: 'Status Final', type: 'select',
    options: ['APROVADO', 'REPROVADO', 'PENDENTE'], required: true },
  { id: 'conclusao_observacoes', label: 'Conclusão/Observações', type: 'textarea' },
];
```

---

## 📧 Configuração de Email (Resend)

```typescript
// services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportEmail(
  to: string[],
  subject: string,
  reportBlob: Buffer,
  filename: string
) {
  const { data, error } = await resend.emails.send({
    from: 'NX Energy <relatorios@nxenergy.com.br>',
    to,
    subject,
    html: `
      <h1>Relatório Técnico</h1>
      <p>Segue em anexo o relatório solicitado.</p>
      <p>Atenciosamente,<br>Equipe NX Energy</p>
    `,
    attachments: [
      {
        filename,
        content: reportBlob,
      },
    ],
  });

  if (error) {
    throw new Error(`Erro ao enviar email: ${error.message}`);
  }

  return data;
}
```

---

## 🖼️ Componente de Captura de Foto (Svelte 5)

```svelte
<!-- src/lib/components/PhotoCapture.svelte -->
<script lang="ts">
  import { Camera, Trash2, Plus } from 'lucide-svelte';
  
  interface Photo {
    id: string;
    data: string;
    name: string;
  }
  
  let { photos = $bindable<Photo[]>([]) } = $props();
  
  let fileInput: HTMLInputElement;
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}`,
          data: e.target?.result as string,
          name: file.name,
        };
        photos = [...photos, newPhoto];
      };
      reader.readAsDataURL(file);
    }
    
    input.value = '';
  }
  
  function removePhoto(id: string) {
    photos = photos.filter(p => p.id !== id);
  }
  
  function updatePhotoName(id: string, name: string) {
    photos = photos.map(p => p.id === id ? { ...p, name } : p);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-medium">Fotos ({photos.length})</h3>
    <button
      type="button"
      onclick={() => fileInput.click()}
      class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md"
    >
      <Plus class="w-4 h-4" />
      Adicionar Foto
    </button>
  </div>
  
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    capture="environment"
    onchange={handleFileSelect}
    class="hidden"
  />
  
  {#if photos.length > 0}
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      {#each photos as photo (photo.id)}
        <div class="relative group border rounded-lg overflow-hidden">
          <img
            src={photo.data}
            alt={photo.name}
            class="w-full h-32 object-cover"
          />
          <div class="absolute inset-x-0 bottom-0 bg-black/70 p-2">
            <input
              type="text"
              value={photo.name}
              onchange={(e) => updatePhotoName(photo.id, e.currentTarget.value)}
              class="w-full text-xs text-white bg-transparent border-b border-white/30 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onclick={() => removePhoto(photo.id)}
            class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <div class="border-2 border-dashed rounded-lg p-8 text-center">
      <Camera class="w-12 h-12 mx-auto text-muted-foreground" />
      <p class="mt-2 text-sm text-muted-foreground">
        Clique em "Adicionar Foto" para capturar imagens
      </p>
    </div>
  {/if}
</div>
```

---

## 🔄 Componente de Mesclagem (Svelte 5)

```svelte
<!-- src/routes/admin/mesclagem/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { DatabaseReport, MergeTemplate } from '$lib/types';
  
  let templates = $state<MergeTemplate[]>([]);
  let availableReports = $state<DatabaseReport[]>([]);
  let selectedTemplate = $state<string | null>(null);
  let selectedReports = $state<string[]>([]);
  let isProcessing = $state(false);
  
  // Campos do template de mesclagem
  let mergeFields = $state({
    data: new Date().toISOString().split('T')[0],
    cliente: '',
    tituloServico: '',
    liderEquipe: '',
    periodo: '',
    numeroOSSercamp: '',
    localizacao: '',
    representanteCliente: '',
    colaboradores: '',
  });
  
  onMount(async () => {
    // Carregar templates de mesclagem
    const templatesRes = await fetch('/api/merge-templates');
    templates = await templatesRes.json();
    
    // Carregar relatórios disponíveis
    const reportsRes = await fetch('/api/reports/available');
    availableReports = await reportsRes.json();
  });
  
  function toggleReportSelection(reportId: string) {
    if (selectedReports.includes(reportId)) {
      selectedReports = selectedReports.filter(id => id !== reportId);
    } else {
      selectedReports = [...selectedReports, reportId];
    }
  }
  
  async function handleMerge() {
    if (!selectedTemplate || selectedReports.length === 0) {
      alert('Selecione um template e pelo menos um relatório');
      return;
    }
    
    isProcessing = true;
    
    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          fields: mergeFields,
          reportIds: selectedReports,
        }),
      });
      
      if (!response.ok) throw new Error('Erro ao mesclar');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio-Mesclado-${mergeFields.numeroOSSercamp || 'SN'}.docx`;
      a.click();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao mesclar relatórios');
    } finally {
      isProcessing = false;
    }
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold">Mesclar Relatórios</h1>
  
  <!-- Seleção de Template -->
  <div class="space-y-2">
    <label class="block font-medium">Template de Mesclagem</label>
    <select bind:value={selectedTemplate} class="w-full border rounded-md p-2">
      <option value={null}>Selecione um template</option>
      {#each templates as template}
        <option value={template.id}>{template.name}</option>
      {/each}
    </select>
  </div>
  
  <!-- Campos do Cabeçalho -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium">Data</label>
      <input type="date" bind:value={mergeFields.data} class="w-full border rounded-md p-2" />
    </div>
    <div>
      <label class="block text-sm font-medium">Cliente</label>
      <input type="text" bind:value={mergeFields.cliente} class="w-full border rounded-md p-2" />
    </div>
    <div>
      <label class="block text-sm font-medium">Título do Serviço</label>
      <input type="text" bind:value={mergeFields.tituloServico} class="w-full border rounded-md p-2" />
    </div>
    <div>
      <label class="block text-sm font-medium">Líder da Equipe</label>
      <input type="text" bind:value={mergeFields.liderEquipe} class="w-full border rounded-md p-2" />
    </div>
    <div>
      <label class="block text-sm font-medium">Período</label>
      <input type="text" bind:value={mergeFields.periodo} placeholder="Ex: 27 a 29 de junho" class="w-full border rounded-md p-2" />
    </div>
    <div>
      <label class="block text-sm font-medium">Número OS SERCAMP</label>
      <input type="text" bind:value={mergeFields.numeroOSSercamp} class="w-full border rounded-md p-2" />
    </div>
  </div>
  
  <!-- Relatórios Disponíveis -->
  <div class="space-y-2">
    <label class="block font-medium">
      Relatórios Disponíveis ({selectedReports.length} selecionado{selectedReports.length !== 1 ? 's' : ''})
    </label>
    <div class="border rounded-lg max-h-64 overflow-y-auto">
      {#each availableReports as report}
        <div
          class="flex items-center gap-3 p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50"
          class:bg-primary/10={selectedReports.includes(report.id)}
          onclick={() => toggleReportSelection(report.id)}
        >
          <input
            type="checkbox"
            checked={selectedReports.includes(report.id)}
            class="w-4 h-4"
          />
          <div class="flex-1">
            <p class="font-medium">{report.fileName}</p>
            <p class="text-sm text-muted-foreground">
              {report.type} • {report.clientName} • OS: {report.osNumber || 'N/A'}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <button
    onclick={handleMerge}
    disabled={isProcessing || !selectedTemplate || selectedReports.length === 0}
    class="w-full bg-primary text-white py-3 rounded-md disabled:opacity-50"
  >
    {isProcessing ? 'Mesclando...' : 'Gerar Documento Mesclado'}
  </button>
</div>
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Configurar Express com Bun
- [ ] Implementar autenticação JWT
- [ ] Criar rotas de usuários (CRUD)
- [ ] Criar rotas de ordens de serviço
- [ ] Criar rotas de relatórios
- [ ] Criar rotas de templates
- [ ] Implementar geração de DOCX
- [ ] Implementar mesclagem de documentos
- [ ] Configurar envio de emails (Resend)
- [ ] Implementar sistema de auditoria

### Frontend
- [ ] Configurar SvelteKit com Tailwind
- [ ] Implementar sistema de autenticação
- [ ] Criar layout com sidebar
- [ ] Implementar tela de login
- [ ] Criar dashboard admin
- [ ] Implementar CRUD de usuários
- [ ] Implementar CRUD de ordens de serviço
- [ ] Criar formulários de relatórios
- [ ] Implementar captura de fotos
- [ ] Criar interface de mesclagem
- [ ] Implementar tela de auditoria

---

## 🔗 Referências

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Bun Runtime](https://bun.sh/docs)
- [Express.js](https://expressjs.com/)
- [docxtemplater](https://docxtemplater.com/)
- [Resend Email API](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)


---

## 📁 Templates NX Energy - Documentação Completa

### Estrutura de Pastas dos Templates

```
TEMPLATE - NX/
├── BANCO DE CAPACITORES/
│   └── Banco de capacitores - SERCAMP.docx
├── CABOS/
│   └── CABOS.docx
├── CHAVE SECCIONADORA/
│   └── INSPEÇÕES GERAIS_CHAVE RELIGADORA.docx
├── DISJUNTOR/
│   └── INSPEÇÕES GERAIS_DISJUNTOR.docx
├── PARA RAIO/
│   └── Para raio - SERCAMP.docx
├── REFIFICADOR _ BATERIAS/
│   └── INSPEÇÕES GERAIS_RETIFICADOR DE BATERIA.docx
├── RELE DE PROTECAO/
│   └── Rele de protecao.docx
├── RELIGADOR/
│   ├── INSPEÇÕES GERAIS_CHAVE RELIGADORA.docx
│   └── INSPEÇÕES GERAIS_PAINEL RELIGADOR.docx
├── SPDA/
│   └── RT 04 RELATÓRIO CAMPO SPDA_rev04_05.07.2020.docx
├── TRANSFORMADOR/
│   ├── Transformador.docx
│   └── Complemento/
│       ├── TC_Saturação - NX ENERGY.doc
│       └── Transformador_FP - NX ENERGY.doc
└── TRANSFORMADOR - INSTRUMENTO/
    └── Transformador instrumento - NX ENERGY.docx
```

---

### 1. TRANSFORMADOR DE FORÇA

**Arquivo:** `TEMPLATE - NX/TRANSFORMADOR/Transformador.docx`
**Categoria:** `transformador`

#### Seções do Template

| Seção | Descrição |
|-------|-----------|
| Dados do Equipamento | Informações básicas (OS, data, cliente, local) |
| Características | Fabricante, modelo, série, potência, tensões |
| Inspeções Gerais | Checklist visual e mecânico |
| Ensaios Elétricos | Resistência isolamento, relação transformação |
| Análise de Óleo | Rigidez dielétrica, teor de água, acidez |
| Termografia | Medições de temperatura |
| Observações | Conclusões e recomendações |

#### Campos Dinâmicos - Transformador

```typescript
const transformadorPlaceholders = {
  // Cabeçalho
  '{{OS}}': 'Número da Ordem de Serviço',
  '{{DATA}}': 'Data do serviço (DD/MM/AAAA)',
  '{{CLIENTE}}': 'Nome do cliente',
  '{{LOCAL}}': 'Local de instalação',
  '{{ELABORADO_POR}}': 'Nome do técnico responsável',
  
  // Características do Equipamento
  '{{FABRICANTE}}': 'Fabricante do transformador',
  '{{TIPO}}': 'Tipo do transformador',
  '{{NUMERO_SERIE}}': 'Número de série',
  '{{ANO_FABRICACAO}}': 'Ano de fabricação',
  '{{POTENCIA_MVA}}': 'Potência nominal (MVA)',
  '{{TENSAO_PRIMARIA}}': 'Tensão primária (kV)',
  '{{TENSAO_SECUNDARIA}}': 'Tensão secundária (kV)',
  '{{TENSAO_TERCIARIA}}': 'Tensão terciária (kV) - se aplicável',
  '{{CORRENTE_NOMINAL_AT}}': 'Corrente nominal AT (A)',
  '{{CORRENTE_NOMINAL_BT}}': 'Corrente nominal BT (A)',
  '{{GRUPO_LIGACAO}}': 'Grupo de ligação (ex: Dyn1)',
  '{{TIPO_REFRIGERACAO}}': 'ONAN, ONAF, OFAF, ODAF',
  '{{PESO_TOTAL}}': 'Peso total (kg)',
  '{{PESO_OLEO}}': 'Peso do óleo (kg)',
  
  // Inspeções Gerais (checkboxes OK/NC/NA)
  '{{INSP_BUCHAS_OK}}': '☑ ou ☐',
  '{{INSP_BUCHAS_NC}}': '☑ ou ☐',
  '{{INSP_BUCHAS_NA}}': '☑ ou ☐',
  '{{INSP_RADIADORES_OK}}': '☑ ou ☐',
  '{{INSP_RADIADORES_NC}}': '☑ ou ☐',
  '{{INSP_RADIADORES_NA}}': '☑ ou ☐',
  '{{INSP_CONSERVADOR_OK}}': '☑ ou ☐',
  '{{INSP_TANQUE_OK}}': '☑ ou ☐',
  '{{INSP_VALVULAS_OK}}': '☑ ou ☐',
  '{{INSP_ATERRAMENTO_OK}}': '☑ ou ☐',
  '{{INSP_PINTURA_OK}}': '☑ ou ☐',
  '{{INSP_PLACA_DADOS_OK}}': '☑ ou ☐',
  
  // Ensaios - Resistência de Isolamento
  '{{RI_AT_TERRA}}': 'Valor em MΩ',
  '{{RI_BT_TERRA}}': 'Valor em MΩ',
  '{{RI_AT_BT}}': 'Valor em MΩ',
  '{{RI_TEMPERATURA}}': 'Temperatura ambiente (°C)',
  '{{RI_UMIDADE}}': 'Umidade relativa (%)',
  
  // Ensaios - Relação de Transformação
  '{{RT_TAP}}': 'Posição do TAP',
  '{{RT_FASE_A}}': 'Desvio fase A (%)',
  '{{RT_FASE_B}}': 'Desvio fase B (%)',
  '{{RT_FASE_C}}': 'Desvio fase C (%)',
  
  // Análise de Óleo
  '{{OLEO_RIGIDEZ}}': 'Rigidez dielétrica (kV)',
  '{{OLEO_TEOR_AGUA}}': 'Teor de água (ppm)',
  '{{OLEO_ACIDEZ}}': 'Índice de acidez (mg KOH/g)',
  '{{OLEO_COR}}': 'Cor ASTM',
  '{{OLEO_TENSAO_INTERFACIAL}}': 'Tensão interfacial (mN/m)',
  
  // Status e Conclusão
  '{{STATUS_CONFORME}}': '☑ ou ☐',
  '{{STATUS_CORRETIVA}}': '☑ ou ☐',
  '{{STATUS_ALERTA}}': '☑ ou ☐',
  '{{OBSERVACOES}}': 'Texto livre',
  '{{RECOMENDACOES}}': 'Texto livre',
};
```

---

### 2. TRANSFORMADOR PARA INSTRUMENTOS (TC/TP)

**Arquivo:** `TEMPLATE - NX/TRANSFORMADOR - INSTRUMENTO/Transformador instrumento - NX ENERGY.docx`
**Categoria:** `transformador-instrumentos`

#### Campos Dinâmicos - TC/TP

```typescript
const transformadorInstrumentosPlaceholders = {
  // Cabeçalho
  '{{TIPO_TI}}': 'TC ou TP',
  '{{CLIENTE}}': 'Nome do cliente',
  '{{DATA}}': 'Data do serviço',
  '{{LOCAL_EQUIPAMENTO}}': 'Local de instalação',
  '{{ELABORADO_POR}}': 'Técnico responsável',
  
  // Características
  '{{FABRICANTE}}': 'Fabricante',
  '{{TIPO}}': 'Tipo/Modelo',
  '{{NUMERO_SERIE_R}}': 'Nº série fase R',
  '{{NUMERO_SERIE_S}}': 'Nº série fase S',
  '{{NUMERO_SERIE_T}}': 'Nº série fase T',
  '{{RELACAO}}': 'Relação (ex: 300/5 ou 13800/115)',
  '{{ANO_FABRICACAO}}': 'Ano de fabricação',
  '{{TENSAO_NOMINAL}}': 'Tensão nominal (kV)',
  '{{POTENCIA_NOMINAL}}': 'Potência nominal (VA)',
  '{{FATOR_SERVICO}}': 'Fator de serviço',
  '{{CLASSE_PRECISAO_1}}': 'Classe precisão enrol. 1',
  '{{CLASSE_PRECISAO_2}}': 'Classe precisão enrol. 2',
  
  // Verificações (S/N/NA)
  '{{FIXACOES_ALINHAMENTOS}}': 'S, N ou N/A',
  '{{INTEGRIDADE_ISOLADORES}}': 'S, N ou N/A',
  '{{ATERRAMENTOS}}': 'S, N ou N/A',
  '{{LIMPEZA_ISOLADORES}}': 'S, N ou N/A',
  '{{REAPERTOS_CONEXOES}}': 'S, N ou N/A',
  
  // Ensaios de Relação
  '{{TENSAO_APLICADA_PRIMARIO}}': '☑ ou ☐',
  '{{TENSAO_APLICADA_SECUNDARIO}}': '☑ ou ☐',
  '{{ENROL_APLICADO}}': 'Enrolamento aplicado',
  '{{TENSAO_APLICADA}}': 'Tensão aplicada (V)',
  '{{TENSAO_MEDIDA_R}}': 'Tensão medida fase R',
  '{{TENSAO_MEDIDA_S}}': 'Tensão medida fase S',
  '{{TENSAO_MEDIDA_T}}': 'Tensão medida fase T',
  
  // Resistência de Isolamento
  '{{INSTRUMENTO_UTILIZADO}}': 'Megôhmetro utilizado',
  '{{DURACAO_ENSAIO}}': 'Duração (ex: 1 minuto)',
  '{{TEMP_AMBIENTE}}': 'Temperatura (°C)',
  '{{UMIDADE_RELATIVA}}': 'Umidade (%)',
  '{{AT_MASSA_R}}': 'AT x Massa fase R (MΩ)',
  '{{AT_MASSA_S}}': 'AT x Massa fase S (MΩ)',
  '{{AT_MASSA_T}}': 'AT x Massa fase T (MΩ)',
  '{{AT_SEC_R}}': 'AT x Sec fase R (MΩ)',
  '{{SEC_MASSA_R}}': 'Sec x Massa fase R (MΩ)',
  
  // Resistência Ôhmica
  '{{RESIST_OHMICA_R}}': 'Fase R (Ω)',
  '{{RESIST_OHMICA_S}}': 'Fase S (Ω)',
  '{{RESIST_OHMICA_T}}': 'Fase T (Ω)',
  
  // Polaridade
  '{{POLARIDADE_R}}': 'Subtrativa ou Aditiva',
  '{{POLARIDADE_S}}': 'Subtrativa ou Aditiva',
  '{{POLARIDADE_T}}': 'Subtrativa ou Aditiva',
};
```

---

### 3. DISJUNTOR

**Arquivo:** `TEMPLATE - NX/DISJUNTOR/INSPEÇÕES GERAIS_DISJUNTOR.docx`
**Categoria:** `disjuntor`

#### Campos Dinâmicos - Disjuntor

```typescript
const disjuntorPlaceholders = {
  // Dados do Equipamento
  '{{NUMERO_SERIE}}': 'Número de série',
  '{{LOCAL_INSTALACAO}}': 'Local de instalação',
  '{{TIPO}}': 'Tipo do disjuntor',
  '{{FABRICANTE}}': 'Fabricante',
  '{{DATA_FABRICACAO}}': 'Data de fabricação',
  '{{VOLUME_OLEO}}': 'Volume de óleo (L)',
  '{{CORRENTE_NOMINAL}}': 'Corrente nominal (A)',
  '{{TENSAO_NOMINAL}}': 'Tensão nominal (kV)',
  '{{MOTOR_VCA}}': 'Motor (VCA)',
  '{{BOB_MINIMA}}': 'Bobina mínima (VCA)',
  '{{BOB_ABERTURA}}': 'Bobina de abertura (VCA)',
  '{{BOB_FECHAMENTO}}': 'Bobina fechamento (VCA)',
  '{{RELE_CORRENTE}}': 'Relé de corrente (A)',
  '{{INTERRUPTANCIA}}': 'Interruptância (kA)',
  '{{TA}}': 'Temperatura ambiente (°C)',
  '{{URA}}': 'Umidade relativa (%)',
  
  // Características
  '{{UN}}': 'Tensão nominal (kV)',
  '{{IN}}': 'Corrente nominal (A)',
  '{{I_MAX_RUP}}': 'Corrente máx. ruptura (kA)',
  '{{N_SERIE_MEC}}': 'Nº série mecanismo acionamento',
  '{{QTD_CAMARA_FASE}}': 'Quantidade câmaras por fase',
  '{{TENSAO_COMANDO}}': 'Tensão de comando',
  '{{N_SERIE_CAMARA_A}}': 'Nº série câmara polo A',
  '{{N_SERIE_CAMARA_B}}': 'Nº série câmara polo B',
  '{{N_SERIE_CAMARA_C}}': 'Nº série câmara polo C',
  '{{DIELETRICO_CAMARA}}': 'Óleo, SF6, Vácuo, Ar Comprimido',
  '{{MECANISMO_ACIONAMENTO}}': 'Molas, Ar Comprimido, Hidráulico',
  
  // Inspeções Gerais (OK/NC/NA)
  '{{ABERTURA_FECHAMENTO_OK}}': '☑ ou ☐',
  '{{ABERTURA_FECHAMENTO_NC}}': '☑ ou ☐',
  '{{ABERTURA_FECHAMENTO_NA}}': '☑ ou ☐',
  '{{REVISAO_LUBRIFICACAO_OK}}': '☑ ou ☐',
  '{{REVISAO_ISOLADORES_OK}}': '☑ ou ☐',
  '{{PINTURA_OK}}': '☑ ou ☐',
  '{{INDICADOR_NIVEL_OLEO_OK}}': '☑ ou ☐',
  '{{NIVEL_OLEO_OK}}': '☑ ou ☐',
  
  // Resistência de Contato
  '{{RESIST_CONTATO_R}}': 'Fase R (μΩ)',
  '{{RESIST_CONTATO_S}}': 'Fase S (μΩ)',
  '{{RESIST_CONTATO_T}}': 'Fase T (μΩ)',
  
  // Tempos de Operação
  '{{TEMPO_ABERTURA_A}}': 'Polo A (ms)',
  '{{TEMPO_ABERTURA_B}}': 'Polo B (ms)',
  '{{TEMPO_ABERTURA_C}}': 'Polo C (ms)',
  '{{TEMPO_FECHAMENTO_A}}': 'Polo A (ms)',
  '{{TEMPO_FECHAMENTO_B}}': 'Polo B (ms)',
  '{{TEMPO_FECHAMENTO_C}}': 'Polo C (ms)',
};
```

---

### 4. RELÉ DE PROTEÇÃO

**Arquivo:** `TEMPLATE - NX/RELE DE PROTECAO/Rele de protecao.docx`
**Categoria:** `rele-protecao`

#### Campos Dinâmicos - Relé

```typescript
const releProtecaoPlaceholders = {
  // Dados do Equipamento
  '{{CLIENTE}}': 'Nome do cliente',
  '{{DATA}}': 'Data do serviço',
  '{{LOCAL}}': 'Local de instalação',
  '{{CUBICULO}}': 'Identificação do cubículo',
  '{{TAG}}': 'TAG do equipamento',
  
  // Verificações (S/N/NA)
  '{{LIMPEZA}}': 'S, N ou N/A',
  '{{REAPERTO_CONEXOES}}': 'S, N ou N/A',
  '{{INJECAO_CORRENTE}}': 'S, N ou N/A',
  '{{ATUACAO_DISJUNTOR}}': 'S, N ou N/A',
  '{{COMUNICACAO_BACKUP}}': 'S, N ou N/A',
  '{{SENSOR_CORRENTE}}': 'S, N ou N/A',
  '{{SINAIS_ENTRADA_SAIDA}}': 'S, N ou N/A',
  '{{DISPLAY_SINALIZACAO}}': 'S, N ou N/A',
  '{{SELF_TEST}}': 'S, N ou N/A',
  '{{ATERRAMENTO}}': 'S, N ou N/A',
  
  // Características do Relé
  '{{FABRICANTE}}': 'Fabricante',
  '{{TIPO_MODELO}}': 'Tipo/Modelo',
  '{{NUMERO_SERIE}}': 'Número de série',
  '{{RTC_FASE}}': 'RTC Fase',
  '{{RTC_NEUTRO}}': 'RTC Neutro',
  '{{RTP}}': 'RTP',
  '{{ALIMENTACAO}}': 'Tensão de alimentação',
  
  // Ajustes (tabela dinâmica)
  '{{AJUSTE_PARAM_1}}': 'Nome do parâmetro 1',
  '{{AJUSTE_VALOR_1}}': 'Valor do parâmetro 1',
  '{{AJUSTE_PARAM_2}}': 'Nome do parâmetro 2',
  '{{AJUSTE_VALOR_2}}': 'Valor do parâmetro 2',
  // ... até 10 parâmetros
  
  // Ensaios Temporizado Fase (51)
  '{{TEMP_FASE_TAPE}}': 'Tape (%)',
  '{{TEMP_FASE_I_APLICADA}}': 'Corrente aplicada',
  '{{TEMP_FASE_FABRICANTE}}': 'Tempo fabricante (s)',
  '{{TEMP_FASE_R}}': 'Tempo fase R (s)',
  '{{TEMP_FASE_S}}': 'Tempo fase S (s)',
  '{{TEMP_FASE_T}}': 'Tempo fase T (s)',
  '{{TEMP_FASE_PICKUP}}': 'Pick up (A)',
  
  // Ensaios Instantâneo Fase (50)
  '{{INST_FASE_TAPE}}': 'Tape (%)',
  '{{INST_FASE_I_APLICADA}}': 'Corrente aplicada',
  '{{INST_FASE_FABRICANTE}}': 'Tempo fabricante (s)',
  '{{INST_FASE_R}}': 'Tempo fase R (s)',
  '{{INST_FASE_S}}': 'Tempo fase S (s)',
  '{{INST_FASE_T}}': 'Tempo fase T (s)',
  '{{INST_FASE_PICKUP}}': 'Pick up (A)',
  
  // Ensaios Temporizado Neutro (51N)
  '{{TEMP_NEUTRO_TAPE}}': 'Tape (%)',
  '{{TEMP_NEUTRO_I_APLICADA}}': 'Corrente aplicada',
  '{{TEMP_NEUTRO_TEMPO}}': 'Tempo medido (s)',
  '{{TEMP_NEUTRO_PICKUP}}': 'Pick up (A)',
  
  // Ensaios Instantâneo Neutro (50N)
  '{{INST_NEUTRO_TAPE}}': 'Tape (%)',
  '{{INST_NEUTRO_I_APLICADA}}': 'Corrente aplicada',
  '{{INST_NEUTRO_TEMPO}}': 'Tempo medido (s)',
  '{{INST_NEUTRO_PICKUP}}': 'Pick up (A)',
};
```

---

### 5. RETIFICADOR E BATERIAS

**Arquivo:** `TEMPLATE - NX/REFIFICADOR _ BATERIAS/INSPEÇÕES GERAIS_RETIFICADOR DE BATERIA.docx`
**Categoria:** `retificador-bateria`

#### Campos Dinâmicos - Retificador/Baterias

```typescript
const retificadorBateriasPlaceholders = {
  // Dados Gerais
  '{{CLIENTE}}': 'Nome do cliente',
  '{{DATA}}': 'Data do serviço',
  '{{LOCAL_EQUIPAMENTO}}': 'Local de instalação',
  '{{ELABORADO_POR}}': 'Técnico responsável',
  
  // Características do Retificador
  '{{FABRICANTE_RET}}': 'Fabricante do retificador',
  '{{TIPO_RET}}': 'Tipo/Modelo',
  '{{NUMERO_SERIE_RET}}': 'Número de série',
  '{{ANO_FABRICACAO_RET}}': 'Ano de fabricação',
  '{{TENSAO_ENTRADA}}': 'Tensão entrada (Vca)',
  '{{TENSAO_SAIDA}}': 'Tensão saída (Vcc)',
  '{{TENSAO_FLUTUACAO}}': 'Tensão flutuação (Vcc)',
  '{{TENSAO_RECARGA}}': 'Tensão recarga (Vcc)',
  '{{CORRENTE_ENTRADA}}': 'Corrente entrada (A)',
  '{{CORRENTE_SAIDA}}': 'Corrente saída (A)',
  '{{POTENCIA_ENTRADA}}': 'Potência entrada (kVA)',
  '{{POTENCIA_SAIDA}}': 'Potência saída (kVA)',
  
  // Características das Baterias
  '{{FABRICANTE_BAT}}': 'Fabricante das baterias',
  '{{TIPO_BAT}}': 'Tipo das baterias',
  '{{ANO_FABRICACAO_BAT}}': 'Ano de fabricação',
  '{{CAPACIDADE_NOMINAL}}': 'Capacidade nominal (A/H)',
  '{{AUTONOMIA}}': 'Autonomia (H)',
  '{{QTD_ELEMENTOS}}': 'Quantidade de elementos',
  '{{TENSAO_ELEMENTO}}': 'Tensão por elemento (Vcc)',
  '{{TENSAO_NOMINAL_BANCO}}': 'Tensão nominal banco (Vcc)',
  '{{TIPO_ELETROLITO}}': 'Chumbo-Ácido ou Alcalino',
  
  // Verificações Retificador (S/N/NA)
  '{{LIMPEZA_CONSERVACOES_RET}}': 'S, N ou N/A',
  '{{REAPERTOS_CONEXOES_RET}}': 'S, N ou N/A',
  '{{ATERRAMENTO_PAINEL}}': 'S, N ou N/A',
  '{{CIRCUITOS_ALARMES}}': 'S, N ou N/A',
  '{{TENSAO_FLUTUACAO_VERIF}}': 'S, N ou N/A',
  '{{TENSAO_RECARGA_VERIF}}': 'S, N ou N/A',
  '{{CORRENTE_RECARGA_VERIF}}': 'S, N ou N/A',
  '{{OPERACAO_MANUAL_AUTO}}': 'S, N ou N/A',
  
  // Verificações Baterias (S/N/NA)
  '{{LIMPEZA_CONSERVACOES_BAT}}': 'S, N ou N/A',
  '{{ALINHAMENTOS_ELEMENTOS}}': 'S, N ou N/A',
  '{{ESTRUTURAS_BOM_ESTADO}}': 'S, N ou N/A',
  '{{ATERRAMENTO_BAT}}': 'S, N ou N/A',
  '{{REAPERTOS_CONEXOES_BAT}}': 'S, N ou N/A',
  '{{NIVEIS_ELETROLITOS}}': 'S, N ou N/A',
  '{{DENSIDADE_ELETROLITOS}}': 'S, N ou N/A',
  '{{TENSAO_ELEMENTOS}}': 'S, N ou N/A',
  
  // Medições por Elemento (tabela dinâmica)
  '{{ELEMENTO_01_TENSAO}}': 'Tensão elemento 1 (V)',
  '{{ELEMENTO_01_DENSIDADE}}': 'Densidade elemento 1',
  // ... até elemento 60
  
  // Totais
  '{{TENSAO_TOTAL_VCC}}': 'Tensão total (Vcc)',
  '{{TEMP_AMBIENTE_MEDICAO}}': 'Temperatura ambiente (°C)',
};
```

---

### 6. PARA-RAIOS

**Arquivo:** `TEMPLATE - NX/PARA RAIO/Para raio - SERCAMP.docx`
**Categoria:** `para-raios`

#### Campos Dinâmicos - Para-Raios

```typescript
const paraRaiosPlaceholders = {
  // Dados do Equipamento
  '{{OS}}': 'Ordem de serviço',
  '{{DATA}}': 'Data do serviço',
  '{{CLIENTE}}': 'Nome do cliente',
  '{{LOCAL}}': 'Local de instalação',
  '{{ELABORADO_POR}}': 'Técnico responsável',
  
  // Características
  '{{FABRICANTE}}': 'Fabricante',
  '{{TIPO}}': 'Tipo/Modelo',
  '{{NUMERO_SERIE}}': 'Número de série',
  '{{TENSAO_NOMINAL}}': 'Tensão nominal (kV)',
  '{{CORRENTE_DESCARGA}}': 'Corrente de descarga (kA)',
  '{{CLASSE_ISOLAMENTO}}': 'Classe de isolamento',
  '{{ANO_FABRICACAO}}': 'Ano de fabricação',
  
  // Inspeções Visuais (OK/NC/NA)
  '{{INSP_CORPO_ISOLADOR_OK}}': '☑ ou ☐',
  '{{INSP_CONEXOES_OK}}': '☑ ou ☐',
  '{{INSP_ATERRAMENTO_OK}}': '☑ ou ☐',
  '{{INSP_CONTADOR_DESCARGAS_OK}}': '☑ ou ☐',
  '{{INSP_FIXACAO_OK}}': '☑ ou ☐',
  
  // Ensaios
  '{{RESIST_ISOLAMENTO}}': 'Resistência de isolamento (MΩ)',
  '{{CORRENTE_FUGA}}': 'Corrente de fuga (μA)',
  '{{RESIST_ATERRAMENTO}}': 'Resistência de aterramento (Ω)',
  
  // Termografia
  '{{TEMP_FASE_A}}': 'Temperatura fase A (°C)',
  '{{TEMP_FASE_B}}': 'Temperatura fase B (°C)',
  '{{TEMP_FASE_C}}': 'Temperatura fase C (°C)',
  '{{TEMP_AMBIENTE}}': 'Temperatura ambiente (°C)',
  
  // Status
  '{{STATUS}}': 'Conforme, Corretiva ou Alerta',
  '{{OBSERVACOES}}': 'Observações/Recomendações',
};
```

---

### 7. RELIGADOR E CHAVE SECCIONADORA

**Arquivos:** 
- `TEMPLATE - NX/RELIGADOR/INSPEÇÕES GERAIS_CHAVE RELIGADORA.docx`
- `TEMPLATE - NX/RELIGADOR/INSPEÇÕES GERAIS_PAINEL RELIGADOR.docx`
- `TEMPLATE - NX/CHAVE SECCIONADORA/INSPEÇÕES GERAIS_CHAVE RELIGADORA.docx`

**Categoria:** `religador`, `chave-seccionadora`

#### Campos Dinâmicos - Religador/Chave

```typescript
const religadorPlaceholders = {
  // Dados do Equipamento
  '{{CLIENTE}}': 'Nome do cliente',
  '{{DATA}}': 'Data do serviço',
  '{{LOCAL}}': 'Local de instalação',
  '{{TAG}}': 'TAG do equipamento',
  
  // Características
  '{{FABRICANTE}}': 'Fabricante',
  '{{MODELO}}': 'Modelo',
  '{{NUMERO_SERIE}}': 'Número de série',
  '{{TENSAO_NOMINAL}}': 'Tensão nominal (kV)',
  '{{CORRENTE_NOMINAL}}': 'Corrente nominal (A)',
  '{{CORRENTE_INTERRUPCAO}}': 'Corrente de interrupção (kA)',
  '{{MEIO_EXTINCAO}}': 'Meio de extinção (SF6, Vácuo, Óleo)',
  '{{ANO_FABRICACAO}}': 'Ano de fabricação',
  
  // Inspeções Gerais (OK/NC/NA)
  '{{INSP_ESTRUTURA_OK}}': '☑ ou ☐',
  '{{INSP_ISOLADORES_OK}}': '☑ ou ☐',
  '{{INSP_CONEXOES_OK}}': '☑ ou ☐',
  '{{INSP_ATERRAMENTO_OK}}': '☑ ou ☐',
  '{{INSP_MECANISMO_OK}}': '☑ ou ☐',
  '{{INSP_SINALIZACAO_OK}}': '☑ ou ☐',
  '{{INSP_PINTURA_OK}}': '☑ ou ☐',
  
  // Painel de Controle
  '{{PAINEL_FABRICANTE}}': 'Fabricante do painel',
  '{{PAINEL_MODELO}}': 'Modelo do painel',
  '{{PAINEL_SERIE}}': 'Número de série',
  '{{PAINEL_ALIMENTACAO}}': 'Tensão de alimentação',
  
  // Verificações Painel (S/N/NA)
  '{{PAINEL_LIMPEZA}}': 'S, N ou N/A',
  '{{PAINEL_CONEXOES}}': 'S, N ou N/A',
  '{{PAINEL_DISPLAY}}': 'S, N ou N/A',
  '{{PAINEL_COMUNICACAO}}': 'S, N ou N/A',
  '{{PAINEL_BATERIAS}}': 'S, N ou N/A',
  '{{PAINEL_ATERRAMENTO}}': 'S, N ou N/A',
  
  // Ensaios
  '{{RESIST_CONTATO_A}}': 'Resistência contato polo A (μΩ)',
  '{{RESIST_CONTATO_B}}': 'Resistência contato polo B (μΩ)',
  '{{RESIST_CONTATO_C}}': 'Resistência contato polo C (μΩ)',
  '{{TEMPO_ABERTURA}}': 'Tempo de abertura (ms)',
  '{{TEMPO_FECHAMENTO}}': 'Tempo de fechamento (ms)',
  '{{RESIST_ISOLAMENTO}}': 'Resistência de isolamento (MΩ)',
};
```

---

### 8. BANCO DE CAPACITORES

**Arquivo:** `TEMPLATE - NX/BANCO DE CAPACITORES/Banco de capacitores - SERCAMP.docx`
**Categoria:** `banco-capacitores`

#### Campos Dinâmicos - Banco de Capacitores

```typescript
const bancoCapacitoresPlaceholders = {
  // Dados do Equipamento
  '{{OS}}': 'Ordem de serviço',
  '{{DATA}}': 'Data do serviço',
  '{{CLIENTE}}': 'Nome do cliente',
  '{{LOCAL}}': 'Local de instalação',
  
  // Características do Banco
  '{{FABRICANTE}}': 'Fabricante',
  '{{MODELO}}': 'Modelo',
  '{{NUMERO_SERIE}}': 'Número de série',
  '{{TENSAO_NOMINAL}}': 'Tensão nominal (kV)',
  '{{POTENCIA_REATIVA}}': 'Potência reativa (kVAr)',
  '{{FREQUENCIA}}': 'Frequência (Hz)',
  '{{QTD_UNIDADES}}': 'Quantidade de unidades',
  '{{CAPACITANCIA}}': 'Capacitância (μF)',
  '{{ANO_FABRICACAO}}': 'Ano de fabricação',
  
  // Inspeções Visuais (OK/NC/NA)
  '{{INSP_ESTRUTURA_OK}}': '☑ ou ☐',
  '{{INSP_ISOLADORES_OK}}': '☑ ou ☐',
  '{{INSP_CONEXOES_OK}}': '☑ ou ☐',
  '{{INSP_FUSSIVEIS_OK}}': '☑ ou ☐',
  '{{INSP_ATERRAMENTO_OK}}': '☑ ou ☐',
  '{{INSP_RESISTORES_DESCARGA_OK}}': '☑ ou ☐',
  '{{INSP_VENTILACAO_OK}}': '☑ ou ☐',
  
  // Medições por Unidade
  '{{UNIDADE_01_CAPACITANCIA}}': 'Capacitância unidade 1 (μF)',
  '{{UNIDADE_01_RESIST_ISOLAMENTO}}': 'Resist. isolamento unidade 1 (MΩ)',
  // ... até quantidade de unidades
  
  // Ensaios Gerais
  '{{RESIST_ISOLAMENTO_GERAL}}': 'Resistência isolamento geral (MΩ)',
  '{{FATOR_POTENCIA}}': 'Fator de potência (%)',
  '{{DESVIO_CAPACITANCIA}}': 'Desvio de capacitância (%)',
  
  // Status
  '{{STATUS}}': 'Conforme, Corretiva ou Alerta',
  '{{OBSERVACOES}}': 'Observações/Recomendações',
};
```

---

### 9. CABOS

**Arquivo:** `TEMPLATE - NX/CABOS/CABOS.docx`
**Categoria:** `cabos`

#### Campos Dinâmicos - Cabos

```typescript
const cabosPlaceholders = {
  // Dados do Equipamento
  '{{OS}}': 'Ordem de serviço',
  '{{DATA}}': 'Data do serviço',
  '{{CLIENTE}}': 'Nome do cliente',
  '{{LOCAL}}': 'Local de instalação',
  '{{TRECHO}}': 'Identificação do trecho',
  
  // Características do Cabo
  '{{FABRICANTE}}': 'Fabricante',
  '{{TIPO}}': 'Tipo do cabo',
  '{{SECAO}}': 'Seção (mm²)',
  '{{TENSAO_NOMINAL}}': 'Tensão nominal (kV)',
  '{{COMPRIMENTO}}': 'Comprimento (m)',
  '{{ANO_INSTALACAO}}': 'Ano de instalação',
  '{{MATERIAL_CONDUTOR}}': 'Cobre ou Alumínio',
  '{{TIPO_ISOLAMENTO}}': 'XLPE, EPR, PVC, etc.',
  
  // Inspeções Visuais (OK/NC/NA)
  '{{INSP_TERMINACOES_OK}}': '☑ ou ☐',
  '{{INSP_EMENDAS_OK}}': '☑ ou ☐',
  '{{INSP_BLINDAGEM_OK}}': '☑ ou ☐',
  '{{INSP_ATERRAMENTO_OK}}': '☑ ou ☐',
  '{{INSP_IDENTIFICACAO_OK}}': '☑ ou ☐',
  
  // Ensaios
  '{{RESIST_ISOLAMENTO_FASE_A}}': 'Resist. isolamento fase A (MΩ)',
  '{{RESIST_ISOLAMENTO_FASE_B}}': 'Resist. isolamento fase B (MΩ)',
  '{{RESIST_ISOLAMENTO_FASE_C}}': 'Resist. isolamento fase C (MΩ)',
  '{{RESIST_CONDUTOR_FASE_A}}': 'Resist. condutor fase A (Ω/km)',
  '{{RESIST_CONDUTOR_FASE_B}}': 'Resist. condutor fase B (Ω/km)',
  '{{RESIST_CONDUTOR_FASE_C}}': 'Resist. condutor fase C (Ω/km)',
  '{{INDICE_POLARIZACAO}}': 'Índice de polarização',
  '{{INDICE_ABSORCAO}}': 'Índice de absorção',
  
  // Termografia
  '{{TEMP_TERMINACAO_A}}': 'Temp. terminação A (°C)',
  '{{TEMP_TERMINACAO_B}}': 'Temp. terminação B (°C)',
  '{{TEMP_TERMINACAO_C}}': 'Temp. terminação C (°C)',
  
  // Status
  '{{STATUS}}': 'Conforme, Corretiva ou Alerta',
  '{{OBSERVACOES}}': 'Observações/Recomendações',
};
```

---

### 10. SPDA (Sistema de Proteção contra Descargas Atmosféricas)

**Arquivo:** `TEMPLATE - NX/SPDA/RT 04 RELATÓRIO CAMPO SPDA_rev04_05.07.2020.docx`
**Categoria:** `spda`

#### Campos Dinâmicos - SPDA

```typescript
const spdaPlaceholders = {
  // Cabeçalho
  '{{ORDEM_SERVICO}}': 'Número da OS',
  '{{CLIENTE}}': 'Nome do cliente',
  '{{DATA}}': 'Data do serviço (DD/MM/AAAA)',
  '{{LOCAL}}': 'Endereço/Local',
  '{{EQUIPE_TECNICA}}': 'Nomes dos técnicos',
  
  // Tipo de SPDA (checkboxes)
  '{{SPDA_FRANKLIN}}': '☑ ou ☐ - Método de Franklin',
  '{{SPDA_GAIOLA}}': '☑ ou ☐ - Método Gaiola de Faraday ou Malha',
  '{{SPDA_ESFERA}}': '☑ ou ☐ - Método Esfera Rolante/Eletrogeométrico',
  
  // Status do SPDA (checkboxes)
  '{{STATUS_ESTRUTURAL}}': '☑ ou ☐ - SPDA Estrutural (natural)',
  '{{STATUS_NAO_ESTRUTURAL}}': '☑ ou ☐ - SPDA Não Estrutural',
  
  // Equipamentos de Medição (checkboxes)
  '{{TERMO_DIGITAL}}': '☑ ou ☐ - Termômetro Digital',
  '{{ALICATE_TERMO}}': '☑ ou ☐ - Alicate Termômetro',
  '{{TERROMETRO}}': '☑ ou ☐ - Terrômetro',
  '{{REVESTIDA_CABOS}}': 'Seção dos cabos (mm²)',
  
  // Inspeções Gerais (OK/NC/NA para cada item)
  '{{PROJETO_OK}}': '☑ ou ☐',
  '{{PROJETO_NC}}': '☑ ou ☐',
  '{{PROJETO_NA}}': '☑ ou ☐',
  '{{CAPTACAO_OK}}': '☑ ou ☐',
  '{{CAPTACAO_NC}}': '☑ ou ☐',
  '{{CAPTACAO_NA}}': '☑ ou ☐',
  '{{DESCIDA_CONDUTORES_OK}}': '☑ ou ☐',
  '{{DESCIDA_CONDUTORES_NC}}': '☑ ou ☐',
  '{{DESCIDA_CONDUTORES_NA}}': '☑ ou ☐',
  '{{DESCIDA_CONEXOES_OK}}': '☑ ou ☐',
  '{{DESCIDA_CONEXOES_NC}}': '☑ ou ☐',
  '{{DESCIDA_CONEXOES_NA}}': '☑ ou ☐',
  '{{EQUIPOTENCIALIZACOES_OK}}': '☑ ou ☐',
  '{{EQUIPOTENCIALIZACOES_NC}}': '☑ ou ☐',
  '{{EQUIPOTENCIALIZACOES_NA}}': '☑ ou ☐',
  '{{ATERRAMENTO_OK}}': '☑ ou ☐',
  '{{ATERRAMENTO_NC}}': '☑ ou ☐',
  '{{ATERRAMENTO_NA}}': '☑ ou ☐',
  '{{INTEGRIDADE_OK}}': '☑ ou ☐',
  '{{INTEGRIDADE_NC}}': '☑ ou ☐',
  '{{INTEGRIDADE_NA}}': '☑ ou ☐',
  '{{CAIXA_OK}}': '☑ ou ☐',
  '{{CAIXA_NC}}': '☑ ou ☐',
  '{{CAIXA_NA}}': '☑ ou ☐',
  '{{ISOLADORES_OK}}': '☑ ou ☐',
  '{{ISOLADORES_NC}}': '☑ ou ☐',
  '{{ISOLADORES_NA}}': '☑ ou ☐',
  '{{ELETRODUTO_OK}}': '☑ ou ☐',
  '{{ELETRODUTO_NC}}': '☑ ou ☐',
  '{{ELETRODUTO_NA}}': '☑ ou ☐',
  '{{RUPTURA_SIM}}': '☑ ou ☐',
  '{{RUPTURA_NAO}}': '☑ ou ☐',
  
  // Pontos de Medição (01 a 20)
  '{{PONTO_01}}': 'Número do ponto (01)',
  '{{VALOR_01}}': 'Valor medido em Ω',
  '{{FOTO_NUM_01}}': 'Número da foto',
  // ... até PONTO_20, VALOR_20, FOTO_NUM_20
  
  // Imagens
  '{{CROQUI_IMAGEM}}': 'Imagem base64 do croqui/planta',
  '{{FOTO_PONTO_01}}': 'Foto base64 do ponto 01',
  // ... até FOTO_PONTO_20
  
  // Status Final
  '{{STATUS}}': 'APROVADO, REPROVADO ou PENDENTE',
  
  // Conclusão
  '{{CONCLUSAO}}': 'Texto de conclusão',
  '{{OBSERVACOES}}': 'Observações gerais',
  '{{RECOMENDACOES}}': 'Recomendações técnicas',
  
  // Assinaturas
  '{{ASSINATURA_TECNICO}}': 'Assinatura base64 do técnico',
  '{{ASSINATURA_CLIENTE}}': 'Assinatura base64 do cliente',
};
```

---

## 🔧 Sistema de Placeholders - Guia Completo

### Convenção de Nomenclatura

| Padrão | Uso | Exemplo |
|--------|-----|---------|
| `{{CAMPO}}` | Campo de texto simples | `{{CLIENTE}}` |
| `{{CAMPO_OK}}` | Checkbox OK | `{{PROJETO_OK}}` |
| `{{CAMPO_NC}}` | Checkbox Não Conforme | `{{PROJETO_NC}}` |
| `{{CAMPO_NA}}` | Checkbox Não Aplicável | `{{PROJETO_NA}}` |
| `{{CAMPO_XX}}` | Campo indexado (01-99) | `{{PONTO_01}}` |
| `{{CAMPO_FASE_X}}` | Campo por fase (A/B/C ou R/S/T) | `{{TEMP_FASE_A}}` |
| `{{CAMPO_IMAGEM}}` | Placeholder para imagem | `{{CROQUI_IMAGEM}}` |

### Tipos de Valores

```typescript
// Mapeamento de tipos de placeholder para valores
const placeholderTypes = {
  // Texto simples
  text: (value: string) => value || '',
  
  // Data formatada
  date: (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR');
  },
  
  // Checkbox (☑ ou ☐)
  checkbox: (checked: boolean) => checked ? '☑' : '☐',
  
  // Select S/N/NA
  selectSNA: (value: string) => value || 'N/A',
  
  // Número com unidade
  number: (value: number, unit: string) => 
    value !== undefined ? `${value} ${unit}` : '',
  
  // Imagem base64
  image: (base64: string) => base64 || '',
  
  // Status com cor
  status: (value: 'conforme' | 'corretiva' | 'alerta') => {
    const map = {
      conforme: 'CONFORME',
      corretiva: 'MANUTENÇÃO CORRETIVA',
      alerta: 'ALERTA',
    };
    return map[value] || '';
  },
};
```

### Função de Substituição Universal

```typescript
// services/placeholder-replacer.ts
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import ImageModule from 'docxtemplater-image-module-free';

interface ReplacementData {
  [key: string]: string | number | boolean | null;
}

export async function replaceDocxPlaceholders(
  templateBuffer: ArrayBuffer,
  data: ReplacementData
): Promise<Blob> {
  // Configurar módulo de imagens
  const imageModule = new ImageModule({
    centered: false,
    getImage: (tagValue: string) => {
      if (tagValue?.startsWith('data:image')) {
        const base64Data = tagValue.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }
      return Buffer.from('');
    },
    getSize: (img: Buffer, tagValue: string, tagName: string) => {
      // Tamanhos específicos por tipo
      if (tagName.includes('CROQUI')) return [500, 400];
      if (tagName.includes('FOTO_PONTO')) return [300, 225];
      if (tagName.includes('ASSINATURA')) return [200, 80];
      if (tagName.includes('LOGO')) return [150, 60];
      return [400, 300];
    },
  });

  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  });

  // Processar dados antes de substituir
  const processedData = processReplacementData(data);
  
  doc.render(processedData);

  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });
}

function processReplacementData(data: ReplacementData): ReplacementData {
  const processed: ReplacementData = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Converter booleanos para checkboxes
    if (typeof value === 'boolean') {
      processed[key] = value ? '☑' : '☐';
    }
    // Converter arrays de checkbox-group
    else if (Array.isArray(value)) {
      // Para cada opção possível, criar um placeholder
      value.forEach((item, index) => {
        processed[`${key}_${index + 1}`] = item;
      });
    }
    // Formatar datas
    else if (key.toLowerCase().includes('data') && value) {
      const date = new Date(value as string);
      processed[key] = date.toLocaleDateString('pt-BR');
    }
    // Valores normais
    else {
      processed[key] = value ?? '';
    }
  }
  
  return processed;
}
```

### Mapeamento de Campos do Formulário para Placeholders

```typescript
// lib/field-to-placeholder-map.ts

// Mapeamento de IDs de campos do formulário para placeholders do template
export const fieldToPlaceholderMap: Record<string, Record<string, string>> = {
  // SPDA
  spda: {
    ordem_servico: 'ORDEM_SERVICO',
    cliente: 'CLIENTE',
    data: 'DATA',
    local: 'LOCAL',
    equipe_tecnica: 'EQUIPE_TECNICA',
    tipo_spda: 'TIPO_SPDA', // Array - será expandido
    projeto_spda: 'PROJETO', // Gera PROJETO_OK, PROJETO_NC, PROJETO_NA
    subsistema_captacao: 'CAPTACAO',
    subsistema_descida_condutores: 'DESCIDA_CONDUTORES',
    subsistema_descida_conexoes: 'DESCIDA_CONEXOES',
    condicao_equipotencializacoes: 'EQUIPOTENCIALIZACOES',
    subsistema_aterramento: 'ATERRAMENTO',
    integridade_condutores: 'INTEGRIDADE',
    caixa_inspecao: 'CAIXA',
    isoladores: 'ISOLADORES',
    eletroduto_pcv: 'ELETRODUTO',
    ponto_ruptura: 'RUPTURA',
    conclusao_observacoes: 'CONCLUSAO',
    observacoes: 'OBSERVACOES',
    recomendacoes: 'RECOMENDACOES',
  },
  
  // Transformador
  transformador: {
    os: 'OS',
    data: 'DATA',
    cliente: 'CLIENTE',
    local: 'LOCAL',
    fabricante: 'FABRICANTE',
    tipo: 'TIPO',
    numero_serie: 'NUMERO_SERIE',
    potencia_mva: 'POTENCIA_MVA',
    tensao_primaria: 'TENSAO_PRIMARIA',
    tensao_secundaria: 'TENSAO_SECUNDARIA',
    grupo_ligacao: 'GRUPO_LIGACAO',
    tipo_refrigeracao: 'TIPO_REFRIGERACAO',
    // Inspeções
    insp_buchas: 'INSP_BUCHAS',
    insp_radiadores: 'INSP_RADIADORES',
    insp_conservador: 'INSP_CONSERVADOR',
    insp_tanque: 'INSP_TANQUE',
    // Ensaios
    ri_at_terra: 'RI_AT_TERRA',
    ri_bt_terra: 'RI_BT_TERRA',
    ri_at_bt: 'RI_AT_BT',
    // Análise de óleo
    oleo_rigidez: 'OLEO_RIGIDEZ',
    oleo_teor_agua: 'OLEO_TEOR_AGUA',
    oleo_acidez: 'OLEO_ACIDEZ',
  },
  
  // Disjuntor
  disjuntor: {
    numero_serie: 'NUMERO_SERIE',
    local_instalacao: 'LOCAL_INSTALACAO',
    tipo: 'TIPO',
    fabricante: 'FABRICANTE',
    corrente_nominal: 'CORRENTE_NOMINAL',
    tensao_nominal: 'TENSAO_NOMINAL',
    dieletrico_camara: 'DIELETRICO_CAMARA',
    mecanismo_acionamento: 'MECANISMO_ACIONAMENTO',
    // Inspeções
    abertura_fechamento: 'ABERTURA_FECHAMENTO',
    revisao_lubrificacao: 'REVISAO_LUBRIFICACAO',
    revisao_isoladores: 'REVISAO_ISOLADORES',
    // Resistência de contato
    resist_contato_r: 'RESIST_CONTATO_R',
    resist_contato_s: 'RESIST_CONTATO_S',
    resist_contato_t: 'RESIST_CONTATO_T',
    // Tempos
    tempo_abertura_a: 'TEMPO_ABERTURA_A',
    tempo_abertura_b: 'TEMPO_ABERTURA_B',
    tempo_abertura_c: 'TEMPO_ABERTURA_C',
  },
  
  // Relé de Proteção
  'rele-protecao': {
    cliente: 'CLIENTE',
    data: 'DATA',
    local: 'LOCAL',
    cubiculo: 'CUBICULO',
    tag: 'TAG',
    fabricante: 'FABRICANTE',
    tipo_modelo: 'TIPO_MODELO',
    numero_serie: 'NUMERO_SERIE',
    rtc_fase: 'RTC_FASE',
    rtc_neutro: 'RTC_NEUTRO',
    rtp: 'RTP',
    alimentacao: 'ALIMENTACAO',
    // Verificações
    limpeza: 'LIMPEZA',
    reaperto_conexoes: 'REAPERTO_CONEXOES',
    injecao_corrente: 'INJECAO_CORRENTE',
    atuacao_disjuntor: 'ATUACAO_DISJUNTOR',
    // Ensaios
    temp_fase_tape: 'TEMP_FASE_TAPE',
    temp_fase_i_aplicada: 'TEMP_FASE_I_APLICADA',
    temp_fase_r: 'TEMP_FASE_R',
    temp_fase_s: 'TEMP_FASE_S',
    temp_fase_t: 'TEMP_FASE_T',
  },
};

// Função para expandir campos de inspeção (OK/NC/NA)
export function expandInspectionField(
  fieldId: string, 
  value: 'OK' | 'NC' | 'NA',
  placeholderBase: string
): Record<string, string> {
  return {
    [`${placeholderBase}_OK`]: value === 'OK' ? '☑' : '☐',
    [`${placeholderBase}_NC`]: value === 'NC' ? '☑' : '☐',
    [`${placeholderBase}_NA`]: value === 'NA' ? '☑' : '☐',
  };
}

// Função para expandir checkbox-group
export function expandCheckboxGroup(
  selectedOptions: string[],
  allOptions: { value: string; placeholder: string }[]
): Record<string, string> {
  const result: Record<string, string> = {};
  
  allOptions.forEach(option => {
    result[option.placeholder] = selectedOptions.includes(option.value) ? '☑' : '☐';
  });
  
  return result;
}
```

### Exemplo de Uso Completo

```typescript
// Exemplo: Gerando relatório SPDA completo
async function generateSPDAReport(formData: SPDAFormData): Promise<Blob> {
  // 1. Carregar template
  const templateResponse = await fetch('/templates/SPDA-NX-ENERGY-template.docx');
  const templateBuffer = await templateResponse.arrayBuffer();
  
  // 2. Preparar dados para substituição
  const replacementData: Record<string, any> = {
    // Campos básicos
    ORDEM_SERVICO: formData.ordem_servico,
    CLIENTE: formData.cliente,
    DATA: formData.data,
    LOCAL: formData.local,
    EQUIPE_TECNICA: formData.equipe_tecnica,
    
    // Tipo de SPDA (checkbox-group)
    ...expandCheckboxGroup(formData.tipo_spda, [
      { value: 'Método de Franklin', placeholder: 'SPDA_FRANKLIN' },
      { value: 'Método Gaiola de Faraday ou Malha', placeholder: 'SPDA_GAIOLA' },
      { value: 'Método Esfera Rolante', placeholder: 'SPDA_ESFERA' },
    ]),
    
    // Status SPDA
    ...expandCheckboxGroup(formData.status_spda, [
      { value: 'SPDA Estrutural (natural)', placeholder: 'STATUS_ESTRUTURAL' },
      { value: 'SPDA Não Estrutural', placeholder: 'STATUS_NAO_ESTRUTURAL' },
    ]),
    
    // Inspeções (OK/NC/NA)
    ...expandInspectionField('projeto_spda', formData.projeto_spda, 'PROJETO'),
    ...expandInspectionField('subsistema_captacao', formData.subsistema_captacao, 'CAPTACAO'),
    ...expandInspectionField('subsistema_descida_condutores', formData.subsistema_descida_condutores, 'DESCIDA_CONDUTORES'),
    ...expandInspectionField('subsistema_descida_conexoes', formData.subsistema_descida_conexoes, 'DESCIDA_CONEXOES'),
    ...expandInspectionField('condicao_equipotencializacoes', formData.condicao_equipotencializacoes, 'EQUIPOTENCIALIZACOES'),
    ...expandInspectionField('subsistema_aterramento', formData.subsistema_aterramento, 'ATERRAMENTO'),
    ...expandInspectionField('integridade_condutores', formData.integridade_condutores, 'INTEGRIDADE'),
    ...expandInspectionField('caixa_inspecao', formData.caixa_inspecao, 'CAIXA'),
    ...expandInspectionField('isoladores', formData.isoladores, 'ISOLADORES'),
    ...expandInspectionField('eletroduto_pcv', formData.eletroduto_pcv, 'ELETRODUTO'),
    
    // Ponto de ruptura (SIM/NÃO)
    RUPTURA_SIM: formData.ponto_ruptura === 'SIM' ? '☑' : '☐',
    RUPTURA_NAO: formData.ponto_ruptura === 'NÃO' ? '☑' : '☐',
    
    // Pontos de medição (dinâmico)
    ...formData.pontos.reduce((acc, ponto, index) => {
      const num = String(index + 1).padStart(2, '0');
      return {
        ...acc,
        [`PONTO_${num}`]: num,
        [`VALOR_${num}`]: ponto.valor || '',
        [`FOTO_NUM_${num}`]: ponto.nFoto || '',
        [`FOTO_PONTO_${num}`]: ponto.foto || '',
      };
    }, {}),
    
    // Croqui
    CROQUI_IMAGEM: formData.croquiData || '',
    
    // Status final
    STATUS: formData.status,
    
    // Conclusão
    CONCLUSAO: formData.conclusao || '',
    OBSERVACOES: formData.observacoes || '',
    RECOMENDACOES: formData.recomendacoes || '',
  };
  
  // 3. Gerar documento
  return await replaceDocxPlaceholders(templateBuffer, replacementData);
}
```

---

## 📋 Checklist para Preparar Novos Templates

### Antes de Começar
- [ ] Obter arquivo Word original (.docx) do cliente/empresa
- [ ] Verificar se o layout está correto e aprovado
- [ ] Identificar todos os campos dinâmicos

### Preparação do Template
- [ ] Abrir arquivo no Microsoft Word
- [ ] Substituir cada valor dinâmico por `{{PLACEHOLDER}}`
- [ ] Para checkboxes: usar `{{CAMPO_OK}}`, `{{CAMPO_NC}}`, `{{CAMPO_NA}}`
- [ ] Para imagens: usar `{{CAMPO_IMAGEM}}`
- [ ] Manter formatação original (não alterar fontes, cores, tamanhos)
- [ ] Salvar como .docx (não .doc)

### Validação
- [ ] Testar substituição com dados de exemplo
- [ ] Verificar se checkboxes aparecem corretamente (☑/☐)
- [ ] Verificar se imagens são inseridas no tamanho correto
- [ ] Verificar se layout não quebra com textos longos
- [ ] Testar em diferentes visualizadores (Word, LibreOffice, Google Docs)

### Documentação
- [ ] Adicionar template à pasta correta em `TEMPLATE - NX/`
- [ ] Documentar todos os placeholders neste guia
- [ ] Criar mapeamento de campos no código
- [ ] Atualizar lista de equipamentos disponíveis

---

## 🔗 Referências

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Bun Runtime](https://bun.sh/docs)
- [Express.js](https://expressjs.com/)
- [docxtemplater](https://docxtemplater.com/)
- [docxtemplater-image-module](https://docxtemplater.com/modules/image/)
- [Resend Email API](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PizZip](https://github.com/nicholasKlick/pizzip)
