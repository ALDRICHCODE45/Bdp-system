-- CreateEnum
CREATE TYPE "AsuntoJuridicoEstado" AS ENUM ('ACTIVO', 'INACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "AutorizacionEstado" AS ENUM ('PENDIENTE', 'AUTORIZADA', 'RECHAZADA', 'UTILIZADA');

-- CreateTable
CREATE TABLE "ClienteJuridico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rfc" TEXT,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteJuridico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsuntoJuridico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "AsuntoJuridicoEstado" NOT NULL DEFAULT 'ACTIVO',
    "clienteJuridicoId" TEXT NOT NULL,
    "socioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsuntoJuridico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipoJuridico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipoJuridico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipoJuridicoUsuario" (
    "id" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipoJuridicoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroHora" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "equipoJuridicoId" TEXT NOT NULL,
    "clienteJuridicoId" TEXT NOT NULL,
    "asuntoJuridicoId" TEXT NOT NULL,
    "socioId" TEXT NOT NULL,
    "horas" DECIMAL(5,2) NOT NULL,
    "descripcion" TEXT,
    "ano" INTEGER NOT NULL,
    "semana" INTEGER NOT NULL,
    "editable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroHora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroHoraHistorial" (
    "id" TEXT NOT NULL,
    "registroHoraId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroHoraHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutorizacionEdicion" (
    "id" TEXT NOT NULL,
    "registroHoraId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "autorizadorId" TEXT,
    "justificacion" TEXT NOT NULL,
    "estado" "AutorizacionEstado" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutorizacionEdicion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClienteJuridico_activo_idx" ON "ClienteJuridico"("activo");

-- CreateIndex
CREATE INDEX "ClienteJuridico_nombre_idx" ON "ClienteJuridico"("nombre");

-- CreateIndex
CREATE INDEX "AsuntoJuridico_clienteJuridicoId_idx" ON "AsuntoJuridico"("clienteJuridicoId");

-- CreateIndex
CREATE INDEX "AsuntoJuridico_socioId_idx" ON "AsuntoJuridico"("socioId");

-- CreateIndex
CREATE INDEX "AsuntoJuridico_estado_idx" ON "AsuntoJuridico"("estado");

-- CreateIndex
CREATE INDEX "EquipoJuridico_activo_idx" ON "EquipoJuridico"("activo");

-- CreateIndex
CREATE INDEX "EquipoJuridico_nombre_idx" ON "EquipoJuridico"("nombre");

-- CreateIndex
CREATE INDEX "EquipoJuridicoUsuario_equipoId_idx" ON "EquipoJuridicoUsuario"("equipoId");

-- CreateIndex
CREATE INDEX "EquipoJuridicoUsuario_usuarioId_idx" ON "EquipoJuridicoUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipoJuridicoUsuario_equipoId_usuarioId_key" ON "EquipoJuridicoUsuario"("equipoId", "usuarioId");

-- CreateIndex
CREATE INDEX "RegistroHora_usuarioId_idx" ON "RegistroHora"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroHora_equipoJuridicoId_idx" ON "RegistroHora"("equipoJuridicoId");

-- CreateIndex
CREATE INDEX "RegistroHora_clienteJuridicoId_idx" ON "RegistroHora"("clienteJuridicoId");

-- CreateIndex
CREATE INDEX "RegistroHora_asuntoJuridicoId_idx" ON "RegistroHora"("asuntoJuridicoId");

-- CreateIndex
CREATE INDEX "RegistroHora_socioId_idx" ON "RegistroHora"("socioId");

-- CreateIndex
CREATE INDEX "RegistroHora_ano_semana_idx" ON "RegistroHora"("ano", "semana");

-- CreateIndex
CREATE INDEX "RegistroHora_usuarioId_ano_semana_idx" ON "RegistroHora"("usuarioId", "ano", "semana");

-- CreateIndex
CREATE INDEX "RegistroHora_createdAt_idx" ON "RegistroHora"("createdAt");

-- CreateIndex
CREATE INDEX "RegistroHoraHistorial_registroHoraId_idx" ON "RegistroHoraHistorial"("registroHoraId");

-- CreateIndex
CREATE INDEX "RegistroHoraHistorial_fechaCambio_idx" ON "RegistroHoraHistorial"("fechaCambio");

-- CreateIndex
CREATE INDEX "AutorizacionEdicion_registroHoraId_idx" ON "AutorizacionEdicion"("registroHoraId");

-- CreateIndex
CREATE INDEX "AutorizacionEdicion_solicitanteId_idx" ON "AutorizacionEdicion"("solicitanteId");

-- CreateIndex
CREATE INDEX "AutorizacionEdicion_estado_idx" ON "AutorizacionEdicion"("estado");

-- AddForeignKey
ALTER TABLE "AsuntoJuridico" ADD CONSTRAINT "AsuntoJuridico_clienteJuridicoId_fkey" FOREIGN KEY ("clienteJuridicoId") REFERENCES "ClienteJuridico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsuntoJuridico" ADD CONSTRAINT "AsuntoJuridico_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoJuridicoUsuario" ADD CONSTRAINT "EquipoJuridicoUsuario_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "EquipoJuridico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoJuridicoUsuario" ADD CONSTRAINT "EquipoJuridicoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHora" ADD CONSTRAINT "RegistroHora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHora" ADD CONSTRAINT "RegistroHora_equipoJuridicoId_fkey" FOREIGN KEY ("equipoJuridicoId") REFERENCES "EquipoJuridico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHora" ADD CONSTRAINT "RegistroHora_clienteJuridicoId_fkey" FOREIGN KEY ("clienteJuridicoId") REFERENCES "ClienteJuridico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHora" ADD CONSTRAINT "RegistroHora_asuntoJuridicoId_fkey" FOREIGN KEY ("asuntoJuridicoId") REFERENCES "AsuntoJuridico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHora" ADD CONSTRAINT "RegistroHora_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroHoraHistorial" ADD CONSTRAINT "RegistroHoraHistorial_registroHoraId_fkey" FOREIGN KEY ("registroHoraId") REFERENCES "RegistroHora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutorizacionEdicion" ADD CONSTRAINT "AutorizacionEdicion_registroHoraId_fkey" FOREIGN KEY ("registroHoraId") REFERENCES "RegistroHora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutorizacionEdicion" ADD CONSTRAINT "AutorizacionEdicion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutorizacionEdicion" ADD CONSTRAINT "AutorizacionEdicion_autorizadorId_fkey" FOREIGN KEY ("autorizadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
