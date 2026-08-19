import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  RegistroHoraRepository,
  RegistroHoraEntity,
  CreateRegistroHoraArgs,
  UpdateRegistroHoraArgs,
} from "../repositories/RegistroHoraRepository.repository";
import type { TarifaAbogadoAsuntoRepository } from "@/features/juridico/tarifas/server/repositories/TarifaAbogadoAsuntoRepository.repository";
import type { RegistroHoraHistorialService } from "./RegistroHoraHistorialService.service";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ValidationError } from "@/core/shared/errors/domain";
import {
  isValidISOWeek,
  isWithinDeadline,
} from "@/core/shared/helpers/weekUtils";
import type { RegistroHorasFilterParams } from "../../types/RegistroHorasFilterParams";

export class RegistroHoraService {
  constructor(
    private repo: RegistroHoraRepository,
    private historialService: RegistroHoraHistorialService,
    private tarifaRepo: TarifaAbogadoAsuntoRepository,
    private prisma: PrismaClient
  ) {}

  async create(
    input: Omit<CreateRegistroHoraArgs, "tarifaHora" | "importe">
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
        this.prisma.clienteProveedor.findUnique({
          where: { id: input.clienteProveedorId },
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
        return Err(new Error("El cliente seleccionado no existe o está inactivo"));
      }
      if (!asunto || asunto.estado !== "ACTIVO") {
        return Err(new Error("El asunto jurídico seleccionado no existe o no está activo"));
      }
      if (!socio) {
        return Err(new Error("El socio seleccionado no existe"));
      }

      // 4. REQ-RH-201: Lookup active tariff. Block if missing.
      const tarifa = await this.tarifaRepo.findActiveByUsuarioAndAsunto(
        input.usuarioId,
        input.asuntoJuridicoId
      );
      if (!tarifa) {
        return Err(
          new ValidationError(
            "No tienes tarifa configurada para este asunto. Contacta al administrador."
          )
        );
      }

      // 5. REQ-RH-203: importe = horas × tarifaHora, persisted.
      // REQ-RH-202: tarifaHora snapshot from active tariff, frozen.
      const importe = new Prisma.Decimal(input.horas)
        .mul(tarifa.tarifaHora)
        .toDecimalPlaces(2);

      // 6. Create with editable=true (default) + frozen tarifa + importe
      const created = await this.repo.create({
        ...input,
        tarifaHora: tarifa.tarifaHora,
        importe,
      });
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
    usuarioId: string,
    options?: { canOverrideDeadline?: boolean }
  ): Promise<Result<RegistroHoraEntity, Error>> {
    try {
      // 1. Find existing
      const existing = await this.repo.findById(input.id);
      if (!existing) {
        return Err(new Error("Registro de horas no encontrado"));
      }

      const withinDeadline = isWithinDeadline(existing.ano, existing.semana);
      const canOverrideDeadline = options?.canOverrideDeadline === true;

      // 2. Dentro de plazo: editable=true. Fuera de plazo: requiere autorización AUTORIZADA activa.
      if (withinDeadline && !existing.editable) {
        return Err(
          new Error(
            "Este registro no es editable. Solicita autorización al administrador."
          )
        );
      }

      // 2.5. REQ-RH-203-b: Recompute importe from FROZEN existing tarifaHora.
      // REQ-RH-202-b: tarifaHora is NEVER written on update.
      // If existing.tarifaHora is null (pre-tarifa-feature row) the importe is null.
      const importeRecomputed =
        existing.tarifaHora === null || existing.tarifaHora === undefined
          ? null
          : new Prisma.Decimal(input.horas)
              .mul(existing.tarifaHora)
              .toDecimalPlaces(2);

      // 3. Use transaction: update + historial + conditionally set editable=false
      const updated = await this.prisma.$transaction(async (tx) => {
        let autorizacionAutorizadaId: string | null = null;

        if (!withinDeadline && !canOverrideDeadline) {
          const autorizacionActiva = await tx.autorizacionEdicion.findFirst({
            where: {
              registroHoraId: input.id,
              estado: "AUTORIZADA",
            },
            orderBy: { createdAt: "asc" },
            select: { id: true },
          });

          if (!autorizacionActiva) {
            throw new Error(
              "El plazo de edición ha vencido. Solicita autorización al administrador."
            );
          }

          autorizacionAutorizadaId = autorizacionActiva.id;
        }

        // Update registro (sin tocar tarifaHora — siempre frozen)
        const updatedRegistro = await tx.registroHora.update({
          where: { id: input.id },
          data: {
            equipoJuridicoId: input.equipoJuridicoId,
            clienteProveedorId: input.clienteProveedorId,
            asuntoJuridicoId: input.asuntoJuridicoId,
            socioId: input.socioId,
            horas: input.horas,
            importe: importeRecomputed,
            descripcion: input.descripcion ?? null,
          },
          include: {
            usuario: { select: { id: true, name: true, email: true } },
            equipoJuridico: { select: { id: true, nombre: true } },
            clienteProveedor: { select: { id: true, nombre: true } },
            asuntoJuridico: { select: { id: true, nombre: true } },
            socio: { select: { id: true, nombre: true } },
            autorizaciones: {
              where: { estado: "AUTORIZADA" },
              select: { id: true, estado: true },
              orderBy: { createdAt: "asc" },
              take: 1,
            },
          },
        });

        // If PAST deadline, this was a post-authorization edit — lock it
        if (!withinDeadline) {
          await tx.registroHora.update({
            where: { id: input.id },
            data: { editable: false },
          });
          updatedRegistro.editable = false;

          if (autorizacionAutorizadaId) {
            await tx.autorizacionEdicion.update({
              where: { id: autorizacionAutorizadaId },
              data: { estado: "UTILIZADA" },
            });
          }
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

  async getPaginated(
    params: RegistroHorasFilterParams
  ): Promise<
    Result<{ data: RegistroHoraEntity[]; totalCount: number }, Error>
  > {
    try {
      const result = await this.repo.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener registros de horas paginados")
      );
    }
  }
}
