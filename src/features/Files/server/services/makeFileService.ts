import { PrismaClient } from "@prisma/client";
import { FileService } from "./FileService";
import { PrismaFileRespository } from "../repositories/PrismaFileRepository.repository";
import { DigitalOceanSpacesService } from "./DigitalOceanSpacesService";

export function makeFileService({ prisma }: { prisma: PrismaClient }) {
  const fileRepository = new PrismaFileRespository(prisma);
  const spacesService = new DigitalOceanSpacesService();
  return new FileService(fileRepository, spacesService);
}

