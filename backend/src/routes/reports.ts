import { Router, Request, Response } from 'express';
import { authMiddleware, moduleMiddleware } from '../middleware/index.js';
import { FotograficoReportSchema, TecnicoReportSchema, SPDAReportSchema, RDOReportSchema, GastosReportSchema, PesquisaSatisfacaoSchema, type Photo } from '../types/reports.js';
import { bufferToBase64 } from '../services/docx-generator.js';
import { prisma } from '../services/database.js';
import type { RDOMontagemData } from '../types/rdo-montagem.js';
import { 
  getEquipmentTemplatePath, 
  templateExists, 
  copyTemplate,
  generateFromTemplate,
  getEquipmentByCategory,
  EQUIPMENT_NAMES 
} from '../services/template-generator.js';
import { generateFotograficoReport } from '../services/fotografico-generator.js';
import { generateTecnicoReport } from '../services/tecnico-generator.js';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

/**
 * GET /api/reports/equipment-types
 * Get available equipment types for report generation
 */
router.get(
  '/equipment-types',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const categories = getEquipmentByCategory();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar tipos de equipamento' });
    }
  }
);


/**
 * POST /api/reports/fotografico
 * Generate a photographic report with images
 * Uses the new templates: relatorionx.docx and relatoriosercamp.docx
 */
router.post(
  '/fotografico',
  authMiddleware,
  moduleMiddleware('fotografico'),
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = FotograficoReportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const data = validationResult.data;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      console.log('=== Fotografico Report Request ===');
      console.log('Template:', data.template);
      console.log('OS:', data.osNumber);
      console.log('Client:', data.clientName);
      console.log('Equipment:', data.equipmentType);
      console.log('Photos:', data.photos?.length || 0);
      console.log('==================================');

      // Generate document using the new fotografico generator
      const buffer = await generateFotograficoReport(data.template, {
        osNumber: data.osNumber,
        reportDate: data.reportDate,
        clientName: data.clientName,
        location: data.location,
        equipmentType: data.equipmentType,
        serialNumber: data.serialNumber,
        responsible: data.responsible,
        observations: data.observations,
        photos: data.photos,
      });

      const fileName = `relatorio_fotografico_${data.osNumber}_${Date.now()}.docx`;

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'fotografico',
          osNumber: data.osNumber,
          clientName: data.clientName,
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: data.template,
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated fotografico report for OS ${data.osNumber}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('Error generating fotografico report:', error);
      res.status(500).json({
        message: 'Erro ao gerar relatório fotográfico',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * POST /api/reports/tecnico
 * Generate a technical report for a specific equipment type
 * Uses the new templates with proper field injection
 * Requirements: 2.3, 2.4, 2.5
 */
router.post(
  '/tecnico',
  authMiddleware,
  moduleMiddleware('tecnico'),
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = TecnicoReportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const data = validationResult.data;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      console.log('=== Tecnico Report Request ===');
      console.log('Equipment Type:', data.equipmentType);
      console.log('Template:', data.template);
      console.log('OS:', data.osNumber);
      console.log('Client:', data.clientName);
      console.log('Status:', data.status);
      console.log('Form Data:', JSON.stringify(data.formData, null, 2));
      console.log('Photos:', data.photos?.length || 0);
      console.log('==============================');

      // Generate document using the new tecnico generator
      const buffer = await generateTecnicoReport(
        data.equipmentType,
        data.template as 'nx_energy' | 'sercamp',
        {
          osNumber: data.osNumber,
          reportDate: data.reportDate,
          clientName: data.clientName,
          location: data.location,
          responsible: data.responsible,
          observations: data.observations,
          status: data.status as 'conforme' | 'alerta' | 'corretiva' | '',
          photos: data.photos?.map(p => ({
            id: p.id || String(Math.random()),
            data: p.data,
            name: p.name || 'foto',
            description: p.description
          })),
          formData: data.formData || {}
        }
      );

      const fileName = `relatorio_tecnico_${data.equipmentType}_${data.osNumber}_${Date.now()}.docx`;

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'tecnico',
          osNumber: data.osNumber,
          clientName: data.clientName,
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: data.template,
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated tecnico report (${data.equipmentType}) for OS ${data.osNumber} - Status: ${data.status}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('Error generating tecnico report:', error);
      res.status(500).json({
        message: 'Erro ao gerar relatório técnico',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * POST /api/reports/tecnico/:equipmentType
 * Legacy endpoint - Generate a technical report for a specific equipment type
 * Uses the real NX Energy templates
 */
router.post(
  '/tecnico/:equipmentType',
  authMiddleware,
  moduleMiddleware('tecnico'),
  async (req: Request, res: Response) => {
    try {
      const { equipmentType } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Check if template exists for this equipment type
      if (!templateExists(equipmentType)) {
        return res.status(400).json({ 
          message: `Template não encontrado para equipamento: ${equipmentType}`,
          availableTypes: Object.keys(EQUIPMENT_NAMES)
        });
      }

      const templatePath = getEquipmentTemplatePath(equipmentType);
      
      // Copy the template (preserves all formatting, logos, etc.)
      const buffer = copyTemplate(templatePath);
      
      const osNumber = req.body.osNumber || 'SEM-OS';
      const clientName = req.body.clientName || 'Cliente';
      const fileName = `relatorio_${equipmentType}_${osNumber}_${Date.now()}.docx`;

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'tecnico',
          osNumber: osNumber,
          clientName: clientName,
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: 'nx_energy',
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated ${equipmentType} report for OS ${osNumber}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('Error generating tecnico report:', error);
      res.status(500).json({
        message: 'Erro ao gerar relatório técnico',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * POST /api/reports/spda
 * Generate SPDA report with measurement points, sketch, and status
 * Uses REAL TEMPLATES (spda_nx.docx / spda_sercamp.docx) - PROFESSIONAL
 * Requirements: 4.1, 4.2, 4.3
 */
router.post(
  '/spda',
  authMiddleware,
  moduleMiddleware('spda'),
  async (req: Request, res: Response) => {
    try {
      console.log('=== SPDA Report Request (TEMPLATE-BASED) ===');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const data = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Import the template-based SPDA generator
      const { generateSPDAReportFromTemplate } = await import('../services/spda-generator-template.js');

      // Map frontend data to generator format
      const spdaData = {
        ordem_servico: data.ordem_servico || data.osNumber || '',
        cliente: data.cliente || data.clientName || '',
        data: data.data || (data.reportDate ? new Date(data.reportDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')),
        status: data.status || 'APROVADO',
        equipe_tecnica: data.equipe_tecnica || data.responsible || '',
        tipo_spda: data.tipo_spda || data.protectionMethods || [],
        equipamento_medicao: data.equipamento_medicao || (data.measurementEquipment ? [data.measurementEquipment] : []),
        // Inspection fields from frontend
        projeto_spda: data.projeto_spda || data.inspections?.projeto_spda,
        integridade_condutores: data.integridade_condutores || data.inspections?.integridade_condutores,
        subsistema_captacao: data.subsistema_captacao || data.inspections?.subsistema_captacao,
        caixa_inspecao: data.caixa_inspecao || data.inspections?.caixa_inspecao,
        subsistema_condutores: data.subsistema_condutores || data.inspections?.subsistema_condutores,
        isoladores: data.isoladores || data.inspections?.isoladores,
        subsistema_conexoes: data.subsistema_conexoes || data.inspections?.subsistema_conexoes,
        eletroduto_pcv: data.eletroduto_pcv || data.inspections?.eletroduto_pcv,
        condicao_equipotencializacoes: data.condicao_equipotencializacoes || data.inspections?.condicao_equipotencializacoes,
        ponto_ruptura: data.ponto_ruptura || data.inspections?.ponto_ruptura,
        subsistema_aterramento: data.subsistema_aterramento || data.inspections?.subsistema_aterramento,
        pontos: (data.pontos || data.measurementPoints || []).map((p: any, idx: number) => ({
          id: p.id || String(Math.random()),
          number: p.number || String(idx + 1).padStart(2, '0'),
          valor: p.valor || p.value || '',
          foto: p.foto || p.photo?.data || '',
          nFoto: p.nFoto || String(idx + 1).padStart(2, '0'),
        })),
        croqui: data.croqui || data.sketchData || '',
        conclusao_observacoes: data.conclusao_observacoes || data.conclusion || data.observations || '',
        template: data.template === 'nx_energy' ? 'nx-energy' : 'sercamp',
      };

      console.log('=== Mapped SPDA Data ===');
      console.log('ordem_servico:', spdaData.ordem_servico);
      console.log('cliente:', spdaData.cliente);
      console.log('data:', spdaData.data);
      console.log('status:', spdaData.status);
      console.log('equipe_tecnica:', spdaData.equipe_tecnica);
      console.log('tipo_spda:', spdaData.tipo_spda);
      console.log('equipamento_medicao:', spdaData.equipamento_medicao);
      console.log('projeto_spda:', spdaData.projeto_spda);
      console.log('integridade_condutores:', spdaData.integridade_condutores);
      console.log('subsistema_captacao:', spdaData.subsistema_captacao);
      console.log('subsistema_condutores:', spdaData.subsistema_condutores);
      console.log('caixa_inspecao:', spdaData.caixa_inspecao);
      console.log('subsistema_conexoes:', spdaData.subsistema_conexoes);
      console.log('isoladores:', spdaData.isoladores);
      console.log('condicao_equipotencializacoes:', spdaData.condicao_equipotencializacoes);
      console.log('eletroduto_pcv:', spdaData.eletroduto_pcv);
      console.log('subsistema_aterramento:', spdaData.subsistema_aterramento);
      console.log('ponto_ruptura:', spdaData.ponto_ruptura);
      console.log('pontos:', spdaData.pontos.length);
      console.log('croqui:', spdaData.croqui ? 'SIM' : 'NÃO');
      console.log('========================');

      // Generate document using TEMPLATE-BASED generator
      const buffer = await generateSPDAReportFromTemplate(spdaData.template, spdaData);
      const fileName = `relatorio_spda_${data.osNumber}_${Date.now()}.docx`;

      console.log('✅ SPDA Report generated successfully!');
      console.log('Buffer size:', buffer.length);

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'spda',
          osNumber: data.ordem_servico || data.osNumber || 'SN',
          clientName: data.cliente || data.clientName || 'Cliente',
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: data.template,
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated SPDA report (TEMPLATE) for OS ${data.ordem_servico || data.osNumber} - Status: ${data.status}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Error generating SPDA report:', error);
      res.status(500).json({
        message: 'Erro ao gerar relatório SPDA',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// GET endpoints for module access verification
router.get('/fotografico', authMiddleware, moduleMiddleware('fotografico'), (req, res) => {
  res.json({ message: 'Fotografico reports endpoint' });
});

/**
 * POST /api/reports/rdo
 * Generate RDO (Relatório Diário de Obra) de Montagem
 * Uses REAL TEMPLATES (like tecnico-generator) - PROFESSIONAL
 * Includes team members, work schedule, activities, signatures
 * Requirements: 5.1, 5.2, 5.3
 */
router.post(
  '/rdo',
  authMiddleware,
  moduleMiddleware('rdo'),
  async (req: Request, res: Response) => {
    try {
      console.log('=== RDO Report Request (TEMPLATE-BASED) ===');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const data = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Import the COMPLETE RDO generator (template-based, 100% working)
      const { generateRDOReportFromTemplate } = await import('../services/rdo-generator-template.js');

      // Frontend now sends COMPLETE data structure - use it directly
      const rdoData: RDOMontagemData = {
        // Identificação
        numeroOS: data.numeroOS || '',
        data: data.data || new Date().toLocaleDateString('pt-BR'),
        projeto: data.projeto || '',
        cliente: data.cliente || '',
        cidade: data.cidade || '',
        nomeSubestacao: data.nomeSubestacao || '',
        
        // Equipamento
        naturezaServico: data.naturezaServico || '',
        caracteristicasEquipamento: data.caracteristicasEquipamento || '',
        numeroSerie: data.numeroSerie || '',
        
        // Equipe
        participantes: data.participantes || [],
        
        // Representantes
        representanteSercamp: data.representanteSercamp || 'Sérgio Lima',
        representanteSercampAssinatura: data.representanteSercampAssinatura || '',
        representanteCliente: data.representanteCliente || '',
        representanteClienteAssinatura: data.representanteClienteAssinatura || '',
        certificacaoHorasAssinatura: data.certificacaoHorasAssinatura || '',
        
        // Atividades
        atividadesExecutadas: data.atividadesExecutadas || [],
        
        // Horas de Trabalho - COMPLETE from frontend
        horasTrabalho: data.horasTrabalho || {
          horarioNormalInicio: '00:00',
          horarioNormalTermino: '00:00',
          liberacaoHorasExtras: '',
          liberacaoHorasExtrasObs: '',
          horasExtrasInicio: '00:00',
          horasExtrasTermino: '00:00',
          autorizadoPor: '',
          horasDeslocamentoInicio: '00:00',
          horasDeslocamentoTermino: '00:00',
          horasDeslocamentoTotal: '0:00',
          horasTrabalhadasClienteInicio: '00:00',
          horasTrabalhadasClienteTermino: '00:00',
          horasTrabalhadasCliente: '0:00',
          horarioAlmocoInicio: '00:00',
          horarioAlmocoTermino: '00:00',
          horarioAlmoco: '0:00',
          horasJantarInicio: '00:00',
          horasJantarTermino: '00:00',
          horasJantar: '0:00',
          horasDeslocamentoRetornoInicio: '00:00',
          horasDeslocamentoRetornoTermino: '00:00',
          horasDeslocamentoRetorno: '0:00',
          horasDisposicaoInicio: '00:00',
          horasDisposicaoTermino: '00:00',
          horasDisposicao: '0:00',
          horasTotaisTrabalhadas: '0:00',
        },
        
        // Horas Disponibilizadas - COMPLETE from frontend
        horasDisponibilizadas: data.horasDisponibilizadas || {
          integracaoInicio: '00:00',
          integracaoTermino: '00:00',
          integracaoTotal: '0:00',
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
          total: '0:00',
        },
        
        // Fotos
        photos: data.photos || [],
        
        // Template
        template: data.template || 'sercamp',
        
        // Observações
        observacoes: data.observacoes || '',
      };

      console.log('=== RDO Data Summary ===');
      console.log('OS:', rdoData.numeroOS);
      console.log('Cliente:', rdoData.cliente);
      console.log('Participantes:', rdoData.participantes.length);
      console.log('Atividades:', rdoData.atividadesExecutadas.length);
      console.log('Fotos:', rdoData.photos.length);
      console.log('========================');

      // Generate document using TEMPLATE-BASED generator
      const buffer = await generateRDOReportFromTemplate(rdoData);
      const fileName = `rdo_montagem_${rdoData.numeroOS}_${Date.now()}.docx`;

      console.log('✅ RDO Report generated successfully!');
      console.log('Buffer size:', buffer.length);

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'rdo',
          osNumber: rdoData.numeroOS,
          clientName: rdoData.cliente,
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: data.template,
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated RDO de Montagem for OS ${rdoData.numeroOS} - ${rdoData.participantes.length} team members`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Error generating RDO report:', error);
      res.status(500).json({
        message: 'Erro ao gerar RDO de Montagem',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.get('/tecnico', authMiddleware, moduleMiddleware('tecnico'), (req, res) => {
  res.json({ message: 'Tecnico reports endpoint' });
});

router.get('/spda', authMiddleware, moduleMiddleware('spda'), (req, res) => {
  res.json({ message: 'SPDA reports endpoint' });
});

router.get('/rdo', authMiddleware, moduleMiddleware('rdo'), (req, res) => {
  res.json({ message: 'RDO reports endpoint' });
});

/**
 * POST /api/reports/gastos
 * Generate expense report (Relatório de Gastos / Prestação de Contas)
 * Uses REAL TEMPLATES (relatoriogastosnx.docx / relatoriogastossercamp.docx)
 * Requirements: 6.1, 6.2, 6.3
 */
router.post(
  '/gastos',
  authMiddleware,
  moduleMiddleware('gastos'),
  async (req: Request, res: Response) => {
    try {
      console.log('=== Gastos Report Request (TEMPLATE-BASED) ===');
      console.log('Body keys:', Object.keys(req.body));
      console.log('Template:', req.body.template);
      console.log('OS:', req.body.osNumber);
      console.log('Receipts count:', req.body.receipts?.length || 0);
      
      const data = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Import the gastos generator
      const { generateGastosReport } = await import('../services/gastos-generator.js');

      // Map frontend data to generator format
      const gastosData = {
        template: data.template === 'nx-energy' ? 'nx-energy' as const : 'sercamp' as const,
        osNumber: data.osNumber || '',
        clientName: data.clientName || '',
        userName: data.userName || '',
        prestacaoDate: data.prestacaoDate || new Date().toISOString(),
        receipts: (data.receipts || []).map((r: any, index: number) => {
          // Log receipt data size
          const hasImage = r.fileData && r.fileData.startsWith('data:image');
          const imageSize = hasImage ? r.fileData.length : 0;
          console.log(`Receipt ${index + 1}: ${r.description}, amount: ${r.amount}, hasImage: ${hasImage}, imageSize: ${imageSize}`);
          
          return {
            id: r.id || String(Math.random()),
            fileName: r.fileName || 'Comprovante',
            fileData: r.fileData || '',
            amount: r.amount || 0,
            description: r.description || '',
            category: r.category || 'Geral',
            uploadDate: r.uploadDate || new Date().toISOString()
          };
        }),
        totalAmount: data.totalAmount || 0,
        aprovacao: data.aprovacao as 'aprovado' | 'reprovado' | undefined,
        ressalvas: data.ressalvas || ''
      };

      console.log('=== Mapped Gastos Data ===');
      console.log('osNumber:', gastosData.osNumber);
      console.log('clientName:', gastosData.clientName);
      console.log('userName:', gastosData.userName);
      console.log('receipts:', gastosData.receipts.length);
      console.log('totalAmount:', gastosData.totalAmount);
      console.log('==========================');

      // Generate document using TEMPLATE-BASED generator
      const buffer = await generateGastosReport(gastosData);
      const fileName = `relatorio_gastos_${gastosData.osNumber}_${Date.now()}.docx`;

      console.log('✅ Gastos Report generated successfully!');
      console.log('Buffer size:', buffer.length);

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'gastos',
          osNumber: gastosData.osNumber,
          clientName: gastosData.clientName,
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: data.template,
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated Gastos report for OS ${gastosData.osNumber} - Total: R$ ${gastosData.totalAmount.toFixed(2)} (${gastosData.receipts.length} receipts)`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Error generating Gastos report:', error);
      res.status(500).json({
        message: 'Erro ao gerar Relatório de Gastos',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

router.get('/gastos', authMiddleware, moduleMiddleware('gastos'), (req, res) => {
  res.json({ message: 'Gastos reports endpoint' });
});


/**
 * POST /api/reports/tctp
 * Generate TC/TP (Transformador de Corrente / Transformador de Potencial) report
 * Uses REAL TEMPLATES (tc_tp_nx.docx / tc_tp_sercamp.docx) - PROFESSIONAL
 * Includes all test sections: Relação, Resistência Isolamento, Resistência Ôhmica, Polaridades
 */
router.post(
  '/tctp',
  authMiddleware,
  moduleMiddleware('tecnico'),
  async (req: Request, res: Response) => {
    try {
      console.log('=== TC/TP Report Request (TEMPLATE-BASED) ===');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      
      const data = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Import the TC/TP generator
      const { generateTCTPReport } = await import('../services/tctp-generator.js');

      // Map frontend data to generator format
      const tctpData = {
        tipo: data.tipo || null,
        cliente: data.clientName || '',
        data: data.reportDate || new Date().toISOString(),
        localEquipamento: data.location || '',
        elaboradoPor: data.responsible || '',
        fabricante: data.fabricante || '',
        tipo_equipamento: data.tipoEquipamento || '',
        numeroSerieR: data.numeroSerieR || '',
        numeroSerieS: data.numeroSerieS || '',
        numeroSerieT: data.numeroSerieT || '',
        relacao: data.relacao || '',
        anoFabricacao: data.anoFabricacao || '',
        tensaoNominal: data.tensaoNominal || '',
        potenciaNominal: data.potenciaNominal || '',
        fatorServico: data.fatorServico || '',
        classePrecisao1: data.classePrecisao1 || '',
        classePrecisao2: data.classePrecisao2 || '',
        classePrecisao3: data.classePrecisao3 || '',
        classePrecisao4: data.classePrecisao4 || '',
        classePrecisao5: data.classePrecisao5 || '',
        status: data.status || '',
        verif01: data.verif01 || 'I',
        verif02: data.verif02 || 'I',
        verif03: data.verif03 || 'I',
        verif04: data.verif04 || 'I',
        verif05: data.verif05 || 'I',
        verif06: data.verif06 || 'I',
        tensaoAplicadaEm: data.tensaoAplicadaEm || 'primario',
        enrolAplicado: data.enrolAplicado || [],
        tensaoAplicada: data.tensaoAplicada || [],
        enrolMedido: data.enrolMedido || [],
        tensaoMedidaR: data.tensaoMedidaR || [],
        tensaoMedidaS: data.tensaoMedidaS || [],
        tensaoMedidaT: data.tensaoMedidaT || [],
        instrumentoUtilizado: data.instrumentoUtilizado || '',
        ensaiosDurante: data.ensaiosDurante || '',
        temperaturaAmbiente: data.temperaturaAmbiente || '',
        umidadeRelativa: data.umidadeRelativa || '',
        enrolMedidoIsolamento: data.enrolMedidoIsolamento || [],
        conexoesIsolamento: data.conexoesIsolamento || [],
        tensaoAplicadaIsolamento: data.tensaoAplicadaIsolamento || [],
        resistIsoR: data.resistIsoR || [],
        resistIsoS: data.resistIsoS || [],
        resistIsoT: data.resistIsoT || [],
        enrolMedidoOhm: data.enrolMedidoOhm || [],
        resistOhmR: data.resistOhmR || '',
        resistOhmS: data.resistOhmS || '',
        resistOhmT: data.resistOhmT || '',
        resistOhmExtraR: data.resistOhmExtraR || [],
        resistOhmExtraS: data.resistOhmExtraS || [],
        resistOhmExtraT: data.resistOhmExtraT || [],
        enrolMedidoPol: data.enrolMedidoPol || [],
        polaridadeR: data.polaridadeR || [],
        polaridadeS: data.polaridadeS || [],
        polaridadeT: data.polaridadeT || [],
        observacoes: data.observations || data.observacoes || '',
        photos: data.photos || []
      };

      console.log('Mapped TC/TP Data:', JSON.stringify(tctpData, null, 2));

      // Generate document using TEMPLATE-BASED generator
      const template = data.template === 'nx_energy' ? 'nx' : 'sercamp';
      const buffer = await generateTCTPReport(tctpData, template);
      const fileName = `relatorio_tctp_${data.tipo || 'TC'}_${data.osNumber}_${Date.now()}.docx`;

      console.log('✅ TC/TP Report generated successfully!');
      console.log('Buffer size:', buffer.length);

      // Save report to database
      const report = await prisma.report.create({
        data: {
          type: 'tecnico',
          osNumber: data.osNumber,
          clientName: data.clientName,
          fileName: fileName,
          fileData: bufferToBase64(buffer),
          fileSize: buffer.length,
          template: data.template,
          generatedById: userId
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'generate',
          resourceType: 'report',
          resourceId: report.id,
          details: `Generated TC/TP report (${data.tipo || 'TC'}) for OS ${data.osNumber}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Send file as download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);

    } catch (error) {
      console.error('❌ Error generating TC/TP report:', error);
      res.status(500).json({
        message: 'Erro ao gerar relatório TC/TP',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * GET /api/reports/service-orders
 * Get service orders for the current user (for Finalizar OS functionality)
 * Returns active service orders that the user can finalize
 */
router.get(
  '/service-orders',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Get all active service orders
      const serviceOrders = await prisma.serviceOrder.findMany({
        where: {
          status: 'ativa'
        },
        include: {
          _count: {
            select: {
              reports: true
            }
          },
          reports: {
            select: {
              id: true,
              type: true,
              fileName: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(serviceOrders);
    } catch (error) {
      console.error('Error fetching service orders:', error);
      res.status(500).json({
        message: 'Erro ao buscar ordens de serviço',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/reports/service-orders/:osNumber/reports
 * Get all reports generated for a specific service order
 * Used to validate if required reports exist before finalizing
 */
router.get(
  '/service-orders/:osNumber/reports',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { osNumber } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Get all reports for this OS number
      const reports = await prisma.report.findMany({
        where: {
          osNumber: osNumber
        },
        select: {
          id: true,
          type: true,
          fileName: true,
          clientName: true,
          template: true,
          createdAt: true,
          generatedBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get the service order info
      const serviceOrder = await prisma.serviceOrder.findUnique({
        where: { osNumber }
      });

      res.json({
        osNumber,
        serviceOrder,
        reports,
        reportCount: reports.length,
        reportTypes: [...new Set(reports.map(r => r.type))]
      });
    } catch (error) {
      console.error('Error fetching reports for OS:', error);
      res.status(500).json({
        message: 'Erro ao buscar relatórios da OS',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/reports/finalizar-os
 * Finalize a service order
 * Requirements: 15.1, 15.2, 15.3
 * - Validates that required reports have been generated
 * - Updates the OS status to completed
 * - Makes all generated reports available for merging
 */
router.post(
  '/finalizar-os',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { osNumber } = req.body;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      if (!osNumber) {
        return res.status(400).json({ message: 'Número da OS é obrigatório' });
      }

      // Find the service order
      const serviceOrder = await prisma.serviceOrder.findUnique({
        where: { osNumber },
        include: {
          reports: {
            select: {
              id: true,
              type: true,
              fileName: true
            }
          }
        }
      });

      if (!serviceOrder) {
        return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
      }

      if (serviceOrder.status === 'concluida') {
        return res.status(400).json({ message: 'Esta OS já foi finalizada' });
      }

      if (serviceOrder.status === 'cancelada') {
        return res.status(400).json({ message: 'Esta OS foi cancelada e não pode ser finalizada' });
      }

      // Requirement 15.1: Validate that required reports have been generated
      // At minimum, we require at least one report to be generated
      const reports = await prisma.report.findMany({
        where: { osNumber }
      });

      if (reports.length === 0) {
        return res.status(400).json({ 
          message: 'Não é possível finalizar a OS sem relatórios gerados. Gere pelo menos um relatório antes de finalizar.',
          validation: {
            hasReports: false,
            reportCount: 0
          }
        });
      }

      // Requirement 15.2: Update the OS status to completed
      const updatedServiceOrder = await prisma.serviceOrder.update({
        where: { osNumber },
        data: {
          status: 'concluida'
        },
        include: {
          reports: {
            select: {
              id: true,
              type: true,
              fileName: true,
              createdAt: true
            }
          }
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'update',
          resourceType: 'service_order',
          resourceId: serviceOrder.id,
          details: `Finalized service order ${osNumber} with ${reports.length} reports`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      console.log('=== OS Finalizada ===');
      console.log('osNumber:', osNumber);
      console.log('reports count:', reports.length);
      console.log('report types:', [...new Set(reports.map(r => r.type))]);
      console.log('=====================');

      // Requirement 15.3: Reports are now available for merging (status = concluida)
      res.json({
        success: true,
        message: 'Ordem de serviço finalizada com sucesso',
        serviceOrder: updatedServiceOrder,
        reportCount: reports.length,
        reportTypes: [...new Set(reports.map(r => r.type))]
      });

    } catch (error) {
      console.error('Error finalizing OS:', error);
      res.status(500).json({
        message: 'Erro ao finalizar ordem de serviço',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/reports/pesquisa
 * Save customer satisfaction survey linked to a service order
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */
router.post(
  '/pesquisa',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = PesquisaSatisfacaoSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validationResult.error.errors
        });
      }

      const data = validationResult.data;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Try to find the service order by osNumber
      const serviceOrder = await prisma.serviceOrder.findUnique({
        where: { osNumber: data.osNumber }
      });

      // Create the satisfaction survey (Requirement 14.5)
      const pesquisa = await prisma.pesquisaSatisfacao.create({
        data: {
          osNumber: data.osNumber,
          razaoSocial: data.razaoSocial,
          responsavel: data.responsavel,
          telefone: data.telefone,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep,
          endereco: data.endereco,
          atendimento: data.atendimento,
          apresentacao: data.apresentacao,
          prazo: data.prazo,
          competencia: data.competencia,
          confiabilidade: data.confiabilidade,
          recomendaria: data.recomendaria,
          sugestoes: data.sugestoes || null,
          serviceOrderId: serviceOrder?.id || null
        }
      });

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log audit trail
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'create',
          resourceType: 'report',
          resourceId: pesquisa.id,
          details: `Created satisfaction survey for OS ${data.osNumber} - Recommendation: ${data.recomendaria ? 'Yes' : 'No'}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      console.log('=== Pesquisa de Satisfação Created ===');
      console.log('osNumber:', data.osNumber);
      console.log('razaoSocial:', data.razaoSocial);
      console.log('recomendaria:', data.recomendaria);
      console.log('serviceOrderId:', serviceOrder?.id || 'Not linked');
      console.log('======================================');

      res.status(201).json({
        id: pesquisa.id,
        message: 'Pesquisa de satisfação salva com sucesso'
      });

    } catch (error) {
      console.error('Error saving satisfaction survey:', error);
      res.status(500).json({
        message: 'Erro ao salvar pesquisa de satisfação',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * GET /api/reports
 * List all generated reports with optional filters
 * Requirements: 12.1, 12.2
 */
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { osNumber, type, clientName, search, startDate, endDate, limit, offset } = req.query;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      // Build where clause for filtering
      const where: Record<string, unknown> = {};

      if (osNumber && typeof osNumber === 'string') {
        where.osNumber = { contains: osNumber, mode: 'insensitive' };
      }

      if (type && typeof type === 'string') {
        where.type = type;
      }

      if (clientName && typeof clientName === 'string') {
        where.clientName = { contains: clientName, mode: 'insensitive' };
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { osNumber: { contains: search, mode: 'insensitive' } },
          { clientName: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (startDate && typeof startDate === 'string') {
        where.createdAt = { ...((where.createdAt as object) || {}), gte: new Date(startDate) };
      }

      if (endDate && typeof endDate === 'string') {
        where.createdAt = { ...((where.createdAt as object) || {}), lte: new Date(endDate) };
      }

      // Parse pagination params
      const take = limit && typeof limit === 'string' ? parseInt(limit, 10) : 50;
      const skip = offset && typeof offset === 'string' ? parseInt(offset, 10) : 0;

      // Get total count for pagination
      const total = await prisma.report.count({ where });

      // Get reports without fileData (to reduce payload size)
      const reports = await prisma.report.findMany({
        where,
        select: {
          id: true,
          type: true,
          osNumber: true,
          clientName: true,
          fileName: true,
          fileSize: true,
          template: true,
          createdAt: true,
          generatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      });

      res.json({
        reports,
        total,
        limit: take,
        offset: skip
      });
    } catch (error) {
      console.error('Error listing reports:', error);
      res.status(500).json({
        message: 'Erro ao listar relatórios',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * GET /api/reports/:id
 * Get a single report by ID (metadata only)
 * Requirements: 12.2
 */
router.get(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const report = await prisma.report.findUnique({
        where: { id },
        select: {
          id: true,
          type: true,
          osNumber: true,
          clientName: true,
          fileName: true,
          fileSize: true,
          template: true,
          createdAt: true,
          generatedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          serviceOrder: {
            select: {
              id: true,
              osNumber: true,
              clientName: true,
              status: true
            }
          }
        }
      });

      if (!report) {
        return res.status(404).json({ message: 'Relatório não encontrado' });
      }

      res.json(report);
    } catch (error) {
      console.error('Error getting report:', error);
      res.status(500).json({
        message: 'Erro ao buscar relatório',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * GET /api/reports/:id/download
 * Download a report file
 * Requirements: 12.2
 */
router.get(
  '/:id/download',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const report = await prisma.report.findUnique({
        where: { id }
      });

      if (!report) {
        return res.status(404).json({ message: 'Relatório não encontrado' });
      }

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log download action
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'download',
          resourceType: 'report',
          resourceId: report.id,
          details: `Downloaded report: ${report.fileName}`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(report.fileData, 'base64');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error downloading report:', error);
      res.status(500).json({
        message: 'Erro ao baixar relatório',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);


/**
 * DELETE /api/reports/:id
 * Delete a report
 * Requirements: 12.1
 */
router.delete(
  '/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }

      const report = await prisma.report.findUnique({
        where: { id }
      });

      if (!report) {
        return res.status(404).json({ message: 'Relatório não encontrado' });
      }

      // Get user name for audit log
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true }
      });

      // Log delete action
      await prisma.auditLog.create({
        data: {
          userId,
          userName: user?.name || 'Unknown',
          action: 'delete',
          resourceType: 'report',
          resourceId: report.id,
          details: `Deleted report: ${report.fileName} (OS: ${report.osNumber})`,
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });

      // Delete the report
      await prisma.report.delete({
        where: { id }
      });

      res.json({ success: true, message: 'Relatório excluído com sucesso' });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({
        message: 'Erro ao excluir relatório',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
