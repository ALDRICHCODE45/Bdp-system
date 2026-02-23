-- Migration: Migrate Factura model to CFDI standard fields
-- This migration preserves existing data by mapping old columns to new ones

-- Step 1: Add new columns with defaults/nulls
ALTER TABLE "Factura" ADD COLUMN "serie" TEXT;
ALTER TABLE "Factura" ADD COLUMN "folio" TEXT;
ALTER TABLE "Factura" ADD COLUMN "subtotal" DECIMAL(15,2);
ALTER TABLE "Factura" ADD COLUMN "totalImpuestosTransladados" DECIMAL(15,2);
ALTER TABLE "Factura" ADD COLUMN "totalImpuestosRetenidos" DECIMAL(15,2);
ALTER TABLE "Factura" ADD COLUMN "total" DECIMAL(15,2);
ALTER TABLE "Factura" ADD COLUMN "uuid" TEXT;
ALTER TABLE "Factura" ADD COLUMN "metodoPago" TEXT;
ALTER TABLE "Factura" ADD COLUMN "moneda" TEXT NOT NULL DEFAULT 'MXN';
ALTER TABLE "Factura" ADD COLUMN "usoCfdi" TEXT;
ALTER TABLE "Factura" ADD COLUMN "status" "FacturaEstado" NOT NULL DEFAULT 'BORRADOR';
ALTER TABLE "Factura" ADD COLUMN "nombreEmisor" TEXT;
ALTER TABLE "Factura" ADD COLUMN "statusPago" TEXT;

-- Step 2: Migrate data from old columns to new columns
UPDATE "Factura" SET
  "uuid" = "folioFiscal",
  "subtotal" = "monto",
  "total" = "monto",
  "status" = "estado",
  "metodoPago" = "formaPago"::TEXT;

-- Step 3: Make required columns NOT NULL now that data exists
ALTER TABLE "Factura" ALTER COLUMN "subtotal" SET NOT NULL;
ALTER TABLE "Factura" ALTER COLUMN "total" SET NOT NULL;
ALTER TABLE "Factura" ALTER COLUMN "uuid" SET NOT NULL;

-- Step 4: Drop old columns
ALTER TABLE "Factura" DROP COLUMN "monto";
ALTER TABLE "Factura" DROP COLUMN "periodo";
ALTER TABLE "Factura" DROP COLUMN "numeroFactura";
ALTER TABLE "Factura" DROP COLUMN "folioFiscal";
ALTER TABLE "Factura" DROP COLUMN "fechaEmision";
ALTER TABLE "Factura" DROP COLUMN "fechaVencimiento";
ALTER TABLE "Factura" DROP COLUMN "estado";
ALTER TABLE "Factura" DROP COLUMN "formaPago";
ALTER TABLE "Factura" DROP COLUMN "direccionEmisor";
ALTER TABLE "Factura" DROP COLUMN "direccionReceptor";
ALTER TABLE "Factura" DROP COLUMN "numeroCuenta";
ALTER TABLE "Factura" DROP COLUMN "clabe";
ALTER TABLE "Factura" DROP COLUMN "banco";
ALTER TABLE "Factura" DROP COLUMN "fechaRegistro";

-- Step 5: Add unique constraint on uuid
CREATE UNIQUE INDEX "Factura_uuid_key" ON "Factura"("uuid");

-- Step 6: Drop old indexes that reference removed columns
DROP INDEX IF EXISTS "Factura_estado_idx";
DROP INDEX IF EXISTS "Factura_fechaEmision_idx";
DROP INDEX IF EXISTS "Factura_estado_createdAt_idx";
DROP INDEX IF EXISTS "Factura_periodo_fechaEmision_idx";

-- Step 7: Create new indexes
CREATE INDEX "Factura_status_idx" ON "Factura"("status");
CREATE INDEX "Factura_status_createdAt_idx" ON "Factura"("status", "createdAt");
CREATE INDEX "Factura_moneda_idx" ON "Factura"("moneda");
CREATE INDEX "Factura_rfcEmisor_idx" ON "Factura"("rfcEmisor");
CREATE INDEX "Factura_rfcReceptor_idx" ON "Factura"("rfcReceptor");

-- Step 8: Drop the unused enum
DROP TYPE IF EXISTS "FacturaFormaPago";
