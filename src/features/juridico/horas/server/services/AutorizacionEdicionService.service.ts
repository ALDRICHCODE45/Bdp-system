import { PrismaClient } from "@prisma/client";
import type {
  AutorizacionEdicionRepository,
  AutorizacionEdicionEntity,
} from "../repositories/AutorizacionEdicionRepository.repository";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { isWithinDeadline } from "@/core/shared/helpers/weekUtils";

export class AutorizacionEdicionService {
  constructor(
    private repo: AutorizacionEdicionRepository,
    private prisma: PrismaClient
  ) {}

  async solicitar(input: {
    registroHoraId: string;
    solicitanteId: string;
    justificacion: string;
  }): Promise<Result<AutorizacionEdicionEntity, Error>> {
    try {
      // 1. Verify registro exists
      const registro = await this.prisma.registroHora.findUnique({
        where: { id: input.registroHoraId },
      });
      if (!registro) {
        return Err(new Error("Registro de horas no encontrado"));
      }

      // 2. Verify solicitante owns the registro
      if (registro.usuarioId !== input.solicitanteId) {
        return Err(
          new Error(
            "No tienes permiso para solicitar edición de este registro"
          )
        );
      }

      // 3. Verify deadline has passed (within deadline → no need for authorization)
      const withinDeadline = isWithinDeadline(registro.ano, registro.semana);
      if (withinDeadline) {
        return Err(
          new Error(
            "El plazo de edición aún está vigente. Puedes editar directamente sin necesidad de autorización."
          )
        );
      }

      // 4. Verify registro.editable === false (needs authorization)
      if (registro.editable) {
        return Err(
          new Error(
            "Este registro ya está habilitado para edición. No es necesario solicitar autorización."
          )
        );
      }

      // 5. Verify no PENDIENTE request already exists for this registro
      const pendientes = await this.repo.findPendientesByRegistro(
        input.registroHoraId
      );
      if (pendientes.length > 0) {
        return Err(
          new Error(
            "Ya existe una solicitud de edición pendiente para este registro."
          )
        );
      }

      // 6. Create with estado=PENDIENTE
      const created = await this.repo.create({
        registroHoraId: input.registroHoraId,
        solicitanteId: input.solicitanteId,
        justificacion: input.justificacion,
      });

      return Ok(created);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al solicitar autorización de edición")
      );
    }
  }

  async autorizar(
    autorizacionId: string,
    autorizadorId: string
  ): Promise<Result<AutorizacionEdicionEntity, Error>> {
    try {
      // 1. Find autorizacion
      const autorizacion = await this.repo.findById(autorizacionId);
      if (!autorizacion) {
        return Err(new Error("Solicitud de edición no encontrada"));
      }

      // 2. Verify estado === PENDIENTE
      if (autorizacion.estado !== "PENDIENTE") {
        return Err(
          new Error(
            `No se puede autorizar una solicitud en estado ${autorizacion.estado}`
          )
        );
      }

      // 3. $transaction: update estado to AUTORIZADA + set registroHora.editable=true + set autorizadorId
      const updated = await this.prisma.$transaction(async (tx) => {
        // Set registroHora.editable = true
        await tx.registroHora.update({
          where: { id: autorizacion.registroHoraId },
          data: { editable: true },
        });

        // Update autorizacion estado to AUTORIZADA with autorizadorId
        return await tx.autorizacionEdicion.update({
          where: { id: autorizacionId },
          data: {
            estado: "AUTORIZADA",
            autorizadorId,
          },
          include: {
            solicitante: { select: { id: true, name: true, email: true } },
            autorizador: { select: { id: true, name: true, email: true } },
            registroHora: { select: { id: true, ano: true, semana: true } },
          },
        });
      });

      return Ok(updated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al autorizar la solicitud de edición")
      );
    }
  }

  async rechazar(
    autorizacionId: string,
    autorizadorId: string,
    motivoRechazo: string
  ): Promise<Result<AutorizacionEdicionEntity, Error>> {
    try {
      // 1. Find autorizacion
      const autorizacion = await this.repo.findById(autorizacionId);
      if (!autorizacion) {
        return Err(new Error("Solicitud de edición no encontrada"));
      }

      // 2. Verify estado === PENDIENTE
      if (autorizacion.estado !== "PENDIENTE") {
        return Err(
          new Error(
            `No se puede rechazar una solicitud en estado ${autorizacion.estado}`
          )
        );
      }

      // 3. Update estado to RECHAZADA + set motivoRechazo + set autorizadorId
      const updated = await this.repo.updateEstado(
        autorizacionId,
        "RECHAZADA",
        autorizadorId,
        motivoRechazo
      );

      return Ok(updated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al rechazar la solicitud de edición")
      );
    }
  }

  async getPendientes(): Promise<Result<AutorizacionEdicionEntity[], Error>> {
    try {
      const pendientes = await this.repo.findAllPendientes();
      return Ok(pendientes);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener solicitudes pendientes")
      );
    }
  }
}
