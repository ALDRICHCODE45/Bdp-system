import { PrismaClient } from "@prisma/client";
import { FileRepository } from "./FileRespository.repository";
import { CreateFileDto } from "../dtos/CreateFileDto";
import { FileEntity } from "../entities/File.entity";
import { UpdateFileDto } from "../dtos/UpdateFileDto";
import { DeleteFileDto } from "../dtos/DeleteFileDto";
import { FindFileByIdDto } from "../dtos/FindFileByIdDtos";

export class PrismaFileRespository implements FileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateFileDto): Promise<FileEntity> {
    throw new Error("Not implemented");
  }

  async delete(data: DeleteFileDto): Promise<void> {
    throw new Error("Not implemented");
  }

  async update(data: UpdateFileDto): Promise<FileEntity> {
    throw new Error("Not implemented");
  }

  async findById(data: FindFileByIdDto): Promise<FileEntity | null> {
    throw new Error("Not implemented");
  }
}
