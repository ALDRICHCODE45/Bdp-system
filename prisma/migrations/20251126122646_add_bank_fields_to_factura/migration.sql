/*
  Warnings:

  - Added the required column `banco` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clabe` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroCuenta` to the `Factura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Agregar columnas con valores por defecto temporales para registros existentes
ALTER TABLE "Factura" ADD COLUMN "banco" TEXT NOT NULL DEFAULT '',
ADD COLUMN "clabe" TEXT NOT NULL DEFAULT '',
ADD COLUMN "numeroCuenta" TEXT NOT NULL DEFAULT '';

-- Remover los valores por defecto
ALTER TABLE "Factura" ALTER COLUMN "banco" DROP DEFAULT,
ALTER COLUMN "clabe" DROP DEFAULT,
ALTER COLUMN "numeroCuenta" DROP DEFAULT;
