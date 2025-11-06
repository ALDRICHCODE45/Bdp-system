import prisma from "@/core/lib/prisma";
import { PermissionService } from "./PermissionService.service";
import { PrismaPermissionRepository } from "../repositories/PrismaPermissionRepository.repository";

export function makePermissionService(): PermissionService {
  const permissionRepository = new PrismaPermissionRepository(prisma);
  return new PermissionService(permissionRepository);
}

