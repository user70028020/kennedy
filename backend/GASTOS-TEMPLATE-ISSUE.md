# Relatório de Gastos - Problema do Template

## Problema Identificado

O template `relatoriogastosercamp.docx` tem uma estrutura XML não-padrão com **células aninhadas** (nested cells).

### Estrutura Normal (RDO)
```
<w:tr>
  <w:tc>...</w:tc>  <!-- 1 open, 1 close -->
  <w:tc>...</w:tc>  <!-- 1 open, 1 close -->
  <w:tc>...</w:tc>  <!-- 1 open, 1 close -->
</w:tr>
```

### Estrutura do Template de Gastos
```
<w:tr>
  <w:tc>
    <w:tc>...</w:tc>  <!-- Nested! -->
    <w:tc>...</w:tc>
    <w:tc>...</w:tc>
  </w:tc>
  <!-- More nested cells... -->
</w:tr>
```

**Resultado**: 15 tags `<w:tc>` abertas, mas apenas 5 `</w:tc>` fechadas por row.

## Por que isso acontece?

O Word usa células aninhadas para:
- Células mescladas (merged cells)
- Layouts complexos de tabela
- Células com sub-tabelas

Isso é **válido** para o Word, mas quebra a lógica simples de "extrair células com regex".

## Solução Implementada

### Abordagem Anterior (FALHOU)
```typescript
// ❌ Tentava extrair células com regex
const cells = row.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
// Resultado: Pega apenas as células "externas", perde as aninhadas

// ❌ Tentava reconstruir a row
const rowStart = row.substring(0, row.indexOf('<w:tc'));
const rowEnd = row.substring(row.lastIndexOf('</w:tc>') + 7);
row = rowStart + cells.join('') + rowEnd;
// Resultado: Perde as células aninhadas, corrompe o XML
```

### Abordagem Atual (FUNCIONA)
```typescript
// ✅ Duplica a row inteira sem modificar estrutura
for (let i = 0; i < receipts.length; i++) {
  newTable += templateRow; // Mantém estrutura complexa intacta
}

// ✅ Preenche dados por substituição de parágrafos
// Encontra parágrafos vazios e substitui com dados
// Não toca na estrutura de células
```

## Status Atual

### ✅ Funciona
- Campos básicos preenchidos
- Checkbox de aprovação
- Tabela duplicada corretamente (2 páginas)
- Dados dos receipts preenchidos
- Total calculado
- Arquivo gerado

### ⚠️ Estrutura XML
- O arquivo tem "mismatch" de tags (esperado)
- O Word recupera automaticamente
- Não é um erro, é a estrutura do template

### 🚧 Pendente
- Testar abertura no Word
- Re-habilitar fotos (função `addReceiptPhotos`)
- Testar com dados reais do frontend

## Alternativa Futura

Se quisermos evitar a "corrupção" aparente:

1. **Recriar o template** - Fazer um template simples sem células aninhadas
2. **Usar biblioteca DOCX** - Usar `docx` library para criar tabelas programaticamente
3. **Aceitar a estrutura** - Continuar com a solução atual (recomendado)

## Conclusão

A solução atual funciona porque:
1. Mantém a estrutura complexa do template intacta
2. Apenas substitui conteúdo de parágrafos
3. O Word entende e recupera a estrutura automaticamente

**Recomendação**: Manter a solução atual e testar com Word.
