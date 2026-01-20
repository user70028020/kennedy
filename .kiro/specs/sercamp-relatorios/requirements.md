# Requirements Document

## Introduction

Sistema de automação de relatórios técnicos para manutenção elétrica industrial da SERCAMP. O sistema permite que funcionários/operacionais gerem relatórios técnicos por tipo de equipamento usando templates (NX Energy ou SERCAMP), enquanto administradores gerenciam ordens de serviço, colaboradores, templates e realizam mesclagem de múltiplos relatórios em um único documento DOCX.

## Glossary

- **Sistema**: Aplicação web de relatórios técnicos SERCAMP
- **Admin**: Usuário com cargo administrativo com acesso total ao sistema
- **Funcionario**: Usuário com cargo operacional/funcionário com acesso limitado às telas de relatórios
- **Template**: Documento DOCX base usado para gerar relatórios (NX Energy ou SERCAMP)
- **Template_Mesclagem**: Documento DOCX especial com campos marcados para injeção de dados consolidados
- **Relatorio**: Documento gerado pelo sistema contendo dados técnicos de inspeção
- **OS**: Ordem de Serviço que agrupa informações do cliente, equipe e período
- **Mesclagem**: Processo de combinar múltiplos relatórios em um único documento DOCX
- **Equipamento**: Tipo de equipamento elétrico inspecionado (transformador, disjuntor, etc.)

## Requirements

### Requirement 1: Autenticação e Controle de Acesso

**User Story:** As a user, I want to authenticate and access features based on my role, so that I can use the appropriate system functionalities.

#### Acceptance Criteria

1. WHEN a user provides valid credentials, THE Sistema SHALL authenticate the user and create a session
2. WHEN a user provides invalid credentials, THE Sistema SHALL reject the login and display an error message
3. WHILE a user is authenticated as Admin, THE Sistema SHALL display the admin menu with all administrative features
4. WHILE a user is authenticated as Funcionario, THE Sistema SHALL display only the report generation features (Relatório Fotográfico, SPDA, RDO de Montagem, Relatório Técnico, Relatório de Gastos)
5. WHEN an unauthenticated user attempts to access protected routes, THE Sistema SHALL redirect to the login page

### Requirement 2: Geração de Relatório Técnico

**User Story:** As a Funcionario, I want to generate technical reports by equipment type using templates, so that I can document equipment inspections.

#### Acceptance Criteria

1. WHEN a Funcionario selects an equipment type, THE Sistema SHALL display the corresponding form fields for that equipment
2. WHEN a Funcionario selects a template (NX Energy or SERCAMP), THE Sistema SHALL use that template for document generation
3. WHEN a Funcionario fills all required fields and submits, THE Sistema SHALL generate a DOCX file with the data injected into the template
4. WHEN a Funcionario adds photos to the report, THE Sistema SHALL include them in the generated document with their names/descriptions
5. WHEN a Funcionario selects equipment status, THE Sistema SHALL apply the corresponding color indicator (green=conforme, yellow=alerta, red=corretiva)
6. THE Sistema SHALL support the following equipment types: Transformador, Transformador para Instrumentos, Disjuntor, Para-raios, Relé de Proteção, Chave Seccionadora, Chave Religadora, Painel Religador, Retificador de Bateria, Banco de Capacitores, Cabos

### Requirement 3: Geração de Relatório Fotográfico

**User Story:** As a Funcionario, I want to create photographic reports, so that I can document visual inspections with images and descriptions.

#### Acceptance Criteria

1. WHEN a Funcionario captures or uploads photos, THE Sistema SHALL store them with associated descriptions
2. WHEN a Funcionario submits the photographic report, THE Sistema SHALL generate a DOCX with all photos and descriptions organized
3. THE Sistema SHALL allow multiple photos per report with individual naming

### Requirement 4: Geração de Relatório SPDA

**User Story:** As a Funcionario, I want to create SPDA reports, so that I can document lightning protection system inspections.

#### Acceptance Criteria

1. WHEN a Funcionario adds measurement points, THE Sistema SHALL record the point number, value, and associated photo
2. WHEN a Funcionario completes the SPDA form, THE Sistema SHALL generate a DOCX with all measurement data
3. THE Sistema SHALL support status indicators (APROVADO, REPROVADO, PENDENTE)

### Requirement 5: Geração de RDO de Montagem

**User Story:** As a Funcionario, I want to create daily assembly reports (RDO), so that I can document daily work activities.

#### Acceptance Criteria

1. WHEN a Funcionario fills the RDO form, THE Sistema SHALL capture participants, work hours, activities, and signatures
2. WHEN a Funcionario submits the RDO, THE Sistema SHALL generate a DOCX with all daily work information
3. THE Sistema SHALL support digital signature capture for participants

### Requirement 6: Geração de Relatório de Gastos

**User Story:** As a Funcionario, I want to create expense reports, so that I can document project-related expenses with receipts.

#### Acceptance Criteria

1. WHEN a Funcionario uploads receipts, THE Sistema SHALL store them with amount, description, and category
2. WHEN a Funcionario submits the expense report, THE Sistema SHALL calculate total amount and generate a DOCX
3. THE Sistema SHALL organize receipts by category in the generated document

### Requirement 7: Gerenciamento de Ordens de Serviço (Admin)

**User Story:** As an Admin, I want to manage service orders, so that I can organize work assignments and track project information.

#### Acceptance Criteria

1. WHEN an Admin creates a new OS, THE Sistema SHALL store client name, team leader, team members, service type, execution dates, and period
2. WHEN an Admin updates an OS, THE Sistema SHALL persist the changes and maintain audit trail
3. WHEN an Admin deletes an OS, THE Sistema SHALL remove it from active list and log the action
4. THE Sistema SHALL display all OS with filtering and search capabilities

### Requirement 8: Gerenciamento de Colaboradores (Admin)

**User Story:** As an Admin, I want to manage employees, so that I can control system access and permissions.

#### Acceptance Criteria

1. WHEN an Admin creates a new user, THE Sistema SHALL store name, email, password hash, and role (Admin or Funcionario)
2. WHEN an Admin updates a user, THE Sistema SHALL persist changes to user data
3. WHEN an Admin deactivates a user, THE Sistema SHALL prevent that user from logging in
4. THE Sistema SHALL display all Funcionario users with their status

### Requirement 9: Gerenciamento de Templates (Admin)

**User Story:** As an Admin, I want to manage document templates, so that I can update or add new report formats.

#### Acceptance Criteria

1. WHEN an Admin uploads a new template, THE Sistema SHALL store the DOCX file with metadata (name, type, category)
2. WHEN an Admin updates a template, THE Sistema SHALL replace the existing file and increment version
3. WHEN an Admin removes a template, THE Sistema SHALL delete it from the system
4. THE Sistema SHALL support both equipment templates and merge templates

### Requirement 10: Mesclagem de Relatórios (Admin)

**User Story:** As an Admin, I want to merge multiple reports into a single document, so that I can create comprehensive project documentation.

#### Acceptance Criteria

1. WHEN an Admin accesses the merge feature, THE Sistema SHALL display all available generated reports
2. WHEN an Admin selects reports for merging, THE Sistema SHALL allow multiple selection
3. WHEN an Admin fills merge template fields, THE Sistema SHALL inject data into marked positions:
   - Page 1-2: Data, Cliente, Título do Serviço, Líder da Equipe, Logo do Cliente, Período, Número OS, Número de Páginas
   - Page 3: Localização, Dados do Cliente, Representante do Cliente, Acompanhantes
   - Page 4: Colaboradores, Datas (ida/volta/atividades), Equipamentos Utilizados com certificados
   - Page 8: Tabela de Itens Inspecionados (Equipamento, Fabricante, Local, Nº Série, Status)
4. WHEN an Admin confirms the merge, THE Sistema SHALL generate a single DOCX containing:
   - Merged template pages with injected data
   - Selected technical reports as additional pages
   - Photographic report as final pages
5. THE Sistema SHALL preserve formatting and structure from the original template

### Requirement 11: Auditoria e Segurança (Admin)

**User Story:** As an Admin, I want to view audit logs, so that I can track system usage and ensure security.

#### Acceptance Criteria

1. WHEN any user performs an action (create, view, download, delete), THE Sistema SHALL log the action with timestamp, user, and details
2. WHEN an Admin views audit logs, THE Sistema SHALL display all logged actions with filtering options
3. THE Sistema SHALL store IP address and session information for security tracking

### Requirement 12: Persistência de Relatórios

**User Story:** As a user, I want generated reports to be saved, so that they can be accessed later for merging or download.

#### Acceptance Criteria

1. WHEN a Funcionario generates a report, THE Sistema SHALL save it to the database with metadata (type, client, date, generator)
2. WHEN a user requests a saved report, THE Sistema SHALL retrieve and serve the DOCX file
3. THE Sistema SHALL store reports with unique identifiers for reference

### Requirement 13: Injeção de Dados em Templates DOCX

**User Story:** As a system, I want to inject data into DOCX templates, so that reports are generated with correct information.

#### Acceptance Criteria

1. WHEN the Sistema processes a template, THE Sistema SHALL identify marked fields (highlighted in yellow or using placeholders like {{CAMPO}})
2. WHEN the Sistema injects data, THE Sistema SHALL replace placeholders with actual values while preserving formatting
3. WHEN the Sistema processes images, THE Sistema SHALL embed them at designated positions in the document
4. THE Sistema SHALL handle tables by populating rows dynamically based on data arrays

### Requirement 14: Pesquisa de Satisfação do Cliente

**User Story:** As a Funcionario, I want to collect customer satisfaction feedback, so that SERCAMP can improve service quality.

#### Acceptance Criteria

1. WHEN a Funcionario initiates a satisfaction survey, THE Sistema SHALL display a form with client data fields (Razão Social, Responsável, Telefone, Cidade, UF, CEP, Endereço)
2. WHEN a client evaluates the service, THE Sistema SHALL capture ratings (1-5 scale) for: Atendimento, Apresentação, Prazo, Competência, Confiabilidade
3. WHEN a client answers the recommendation question, THE Sistema SHALL record whether they would recommend SERCAMP (SIM/NÃO)
4. WHEN a client provides feedback, THE Sistema SHALL store suggestions, complaints, or comments
5. WHEN the survey is submitted, THE Sistema SHALL save all responses linked to the service order

### Requirement 15: Finalização de Ordem de Serviço

**User Story:** As a Funcionario, I want to finalize a service order, so that I can complete the work cycle and trigger necessary actions.

#### Acceptance Criteria

1. WHEN a Funcionario clicks "Finalizar OS", THE Sistema SHALL validate that required reports have been generated
2. WHEN the OS is finalized, THE Sistema SHALL update the OS status to completed
3. WHEN the OS is finalized, THE Sistema SHALL make all generated reports available for merging in the admin panel

### Requirement 16: Controle de Módulos de Acesso por Usuário

**User Story:** As an Admin, I want to assign specific module access to each user, so that I can control what features each employee can use.

#### Acceptance Criteria

1. WHEN an Admin creates or edits a user, THE Sistema SHALL display checkboxes for each available module (Relatório Fotográfico, SPDA, RDO de Montagem, Relatório Técnico, Relatório de Gastos, Banco de Dados, Gerenciar Usuários)
2. WHEN a user logs in, THE Sistema SHALL only display tabs/features for modules they have access to
3. WHEN a user attempts to access a restricted module, THE Sistema SHALL deny access and display an appropriate message
