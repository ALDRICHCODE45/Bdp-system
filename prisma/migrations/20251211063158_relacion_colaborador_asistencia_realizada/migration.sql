/*
  Warnings:

  - Added the required column `correo` to the `Asistencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `Asistencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asistencia" ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Asistencia_correo_idx" ON "Asistencia"("correo");

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_correo_fkey" FOREIGN KEY ("correo") REFERENCES "Colaborador"("correo") ON DELETE CASCADE ON UPDATE CASCADE;
