import { PrismaClient } from "@prisma/client";
import { PrismaClienteProveedorRepository } from "../repositories/PrismaClienteProveedorRepository.repository";
import { ClienteProveedorService } from "./ClienteProveedorService.service";
import { makeClienteProveedorHistorialService } from "./makeClienteProveedorHistorialService";

export function makeClienteProveedorService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const clienteProveedorRepository = new PrismaClienteProveedorRepository(
    prisma
  );
  const historialService = makeClienteProveedorHistorialService({ prisma });
  return new ClienteProveedorService(
    clienteProveedorRepository,
    historialService,
    prisma
  );
}
