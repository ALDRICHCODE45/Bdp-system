-- CreateTable
CREATE TABLE "EgresoHistorial" (
    "id" TEXT NOT NULL,
    "egresoId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EgresoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EgresoHistorial_egresoId_idx" ON "EgresoHistorial"("egresoId");

-- CreateIndex
CREATE INDEX "EgresoHistorial_fechaCambio_idx" ON "EgresoHistorial"("fechaCambio");

-- AddForeignKey
ALTER TABLE "EgresoHistorial" ADD CONSTRAINT "EgresoHistorial_egresoId_fkey" FOREIGN KEY ("egresoId") REFERENCES "Egreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
