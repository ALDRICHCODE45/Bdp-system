import { PrismaClient } from "@prisma/client";
import { PrismaAutorizacionEdicionRepository } from "../repositories/PrismaAutorizacionEdicionRepository.repository";
import { AutorizacionEdicionService } from "./AutorizacionEdicionService.service";

export function makeAutorizacionEdicionService({
  prisma,
}: {
  prisma: PrismaClient;
}): AutorizacionEdicionService {
  const repo = new PrismaAutorizacionEdicionRepository(prisma);
  return new AutorizacionEdicionService(repo, prisma);
}
