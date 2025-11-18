-- CreateEnum
CREATE TYPE "ClienteProveedorTipo" AS ENUM ('CLIENTE', 'PROVEEDOR');

-- CreateTable
CREATE TABLE "ClienteProveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "tipo" "ClienteProveedorTipo" NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "numeroCuenta" TEXT,
    "clabe" TEXT,
    "banco" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "socioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClienteProveedor_activo_idx" ON "ClienteProveedor"("activo");

-- CreateIndex
CREATE INDEX "ClienteProveedor_socioId_idx" ON "ClienteProveedor"("socioId");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteProveedor_rfc_tipo_key" ON "ClienteProveedor"("rfc", "tipo");

-- AddForeignKey
ALTER TABLE "ClienteProveedor" ADD CONSTRAINT "ClienteProveedor_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
