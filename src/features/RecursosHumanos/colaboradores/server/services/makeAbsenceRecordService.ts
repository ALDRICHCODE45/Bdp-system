import { PrismaClient } from "@prisma/client";
import { PrismaAbsenceRecordRepository } from "../repositories/PrismaAbsenceRecordRepository.repository";
import { AbsenceRecordService } from "./AbsenceRecordService.service";

/**
 * Factory for the AbsenceRecordService. Follows the same wiring shape used
 * by `makeEducationEntryService` / `makeSalaryHistoryService`:
 *
 *   - takes the shared `prisma` singleton explicitly
 *   - instantiates the Prisma repo once
 *   - hands the repo + prisma to the constructor (the prisma client is
 *     kept so future transactional ops can re-use the same wiring without
 *     spawning a new connection)
 */
export function makeAbsenceRecordService({
  prisma,
}: {
  prisma: PrismaClient;
}): AbsenceRecordService {
  const repository = new PrismaAbsenceRecordRepository(prisma);
  return new AbsenceRecordService(repository, prisma);
}