import { Err, Ok, Result } from "@/core/shared/result/result";
import { CreateEntradSalidaArgs } from "../dtos/CreateEntradasSalidas.dto";
import { UpdateEntradaSalidaArgs } from "../dtos/UpdateEntadasSalidas.dto";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";
import { EntradasSalidasRepository } from "../repositories/EntradasSalidasRepository.respository";
import { PaginationParams } from "@/core/shared/types/pagination.types";
import { Prisma } from "@prisma/client";

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

  async update(
    updateEntradasSalidasDto: UpdateEntradaSalidaArgs
  ): Promise<Result<EntradasSalidasDTO, Error>> {
    try {
      const entradaSalidaDto = await this.entradasSalidasRepository.update(
        updateEntradasSalidasDto
      );

      return Ok(entradaSalidaDto);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar la entrada o salida")
      );
    }
  }

  async getAll(): Promise<Result<EntradasSalidasDTO[], Error>> {
    try {
      const entradasSalidas = await this.entradasSalidasRepository.getAll();
      return Ok(entradasSalidas);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener entradas y salidas")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      await this.entradasSalidasRepository.delete({ id });
      return Ok(undefined);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return Err(new Error("Entrada/Salida no encontrada"));
      }
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar la entrada o salida")
      );
    }
  }

  async registrarSalida(data: {
    id: string;
    hora_salida: Date;
  }): Promise<Result<EntradasSalidasDTO, Error>> {
    try {
      // Fetch to validate business rules (hora_salida > hora_entrada, not already registered)
      const existingEntradaSalida =
        await this.entradasSalidasRepository.findById({ id: data.id });

      if (!existingEntradaSalida) {
        return Err(new Error("Entrada/Salida no encontrada"));
      }

      if (data.hora_salida <= existingEntradaSalida.hora_entrada) {
        return Err(
          new Error("La hora de salida debe ser posterior a la hora de entrada")
        );
      }

      if (existingEntradaSalida.hora_salida) {
        return Err(
          new Error("Esta entrada/salida ya tiene una hora de salida registrada")
        );
      }

      const entradaSalidaDto = await this.entradasSalidasRepository.registrarSalida(
        data
      );

      return Ok(entradaSalidaDto);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar la salida")
      );
    }
  }

  async getPaginated(params: PaginationParams): Promise<Result<{ data: EntradasSalidasDTO[]; totalCount: number }, Error>> {
    try {
      const result = await this.entradasSalidasRepository.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener entradas/salidas paginadas"));
    }
  }
}
