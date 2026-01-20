# Análise do Projeto Next.js FOD - RDO Montagem e SPDA

## 📊 Resumo Executivo

O projeto Next.js FOD possui implementações completas de:
1. **RDO de Montagem** (Relatório Diário de Obra)
2. **SPDA** (Sistema de Proteção contra Descargas Atmosféricas)

## 🏗️ Arquitetura Identificada

### Abordagem de Geração de Documentos

**Next.js FOD usa 2 abordagens:**

1. **Template-based (SPDA)**: 
   - Usa templates Word (.docx) com placeholders `{{CAMPO}}`
   - Substitui placeholders por valores reais
   - Mantém layout 100% fiel ao original
   - Arquivo: `lib/word-generator-spda-templater.tsx`

2. **Code-based (RDO Montagem)**:
   - Gera documento do zero usando biblioteca `docx`
   - Define layout programaticamente
   - Arquivo: `lib/word-generator-rdo-montagem.ts`

**Nosso projeto atual usa:**
- Abordagem code-based (similar ao RDO Montagem)
- Biblioteca: `pizzip` + manipulação XML direta
- Arquivo: `backend/src/services/tecnico-generator.ts`

---

## 📋 RDO de Montagem - Estrutura

### Frontend (`components/rdo-montagem.tsx`)

**Campos Principais:**
```typescript
interface RDOMontagemData {
  // Identificação
  numeroOS: string
  data: string
  projeto: string
  cliente: string
  cidade: string
  nomeSubestacao: string
  
  // Equipamento
  naturezaServico: string
  caracteristicasEquipamento: string
  numeroSerie: string
  
  // Equipe
  participantes: Array<{
    nome: string
    empresa: string
    visto: string // assinatura base64
  }>
  
  // Representantes
  representanteSercamp: string
  representanteSercampAssinatura: string
  representanteCliente: string
  representanteClienteAssinatura: string
  
  // Atividades
  atividadesExecutadas: Array<{
    item: string
    descricao: string
  }>
  
  // Horas de Trabalho
  horasTrabalho: {
    horarioNormalInicio: string
    horarioNormalTermino: string
    liberacaoHorasExtras: "sim" | "nao" | ""
    horasExtrasInicio: string
    horasExtrasTermino: string
    autorizadoPor: string
    horasDeslocamentoInicio: string
    horasDeslocamentoTermino: string
    horasDeslocamentoTotal: string
    horasTrabalhadasCliente: string
    horarioAlmoco: string
    horasJantar: string
    horasDeslocamentoRetorno: string
    horasDisposicao: string
    horasTotaisTrabalhadas: string
  }
  
  // Horas Disponibilizadas
  horasDisponibilizadas: {
    integracaoInicio: string
    integracaoTermino: string
    integracaoTotal: string
    faltaRecursosInicio: string
    faltaRecursosTermino: string
    faltaRecursosTotal: string
    condicoesClimaticasInicio: string
    condicoesClimaticasTermino: string
    condicoesClimaticasTotal: string
    retomadaAtividadesInicio: string
    retomadaAtividadesTermino: string
    retomadaAtividadesTotal: string
    outrosDescricao: string
    outrosInicio: string
    outrosTermino: string
    outrosTotal: string
    total: string
  }
  
  // Fotos
  photos: Array<{
    id: string
    data: string // base64
    name: string
  }>
  
  // Notas Fiscais (com OCR)
  invoiceItems: Array<{
    id: string
    imageData: string
    date: string
    description: string
    value: number
    imageName: string
  }>
  
  // Observações
  observacoes: string
  
  // Template
  template: "sercamp" | "nx-energy"
}
```

**Funcionalidades Especiais:**

1. **Busca de OS Automática**:
   - Componente `OSLookup` busca OS no sistema
   - Preenche automaticamente: cliente, data, equipe, local
   - Integração com `DatabaseService`

2. **Cálculo Automático de Horas**:
   ```typescript
   // Calcula automaticamente:
   - Horas de deslocamento (início - término)
   - Horas trabalhadas no cliente (normal + extras - almoço - jantar)
   - Horas totais (trabalhadas + deslocamento + retorno + disposição)
   - Total de horas disponibilizadas (soma de todas as paradas)
   ```

3. **Captura de Notas Fiscais com OCR**:
   - Abre câmera para fotografar nota fiscal
   - Usa OCR (`performOCR`) para extrair:
     - Data da nota
     - Descrição
     - Valor (R$)
   - Adiciona à lista de despesas

4. **Assinaturas Digitais**:
   - Representante SERCAMP
   - Representante Cliente
   - Vistos dos participantes
   - Certificação de horas

5. **Fotos do Serviço**:
   - Captura via câmera
   - Upload de arquivo
   - Múltiplas fotos

### Backend (`lib/word-generator-rdo-montagem.ts`)

**Geração usando biblioteca `docx`:**

```typescript
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx"

// Estrutura do documento:
1. Cabeçalho (Logo + Título "DIÁRIO DE OBRA")
2. Informações do Cliente
3. Representantes (com assinaturas)
4. Equipe de Trabalho (com vistos)
5. Resumo da Jornada de Trabalho (tabela complexa)
6. Informação de Horas Disponibilizadas
7. Atividades Executadas
8. Observações
9. Fotos (registro fotográfico)
10. Notas Fiscais (se houver)
```

**Características Técnicas:**
- Font: Poppins
- Tamanho: 16pt (8pt real) para texto, 18pt para títulos
- Bordas: Todas as tabelas com bordas pretas
- Cabeçalhos: Fundo cinza (#D0D0D0)
- Altura de linha: 42px (exata)
- Espaçamento: 160 (line spacing)
- Margens de célula: 25

---

## 📋 SPDA - Estrutura

### Frontend (`components/spda-report.tsx`)

**Campos Principais:**
```typescript
interface SPDAData {
  // Identificação
  ordem_servico: string
  cliente: string
  data: string
  status: "APROVADO" | "REVISÃO" | "REPROVADO"
  
  // Equipe
  equipe_tecnica: string // "Nome1 | Nome2 | Nome3"
  
  // Tipo de SPDA (checkboxes múltiplos)
  tipo_spda: string[] // ["Método de Franklin", "Gaiola de Faraday", ...]
  
  // Equipamentos de Medição
  equipamento_medicao: string[] // ["Terrômetro Digital", "Alicate Terrômetro"]
  
  // Inspeções Gerais (OK/NC/NA para cada)
  projeto_spda: "OK" | "NC" | "NA"
  integridade_condutores: "OK" | "NC" | "NA"
  subsistema_captacao: "OK" | "NC" | "NA"
  caixa_inspecao: "OK" | "NC" | "NA"
  subsistema_condutores: "OK" | "NC" | "NA"
  isoladores: "OK" | "NC" | "NA"
  subsistema_conexoes: "OK" | "NC" | "NA"
  eletroduto_pcv: "OK" | "NC" | "NA"
  condicao_equipotencializacoes: "OK" | "NC" | "NA"
  ponto_ruptura: "SIM" | "NÃO"
  subsistema_aterramento: "OK" | "NC" | "NA"
  
  // Pontos de Medição (até 20 pontos)
  pontos: Array<{
    id: string
    number: string
    valor: string // em Ω
    foto: string // base64
    nFoto?: string // número da foto
  }>
  
  // Croqui
  croqui: string // base64 do desenho
  
  // Conclusão
  conclusao_observacoes: string
}
```

**Funcionalidades Especiais:**

1. **Pontos de Medição Dinâmicos**:
   - Componente `SPDADynamicPoints`
   - Adicionar/remover pontos
   - Cada ponto: número, valor (Ω), foto
   - Validação: ponto só é válido se tem valor E foto

2. **Desenho de Croqui**:
   - Componente `CroquiDrawing`
   - Canvas para desenhar o layout do SPDA
   - Salva como imagem base64

3. **Template Dinâmico**:
   - Usa `TemplateParser` para ler campos do template
   - Templates armazenados no `DatabaseService`
   - Campos configuráveis por template

4. **Validações Rigorosas**:
   ```typescript
   // Bloqueia geração se:
   - Falta OS, Cliente ou Data
   - Nenhum ponto de medição
   - Pontos incompletos (sem valor ou foto)
   - Tipo de SPDA não selecionado
   ```

### Backend (`lib/word-generator-spda.tsx`)

**Geração usando biblioteca `docx`:**

```typescript
// Estrutura do documento:
1. Cabeçalho (Logo + "RELATÓRIO CAMPO SPDA")
2. Sistema SPDA (OS, Cliente, Data) + STATUS colorido
3. Equipe Técnica
4. Tipo de SPDA (checkboxes)
5. Equipamentos de Medição (checkboxes)
6. Inspeções Gerais (tabela OK/NC/NA)
7. Medições dos Pontos de Aterramento (tabela 2 colunas, 10 linhas)
8. Croqui/Local (imagem)
9. Registro Fotográfico (fotos dos pontos)
10. Conclusão/Observações/Recomendações
```

**Características Técnicas:**
- Font: Calibri
- Tamanho: 16pt para texto, 18pt para títulos
- Status colorido:
  - APROVADO: Verde (#00AF50)
  - REVISÃO: Amarelo (#FFFF00)
  - REPROVADO: Vermelho (#FF0000)
- Tabela de pontos: 2 colunas (pontos 1-10 | pontos 11-20)
- Fotos: 1 por página com legenda

---

## 🔄 Conversão para Nosso Projeto

### Estratégia Recomendada

**Opção 1: Manter Abordagem Atual (XML direto)**
- ✅ Já funciona para Relatório Técnico
- ✅ Controle total sobre o XML
- ❌ Mais trabalhoso para novos relatórios
- ❌ Precisa entender estrutura XML do Word

**Opção 2: Migrar para biblioteca `docx`**
- ✅ Código mais limpo e legível
- ✅ Mais fácil adicionar novos relatórios
- ✅ Exemplos prontos do Next.js FOD
- ❌ Precisa reescrever Relatório Técnico
- ❌ Dependência adicional

**Opção 3: Híbrida (Recomendada)**
- ✅ Manter Relatório Técnico como está (XML)
- ✅ Novos relatórios (RDO, SPDA) usar `docx`
- ✅ Aproveitar código do Next.js FOD
- ✅ Melhor custo-benefício

---

## 📦 Pacotes Necessários

```json
{
  "dependencies": {
    "docx": "^8.5.0",  // Geração de documentos Word
    "tesseract.js": "^5.0.0"  // OCR para notas fiscais (opcional)
  }
}
```

---

## 🎯 Plano de Implementação

### Fase 1: RDO de Montagem (2-3 dias)

1. **Backend**:
   - Criar `backend/src/services/rdo-montagem-generator.ts`
   - Copiar e adaptar código de `word-generator-rdo-montagem.ts`
   - Ajustar para Express.js (ao invés de Next.js)
   - Criar rota `POST /api/reports/rdo-montagem`

2. **Frontend**:
   - Criar `frontend/src/routes/relatorios/rdo-montagem/+page.svelte`
   - Adaptar componente React para Svelte 5 (runes)
   - Criar componentes auxiliares:
     - `HorasTrabalhoForm.svelte`
     - `HorasDisponibilizadasForm.svelte`
     - `AtividadesForm.svelte`
     - `NotasFiscaisCapture.svelte` (opcional, sem OCR)

3. **Integração**:
   - Busca de OS (já existe)
   - Upload de fotos (já existe)
   - Assinaturas digitais (já existe `SignaturePad`)

### Fase 2: SPDA (2-3 dias)

1. **Backend**:
   - Criar `backend/src/services/spda-generator.ts`
   - Copiar e adaptar código de `word-generator-spda.tsx`
   - Criar rota `POST /api/reports/spda`

2. **Frontend**:
   - Criar `frontend/src/routes/relatorios/spda/+page.svelte`
   - Criar componentes:
     - `SPDAPontosForm.svelte` (pontos de medição)
     - `SPDAInspecoesForm.svelte` (OK/NC/NA)
     - `CroquiDrawing.svelte` (canvas para desenho)

3. **Integração**:
   - Busca de OS
   - Upload de fotos dos pontos
   - Desenho de croqui

### Fase 3: Melhorias (1-2 dias)

1. **Cálculos Automáticos**:
   - Implementar cálculo de horas no frontend
   - Validações em tempo real

2. **OCR (Opcional)**:
   - Integrar Tesseract.js para notas fiscais
   - Extrair valores automaticamente

3. **Templates**:
   - Suporte para NX Energy e SERCAMP
   - Logos dinâmicos

---

## 📊 Comparação de Complexidade

| Relatório | Campos | Tabelas | Fotos | Assinaturas | Complexidade |
|-----------|--------|---------|-------|-------------|--------------|
| Técnico (atual) | ~50 | 8 | Sim | Não | ⭐⭐⭐⭐ |
| RDO Montagem | ~80 | 12 | Sim | Sim | ⭐⭐⭐⭐⭐ |
| SPDA | ~40 | 4 | Sim | Não | ⭐⭐⭐ |

---

## 🎨 Diferenças de Stack

| Aspecto | Next.js FOD | Nosso Projeto |
|---------|-------------|---------------|
| Frontend | React + Next.js | Svelte 5 + SvelteKit |
| Backend | Next.js API Routes | Express.js |
| Runtime | Node.js | Bun |
| Database | LocalStorage + IndexedDB | PostgreSQL + Prisma |
| Geração Word | `docx` library | `pizzip` + XML |
| Estado | React hooks | Svelte runes |

---

## ✅ Próximos Passos

1. **Decisão**: Escolher abordagem (Opção 3 recomendada)
2. **Setup**: Instalar biblioteca `docx` no backend
3. **RDO**: Implementar RDO de Montagem primeiro (mais complexo)
4. **SPDA**: Implementar SPDA depois (mais simples)
5. **Testes**: Validar com usuários reais
6. **Documentação**: Atualizar TEMPLATE-GUIDE.md

---

## 📝 Notas Importantes

1. **Não copiar código diretamente**: Adaptar para nossa stack
2. **Manter padrões**: Seguir estrutura atual do projeto
3. **Reutilizar componentes**: PhotoCapture, SignaturePad, OSLookup
4. **Validações**: Implementar validações rigorosas como no SPDA
5. **Performance**: Otimizar geração de documentos grandes

---

**Data da Análise**: 15/01/2026
**Analisado por**: Kiro AI Assistant
**Status**: ✅ Análise Completa - Pronto para Implementação
