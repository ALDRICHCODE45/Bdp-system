import { PrismaClient } from "@prisma/client";
import { PrismaPositionHistoryRepository } from "../repositories/PrismaPositionHistoryRepository.repository";
import { PositionHistoryService } from "./PositionHistoryService.service";

/**
 * Factory for the PositionHistoryService. Mirrors the wiring pattern of
 * `makeSalaryHistoryService` / `makeEmergencyContactService`:
 *
 *   - takes the shared `prisma` singleton explicitly
 *   - instantiates the Prisma repo once
 *   - hands the repo + prisma to the constructor
 */
export function makePositionHistoryService({
  prisma,
}: {
  prisma: PrismaClient;
}): PositionHistoryService {
  const repository = new PrismaPositionHistoryRepository(prisma);
  return new PositionHistoryService(repository, prisma);
}