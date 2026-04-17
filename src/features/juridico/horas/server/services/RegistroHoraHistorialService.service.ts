import type { RegistroHoraHistorial } from "@prisma/client";
import type { RegistroHoraHistorialRepository } from "../repositories/RegistroHoraHistorialRepository.repository";
import type { RegistroHoraEntity } from "../repositories/RegistroHoraRepository.repository";
import { Result, Ok, Err } from "@/core/shared/result/result";

type RegistroHoraDataSnapshot = {
  horas: string;
  descripcion: string;
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
};

const TRACKED_FIELDS: (keyof RegistroHoraDataSnapshot)[] = [
  "horas",
  "descripcion",
  "equipoJuridicoId",
  "clienteJuridicoId",
  "asuntoJuridicoId",
  "socioId",
];

function toSnapshot(registro: RegistroHoraEntity): RegistroHoraDataSnapshot {
  return {
    horas: String(Number(registro.horas)),
    descripcion: registro.descripcion ?? "",
    equipoJuridicoId: registro.equipoJuridicoId,
    clienteJuridicoId: registro.clienteJuridicoId,
    asuntoJuridicoId: registro.asuntoJuridicoId,
    socioId: registro.socioId,
  };
}

export class RegistroHoraHistorialService {
  constructor(
    private historialRepo: RegistroHoraHistorialRepository
  ) {}

  async createHistorialForUpdate(
    oldRegistro: RegistroHoraEntity,
    newRegistro: RegistroHoraEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const oldSnap = toSnapshot(oldRegistro);
      const newSnap = toSnapshot(newRegistro);

      const changes: Array<{
        campo: string;
        valorAnterior: string | null;
        valorNuevo: string;
      }> = [];

      for (const field of TRACKED_FIELDS) {
        const oldVal = oldSnap[field];
        const newVal = newSnap[field];
        if (oldVal !== newVal) {
          changes.push({
            campo: field,
            valorAnterior: oldVal || null,
            valorNuevo: newVal,
          });
        }
      }

      if (changes.length === 0) return Ok(undefined);

      await this.historialRepo.createMany(
        changes.map((c) => ({
          registroHoraId: newRegistro.id,
          campo: c.campo,
          valorAnterior: c.valorAnterior,
          valorNuevo: c.valorNuevo,
          usuarioId: usuarioId ?? null,
          motivo: null,
        }))
      );

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear historial de registro")
      );
    }
  }

  async getHistorial(
    registroHoraId: string
  ): Promise<Result<RegistroHoraHistorial[], Error>> {
    try {
      const historial =
        await this.historialRepo.findByRegistroHoraId(registroHoraId);
      return Ok(historial);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial del registro")
      );
    }
  }
}
