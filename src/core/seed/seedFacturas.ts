import prisma from "@/core/lib/prisma";
import { FacturaEstado } from "@prisma/client";
import { randomUUID } from "crypto";

// -- Data pools --

const conceptos = [
  "Honorarios profesionales",
  "Consultoría en sistemas",
  "Servicios de contabilidad",
  "Arrendamiento de oficina",
  "Servicios de limpieza",
  "Mantenimiento preventivo",
  "Licencia de software",
  "Servicio de hosting",
  "Diseño gráfico",
  "Capacitación de personal",
  "Auditoría financiera",
  "Servicio de nómina",
  "Transporte de mercancía",
  "Materiales de construcción",
  "Equipo de cómputo",
  "Papelería y suministros",
  "Servicios legales",
  "Publicidad y marketing",
  "Seguro empresarial",
  "Renta de maquinaria",
];

const emisores = [
  { nombre: "BDP Constructora SA de CV", rfc: "BDP200101ABC" },
  { nombre: "BDP Inmobiliaria SA de CV", rfc: "BDP200201DEF" },
  { nombre: "Grupo BDP SA de CV", rfc: "GBD180515GH1" },
  { nombre: "BDP Servicios Integrales SA de CV", rfc: "BSI190301JK2" },
  { nombre: "BDP Proyectos SA de CV", rfc: "BPR210601LM3" },
];

const receptores = [
  { nombre: "Cementos del Norte SA de CV", rfc: "CNO850101AB1" },
  { nombre: "Distribuidora López y Asociados", rfc: "DLA920515CD2" },
  { nombre: "Ferreterías Martínez SA", rfc: "FMA001201EF3" },
  { nombre: "Constructora Hernández e Hijos", rfc: "CHH880720GH4" },
  { nombre: "Inmobiliaria del Pacífico SA de CV", rfc: "IPA950301IJ5" },
  { nombre: "Servicios Industriales Rojas", rfc: "SIR070815KL6" },
  { nombre: "Grupo Financiero Morales", rfc: "GFM100401MN7" },
  { nombre: "Transportes Guzmán SA de CV", rfc: "TGU120601OP8" },
  { nombre: "Alimentos del Bajío SA", rfc: "ABA880915QR9" },
  { nombre: "Tecnología Avanzada MX SA de CV", rfc: "TAM150201ST0" },
  { nombre: "Farmacia Santa Cruz SA", rfc: "FSC970401UV1" },
  { nombre: "Mueblería San José SA de CV", rfc: "MSJ060715WX2" },
  { nombre: "Textiles del Centro SA", rfc: "TDC110301YZ3" },
  { nombre: "Laboratorios Bioquímica SA de CV", rfc: "LBI040201AB4" },
  { nombre: "Papelera Nacional SA", rfc: "PNA990601CD5" },
  { nombre: "Refaccionaria El Águila", rfc: "REA130815EF6" },
  { nombre: "Hotel Plaza Central SA de CV", rfc: "HPC080401GH7" },
  { nombre: "Impresora del Golfo SA", rfc: "IDG160601IJ8" },
  { nombre: "Gasolinera Los Pinos SA de CV", rfc: "GLP020301KL9" },
  { nombre: "Juan Carlos Ramírez Torres", rfc: "RATJ850612MN0" },
  { nombre: "María Elena Sánchez Díaz", rfc: "SADM900315OP1" },
  { nombre: "Roberto Alejandro Flores Vega", rfc: "FOVR780820QR2" },
  { nombre: "Andrea Guadalupe Ortiz Luna", rfc: "OILA880105ST3" },
  { nombre: "Luis Fernando Castillo Reyes", rfc: "CARL920710UV4" },
  { nombre: "Patricia Mendoza García", rfc: "MEGP870425WX5" },
  { nombre: "Consultoría Estratégica MX", rfc: "CEM140601YZ6" },
  { nombre: "Despacho Jurídico Ríos y Asoc.", rfc: "DJR170301AB7" },
  { nombre: "Clínica Dental Sonrisa SA", rfc: "CDS050815CD8" },
  { nombre: "Escuela Particular Futuro AC", rfc: "EPF100101EF9" },
  { nombre: "Arquitectura Moderna SA de CV", rfc: "AMO190515GH0" },
];

const series = ["A", "B", "C", null];
const metodoPagos = ["CHEQUE", "TRANSFERENCIA", "EFECTIVO", null];
const monedas = ["MXN", "USD", "EUR"];
const usosCfdi = ["G03", "P01", "I04", null];
const statusPagos = ["Vigente", "Cancelado", "NoPagado", null];

// -- Helpers --

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function randomDecimal(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

// -- Seed --

async function seedFacturas() {
  console.log("📄 Seeding 600 facturas...");

  const records = [];

  for (let i = 0; i < 600; i++) {
    const emisor = randomItem(emisores);
    const receptor = randomItem(receptores);

    const subtotal = randomDecimal(1000, 5000000);
    const hasIVA = Math.random() < 0.8;
    const trasladados = hasIVA ? Math.round(subtotal * 0.16 * 100) / 100 : null;
    const hasRetenidos = Math.random() < 0.1;
    const retenidos = hasRetenidos ? Math.round(subtotal * 0.04 * 100) / 100 : null;
    const total = subtotal + (trasladados ?? 0) - (retenidos ?? 0);

    const serie = weightedRandom(series, [10, 10, 10, 70]);
    const folio = serie ? String(1000 + i + Math.floor(Math.random() * 100)) : null;

    const status = weightedRandom(
      [FacturaEstado.BORRADOR, FacturaEstado.ENVIADA, FacturaEstado.PAGADA, FacturaEstado.CANCELADA],
      [15, 20, 50, 15]
    );

    const metodoPago = weightedRandom(metodoPagos, [30, 40, 20, 10]);
    const moneda = weightedRandom(monedas, [85, 10, 5]);
    const usoCfdi = weightedRandom(usosCfdi, [60, 20, 10, 10]);
    const statusPago = weightedRandom(statusPagos, [60, 15, 15, 10]);

    const createdAt = randomDate(365);
    const hasFechaPago = status === FacturaEstado.PAGADA || (status === FacturaEstado.ENVIADA && Math.random() < 0.3);
    const fechaPago = hasFechaPago
      ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      : null;

    records.push({
      concepto: randomItem(conceptos),
      serie,
      folio,
      subtotal,
      totalImpuestosTransladados: trasladados,
      totalImpuestosRetenidos: retenidos,
      total,
      uuid: randomUUID(),
      rfcEmisor: emisor.rfc,
      nombreEmisor: emisor.nombre,
      nombreReceptor: receptor.nombre,
      rfcReceptor: receptor.rfc,
      metodoPago,
      moneda,
      usoCfdi,
      status,
      statusPago,
      fechaPago,
      createdAt,
    });
  }

  await prisma.factura.createMany({ data: records });

  console.log("✅ 600 facturas creadas!");
}

seedFacturas()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
