-- CreateEnum
CREATE TYPE "FacturaTipoOrigen" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "FacturaEstado" AS ENUM ('BORRADOR', 'ENVIADA', 'PAGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "FacturaFormaPago" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'CHEQUE');

-- AlterTable
ALTER TABLE "Egreso" ADD COLUMN     "facturaId" TEXT;

-- AlterTable
ALTER TABLE "Ingreso" ADD COLUMN     "facturaId" TEXT;

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL,
    "tipoOrigen" "FacturaTipoOrigen" NOT NULL,
    "origenId" TEXT NOT NULL,
    "clienteProveedorId" TEXT NOT NULL,
    "clienteProveedor" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "periodo" TEXT NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "folioFiscal" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "FacturaEstado" NOT NULL DEFAULT 'BORRADOR',
    "formaPago" "FacturaFormaPago" NOT NULL,
    "rfcEmisor" TEXT NOT NULL,
    "rfcReceptor" TEXT NOT NULL,
    "direccionEmisor" TEXT NOT NULL,
    "direccionReceptor" TEXT NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPor" TEXT NOT NULL,
    "autorizadoPor" TEXT NOT NULL,
    "notas" TEXT,
    "archivoPdf" TEXT,
    "archivoXml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folioFiscal_key" ON "Factura"("folioFiscal");

-- CreateIndex
CREATE INDEX "Factura_tipoOrigen_idx" ON "Factura"("tipoOrigen");

-- CreateIndex
CREATE INDEX "Factura_origenId_idx" ON "Factura"("origenId");

-- CreateIndex
CREATE INDEX "Factura_estado_idx" ON "Factura"("estado");

-- CreateIndex
CREATE INDEX "Factura_clienteProveedorId_idx" ON "Factura"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "Factura_fechaEmision_idx" ON "Factura"("fechaEmision");

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
