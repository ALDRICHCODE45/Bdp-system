/*
  Warnings:

  - You are about to drop the column `autorizadoPorId` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `clienteProveedor` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `clienteProveedorId` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `creadoPorId` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `origenId` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOrigen` on the `Factura` table. All the data in the column will be lost.

*/
-- DropForeignKey (idempotent: skip if constraint does not exist)
DO $$ BEGIN
  ALTER TABLE "Factura" DROP CONSTRAINT "Factura_autorizadoPorId_fkey";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Factura" DROP CONSTRAINT "Factura_clienteProveedorId_fkey";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Factura" DROP CONSTRAINT "Factura_creadoPorId_fkey";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- DropIndex (idempotent)
DROP INDEX IF EXISTS "public"."Factura_autorizadoPorId_idx";
DROP INDEX IF EXISTS "public"."Factura_clienteProveedorId_idx";
DROP INDEX IF EXISTS "public"."Factura_creadoPorId_idx";
DROP INDEX IF EXISTS "public"."Factura_origenId_idx";
DROP INDEX IF EXISTS "public"."Factura_tipoOrigen_idx";

-- AlterTable (drop columns only if they exist, add nombreReceptor)
DO $$ BEGIN
  ALTER TABLE "Factura" DROP COLUMN IF EXISTS "autorizadoPorId",
  DROP COLUMN IF EXISTS "clienteProveedor",
  DROP COLUMN IF EXISTS "clienteProveedorId",
  DROP COLUMN IF EXISTS "creadoPorId",
  DROP COLUMN IF EXISTS "notas",
  DROP COLUMN IF EXISTS "origenId",
  DROP COLUMN IF EXISTS "tipoOrigen";
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

ALTER TABLE "Factura" ADD COLUMN IF NOT EXISTS "nombreReceptor" TEXT;

-- DropEnum (idempotent)
DROP TYPE IF EXISTS "public"."FacturaTipoOrigen";
