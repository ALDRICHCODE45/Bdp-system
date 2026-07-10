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
   * Sube un archivo a Digital Ocean Spaces y guarda la referencia en la base de datos.
   *
   * secure-file-access Phase 2: el valor persistido en `FileAttachment.fileUrl`
   * es la **clave** cruda del objeto en Spaces (no una URL pública). El
   * objeto se sube privado (sin ACL pública). La lectura posterior la hace
   * `getFilePresignedUrlAction` (Phase 3) que firma un GET de corta duración.
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

      // Subir archivo a Digital Ocean Spaces — devuelve la clave cruda.
      // El nombre de la variable conserva `fileUrl` para no romper la
      // forma del DTO ni el contrato de Prisma; el valor guardado es la
      // clave (sin scheme, sin host, sin bucket).
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
   * Elimina un archivo de Digital Ocean Spaces y de la base de datos.
   *
   * secure-file-access Phase 2: pasa la clave directamente al servicio de
   * Spaces (sin parsing de URL). Para filas nuevas `fileEntity.fileUrl`
   * ya ES la clave — funciona tal cual. Filas legadas con URL completa
   * aún no pasaron por la migración de Phase 7; mientras estén sin
   * migrar, este delete fallará al apuntar a Spaces con un Key inválido.
   * Eso está aceptado por el plan (la migración se ejecuta después de
   * que el presign-read esté en prod — Phase 5/7).
   */
  async deleteFile(fileId: string): Promise<Result<void, Error>> {
    try {
      // Obtener información del archivo
      const fileEntity = await this.fileRepository.findById({ id: fileId });

      if (!fileEntity) {
        return Err(new Error("Archivo no encontrado"));
      }

      // fileEntity.fileUrl es la clave (filas nuevas). Se pasa directo al
      // servicio de Spaces, sin parsing de URL.
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
   * Obtiene un archivo por su id.
   *
   * Wrapper sobre `fileRepository.findById`. El server action de Phase 3
   * (`getFilePresignedUrlAction`) lo usa para derivar el `entityType` de la
   * fila y mapearlo al permiso de módulo antes de firmar la URL.
   *
   * Devuelve `Ok(null)` si la fila no existe — el caller distingue "no
   * encontrado" de error de infraestructura.
   */
  async getById(
    id: string
  ): Promise<Result<FileEntity | null, Error>> {
    try {
      const fileEntity = await this.fileRepository.findById({ id });
      return Ok(fileEntity);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener el archivo"),
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
