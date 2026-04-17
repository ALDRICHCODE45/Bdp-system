import { PrismaClient } from "@prisma/client";
import { PrismaEquipoJuridicoRepository } from "../repositories/PrismaEquipoJuridicoRepository.repository";
import { EquipoJuridicoService } from "./EquipoJuridicoService.service";

export function makeEquipoJuridicoService({ prisma }: { prisma: PrismaClient }) {
  const repo = new PrismaEquipoJuridicoRepository(prisma);
  return new EquipoJuridicoService(repo, prisma);
}
