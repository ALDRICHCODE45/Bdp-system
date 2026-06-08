import type { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/core/shared/config/env.config";
import { PrismaMovimientoRepository } from "../repositories/PrismaMovimientoRepository.repository";
import { MovimientoExcelImportService } from "./MovimientoExcelImportService.service";

/**
 * Creates an S3Client configured for DigitalOcean Spaces.
 * Mirrors the setup in DigitalOceanSpacesService but extracts it
 * for reuse by the import service.
 */
function createS3Client(): S3Client {
  const endpointUrl = new URL(env.DO_SPACES_ENDPOINT);
  const hostnameParts = endpointUrl.hostname.split(".");

  // If the first segment is the bucket name, strip it to get the base endpoint
  if (hostnameParts[0] === env.DO_SPACES_BUCKET) {
    hostnameParts.shift();
  }

  const baseEndpoint = `${endpointUrl.protocol}//${hostnameParts.join(".")}`;

  return new S3Client({
    endpoint: baseEndpoint,
    region: env.DO_SPACES_REGION,
    credentials: {
      accessKeyId: env.DO_ACCESS_KEY,
      secretAccessKey: env.DO_SECRET_KEY,
    },
    forcePathStyle: true,
  });
}

export function makeMovimientoExcelImportService({
  prisma,
}: {
  prisma: PrismaClient;
}): MovimientoExcelImportService {
  const repo = new PrismaMovimientoRepository(prisma);
  const s3Client = createS3Client();
  const s3Bucket = env.DO_SPACES_BUCKET;
  return new MovimientoExcelImportService(repo, prisma, s3Client, s3Bucket);
}
