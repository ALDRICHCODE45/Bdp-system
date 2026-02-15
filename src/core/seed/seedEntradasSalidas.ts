import prisma from "@/core/lib/prisma";

const visitantes = [
  "Juan Perez",
  "Maria Garcia",
  "Carlos Lopez",
  "Ana Martinez",
  "Pedro Sanchez",
  "Laura Rodriguez",
  "Miguel Torres",
  "Sofia Ramirez",
  "Diego Herrera",
  "Valentina Cruz",
  "Andres Morales",
  "Camila Flores",
  "Fernando Diaz",
  "Isabella Vargas",
  "Roberto Mendoza",
  "Daniela Castro",
  "Jorge Reyes",
  "Patricia Gutierrez",
  "Luis Ortega",
  "Gabriela Navarro",
];

const destinatarios = [
  "Gerencia General",
  "Recursos Humanos",
  "Contabilidad",
  "Direccion Financiera",
  "Area de Proyectos",
  "Departamento Legal",
  "Soporte Tecnico",
  "Administracion",
  "Recepcion",
  "Sala de Reuniones",
];

const motivos = [
  "Reunion de trabajo",
  "Entrega de documentos",
  "Visita programada",
  "Mantenimiento de equipos",
  "Entrevista de trabajo",
  "Auditoria",
  "Capacitacion",
  "Firma de contrato",
  "Consulta general",
  "Entrega de paquete",
  "Reparacion de instalaciones",
  "Revision de proyecto",
  "Presentacion comercial",
  "Servicio de limpieza",
  "Inspeccion de seguridad",
];

const correspondencias = [
  null,
  "Sobre manila",
  "Paquete pequeno",
  "Caja",
  "Documentos legales",
  "Factura impresa",
  null,
  "Carta certificada",
  null,
  "Material de oficina",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string | null {
  if (Math.random() > 0.3) {
    return `+591 ${Math.floor(60000000 + Math.random() * 19999999)}`;
  }
  return null;
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime()),
  );
}

function randomEntryTime(fecha: Date): Date {
  const entry = new Date(fecha);
  entry.setHours(
    7 + Math.floor(Math.random() * 4),
    Math.floor(Math.random() * 60),
    0,
    0,
  );
  return entry;
}

function randomExitTime(entrada: Date): Date | null {
  if (Math.random() > 0.15) {
    const exit = new Date(entrada);
    exit.setMinutes(exit.getMinutes() + 30 + Math.floor(Math.random() * 300));
    return exit;
  }
  return null;
}

async function seedEntradasSalidas() {
  console.log("🚪 Seeding 200 registros de Entradas y Salidas...");

  const records = [];
  for (let i = 0; i < 200; i++) {
    const fecha = randomDate(90);
    const horaEntrada = randomEntryTime(fecha);
    const horaSalida = randomExitTime(horaEntrada);

    records.push({
      visitante: randomItem(visitantes),
      destinatario: randomItem(destinatarios),
      motivo: randomItem(motivos),
      telefono: randomPhone(),
      correspondencia: randomItem(correspondencias),
      fecha,
      hora_entrada: horaEntrada,
      hora_salida: horaSalida,
    });
  }

  await prisma.entradasSalidas.createMany({ data: records });

  console.log("✅ 200 registros de Entradas y Salidas creados!");
}

seedEntradasSalidas()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
