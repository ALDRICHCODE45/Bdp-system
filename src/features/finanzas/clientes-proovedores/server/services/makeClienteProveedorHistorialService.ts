import { PrismaClient } from "@prisma/client";
import { PrismaClienteProveedorHistorialRepository } from "../repositories/PrismaClienteProveedorHistorialRepository.repository";
import { ClienteProveedorHistorialService } from "./ClienteProveedorHistorialService.service";

export function makeClienteProveedorHistorialService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const historialRepository = new PrismaClienteProveedorHistorialRepository(
    prisma
  );
  return new ClienteProveedorHistorialService(historialRepository);
}

