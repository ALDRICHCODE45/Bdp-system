-- CreateEnum
CREATE TYPE "MovimientoTipo" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "MovimientoCategoria" AS ENUM ('FACTURACION', 'COMISIONES', 'DISPOSICION', 'BANCARIZACIONES', 'GASTO_OP', 'HONORARIOS', 'SERVICIOS', 'ARRENDAMIENTO');

-- CreateEnum
CREATE TYPE "MovimientoFormaPago" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'CHEQUE');

-- CreateEnum
CREATE TYPE "MovimientoCargoAbono" AS ENUM ('BDP', 'CALFC', 'GLOBAL', 'RJZ', 'APP');

-- CreateEnum
CREATE TYPE "MovimientoEstado" AS ENUM ('PAGADO', 'PENDIENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MovimientoFacturadoPor" AS ENUM ('BDP', 'CALFC', 'GLOBAL', 'RGZ', 'RJS', 'APP');

-- Data migration: convert any existing FileAttachment rows before enum swap
UPDATE "FileAttachment" SET "entityType" = 'FACTURA' WHERE "entityType" IN ('EGRESO', 'INGRESO');

-- AlterEnum (recreate pattern — safe because data was migrated above)
BEGIN;
CREATE TYPE "FileAttachmentEntityType_new" AS ENUM ('FACTURA', 'MOVIMIENTO', 'CLIENTE_PROVEEDOR');
ALTER TABLE "FileAttachment" ALTER COLUMN "entityType" TYPE "FileAttachmentEntityType_new" USING ("entityType"::text::"FileAttachmentEntityType_new");
ALTER TYPE "FileAttachmentEntityType" RENAME TO "FileAttachmentEntityType_old";
ALTER TYPE "FileAttachmentEntityType_new" RENAME TO "FileAttachmentEntityType";
DROP TYPE "public"."FileAttachmentEntityType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Egreso" DROP CONSTRAINT "Egreso_autorizadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Egreso" DROP CONSTRAINT "Egreso_clienteProyectoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Egreso" DROP CONSTRAINT "Egreso_ingresadoPor_fkey";

-- DropForeignKey
ALTER TABLE "public"."Egreso" DROP CONSTRAINT "Egreso_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Egreso" DROP CONSTRAINT "Egreso_solicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EgresoHistorial" DROP CONSTRAINT "EgresoHistorial_egresoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ingreso" DROP CONSTRAINT "Ingreso_autorizadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ingreso" DROP CONSTRAINT "Ingreso_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ingreso" DROP CONSTRAINT "Ingreso_ingresadoPor_fkey";

-- DropForeignKey
ALTER TABLE "public"."Ingreso" DROP CONSTRAINT "Ingreso_solicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IngresoHistorial" DROP CONSTRAINT "IngresoHistorial_ingresoId_fkey";

-- DropTable
DROP TABLE "public"."EgresoHistorial";

-- DropTable
DROP TABLE "public"."Egreso";

-- DropTable
DROP TABLE "public"."IngresoHistorial";

-- DropTable
DROP TABLE "public"."Ingreso";

-- DropEnum
DROP TYPE "public"."EgresoCargoAbono";

-- DropEnum
DROP TYPE "public"."EgresoCategoria";

-- DropEnum
DROP TYPE "public"."EgresoClasificacion";

-- DropEnum
DROP TYPE "public"."EgresoEstado";

-- DropEnum
DROP TYPE "public"."EgresoFacturadoPor";

-- DropEnum
DROP TYPE "public"."EgresoFormaPago";

-- DropEnum
DROP TYPE "public"."IngresoCargoAbono";

-- DropEnum
DROP TYPE "public"."IngresoEstado";

-- DropEnum
DROP TYPE "public"."IngresoFacturadoPor";

-- DropEnum
DROP TYPE "public"."IngresoFormaPago";

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "tipo" "MovimientoTipo" NOT NULL,
    "titular" TEXT NOT NULL,
    "estadoCuenta" TEXT NOT NULL,
    "fechaCorte" TIMESTAMP(3) NOT NULL,
    "fechaOperacion" TIMESTAMP(3) NOT NULL,
    "descripcionLiteral" TEXT NOT NULL,
    "monto" DECIMAL(15,2) NOT NULL,
    "dedupHash" TEXT NOT NULL,
    "concepto" TEXT,
    "descripcionAdministracion" TEXT,
    "categoria" "MovimientoCategoria",
    "formaPago" "MovimientoFormaPago",
    "cargoAbono" "MovimientoCargoAbono",
    "facturadoPor" "MovimientoFacturadoPor",
    "periodo" TEXT,
    "numeroFactura" TEXT,
    "folioFiscal" TEXT,
    "proveedor" TEXT,
    "proveedorId" TEXT,
    "cliente" TEXT,
    "clienteId" TEXT,
    "solicitanteId" TEXT,
    "autorizadorId" TEXT,
    "notas" TEXT,
    "facturaId" TEXT,
    "ingresadoPor" TEXT,
    "estado" "MovimientoEstado" NOT NULL DEFAULT 'PAGADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoHistorial" (
    "id" TEXT NOT NULL,
    "movimientoId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movimiento_dedupHash_key" ON "Movimiento"("dedupHash");

-- CreateIndex
CREATE INDEX "Movimiento_tipo_idx" ON "Movimiento"("tipo");

-- CreateIndex
CREATE INDEX "Movimiento_estado_idx" ON "Movimiento"("estado");

-- CreateIndex
CREATE INDEX "Movimiento_tipo_estado_idx" ON "Movimiento"("tipo", "estado");

-- CreateIndex
CREATE INDEX "Movimiento_titular_idx" ON "Movimiento"("titular");

-- CreateIndex
CREATE INDEX "Movimiento_fechaOperacion_idx" ON "Movimiento"("fechaOperacion");

-- CreateIndex
CREATE INDEX "Movimiento_fechaCorte_idx" ON "Movimiento"("fechaCorte");

-- CreateIndex
CREATE INDEX "Movimiento_proveedorId_idx" ON "Movimiento"("proveedorId");

-- CreateIndex
CREATE INDEX "Movimiento_clienteId_idx" ON "Movimiento"("clienteId");

-- CreateIndex
CREATE INDEX "Movimiento_solicitanteId_idx" ON "Movimiento"("solicitanteId");

-- CreateIndex
CREATE INDEX "Movimiento_autorizadorId_idx" ON "Movimiento"("autorizadorId");

-- CreateIndex
CREATE INDEX "Movimiento_ingresadoPor_idx" ON "Movimiento"("ingresadoPor");

-- CreateIndex
CREATE INDEX "Movimiento_createdAt_idx" ON "Movimiento"("createdAt");

-- CreateIndex
CREATE INDEX "Movimiento_tipo_createdAt_idx" ON "Movimiento"("tipo", "createdAt");

-- CreateIndex
CREATE INDEX "Movimiento_estado_createdAt_idx" ON "Movimiento"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "MovimientoHistorial_movimientoId_idx" ON "MovimientoHistorial"("movimientoId");

-- CreateIndex
CREATE INDEX "MovimientoHistorial_fechaCambio_idx" ON "MovimientoHistorial"("fechaCambio");

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "ClienteProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Socio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_autorizadorId_fkey" FOREIGN KEY ("autorizadorId") REFERENCES "Socio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_ingresadoPor_fkey" FOREIGN KEY ("ingresadoPor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoHistorial" ADD CONSTRAINT "MovimientoHistorial_movimientoId_fkey" FOREIGN KEY ("movimientoId") REFERENCES "Movimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove legacy permissions and role assignments
DELETE FROM "RolePermission" WHERE "permissionId" IN (
  SELECT "id" FROM "Permission" WHERE "name" LIKE 'egresos:%' OR "name" LIKE 'ingresos:%'
);
DELETE FROM "Permission" WHERE "name" LIKE 'egresos:%' OR "name" LIKE 'ingresos:%';
