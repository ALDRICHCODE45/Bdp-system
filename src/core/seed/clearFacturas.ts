/**
 * Script de limpieza de facturas.
 * SOLO elimina registros de la tabla Factura y su historial.
 * No toca ningún otro módulo (RRHH, socios, colaboradores, etc.)
 *
 * Uso desarrollo:  bunx tsx src/core/seed/clearFacturas.ts
 * Uso producción:  DATABASE_URL="<url_produccion>" bunx tsx src/core/seed/clearFacturas.ts
 */

import prisma from "@/core/lib/prisma";

async function clearFacturas() {
  console.log("🗑  Iniciando limpieza de facturas...");
  console.log(`   Apuntando a: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? "desconocido"}`);
  console.log("");

  // 1. Eliminar historial primero (FK constraint)
  const historialDeleted = await prisma.facturaHistorial.deleteMany({});
  console.log(`   ✅ ${historialDeleted.count} registros de historial eliminados`);

  // 2. Eliminar facturas
  const facturasDeleted = await prisma.factura.deleteMany({});
  console.log(`   ✅ ${facturasDeleted.count} facturas eliminadas`);

  console.log("");
  console.log("🎉 Limpieza completada. Ningún otro módulo fue afectado.");
}

clearFacturas()
  .catch((e) => {
    console.error("❌ Error durante la limpieza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
