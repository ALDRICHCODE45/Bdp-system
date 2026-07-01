-- CreateEnum
CREATE TYPE "ModalidadTrabajo" AS ENUM ('REMOTO', 'HIBRIDO', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('INDEFINIDO', 'TEMPORAL', 'POR_OBRA', 'PRACTICAS', 'HONORARIOS');

-- CreateEnum
CREATE TYPE "NivelSeniority" AS ENUM ('JUNIOR', 'SEMI_SENIOR', 'SENIOR', 'LEAD', 'GERENCIAL');

-- CreateEnum
CREATE TYPE "AusenciaTipo" AS ENUM ('VACACIONES', 'LICENCIA', 'INCAPACIDAD');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CONTRATO', 'INE', 'RFC', 'COMPROBANTE_DOMICILIO', 'OTRO');

-- AlterEnum
ALTER TYPE "ColaboradorEstado" ADD VALUE 'EN_LICENCIA';

-- AlterEnum
ALTER TYPE "FileAttachmentEntityType" ADD VALUE 'COLABORADOR';

-- AlterTable
ALTER TABLE "Colaborador" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "documentoIdentidad" TEXT,
ADD COLUMN     "emailPersonal" TEXT,
ADD COLUMN     "fechaSalida" TIMESTAMP(3),
ADD COLUMN     "horario" TEXT,
ADD COLUMN     "lugarTrabajo" TEXT,
ADD COLUMN     "modalidad" "ModalidadTrabajo",
ADD COLUMN     "nivel" "NivelSeniority",
ADD COLUMN     "nombrePreferido" TEXT,
ADD COLUMN     "tipoContrato" "TipoContrato";

-- AlterTable
ALTER TABLE "FileAttachment" ADD COLUMN     "category" "DocumentCategory",
ADD COLUMN     "expiryDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponsabilidadCargo" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponsabilidadCargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaboradorSalaryHistory" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "fechaEfectiva" TIMESTAMP(3) NOT NULL,
    "monto" DECIMAL(15,3) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColaboradorSalaryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaboradorPositionHistory" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "fechaEfectiva" TIMESTAMP(3) NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT,
    "nivel" "NivelSeniority",
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColaboradorPositionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationEntry" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbsenceRecord" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "tipo" "AusenciaTipo" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "motivo" TEXT,
    "registradoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbsenceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VacationBalance" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "diasDisponibles" INTEGER NOT NULL DEFAULT 0,
    "diasTomados" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VacationBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmergencyContact_colaboradorId_idx" ON "EmergencyContact"("colaboradorId");

-- CreateIndex
CREATE INDEX "ResponsabilidadCargo_colaboradorId_idx" ON "ResponsabilidadCargo"("colaboradorId");

-- CreateIndex
CREATE INDEX "ColaboradorSalaryHistory_colaboradorId_idx" ON "ColaboradorSalaryHistory"("colaboradorId");

-- CreateIndex
CREATE INDEX "ColaboradorSalaryHistory_colaboradorId_fechaEfectiva_idx" ON "ColaboradorSalaryHistory"("colaboradorId", "fechaEfectiva");

-- CreateIndex
CREATE INDEX "ColaboradorPositionHistory_colaboradorId_idx" ON "ColaboradorPositionHistory"("colaboradorId");

-- CreateIndex
CREATE INDEX "ColaboradorPositionHistory_colaboradorId_fechaEfectiva_idx" ON "ColaboradorPositionHistory"("colaboradorId", "fechaEfectiva");

-- CreateIndex
CREATE INDEX "EducationEntry_colaboradorId_idx" ON "EducationEntry"("colaboradorId");

-- CreateIndex
CREATE INDEX "AbsenceRecord_colaboradorId_idx" ON "AbsenceRecord"("colaboradorId");

-- CreateIndex
CREATE INDEX "AbsenceRecord_colaboradorId_tipo_idx" ON "AbsenceRecord"("colaboradorId", "tipo");

-- CreateIndex
CREATE INDEX "AbsenceRecord_fechaInicio_idx" ON "AbsenceRecord"("fechaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "VacationBalance_colaboradorId_key" ON "VacationBalance"("colaboradorId");

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponsabilidadCargo" ADD CONSTRAINT "ResponsabilidadCargo_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorSalaryHistory" ADD CONSTRAINT "ColaboradorSalaryHistory_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorPositionHistory" ADD CONSTRAINT "ColaboradorPositionHistory_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationEntry" ADD CONSTRAINT "EducationEntry_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbsenceRecord" ADD CONSTRAINT "AbsenceRecord_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacationBalance" ADD CONSTRAINT "VacationBalance_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
