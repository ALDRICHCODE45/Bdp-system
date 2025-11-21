-- CreateTable
CREATE TABLE "FacturaHistorial" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacturaHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacturaHistorial_facturaId_idx" ON "FacturaHistorial"("facturaId");

-- CreateIndex
CREATE INDEX "FacturaHistorial_fechaCambio_idx" ON "FacturaHistorial"("fechaCambio");

-- AddForeignKey
ALTER TABLE "FacturaHistorial" ADD CONSTRAINT "FacturaHistorial_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
