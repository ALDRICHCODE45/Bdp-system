import { PrismaClient } from "@prisma/client";
import { PrismaClienteProveedorRepository } from "../repositories/PrismaClienteProveedorRepository.repository";
import { ClienteProveedorService } from "./ClienteProveedorService.service";

export function makeClienteProveedorService({
  prisma,
}: {
  prisma: PrismaClient;
}) {
  const clienteProveedorRepository = new PrismaClienteProveedorRepository(
    prisma
  );
  return new ClienteProveedorService(clienteProveedorRepository, prisma);
}
