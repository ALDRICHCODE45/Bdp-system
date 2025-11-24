import { PrismaClient } from "@prisma/client";
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
    entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR",
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
        | "EGRESO"
        | "INGRESO"
        | "CLIENTE_PROVEEDOR",
      entityId: fileAttachment.entityId,
      uploadedBy: fileAttachment.uploadedBy,
      createdAt: fileAttachment.createdAt,
      updatedAt: fileAttachment.updatedAt,
    };
  }
}
