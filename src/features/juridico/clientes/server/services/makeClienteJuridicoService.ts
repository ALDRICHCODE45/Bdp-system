import { PrismaClient } from "@prisma/client";
import { PrismaClienteJuridicoRepository } from "../repositories/PrismaClienteJuridicoRepository.repository";
import { ClienteJuridicoService } from "./ClienteJuridicoService.service";

export function makeClienteJuridicoService({ prisma }: { prisma: PrismaClient }) {
  const repo = new PrismaClienteJuridicoRepository(prisma);
  return new ClienteJuridicoService(repo, prisma);
}
