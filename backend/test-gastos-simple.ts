// Test Gastos Generator - Debug version
import { generateGastosReport } from './src/services/gastos-generator.js';
import * as fs from 'fs';

const testData = {
  template: 'sercamp' as const,
  osNumber: '24412',
  clientName: 'Cliente Teste',
  userName: 'Administrador',
  prestacaoDate: new Date().toISOString(),
  receipts: [
    {
      id: '1',
      fileName: 'Comprovante 1',
      fileData: '',
      amount: 25.00,
      description: 'Comprovante 1',
      category: 'Geral',
      uploadDate: new Date().toISOString()
    },
    {
      id: '2',
      fileName: 'Comprovante 2',
      fileData: '',
      amount: 20.00,
      description: 'Comprovante 2',
      category: 'Geral',
      uploadDate: new Date().toISOString()
    }
  ],
  totalAmount: 45.00,
  aprovacao: 'aprovado' as const,
  ressalvas: 'Teste de ressalvas'
};

console.log('🧪 Testing Gastos Generator...\n');

try {
  const buffer = await generateGastosReport(testData);
  
  console.log('\n✅ Generation completed!');
  console.log('Buffer size:', buffer.length);
  
  // Save to file
  fs.writeFileSync('test-gastos-output.docx', buffer);
  console.log('📄 Saved to: test-gastos-output.docx');
  
  // Try to open with PizZip to validate
  const PizZip = (await import('pizzip')).default;
  try {
    new PizZip(buffer);
    console.log('✅ ZIP validation: OK');
  } catch (e) {
    console.error('❌ ZIP validation: FAILED');
    console.error(e);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
