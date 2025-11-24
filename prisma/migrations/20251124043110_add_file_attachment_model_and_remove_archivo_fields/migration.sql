/*
  Warnings:

  - You are about to drop the column `archivoPdf` on the `Factura` table. All the data in the column will be lost.
  - You are about to drop the column `archivoXml` on the `Factura` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FileAttachmentEntityType" AS ENUM ('FACTURA', 'EGRESO', 'INGRESO', 'CLIENTE_PROVEEDOR');

-- AlterTable
ALTER TABLE "Factura" DROP COLUMN "archivoPdf",
DROP COLUMN "archivoXml";

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "entityType" "FileAttachmentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileAttachment_entityType_entityId_idx" ON "FileAttachment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "FileAttachment_entityId_idx" ON "FileAttachment"("entityId");
