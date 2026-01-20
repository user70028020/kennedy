// Test Gastos Generator with images - Simulate frontend
import { generateGastosReport } from './src/services/gastos-generator.js';
import * as fs from 'fs';

// Create a small test image (1x1 red pixel PNG)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

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
      fileData: testImageBase64,
      amount: 25.00,
      description: 'Almoço',
      category: 'Alimentação',
      uploadDate: new Date().toISOString()
    },
    {
      id: '2',
      fileName: 'Comprovante 2',
      fileData: testImageBase64,
      amount: 20.00,
      description: 'Combustível',
      category: 'Transporte',
      uploadDate: new Date().toISOString()
    }
  ],
  totalAmount: 45.00,
  aprovacao: 'aprovado' as const,
  ressalvas: 'Teste de ressalvas com imagens'
};

console.log('🧪 Testing Gastos Generator WITH IMAGES...\n');

try {
  const buffer = await generateGastosReport(testData);
  
  console.log('\n✅ Generation completed!');
  console.log('Buffer size:', buffer.length);
  
  // Save to file
  fs.writeFileSync('test-gastos-with-images-output.docx', buffer);
  console.log('📄 Saved to: test-gastos-with-images-output.docx');
  
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
