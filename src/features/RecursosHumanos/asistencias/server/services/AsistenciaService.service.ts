import { Result, Ok, Err } from "@/core/shared/result/result";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { AsistenciaRepository } from "../repositories/AsistenciaRepository.repository";
import { AsistenciaDto } from "../Dtos/AsistenciaDto.dto";

export class AsistenciaService {
  constructor(private readonly asistenciaRepository: AsistenciaRepository) { }

  async create(
    input: CreateAsistenciaDto,
  ): Promise<Result<AsistenciaDto, Error>> {
    try {
      const asistencia = await this.asistenciaRepository.create(input);
      return Ok(asistencia);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear asistencia"),
      );
    }
  }

  async getById(id: string): Promise<Result<AsistenciaDto, Error>> {
    try {
      const asistencia = await this.asistenciaRepository.getById({ id });
      return Ok(asistencia);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener asistencia"),
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.asistenciaRepository.delete({ id });
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar asistencia"),
      );
    }
  }
}
