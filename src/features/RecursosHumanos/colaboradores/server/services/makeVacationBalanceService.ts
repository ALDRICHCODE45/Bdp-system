import { PrismaClient } from "@prisma/client";
import { PrismaVacationBalanceRepository } from "../repositories/PrismaVacationBalanceRepository.repository";
import { VacationBalanceService } from "./VacationBalanceService.service";

/**
 * Factory for the VacationBalanceService. Follows the same wiring shape used
 * by `makeEducationEntryService` / `makeSalaryHistoryService`:
 *
 *   - takes the shared `prisma` singleton explicitly
 *   - instantiates the Prisma repo once
 *   - hands the repo + prisma to the constructor
 *
 * The repo's `upsert` is atomic at the DB layer (Postgres ON CONFLICT), so
 * the service's defensive try/catch never has to open its own $transaction.
 */
export function makeVacationBalanceService({
  prisma,
}: {
  prisma: PrismaClient;
}): VacationBalanceService {
  const repository = new PrismaVacationBalanceRepository(prisma);
  return new VacationBalanceService(repository, prisma);
}