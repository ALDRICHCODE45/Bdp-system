/**
 * Seed de 1000 facturas con datos variados para probar:
 *  - Todos los filtros rápidos (método pago, moneda, status pago)
 *  - Todos los filtros avanzados (UUID, uso CFDI, RFC/nombres, rangos de monto, fechas, auditoría)
 *  - Paginación (1000 registros)
 *  - Ordenamiento por todos los campos
 */

import prisma from "@/core/lib/prisma";
import { FacturaEstado } from "@prisma/client";
import { randomUUID } from "crypto";

// ── Pools de datos ─────────────────────────────────────────────────────────────

const conceptos = [
  "Honorarios profesionales por asesoría legal",
  "Consultoría en transformación digital",
  "Servicios de contabilidad y auditoría",
  "Arrendamiento de oficinas corporativas",
  "Servicios de limpieza y mantenimiento",
  "Mantenimiento preventivo de equipos",
  "Licencia anual de software ERP",
  "Servicio de hosting y cloud computing",
  "Diseño gráfico y branding corporativo",
  "Capacitación de personal en liderazgo",
  "Auditoría financiera externa",
  "Servicio de nómina y RRHH",
  "Transporte y logística de mercancía",
  "Materiales de construcción civil",
  "Equipo de cómputo y periféricos",
  "Papelería y suministros de oficina",
  "Servicios legales y notariales",
  "Publicidad digital y marketing",
  "Seguro empresarial multirriesgo",
  "Renta de maquinaria pesada",
  "Desarrollo de software a la medida",
  "Consultoría en procesos ISO 9001",
  "Servicios de seguridad privada",
  "Comisión por intermediación comercial",
  "Instalación de red eléctrica",
  "Análisis de laboratorio clínico",
  "Representación en juicio laboral",
  "Gestión de trámites fiscales SAT",
  "Servicio de mensajería y paquetería",
  "Reparación de maquinaria industrial",
];

const emisores = [
  { nombre: "BDP Constructora SA de CV",        rfc: "BDP200101ABC" },
  { nombre: "BDP Inmobiliaria SA de CV",         rfc: "BDP200201DEF" },
  { nombre: "Grupo BDP SA de CV",                rfc: "GBD180515GH1" },
  { nombre: "BDP Servicios Integrales SA de CV", rfc: "BSI190301JK2" },
  { nombre: "BDP Proyectos SA de CV",            rfc: "BPR210601LM3" },
  { nombre: "BDP Litigio y Consultoría SC",      rfc: "BLC170901MN4" },
  { nombre: "BDP Tecnología SA de CV",           rfc: "BTE220115OP5" },
  { nombre: "BDP Capital SA de CV",              rfc: "BCA230301QR6" },
];

const receptores = [
  { nombre: "Cementos del Norte SA de CV",          rfc: "CNO850101AB1" },
  { nombre: "Distribuidora López y Asociados",       rfc: "DLA920515CD2" },
  { nombre: "Ferreterías Martínez SA",               rfc: "FMA001201EF3" },
  { nombre: "Constructora Hernández e Hijos",        rfc: "CHH880720GH4" },
  { nombre: "Inmobiliaria del Pacífico SA de CV",    rfc: "IPA950301IJ5" },
  { nombre: "Servicios Industriales Rojas",          rfc: "SIR070815KL6" },
  { nombre: "Grupo Financiero Morales",              rfc: "GFM100401MN7" },
  { nombre: "Transportes Guzmán SA de CV",           rfc: "TGU120601OP8" },
  { nombre: "Alimentos del Bajío SA",                rfc: "ABA880915QR9" },
  { nombre: "Tecnología Avanzada MX SA de CV",       rfc: "TAM150201ST0" },
  { nombre: "Farmacia Santa Cruz SA",                rfc: "FSC970401UV1" },
  { nombre: "Mueblería San José SA de CV",           rfc: "MSJ060715WX2" },
  { nombre: "Textiles del Centro SA",                rfc: "TDC110301YZ3" },
  { nombre: "Laboratorios Bioquímica SA de CV",      rfc: "LBI040201AB4" },
  { nombre: "Papelera Nacional SA",                  rfc: "PNA990601CD5" },
  { nombre: "Refaccionaria El Águila",               rfc: "REA130815EF6" },
  { nombre: "Hotel Plaza Central SA de CV",          rfc: "HPC080401GH7" },
  { nombre: "Impresora del Golfo SA",                rfc: "IDG160601IJ8" },
  { nombre: "Gasolinera Los Pinos SA de CV",         rfc: "GLP020301KL9" },
  { nombre: "Juan Carlos Ramírez Torres",            rfc: "RATJ850612MN0" },
  { nombre: "María Elena Sánchez Díaz",              rfc: "SADM900315OP1" },
  { nombre: "Roberto Alejandro Flores Vega",         rfc: "FOVR780820QR2" },
  { nombre: "Andrea Guadalupe Ortiz Luna",           rfc: "OILA880105ST3" },
  { nombre: "Luis Fernando Castillo Reyes",          rfc: "CARL920710UV4" },
  { nombre: "Patricia Mendoza García",               rfc: "MEGP870425WX5" },
  { nombre: "Consultoría Estratégica MX",            rfc: "CEM140601YZ6" },
  { nombre: "Despacho Jurídico Ríos y Asociados",   rfc: "DJR170301AB7" },
  { nombre: "Clínica Dental Sonrisa SA",             rfc: "CDS050815CD8" },
  { nombre: "Escuela Particular Futuro AC",          rfc: "EPF100101EF9" },
  { nombre: "Arquitectura Moderna SA de CV",         rfc: "AMO190515GH0" },
];

// Todos los 23 usos CFDI más null
const usosCfdi = [
  "G01", "G02", "G03",
  "I01", "I02", "I03", "I04", "I05", "I06", "I07", "I08",
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10",
  "CP01", "S01",
  null,
];

const metodoPagos = ["CHEQUE", "TRANSFERENCIA", "EFECTIVO", "PUE", "PPD", null];
const monedas    = ["MXN", "USD", "EUR"];
const series     = ["A", "B", "C", "D", null, null, null]; // null más frecuente
const statusPagos = ["Pagado", "Pendiente de pago", null];

// ── Helpers ────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Selección ponderada. items y weights deben tener la misma longitud. */
function weighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Fecha aleatoria en los últimos `daysBack` días. */
function randomDate(daysBack: number): Date {
  const now  = new Date();
  const past = new Date(now.getTime() - daysBack * 86_400_000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

/** Número decimal aleatorio redondeado a 2 decimales. */
function dec(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

/** Número entero aleatorio [min, max]. */
function int(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// ── Función principal ──────────────────────────────────────────────────────────

async function seedFacturas() {
  console.log("📄 Iniciando seed de 1000 facturas...");

  // Obtener el primer usuario admin para asignar ingresadoPor
  const adminUser = await prisma.user.findFirst({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  const userId = adminUser?.id ?? null;
  console.log(`   👤 ingresadoPor: ${adminUser?.name ?? "ninguno (null)"}`);

  // Limpiar facturas existentes para evitar duplicados en re-runs
  const deleted = await prisma.factura.deleteMany({});
  console.log(`   🗑  ${deleted.count} facturas previas eliminadas`);

  const TOTAL    = 1000;
  const BATCH    = 100; // createMany en lotes de 100

  let inserted = 0;

  for (let batch = 0; batch < TOTAL / BATCH; batch++) {
    const records = [];

    for (let i = 0; i < BATCH; i++) {
      const globalIdx = batch * BATCH + i;

      // ── Entidades ──────────────────────────────────────────────────────────
      const emisor   = pick(emisores);
      const receptor = pick(receptores);

      // ── Montos (cuatro rangos para facilitar pruebas de rango) ─────────────
      // ~25% pequeñas (<10k), ~40% medianas (10k–100k), ~25% grandes (100k–1M), ~10% muy grandes (>1M)
      let subtotal: number;
      const rangoMonto = Math.random();
      if      (rangoMonto < 0.25) subtotal = dec(500,     9_999);
      else if (rangoMonto < 0.65) subtotal = dec(10_000,  99_999);
      else if (rangoMonto < 0.90) subtotal = dec(100_000, 999_999);
      else                        subtotal = dec(1_000_000, 5_000_000);

      const hasIVA        = Math.random() < 0.82;
      const trasladados   = hasIVA ? Math.round(subtotal * 0.16 * 100) / 100 : null;
      const hasRetenidos  = Math.random() < 0.12;
      const retenidos     = hasRetenidos ? Math.round(subtotal * 0.04 * 100) / 100 : null;
      const total         = subtotal + (trasladados ?? 0) - (retenidos ?? 0);

      // ── Serie / Folio ──────────────────────────────────────────────────────
      const serie = pick(series);
      const folio = serie ? String(1000 + globalIdx + int(0, 50)) : null;

      // ── Status (distribución realista) ─────────────────────────────────────
      const status = weighted(
        [FacturaEstado.VIGENTE, FacturaEstado.CANCELADA],
        [85, 15]
      );

      // ── Filtros variados ───────────────────────────────────────────────────
      const metodoPago = weighted(metodoPagos, [18, 35, 15, 20, 8, 4]);
      const moneda     = weighted(monedas,     [80, 14, 6]);
      const usoCfdi    = pick(usosCfdi); // distribución uniforme entre los 24 valores (23 + null)
      const statusPago = weighted(statusPagos, [55, 35, 10]);

      // ── Fechas ─────────────────────────────────────────────────────────────
      // Repartimos createdAt en 2 años para que los filtros de fecha tengan variedad
      const createdAt = randomDate(730);

      const hasFechaPago =
        status === FacturaEstado.VIGENTE && Math.random() < 0.60;
      const fechaPago = hasFechaPago
        ? new Date(createdAt.getTime() + Math.random() * 45 * 86_400_000)
        : null;

      // updatedAt: entre createdAt y ahora
      const updatedAt = new Date(
        createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())
      );

      // ── ingresadoPor: 80% admin, 20% null (para probar filtro de auditoría) ─
      const ingresadoPor = Math.random() < 0.80 ? userId : null;

      records.push({
        concepto: pick(conceptos),
        serie,
        folio,
        subtotal,
        totalImpuestosTransladados: trasladados,
        totalImpuestosRetenidos:    retenidos,
        total,
        uuid: randomUUID(),
        rfcEmisor:      emisor.rfc,
        nombreEmisor:   emisor.nombre,
        rfcReceptor:    receptor.rfc,
        nombreReceptor: receptor.nombre,
        metodoPago,
        moneda,
        usoCfdi,
        status,
        statusPago,
        fechaPago,
        ingresadoPor,
        createdAt,
        updatedAt,
      });
    }

    await prisma.factura.createMany({ data: records });
    inserted += records.length;
    process.stdout.write(`\r   ✍️  ${inserted}/${TOTAL} facturas insertadas...`);
  }

  // ── Resumen ────────────────────────────────────────────────────────────────
  console.log(`\n\n📊 Distribución generada:`);

  const stats = await prisma.factura.groupBy({
    by: ["status"],
    _count: true,
    orderBy: { status: "asc" },
  });
  stats.forEach((s) => console.log(`   ${s.status.padEnd(10)} → ${s._count}`));

  const monedaStats = await prisma.factura.groupBy({
    by: ["moneda"],
    _count: true,
  });
  console.log(`\n   Monedas:`);
  monedaStats.forEach((m) => console.log(`   ${(m.moneda ?? "null").padEnd(6)} → ${m._count}`));

  console.log(`\n✅ ${inserted} facturas creadas exitosamente!`);
}

seedFacturas()
  .catch((e) => {
    console.error("\n❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
