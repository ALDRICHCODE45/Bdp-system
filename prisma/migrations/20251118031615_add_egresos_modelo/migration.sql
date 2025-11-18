-- CreateEnum
CREATE TYPE "EgresoClasificacion" AS ENUM ('GASTO_OP', 'HONORARIOS', 'SERVICIOS', 'ARRENDAMIENTO', 'COMISIONES', 'DISPOSICION');

-- CreateEnum
CREATE TYPE "EgresoCategoria" AS ENUM ('FACTURACION', 'COMISIONES', 'DISPOSICION', 'BANCARIZACIONES');

-- CreateEnum
CREATE TYPE "EgresoSolicitanteAutorizador" AS ENUM ('RJS', 'RGZ', 'CALFC');

-- CreateEnum
CREATE TYPE "EgresoFormaPago" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'CHEQUE');

-- CreateEnum
CREATE TYPE "EgresoCargoAbono" AS ENUM ('BDP', 'CALFC', 'GLOBAL', 'RJZ', 'APP');

-- CreateEnum
CREATE TYPE "EgresoEstado" AS ENUM ('PAGADO', 'PENDIENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EgresoFacturadoPor" AS ENUM ('BDP', 'CALFC', 'GLOBAL', 'RGZ', 'RJS', 'APP');

-- CreateTable
CREATE TABLE "Egreso" (
    "id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "clasificacion" "EgresoClasificacion" NOT NULL,
    "categoria" "EgresoCategoria" NOT NULL,
    "proveedor" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "solicitante" "EgresoSolicitanteAutorizador" NOT NULL,
    "autorizador" "EgresoSolicitanteAutorizador" NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "folioFiscal" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "formaPago" "EgresoFormaPago" NOT NULL,
    "origen" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "clabe" TEXT NOT NULL,
    "cargoAbono" "EgresoCargoAbono" NOT NULL,
    "cantidad" DECIMAL(15,2) NOT NULL,
    "estado" "EgresoEstado" NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facturadoPor" "EgresoFacturadoPor" NOT NULL,
    "clienteProyecto" TEXT NOT NULL,
    "clienteProyectoId" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Egreso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Egreso_estado_idx" ON "Egreso"("estado");

-- CreateIndex
CREATE INDEX "Egreso_periodo_idx" ON "Egreso"("periodo");

-- CreateIndex
CREATE INDEX "Egreso_proveedorId_idx" ON "Egreso"("proveedorId");

-- CreateIndex
CREATE INDEX "Egreso_clienteProyectoId_idx" ON "Egreso"("clienteProyectoId");

-- CreateIndex
CREATE INDEX "Egreso_fechaPago_idx" ON "Egreso"("fechaPago");

-- CreateIndex
CREATE INDEX "Egreso_createdAt_idx" ON "Egreso"("createdAt");

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_clienteProyectoId_fkey" FOREIGN KEY ("clienteProyectoId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
