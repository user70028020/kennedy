# Implementation Plan: Sistema de Relatórios SERCAMP

## Overview

Implementação do sistema de relatórios técnicos SERCAMP usando SvelteKit + Express/Bun. O plano segue uma abordagem incremental, começando pela infraestrutura base e progredindo para funcionalidades específicas.

## Tasks

- [x] 1. Setup do projeto e infraestrutura base
  - [x] 1.1 Criar estrutura do projeto monorepo (frontend + backend)
    - Criar pasta `frontend/` com SvelteKit
    - Criar pasta `backend/` com Express + Bun
    - Configurar package.json raiz com workspaces
    - _Requirements: Setup inicial_

  - [x] 1.2 Configurar backend Express com Bun
    - Instalar dependências (express, cors, bcryptjs, jsonwebtoken, zod)
    - Criar estrutura de pastas (routes, services, middleware, types)
    - Configurar servidor básico com CORS
    - _Requirements: Infraestrutura_

  - [x] 1.3 Configurar banco de dados PostgreSQL com Prisma ORM
    - Instalar prisma e @prisma/client
    - Criar schema.prisma com models: User, ServiceOrder, Report, Template, AuditLog, PesquisaSatisfacao, Colaborador
    - Configurar conexão com PostgreSQL
    - Rodar migrations
    - _Requirements: 12.1, 12.3_

  - [x] 1.4 Configurar frontend SvelteKit com Tailwind
    - Criar projeto SvelteKit com Svelte 5
    - Instalar e configurar TailwindCSS 4
    - Configurar estrutura de rotas
    - _Requirements: Setup inicial_

- [-] 2. Sistema de autenticação
  - [x] 2.1 Implementar rotas de autenticação no backend
    - POST /api/auth/login (validar credenciais, gerar JWT)
    - GET /api/auth/me (retornar usuário autenticado)
    - Middleware de autenticação
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 2.2 Escrever property test para autenticação
    - **Property 1: Authentication Validity**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Implementar tela de login no frontend
    - Criar página /login com formulário
    - Integrar com API de autenticação
    - Armazenar token no localStorage
    - Redirecionar após login
    - _Requirements: 1.1, 1.2_

  - [x] 2.4 Implementar controle de acesso por módulos
    - Criar middleware de verificação de módulos
    - Implementar lógica de permissões por role
    - _Requirements: 1.3, 1.4, 16.2, 16.3_

  - [ ]* 2.5 Escrever property test para controle de acesso
    - **Property 2: Role-Based Module Access Control**
    - **Validates: Requirements 1.3, 1.4, 16.2, 16.3**

- [x] 3. Checkpoint - Autenticação funcional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Layout e navegação do frontend
  - [x] 4.1 Criar componentes de layout
    - Header com nome do usuário, botão Finalizar OS, ícones
    - TabNavigation com 5 abas para funcionário
    - Sidebar para admin
    - _Requirements: 1.3, 1.4_

  - [x] 4.2 Implementar store de autenticação
    - Criar store Svelte para estado do usuário
    - Implementar checkAuth, login, logout
    - Derivar isAdmin e permissions
    - _Requirements: 1.3, 1.4_

  - [x] 4.3 Configurar rotas protegidas
    - Layout principal com verificação de auth
    - Redirecionamento para login se não autenticado
    - Rotas /admin/* apenas para admins
    - _Requirements: 1.5, 16.2_

- [x] 5. Serviço de geração de DOCX
  - [x] 5.1 Implementar DocxGeneratorService
    - Instalar docxtemplater e pizzip
    - Criar função para carregar template
    - Criar função para substituir placeholders
    - Criar função para inserir imagens
    - Criar função para popular tabelas dinâmicas
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 5.2 Escrever property test para injeção de dados em templates
    - **Property 7: Template Data Injection**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4**

- [x] 6. Relatório Fotográfico
  - [x] 6.1 Criar componente PhotoCapture
    - Upload de fotos via input file
    - Captura via câmera (mobile)
    - Preview das fotos com nome editável
    - Remoção de fotos
    - _Requirements: 3.1, 3.3_

  - [x] 6.2 Implementar página de Relatório Fotográfico
    - Formulário com campos: Template, OS, Cliente, Local, Tipo Equipamento, Nº Série, Responsável, Data, Observações
    - Integração com PhotoCapture
    - Botão gerar relatório
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 6.3 Implementar rota POST /api/reports/fotografico
    - Validar dados de entrada
    - Gerar DOCX com fotos
    - Salvar relatório no banco
    - Retornar arquivo para download
    - _Requirements: 3.2, 12.1_

  - [ ]* 6.4 Escrever property test para inclusão de fotos
    - **Property 4: Photo Storage and Inclusion**
    - **Validates: Requirements 2.4, 3.1, 3.3, 4.1**

- [x] 7. Checkpoint - Relatório Fotográfico funcional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Relatório Técnico
  - [x] 8.1 Criar componente EquipmentSelector
    - Dropdown agrupado por categoria (Transformadores, Proteção e Controle, Sistemas Auxiliares, Outros)
    - Emitir evento de seleção
    - _Requirements: 2.1, 2.6_

  - [x] 8.2 Criar componente DynamicForm
    - Renderizar campos baseado no tipo de equipamento
    - Suportar tipos: text, number, date, select, checkbox, status-selector
    - Validação de campos obrigatórios
    - _Requirements: 2.1, 2.2_

  - [x] 8.3 Implementar página de Relatório Técnico
    - Buscar OS no sistema
    - Seleção de equipamento e template
    - Formulário dinâmico baseado no equipamento
    - Captura de fotos
    - Seleção de status (conforme/alerta/corretiva)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 8.4 Implementar rota POST /api/reports/tecnico
    - Carregar template correto baseado em equipamento + template
    - Injetar dados nos placeholders
    - Incluir fotos
    - Aplicar cor de status
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ]* 8.5 Escrever property test para geração de relatório
    - **Property 3: Report Generation Round-Trip**
    - **Validates: Requirements 2.3, 3.2, 4.2, 5.2, 6.2**

- [x] 9. Relatório SPDA
  - [x] 9.1 Implementar página de Relatório SPDA
    - Buscar OS ou preencher manualmente
    - Campos: Template, Classe SPDA, Cliente, Local, Métodos (checkboxes), Equipamento de Medição
    - Pontos de medição (número, valor, foto)
    - Área de desenho/croqui
    - Status (APROVADO/REPROVADO/PENDENTE)
    - Conclusão/Observações
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 9.2 Implementar rota POST /api/reports/spda
    - Gerar DOCX com pontos de medição
    - Incluir croqui se fornecido
    - _Requirements: 4.2_

- [x] 10. RDO de Montagem
  - [x] 10.1 Criar componente SignatureCapture
    - Canvas para captura de assinatura
    - Botões limpar e confirmar
    - Exportar como base64
    - _Requirements: 5.3_

  - [x] 10.2 Implementar página de RDO de Montagem
    - Informações gerais (Template, OS, Data, Projeto, Cliente, Local)
    - Descrição do serviço
    - Representantes com assinaturas
    - Equipe de trabalho (tabela dinâmica)
    - Resumo da jornada de trabalho (horários, horas extras)
    - Atividades realizadas
    - Fotos
    - Observações
    - Assinaturas finais
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.3 Implementar rota POST /api/reports/rdo
    - Gerar DOCX com todos os dados
    - Incluir assinaturas como imagens
    - _Requirements: 5.2_

- [x] 11. Relatório de Gastos
  - [x] 11.1 Implementar página de Relatório de Gastos
    - Lista de prestações de contas
    - Modal para nova prestação (OS, Cliente, Data, Usuário, Template)
    - Captura de comprovantes/notas fiscais
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 11.2 Implementar rota POST /api/reports/gastos
    - Calcular total dos comprovantes
    - Organizar por categoria
    - Gerar DOCX
    - _Requirements: 6.2, 6.3_

  - [ ]* 11.3 Escrever property test para cálculo de total
    - **Property 11: Expense Total Calculation**
    - **Validates: Requirements 6.2**

- [ ] 12. Checkpoint - Todos os relatórios funcionais
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Pesquisa de Satisfação
  - [x] 13.1 Implementar modal de Pesquisa de Satisfação
    - Dados do cliente (Razão Social, Responsável, Telefone, Cidade, UF, CEP, Endereço)
    - Avaliações 1-5 (Atendimento, Apresentação, Prazo, Competência, Confiabilidade)
    - Recomendaria? (SIM/NÃO)
    - Sugestões/Reclamações
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 13.2 Implementar rota POST /api/reports/pesquisa
    - Salvar pesquisa vinculada à OS
    - _Requirements: 14.5_

  - [ ]* 13.3 Escrever property test para persistência de pesquisa
    - **Property 12: Survey Data Persistence**
    - **Validates: Requirements 14.2, 14.3, 14.4, 14.5**

- [x] 14. Painel Admin - Gerenciamento de Usuários
  - [x] 14.1 Implementar página de Administrador do Sistema
    - Formulário criar usuário (Nome, Email, Senha, Função)
    - Checkboxes de módulos de acesso
    - Lista de usuários com editar/excluir
    - Botão limpar sistema (dados de teste)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 16.1_

  - [x] 14.2 Implementar rotas CRUD de usuários
    - GET /api/admin/users
    - POST /api/admin/users
    - PUT /api/admin/users/:id
    - DELETE /api/admin/users/:id
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 14.3 Escrever property test para desativação de usuário
    - **Property 9: User Deactivation Blocks Login**
    - **Validates: Requirements 8.3**

- [x] 15. Painel Admin - Banco de Dados Interno
  - [x] 15.1 Implementar aba Ordens de Serviço
    - Lista com busca e filtros (Status, Equipamento)
    - Modal criar/editar OS
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 15.2 Implementar rotas CRUD de OS
    - GET /api/admin/service-orders
    - POST /api/admin/service-orders
    - PUT /api/admin/service-orders/:id
    - DELETE /api/admin/service-orders/:id
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 15.3 Escrever property test para filtros de OS
    - **Property 10: Service Order Filtering**
    - **Validates: Requirements 7.4**

  - [x] 15.4 Implementar aba Colaboradores
    - Lista de colaboradores com estatísticas
    - CRUD de colaboradores
    - _Requirements: 8.4_

  - [x] 15.5 Implementar aba Templates
    - Lista de templates com upload
    - Suporte a templates de equipamento e mesclagem
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 16. Sistema de Mesclagem de Relatórios
  - [x] 16.1 Implementar aba Mesclar Relatórios
    - Seleção de template de mesclagem
    - Campos do cabeçalho (Data, Cliente, Título, Líder, Período, OS, etc.)
    - Lista de relatórios disponíveis com multi-select
    - Campos de localização e dados do cliente
    - Tabela de equipamentos utilizados
    - Tabela de itens inspecionados
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 16.2 Implementar rota POST /api/admin/merge
    - Carregar template de mesclagem
    - Injetar dados nos campos marcados
    - Concatenar relatórios selecionados
    - Adicionar relatório fotográfico no final
    - _Requirements: 10.3, 10.4, 10.5_

  - [ ]* 16.3 Escrever property test para estrutura do documento mesclado
    - **Property 8: Merge Document Structure**
    - **Validates: Requirements 10.4, 10.5**

- [ ] 17. Checkpoint - Admin funcional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Sistema de Auditoria
  - [x] 18.1 Implementar AuditLoggerService
    - Função para registrar ações
    - Capturar userId, action, resourceType, resourceId, details, IP, timestamp
    - _Requirements: 11.1, 11.3_

  - [x] 18.2 Integrar auditoria em todas as rotas
    - Adicionar middleware de auditoria
    - Logar todas as ações relevantes
    - _Requirements: 11.1_

  - [x] 18.3 Implementar aba Auditoria e Segurança
    - Lista de logs com filtros (data, usuário, ação)
    - Detalhes de cada log
    - _Requirements: 11.2_

  - [ ]* 18.4 Escrever property test para completude do audit log
    - **Property 5: Audit Logging Completeness**
    - **Validates: Requirements 7.2, 7.3, 11.1, 11.2, 11.3**

- [x] 19. Finalização de OS
  - [x] 19.1 Implementar funcionalidade Finalizar OS
    - Validar relatórios gerados
    - Atualizar status da OS
    - Disponibilizar para mesclagem
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 20. Persistência e recuperação de relatórios
  - [x] 20.1 Implementar aba Banco de Relatórios
    - Lista de relatórios gerados
    - Download de relatórios
    - _Requirements: 12.1, 12.2_

  - [ ]* 20.2 Escrever property test para persistência de relatórios
    - **Property 6: Report Persistence Round-Trip**
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [ ] 21. Checkpoint final - Sistema completo
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Polimento e ajustes finais
  - [x] 22.1 Implementar funcionalidades extras
    - Lixeira (soft delete)
    - Backups
    - _Requirements: Extras_

  - [x] 22.2 Revisar UI/UX
    - Tema escuro e claro (com switch) consistente
    - Responsividade
    - Feedback visual (loading, success, error)
    - GSAP para animacoes suaves (tais como abrir dropdowns, navegar pelas paginas, etc)
    - Skeleton loading nos botoes
    - Visual moderno 2025
    - Estilizar a barra de scrollar
    - _Requirements: UI/UX_

## Notes

- Tasks marcadas com `*` são opcionais (testes property-based)
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude
- Unit tests validam exemplos específicos e edge cases
