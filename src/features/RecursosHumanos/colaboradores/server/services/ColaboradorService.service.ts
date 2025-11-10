import { ColaboradorEstado, Prisma } from "@prisma/client";
import {
  ColaboradorRepository,
  ColaboradorWithSocio,
} from "../repositories/ColaboradorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";

type CreateColaboradorInput = {
  name: string;
  correo: string;
  puesto: string;
  status: ColaboradorEstado;
  imss: boolean;
  socioId?: string | null;
  banco: string;
  clabe: string;
  sueldo: number;
  activos: string[];
};

type UpdateColaboradorInput = {
  id: string;
  name: string;
  correo: string;
  puesto: string;
  status: ColaboradorEstado;
  imss: boolean;
  socioId?: string | null;
  banco: string;
  clabe: string;
  sueldo: number;
  activos: string[];
};

export class ColaboradorService {
  constructor(private colaboradorRepository: ColaboradorRepository) {}

  async create(
    input: CreateColaboradorInput
  ): Promise<Result<ColaboradorWithSocio, Error>> {
    try {
      // Validar que el correo no exista
      const existingColaborador = await this.colaboradorRepository.findByCorreo(
        {
          correo: input.correo,
        }
      );

      if (existingColaborador) {
        return Err(new Error("Ya existe un colaborador con ese correo"));
      }

      const colaborador = await this.colaboradorRepository.create({
        name: input.name,
        correo: input.correo,
        puesto: input.puesto,
        status: input.status,
        imss: input.imss,
        socioId: input.socioId,
        banco: input.banco,
        clabe: input.clabe,
        sueldo: new Prisma.Decimal(input.sueldo),
        activos: input.activos,
      });

      return Ok(colaborador);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear colaborador")
      );
    }
  }

  async update(
    input: UpdateColaboradorInput
  ): Promise<Result<ColaboradorWithSocio, Error>> {
    try {
      // Verificar que el colaborador existe
      const existingColaborador = await this.colaboradorRepository.findById({
        id: input.id,
      });

      if (!existingColaborador) {
        return Err(new Error("Colaborador no encontrado"));
      }

      const colaborador = await this.colaboradorRepository.update({
        id: input.id,
        name: input.name,
        correo: input.correo,
        puesto: input.puesto,
        status: input.status,
        imss: input.imss,
        socioId: input.socioId,
        banco: input.banco,
        clabe: input.clabe,
        sueldo: new Prisma.Decimal(input.sueldo),
        activos: input.activos,
      });

      return Ok(colaborador);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar colaborador")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que el colaborador existe
      const existingColaborador = await this.colaboradorRepository.findById({
        id,
      });

      if (!existingColaborador) {
        return Err(new Error("Colaborador no encontrado"));
      }

      await this.colaboradorRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar colaborador")
      );
    }
  }

  async getById(id: string): Promise<Result<ColaboradorWithSocio, Error>> {
    try {
      const colaborador = await this.colaboradorRepository.findById({ id });

      if (!colaborador) {
        return Err(new Error("Colaborador no encontrado"));
      }

      return Ok(colaborador);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener colaborador")
      );
    }
  }

  async getAll(): Promise<Result<ColaboradorWithSocio[], Error>> {
    try {
      const colaboradores = await this.colaboradorRepository.getAll();
      return Ok(colaboradores);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener colaboradores")
      );
    }
  }

  async getBySocioId(
    socioId: string
  ): Promise<Result<ColaboradorWithSocio[], Error>> {
    try {
      const colaboradores = await this.colaboradorRepository.findBySocioId({
        socioId,
      });
      return Ok(colaboradores);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener colaboradores por socio")
      );
    }
  }
}
