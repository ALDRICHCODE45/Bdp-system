import type { AutorizacionEdicionEntity } from "../repositories/AutorizacionEdicionRepository.repository";
import type { AutorizacionEdicionDto } from "../dtos/AutorizacionEdicionDto.dto";

export function toAutorizacionEdicionDto(
  entity: AutorizacionEdicionEntity
): AutorizacionEdicionDto {
  return {
    id: entity.id,
    registroHoraId: entity.registroHoraId,
    ano: entity.registroHora.ano,
    semana: entity.registroHora.semana,
    solicitanteId: entity.solicitanteId,
    solicitanteNombre: entity.solicitante.name ?? "",
    solicitanteEmail: entity.solicitante.email ?? "",
    autorizadorId: entity.autorizadorId ?? null,
    autorizadorNombre: entity.autorizador?.name ?? null,
    justificacion: entity.justificacion,
    estado: entity.estado,
    motivoRechazo: entity.motivoRechazo ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toAutorizacionEdicionDtoArray(
  entities: AutorizacionEdicionEntity[]
): AutorizacionEdicionDto[] {
  return entities.map(toAutorizacionEdicionDto);
}
