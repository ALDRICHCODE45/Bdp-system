-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT,
    "nombreComercial" TEXT,
    "rfc" TEXT,
    "curp" TEXT,
    "direccionFiscal" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'México',
    "bancoPrincipal" TEXT,
    "nombreEnTarjetaPrincipal" TEXT,
    "numeroCuentaPrincipal" TEXT,
    "clabePrincipal" TEXT,
    "fechaExpiracionPrincipal" TIMESTAMP(3),
    "cvvPrincipal" INTEGER,
    "bancoSecundario" TEXT,
    "nombreEnTarjetaSecundario" TEXT,
    "numeroCuentaSecundario" TEXT,
    "clabeSecundaria" TEXT,
    "fechaExpiracionSecundaria" TIMESTAMP(3),
    "cvvSecundario" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_rfc_key" ON "Empresa"("rfc");

-- CreateIndex
CREATE INDEX "Empresa_rfc_idx" ON "Empresa"("rfc");
