# Guia de Mapeamento de Templates DOCX - Relatório Técnico

## 📋 Templates Disponíveis

| Equipamento | Arquivo NX | Arquivo SERCAMP |
|-------------|------------|-----------------|
| Transformador | transformador_nx.docx | transformador_sercamp.docx |
| Transformador Instrumento (TC/TP) | tc_tp_nx.docx | tc_tp_sercamp.docx |
| Disjuntor | disjuntor_nx.docx | disjuntor_sercamp.docx |
| Relé de Proteção | rele_nx.docx | rele_sercamp.docx |
| Chave Seccionadora | chave_seccionadora_nx.docx | chave_seccionadora_sercamp.docx |
| Religador/Painel | religador_nx.docx | religador_sercamp.docx |
| Retificador/Baterias | retificador_nx.docx | retificador_sercamp.docx |
| Banco de Capacitores | banco_capacitores_nx.docx | banco_capacitores_sercamp.docx |
| Para-Raios | para_raio_nx.docx | para_raio_sercamp.docx |
| Cabos | cabos_nx.docx | cabos_sercamp.docx |
| SPDA | spda_nx.docx | spda_sercamp.docx |

---

## 🔧 Mapeamento de Campos por Equipamento

### 1. TRANSFORMADOR

**Campos Comuns (Header):**
- OS: → osNumber
- DATA → reportDate
- CLIENTE → clientName
- CIDADE/UF → location
- Elaborado por: → responsible

**Dados do Equipamento:**
- TIPO: → tipo (checkbox: A seco / A óleo)
- LOCAL DE INSTALAÇÃO → localInstalacao
- NÚMERO DA COLETA → numeroColeta (checkboxes: FQ, CR, PCB, 2 FALL)
- FABRICANTE → fabricante
- NÚMERO DE SERIE → numeroSerie
- POTÊNCIA (KVA) → potencia
- DATA DE FABRICAÇÃO → dataFabricacao
- IMPEDÂNCIA (%) → impedancia
- VOLUME DE ÓLEO (L) → volumeOleo
- TENSÃO SUP. (KV) → tensaoSuperior
- TENSÃO INFERIOR (V) → tensaoInferior
- LIGAÇÃO → ligacao (Dy)
- TIPO DE FLUIDOS ISOLANTES → tipoFluido (Óleo Mineral/Silicone/Vegetal)

**Inspeções Gerais (checkboxes OK/NC/NA):**
- NÍVEL DE ÓLEO
- INDICADOR DE NÍVEL DE ÓLEO
- TERMÔMETRO DE ÓLEO
- SÍLICA GEL
- BUCHA AT E BT
- TANQUE DE EXPANSÃO
- RADIADORES
- VÁLVULA DE ALIVIO
- RELE DE GÁS - BUCHHOLZ
- RELE DE PRESSÃO
- RELE DE PRESSÃO SÚBITA
- TUBO DE EXPLOSÃO
- TAMPA PRINCIPAL
- TAMPA DE INSPEÇÃO
- COMUTADOR
- VEDAÇÕES
- PINTURA
- ATERRAMENTO

**Ensaios Elétricos:**
- RESISTÊNCIA DE ISOLAMENTO - MEGÔMETRO
- RESISTÊNCIA ÔHMICA DOS ENROLAMENTOS - MICROHMÍMETRO
- RELAÇAO DE TRANSFORMAÇÃO - TTR

**Análises (se óleo):**
- ANÁLISE FÍSICO-QUÍMICA
- CROMATOGRAFIA (CR)
- FURFURALDEIDO
- PCB

**Serviços Executados (checkboxes):**
- Limpeza geral
- Coleta de óleo
- Tratamento termo vácuo
- Complemento de nível de óleo
- Substituição de óleo
- Retirada de vazamento
- Troca de componentes
- Retirada do equipamento para oficina

**STATUS:** → status (OK/NC/NA)
**OBSERVAÇÕES | RECOMENDAÇÕES:** → observacoes

---

### 2. DISJUNTOR

**Campos Comuns:**
- OS, DATA, CLIENTE, CIDADE/UF, Elaborado por

**Dados do Equipamento:**
- Fabricante → fabricante
- Tipo → tipo
- Número serie → numeroSerie
- Data fabricação → dataFabricacao
- Local instalação → localInstalacao
- Tensão nominal Un: (KV) → tensaoNominal
- Corrente nominal In: (A) → correnteNominal
- Interruptância (KA) → interruptancia
- Tensão de Comando: (VCA) → tensaoComando
- Mecanismo de Acionamento: → mecanismoAcionamento (Molas/Hidráulico/Ar Comprimido)
- Dielétrico da Câmara Principal: → dieletricoCamara (Vácuo/Óleo/SF6)
- Volume óleo (L) → volumeOleo

**Inspeções Gerais (checkboxes):**
- Indicador ABERTO/FECHADO
- Nível óleo
- Motor comando
- Rele de corrente mínima
- Verificação isoladores
- Verificação terminais
- Pintura
- lubrificação

**Ensaios:**
- RESISTÊNCIA DE ISOLAMENTO - MEGÔMETRO (Fase A/B/C - Massa)
- RESISTÊNCIA DE CONTATO - MICROHMÍMETRO (Polo A/B/C)
- OSCILOGRAFIA:
  - Tempo de abertura (O)
  - Tempo de Fechamento
  - Tempo de abertura (O) abert

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

### 3. RELÉ DE PROTEÇÃO SOBRECORRENTE

**Campos:**
- CLIENTE: → clientName
- LOCAL: → location
- DATA: → reportDate
- TAG: → tag
- CUBÍCULO: → cubiculo
- Fabricante: → fabricante
- Tipo/Modelo: → tipoModelo
- N série: → numeroSerie
- Alimentação: → alimentacao
- RTC Fase: → rtcFase
- RTC Neutro: → rtcNeutro
- RTP: → rtp

**AJUSTES:**
- Parâmetro / Tape / Valor (tabela)

**ENSAIOS:**
- Fase R/S/T e Neutro
- I aplicada / Pick / Tempo (s) / Ângulo Atuação

**VERIFICAÇÕES (checkboxes):**
- Lista de verificações

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

### 4. CHAVE SECCIONADORA

**Campos:**
- OS, DATA, CLIENTE, CIDADE/UF, Elaborado por
- TIPO → tipo
- FABRICANTE → fabricante
- Tensão Nominal: (KV) → tensaoNominal
- Corrente Nominal: (A) → correnteNominal
- CORRENTE DO FUSÍVEL (A) → correnteFusivel
- NÚMERO DE SÉRIE OU ID → numeroSerie
- DATA DE FABRICAÇÃO → dataFabricacao
- Ano Fabricação: → anoFabricacao
- LOCAL DE INSTALAÇÃO → localInstalacao
- Tag → tag
- Mecanismo acionamento: → mecanismoAcionamento (Manual/Motorizado/Com Terra/Sem Terra)

**Inspeções (checkboxes):**
- REVISÃO DOS ISOLADORES
- REVISÃO DAS BIELAS ISOLANTES
- REVISÃO DOS MICRORRUPTORES
- REVISÃO E LUBRIFICAÇÃO DO COMANDO MECÂNICO
- REVISÃO E LUBRIFICAÇÃO DOS CONTATOS DAS FACAS E TERMINAIS
- VERIFICAÇÃO DA ABERTURA E FECHAMENTO

**Ensaios:**
- RESISTÊNCIA DE ISOLAMENTO - MEGÔMETRO (Fase R/S/T - Massa)
- RESISTÊNCIA DE CONTATO - MICROHMÍMETRO (Polo/Lâmina/Fase R/S/T)

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

### 5. RELIGADOR / PAINEL RELIGADOR

**Campos:**
- OS, DATA, CLIENTE, CIDADE/UF, Elaborado por
- TIPO → tipo
- FABRICANTE → fabricante
- TENSÃO NOMINAL (KV) → tensaoNominal
- CORRENTE NOMINAL (A) → correnteNominal
- CORRENTE DO FUSÍVEL (A) → correnteFusivel
- NÚMERO DE SÉRIE OU ID → numeroSerie
- DATA DE FABRICAÇÃO → dataFabricacao
- LOCAL DE INSTALAÇÃO → localInstalacao

**Inspeções (checkboxes):**
- Inspeções gerais
- Limpeza geral
- EQUIPAMENTO POSSUI TODOS OS COMPONENTES
- EQUIPAMENTO POSSUI CORDAO UMBILICAL
- VERIFICAÇÃO DA ABERTURA E FECHAMENTO
- TESTE DE FUNCIONAMENTO DO RELE DE PROTECAO
- TESTES DE FUNCIONAMENTO DO PAINEL
- PANIEL / CORDAO UMBILICAL

**Ensaios elétricos**

**Serviços Executados:**
- Troca de componentes
- Retirada do equipamento para oficina

**STATUS:** → status

---

### 6. RETIFICADOR DE BATERIA

**Características do Retificador:**
- Cliente: → clientName
- Data: → reportDate
- Local do Equipamento: → localEquipamento
- Elaborado por: → responsible
- Fabricante: → fabricante
- Tipo: → tipo
- Tensão Entrada: → tensaoEntrada (Vca)
- Corrente Entrada In: → correnteEntrada
- Potência Entrada: → potenciaEntrada (kVA)
- Tensão Saída: → tensaoSaida (Vcc)
- Corrente Saída → correnteSaida
- Potência Saída: → potenciaSaida
- Tensão Flutuação: → tensaoFlutuacao
- Tensão Recarga: → tensaoRecarga

**Características das Baterias:**
- Tipo: → tipoBateria (Chumbo-Ácido / Alcalino)
- Fabricante: → fabricanteBateria
- Ano → anoBateria
- Tensão Nominal Banco: → tensaoNominalBanco
- Quantidade Elementos: → quantidadeElementos
- Capacidade Nominal: → capacidadeNominal (A/H)
- Autonomia em: → autonomia
- Eletrólito: → eletrolito
- Tensão de cada elemento: → tensaoElemento

**Verificações / Serviços (checkboxes):**
- Aterramento do painel
- Aterramento verificado
- Operação manual - automático
- Circuitos de alarmes
- Tensão de flutuação verificado
- Tensão de recarga verificado
- Corrente de recarga
- Estruturas em bom estado
- Limpeza e conservações
- Reapertos das conexões
- Alinhamentos dos elementos
- Níveis dos eletrólitos verificado
- Densidade dos eletrólitos verificado
- Tensão de cada elemento verificado

**Medições:**
- Temperatura Ambiente
- Tensão Total:

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

### 7. BANCO DE CAPACITORES

**Campos:**
- Cliente: → clientName
- Data: → reportDate
- Local: → location
- Nome: → responsible
- Fabricante → fabricante
- Tipo → tipo (Interno/Externo)
- Tensão Nominal: → tensaoNominal
- Potência Total → potenciaTotal
- Potência do Capacitor → potenciaCapacitor

**Verificações (checkboxes):**
- Estruturas em bom estado
- Limpeza e Conservações
- Reaperto das Conexões
- Aterramento da Estrutura
- Estado das Carcaças
- Isoladores
- Chaves Seccionadoras Verificadas
- Disjuntores e Acionamentos Verificados
- Base Fusíveis e Fusíveis Verificados
- Contatores e Contatos em Série Resistores

**Ensaio:**
- Isolação - Megôhmetro (Fases R-S, S-T, T-R, R/S/T N/A)
- Capacitância Medida - Capacímetro (por Estágio)
- Capacitância de Placa

**Condições:**
- Temp Amb
- Umid

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

### 8. PARA-RAIOS

**Campos:**
- Cliente: → clientName
- Data: → reportDate
- Local do Equipamento: → localEquipamento
- Elaborado por: → responsible
- Fabricante: → fabricante
- Tipo: → tipo
- Tensão Nominal: → tensaoNominal
- Corrente Descarga: → correnteDescarga
- Número Elementos por Fase: → numeroElementos
- Ano Fabricação: → anoFabricacao
- Contador de descarga: → contadorDescarga (Com/Sem)
- Fabricante do Contador: → fabricanteContador
- Modelo do Contador: → modeloContador

**Verificações / Serviços (checkboxes):**
- Base Isolante
- Número de série (Fase R/S/T)

**Equipamentos Utilizados:**
- Megôhmetro
- Fator de Potência

**Ensaios de Resistência de Isolação:**
- Tensão de Ensaios
- Leituras em MΩ (Fase R/S/T)
- Medições nos Elementos (Fase R/S/T - Superior/Inferior)

**Condições:**
- Temperatura Ambiente
- Umidade Relativa %

**STATUS:** → status
**OBSERVAÇÃO / RECOMENDACOES:** → observacoes

---

### 9. CABOS

**Campos:**
- Cliente: → clientName
- Data: → reportDate
- Localização: → localizacao
- Elaborado por: → responsible
- Fabricante: → fabricante
- Modelo/Tipo: → modeloTipo
- TAG: → tag
- Tensão Nominal: → tensaoNominal
- Data Fabricação: → dataFabricacao
- Comprimento do Cabo → comprimento

**Testes de Recebimento:**
- Tensão Aplicada: (Vcc)
- Tempo (Min)
- Resistência do Isolamento (GΩ)
- Resistência Ohmica do Condutor
- Valor em
- Temperatura Ambiente:
- Umidade Relativa do Ar:

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

### 10. SPDA

**Campos:**
- ORDEM SERVIÇO → osNumber
- DATA → reportDate
- CLIENTE → clientName
- LOCAL → location
- EQUIPE → equipe

**Tipo de SPDA (checkboxes):**
- Franklin
- Gaiola Faraday
- Malha
- Eletrogeométrico (esfera fictícia)

**Subsistema de Captação:**
- Método → metodoCaptacao
- Condição física → condicaoCaptacao

**Subsistema de Descidas:**
- Condutores → condutoresDescida
- Conexões → conexoesDescida
- Eletroduto → eletrodutoDescida

**Subsistema de Aterramento:**
- Malhas → malhasAterramento
- Conexões → conexoesAterramento
- eletrodos → eletrodosAterramento

**Equipotencializações**

**Medição de Resistividade do Solo:**
- VALOR MÁXIMO ADMISSÍVEL
- VALOR MEDIDO

**Pontos de Medição (tabela):**
- Ponto / Identificado / VALOR (Ω)

**CONFORMIDADES / RECOMENDAÇÕES**

**STATUS:** → status
**OBSERVAÇÕES:** → observacoes

---

### 11. TRANSFORMADOR PARA INSTRUMENTOS (TC/TP)

**Campos:**
- Cliente: → clientName
- Data: → reportDate
- Local do Equipamento: → localEquipamento
- Elaborado por: → responsible
- Fabricante: → fabricante
- Tipo: → tipo (TC/TP)
- Tensão nominal: → tensaoNominal
- Relação: → relacao
- Potência nominal: → potenciaNominal
- Classe de precisão → classePrecisao
- Fator de serviço: → fatorServico
- Ano de fabricação: → anoFabricacao
- Número de série - Fase R: → numeroSerieR
- Número de série - Fase S: → numeroSerieS
- Número de série - Fase T: → numeroSerieT

**Verificações / Serviços (checkboxes):**
- Aterramentos
- Fixações e alinhamentos
- Limpeza dos isoladores
- Integridade dos isoladores
- Conexões
- Reapertos das conexões

**Ensaios / Medições:**
- Ensaios de Resistência de Isolamento (MΩ)
  - Tensão Aplicada (Vcc)
  - AT x Massa
  - Enrolamento aplicado / medido
- Ensaios de Relação de Transformação
  - Primário / Secundário
- Ensaios de Polaridades
  - Polaridade Medida (Subritativa)
- Medições de Resistência Ohmica nos enrolamentos

**Condições:**
- Temperatura Ambiente:
- Umidade Relativa do Ar:

**STATUS:** → status
**OBSERVAÇÕES / RECOMENDACOES:** → observacoes

---

## 📝 Notas de Implementação

### 1. Checkboxes
No Word, checkboxes são representados por:
- `☐` (U+2610) - unchecked
- `☒` (U+2612) - checked

**Implementação:**
```typescript
// Substituir checkbox vazio por marcado
docContent = docContent.replace('☐', '☒');
```

### 2. Caracteres Especiais
Usar os códigos Unicode corretos:
- **Ω (Ohm)**: `\u2126` (OHM SIGN) - NÃO usar `\u03A9` (Greek Omega)
- **µ (Micro)**: `\u00B5` (MICRO SIGN)

### 3. Formatação de Texto
Todos os valores inseridos devem usar formatação consistente:
```xml
<w:r>
  <w:rPr>
    <w:rFonts w:cstheme="minorHAnsi"/>
    <w:b/>
    <w:color w:val="000000"/>
    <w:sz w:val="18"/>
    <w:szCs w:val="18"/>
  </w:rPr>
  <w:t>VALOR</w:t>
</w:r>
```

### 4. Cores de Status (Indicador Visual)
O template tem um **quadradinho colorido** ao lado da palavra "STATUS" que indica o estado do equipamento.

**Estrutura da linha STATUS:**
- Cell 0: "DADOS DO EQUIPAMENTO – TRANSFORMADOR" (cinza)
- Cell 1: "STATUS" (cinza)
- Cell 2: **Quadradinho vazio** (deve receber a cor)

**Cores disponíveis:**
- 🟢 **Verde** (#00B050): Conforme / OK
- 🟡 **Amarelo** (#FFC000): Alerta / Atenção
- 🔴 **Vermelho** (#FF0000): Corretiva / Não Conforme

**Implementação:**
```typescript
function processStatusColor(docContent: string, status: string): string {
  const colorMap = {
    'conforme': '00B050',   // Verde
    'alerta': 'FFC000',     // Amarelo
    'corretiva': 'FF0000'   // Vermelho
  };
  
  const newColor = colorMap[status.toLowerCase()];
  
  // Encontrar a linha STATUS
  const statusIdx = docContent.indexOf('STATUS');
  const lineStart = docContent.lastIndexOf('<w:tr', statusIdx);
  const lineEnd = docContent.indexOf('</w:tr>', statusIdx);
  let line = docContent.substring(lineStart, lineEnd + 7);
  
  // Encontrar células
  const cells = line.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  // Cell 2 é o quadradinho colorido
  let colorCell = cells[2];
  
  // Aplicar cor removendo atributos de tema
  colorCell = colorCell.replace(
    /<w:shd\s+[^>]*\/>/g,
    `<w:shd w:val="clear" w:fill="${newColor}"/>`
  );
  
  // Se não tem w:shd, adicionar em w:tcPr
  if (!colorCell.includes('<w:shd')) {
    if (colorCell.includes('<w:tcPr>')) {
      colorCell = colorCell.replace(
        /<w:tcPr>/g,
        `<w:tcPr><w:shd w:val="clear" w:fill="${newColor}"/>`
      );
    }
  }
  
  // Reconstruir
  cells[2] = colorCell;
  // ... reconstruir linha e documento
}
```

**⚠️ IMPORTANTE:**
- Remover TODOS os atributos `themeFill`, `themeFillTint` e `w:color="auto"`
- Usar apenas `w:val="clear"` e `w:fill="COR"`
- A cor vai na **terceira célula** (índice 2), não na célula do texto "STATUS"

### 5. Fotos (Registro Fotográfico)
As fotos são inseridas na **última página** do documento, após uma quebra de página.

**Implementação:**
```typescript
async function processPhotos(zip: PizZip, docContent: string, photos: TecnicoPhoto[]) {
  // 1. Adicionar quebra de página
  let photosPageXml = '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>';
  
  // 2. Título da seção
  photosPageXml += `<w:p>...<w:t>REGISTRO FOTOGRÁFICO</w:t>...</w:p>`;
  
  // 3. Para cada foto:
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const photoId = `photo${i + 1}`;
    const rId = `rId${1000 + i}`;
    
    // Extrair base64 e salvar no ZIP
    const base64Data = photo.data.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    zip.file(`word/media/${photoId}.png`, imageBuffer);
    
    // Adicionar imagem ao documento com drawing/inline
    photosPageXml += `<w:p>...<wp:inline>...</wp:inline>...</w:p>`;
    
    // Adicionar descrição se existir
    if (photo.description) {
      photosPageXml += `<w:p>...<w:t>${photo.description}</w:t>...</w:p>`;
    }
  }
  
  // 4. Inserir antes de </w:body>
  const bodyEndPos = docContent.lastIndexOf('</w:body>');
  docContent = docContent.substring(0, bodyEndPos) + photosPageXml + docContent.substring(bodyEndPos);
  
  // 5. Atualizar word/_rels/document.xml.rels
  // 6. Atualizar [Content_Types].xml
  
  return { zip, docContent };
}
```

### 6. Tabelas Dinâmicas
Algumas seções têm tabelas que precisam de linhas adicionadas dinamicamente.

### 7. Campos Condicionais
Alguns campos só aparecem dependendo do tipo:
- Volume de óleo: apenas para transformador a óleo
- Análises (FQ, CR, PCB, 2FALL): apenas para transformador a óleo

### 8. Validação XML
Sempre validar o XML após modificações:
```typescript
// Verificar se o documento está válido
if (!docContent.includes('</w:document>')) {
  console.error('XML corrupted');
  return originalContent;
}

// Validar ZIP gerado
try {
  new PizZip(outputBuffer);
} catch (e) {
  console.error('Output validation failed');
  return originalContent;
}
```

---

## 🔍 Debugging e Análise de Templates DOCX

### Estrutura Interna de um DOCX
Um arquivo `.docx` é na verdade um arquivo ZIP contendo:
```
document.docx
├── [Content_Types].xml          # Tipos de conteúdo
├── _rels/                       # Relacionamentos
│   └── .rels
├── word/
│   ├── document.xml             # ⭐ CONTEÚDO PRINCIPAL DO DOCUMENTO
│   ├── styles.xml               # Estilos
│   ├── settings.xml             # Configurações
│   ├── fontTable.xml            # Fontes
│   ├── _rels/
│   │   └── document.xml.rels    # Relacionamentos (imagens, links)
│   └── media/                   # Imagens e mídia
│       ├── image1.png
│       └── image2.jpg
└── docProps/                    # Propriedades do documento
    ├── app.xml
    └── core.xml
```

**Arquivo mais importante:** `word/document.xml` - contém TODO o conteúdo visível do documento.

### Extraindo e Analisando o XML

#### Método 1: Python (Recomendado para análise)
```python
import zipfile

# Extrair document.xml
z = zipfile.ZipFile('template.docx')
content = z.read('word/document.xml').decode('utf-8')

# Salvar para análise
with open('document.xml', 'w', encoding='utf-8') as f:
    f.write(content)

# Buscar padrões específicos
import re
matches = re.findall(r'.{100}TEXTO_PROCURADO.{100}', content)
for i, match in enumerate(matches):
    print(f'{i}: {match}')
```

#### Método 2: Renomear extensão
```bash
# Renomear .docx para .zip
cp template.docx template.zip

# Extrair
unzip template.zip -d template_extracted

# Analisar
cat template_extracted/word/document.xml
```

### Estrutura XML do Word

#### Elementos Básicos
```xml
<w:document>                    <!-- Raiz do documento -->
  <w:body>                      <!-- Corpo do documento -->
    <w:p>                       <!-- Parágrafo -->
      <w:pPr>                   <!-- Propriedades do parágrafo -->
        <w:jc w:val="center"/>  <!-- Alinhamento: center/left/right -->
        <w:spacing w:before="120" w:after="120"/>
      </w:pPr>
      <w:r>                     <!-- Run (sequência de texto) -->
        <w:rPr>                 <!-- Propriedades do run -->
          <w:b/>                <!-- Negrito -->
          <w:i/>                <!-- Itálico -->
          <w:u w:val="single"/> <!-- Sublinhado -->
          <w:color w:val="FF0000"/>  <!-- Cor (hex) -->
          <w:sz w:val="24"/>    <!-- Tamanho (half-points: 24 = 12pt) -->
        </w:rPr>
        <w:t>Texto aqui</w:t>   <!-- Texto -->
      </w:r>
    </w:p>
    
    <w:tbl>                     <!-- Tabela -->
      <w:tr>                    <!-- Linha (table row) -->
        <w:tc>                  <!-- Célula (table cell) -->
          <w:tcPr>              <!-- Propriedades da célula -->
            <w:shd w:val="clear" w:fill="00B050"/>  <!-- Cor de fundo -->
            <w:tcW w:w="2000" w:type="dxa"/>        <!-- Largura -->
          </w:tcPr>
          <w:p>...</w:p>        <!-- Conteúdo da célula -->
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>
```

#### Checkboxes no Word
Existem **DOIS tipos** de checkboxes no Word:

**1. Unicode Checkboxes (Simples)**
```xml
<w:r>
  <w:rPr>
    <w:rFonts w:ascii="MS Gothic" w:eastAsia="MS Gothic"/>
  </w:rPr>
  <w:t>☐</w:t>  <!-- U+2610 - Unchecked -->
</w:r>
```

Para marcar: substituir `☐` por `☒` (U+2612)

**2. Form Field Checkboxes (Complexos)**
```xml
<w:sdt>
  <w:sdtPr>
    <w:id w:val="123456"/>
    <w14:checkbox>
      <w14:checked w14:val="0"/>              <!-- 0 = desmarcado, 1 = marcado -->
      <w14:checkedState w14:val="2612" w14:font="MS Gothic"/>    <!-- ☒ -->
      <w14:uncheckedState w14:val="2610" w14:font="MS Gothic"/>  <!-- ☐ -->
    </w14:checkbox>
  </w:sdtPr>
  <w:sdtContent>
    <w:r>
      <w:t>☐</w:t>  <!-- Representação visual -->
    </w:r>
  </w:sdtContent>
</w:sdt>
```

Para marcar: substituir `<w14:checked w14:val="0"/>` por `<w14:checked w14:val="1"/>`

### 🐛 Problema Comum: Checkboxes Não Marcam

#### Sintoma
Alguns checkboxes marcam corretamente (OK), mas outros não (NC/NA).

#### Causa Raiz
O texto do status (OK/NC/NA) está **muito longe** do checkbox no XML. Quando você busca o checkbox mais próximo do texto, a janela de busca é muito pequena.

#### Diagnóstico
```python
import zipfile

z = zipfile.ZipFile('template.docx')
content = z.read('word/document.xml').decode('utf-8')

# Encontrar distância entre label e status
labels = ['Integridade física', 'Subsistema de Captação', 'CONEXÕES']

for label in labels:
    idx = content.find(label)
    if idx == -1:
        print(f'{label}: NOT FOUND')
        continue
    
    section = content[idx:idx+5000]
    
    # Buscar cada status
    for status in ['>OK<', '>NC<', '>NA<']:
        pos = section.find(status)
        if pos != -1:
            print(f'{label} → {status}: {pos} chars')
```

**Exemplo de saída:**
```
Integridade física → >OK<: 1234 chars
Integridade física → >NC<: 2516 chars  ⚠️ Além de 2500!
Integridade física → >NA<: 3909 chars  ⚠️ Muito longe!
```

#### Solução
```typescript
function markInspectionCheckbox(
  docContent: string, 
  itemLabel: string, 
  status: 'OK' | 'NC' | 'NA'
): string {
  // 1. Encontrar o label
  const labelIndex = docContent.indexOf(itemLabel);
  if (labelIndex === -1) {
    console.log(`⚠️ Label not found: "${itemLabel}"`);
    return docContent;
  }
  
  // 2. ⚠️ CRÍTICO: Janela de busca GRANDE o suficiente
  // NA pode estar a ~4000 chars de distância!
  const SEARCH_WINDOW = 4500;  // ✅ Aumentar conforme necessário
  const afterLabel = docContent.substring(labelIndex, labelIndex + SEARCH_WINDOW);
  
  // 3. Buscar pelo padrão XML, não texto simples
  const statusMap = { 
    'OK': '>OK<',   // ✅ Padrão XML
    'NC': '>NC<',   // ✅ Não apenas "NC"
    'NA': '>NA<'    // ✅ Não apenas "NA"
  };
  const targetStatus = statusMap[status];
  
  // 4. Encontrar o status
  const statusTextIndex = afterLabel.indexOf(targetStatus);
  if (statusTextIndex === -1) {
    console.log(`⚠️ Status text "${targetStatus}" not found after "${itemLabel}"`);
    return docContent;
  }
  
  // 5. Encontrar o checkbox ANTES do status
  const beforeStatus = afterLabel.substring(0, statusTextIndex);
  const checkboxPos = beforeStatus.lastIndexOf('☐');
  
  if (checkboxPos === -1) {
    console.log(`⚠️ Checkbox not found before "${targetStatus}" for "${itemLabel}"`);
    return docContent;
  }
  
  // 6. Substituir
  const absolutePos = labelIndex + checkboxPos;
  const before = docContent.substring(0, absolutePos);
  const after = docContent.substring(absolutePos + 1);
  
  console.log(`✅ Inspection "${itemLabel}" = ${status} (unicode)`);
  return before + '☒' + after;
}
```

#### Lições Aprendidas

**❌ Erros Comuns:**
1. Buscar texto simples "NC" em vez de padrão XML `>NC<`
2. Janela de busca muito pequena (2500 chars quando NA está a 3900+)
3. Assumir que todos os checkboxes estão à mesma distância
4. Não validar se o padrão foi encontrado antes de substituir

**✅ Boas Práticas:**
1. **Sempre analisar o template primeiro** com Python/zipfile
2. **Medir distâncias reais** entre labels e status
3. **Usar padrões XML** (`>TEXT<`) em vez de texto simples
4. **Janela de busca generosa** (4500+ chars para cobrir todos os casos)
5. **Logs detalhados** para debug (posição encontrada, distância, etc)
6. **Testar todos os status** (OK, NC, NA) separadamente
7. **Validar XML** após cada modificação

### 🔧 Ferramentas de Debug

#### Script Python para Análise Rápida
```python
import zipfile
import sys

def analyze_docx(filename, search_text):
    """Analisa um DOCX e busca por texto específico"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    # Encontrar todas as ocorrências
    idx = 0
    occurrences = []
    while True:
        idx = content.find(search_text, idx)
        if idx == -1:
            break
        # Contexto: 200 chars antes e depois
        context = content[max(0, idx-200):idx+200]
        occurrences.append((idx, context))
        idx += 1
    
    print(f'Found {len(occurrences)} occurrences of "{search_text}":')
    for i, (pos, ctx) in enumerate(occurrences):
        print(f'\n{i+1}. Position {pos}:')
        print(ctx)
        print('-' * 80)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Usage: python analyze.py template.docx "search text"')
        sys.exit(1)
    
    analyze_docx(sys.argv[1], sys.argv[2])
```

**Uso:**
```bash
python analyze.py spda_nx.docx "Integridade física"
python analyze.py spda_nx.docx ">NC<"
```

#### Medindo Distâncias
```python
import zipfile

def measure_distances(filename, label, statuses):
    """Mede distância entre label e cada status"""
    z = zipfile.ZipFile(filename)
    content = z.read('word/document.xml').decode('utf-8')
    
    idx = content.find(label)
    if idx == -1:
        print(f'Label "{label}" not found')
        return
    
    section = content[idx:idx+5000]
    
    print(f'Distances from "{label}":')
    for status in statuses:
        pos = section.find(status)
        if pos != -1:
            print(f'  {status}: {pos} chars')
        else:
            print(f'  {status}: NOT FOUND in 5000 chars')

# Exemplo
measure_distances('spda_nx.docx', 'Integridade física', ['>OK<', '>NC<', '>NA<'])
```

### 📊 Casos de Uso Reais

#### Caso 1: SPDA Template - Checkboxes de Inspeção
**Problema:** 10 checkboxes de inspeção, apenas alguns marcavam.

**Análise:**
- Template tem checkboxes Unicode simples (☐/☒)
- Distâncias variavam: OK (1200-2400 chars), NC (2500-2600 chars), NA (3500-3900 chars)
- Código buscava apenas 2500 chars

**Solução:**
- Aumentar janela para 4500 chars
- Usar padrão XML `>STATUS<` em vez de texto simples
- Resultado: 100% dos checkboxes funcionando

#### Caso 2: Templates com Checkboxes Mistos
Alguns templates têm AMBOS os tipos de checkbox no mesmo documento.

**Estratégia:**
```typescript
function markCheckbox(docContent: string, label: string, status: string): string {
  // 1. Tentar Unicode primeiro (mais comum)
  let result = markUnicodeCheckbox(docContent, label, status);
  if (result !== docContent) return result;
  
  // 2. Se não funcionou, tentar Form Field
  result = markFormFieldCheckbox(docContent, label, status);
  if (result !== docContent) return result;
  
  console.log(`⚠️ No checkbox found for ${label}`);
  return docContent;
}
```

### 🎯 Checklist de Implementação

Ao implementar marcação de checkboxes em um novo template:

- [ ] Extrair e analisar `word/document.xml`
- [ ] Identificar tipo de checkbox (Unicode vs Form Field)
- [ ] Medir distâncias entre labels e status
- [ ] Determinar janela de busca adequada (mínimo: maior distância + 500)
- [ ] Usar padrões XML (`>TEXT<`) para busca
- [ ] Implementar logs detalhados
- [ ] Testar TODOS os status possíveis
- [ ] Validar XML após modificações
- [ ] Testar com dados reais do frontend

### 📚 Referências

- **Office Open XML Spec:** https://learn.microsoft.com/en-us/openspecs/office_standards/
- **WordprocessingML:** https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing
- **Unicode Checkboxes:** U+2610 (☐), U+2612 (☒), U+2611 (☑)
- **PizZip Documentation:** https://stuk.github.io/jszip/

---

## 🚀 Performance e Otimização

### Evitar Múltiplas Passagens
```typescript
// ❌ Ruim: múltiplas passagens no documento
for (const field of fields) {
  docContent = fillField(docContent, field.name, field.value);
}

// ✅ Melhor: uma única passagem
const replacements = fields.map(f => ({ 
  pattern: f.name, 
  value: f.value 
}));
docContent = applyAllReplacements(docContent, replacements);
```

### Cache de Posições
```typescript
// Se precisa marcar múltiplos checkboxes na mesma seção
const sectionCache = new Map<string, number>();

function findSection(docContent: string, label: string): number {
  if (sectionCache.has(label)) {
    return sectionCache.get(label)!;
  }
  const pos = docContent.indexOf(label);
  sectionCache.set(label, pos);
  return pos;
}
```


---

## 🖼️ Inserção de Imagens e Assinaturas

### Tipos de Imagens em DOCX

#### 1. Imagens Inline (dentro do texto)
Usadas para assinaturas, logos pequenos, ícones.

**Estrutura XML:**
```xml
<w:r>
  <w:rPr><w:noProof/></w:rPr>
  <w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="1500000" cy="750000"/>  <!-- Tamanho em EMUs -->
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="1" name="Assinatura"/>
      <wp:cNvGraphicFramePr>
        <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
      </wp:cNvGraphicFramePr>
      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:nvPicPr>
              <pic:cNvPr id="0" name="Assinatura"/>
              <pic:cNvPicPr>
                <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
              </pic:cNvPicPr>
            </pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="rIdSig"/>  <!-- Referência ao relacionamento -->
              <a:stretch><a:fillRect/></a:stretch>
            </pic:blipFill>
            <pic:spPr bwMode="auto">
              <a:xfrm>
                <a:off x="0" y="0"/>
                <a:ext cx="1500000" cy="750000"/>
              </a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>
</w:r>
```

**Unidades EMU (English Metric Units):**
- 1 inch = 914,400 EMUs
- 1 cm = 360,000 EMUs
- Para assinatura pequena (4cm x 2cm): cx="1440000" cy="720000"
- Para foto média (10cm x 7.5cm): cx="3600000" cy="2700000"

### Implementação: Assinaturas em Células de Tabela

#### Caso de Uso: RDO - Assinaturas do Responsável e Cliente

**Contexto:**
- Template tem tabela com 2 colunas no rodapé
- Coluna esquerda: linha tracejada `--------------------` (assinatura responsável)
- Coluna direita: linha tracejada `____________________ CLIENTE` (assinatura cliente)

**Desafio:**
Substituir as linhas tracejadas por imagens de assinatura desenhadas pelo usuário.

**Estratégia Completa:**

```typescript
/**
 * Cria XML de drawing inline para assinatura
 */
function createSignatureDrawing(rId: string, signatureId: string): string {
  // Tamanho pequeno para assinatura: ~4cm x 2cm
  const cx = 1500000; // largura em EMUs
  const cy = 750000;  // altura em EMUs
  
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${Math.floor(Math.random() * 100000)}" name="${signatureId}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${signatureId}"/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

/**
 * Adiciona assinatura ao ZIP e cria relacionamento
 */
function addSignatureToZip(
  zip: PizZip, 
  signatureBase64: string, 
  rId: string, 
  filename: string
): void {
  // 1. Remover prefixo data:image/...;base64,
  const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');
  
  // 2. Adicionar imagem ao ZIP
  zip.file(`word/media/${filename}.png`, imageBuffer);
  
  // 3. Adicionar relacionamento em word/_rels/document.xml.rels
  const relsFile = zip.file('word/_rels/document.xml.rels');
  if (relsFile) {
    let relsContent = relsFile.asText();
    const newRel = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${filename}.png"/>`;
    const insertPos = relsContent.lastIndexOf('</Relationships>');
    relsContent = relsContent.substring(0, insertPos) + newRel + relsContent.substring(insertPos);
    zip.file('word/_rels/document.xml.rels', relsContent);
  }
}

/**
 * Substitui linha tracejada por assinatura - MÉTODO QUE FUNCIONA
 */
function replaceSignatureByMarker(
  docContent: string,
  markerText: string,  // Ex: "CLIENTE" para encontrar a linha certa
  rId: string
): string {
  // 1. Encontrar o marcador (ex: "CLIENTE")
  // Pode haver múltiplas ocorrências, procurar depois de "Nós NX Energy" se existir
  let searchStart = 0;
  const nxPos = docContent.indexOf('Nós NX Energy');
  if (nxPos !== -1) {
    searchStart = nxPos;
  }
  
  const markerPos = docContent.indexOf(markerText, searchStart);
  if (markerPos === -1) {
    console.log(`⚠️ Marker "${markerText}" not found`);
    return docContent;
  }
  
  console.log(`🔍 Found "${markerText}" at position ${markerPos}`);
  
  // 2. Encontrar a linha (row) que contém o marcador
  const rowStart = docContent.lastIndexOf('<w:tr', markerPos);
  const rowEnd = docContent.indexOf('</w:tr>', markerPos);
  
  if (rowStart === -1 || rowEnd === -1) {
    console.log('⚠️ Row not found');
    return docContent;
  }
  
  console.log('📋 Found row with marker');
  
  const rowContent = docContent.substring(rowStart, rowEnd + 7);
  
  // 3. Extrair células da linha
  const cells = rowContent.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
  
  if (!cells || cells.length < 2) {
    console.log(`⚠️ Not enough cells (found ${cells?.length || 0})`);
    return docContent;
  }
  
  console.log(`📦 Found ${cells.length} cells`);
  
  // 4. Determinar qual célula modificar
  // Para CLIENTE: modificar a célula que contém "CLIENTE"
  // Para responsável: modificar a PRIMEIRA célula (antes de CLIENTE)
  let targetCellIndex = 0;
  
  if (markerText === 'CLIENTE') {
    // Procurar célula que contém "CLIENTE"
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].includes('CLIENTE')) {
        targetCellIndex = i;
        break;
      }
    }
  }
  // Se não é CLIENTE, usa célula 0 (primeira)
  
  let targetCell = cells[targetCellIndex];
  
  // 5. Procurar linha tracejada (hífens ou underscores)
  const dashMatch = targetCell.match(/(-{10,}|_{10,})/);
  
  if (!dashMatch || dashMatch.index === undefined) {
    console.log(`⚠️ No dashed line found in cell ${targetCellIndex}`);
    console.log('Cell preview:', targetCell.substring(0, 300));
    return docContent;
  }
  
  console.log(`✅ Found dashed line at position ${dashMatch.index}`);
  
  const dashPos = dashMatch.index;
  let endPos = dashPos;
  while (endPos < targetCell.length && (targetCell[endPos] === '-' || targetCell[endPos] === '_')) {
    endPos++;
  }
  
  // 6. Criar XML da assinatura
  const sigDrawing = createSignatureDrawing(rId, `Assinatura ${markerText}`);
  
  // 7. Substituir linha tracejada pela imagem
  targetCell = targetCell.substring(0, dashPos) + sigDrawing + targetCell.substring(endPos);
  cells[targetCellIndex] = targetCell;
  
  // 8. Reconstruir linha
  const rowStartTag = rowContent.substring(0, rowContent.indexOf('<w:tc'));
  const rowEndTag = rowContent.substring(rowContent.lastIndexOf('</w:tc>') + 7);
  const newRow = rowStartTag + cells.join('') + rowEndTag;
  
  // 9. Substituir no documento
  docContent = docContent.substring(0, rowStart) + newRow + docContent.substring(rowEnd + 7);
  
  console.log(`✅ Signature inserted for "${markerText}" in cell ${targetCellIndex}`);
  return docContent;
}

/**
 * Exemplo de uso completo - RDO
 */
async function insertRDOSignatures(
  zip: PizZip,
  docContent: string,
  responsavelSignature: string,  // base64
  clienteSignature: string        // base64
): Promise<{ zip: PizZip; docContent: string }> {
  
  // 1. Adicionar assinatura do responsável (célula esquerda)
  if (responsavelSignature) {
    console.log('🖊️ Processing RESPONSÁVEL signature...');
    addSignatureToZip(zip, responsavelSignature, 'rIdSigResp', 'assinatura_responsavel');
    
    // Procurar pela linha que contém "CLIENTE" e modificar a PRIMEIRA célula
    docContent = replaceSignatureByMarker(docContent, 'CLIENTE', 'rIdSigResp');
  }
  
  // 2. Adicionar assinatura do cliente (célula direita com "CLIENTE")
  if (clienteSignature) {
    console.log('🖊️ Processing CLIENTE signature...');
    addSignatureToZip(zip, clienteSignature, 'rIdSigCli', 'assinatura_cliente');
    docContent = replaceSignatureByMarker(docContent, 'CLIENTE', 'rIdSigCli');
  }
  
  return { zip, docContent };
}
```

**Lições Aprendidas - Assinaturas:**

1. **Procurar pela linha certa:** Use um marcador único (ex: "CLIENTE") para encontrar a linha correta
2. **Células na ordem:** A primeira célula é do responsável, a segunda (ou que contém "CLIENTE") é do cliente
3. **Linha tracejada pode variar:** Pode ser `----` ou `____`, use regex `/(-{10,}|_{10,})/`
4. **Tamanho da assinatura:** 4cm x 2cm (1500000 x 750000 EMUs) é um bom tamanho padrão
5. **IDs únicos:** Use IDs únicos para cada imagem (rIdSigResp, rIdSigCli, etc)
6. **Validar sempre:** Verifique se encontrou a linha, célula e linha tracejada antes de substituir
7. **Logs detalhados:** Console.log em cada etapa ajuda muito no debug
8. **Contexto importa:** Se há múltiplas ocorrências do marcador, procure depois de um ponto de referência (ex: "Nós NX Energy")

### Fotos em Grid (2 colunas)

Para relatórios fotográficos com layout em grade:

```typescript
async function addPhotosInGrid(
  zip: PizZip,
  docContent: string,
  photos: Array<{ data: string; description?: string }>
): Promise<{ zip: PizZip; docContent: string }> {
  
  if (!photos || photos.length === 0) return { zip, docContent };
  
  console.log(`📸 Processing ${photos.length} photos in GRID format...`);
  
  // 1. Adicionar quebra de página
  let photosXml = '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>';
  
  // 2. Título
  photosXml += `<w:p w14:paraId="00000000" w14:textId="00000000" w:rsidR="00000000" w:rsidRDefault="00000000">
    <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr>
    <w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>REGISTRO FOTOGRÁFICO</w:t></w:r>
  </w:p>`;
  
  // 3. Criar tabela 2 colunas
  photosXml += `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="9000" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="4500"/><w:gridCol w:w="4500"/></w:tblGrid>`;
  
  // 4. Adicionar fotos em pares (2 por linha)
  for (let i = 0; i < photos.length; i += 2) {
    photosXml += '<w:tr>';
    
    // Foto 1 (esquerda)
    const photo1 = photos[i];
    const rId1 = `rIdPhoto${i + 1}`;
    addSignatureToZip(zip, photo1.data, rId1, `rdophoto${i + 1}`);
    
    photosXml += `<w:tc>
      <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:b/></w:rPr><w:t>Foto ${i + 1}</w:t></w:r>
      </w:p>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
        ${createPhotoDrawing(rId1, `Foto ${i + 1}`)}
      </w:p>
      ${photo1.description ? `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>${escapeXml(photo1.description)}</w:t></w:r></w:p>` : '<w:p/>'}
    </w:tc>`;
    
    // Foto 2 (direita) - se existir
    if (i + 1 < photos.length) {
      const photo2 = photos[i + 1];
      const rId2 = `rIdPhoto${i + 2}`;
      addSignatureToZip(zip, photo2.data, rId2, `rdophoto${i + 2}`);
      
      photosXml += `<w:tc>
        <w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>
        <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
          <w:r><w:rPr><w:b/></w:rPr><w:t>Foto ${i + 2}</w:t></w:r>
        </w:p>
        <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
          ${createPhotoDrawing(rId2, `Foto ${i + 2}`)}
        </w:p>
        ${photo2.description ? `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>${escapeXml(photo2.description)}</w:t></w:r></w:p>` : '<w:p/>'}
      </w:tc>`;
    } else {
      // Célula vazia se número ímpar de fotos
      photosXml += '<w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr><w:p/></w:tc>';
    }
    
    photosXml += '</w:tr>';
    console.log(`✅ Added photo ${i + 1}${i + 1 < photos.length ? ` and ${i + 2}` : ''}`);
  }
  
  photosXml += '</w:tbl>';
  
  // 5. Inserir antes de </w:body>
  const bodyEndPos = docContent.lastIndexOf('</w:body>');
  docContent = docContent.substring(0, bodyEndPos) + photosXml + docContent.substring(bodyEndPos);
  
  console.log(`✅ Added ${photos.length} photos in GRID format (2 columns)`);
  
  return { zip, docContent };
}

function createPhotoDrawing(rId: string, photoId: string): string {
  // Tamanho para fotos em grid: ~7cm x 5.25cm
  const cx = 2520000;  // 7cm
  const cy = 1890000;  // 5.25cm
  
  return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${Math.floor(Math.random() * 100000)}" name="${photoId}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${photoId}"/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}
```

### Checklist para Inserção de Imagens

- [ ] Converter base64 para Buffer (remover prefixo `data:image/...;base64,`)
- [ ] Adicionar imagem ao ZIP em `word/media/` com nome único
- [ ] Criar relacionamento em `word/_rels/document.xml.rels` com ID único
- [ ] Gerar XML de drawing com tamanho apropriado (EMUs)
- [ ] Inserir drawing no local correto do documento
- [ ] Usar IDs únicos para cada imagem (rId + número sequencial)
- [ ] Validar XML após inserção (verificar `</w:document>`)
- [ ] Testar com diferentes tamanhos de imagem
- [ ] Adicionar logs detalhados para debug
- [ ] Escapar XML em descrições de fotos (`escapeXml()`)

### Tamanhos Recomendados (EMUs)

| Tipo | Largura (cm) | Altura (cm) | cx (EMUs) | cy (EMUs) |
|------|--------------|-------------|-----------|-----------|
| Assinatura pequena | 4 | 2 | 1440000 | 720000 |
| Assinatura média | 5 | 2.5 | 1800000 | 900000 |
| Foto em grid (2 col) | 7 | 5.25 | 2520000 | 1890000 |
| Foto grande | 10 | 7.5 | 3600000 | 2700000 |
| Logo pequeno | 3 | 3 | 1080000 | 1080000 |

**Conversão:** `EMUs = cm × 360000`
