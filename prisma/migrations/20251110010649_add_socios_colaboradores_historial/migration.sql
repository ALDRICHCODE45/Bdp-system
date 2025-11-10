-- CreateEnum
CREATE TYPE "ColaboradorEstado" AS ENUM ('CONTRATADO', 'DESPEDIDO');

-- CreateTable
CREATE TABLE "Socio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departamento" TEXT,
    "numeroEmpleados" INTEGER NOT NULL DEFAULT 0,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Socio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "puesto" TEXT NOT NULL,
    "status" "ColaboradorEstado" NOT NULL DEFAULT 'CONTRATADO',
    "imss" BOOLEAN NOT NULL DEFAULT true,
    "socioId" TEXT,
    "banco" TEXT NOT NULL,
    "clabe" TEXT NOT NULL,
    "sueldo" DECIMAL(15,3) NOT NULL,
    "activos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColaboradorHistorial" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColaboradorHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Socio_email_key" ON "Socio"("email");

-- CreateIndex
CREATE INDEX "Socio_email_idx" ON "Socio"("email");

-- CreateIndex
CREATE INDEX "Socio_activo_idx" ON "Socio"("activo");

-- CreateIndex
CREATE INDEX "Colaborador_socioId_idx" ON "Colaborador"("socioId");

-- CreateIndex
CREATE INDEX "Colaborador_status_idx" ON "Colaborador"("status");

-- CreateIndex
CREATE INDEX "ColaboradorHistorial_colaboradorId_idx" ON "ColaboradorHistorial"("colaboradorId");

-- CreateIndex
CREATE INDEX "ColaboradorHistorial_fechaCambio_idx" ON "ColaboradorHistorial"("fechaCambio");

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColaboradorHistorial" ADD CONSTRAINT "ColaboradorHistorial_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
