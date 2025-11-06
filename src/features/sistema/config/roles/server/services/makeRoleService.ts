import { PrismaClient } from "@prisma/client";
import { RoleService } from "./RoleService.service";
import { PrismaRoleRepository } from "../repositories/PrismaRoleRepository.repository";

export function makeRoleService({ prisma }: { prisma: PrismaClient }) {
  const roleRepository = new PrismaRoleRepository(prisma);
  return new RoleService(roleRepository);
}
