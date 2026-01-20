# 📋 Guia de Implementação - Status com Cores nos Templates

Este guia mostra como implementar o sistema de status com cores (Verde/Amarelo/Vermelho) em qualquer template de relatório.

## 🎯 O que é o Status?

O status é um indicador visual que mostra a condição do equipamento:
- 🟢 **CONFORME** (Verde `00B050`) - Equipamento em boas condições
- 🟡 **ALERTA** (Amarelo `FFC000`) - Requer atenção
- 🔴 **CORRETIVA** (Vermelho `FF0000`) - Requer manutenção urgente

## 📝 Passo a Passo para Implementar

### 1. Preparar o Template Word (.docx)

No seu template Word, crie uma tabela com a célula STATUS:

```
┌─────────────┬────────┬────┐
│ Label       │ STATUS │ ▢  │  ← O quadradinho vazio será colorido
└─────────────┴────────┴────┘
```

**Estrutura da linha:**
- **Célula 0**: Label (ex: "Equipamento:")
- **Célula 1**: Texto "STATUS"
- **Célula 2**: Célula vazia (quadradinho que será colorido)

### 2. Adicionar Campo `status` na Interface TypeScript

No arquivo do generator (ex: `backend/src/services/seu-generator.ts`):

```typescript
export interface SeuEquipamentoData {
  // ... outros campos
  status?: 'conforme' | 'alerta' | 'corretiva' | '';
  // ... outros campos
}
```

### 3. Copiar a Função `processStatusColor()`

Adicione esta função no seu generator:

```typescript
function processStatusColor(docContent: string, status: string): string {
  console.log(`\n🎨 === processStatusColor CHAMADO ===`);
  console.log(`📊 Status recebido: "${status}"`);
  
  if (!status) {
    console.log('⚠️ Status vazio, pulando processamento');
    return docContent;
  }
  
  // Mapa de cores
  const colorMap: Record<string, string> = {
    'conforme': '00B050',      // Verde
    'verde': '00B050',
    'green': '00B050',
    'alerta': 'FFC000',        // Amarelo
    'amarelo': 'FFC000',
    'yellow': 'FFC000',
    'corretiva': 'FF0000',     // Vermelho
    'vermelho': 'FF0000',
    'red': 'FF0000',
  };
  
  const newColor = colorMap[status.toLowerCase()];
  if (!newColor) {
    console.log(`❌ Status "${status}" não reconhecido, usando verde`);
    return docContent;
  }
  
  console.log(`✅ Cor mapeada: ${newColor}`);
  
  // Encontrar a célula STATUS
  const statusIdx = docContent.indexOf('STATUS');
  if (statusIdx === -1) {
    console.log('❌ Célula STATUS não encontrada no documento');
    return docContent;
  }
  
  console.log(`✅ Célula STATUS encontrada na posição ${statusIdx}`);
  
  // Encontrar a linha que contém STATUS
  const lineStart = docContent.lastIndexOf('<w:tr', statusIdx);
  const lineEnd = docContent.indexOf('</w:tr>', statusIdx);
  
  if (lineStart === -1 || lineEnd === -1) {
    console.log('❌ Linha STATUS não encontrada');
    return docContent;
  }
  
  console.log(`✅ Linha STATUS: ${lineStart} até ${lineEnd}`);
  
  let line = docContent.substring(lineStart, lineEnd + 7);
  
  // Encontrar todas as células da linha
  const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  if (!cells || cells.length < 3) {
    console.log(`❌ Células não encontradas (precisa de pelo menos 3, encontrou ${cells?.length || 0})`);
    return docContent;
  }
  
  console.log(`✅ Encontradas ${cells.length} células na linha STATUS`);
  
  // A célula STATUS é a segunda (índice 1)
  // O quadradinho colorido é a TERCEIRA célula (índice 2) - ao lado direito
  let colorCell = cells[2];
  
  // Verificar se é uma célula vazia (o quadradinho)
  const hasText = colorCell.match(/<w:t[^>]*>([^<]+)<\/w:t>/);
  if (hasText && hasText[1].trim()) {
    console.log(`⚠️ Terceira célula não está vazia, contém: "${hasText[1].trim()}"`);
    return docContent;
  }
  
  console.log('✅ Terceira célula está vazia (quadradinho de status)');
  
  // Aplicar cor no quadradinho (célula 2)
  // Remover qualquer w:shd existente e adicionar novo com a cor
  colorCell = colorCell.replace(
    /<w:shd\s+[^>]*\/>/g,
    `<w:shd w:val="clear" w:fill="${newColor}"/>`
  );
  
  // Se não tem w:shd, adicionar em w:tcPr
  if (!colorCell.includes('<w:shd')) {
    console.log('⚠️ Célula não tem w:shd, adicionando...');
    if (colorCell.includes('<w:tcPr>')) {
      colorCell = colorCell.replace(
        /<w:tcPr>/g,
        `<w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/>`
      );
    } else if (colorCell.includes('<w:tcPr/>')) {
      colorCell = colorCell.replace(
        /<w:tcPr\/>/g,
        `<w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/></w:tcPr>`
      );
    } else if (!colorCell.includes('<w:tcPr')) {
      colorCell = colorCell.replace(
        /<w:tc>/g,
        `<w:tc><w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/></w:tcPr>`
      );
    }
  }
  
  // Reconstruir linha
  cells[2] = colorCell;
  let newLine = line;
  let cellIdx = 0;
  newLine = newLine.replace(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g, () => cells[cellIdx++] || '');
  
  // Reconstruir documento
  docContent = docContent.substring(0, lineStart) + newLine + docContent.substring(lineEnd + 7);
  
  const statusNames: Record<string, string> = {
    '00B050': '🟢 VERDE',
    'FFC000': '🟡 AMARELO',
    'FF0000': '🔴 VERMELHO'
  };
  
  console.log(`✅ Status aplicado: ${statusNames[newColor] || newColor}`);
  console.log(`🎨 === processStatusColor CONCLUÍDO ===\n`);
  
  return docContent;
}
```

### 4. Chamar a Função no Generator

Na função principal de geração (ex: `generateSeuEquipamentoReport`), adicione:

```typescript
export async function generateSeuEquipamentoReport(
  data: SeuEquipamentoData,
  template: 'nx' | 'sercamp'
): Promise<Buffer> {
  // ... código existente ...
  
  try {
    // ... processamento de outros campos ...
    
    // ADICIONAR ANTES DE VALIDAR O XML:
    // Status (cor verde/amarelo/vermelho)
    if (data.status) {
      docContent = processStatusColor(docContent, data.status);
    }
    
    // Validar XML
    if (!docContent.includes('</w:document>')) {
      console.error('XML corrupted');
      return originalContent;
    }
  } catch (error) {
    // ... tratamento de erro ...
  }
  
  // ... resto do código ...
}
```

### 5. Mapear o Campo no Endpoint (Backend Route)

No arquivo `backend/src/routes/reports.ts`, no endpoint do seu equipamento:

```typescript
router.post(
  '/seu-equipamento',
  authMiddleware,
  moduleMiddleware('tecnico'),
  async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      const equipamentoData = {
        // ... outros campos ...
        status: data.status || '',  // ← ADICIONAR ESTA LINHA
        // ... outros campos ...
      };
      
      // ... resto do código ...
    }
  }
);
```

### 6. Frontend - Garantir que o Status é Enviado

No frontend (`frontend/src/routes/relatorios/tecnico/+page.svelte`), o status já está sendo enviado:

```typescript
const requestBody = {
  // ... outros campos ...
  status,  // ← Já está sendo enviado
  // ... outros campos ...
};
```

## ✅ Checklist de Implementação

- [ ] Template Word tem célula STATUS com 3 células na linha
- [ ] Interface TypeScript tem campo `status?: 'conforme' | 'alerta' | 'corretiva' | '';`
- [ ] Função `processStatusColor()` foi copiada para o generator
- [ ] Função é chamada no generator antes de validar o XML
- [ ] Endpoint mapeia `status: data.status || ''`
- [ ] Frontend envia o campo `status` no request body
- [ ] Testado com os 3 status (conforme, alerta, corretiva)

## 🧪 Como Testar

1. Gere um relatório com status "alerta"
2. Abra o arquivo .docx gerado
3. Procure pela célula "STATUS"
4. O quadradinho ao lado deve estar AMARELO 🟡

Repita com "conforme" (verde) e "corretiva" (vermelho).

## 📊 Logs Esperados

Quando funcionar corretamente, você verá no console do backend:

```
🎨 === processStatusColor CHAMADO ===
📊 Status recebido: "alerta"
✅ Cor mapeada: FFC000
✅ Célula STATUS encontrada na posição 9885
✅ Linha STATUS: 6755 até 10499
✅ Encontradas 3 células na linha STATUS
✅ Terceira célula está vazia (quadradinho de status)
✅ Status aplicado: 🟡 AMARELO
🎨 === processStatusColor CONCLUÍDO ===
```

## 🎨 Cores Disponíveis

| Status | Cor | Código Hex |
|--------|-----|------------|
| Conforme | 🟢 Verde | `00B050` |
| Alerta | 🟡 Amarelo | `FFC000` |
| Corretiva | 🔴 Vermelho | `FF0000` |

## 🔧 Troubleshooting

### Problema: Status não muda de cor

**Solução 1**: Verifique se o template tem a estrutura correta (3 células na linha STATUS)

**Solução 2**: Verifique os logs do backend - eles mostram exatamente onde está o problema

**Solução 3**: Verifique se o endpoint está mapeando o campo `status`

### Problema: Célula STATUS não encontrada

**Solução**: Certifique-se de que o template Word tem exatamente o texto "STATUS" (maiúsculas)

### Problema: Terceira célula não está vazia

**Solução**: A terceira célula (quadradinho) deve estar completamente vazia no template

## 📚 Exemplos Implementados

- ✅ **TC/TP** (`backend/src/services/tctp-generator.ts`)
- ✅ **Transformador** (`backend/src/services/tecnico-generator.ts`)

Use estes como referência para implementar em outros equipamentos!

---

**Última atualização**: 19/01/2026
**Autor**: Sistema SERCAMP
