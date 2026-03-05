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
-- DropForeignKey
ALTER TABLE "public"."Factura" DROP CONSTRAINT "Factura_autorizadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Factura" DROP CONSTRAINT "Factura_clienteProveedorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Factura" DROP CONSTRAINT "Factura_creadoPorId_fkey";

-- DropIndex
DROP INDEX "public"."Factura_autorizadoPorId_idx";

-- DropIndex
DROP INDEX "public"."Factura_clienteProveedorId_idx";

-- DropIndex
DROP INDEX "public"."Factura_creadoPorId_idx";

-- DropIndex
DROP INDEX "public"."Factura_origenId_idx";

-- DropIndex
DROP INDEX "public"."Factura_tipoOrigen_idx";

-- AlterTable
ALTER TABLE "Factura" DROP COLUMN "autorizadoPorId",
DROP COLUMN "clienteProveedor",
DROP COLUMN "clienteProveedorId",
DROP COLUMN "creadoPorId",
DROP COLUMN "notas",
DROP COLUMN "origenId",
DROP COLUMN "tipoOrigen",
ADD COLUMN     "nombreReceptor" TEXT;

-- DropEnum
DROP TYPE "public"."FacturaTipoOrigen";
