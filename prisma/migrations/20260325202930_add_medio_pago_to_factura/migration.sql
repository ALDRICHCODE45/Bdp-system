-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "medioPago" TEXT;

-- CreateIndex
CREATE INDEX "Factura_medioPago_idx" ON "Factura"("medioPago");
