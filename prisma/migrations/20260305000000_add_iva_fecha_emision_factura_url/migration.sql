-- Migration: Add iva, fechaEmision, facturaUrl fields to Factura
-- Also updates FacturaEstado enum from BORRADOR/ENVIADA/PAGADA/CANCELADA to VIGENTE/CANCELADA

-- Step 1: Add new columns (nullable first, then we'll handle the enum separately)
ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "iva" DECIMAL(15,2);
ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "fechaEmision" TIMESTAMP(3);
ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "facturaUrl" TEXT;

-- Step 2: Add new enum value VIGENTE (PostgreSQL requires adding values before using them)
ALTER TYPE "FacturaEstado" ADD VALUE IF NOT EXISTS 'VIGENTE';

-- Step 3: Migrate existing statuses to new values
-- BORRADOR → VIGENTE, ENVIADA → VIGENTE, PAGADA → VIGENTE, CANCELADA stays CANCELADA
UPDATE "Factura" SET "status" = 'VIGENTE' WHERE "status" IN ('BORRADOR', 'ENVIADA', 'PAGADA');

-- Step 4: Drop old indexes that use status (if any reference old values)
DROP INDEX IF EXISTS "Factura_status_idx";
DROP INDEX IF EXISTS "Factura_status_createdAt_idx";

-- Step 5: Recreate indexes
CREATE INDEX "Factura_status_idx" ON "Factura"("status");
CREATE INDEX "Factura_status_createdAt_idx" ON "Factura"("status", "createdAt");

-- Note: We cannot DROP enum values in PostgreSQL without recreating the type.
-- The old values (BORRADOR, ENVIADA, PAGADA) will remain in the enum definition
-- but will no longer be used by the application. This is safe.
