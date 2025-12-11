/*
  Warnings:

  - A unique constraint covering the columns `[correo]` on the table `Colaborador` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AsistenciaTipo" AS ENUM ('Entrada', 'Salida');

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL,
    "tipo" "AsistenciaTipo" NOT NULL,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_correo_key" ON "Colaborador"("correo");
