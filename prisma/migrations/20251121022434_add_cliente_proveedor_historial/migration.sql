-- CreateTable
CREATE TABLE "ClienteProveedorHistorial" (
    "id" TEXT NOT NULL,
    "clienteProveedorId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteProveedorHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClienteProveedorHistorial_clienteProveedorId_idx" ON "ClienteProveedorHistorial"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "ClienteProveedorHistorial_fechaCambio_idx" ON "ClienteProveedorHistorial"("fechaCambio");

-- AddForeignKey
ALTER TABLE "ClienteProveedorHistorial" ADD CONSTRAINT "ClienteProveedorHistorial_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
