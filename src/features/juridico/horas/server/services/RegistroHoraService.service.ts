import { PrismaClient } from "@prisma/client";
import type {
  RegistroHoraRepository,
  RegistroHoraEntity,
  CreateRegistroHoraArgs,
  UpdateRegistroHoraArgs,
} from "../repositories/RegistroHoraRepository.repository";
import type { RegistroHoraHistorialService } from "./RegistroHoraHistorialService.service";
import { Result, Ok, Err } from "@/core/shared/result/result";
import {
  isValidISOWeek,
  isWithinDeadline,
} from "@/core/shared/helpers/weekUtils";

export class RegistroHoraService {
  constructor(
    private repo: RegistroHoraRepository,
    private historialService: RegistroHoraHistorialService,
    private prisma: PrismaClient
  ) {}

  async create(
    input: Omit<CreateRegistroHoraArgs, never>
  ): Promise<Result<RegistroHoraEntity, Error>> {
    try {
      // 1. Validate ISO week
      if (!isValidISOWeek(input.ano, input.semana)) {
        return Err(
          new Error(
            `Semana ${input.semana} no es válida para el año ${input.ano}`
          )
        );
      }

      // 2. Check deadline
      if (!isWithinDeadline(input.ano, input.semana)) {
        return Err(
          new Error(
            "El plazo para registrar horas de esta semana ha vencido. Solo puedes registrar horas de la semana actual."
          )
        );
      }

      // 3. Validate FK existence
      const [equipo, cliente, asunto, socio] = await Promise.all([
        this.prisma.equipoJuridico.findUnique({
          where: { id: input.equipoJuridicoId },
        }),
        this.prisma.clienteJuridico.findUnique({
          where: { id: input.clienteJuridicoId },
        }),
        this.prisma.asuntoJuridico.findUnique({
          where: { id: input.asuntoJuridicoId },
        }),
        this.prisma.socio.findUnique({
          where: { id: input.socioId },
        }),
      ]);

      if (!equipo || !equipo.activo) {
        return Err(new Error("El equipo jurídico seleccionado no existe o está inactivo"));
      }
      if (!cliente || !cliente.activo) {
        return Err(new Error("El cliente jurídico seleccionado no existe o está inactivo"));
      }
      if (!asunto || asunto.estado !== "ACTIVO") {
        return Err(new Error("El asunto jurídico seleccionado no existe o no está activo"));
      }
      if (!socio) {
        return Err(new Error("El socio seleccionado no existe"));
      }

      // 4. Create with editable=true (default)
      const created = await this.repo.create(input);
      return Ok(created);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear registro de horas")
      );
    }
  }

  async update(
    input: UpdateRegistroHoraArgs,
    usuarioId: string
  ): Promise<Result<RegistroHoraEntity, Error>> {
    try {
      // 1. Find existing
      const existing = await this.repo.findById(input.id);
      if (!existing) {
        return Err(new Error("Registro de horas no encontrado"));
      }

      // 2. Check editable flag
      if (!existing.editable) {
        return Err(
          new Error(
            "Este registro no es editable. Solicita autorización al administrador."
          )
        );
      }

      const withinDeadline = isWithinDeadline(existing.ano, existing.semana);

      // 3. Use transaction: update + historial + conditionally set editable=false
      const updated = await this.prisma.$transaction(async (tx) => {
        // Update registro
        const updatedRegistro = await tx.registroHora.update({
          where: { id: input.id },
          data: {
            equipoJuridicoId: input.equipoJuridicoId,
            clienteJuridicoId: input.clienteJuridicoId,
            asuntoJuridicoId: input.asuntoJuridicoId,
            socioId: input.socioId,
            horas: input.horas,
            descripcion: input.descripcion ?? null,
          },
          include: {
            usuario: { select: { id: true, name: true, email: true } },
            equipoJuridico: { select: { id: true, nombre: true } },
            clienteJuridico: { select: { id: true, nombre: true } },
            asuntoJuridico: { select: { id: true, nombre: true } },
            socio: { select: { id: true, nombre: true } },
          },
        });

        // If PAST deadline, this was a post-authorization edit — lock it
        if (!withinDeadline) {
          await tx.registroHora.update({
            where: { id: input.id },
            data: { editable: false },
          });
          updatedRegistro.editable = false;

          // Mark the AUTORIZADA autorizacion as UTILIZADA
          await tx.autorizacionEdicion.updateMany({
            where: {
              registroHoraId: input.id,
              estado: "AUTORIZADA",
            },
            data: { estado: "UTILIZADA" },
          });
        }

        return updatedRegistro;
      });

      // 4. Create historial entries for changed fields (outside tx to avoid long tx)
      await this.historialService.createHistorialForUpdate(
        existing,
        updated,
        usuarioId
      );

      return Ok(updated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar registro de horas")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // 1. Find existing
      const existing = await this.repo.findById(id);
      if (!existing) {
        return Err(new Error("Registro de horas no encontrado"));
      }

      // 2. Only delete within deadline
      if (!isWithinDeadline(existing.ano, existing.semana)) {
        return Err(
          new Error(
            "No se puede eliminar un registro fuera del plazo de edición."
          )
        );
      }

      // 3. Delete
      await this.repo.delete(id);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar registro de horas")
      );
    }
  }

  async getAll(): Promise<Result<RegistroHoraEntity[], Error>> {
    try {
      const registros = await this.repo.getAll();
      return Ok(registros);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener registros de horas")
      );
    }
  }

  async getByUsuario(
    usuarioId: string
  ): Promise<Result<RegistroHoraEntity[], Error>> {
    try {
      const registros = await this.repo.getAllByUsuario(usuarioId);
      return Ok(registros);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener registros del usuario")
      );
    }
  }

  async getByUsuarioAndWeek(
    usuarioId: string,
    ano: number,
    semana: number
  ): Promise<Result<RegistroHoraEntity[], Error>> {
    try {
      const registros = await this.repo.findByUsuarioAndWeek(
        usuarioId,
        ano,
        semana
      );
      return Ok(registros);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener registros por semana")
      );
    }
  }
}
