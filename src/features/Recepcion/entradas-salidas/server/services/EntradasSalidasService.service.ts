import { Err, Ok, Result } from "@/core/shared/result/result";
import { CreateEntradSalidaArgs } from "../dtos/CreateEntradasSalidas.dto";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";
import { EntradasSalidasRepository } from "../repositories/EntradasSalidasRepository.respository";

export class EntradasSalidasService {
  constructor(
    private readonly entradasSalidasRepository: EntradasSalidasRepository
  ) {}

  async create(
    createEntradasSalidasDto: CreateEntradSalidaArgs
  ): Promise<Result<EntradasSalidasDTO, Error>> {
    try {
      const entradaSalidaDto = await this.entradasSalidasRepository.create(
        createEntradasSalidasDto
      );

      return Ok(entradaSalidaDto);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear la entrada o salida")
      );
    }
  }
}
