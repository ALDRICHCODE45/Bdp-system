import type { DocumentCategory } from "@prisma/client";
import { FileRepository } from "../repositories/FileRespository.repository";
import { DigitalOceanSpacesService } from "./DigitalOceanSpacesService";
import { CreateFileDto } from "../dtos/CreateFileDto";
import { FileEntity } from "../entities/File.entity";
import { Result, Ok, Err } from "@/core/shared/result/result";

export class FileService {
  constructor(
    private fileRepository: FileRepository,
    private spacesService: DigitalOceanSpacesService,
  ) { }

  /**
   * Sube un archivo a Digital Ocean Spaces y guarda la referencia en la base de datos
   *
   * P5 — accepts COLABORADOR entityType + optional `expiryDate` / `category`
   * for the Documentos / CV tabs (cap8 + cap10). Existing entityTypes
   * continue to work unchanged (cap12 req3).
   */
  async uploadFile(
    file: File,
    entityType:
      | "FACTURA"
      | "MOVIMIENTO"
      | "CLIENTE_PROVEEDOR"
      | "COLABORADOR",
    entityId: string,
    uploadedBy?: string | null,
    extras?: { expiryDate?: Date | string | null; category?: DocumentCategory | null },
  ): Promise<Result<FileEntity, Error>> {
    try {
      // Determinar la carpeta según el tipo de entidad
      const folder = entityType.toLowerCase().replace("_", "-");

      // Subir archivo a Digital Ocean Spaces
      const fileUrl = await this.spacesService.uploadFile(file, folder);

      // Guardar referencia en la base de datos
      const createFileDto: CreateFileDto = {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        entityType,
        entityId,
        uploadedBy: uploadedBy || null,
        expiryDate: extras?.expiryDate ?? null,
        category: extras?.category ?? null,
      };

      const fileEntity = await this.fileRepository.create(createFileDto);

      return Ok(fileEntity);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al subir el archivo"),
      );
    }
  }

  /**
   * Elimina un archivo de Digital Ocean Spaces y de la base de datos
   */
  async deleteFile(fileId: string): Promise<Result<void, Error>> {
    try {
      // Obtener información del archivo
      const fileEntity = await this.fileRepository.findById({ id: fileId });

      if (!fileEntity) {
        return Err(new Error("Archivo no encontrado"));
      }

      // Eliminar de Digital Ocean Spaces
      await this.spacesService.deleteFile(fileEntity.fileUrl);

      // Eliminar de la base de datos
      await this.fileRepository.delete({ id: fileId });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar el archivo"),
      );
    }
  }

  /**
   * Obtiene todos los archivos asociados a una entidad
   */
  async getFilesByEntity(
    entityType:
      | "FACTURA"
      | "MOVIMIENTO"
      | "CLIENTE_PROVEEDOR"
      | "COLABORADOR",
    entityId: string,
  ): Promise<Result<FileEntity[], Error>> {
    try {
      const files = await this.fileRepository.findByEntity(
        entityType,
        entityId,
      );
      return Ok(files);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener los archivos"),
      );
    }
  }
}
