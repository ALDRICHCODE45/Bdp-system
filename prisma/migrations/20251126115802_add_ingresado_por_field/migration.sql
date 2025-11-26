/*
  Warnings:

  - Made the column `clienteProyecto` on table `Egreso` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clienteProyectoId` on table `Egreso` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClienteProveedor" ADD COLUMN     "ingresadoPor" TEXT;

-- AlterTable
ALTER TABLE "Egreso" ADD COLUMN     "ingresadoPor" TEXT,
ALTER COLUMN "clienteProyecto" SET NOT NULL,
ALTER COLUMN "clienteProyectoId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "ingresadoPor" TEXT;

-- AlterTable
ALTER TABLE "Ingreso" ADD COLUMN     "ingresadoPor" TEXT;

-- CreateIndex
CREATE INDEX "ClienteProveedor_ingresadoPor_idx" ON "ClienteProveedor"("ingresadoPor");

-- CreateIndex
CREATE INDEX "Egreso_ingresadoPor_idx" ON "Egreso"("ingresadoPor");

-- CreateIndex
CREATE INDEX "Factura_ingresadoPor_idx" ON "Factura"("ingresadoPor");

-- CreateIndex
CREATE INDEX "Ingreso_ingresadoPor_idx" ON "Ingreso"("ingresadoPor");

-- AddForeignKey
ALTER TABLE "ClienteProveedor" ADD CONSTRAINT "ClienteProveedor_ingresadoPor_fkey" FOREIGN KEY ("ingresadoPor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_ingresadoPor_fkey" FOREIGN KEY ("ingresadoPor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_ingresadoPor_fkey" FOREIGN KEY ("ingresadoPor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_ingresadoPor_fkey" FOREIGN KEY ("ingresadoPor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
