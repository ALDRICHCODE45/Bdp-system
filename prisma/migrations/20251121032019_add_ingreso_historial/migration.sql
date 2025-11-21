-- CreateTable
CREATE TABLE "IngresoHistorial" (
    "id" TEXT NOT NULL,
    "ingresoId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngresoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IngresoHistorial_ingresoId_idx" ON "IngresoHistorial"("ingresoId");

-- CreateIndex
CREATE INDEX "IngresoHistorial_fechaCambio_idx" ON "IngresoHistorial"("fechaCambio");

-- AddForeignKey
ALTER TABLE "IngresoHistorial" ADD CONSTRAINT "IngresoHistorial_ingresoId_fkey" FOREIGN KEY ("ingresoId") REFERENCES "Ingreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
