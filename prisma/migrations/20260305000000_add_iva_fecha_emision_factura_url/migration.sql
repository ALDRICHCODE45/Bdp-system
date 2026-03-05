-- Migration: Add iva, fechaEmision, facturaUrl fields + migrate enum to VIGENTE/CANCELADA
--
-- WHY this approach (text intermediary):
-- PostgreSQL does NOT allow using a newly added enum value in the SAME transaction
-- that added it (ALTER TYPE ADD VALUE commits separately). Prisma wraps migrations
-- in transactions, so the naive "ADD VALUE + UPDATE" pattern would fail.
-- Solution: temporarily cast the column to TEXT, migrate the data freely,
-- create a clean new enum, then cast back. This is the same technique Prisma
-- uses internally for enum value removals.

-- ── Step 1: Add new columns ──────────────────────────────────────────────────
ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "iva"          DECIMAL(15,2);
ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "fechaEmision" TIMESTAMP(3);
ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "facturaUrl"   TEXT;

-- ── Step 2: Convert status column to TEXT (detach from enum constraint) ──────
ALTER TABLE "Factura" ALTER COLUMN "status" TYPE TEXT;

-- ── Step 3: Migrate old status values → VIGENTE / CANCELADA ──────────────────
UPDATE "Factura"
SET "status" = 'VIGENTE'
WHERE "status" IN ('BORRADOR', 'ENVIADA', 'PAGADA');
-- CANCELADA rows stay as CANCELADA — no action needed

-- ── Step 4: Create the new clean enum ────────────────────────────────────────
CREATE TYPE "FacturaEstado_new" AS ENUM ('VIGENTE', 'CANCELADA');

-- ── Step 5: Cast the column back to the new enum ──────────────────────────────
ALTER TABLE "Factura"
  ALTER COLUMN "status" TYPE "FacturaEstado_new"
  USING ("status"::"FacturaEstado_new");

-- ── Step 6: Swap enum type names ─────────────────────────────────────────────
ALTER TYPE "FacturaEstado"     RENAME TO "FacturaEstado_old";
ALTER TYPE "FacturaEstado_new" RENAME TO "FacturaEstado";
DROP TYPE "FacturaEstado_old";

-- ── Step 7: Restore default value on the column ──────────────────────────────
ALTER TABLE "Factura"
  ALTER COLUMN "status" SET DEFAULT 'VIGENTE';

-- ── Step 8: Rebuild indexes ───────────────────────────────────────────────────
DROP INDEX IF EXISTS "Factura_status_idx";
DROP INDEX IF EXISTS "Factura_status_createdAt_idx";
CREATE INDEX "Factura_status_idx"          ON "Factura"("status");
CREATE INDEX "Factura_status_createdAt_idx" ON "Factura"("status", "createdAt");
