/*
  Warnings:

  - Added the optional nullable column `tarifaHora` (Decimal(15,2)) to `RegistroHora`.
  - Added the optional nullable column `importe` (Decimal(15,2)) to `RegistroHora`.
  - Added the optional nullable table `TarifaAbogadoAsunto` (per-(usuarioId, asuntoJuridicoId) hourly tariff).
  - Added the append-only table `TarifaAbogadoAsuntoHistorial` for tarifa changes audit.
  - Destructive ADD only — no prod data. Backfill of `importe` runs ONLY if RegistroHora rows exist.
*/

-- AlterTable
ALTER TABLE "RegistroHora" ADD COLUMN "tarifaHora" DECIMAL(15,2);
ALTER TABLE "RegistroHora" ADD COLUMN "importe"    DECIMAL(15,2);

-- CreateTable
CREATE TABLE "TarifaAbogadoAsunto" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "asuntoJuridicoId" TEXT NOT NULL,
    "tarifaHora" DECIMAL(15,2) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarifaAbogadoAsunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarifaAbogadoAsuntoHistorial" (
    "id" TEXT NOT NULL,
    "tarifaId" TEXT NOT NULL,
    "tarifaHoraAnterior" DECIMAL(15,2),
    "tarifaHoraNueva" DECIMAL(15,2) NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,

    CONSTRAINT "TarifaAbogadoAsuntoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TarifaAbogadoAsunto_usuarioId_asuntoJuridicoId_key" ON "TarifaAbogadoAsunto"("usuarioId", "asuntoJuridicoId");

-- CreateIndex
CREATE INDEX "TarifaAbogadoAsunto_usuarioId_idx"        ON "TarifaAbogadoAsunto"("usuarioId");
-- CreateIndex
CREATE INDEX "TarifaAbogadoAsunto_asuntoJuridicoId_idx" ON "TarifaAbogadoAsunto"("asuntoJuridicoId");
-- CreateIndex
CREATE INDEX "TarifaAbogadoAsunto_activa_idx"           ON "TarifaAbogadoAsunto"("activa");

-- CreateIndex
CREATE INDEX "TarifaAbogadoAsuntoHistorial_tarifaId_idx"  ON "TarifaAbogadoAsuntoHistorial"("tarifaId");
-- CreateIndex
CREATE INDEX "TarifaAbogadoAsuntoHistorial_changedAt_idx" ON "TarifaAbogadoAsuntoHistorial"("changedAt");

-- AddForeignKey
ALTER TABLE "TarifaAbogadoAsunto" ADD CONSTRAINT "TarifaAbogadoAsunto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TarifaAbogadoAsunto" ADD CONSTRAINT "TarifaAbogadoAsunto_asuntoJuridicoId_fkey" FOREIGN KEY ("asuntoJuridicoId") REFERENCES "AsuntoJuridico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TarifaAbogadoAsunto" ADD CONSTRAINT "TarifaAbogadoAsunto_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TarifaAbogadoAsunto" ADD CONSTRAINT "TarifaAbogadoAsunto_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarifaAbogadoAsuntoHistorial" ADD CONSTRAINT "TarifaAbogadoAsuntoHistorial_tarifaId_fkey" FOREIGN KEY ("tarifaId") REFERENCES "TarifaAbogadoAsunto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TarifaAbogadoAsuntoHistorial" ADD CONSTRAINT "TarifaAbogadoAsuntoHistorial_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill importe only if RegistroHora has rows.
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "RegistroHora") > 0 THEN
    UPDATE "RegistroHora"
       SET "importe" = ROUND(("horas" * "tarifaHora")::numeric, 2)
     WHERE "tarifaHora" IS NOT NULL;
  END IF;
END $$;
