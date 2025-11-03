import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// Extiende el tipo global para incluir la propiedad 'prisma'
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Evita múltiples instancias de Prisma en desarrollo por hot reload
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
