import { PrismaClient } from "@prisma/client";
import { PrismaEmpresaRepository } from "../repositories/PrismaEmpresaRepository.repository";
import { EmpresaService } from "./EmpresaService.service";

export function makeEmpresaService({ prisma }: { prisma: PrismaClient }) {
  const empresaRepository = new PrismaEmpresaRepository(prisma);
  return new EmpresaService(empresaRepository, prisma);
}

