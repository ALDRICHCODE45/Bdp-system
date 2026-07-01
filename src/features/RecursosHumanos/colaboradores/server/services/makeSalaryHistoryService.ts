import { PrismaClient } from "@prisma/client";
import { PrismaSalaryHistoryRepository } from "../repositories/PrismaSalaryHistoryRepository.repository";
import { SalaryHistoryService } from "./SalaryHistoryService.service";

/**
 * Factory for the SalaryHistoryService. Mirrors the wiring pattern of the
 * other P3 factories (e.g. `makeEmergencyContactService`):
 *
 *   - takes the shared `prisma` singleton explicitly
 *   - instantiates the Prisma repo once
 *   - hands the repo + prisma to the constructor (the prisma client is
 *     needed by the service to open `$transaction` blocks for adjustSalary)
 */
export function makeSalaryHistoryService({
  prisma,
}: {
  prisma: PrismaClient;
}): SalaryHistoryService {
  const repository = new PrismaSalaryHistoryRepository(prisma);
  return new SalaryHistoryService(repository, prisma);
}