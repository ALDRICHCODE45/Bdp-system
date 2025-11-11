/*
  Warnings:

  - You are about to drop the column `correspondencpia` on the `EntradasSalidas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EntradasSalidas" DROP COLUMN "correspondencpia",
ADD COLUMN     "correspondencia" TEXT;
