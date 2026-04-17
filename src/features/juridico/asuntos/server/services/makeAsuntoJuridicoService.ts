import { PrismaClient } from "@prisma/client";
import { PrismaAsuntoJuridicoRepository } from "../repositories/PrismaAsuntoJuridicoRepository.repository";
import { AsuntoJuridicoService } from "./AsuntoJuridicoService.service";

export function makeAsuntoJuridicoService({ prisma }: { prisma: PrismaClient }) {
  const repo = new PrismaAsuntoJuridicoRepository(prisma);
  return new AsuntoJuridicoService(repo, prisma);
}
