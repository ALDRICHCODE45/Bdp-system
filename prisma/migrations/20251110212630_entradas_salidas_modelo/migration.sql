-- CreateTable
CREATE TABLE "EntradasSalidas" (
    "id" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "telefono" TEXT,
    "correspondencpia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora_entrada" TIMESTAMP(3) NOT NULL,
    "hora_salida" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntradasSalidas_pkey" PRIMARY KEY ("id")
);
