-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'funcionario');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ativo', 'inativo');

-- CreateEnum
CREATE TYPE "ServiceOrderStatus" AS ENUM ('ativa', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('nx_energy', 'sercamp', 'merge');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('fotografico', 'spda', 'rdo', 'tecnico', 'gastos', 'mesclado');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('equipment', 'merge');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'download', 'generate');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('user', 'report', 'template', 'service_order', 'merge');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('conforme', 'corretiva', 'alerta');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'funcionario',
    "modules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "UserStatus" NOT NULL DEFAULT 'ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_orders" (
    "id" TEXT NOT NULL,
    "osNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientLogo" TEXT,
    "teamLeader" TEXT NOT NULL,
    "teamMembers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipmentType" TEXT NOT NULL,
    "selectedTemplate" "TemplateType" NOT NULL DEFAULT 'nx_energy',
    "serviceType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "ServiceOrderStatus" NOT NULL DEFAULT 'ativa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "osNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileData" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "template" "TemplateType" NOT NULL DEFAULT 'nx_energy',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "generatedById" TEXT NOT NULL,
    "serviceOrderId" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TemplateCategory" NOT NULL,
    "category" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileData" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "resourceId" TEXT,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisas_satisfacao" (
    "id" TEXT NOT NULL,
    "osNumber" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "atendimento" SMALLINT NOT NULL,
    "apresentacao" SMALLINT NOT NULL,
    "prazo" SMALLINT NOT NULL,
    "competencia" SMALLINT NOT NULL,
    "confiabilidade" SMALLINT NOT NULL,
    "recomendaria" BOOLEAN NOT NULL,
    "sugestoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceOrderId" TEXT,

    CONSTRAINT "pesquisas_satisfacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "osCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileData" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "service_orders_osNumber_key" ON "service_orders"("osNumber");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_documento_key" ON "colaboradores"("documento");

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "service_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisas_satisfacao" ADD CONSTRAINT "pesquisas_satisfacao_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "service_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
