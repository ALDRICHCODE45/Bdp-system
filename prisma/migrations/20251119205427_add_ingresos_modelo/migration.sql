-- CreateEnum
CREATE TYPE "IngresoFormaPago" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'CHEQUE');

-- CreateEnum
CREATE TYPE "IngresoEstado" AS ENUM ('PAGADO', 'PENDIENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "IngresoSolicitanteAutorizador" AS ENUM ('RJS', 'RGZ', 'CALFC');

-- CreateEnum
CREATE TYPE "IngresoCargoAbono" AS ENUM ('BDP', 'CALFC');

-- CreateEnum
CREATE TYPE "IngresoFacturadoPor" AS ENUM ('BDP', 'CALFC', 'GLOBAL', 'RGZ', 'RJS', 'APP');

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "solicitante" "IngresoSolicitanteAutorizador" NOT NULL,
    "autorizador" "IngresoSolicitanteAutorizador" NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "folioFiscal" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "formaPago" "IngresoFormaPago" NOT NULL,
    "origen" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "clabe" TEXT NOT NULL,
    "cargoAbono" "IngresoCargoAbono" NOT NULL,
    "cantidad" DECIMAL(15,2) NOT NULL,
    "estado" "IngresoEstado" NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facturadoPor" "IngresoFacturadoPor" NOT NULL,
    "clienteProyecto" TEXT NOT NULL,
    "fechaParticipacion" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingreso_folioFiscal_key" ON "Ingreso"("folioFiscal");

-- CreateIndex
CREATE INDEX "Ingreso_estado_idx" ON "Ingreso"("estado");

-- CreateIndex
CREATE INDEX "Ingreso_periodo_idx" ON "Ingreso"("periodo");

-- CreateIndex
CREATE INDEX "Ingreso_clienteId_idx" ON "Ingreso"("clienteId");

-- CreateIndex
CREATE INDEX "Ingreso_fechaPago_idx" ON "Ingreso"("fechaPago");

-- CreateIndex
CREATE INDEX "Ingreso_createdAt_idx" ON "Ingreso"("createdAt");

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
