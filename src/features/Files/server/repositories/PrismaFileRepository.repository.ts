import { PrismaClient, type FileAttachment } from "@prisma/client";
import { FileRepository } from "./FileRespository.repository";
import { CreateFileDto } from "../dtos/CreateFileDto";
import { FileEntity } from "../entities/File.entity";
import { UpdateFileDto } from "../dtos/UpdateFileDto";
import { DeleteFileDto } from "../dtos/DeleteFileDto";
import { FindFileByIdDto } from "../dtos/FindFileByIdDtos";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaFileRespository implements FileRepository {
  constructor(
    private readonly prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateFileDto): Promise<FileEntity> {
    const fileAttachment = await this.prisma.fileAttachment.create({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        entityType: data.entityType,
        entityId: data.entityId,
        uploadedBy: data.uploadedBy || null,
        // P5 — expiryDate + category are nullable in the schema, so we only
        // persist them when explicitly provided. Empty strings from FormData
        // get coerced to null here so the existing entityTypes are unaffected.
        expiryDate: normalizeExpiryDate(data.expiryDate),
        category: data.category ?? null,
      },
    });

    return this.mapToEntity(fileAttachment);
  }

  async delete(data: DeleteFileDto): Promise<void> {
    await this.prisma.fileAttachment.delete({
      where: { id: data.id },
    });
  }

  async update(data: UpdateFileDto): Promise<FileEntity> {
    const fileAttachment = await this.prisma.fileAttachment.update({
      where: { id: data.id },
      data: {
        ...(data.fileName && { fileName: data.fileName }),
        ...(data.mimeType && { mimeType: data.mimeType }),
      },
    });

    return this.mapToEntity(fileAttachment);
  }

  async findById(data: FindFileByIdDto): Promise<FileEntity | null> {
    const fileAttachment = await this.prisma.fileAttachment.findUnique({
      where: { id: data.id },
    });

    if (!fileAttachment) {
      return null;
    }

    return this.mapToEntity(fileAttachment);
  }

  async findByEntity(
    entityType:
      | "FACTURA"
      | "MOVIMIENTO"
      | "CLIENTE_PROVEEDOR"
      | "COLABORADOR",
    entityId: string
  ): Promise<FileEntity[]> {
    const fileAttachments = await this.prisma.fileAttachment.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return fileAttachments.map(this.mapToEntity);
  }

  private mapToEntity(fileAttachment: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    entityType: string;
    entityId: string;
    uploadedBy: string | null;
    expiryDate: Date | null;
    category: FileAttachment["category"];
    createdAt: Date;
    updatedAt: Date;
  }): FileEntity {
    return {
      id: fileAttachment.id,
      fileName: fileAttachment.fileName,
      fileUrl: fileAttachment.fileUrl,
      fileSize: fileAttachment.fileSize,
      mimeType: fileAttachment.mimeType,
      entityType: fileAttachment.entityType as
        | "FACTURA"
        | "MOVIMIENTO"
        | "CLIENTE_PROVEEDOR"
        | "COLABORADOR",
      entityId: fileAttachment.entityId,
      uploadedBy: fileAttachment.uploadedBy,
      expiryDate: fileAttachment.expiryDate ?? null,
      category: fileAttachment.category ?? null,
      createdAt: fileAttachment.createdAt,
      updatedAt: fileAttachment.updatedAt,
    };
  }
}

/**
 * Coerce the `expiryDate` value coming through the DTO boundary to either a
 * `Date` instance or `null`. The server action forwards either an ISO string
 * (from FormData) or a `Date` (from internal callers); both should land in
 * Prisma as a `DateTime` or `NULL`. Anything unparseable becomes `null` so
 * the DB stays consistent.
 */
function normalizeExpiryDate(
  value: Date | string | null | undefined
): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
