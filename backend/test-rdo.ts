// Script de teste para RDO Generator
import { generateRDOReportFromTemplate } from './src/services/rdo-generator-template.js';
import type { RDOMontagemData } from './src/types/rdo-montagem.js';
import * as fs from 'fs';

const testData: RDOMontagemData = {
  template: 'sercamp',
  numeroOS: 'OS-2024-001',
  data: '2024-01-20',
  projeto: 'Manutenção Preventiva',
  cliente: 'Cliente Teste LTDA',
  cidade: 'São Paulo/SP',
  nomeSubestacao: 'SE Teste 138kV',
  naturezaServico: 'Manutenção preventiva em transformador de potência',
  caracteristicasEquipamento: 'Transformador 138/13.8kV - 25MVA',
  numeroSerie: 'TR-12345',
  
  participantes: [
    { nome: 'João Silva', empresa: 'SERCAMP', visto: '' },
    { nome: 'Maria Santos', empresa: 'SERCAMP', visto: '' },
    { nome: 'Pedro Oliveira', empresa: 'Cliente', visto: '' }
  ],
  
  horasTrabalho: {
    horarioNormalInicio: '08:00',
    horarioNormalTermino: '17:00',
    liberacaoHorasExtras: 'nao',
    liberacaoHorasExtrasObs: '',
    horasExtrasInicio: '00:00',
    horasExtrasTermino: '00:00',
    autorizadoPor: '',
    horasDeslocamentoInicio: '06:00',
    horasDeslocamentoTermino: '08:00',
    horasDeslocamentoTotal: '2:00',
    horasTrabalhadasCliente: '8:00',
    horarioAlmocoInicio: '12:00',
    horarioAlmocoTermino: '13:00',
    horarioAlmoco: '1:00',
    horasJantarInicio: '00:00',
    horasJantarTermino: '00:00',
    horasJantar: '0:00',
    horasDeslocamentoRetornoInicio: '17:00',
    horasDeslocamentoRetornoTermino: '19:00',
    horasDeslocamentoRetorno: '2:00',
    horasDisposicaoInicio: '00:00',
    horasDisposicaoTermino: '00:00',
    horasDisposicao: '0:00',
    horasTotaisTrabalhadas: '12:00'
  },
  
  horasDisponibilizadas: {
    integracaoInicio: '08:00',
    integracaoTermino: '09:00',
    integracaoTotal: '1:00',
    faltaRecursosInicio: '00:00',
    faltaRecursosTermino: '00:00',
    faltaRecursosTotal: '0:00',
    condicoesClimaticasInicio: '00:00',
    condicoesClimaticasTermino: '00:00',
    condicoesClimaticasTotal: '0:00',
    retomadaAtividadesInicio: '00:00',
    retomadaAtividadesTermino: '00:00',
    retomadaAtividadesTotal: '0:00',
    outrosDescricao: '',
    outrosInicio: '00:00',
    outrosTermino: '00:00',
    outrosTotal: '0:00',
    total: '1:00'
  },
  
  atividadesExecutadas: [
    { item: '1', descricao: 'Inspeção visual geral do equipamento' },
    { item: '2', descricao: 'Medição de resistência de isolamento' },
    { item: '3', descricao: 'Limpeza de buchas e isoladores' },
    { item: '4', descricao: 'Verificação de nível de óleo' }
  ],
  
  photos: [],
  
  representanteSercamp: 'Sérgio Lima',
  representanteSercampAssinatura: '',
  representanteCliente: 'José Cliente',
  representanteClienteAssinatura: '',
  
  observacoes: 'Equipamento em boas condições. Recomenda-se próxima manutenção em 6 meses.'
};

async function runTest() {
  console.log('🧪 Starting RDO Generator Test...\n');
  
  try {
    const buffer = await generateRDOReportFromTemplate(testData);
    
    const outputPath = './test-rdo-output.docx';
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`\n✅ Test completed successfully!`);
    console.log(`📄 Output saved to: ${outputPath}`);
    console.log(`📊 File size: ${buffer.length} bytes`);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
