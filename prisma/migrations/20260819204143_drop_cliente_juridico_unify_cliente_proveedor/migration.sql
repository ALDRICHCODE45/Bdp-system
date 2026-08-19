/*
  Warnings:

  - You are about to drop the column `clienteJuridicoId` on the `AsuntoJuridico` table. All the data in the column will be lost.
  - You are about to drop the column `clienteJuridicoId` on the `RegistroHora` table. All the data in the column will be lost.
  - You are about to drop the `ClienteJuridico` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clienteProveedorId` to the `AsuntoJuridico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteProveedorId` to the `RegistroHora` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."AsuntoJuridico" DROP CONSTRAINT "AsuntoJuridico_clienteJuridicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RegistroHora" DROP CONSTRAINT "RegistroHora_clienteJuridicoId_fkey";

-- DropIndex
DROP INDEX "public"."AsuntoJuridico_clienteJuridicoId_idx";

-- DropIndex
DROP INDEX "public"."RegistroHora_clienteJuridicoId_idx";

-- AlterTable
ALTER TABLE "AsuntoJuridico" DROP COLUMN "clienteJuridicoId",
ADD COLUMN     "clienteProveedorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RegistroHora" DROP COLUMN "clienteJuridicoId",
ADD COLUMN     "clienteProveedorId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."ClienteJuridico";

-- CreateIndex
CREATE INDEX "AsuntoJuridico_clienteProveedorId_idx" ON "AsuntoJuridico"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "RegistroHora_clienteProveedorId_idx" ON "RegistroHora"("clienteProveedorId");

-- AddForeignKey
ALTER TABLE "AsuntoJuridico" ADD CONSTRAINT "AsuntoJuridico_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHora" ADD CONSTRAINT "RegistroHora_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
