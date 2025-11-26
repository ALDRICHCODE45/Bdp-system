-- AlterTable Egreso: Agregar campos nullable para solicitanteId y autorizadorId
ALTER TABLE "Egreso" ADD COLUMN "solicitanteId" TEXT;
ALTER TABLE "Egreso" ADD COLUMN "autorizadorId" TEXT;

-- AlterTable Ingreso: Agregar campos nullable para solicitanteId y autorizadorId
ALTER TABLE "Ingreso" ADD COLUMN "solicitanteId" TEXT;
ALTER TABLE "Ingreso" ADD COLUMN "autorizadorId" TEXT;

-- AlterTable Factura: Agregar campos nullable para creadoPorId y autorizadoPorId
ALTER TABLE "Factura" ADD COLUMN "creadoPorId" TEXT;
ALTER TABLE "Factura" ADD COLUMN "autorizadoPorId" TEXT;

-- CreateIndex
CREATE INDEX "Egreso_solicitanteId_idx" ON "Egreso"("solicitanteId");
CREATE INDEX "Egreso_autorizadorId_idx" ON "Egreso"("autorizadorId");
CREATE INDEX "Ingreso_solicitanteId_idx" ON "Ingreso"("solicitanteId");
CREATE INDEX "Ingreso_autorizadorId_idx" ON "Ingreso"("autorizadorId");
CREATE INDEX "Factura_creadoPorId_idx" ON "Factura"("creadoPorId");
CREATE INDEX "Factura_autorizadoPorId_idx" ON "Factura"("autorizadoPorId");

-- AddForeignKey
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Egreso" ADD CONSTRAINT "Egreso_autorizadorId_fkey" FOREIGN KEY ("autorizadorId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_autorizadorId_fkey" FOREIGN KEY ("autorizadorId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_autorizadoPorId_fkey" FOREIGN KEY ("autorizadoPorId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropColumn: Eliminar columnas antiguas
ALTER TABLE "Egreso" DROP COLUMN "solicitante";
ALTER TABLE "Egreso" DROP COLUMN "autorizador";
ALTER TABLE "Ingreso" DROP COLUMN "solicitante";
ALTER TABLE "Ingreso" DROP COLUMN "autorizador";
ALTER TABLE "Factura" DROP COLUMN "creadoPor";
ALTER TABLE "Factura" DROP COLUMN "autorizadoPor";

-- DropEnum: Eliminar enums no utilizados
DROP TYPE "EgresoSolicitanteAutorizador";
DROP TYPE "IngresoSolicitanteAutorizador";

