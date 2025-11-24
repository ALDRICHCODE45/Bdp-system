import { CreateFileDto } from "../dtos/CreateFileDto";
import { DeleteFileDto } from "../dtos/DeleteFileDto";
import { FindFileByIdDto } from "../dtos/FindFileByIdDtos";
import { UpdateFileDto } from "../dtos/UpdateFileDto";
import { FileEntity } from "../entities/File.entity";

export interface FileRepository {
  create(data: CreateFileDto): Promise<FileEntity>;
  update(data: UpdateFileDto): Promise<FileEntity>;
  delete(data: DeleteFileDto): Promise<void>;
  findById(data: FindFileByIdDto): Promise<FileEntity | null>;
  findByEntity(
    entityType: "FACTURA" | "EGRESO" | "INGRESO" | "CLIENTE_PROVEEDOR",
    entityId: string
  ): Promise<FileEntity[]>;
}
